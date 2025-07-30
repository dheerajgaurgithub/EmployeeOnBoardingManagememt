const express = require('express');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize, isAdminOrHR } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // If not admin/HR, only show own leave requests
    if (req.user.role === 'employee') {
      filter.employee = req.user._id;
    }
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.leaveType) filter.leaveType = req.query.leaveType;
    if (req.query.employee) filter.employee = req.query.employee;
    
    // Date filters
    if (req.query.startDateFrom || req.query.startDateTo) {
      filter.startDate = {};
      if (req.query.startDateFrom) filter.startDate.$gte = new Date(req.query.startDateFrom);
      if (req.query.startDateTo) filter.startDate.$lte = new Date(req.query.startDateTo);
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'firstName lastName email employeeId department')
      .populate('approvedBy', 'firstName lastName email')
      .populate('workHandover.handedOverTo', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      data: {
        leaves,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single leave request
// @route   GET /api/leaves/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName email employeeId department position')
      .populate('approvedBy', 'firstName lastName email')
      .populate('workHandover.handedOverTo', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName profilePicture');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can access this leave request
    if (req.user.role === 'employee' && 
        leave.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { leave }
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new leave request
// @route   POST /api/leaves
// @access  Private
router.post('/', protect, [
  body('leaveType').isIn(['sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'bereavement', 'other']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('isHalfDay').optional().isBoolean().withMessage('isHalfDay must be boolean'),
  body('halfDayPeriod').optional().isIn(['morning', 'afternoon']).withMessage('Invalid half day period')
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

    const { startDate, endDate, isHalfDay, halfDayPeriod } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Validate half day requirements
    if (isHalfDay && !halfDayPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Half day period is required for half day leave'
      });
    }

    if (isHalfDay && start.getTime() !== end.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Half day leave must have same start and end date'
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for overlapping dates'
      });
    }

    const leave = await Leave.create({
      ...req.body,
      employee: req.user._id
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email employeeId department');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: { leave: populatedLeave }
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check permissions
    const isOwner = leave.employee.toString() === req.user._id.toString();
    const isAdminOrHR = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isOwner && !isAdminOrHR) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Employees can only update their own pending requests
    if (isOwner && !isAdminOrHR) {
      if (leave.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only update pending leave requests'
        });
      }
      
      // Employees can only update certain fields
      const allowedFields = ['leaveType', 'startDate', 'endDate', 'reason', 'isHalfDay', 'halfDayPeriod', 'emergencyContact', 'workHandover'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      Object.assign(leave, updateData);
    } else {
      // Admin/HR can update all fields including status
      Object.assign(leave, req.body);
      
      // Set approval details if status is being changed
      if (req.body.status && (req.body.status === 'approved' || req.body.status === 'rejected')) {
        leave.approvedBy = req.user._id;
        leave.approvedAt = new Date();
      }
    }

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email employeeId department')
      .populate('approvedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Leave request updated successfully',
      data: { leave: populatedLeave }
    });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel leave request
// @route   DELETE /api/leaves/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check permissions
    const isOwner = leave.employee.toString() === req.user._id.toString();
    const isAdminOrHR = req.user.role === 'admin' || req.user.role === 'hr';

    if (!isOwner && !isAdminOrHR) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only cancel pending requests or approved requests that haven't started
    if (leave.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is already cancelled'
      });
    }

    if (leave.status === 'approved' && new Date() >= leave.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel leave that has already started'
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add comment to leave request
// @route   POST /api/leaves/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('text').trim().isLength({ min: 1, max: 300 }).withMessage('Comment must be between 1 and 300 characters')
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

    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can comment on this leave request
    const canComment = req.user.role === 'admin' || 
                      req.user.role === 'hr' || 
                      leave.employee.toString() === req.user._id.toString();

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    leave.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        comment: populatedLeave.comments[populatedLeave.comments.length - 1]
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get leave statistics
// @route   GET /api/leaves/stats/overview
// @access  Private (Admin/HR only)
router.get('/stats/overview', protect, isAdminOrHR, async (req, res) => {
  try {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });
    
    const leavesByType = await Leave.aggregate([
      { $group: { _id: '$leaveType', count: { $sum: 1 } } }
    ]);

    const leavesByStatus = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const thisMonthLeaves = await Leave.countDocuments({
      startDate: { $gte: currentMonth, $lt: nextMonth },
      status: 'approved'
    });

    const upcomingLeaves = await Leave.find({
      startDate: { $gt: new Date() },
      status: 'approved'
    })
    .populate('employee', 'firstName lastName department')
    .sort({ startDate: 1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalLeaves,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
          thisMonthLeaves
        },
        leavesByType,
        leavesByStatus,
        upcomingLeaves
      }
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get employee leave balance
// @route   GET /api/leaves/balance/:employeeId?
// @access  Private
router.get('/balance/:employeeId?', protect, async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.user._id;
    
    // Check permissions
    if (req.user.role === 'employee' && employeeId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const usedLeaves = await Leave.aggregate([
      {
        $match: {
          employee: mongoose.Types.ObjectId(employeeId),
          status: 'approved',
          startDate: { $gte: yearStart, $lte: yearEnd }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    // Standard leave allocations (can be made configurable)
    const leaveAllocations = {
      vacation: 21,
      sick: 10,
      personal: 5,
      maternity: 90,
      paternity: 15,
      emergency: 3,
      bereavement: 3
    };

    const leaveBalance = Object.keys(leaveAllocations).map(type => {
      const used = usedLeaves.find(leave => leave._id === type)?.totalDays || 0;
      return {
        leaveType: type,
        allocated: leaveAllocations[type],
        used,
        remaining: leaveAllocations[type] - used
      };
    });

    res.json({
      success: true,
      data: { leaveBalance }
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
