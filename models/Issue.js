import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
    reportId: {
        type: String,
        unique: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for the issue'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the issue'],
        trim: true
    },
    location: {
        address: { type: String, required: true },
        coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: undefined } // [lng, lat] - MongoDB format
        },
        city: String,
        state: String,
        pincode: String
    },
    category: {
        type: String,
        required: [true, 'Please specify the issue category'],
        enum: [
            'roads-infrastructure',
            'street-lighting',
            'waste-management',
            'water-drainage',
            'parks-public-spaces',
            'traffic-signage',
            'public-health-safety',
            'other'
        ]
    },
    subcategory: {
        type: String,
        required: [true, 'Please specify the subcategory'],
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    
    priorityOverriddenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    priorityOverriddenAt: Date,
    
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'resolved', 'rejected', 'reopened', 'escalated'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    images: [{
        url: String,
        publicId: String
    }],
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    // SLA and Escalation System
    sla: {
        deadline: {
            type: Date,
            required: true
        },
        hoursRemaining: {
            type: Number,
            default: 0
        },
        isOverdue: {
            type: Boolean,
            default: false
        },
        escalationLevel: {
            type: Number,
            default: 1,
            min: 1,
            max: 3
        },
        escalationHistory: [{
            level: Number,
            escalatedAt: Date,
            escalatedTo: String,
            reason: String
        }]
    },
    // Location and Ward Classification
    ward: {
        type: String,
        trim: true
    },
    zone: {
        type: String,
        trim: true
    },
    // Citizen Engagement
    upvotes: {
        type: Number,
        default: 0,
        index: true
    },
    upvotedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reminders: [{
        sentAt: Date,
        sentTo: String,
        type: {
            type: String,
            enum: ['citizen', 'department', 'escalation']
        }
    }],
    // Feedback and Rating System
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        isResolved: Boolean, // true = yes, false = no (renamed from resolved for clarity)
        comment: String,
        submittedAt: Date,
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    // Performance Tracking
    resolutionTime: {
        type: Number, // in hours
        default: 0
    },
    penaltyPoints: {
        type: Number,
        default: 0
    },
    // Staff Assignment and Performance
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    departmentHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Verification System
    verification: {
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verificationNotes: String
    },
    comments: [{
        text: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    aiAnalysis: {
        category: String,
        priority: String,
        sentiment: String,
        keywords: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    dueTime: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to generate reportId
issueSchema.pre('save', async function (next) {
    // Only generate reportId for new documents
    if (this.isNew && !this.reportId) {
        try {
            // Find the highest existing reportId
            const lastIssue = await this.constructor
                .findOne({ reportId: { $exists: true } })
                .sort({ reportId: -1 })
                .select('reportId')
                .lean();

            let nextNumber = 1;

            if (lastIssue && lastIssue.reportId) {
                // Extract number from R##### format
                const lastNumber = parseInt(lastIssue.reportId.substring(1));
                nextNumber = lastNumber + 1;
            }

            // Format as R##### (5 digits, zero-padded)
            this.reportId = `R${String(nextNumber).padStart(5, '0')}`;

        } catch (error) {
            console.error('Error generating reportId:', error);
            // Fallback to timestamp-based ID
            this.reportId = `R${Date.now().toString().slice(-5)}`;
        }
    }

    next();
});

// Add virtual for backward compatibility
issueSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtuals are included when converting to JSON
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

// Add geospatial index for $near queries
// Only index if coordinates exist (sparse index)
issueSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

// SLA deadline calculation - ensure deadline is set if missing
issueSchema.pre('validate', function (next) {
    if (!this.sla.deadline) {
        const now = new Date();
        let hoursToAdd = 72; // Default for low priority
        const effectivePriority = this.priority || 'medium';

        switch (effectivePriority) {
            case 'urgent':
                hoursToAdd = 24;
                break;
            case 'high':
                hoursToAdd = 48;
                break;
            case 'medium':
                hoursToAdd = 72;
                break;
            case 'low':
                hoursToAdd = 120;
                break;
        }

        this.sla.deadline = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
    }
    next();
});

// Set dueTime if not set (7 days from createdAt)
issueSchema.pre('save', function (next) {
    if (!this.dueTime) {
        this.dueTime = new Date(this.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    next();
});

// SLA calculations and updates
issueSchema.pre('save', function (next) {
    this.updatedAt = new Date();

    // Calculate hours remaining and overdue status
    if (this.sla.deadline) {
        const now = new Date();
        const timeDiff = this.sla.deadline.getTime() - now.getTime();
        this.sla.hoursRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60)));
        this.sla.isOverdue = timeDiff < 0;
    }

    // Calculate resolution time if resolved
    if (this.status === 'resolved' && this.resolutionTime === 0) {
        const timeDiff = new Date() - this.createdAt;
        this.resolutionTime = Math.ceil(timeDiff / (1000 * 60 * 60));
    }

    next();
});

// Method to escalate issue
issueSchema.methods.escalate = function (reason) {
    if (this.sla.escalationLevel < 3) {
        this.sla.escalationLevel += 1;
        this.status = 'escalated';

        this.sla.escalationHistory.push({
            level: this.sla.escalationLevel,
            escalatedAt: new Date(),
            escalatedTo: this.getEscalationTarget(),
            reason: reason || 'SLA deadline exceeded'
        });

        // Add penalty points for escalation
        this.penaltyPoints += (this.sla.escalationLevel * 10);

        return this.save();
    }
    return Promise.resolve(this);
};

// Method to get escalation target
issueSchema.methods.getEscalationTarget = function () {
    switch (this.sla.escalationLevel) {
        case 1:
            return 'Department Staff';
        case 2:
            return 'Department Head';
        case 3:
            return 'Commissioner/Mayor';
        default:
            return 'Department Staff';
    }
};

// Instance method to add upvote
issueSchema.methods.addUpvote = async function (userId) {
    if (!this.upvotedBy.includes(userId)) {
        this.upvotes += 1;
        this.upvotedBy.push(userId);
        await this.save();
        return { success: true, upvotes: this.upvotes };
    }
    return { success: false, message: 'Already upvoted' };
};

// Static method to add upvote atomically
issueSchema.statics.addUpvote = function (issueId, userId) {
    return this.findOneAndUpdate(
        { _id: issueId, upvotedBy: { $ne: userId } }, // find the issue only if the user has NOT upvoted it
        {
            $inc: { upvotes: 1 },
            $addToSet: { upvotedBy: userId }
        },
        { new: true }
    );
};

// Static method to remove upvote atomically
issueSchema.statics.removeUpvote = function (issueId, userId) {
    return this.findOneAndUpdate(
        { _id: issueId, upvotedBy: userId }, // find the issue only if the user has upvoted it
        {
            $inc: { upvotes: -1 },
            $pull: { upvotedBy: userId }
        },
        { new: true }
    );
};

// Method to submit feedback
issueSchema.methods.submitFeedback = function (rating, comment, isResolved, userId) {
    this.feedback = {
        rating,
        comment,
        isResolved,
        submittedAt: new Date(),
        submittedBy: userId
    };

    // If marked as not resolved, reopen the issue
    if (!isResolved) {
        this.status = 'reopened';
    }

    return this.save();
};

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);

export default Issue;