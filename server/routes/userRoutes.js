const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-hashed_password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @route   POST /api/users/history
// @desc    Add a new pose analysis to history
// @access  Private
router.post('/history', protect, async (req, res) => {
    try {
        const { pose, score, level, indicators, feedback, radarData, recommendation } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            const newRecord = {
                poseName: pose, // Map 'pose' to schema 'poseName'
                score,
                feedback,
                radarData,
                recommendation,
                indicators,
                date: Date.now()
            };


            user.posture_history.push(newRecord);

            // Update Level Logic? (Simple example: if score > 80, maybe promote user?)
            // user.profile.level = ...

            await user.save();
            res.status(201).json(newRecord);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   GET /api/users/:id/history
// @desc    Get user posture history
// @access  Private
router.get('/:id/history', protect, async (req, res) => {
    try {
        // Ensure user is requesting their own data
        if (req.params.id !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view this history' });
        }

        const user = await User.findById(req.params.id).select('posture_history');
        if (user) {
            res.json(user.posture_history);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:id/profile
// @desc    Get user profile
// @access  Private
router.get('/:id/profile', protect, async (req, res) => {
    try {
        // Ensure user is requesting their own data
        if (req.params.id !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to view this profile' });
        }

        const user = await User.findById(req.params.id).select('profile');
        if (user) {
            res.json(user.profile);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
