const express = require('express');
const router = express.Router();

// Supported Postures Data
//Ideally this could come from a database, but static is fine for now
const supportedPostures = [
    {
        id: 'plank',
        name: 'Plank',
        description: 'Core strength and stability.',
        benefits: ['Strengthens core', 'Improves stability', 'Tones shoulders'],
        image: '/assets/plank.png' // Placeholder path
    },
    {
        id: 'downward_dog',
        name: 'Downward Dog',
        description: 'Full body stretch and rejuvenation.',
        benefits: ['Stretches hamstrings', 'Strengthens arms', 'Calms the mind'],
        image: '/assets/downward_dog.png'
    },
    {
        id: 'warrior_2',
        name: 'Warrior 2',
        description: 'Leg strength and hip opening.',
        benefits: ['Strengthens legs', 'Opens hips', 'Improves balance'],
        image: '/assets/warrior_2.png'
    }
];

// @route   GET /api/postures/available
// @desc    Get list of available/supported postures
// @access  Public
router.get('/available', (req, res) => {
    res.json(supportedPostures);
});

module.exports = router;
