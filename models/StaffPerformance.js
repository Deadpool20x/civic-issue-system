import mongoose from 'mongoose';

const staffPerformanceSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    // Performance Metrics
    totalIssuesAssigned: {
        type: Number,
        default: 0
    },
    totalIssuesResolved: {
        type: Number,
        default: 0
    },
    totalIssuesEscalated: {
        type: Number,
        default: 0
    },
    averageResolutionTime: {
        type: Number, // in hours
        default: 0
    },
    penaltyPoints: {
        type: Number,
        default: 0
    },
    // Rewards and Recognition
    badges: [{
        name: String,
        description: String,
        earnedAt: Date,
        category: {
            type: String,
            enum: ['speed', 'quality', 'consistency', 'leadership', 'innovation']
        }
    }],
    totalRewardPoints: {
        type: Number,
        default: 0
    },
    // Monthly Performance
    monthlyStats: [{
        month: String, // YYYY-MM format
        issuesResolved: Number,
        averageResolutionTime: Number,
        penaltyPoints: Number,
        rewardPoints: Number,
        rank: Number
    }],
    // Current Performance
    currentMonth: {
        issuesResolved: {
            type: Number,
            default: 0
        },
        averageResolutionTime: {
            type: Number,
            default: 0
        },
        penaltyPoints: {
            type: Number,
            default: 0
        },
        rewardPoints: {
            type: Number,
            default: 0
        }
    },
    // Recognition
    isTopPerformer: {
        type: Boolean,
        default: false
    },
    lastTopPerformerMonth: String,
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
staffPerformanceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to add resolved issue
staffPerformanceSchema.methods.addResolvedIssue = function(resolutionTime) {
    this.totalIssuesResolved += 1;
    this.currentMonth.issuesResolved += 1;
    
    // Calculate average resolution time
    const totalTime = (this.averageResolutionTime * (this.totalIssuesResolved - 1)) + resolutionTime;
    this.averageResolutionTime = totalTime / this.totalIssuesResolved;
    
    // Calculate current month average
    const currentTotalTime = (this.currentMonth.averageResolutionTime * (this.currentMonth.issuesResolved - 1)) + resolutionTime;
    this.currentMonth.averageResolutionTime = currentTotalTime / this.currentMonth.issuesResolved;
    
    // Award points based on resolution time
    let points = 10; // Base points
    if (resolutionTime <= 24) points += 20; // Speed bonus
    if (resolutionTime <= 12) points += 30; // Super speed bonus
    
    this.totalRewardPoints += points;
    this.currentMonth.rewardPoints += points;
    
    return this.save();
};

// Method to add escalated issue
staffPerformanceSchema.methods.addEscalatedIssue = function() {
    this.totalIssuesEscalated += 1;
    this.penaltyPoints += 20;
    this.currentMonth.penaltyPoints += 20;
    
    return this.save();
};

// Method to add badge
staffPerformanceSchema.methods.addBadge = function(badgeName, description, category) {
    this.badges.push({
        name: badgeName,
        description,
        earnedAt: new Date(),
        category
    });
    
    return this.save();
};

// Method to check for new badges
staffPerformanceSchema.methods.checkForBadges = function() {
    const badges = [];
    
    // Speed badges
    if (this.averageResolutionTime <= 12 && !this.hasBadge('Speed Demon')) {
        badges.push({
            name: 'Speed Demon',
            description: 'Average resolution time under 12 hours',
            category: 'speed'
        });
    }
    
    // Quality badges
    if (this.totalIssuesResolved >= 50 && this.totalIssuesEscalated === 0 && !this.hasBadge('Perfect Record')) {
        badges.push({
            name: 'Perfect Record',
            description: '50+ issues resolved with zero escalations',
            category: 'quality'
        });
    }
    
    // Consistency badges
    if (this.totalIssuesResolved >= 100 && !this.hasBadge('Century Club')) {
        badges.push({
            name: 'Century Club',
            description: '100+ issues resolved',
            category: 'consistency'
        });
    }
    
    // Add all new badges
    badges.forEach(badge => this.addBadge(badge.name, badge.description, badge.category));
    
    return badges;
};

// Helper method to check if staff has a specific badge
staffPerformanceSchema.methods.hasBadge = function(badgeName) {
    return this.badges.some(badge => badge.name === badgeName);
};

// Index for performance queries
staffPerformanceSchema.index({ staffId: 1 });
staffPerformanceSchema.index({ department: 1 });
staffPerformanceSchema.index({ 'currentMonth.issuesResolved': -1 });
staffPerformanceSchema.index({ totalRewardPoints: -1 });

const StaffPerformance = mongoose.models.StaffPerformance || mongoose.model('StaffPerformance', staffPerformanceSchema);

export default StaffPerformance;
