const express = require('express');
const router = express.Router();

// Supported Postures Data
//Ideally this could come from a database, but static is fine for now
const supportedPostures = [
    {
        id: 'pelvic_curl',
        name: 'Pelvic Curl',
        description: 'Warm-up for spine mobility and hamstring strength.',
        benefits: ['Mobilizes spine', 'Strengthens glutes/hamstrings', 'Core control'],
        image: '/assets/pelvic_curl.png'
    },
    {
        id: 'chest_lift',
        name: 'Chest Lift',
        description: 'Core strengthener focusing on abdominals.',
        benefits: ['Strengthens abdominals', 'Stabilizes pelvis', 'Protects neck'],
        image: '/assets/chest_lift.png'
    },
    {
        id: 'the_hundred',
        name: 'The Hundred',
        description: 'Classic dynamic warm-up for core stability and breathing.',
        benefits: ['Core stamina', 'Cardio effect', 'Circulation'],
        image: '/assets/the_hundred.png'
    },
    {
        id: 'one_leg_circle',
        name: 'One-Leg Circle',
        description: 'Hip mobility and pelvic stability challenge.',
        benefits: ['Hip range of motion', 'Pelvic stability', 'Abdominal control'],
        image: '/assets/one_leg_circle.png'
    },
    {
        id: 'roll_up',
        name: 'Roll-Up',
        description: 'Full body articulation and abdominal challenge.',
        benefits: ['Spinal flexibility', 'Abdominal strength', 'Hamstring stretch'],
        image: '/assets/roll_up.png'
    },
    {
        id: 'spine_stretch',
        name: 'Spine Stretch',
        description: 'Articulates the spine and stretches the back.',
        benefits: ['Spinal articulation', 'Hamstring stretch', 'Posture awareness'],
        image: '/assets/spine_stretch.png'
    }
];

// @route   GET /api/postures/available
// @desc    Get list of available/supported postures
// @access  Public
router.get('/available', (req, res) => {
    res.json(supportedPostures);
});

module.exports = router;
