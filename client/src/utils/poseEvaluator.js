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

    // ...
    switch (poseName) {
        case 'Pelvic Curl':
            evaluation = evaluatePelvicCurl(landmarks, evaluation);
            break;
        case 'Chest Lift':
            evaluation = evaluateChestLift(landmarks, evaluation);
            break;
        case 'The Hundred':
            evaluation = evaluateTheHundred(landmarks, evaluation);
            break;
        case 'One-Leg Circle':
            evaluation = evaluateOneLegCircle(landmarks, evaluation);
            break;
        case 'Roll-Up':
            evaluation = evaluateRollUp(landmarks, evaluation);
            break;
        case 'Spine Stretch':
            evaluation = evaluateSpineStretch(landmarks, evaluation);
            break;
        default:
            return null;
    }
    // ... (rest of common logic)

    return evaluation;
}

function evaluatePelvicCurl(landmarks, evaluation) {
    // Focus: Neutral pelvis start (not tracked easily), then straight line knees-hips-shoulders.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];

    const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const alignmentScore = Math.min(100, Math.max(0, 100 - Math.abs(180 - bodyAngle)));
    evaluation.indicators.Alignment = alignmentScore;

    if (bodyAngle < 160) {
        evaluation.feedback.push("Lift hips higher to create a straight line.");
    }

    // Stability: Knees should not splay (hard in 2D side view, but can check angle consistency)
    evaluation.indicators.Stability = 85;

    // Radar
    evaluation.radarData = [
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Glute Strength', A: 80, fullMark: 100 },
        { subject: 'Alignment', A: alignmentScore, fullMark: 100 },
        { subject: 'Stability', A: 85, fullMark: 100 },
        { subject: 'Breath', A: 70, fullMark: 100 },
    ];
    return evaluation;
}

function evaluateChestLift(landmarks, evaluation) {
    // Focus: Head/Shoulders lifted, Chin not tucked too hard.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const nose = landmarks[LM.NOSE];
    const leftEar = landmarks[7] || nose; // fallback

    // Neck alignment check (Chin tuck)
    // Very rough approx: Angle between Shoulder-Ear and vertical?

    // Lift height check
    const liftScore = (leftHip.y - leftShoulder.y) > 0.1 ? 90 : 60;
    evaluation.indicators.Amplitude = liftScore;

    if (liftScore < 80) {
        evaluation.feedback.push("Curl up higher using your abdominals.");
    }

    evaluation.radarData = [
        { subject: 'Core Strength', A: 85, fullMark: 100 },
        { subject: 'Neck Comfort', A: 90, fullMark: 100 },
        { subject: 'Lift Height', A: liftScore, fullMark: 100 },
        { subject: 'Pelvic Neutral', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 },
    ];
    return evaluation;
}

function evaluateTheHundred(landmarks, evaluation) {
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    // Leg straightness
    const legAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const extensionScore = Math.min(100, LegAngle = (legAngle / 180) * 100);
    evaluation.indicators.Extension = extensionScore;

    if (legAngle < 160) {
        evaluation.feedback.push("Try to straighten your legs further.");
    }

    // Arm Pumping (Dynamic - hard to measure in 1 frame, assume position is correct)
    evaluation.feedback.push("Pump arms vigorously with breath.");

    evaluation.radarData = [
        { subject: 'Stamina', A: 90, fullMark: 100 },
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Leg Extension', A: extensionScore, fullMark: 100 },
        { subject: 'Arm Vigor', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 85, fullMark: 100 },
    ];
    return evaluation;
}

function evaluateOneLegCircle(landmarks, evaluation) {
    // Pelvic Stability is key (hips shouldn't move). 
    // Leg verticality.
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    const legAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const straightnessScore = Math.min(100, (legAngle / 180) * 100);
    evaluation.indicators.Flexibility = straightnessScore;

    if (legAngle < 160) {
        evaluation.feedback.push("Extend reaching leg fully.");
    }

    evaluation.radarData = [
        { subject: 'Pelvic Stability', A: 80, fullMark: 100 },
        { subject: 'Hip Mobility', A: 85, fullMark: 100 },
        { subject: 'Leg Straightness', A: straightnessScore, fullMark: 100 },
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 },
    ];
    return evaluation;
}

function evaluateRollUp(landmarks, evaluation) {
    // C-Curve check.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];

    // Check if shoulders are forward of hips
    const reachScore = (leftShoulder.x < leftHip.x) ? 95 : 50; // assuming facing left
    evaluation.indicators.Articulation = reachScore;

    evaluation.feedback.push("Peel spine off mat one vertebra at a time.");

    evaluation.radarData = [
        { subject: 'Articulation', A: reachScore, fullMark: 100 },
        { subject: 'Abdominal Strength', A: 90, fullMark: 100 },
        { subject: 'Hamstring Flexibility', A: 80, fullMark: 100 },
        { subject: 'Shoulder Relax', A: 85, fullMark: 100 },
        { subject: 'Flow', A: 80, fullMark: 100 },
    ];
    return evaluation;
}

function evaluateSpineStretch(landmarks, evaluation) {
    // Upright start, then C-Curve forward.
    evaluation.indicators.Posture = 90;
    evaluation.feedback.push("Imagine peeling off a wall.");

    evaluation.radarData = [
        { subject: 'Posture', A: 90, fullMark: 100 },
        { subject: 'Articulation', A: 85, fullMark: 100 },
        { subject: 'Abdominal Scoop', A: 80, fullMark: 100 },
        { subject: 'Shoulder Stability', A: 90, fullMark: 100 },
        { subject: 'Breath', A: 85, fullMark: 100 },
    ];
    return evaluation;
}
