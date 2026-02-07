import { calculateAngle } from './geometry';

const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
};

export function evaluatePose(landmarks, poseName) {
    if (!landmarks || !poseName) return null;

    let evaluation = {
        pose: poseName,
        indicators: {},
        feedback: [],
        radarData: [],
        globalScore: 0,
        level: 'Beginner',
        prioritizedTip: ''
    };

    switch (poseName) {
        case 'Plank':
            evaluation = evaluatePlank(landmarks, evaluation);
            break;
        case 'Downward Dog':
            evaluation = evaluateDownwardDog(landmarks, evaluation);
            break;
        case 'Warrior 2':
            evaluation = evaluateWarrior2(landmarks, evaluation);
            break;
        default:
            return null;
    }

    // Calculate Global Score (Average of indicators)
    const scores = Object.values(evaluation.indicators);
    if (scores.length > 0) {
        const total = scores.reduce((acc, score) => acc + score, 0);
        evaluation.globalScore = Math.round(total / scores.length);
    }

    // Determine Level
    if (evaluation.globalScore >= 90) evaluation.level = 'Expert';
    else if (evaluation.globalScore >= 80) evaluation.level = 'Advanced';
    else if (evaluation.globalScore >= 60) evaluation.level = 'Intermediate';
    else evaluation.level = 'Beginner';

    // Determine Prioritized Tip (Lowest score)
    let minScore = 101;
    let weakestMetric = '';

    for (const [metric, score] of Object.entries(evaluation.indicators)) {
        if (score < minScore) {
            minScore = score;
            weakestMetric = metric;
        }
    }

    // Map weakest metric to specific tip
    if (weakestMetric) {
        // Find the specific feedback associated with this metric (simplified logic)
        // Ideally, we'd map this better, but for now we look at the first feedback item or generic
        evaluation.prioritizedTip = evaluation.feedback[0] || `Focus on improving your ${weakestMetric}.`;
    }

    return evaluation;
}

function evaluatePlank(landmarks, evaluation) {
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const leftElbow = landmarks[LM.LEFT_ELBOW];
    const leftWrist = landmarks[LM.LEFT_WRIST];

    // Indicator 1: Alignment (Hips)
    const hipAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
    const alignmentScore = Math.min(100, Math.max(0, 100 - Math.abs(180 - hipAngle)));
    evaluation.indicators.Alignment = alignmentScore;

    if (hipAngle < 160) {
        evaluation.feedback.push("Raise your hips to align with shoulders and heels.");
    } else if (hipAngle > 190) { // adjusted
        evaluation.feedback.push("Lower your hips, engage your core.");
    }

    // Indicator 2: Stability (Arm Straightness)
    const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const stabilityScore = Math.min(100, (elbowAngle / 180) * 100);
    evaluation.indicators.Stability = stabilityScore;

    if (elbowAngle < 160) {
        evaluation.feedback.push("Push floor away, straighten arms completely.");
    }

    // Standardized Radar Data (5 Axes as requested)
    // Strength, Stability, Amplitude, Technics, Alignment
    evaluation.radarData = [
        { subject: 'Strength', A: 80, fullMark: 100 },    // Mock/Proxy
        { subject: 'Stability', A: stabilityScore, fullMark: 100 },
        { subject: 'Amplitude', A: 70, fullMark: 100 },   // Mock/Proxy
        { subject: 'Technics', A: 85, fullMark: 100 },    // Mock/Proxy
        { subject: 'Alignment', A: alignmentScore, fullMark: 100 },
    ];

    return evaluation;
}

function evaluateDownwardDog(landmarks, evaluation) {
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    // Indicator 1: Flexibility (Legs) -> Mapped to 'Amplitude'
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const flexibilityScore = Math.min(100, (kneeAngle / 180) * 100);
    evaluation.indicators.Flexibility = flexibilityScore;

    if (kneeAngle < 160) {
        evaluation.feedback.push("Straighten legs to stretch hamstrings.");
    }

    // Indicator 2: Alignment (Back/Hip Angle)
    const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const alignmentScore = hipAngle < 100 ? 100 : Math.max(0, 100 - (hipAngle - 90));
    evaluation.indicators.Alignment = alignmentScore;

    if (hipAngle > 100) {
        evaluation.feedback.push("Push chest to thighs.");
    }

    evaluation.radarData = [
        { subject: 'Strength', A: 75, fullMark: 100 },
        { subject: 'Stability', A: 80, fullMark: 100 },
        { subject: 'Amplitude', A: flexibilityScore, fullMark: 100 },
        { subject: 'Technics', A: 85, fullMark: 100 },
        { subject: 'Alignment', A: alignmentScore, fullMark: 100 },
    ];

    return evaluation;
}

function evaluateWarrior2(landmarks, evaluation) {
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const rightShoulder = landmarks[LM.RIGHT_SHOULDER];
    const leftWrist = landmarks[LM.LEFT_WRIST];
    const rightWrist = landmarks[LM.RIGHT_WRIST];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    // Indicator 1: Symmetry (Arms) -> Mapped to 'Technics' or 'Stability'
    const armDiff = Math.abs(leftWrist.y - rightWrist.y);
    const symmetryScore = Math.max(0, 100 - (armDiff * 500));
    evaluation.indicators.Symmetry = symmetryScore;

    if (armDiff > 0.05) {
        evaluation.feedback.push("Level your arms.");
    }

    // Indicator 2: Alignment (Knee Bend)
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const alignmentScore = Math.max(0, 100 - Math.abs(90 - kneeAngle));
    evaluation.indicators.Alignment = alignmentScore;

    if (kneeAngle > 110) {
        evaluation.feedback.push("Deepen your lunge.");
    }

    evaluation.radarData = [
        { subject: 'Strength', A: 90, fullMark: 100 },
        { subject: 'Stability', A: symmetryScore, fullMark: 100 },
        { subject: 'Amplitude', A: 85, fullMark: 100 },
        { subject: 'Technics', A: 80, fullMark: 100 },
        { subject: 'Alignment', A: alignmentScore, fullMark: 100 },
    ];

    return evaluation;
}
