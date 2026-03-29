import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['password_reset', 'login'],
        default: 'password_reset'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
        // Max 3 attempts — block after 3 wrong tries
    }
})

// Auto-delete expired OTPs (MongoDB TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
// This automatically deletes documents after expiresAt passes

otpSchema.index({ email: 1, purpose: 1 })

export default mongoose.models.OTP || mongoose.model('OTP', otpSchema)
