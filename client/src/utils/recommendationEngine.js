/**
 * Recommendation Engine for all 34 Classical Pilates Mat Exercises
 * Analyzes weakest indicators and suggests remedial exercises.
 */

const EXERCISE_DATABASE = [
    {
        id: 'EX_001', title: 'Single Leg Stretch', targetIndicator: 'Stability',
        level: 'Beginner', tags: ['core', 'stability'],
        description: 'Lie on back, curl head up, and switch legs while maintaining a stable pelvis.'
    },
    {
        id: 'EX_002', title: 'Chest Expansion', targetIndicator: 'Posture',
        level: 'Beginner', tags: ['shoulders', 'posture'],
        description: 'Kneeling or standing, press arms back to open the chest and activate upper back extensors.'
    },
    {
        id: 'EX_003', title: 'Pelvic Tilt', targetIndicator: 'Alignment',
        level: 'Beginner', tags: ['pelvis', 'mobility'],
        description: 'Small rocking motion of the pelvis to find neutral spine alignment.'
    },
    {
        id: 'EX_004', title: 'Cat Stretch', targetIndicator: 'Articulation',
        level: 'All', tags: ['spine', 'mobility'],
        description: 'On all fours, round and arch the back to mobilize the spine segment by segment.'
    },
    {
        id: 'EX_005', title: 'Saw', targetIndicator: 'Flexibility',
        level: 'Beginner', tags: ['hamstrings', 'spine'],
        description: 'Seated twist and reach to stretch hamstrings and rotators.'
    },
    {
        id: 'EX_006', title: 'Breathing with Theraband', targetIndicator: 'Breath',
        level: 'All', tags: ['breath', 'expansion'],
        description: 'Wrap a band around ribs to feel lateral expansion during inhalation.'
    },
    {
        id: 'EX_007', title: 'Dead Bug', targetIndicator: 'Core Control',
        level: 'Beginner', tags: ['core', 'coordination'],
        description: 'Lie on back with knees at tabletop, extend opposite arm and leg while keeping core engaged.'
    },
    {
        id: 'EX_008', title: 'Swimming Prep', targetIndicator: 'Back Extension',
        level: 'Beginner', tags: ['back', 'glutes'],
        description: 'Lying face down, lift one arm and opposite leg at a time to prepare for full Swimming.'
    },
    {
        id: 'EX_009', title: 'Side-Lying Leg Lifts', targetIndicator: 'Lateral Strength',
        level: 'Beginner', tags: ['hips', 'lateral'],
        description: 'Lie on your side and lift the top leg to strengthen outer hips and lateral core.'
    },
    {
        id: 'EX_010', title: 'Plank Hold', targetIndicator: 'Plank Alignment',
        level: 'Beginner', tags: ['core', 'shoulders'],
        description: 'Hold a forearm or full plank position, focusing on maintaining a straight line from head to heels.'
    },
    {
        id: 'EX_011', title: 'Hip Circles', targetIndicator: 'Hip Mobility',
        level: 'Beginner', tags: ['hips', 'mobility'],
        description: 'On all fours or standing, perform controlled circles with the hip joint to increase range of motion.'
    },
    {
        id: 'EX_012', title: 'Roll Down', targetIndicator: 'Spinal Articulation',
        level: 'Beginner', tags: ['spine', 'flexibility'],
        description: 'Standing, slowly roll the spine down vertebra by vertebra, reaching toward the floor.'
    },
    {
        id: 'EX_013', title: 'Oblique Curl', targetIndicator: 'Rotation',
        level: 'Beginner', tags: ['obliques', 'rotation'],
        description: 'Supine crunch with rotation, directing shoulder toward opposite knee.'
    },
    {
        id: 'EX_014', title: 'Glute Bridge March', targetIndicator: 'Glute Activation',
        level: 'Beginner', tags: ['glutes', 'stability'],
        description: 'In bridge position, march one leg at a time while maintaining level hips.'
    }
];

