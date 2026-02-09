const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/User');

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    console.log('STRIPE_SECRET_KEY found. Initializing Stripe...');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.error('CRITICAL WARNING: STRIPE_SECRET_KEY is missing. Payment features will be disabled.');
}

// Middleware to protect routes (optional, if you want only logged-in users to buy)
// For now, we'll assume the frontend sends the userId or we decode the token here
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-hashed_password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
};

// @route   POST /api/payment/create-checkout-session
// @desc    Create a Stripe Checkout Session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: 'Payment system not configured (Missing Stripe Key)' });
    }
    try {
        const { priceId } = req.body; // e.g., 'price_1P...'
        const user = req.user;

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: user.email,
            client_reference_id: user._id.toString(), // Pass user ID to webhook
            success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/premium?canceled=true`,
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/payment/webhook
// @desc    Handle Stripe Webhooks
// @access  Public (Stripe calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
        return res.status(500).send('Payment system not configured (Missing Stripe Key)');
    }
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.client_reference_id;
            const customerId = session.customer;
            const subscriptionId = session.subscription;

            // Fulfill the purchase
            console.log(`Payment successful for user ${userId}`);

            try {
                await User.findByIdAndUpdate(userId, {
                    is_premium: true,
                    stripe_customer_id: customerId,
                    subscription_id: subscriptionId
                });
            } catch (dbError) {
                console.error('Database update failed:', dbError);
            }
            break;

        // Add other event types like 'invoice.payment_failed' to handle cancellations
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});

module.exports = router;
