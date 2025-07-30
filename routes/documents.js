const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { protect, authorize, isAdminOrHR } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document formats
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Access control based on user role
    if (req.user.role === 'employee') {
      filter.$or = [
        { uploadedBy: req.user._id },
        { relatedTo: req.user._id },
        { accessLevel: 'public' },
        { 
          accessLevel: 'restricted',
          allowedRoles: { $in: [req.user.role] }
        }
      ];
    }
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.uploadedBy) filter.uploadedBy = req.query.uploadedBy;
    if (req.query.relatedTo) filter.relatedTo = req.query.relatedTo;
    if (req.query.accessLevel) filter.accessLevel = req.query.accessLevel;
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { originalName: searchRegex },
          { tags: { $in: [searchRegex] } }
        ]
      });
    }

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('relatedTo', 'firstName lastName email employeeId')
      .populate('approvedBy', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(filter);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('relatedTo', 'firstName lastName email employeeId')
      .populate('approvedBy', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName profilePicture');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' || 
                     req.user.role === 'hr' ||
                     document.uploadedBy._id.toString() === req.user._id.toString() ||
                     (document.relatedTo && document.relatedTo._id.toString() === req.user._id.toString()) ||
                     document.accessLevel === 'public' ||
                     (document.accessLevel === 'restricted' && document.allowedRoles.includes(req.user.role));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload new document
// @route   POST /api/documents
// @access  Private
router.post('/', protect, upload.single('file'), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('category').isIn(['personal', 'contract', 'policy', 'handbook', 'form', 'certificate', 'identification', 'other']).withMessage('Invalid category'),
  body('accessLevel').optional().isIn(['public', 'private', 'restricted']).withMessage('Invalid access level')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, category, relatedTo, accessLevel, allowedRoles, tags } = req.body;

    // Create document record
    const document = await Document.create({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      url: `/uploads/documents/${req.file.filename}`,
      category,
      uploadedBy: req.user._id,
      relatedTo: relatedTo || null,
      accessLevel: accessLevel || 'private',
      allowedRoles: allowedRoles ? JSON.parse(allowedRoles) : [],
      tags: tags ? JSON.parse(tags) : [],
      approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('relatedTo', 'firstName lastName email employeeId');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document: populatedDocument }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('category').optional().isIn(['personal', 'contract', 'policy', 'handbook', 'form', 'certificate', 'identification', 'other']).withMessage('Invalid category'),
  body('accessLevel').optional().isIn(['public', 'private', 'restricted']).withMessage('Invalid access level')
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

    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   req.user.role === 'hr' || 
                   document.uploadedBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'category', 'accessLevel', 'allowedRoles', 'tags', 'isActive'];
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      allowedFields.push('approvalStatus', 'relatedTo');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'allowedRoles' || field === 'tags') {
          document[field] = typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
        } else {
          document[field] = req.body[field];
        }
      }
    });

    await document.save();

    const populatedDocument = await Document.findById(document._id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('relatedTo', 'firstName lastName email employeeId');

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: { document: populatedDocument }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    const canDelete = req.user.role === 'admin' || 
                     document.uploadedBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads/documents', document.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access permissions (same as get single document)
    const hasAccess = req.user.role === 'admin' || 
                     req.user.role === 'hr' ||
                     document.uploadedBy.toString() === req.user._id.toString() ||
                     (document.relatedTo && document.relatedTo.toString() === req.user._id.toString()) ||
                     document.accessLevel === 'public' ||
                     (document.accessLevel === 'restricted' && document.allowedRoles.includes(req.user.role));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filePath = path.join(__dirname, '../uploads/documents', document.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Update download count
    await document.incrementDownloadCount(req.user._id);

    // Send file
    res.download(filePath, document.originalName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add comment to document
// @route   POST /api/documents/:id/comments
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

    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user can comment on this document
    const canComment = req.user.role === 'admin' || 
                      req.user.role === 'hr' || 
                      document.uploadedBy.toString() === req.user._id.toString() ||
                      (document.relatedTo && document.relatedTo.toString() === req.user._id.toString());

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    document.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await document.save();

    const populatedDocument = await Document.findById(document._id)
      .populate('comments.user', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        comment: populatedDocument.comments[populatedDocument.comments.length - 1]
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

// @desc    Get document statistics
// @route   GET /api/documents/stats/overview
// @access  Private (Admin/HR only)
router.get('/stats/overview', protect, isAdminOrHR, async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments({ isActive: true });
    const pendingApproval = await Document.countDocuments({ approvalStatus: 'pending' });
    const approvedDocuments = await Document.countDocuments({ approvalStatus: 'approved' });
    
    const documentsByCategory = await Document.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const documentsByAccessLevel = await Document.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$accessLevel', count: { $sum: 1 } } }
    ]);

    const recentUploads = await Document.find({ isActive: true })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category uploadedBy createdAt');

    const totalStorage = await Document.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          pendingApproval,
          approvedDocuments,
          totalStorage: totalStorage[0]?.totalSize || 0
        },
        documentsByCategory,
        documentsByAccessLevel,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
