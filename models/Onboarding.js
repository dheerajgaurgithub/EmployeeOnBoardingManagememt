const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold'],
    default: 'not-started'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expectedCompletionDate: {
    type: Date,
    required: [true, 'Expected completion date is required']
  },
  actualCompletionDate: {
    type: Date
  },
  assignedBuddy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedHR: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned HR is required']
  },
  steps: [{
    stepId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['documentation', 'training', 'setup', 'meeting', 'orientation', 'compliance'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    estimatedDuration: {
      type: Number, // in hours
      required: true
    },
    dependencies: [{
      type: String // stepId of dependent step
    }],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'skipped', 'blocked'],
      default: 'pending'
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
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
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [300, 'Feedback comment cannot exceed 300 characters']
      }
    }
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  feedback: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['employee', 'buddy', 'hr', 'manager'],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  meetings: [{
    title: String,
    description: String,
    scheduledAt: Date,
    duration: Number, // in minutes
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String
  }],
  checklist: [{
    item: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
onboardingSchema.index({ employee: 1 });
onboardingSchema.index({ status: 1 });
onboardingSchema.index({ assignedHR: 1 });
onboardingSchema.index({ assignedBuddy: 1 });

// Pre-save middleware to calculate overall progress
onboardingSchema.pre('save', function(next) {
  if (this.steps && this.steps.length > 0) {
    const completedSteps = this.steps.filter(step => step.status === 'completed').length;
    this.overallProgress = Math.round((completedSteps / this.steps.length) * 100);
    
    // Update status based on progress
    if (this.overallProgress === 100) {
      this.status = 'completed';
      if (!this.actualCompletionDate) {
        this.actualCompletionDate = new Date();
      }
    } else if (this.overallProgress > 0) {
      this.status = 'in-progress';
    }
  }
  next();
});

// Virtual for days since start
onboardingSchema.virtual('daysSinceStart').get(function() {
  const today = new Date();
  const diffTime = Math.abs(today - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until expected completion
onboardingSchema.virtual('daysUntilExpectedCompletion').get(function() {
  const today = new Date();
  const diffTime = this.expectedCompletionDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to get next pending step
onboardingSchema.methods.getNextPendingStep = function() {
  return this.steps.find(step => step.status === 'pending');
};

// Method to get blocked steps
onboardingSchema.methods.getBlockedSteps = function() {
  return this.steps.filter(step => step.status === 'blocked');
};

// Ensure virtual fields are serialized
onboardingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Onboarding', onboardingSchema);
