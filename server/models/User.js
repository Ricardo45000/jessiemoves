const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    profile: {
        first_name: { type: String, default: 'Yogi' },
        level: { type: String, default: 'Beginner', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
        goals: [{ type: String }],
        is_premium: { type: Boolean, default: false },
        stripe_customer_id: { type: String },
        subscription_id: { type: String }
    },
    posture_history: [{
        poseName: String,
        date: { type: Date, default: Date.now },
        score: Number,
        feedback: [String],
        radarData: Array, // Store breakdown
        recommendation: {
            title: String,
            level: String,
            reason: String,
            media: String,
            id: String
        },
        indicators: Object // { Alignment: 80, Stability: 70... }
    }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
