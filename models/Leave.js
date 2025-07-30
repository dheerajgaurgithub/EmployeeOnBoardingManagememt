const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'bereavement', 'other']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  totalDays: {
    type: Number,
    required: true,
    min: [0.5, 'Total days must be at least 0.5']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [300, 'Rejection reason cannot exceed 300 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    required: function() {
      return this.isHalfDay;
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  workHandover: {
    handedOverTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    instructions: {
      type: String,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters']
    }
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [300, 'Comment cannot exceed 300 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ status: 1 });

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('isHalfDay')) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (this.isHalfDay && diffDays === 1) {
      diffDays = 0.5;
    }
    
    this.totalDays = diffDays;
  }
  next();
});

// Pre-save middleware to set approval timestamp
leaveSchema.pre('save', function(next) {
  if (this.isModified('status') && (this.status === 'approved' || this.status === 'rejected') && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

// Virtual for leave duration in readable format
leaveSchema.virtual('duration').get(function() {
  if (this.totalDays === 0.5) {
    return `Half day (${this.halfDayPeriod})`;
  } else if (this.totalDays === 1) {
    return '1 day';
  } else {
    return `${this.totalDays} days`;
  }
});

// Virtual to check if leave is upcoming
leaveSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date() && this.status === 'approved';
});

// Virtual to check if leave is active
leaveSchema.virtual('isActive').get(function() {
  const today = new Date();
  return this.startDate <= today && this.endDate >= today && this.status === 'approved';
});

// Ensure virtual fields are serialized
leaveSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Leave', leaveSchema);
