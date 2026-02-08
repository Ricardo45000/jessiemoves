const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const logger = require('../config/logger');

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(200).json({ success: true, message: 'Email already subscribed' });
        }

        // Create new subscriber
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        logger.info(`New beta subscriber: ${email}`);
        res.status(201).json({ success: true, message: 'Successfully subscribed to beta waitlist' });

    } catch (error) {
        logger.error(`Subscription error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error during subscription' });
    }
});

module.exports = router;
