const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
console.log('DEBUG: AuthRoutes loaded User model:', User);

// Helper to generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, goals } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            hashed_password: hashedPassword, // Store as hashed_password
            profile: {
                first_name: name, // Map name to first_name
                goals
            }
        });

        if (user) {
            // Set secure cookie
            const token = generateToken(user._id);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                _id: user._id,
                email: user.email,
                profile: user.profile
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // Compare password with hashed_password
        if (user && (await bcrypt.compare(password, user.hashed_password))) {
            const token = generateToken(user._id);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: false, // process.env.NODE_ENV === 'production', // Disable secure for HTTP IP access
                sameSite: 'lax', // 'strict', // Relax for Stripe redirects
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.json({
                _id: user._id,
                email: user.email,
                profile: user.profile
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Public
router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (cookie-based)
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Exclude hashed_password from response
        const user = await User.findById(decoded.id).select('-hashed_password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
});

module.exports = router;
