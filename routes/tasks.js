const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, authorize, isAdminOrHR } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // If not admin/HR, only show own tasks
    if (req.user.role === 'employee') {
      filter.assignedTo = req.user._id;
    }
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.assignedBy) filter.assignedBy = req.query.assignedBy;
    
    // Date filters
    if (req.query.dueDateFrom || req.query.dueDateTo) {
      filter.dueDate = {};
      if (req.query.dueDateFrom) filter.dueDate.$gte = new Date(req.query.dueDateFrom);
      if (req.query.dueDateTo) filter.dueDate.$lte = new Date(req.query.dueDateTo);
    }
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email employeeId department position')
      .populate('assignedBy', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName profilePicture');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can access this task
    if (req.user.role === 'employee' && 
        task.assignedTo._id.toString() !== req.user._id.toString() &&
        task.assignedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin/HR only)
router.post('/', protect, isAdminOrHR, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('assignedTo').isMongoId().withMessage('Invalid user ID'),
  body('dueDate').isISO8601().withMessage('Invalid due date'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().isIn(['onboarding', 'training', 'documentation', 'setup', 'meeting', 'other']).withMessage('Invalid category')
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

    // Check if assigned user exists
    const assignedUser = await User.findById(req.body.assignedTo);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    const task = await Task.create({
      ...req.body,
      assignedBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'hr' || 
                   task.assignedBy.toString() === req.user._id.toString() ||
                   task.assignedTo.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Employees can only update status and actualHours
    if (req.user.role === 'employee' && task.assignedTo.toString() === req.user._id.toString()) {
      const allowedFields = ['status', 'actualHours'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      Object.assign(task, updateData);
    } else {
      // Admin/HR can update all fields
      Object.assign(task, req.body);
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/HR only)
router.delete('/:id', protect, isAdminOrHR, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
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

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can comment on this task
    const canComment = req.user.role === 'admin' || 
                      req.user.role === 'hr' || 
                      task.assignedBy.toString() === req.user._id.toString() ||
                      task.assignedTo.toString() === req.user._id.toString();

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    task.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        comment: populatedTask.comments[populatedTask.comments.length - 1]
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

// @desc    Get task statistics
// @route   GET /api/tasks/stats/overview
// @access  Private (Admin/HR only)
router.get('/stats/overview', protect, isAdminOrHR, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const tasksByCategory = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          overdueTasks
        },
        tasksByPriority,
        tasksByCategory,
        tasksByStatus
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
