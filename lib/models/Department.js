import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    contactEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    headOfDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    categories: [{
        type: String,
        trim: true,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    staffCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Index for faster queries
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ categories: 1 });

// Method to get workload (count of assigned open issues)
departmentSchema.methods.getWorkload = async function() {
    const Issue = mongoose.models.Issue;
    return Issue.countDocuments({
        assignedDepartment: this.name,
        status: { $in: ['pending', 'assigned', 'in-progress'] }
    });
};

// Static method to get department by category
departmentSchema.statics.getDepartmentByCategory = async function(category) {
    return this.findOne({
        categories: category,
        isActive: true
    });
};

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

export default Department;
