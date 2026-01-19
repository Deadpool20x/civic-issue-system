import mongoose from 'mongoose';

const stateHistorySchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['submitted', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected', 'reopened', 'escalated']
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        trim: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { timestamps: true });

// Index for efficient lookups by issueId
stateHistorySchema.index({ issueId: 1 });
stateHistorySchema.index({ timestamp: -1 });

const StateHistory = mongoose.models.StateHistory || mongoose.model('StateHistory', stateHistorySchema);

export default StateHistory;