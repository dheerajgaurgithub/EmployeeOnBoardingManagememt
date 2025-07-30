const express = require('express');
const { body, validationResult } = require('express-validator');
const Onboarding = require('../models/Onboarding');
const User = require('../models/User');
const { protect, authorize, isAdminOrHR } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all onboarding processes
// @route   GET /api/onboarding
// @access  Private (Admin/HR only)
router.get('/', protect, isAdminOrHR, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedHR) filter.assignedHR = req.query.assignedHR;
    if (req.query.assignedBuddy) filter.assignedBuddy = req.query.assignedBuddy;
    
    const onboardings = await Onboarding.find(filter)
      .populate('employee', 'firstName lastName email employeeId department position')
      .populate('assignedHR', 'firstName lastName email')
      .populate('assignedBuddy', 'firstName lastName email')
      .populate('steps.assignedTo', 'firstName lastName email')
      .populate('feedback.from', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Onboarding.countDocuments(filter);

    res.json({
      success: true,
      data: {
        onboardings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get onboardings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single onboarding process
// @route   GET /api/onboarding/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('employee', 'firstName lastName email employeeId department position profilePicture')
      .populate('assignedHR', 'firstName lastName email')
      .populate('assignedBuddy', 'firstName lastName email')
      .populate('steps.assignedTo', 'firstName lastName email')
      .populate('feedback.from', 'firstName lastName profilePicture')
      .populate('documents')
      .populate('meetings.attendees', 'firstName lastName email');
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding process not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' || 
                     req.user.role === 'hr' ||
                     onboarding.employee._id.toString() === req.user._id.toString() ||
                     onboarding.assignedHR._id.toString() === req.user._id.toString() ||
                     (onboarding.assignedBuddy && onboarding.assignedBuddy._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { onboarding }
    });
  } catch (error) {
    console.error('Get onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get employee's onboarding process
// @route   GET /api/onboarding/employee/:employeeId
// @access  Private
router.get('/employee/:employeeId', protect, async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    
    // Check permissions
    if (req.user.role === 'employee' && employeeId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const onboarding = await Onboarding.findOne({ employee: employeeId })
      .populate('employee', 'firstName lastName email employeeId department position profilePicture')
      .populate('assignedHR', 'firstName lastName email')
      .populate('assignedBuddy', 'firstName lastName email')
      .populate('steps.assignedTo', 'firstName lastName email')
      .populate('feedback.from', 'firstName lastName profilePicture')
      .populate('documents')
      .populate('meetings.attendees', 'firstName lastName email');
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding process not found for this employee'
      });
    }

    res.json({
      success: true,
      data: { onboarding }
    });
  } catch (error) {
    console.error('Get employee onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new onboarding process
// @route   POST /api/onboarding
// @access  Private (Admin/HR only)
router.post('/', protect, isAdminOrHR, [
  body('employee').isMongoId().withMessage('Invalid employee ID'),
  body('expectedCompletionDate').isISO8601().withMessage('Invalid expected completion date'),
  body('assignedBuddy').optional().isMongoId().withMessage('Invalid buddy ID'),
  body('steps').isArray({ min: 1 }).withMessage('At least one step is required')
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

    const { employee, expectedCompletionDate, assignedBuddy, steps } = req.body;

    // Check if employee exists
    const employeeUser = await User.findById(employee);
    if (!employeeUser) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if onboarding already exists for this employee
    const existingOnboarding = await Onboarding.findOne({ employee });
    if (existingOnboarding) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding process already exists for this employee'
      });
    }

    // Validate buddy if provided
    if (assignedBuddy) {
      const buddyUser = await User.findById(assignedBuddy);
      if (!buddyUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned buddy not found'
        });
      }
    }

    const onboarding = await Onboarding.create({
      employee,
      expectedCompletionDate,
      assignedBuddy: assignedBuddy || null,
      assignedHR: req.user._id,
      steps: steps.map(step => ({
        ...step,
        stepId: step.stepId || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))
    });

    // Update employee's onboarding status
    employeeUser.onboardingStatus = 'in-progress';
    await employeeUser.save();

    const populatedOnboarding = await Onboarding.findById(onboarding._id)
      .populate('employee', 'firstName lastName email employeeId department')
      .populate('assignedHR', 'firstName lastName email')
      .populate('assignedBuddy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Onboarding process created successfully',
      data: { onboarding: populatedOnboarding }
    });
  } catch (error) {
    console.error('Create onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update onboarding process
// @route   PUT /api/onboarding/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding process not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'hr' || 
                   onboarding.assignedHR.toString() === req.user._id.toString() ||
                   (onboarding.assignedBuddy && onboarding.assignedBuddy.toString() === req.user._id.toString()) ||
                   onboarding.employee.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Different permissions for different roles
    if (req.user.role === 'employee' && onboarding.employee.toString() === req.user._id.toString()) {
      // Employees can only update step status and feedback
      if (req.body.steps) {
        req.body.steps.forEach((updatedStep, index) => {
          if (onboarding.steps[index]) {
            if (updatedStep.status) onboarding.steps[index].status = updatedStep.status;
            if (updatedStep.notes) onboarding.steps[index].notes = updatedStep.notes;
            if (updatedStep.feedback) onboarding.steps[index].feedback = updatedStep.feedback;
            if (updatedStep.status === 'completed' && !onboarding.steps[index].completedAt) {
              onboarding.steps[index].completedAt = new Date();
            }
            if (updatedStep.status === 'in-progress' && !onboarding.steps[index].startedAt) {
              onboarding.steps[index].startedAt = new Date();
            }
          }
        });
      }
    } else {
      // Admin/HR can update all fields
      Object.assign(onboarding, req.body);
    }

    await onboarding.save();

    // Update employee's onboarding status if completed
    if (onboarding.status === 'completed') {
      const employee = await User.findById(onboarding.employee);
      employee.onboardingStatus = 'completed';
      await employee.save();
    }

    const populatedOnboarding = await Onboarding.findById(onboarding._id)
      .populate('employee', 'firstName lastName email employeeId department')
      .populate('assignedHR', 'firstName lastName email')
      .populate('assignedBuddy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Onboarding process updated successfully',
      data: { onboarding: populatedOnboarding }
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add feedback to onboarding process
// @route   POST /api/onboarding/:id/feedback
// @access  Private
router.post('/:id/feedback', protect, [
  body('type').isIn(['employee', 'buddy', 'hr', 'manager']).withMessage('Invalid feedback type'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
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

    const onboarding = await Onboarding.findById(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding process not found'
      });
    }

    // Check if user can provide feedback
    const canProvideFeedback = req.user.role === 'admin' || 
                              req.user.role === 'hr' ||
                              onboarding.employee.toString() === req.user._id.toString() ||
                              onboarding.assignedHR.toString() === req.user._id.toString() ||
                              (onboarding.assignedBuddy && onboarding.assignedBuddy.toString() === req.user._id.toString());

    if (!canProvideFeedback) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    onboarding.feedback.push({
      from: req.user._id,
      type: req.body.type,
      rating: req.body.rating,
      comment: req.body.comment
    });

    await onboarding.save();

    const populatedOnboarding = await Onboarding.findById(onboarding._id)
      .populate('feedback.from', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: { 
        feedback: populatedOnboarding.feedback[populatedOnboarding.feedback.length - 1]
      }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get onboarding statistics
// @route   GET /api/onboarding/stats/overview
// @access  Private (Admin/HR only)
router.get('/stats/overview', protect, isAdminOrHR, async (req, res) => {
  try {
    const totalOnboardings = await Onboarding.countDocuments();
    const completedOnboardings = await Onboarding.countDocuments({ status: 'completed' });
    const inProgressOnboardings = await Onboarding.countDocuments({ status: 'in-progress' });
    const onHoldOnboardings = await Onboarding.countDocuments({ status: 'on-hold' });
    
    const onboardingsByStatus = await Onboarding.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const averageProgress = await Onboarding.aggregate([
      { $group: { _id: null, avgProgress: { $avg: '$overallProgress' } } }
    ]);

    const recentOnboardings = await Onboarding.find()
      .populate('employee', 'firstName lastName department')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('employee status overallProgress createdAt');

    const overdueOnboardings = await Onboarding.countDocuments({
      expectedCompletionDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalOnboardings,
          completedOnboardings,
          inProgressOnboardings,
          onHoldOnboardings,
          overdueOnboardings,
          averageProgress: averageProgress[0]?.avgProgress || 0
        },
        onboardingsByStatus,
        recentOnboardings
      }
    });
  } catch (error) {
    console.error('Get onboarding stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Default onboarding steps template
const defaultOnboardingSteps = [
  {
    stepId: 'welcome_orientation',
    title: 'Welcome & Company Orientation',
    description: 'Introduction to company culture, values, and overview',
    category: 'orientation',
    priority: 'high',
    estimatedDuration: 4,
    dependencies: []
  },
  {
    stepId: 'hr_documentation',
    title: 'HR Documentation & Paperwork',
    description: 'Complete all required HR forms and documentation',
    category: 'documentation',
    priority: 'critical',
    estimatedDuration: 2,
    dependencies: []
  },
  {
    stepId: 'it_setup',
    title: 'IT Setup & Account Creation',
    description: 'Set up computer, accounts, and access to systems',
    category: 'setup',
    priority: 'high',
    estimatedDuration: 3,
    dependencies: ['hr_documentation']
  },
  {
    stepId: 'department_introduction',
    title: 'Department Introduction',
    description: 'Meet team members and understand department structure',
    category: 'meeting',
    priority: 'medium',
    estimatedDuration: 2,
    dependencies: ['welcome_orientation']
  },
  {
    stepId: 'role_training',
    title: 'Role-Specific Training',
    description: 'Training specific to job role and responsibilities',
    category: 'training',
    priority: 'high',
    estimatedDuration: 16,
    dependencies: ['it_setup', 'department_introduction']
  },
  {
    stepId: 'compliance_training',
    title: 'Compliance & Safety Training',
    description: 'Complete mandatory compliance and safety training',
    category: 'compliance',
    priority: 'critical',
    estimatedDuration: 4,
    dependencies: []
  }
];

// @desc    Get default onboarding template
// @route   GET /api/onboarding/template/default
// @access  Private (Admin/HR only)
router.get('/template/default', protect, isAdminOrHR, (req, res) => {
  res.json({
    success: true,
    data: {
      steps: defaultOnboardingSteps
    }
  });
});

module.exports = router;
