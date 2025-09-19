import mongoose from 'mongoose';

const departmentPerformanceSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        unique: true
    },
    // Performance Metrics
    totalIssuesReceived: {
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
    // SLA Performance
    slaComplianceRate: {
        type: Number, // percentage
        default: 0
    },
    overdueIssues: {
        type: Number,
        default: 0
    },
    // Penalty System
    totalPenaltyPoints: {
        type: Number,
        default: 0
    },
    monthlyPenaltyPoints: {
        type: Number,
        default: 0
    },
    // Monthly Performance History
    monthlyStats: [{
        month: String, // YYYY-MM format
        issuesReceived: Number,
        issuesResolved: Number,
        issuesEscalated: Number,
        averageResolutionTime: Number,
        slaComplianceRate: Number,
        penaltyPoints: Number,
        rank: Number
    }],
    // Current Month Performance
    currentMonth: {
        issuesReceived: {
            type: Number,
            default: 0
        },
        issuesResolved: {
            type: Number,
            default: 0
        },
        issuesEscalated: {
            type: Number,
            default: 0
        },
        averageResolutionTime: {
            type: Number,
            default: 0
        },
        slaComplianceRate: {
            type: Number,
            default: 0
        },
        penaltyPoints: {
            type: Number,
            default: 0
        }
    },
    // Ward-wise Performance
    wardPerformance: [{
        ward: String,
        issuesReceived: Number,
        issuesResolved: Number,
        averageResolutionTime: Number,
        slaComplianceRate: Number
    }],
    // Recognition
    isTopDepartment: {
        type: Boolean,
        default: false
    },
    lastTopDepartmentMonth: String,
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
departmentPerformanceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to add new issue
departmentPerformanceSchema.methods.addNewIssue = function() {
    this.totalIssuesReceived += 1;
    this.currentMonth.issuesReceived += 1;
    
    return this.save();
};

// Method to add resolved issue
departmentPerformanceSchema.methods.addResolvedIssue = function(resolutionTime, wasOnTime) {
    this.totalIssuesResolved += 1;
    this.currentMonth.issuesResolved += 1;
    
    // Calculate average resolution time
    const totalTime = (this.averageResolutionTime * (this.totalIssuesResolved - 1)) + resolutionTime;
    this.averageResolutionTime = totalTime / this.totalIssuesResolved;
    
    // Calculate current month average
    const currentTotalTime = (this.currentMonth.averageResolutionTime * (this.currentMonth.issuesResolved - 1)) + resolutionTime;
    this.currentMonth.averageResolutionTime = currentTotalTime / this.currentMonth.issuesResolved;
    
    // Update SLA compliance
    this.updateSlaCompliance();
    
    // Add penalty points if overdue
    if (!wasOnTime) {
        this.totalPenaltyPoints += 10;
        this.currentMonth.penaltyPoints += 10;
    }
    
    return this.save();
};

// Method to add escalated issue
departmentPerformanceSchema.methods.addEscalatedIssue = function() {
    this.totalIssuesEscalated += 1;
    this.currentMonth.issuesEscalated += 1;
    
    // Add penalty points for escalation
    this.totalPenaltyPoints += 50;
    this.currentMonth.penaltyPoints += 50;
    
    return this.save();
};

// Method to update SLA compliance rate
departmentPerformanceSchema.methods.updateSlaCompliance = function() {
    if (this.totalIssuesResolved > 0) {
        const onTimeResolutions = this.totalIssuesResolved - this.totalIssuesEscalated;
        this.slaComplianceRate = (onTimeResolutions / this.totalIssuesResolved) * 100;
        this.currentMonth.slaComplianceRate = this.slaComplianceRate;
    }
    
    return this.save();
};

// Method to add ward performance
departmentPerformanceSchema.methods.updateWardPerformance = function(ward, resolutionTime, wasOnTime) {
    let wardData = this.wardPerformance.find(w => w.ward === ward);
    
    if (!wardData) {
        wardData = {
            ward,
            issuesReceived: 0,
            issuesResolved: 0,
            averageResolutionTime: 0,
            slaComplianceRate: 0
        };
        this.wardPerformance.push(wardData);
    }
    
    wardData.issuesResolved += 1;
    
    // Calculate average resolution time for ward
    const totalTime = (wardData.averageResolutionTime * (wardData.issuesResolved - 1)) + resolutionTime;
    wardData.averageResolutionTime = totalTime / wardData.issuesResolved;
    
    // Update ward SLA compliance
    const onTimeResolutions = wardData.issuesResolved - (wasOnTime ? 0 : 1);
    wardData.slaComplianceRate = (onTimeResolutions / wardData.issuesResolved) * 100;
    
    return this.save();
};

// Method to get performance score
departmentPerformanceSchema.methods.getPerformanceScore = function() {
    let score = 100; // Base score
    
    // Deduct points for escalations
    score -= (this.totalIssuesEscalated * 5);
    
    // Deduct points for penalty points
    score -= (this.totalPenaltyPoints * 0.5);
    
    // Bonus for SLA compliance
    if (this.slaComplianceRate >= 90) score += 20;
    else if (this.slaComplianceRate >= 80) score += 10;
    else if (this.slaComplianceRate < 70) score -= 30;
    
    // Bonus for fast resolution
    if (this.averageResolutionTime <= 24) score += 15;
    else if (this.averageResolutionTime <= 48) score += 10;
    else if (this.averageResolutionTime > 120) score -= 20;
    
    return Math.max(0, Math.min(100, score));
};

// Index for performance queries
departmentPerformanceSchema.index({ department: 1 });
departmentPerformanceSchema.index({ 'currentMonth.issuesResolved': -1 });
departmentPerformanceSchema.index({ slaComplianceRate: -1 });
departmentPerformanceSchema.index({ totalPenaltyPoints: 1 });

const DepartmentPerformance = mongoose.models.DepartmentPerformance || mongoose.model('DepartmentPerformance', departmentPerformanceSchema);

export default DepartmentPerformance;
