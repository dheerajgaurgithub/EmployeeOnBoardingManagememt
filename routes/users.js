const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, isAdminOrHR, canAccessUserData } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/HR only)
router.get('/', protect, isAdminOrHR, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.onboardingStatus) filter.onboardingStatus = req.query.onboardingStatus;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { position: searchRegex }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Own data or Admin/HR)
router.get('/:id', protect, canAccessUserData, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Own data or Admin/HR)
router.put('/:id', protect, canAccessUserData, [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Please enter a valid phone number'),
  body('position').optional().trim().notEmpty().withMessage('Position cannot be empty')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
      'address', 'emergencyContact', 'profilePicture'
    ];

    // Admin/HR can update additional fields
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      allowedFields.push('department', 'position', 'role', 'isActive', 'onboardingStatus');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user (deactivate)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Deactivate instead of delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private (Admin/HR only)
router.get('/stats/overview', protect, isAdminOrHR, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    const totalHR = await User.countDocuments({ role: 'hr', isActive: true });
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    
    const onboardingStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$onboardingStatus', count: { $sum: 1 } } }
    ]);

    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const recentJoins = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email department position createdAt');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalAdmins,
          totalHR,
          totalEmployees
        },
        onboardingStats,
        departmentStats,
        recentJoins
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update onboarding status
// @route   PUT /api/users/:id/onboarding
// @access  Private (Admin/HR only)
router.put('/:id/onboarding', protect, isAdminOrHR, [
  body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid onboarding status'),
  body('steps').optional().isArray().withMessage('Steps must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.onboardingStatus = req.body.status;
    
    if (req.body.steps) {
      user.onboardingSteps = req.body.steps;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding status updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
