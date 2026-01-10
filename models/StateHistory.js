import mongoose from 'mongoose';

const stateHistorySchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
        index: true
    },
    fromState: {
        type: String,
        required: true
    },
    toState: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    }
});

// Index for efficient lookups by issueId
stateHistorySchema.index({ issueId: 1 });
stateHistorySchema.index({ timestamp: -1 });

const StateHistory = mongoose.models.StateHistory || mongoose.model('StateHistory', stateHistorySchema);

export default StateHistory;