const express = require('express');
const router = express.Router();
const GlobalStyle = require('../models/GlobalStyle');

// @route   GET /api/style
// @desc    Get global style configuration
// @access  Public
router.get('/', async (req, res) => {
    try {
        let style = await GlobalStyle.findOne({ singletonId: 'global_style_v2' });
        if (!style) {
            style = new GlobalStyle();
            await style.save();
        }
        res.json(style);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/style
// @desc    Update global style configuration (Admin only)
// @access  Private
router.put('/', async (req, res) => {
    try {
        const style = await GlobalStyle.findOneAndUpdate(
            { singletonId: 'global_style_v2' },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json(style);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