// Map each of the 34 poses + weakest indicator → remedial exercise
const RECOMMENDATION_MAP = {
    'The Hundred': { 'Leg Extension': 'EX_005', 'Stamina': 'EX_006', 'Core Stability': 'EX_001', 'Arm Vigor': 'EX_002', 'Breath': 'EX_006' },
    'Roll-Up': { 'Articulation': 'EX_004', 'Abdominal Strength': 'EX_001', 'Hamstring Flexibility': 'EX_005', 'Shoulder Relax': 'EX_002', 'Flow': 'EX_004' },
    'Roll Over': { 'Spinal Mobility': 'EX_004', 'Abdominal Control': 'EX_007', 'Leg Extension': 'EX_005', 'Precision': 'EX_001', 'Flow': 'EX_004' },
    'One-Leg Circle': { 'Pelvic Stability': 'EX_001', 'Hip Mobility': 'EX_011', 'Leg Straightness': 'EX_005', 'Core Control': 'EX_007', 'Flow': 'EX_004' },
    'Rolling Like a Ball': { 'Balance': 'EX_001', 'Core Control': 'EX_007', 'Compactness': 'EX_003', 'Spinal Massage': 'EX_004', 'Breath': 'EX_006' },
    'One-Leg Stretch': { 'Core Stability': 'EX_001', 'Leg Extension': 'EX_005', 'Pelvic Control': 'EX_003', 'Coordination': 'EX_007', 'Breath': 'EX_006' },
    'Double-Leg Stretch': { 'Core Power': 'EX_001', 'Leg Extension': 'EX_005', 'Arm Reach': 'EX_002', 'Coordination': 'EX_007', 'Breath': 'EX_006' },
    'Spine Stretch': { 'Posture': 'EX_002', 'Articulation': 'EX_004', 'Abdominal Scoop': 'EX_001', 'Shoulder Stability': 'EX_002', 'Breath': 'EX_006' },
    'Open-Leg Rocker': { 'Balance': 'EX_001', 'Hamstring Flexibility': 'EX_005', 'Core Control': 'EX_007', 'Spinal Articulation': 'EX_012', 'Flow': 'EX_004' },
    'Corkscrew': { 'Core Control': 'EX_007', 'Pelvic Stability': 'EX_003', 'Leg Extension': 'EX_005', 'Spinal Mobility': 'EX_004', 'Precision': 'EX_001' },
    'The Saw': { 'Rotation': 'EX_013', 'Reach': 'EX_005', 'Hamstring Flex': 'EX_005', 'Core Control': 'EX_007', 'Breath': 'EX_006' },
    'Swan Dive': { 'Back Extension': 'EX_008', 'Core Support': 'EX_007', 'Shoulder Opening': 'EX_002', 'Glute Engagement': 'EX_014', 'Breath': 'EX_006' },
    'One-Leg Kick': { 'Hamstring Strength': 'EX_005', 'Glute Activation': 'EX_014', 'Core Stability': 'EX_001', 'Upper Body': 'EX_002', 'Rhythm': 'EX_006' },
    'Double-Leg Kick': { 'Posterior Chain': 'EX_008', 'Symmetry': 'EX_007', 'Back Extension': 'EX_008', 'Coordination': 'EX_007', 'Breath': 'EX_006' },
    'Neck Pull': { 'Spinal Articulation': 'EX_012', 'Abdominal Strength': 'EX_001', 'Hand Position': 'EX_002', 'Control': 'EX_007', 'Flow': 'EX_004' },
    'Scissors': { 'Hip Flexibility': 'EX_005', 'Leg Extension': 'EX_005', 'Core Stability': 'EX_001', 'Shoulder Support': 'EX_010', 'Precision': 'EX_001' },
    'Bicycle': { 'Range of Motion': 'EX_011', 'Core Stability': 'EX_001', 'Coordination': 'EX_007', 'Spinal Mobility': 'EX_004', 'Flow': 'EX_004' },
    'Shoulder Bridge': { 'Core Control': 'EX_001', 'Glute Strength': 'EX_014', 'Alignment': 'EX_003', 'Stability': 'EX_001', 'Breath': 'EX_006' },
    'Pelvic Curl': { 'Core Control': 'EX_001', 'Glute Strength': 'EX_014', 'Alignment': 'EX_003', 'Stability': 'EX_001', 'Breath': 'EX_006' },
    'Spine Twist': { 'Rotation': 'EX_013', 'Spinal Mobility': 'EX_004', 'Oblique Strength': 'EX_013', 'Posture': 'EX_002', 'Breath': 'EX_006' },
    'Jackknife': { 'Abdominal Power': 'EX_001', 'Height': 'EX_007', 'Leg Extension': 'EX_005', 'Spinal Articulation': 'EX_012', 'Control': 'EX_007' },
    'Side Kick': { 'Lateral Stability': 'EX_009', 'Kick Range': 'EX_011', 'Core Control': 'EX_007', 'Hip Mobility': 'EX_011', 'Flow': 'EX_004' },
    'Teaser': { 'Balance': 'EX_001', 'Core Strength': 'EX_001', 'Leg Extension': 'EX_005', 'Control': 'EX_007', 'Precision': 'EX_001' },
    'Hip Twist': { 'Core Control': 'EX_007', 'Hip Mobility': 'EX_011', 'Leg Extension': 'EX_005', 'Shoulder Stability': 'EX_010', 'Precision': 'EX_001' },
    'Swimming': { 'Back Extension': 'EX_008', 'Glute Activation': 'EX_014', 'Coordination': 'EX_007', 'Stamina': 'EX_006', 'Breath': 'EX_006' },
    'Leg Pull Front': { 'Plank Alignment': 'EX_010', 'Core Stability': 'EX_001', 'Shoulder Strength': 'EX_010', 'Glute Activation': 'EX_014', 'Control': 'EX_007' },
    'Leg Pull Back': { 'Reverse Plank': 'EX_010', 'Triceps Strength': 'EX_010', 'Glute Activation': 'EX_014', 'Shoulder Stability': 'EX_010', 'Control': 'EX_007' },
    'Kneeling Side Kick': { 'Balance': 'EX_001', 'Lateral Strength': 'EX_009', 'Core Control': 'EX_007', 'Hip Mobility': 'EX_011', 'Precision': 'EX_001' },
    'Side Bend': { 'Lateral Strength': 'EX_009', 'Shoulder Stability': 'EX_010', 'Core Control': 'EX_007', 'Hip Flexibility': 'EX_011', 'Flow': 'EX_004' },
    'Boomerang': { 'Flow': 'EX_004', 'Core Control': 'EX_007', 'Balance': 'EX_001', 'Coordination': 'EX_007', 'Breath': 'EX_006' },
    'Seal': { 'Balance': 'EX_001', 'Core Activation': 'EX_001', 'Compactness': 'EX_003', 'Rhythm': 'EX_006', 'Playfulness': 'EX_006' },
    'Crab': { 'Balance': 'EX_001', 'Spinal Massage': 'EX_004', 'Compactness': 'EX_003', 'Coordination': 'EX_007', 'Control': 'EX_007' },
    'Rocking': { 'Back Extension': 'EX_008', 'Quad Stretch': 'EX_005', 'Hip Flexor Opening': 'EX_011', 'Rhythm': 'EX_006', 'Breath': 'EX_006' },
    'Control Balance': { 'Balance': 'EX_001', 'Core Stability': 'EX_001', 'Leg Extension': 'EX_005', 'Shoulder Strength': 'EX_010', 'Control': 'EX_007' },
    'Push-Up': { 'Plank Alignment': 'EX_010', 'Chest Strength': 'EX_010', 'Core Stability': 'EX_001', 'Shoulder Strength': 'EX_010', 'Control': 'EX_007' },
    'Chest Lift': { 'Lift Height': 'EX_001', 'Neck Comfort': 'EX_002', 'Core Strength': 'EX_001', 'Pelvic Neutral': 'EX_003', 'Breath': 'EX_006' }
};

