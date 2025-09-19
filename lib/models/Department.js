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
        trim: true,
        lowercase: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
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
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

export default Department;