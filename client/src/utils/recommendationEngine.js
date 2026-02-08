/**
 * Recommendation Engine for Pilates
 * Analyzes the weakest indicators from a posture assessment and suggests remedial exercises.
 */

// Database of Remedial Exercises
const EXERCISE_DATABASE = [
    {
        id: 'EX_001',
        title: 'Single Leg Stretch',
        targetIndicator: 'Stability',
        level: 'Beginner',
        tags: ['core', 'stability'],
        description: 'Lie on back, curl head up, and switch legs while maintaining a stable pelvis. Excellent for building lumbopelvic stability.',
        media: 'https://www.youtube.com/watch?v=1f8_1f8_1f8' // Placeholder
    },
    {
        id: 'EX_002',
        title: 'Chest Expansion',
        targetIndicator: 'Posture',
        level: 'Beginner',
        tags: ['shoulders', 'posture'],
        description: 'Kneeling or standing, press arms back to open the chest and activate the upper back extensors.',
        media: 'https://www.youtube.com/watch?v=2f8_2f8_2f8' // Placeholder
    },
    {
        id: 'EX_003',
        title: 'Pelvic Tilt',
        targetIndicator: 'Alignment',
        level: 'Beginner',
        tags: ['pelvis', 'mobility'],
        description: 'Small rocking motion of the pelvis to find neutral spine alignment.',
        media: 'https://www.youtube.com/watch?v=3f8_3f8_3f8' // Placeholder
    },
    {
        id: 'EX_004',
        title: 'Cat Stretch',
        targetIndicator: 'Articulation',
        level: 'All',
        tags: ['spine', 'mobility'],
        description: 'On all fours, round and arch the back to mobilize the spine segment by segment.',
        media: 'https://www.youtube.com/watch?v=4f8_4f8_4f8' // Placeholder
    },
    {
        id: 'EX_005',
        title: 'Saw',
        targetIndicator: 'Flexibility',
        level: 'Beginner',
        tags: ['hamstrings', 'spine'],
        description: 'Seated twist and reach to stretch hamstrings and rotators.',
        media: 'https://www.youtube.com/watch?v=5f8_5f8_5f8' // Placeholder
    },
    {
        id: 'EX_006',
        title: 'Breathing w/ Theraband',
        targetIndicator: 'Breath',
        level: 'All',
        tags: ['breath', 'expansion'],
        description: 'Wrap a band around ribs to feel lateral expansion during inhalation.',
        media: 'https://www.youtube.com/watch?v=6f8_6f8_6f8' // Placeholder
    }
];

// Map specific poses + weak indicators to specific exercises
const RECOMMENDATION_MAP = {
    'Pelvic Curl': {
        'Stability': 'EX_001',
        'Alignment': 'EX_003',
        'Core Control': 'EX_001'
    },
    'Chest Lift': {
        'Lift Height': 'EX_001', // Needs more core strength
        'Neck Comfort': 'EX_002', // Needs better upper body posture/alignment
        'Core Strength': 'EX_001'
    },
    'The Hundred': {
        'Leg Extension': 'EX_005', // Tight hamstrings often limit extension
        'Stamina': 'EX_006', // Breathing focus
        'Core Stability': 'EX_001'
    },
    'One-Leg Circle': {
        'Pelvic Stability': 'EX_001',
        'Leg Straightness': 'EX_005',
        'Hip Mobility': 'EX_003'
    },
    'Roll-Up': {
        'Articulation': 'EX_004',
        'Abdominal Strength': 'EX_001',
        'Hamstring Flexibility': 'EX_005'
    },
    'Spine Stretch': {
        'Posture': 'EX_002',
        'Articulation': 'EX_004'
    }
};

/**
 * Generates a recommendation based on assessment data.
 * @param {string} poseName - The name of the pose performed (e.g., "Pelvic Curl")
 * @param {Array} radarData - Array of objects { subject: 'Metric', A: 85, fullMark: 100 }
 * @param {string} userLevel - Current user level (e.g., 'Beginner')
 * @returns {Object|null} - The recommended exercise object or null
 */
export function getRecommendation(poseName, radarData, userLevel = 'Beginner') {
    if (!poseName || !radarData || radarData.length === 0) return null;

    // 1. Find the weakest link (lowest score)
    // Sort by score (A) ascending
    const sortedMetrics = [...radarData].sort((a, b) => a.A - b.A);
    const weakestMetric = sortedMetrics[0];

    // If score is high enough (> 85), maybe no specific remedial needed? 
    // For now, always recommend to improve perfection.

    // 2. Lookup in map
    const poseMap = RECOMMENDATION_MAP[poseName];
    if (!poseMap) return getDefaultRecommendation();

    const exerciseId = poseMap[weakestMetric.subject];

    // Fallback if metric not mapped
    if (!exerciseId) {
        // Return a generic "Core" recommendation if unknown weakness
        return EXERCISE_DATABASE.find(ex => ex.id === 'EX_001');
    }

    // 3. Retrieve Exercise Logic
    const exercise = EXERCISE_DATABASE.find(ex => ex.id === exerciseId);

    if (!exercise) return null;

    return {
        ...exercise,
        reason: `We noticed your ${weakestMetric.subject} score was ${Math.round(weakestMetric.A)}/100. This exercise will help you improve it.`
    };
}

function getDefaultRecommendation() {
    return EXERCISE_DATABASE[0];
}