export function getRecommendation(poseName, radarData, userLevel = 'Beginner') {
    if (!poseName || !radarData || radarData.length === 0) return null;

    const sortedMetrics = [...radarData].sort((a, b) => a.A - b.A);
    const weakestMetric = sortedMetrics[0];

    const poseMap = RECOMMENDATION_MAP[poseName];
    if (!poseMap) return getDefaultRecommendation();

    const exerciseId = poseMap[weakestMetric.subject];
    if (!exerciseId) return EXERCISE_DATABASE.find(ex => ex.id === 'EX_001');

    const exercise = EXERCISE_DATABASE.find(ex => ex.id === exerciseId);
    if (!exercise) return null;

    return {
        ...exercise,
        reason: `We noticed your ${weakestMetric.subject} score was ${Math.round(weakestMetric.A)}/100. This exercise will help you improve it.`
    };
}

export function getSessionRecommendation(weakestIndicator) {
    if (!weakestIndicator) return getDefaultRecommendation();
    const candidates = EXERCISE_DATABASE.filter(ex => ex.targetIndicator === weakestIndicator);
    if (candidates.length > 0) {
        return {
            ...candidates[0],
            reason: `Your session analysis shows that '${weakestIndicator}' is your main area for improvement.`
        };
    }
    return getDefaultRecommendation();
}

function getDefaultRecommendation() {
    return EXERCISE_DATABASE[0];
}
