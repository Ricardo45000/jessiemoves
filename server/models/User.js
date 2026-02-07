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
        goals: [{ type: String }]
    },
    posture_history: [{
        date: { type: Date, default: Date.now },
        pose: String,
        score: Number,
        level: String,
        indicators: Object, // { Alignment: 80, Stability: 70... }
        feedback: [String] // Can be string or array, keeping array for flexibility based on previous code
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
