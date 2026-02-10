const express = require('express');
const router = express.Router();

/**
 * All 34 Classical Pilates Mat Exercises
 * Reference: Joseph Pilates — "Return to Life Through Contrology" (1945)
 */
const supportedPostures = [
    {
        id: 'the_hundred', name: 'The Hundred',
        description: 'Signature warm-up: pump arms while holding a crunch with legs elevated.',
        benefits: ['Core stamina', 'Cardio effect', 'Circulation']
    },
    {
        id: 'roll_up', name: 'Roll-Up',
        description: 'Full body articulation rolling up from supine to seated forward fold.',
        benefits: ['Spinal flexibility', 'Abdominal strength', 'Hamstring stretch']
    },
    {
        id: 'roll_over', name: 'Roll Over',
        description: 'Legs sweep overhead from supine, articulating the spine.',
        benefits: ['Spinal mobility', 'Abdominal control', 'Hamstring flexibility']
    },
    {
        id: 'one_leg_circle', name: 'One-Leg Circle',
        description: 'One leg draws circles while pelvis stays stable.',
        benefits: ['Hip range of motion', 'Pelvic stability', 'Abdominal control']
    },
    {
        id: 'rolling_like_a_ball', name: 'Rolling Like a Ball',
        description: 'Tucked ball shape, rolling back and up on the spine.',
        benefits: ['Balance', 'Spinal massage', 'Core control']
    },
    {
        id: 'one_leg_stretch', name: 'One-Leg Stretch',
        description: 'Alternate pulling one knee to chest while extending the other.',
        benefits: ['Core stability', 'Hip flexor strength', 'Coordination']
    },
    {
        id: 'double_leg_stretch', name: 'Double-Leg Stretch',
        description: 'Both arms and legs extend away from center then return.',
        benefits: ['Core power', 'Full body coordination', 'Breath control']
    },
    {
        id: 'spine_stretch', name: 'Spine Stretch',
        description: 'Seated tall, reach forward articulating through the spine.',
        benefits: ['Spinal articulation', 'Hamstring stretch', 'Posture awareness']
    },
    {
        id: 'open_leg_rocker', name: 'Open-Leg Rocker',
        description: 'Balance on sit bones with legs open and straight, rock back and up.',
        benefits: ['Balance', 'Hamstring flexibility', 'Core control']
    },
    {
        id: 'corkscrew', name: 'Corkscrew',
        description: 'Both legs circle together while core stabilizes the pelvis.',
        benefits: ['Core control', 'Spinal mobility', 'Precision']
    },
    {
        id: 'the_saw', name: 'The Saw',
        description: 'Seated wide, twist and reach opposite hand to foot.',
        benefits: ['Rotation', 'Hamstring flexibility', 'Breath coordination']
    },
    {
        id: 'swan_dive', name: 'Swan Dive',
        description: 'Prone back extension with chest lifting off mat, rocking forward and back.',
        benefits: ['Back extension', 'Shoulder opening', 'Glute strength']
    },
    {
        id: 'one_leg_kick', name: 'One-Leg Kick',
        description: 'Prone on forearms, kick one heel toward glute twice then switch.',
        benefits: ['Hamstring strength', 'Glute activation', 'Core stability']
    },
    {
        id: 'double_leg_kick', name: 'Double-Leg Kick',
        description: 'Prone with hands clasped behind back, kick both heels then extend.',
        benefits: ['Posterior chain', 'Coordination', 'Back extension']
    },
    {
        id: 'neck_pull', name: 'Neck Pull',
        description: 'Roll up and down with hands interlaced behind head.',
        benefits: ['Spinal articulation', 'Abdominal strength', 'Neck alignment']
    },
    {
        id: 'scissors', name: 'Scissors',
        description: 'Legs split vertically like scissors while maintaining shoulder support.',
        benefits: ['Hip flexibility', 'Core stability', 'Leg extension']
    },
    {
        id: 'bicycle', name: 'Bicycle',
        description: 'Legs pedaling in the air while core supports the lower back.',
        benefits: ['Range of motion', 'Coordination', 'Core stability']
    },
    {
        id: 'shoulder_bridge', name: 'Shoulder Bridge',
        description: 'Hips lifted creating a straight line from shoulders to knees.',
        benefits: ['Glute strength', 'Hamstring activation', 'Core control']
    },
    {
        id: 'spine_twist', name: 'Spine Twist',
        description: 'Seated tall with legs straight, twist torso side to side.',
        benefits: ['Spinal mobility', 'Oblique strength', 'Posture']
    },
    {
        id: 'jackknife', name: 'Jackknife',
        description: 'Legs lift overhead then shoot straight up toward the ceiling.',
        benefits: ['Abdominal power', 'Spinal articulation', 'Control']
    },
    {
        id: 'side_kick', name: 'Side Kick',
        description: 'Lying on side, top leg kicks forward and back with control.',
        benefits: ['Lateral stability', 'Hip mobility', 'Core control']
    },
    {
        id: 'teaser', name: 'Teaser',
        description: 'Balance on sit bones in a V-shape with arms and legs elevated.',
        benefits: ['Core strength', 'Balance', 'Full body control']
    },
    {
        id: 'hip_twist', name: 'Hip Twist',
        description: 'Seated on hands, circle extended legs for hip and core work.',
        benefits: ['Core control', 'Hip mobility', 'Shoulder stability']
    },
    {
        id: 'swimming', name: 'Swimming',
        description: 'Prone flutter of alternate arms and legs like swimming.',
        benefits: ['Back extension', 'Glute activation', 'Coordination']
    },
    {
        id: 'leg_pull_front', name: 'Leg Pull Front',
        description: 'Plank position, lift one leg while maintaining alignment.',
        benefits: ['Plank strength', 'Core stability', 'Shoulder endurance']
    },
    {
        id: 'leg_pull_back', name: 'Leg Pull Back',
        description: 'Reverse plank, lift one leg while keeping hips level.',
        benefits: ['Triceps strength', 'Glute activation', 'Core control']
    },
    {
        id: 'kneeling_side_kick', name: 'Kneeling Side Kick',
        description: 'Kneeling on one knee, extend and kick the other leg sideways.',
        benefits: ['Balance', 'Lateral strength', 'Hip mobility']
    },
    {
        id: 'side_bend', name: 'Side Bend',
        description: 'Side support lifting hips into an arc with top arm reaching.',
        benefits: ['Lateral strength', 'Shoulder stability', 'Core control']
    },
    {
        id: 'boomerang', name: 'Boomerang',
        description: 'Complex flow combining roll back, leg extension, and balance.',
        benefits: ['Flow', 'Full body coordination', 'Core control']
    },
    {
        id: 'seal', name: 'Seal',
        description: 'Seated tuck roll with foot claps, massaging the spine.',
        benefits: ['Spinal massage', 'Core activation', 'Playfulness']
    },
    {
        id: 'crab', name: 'Crab',
        description: 'Cross-legged rolling back and forth, massaging the spine.',
        benefits: ['Spinal massage', 'Balance', 'Coordination']
    },
    {
        id: 'rocking', name: 'Rocking',
        description: 'Prone bow shape holding ankles, rocking forward and back.',
        benefits: ['Back extension', 'Quad stretch', 'Hip flexor opening']
    },
    {
        id: 'control_balance', name: 'Control Balance',
        description: 'Legs overhead, one leg reaches up while maintaining balance.',
        benefits: ['Balance', 'Core stability', 'Full body control']
    },
    {
        id: 'push_up', name: 'Push-Up',
        description: 'Pilates push-up: walk hands out from standing to plank, perform push-ups, walk back.',
        benefits: ['Chest strength', 'Core stability', 'Shoulder endurance']
    }
];

// @route   GET /api/postures/available
// @desc    Get list of available/supported postures
// @access  Public
router.get('/available', (req, res) => {
    res.json(supportedPostures);
});

module.exports = router;
