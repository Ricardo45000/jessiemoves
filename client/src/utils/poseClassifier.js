import { calculateAngle } from './geometry';

// MediaPipe Pose Landmarks Mapping
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
    LEFT_HEEL: 29,
    RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31,
    RIGHT_FOOT_INDEX: 32
};

export function classifyPose(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    // Detect Plank
    if (isPlank(landmarks)) {
        return { name: 'Plank', confidence: 0.85 }; // Hardcoded confidence for rule-based
    }

    // Detect Downward Dog
    if (isDownwardDog(landmarks)) {
        return { name: 'Downward Dog', confidence: 0.85 };
    }

    // Detect Warrior 2
    if (isWarrior2(landmarks)) {
        return { name: 'Warrior 2', confidence: 0.85 };
    }

    return { name: 'Unknown', confidence: 0 };
}

function isPlank(landmarks) {
    // Logic: Body straight line (Shoulder-Hip-Ankle angle ~180), Arms straight (Shoulder-Elbow-Wrist ~180), Horizontal body

    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const leftElbow = landmarks[LM.LEFT_ELBOW];
    const leftWrist = landmarks[LM.LEFT_WRIST];

    // Check body straightness
    const hipAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);

    // Check arm straightness
    const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);

    // Check orientation (Torso horizontal-ish?)
    // This is tricky with normalized coords without aspect ratio, but we can check relative Y positions
    // In plank, shoulders and hips are roughly same height (y)
    const isHorizontal = Math.abs(leftShoulder.y - leftHip.y) < 0.1;

    return (hipAngle > 160) && (elbowAngle > 160) && isHorizontal;
}

function isDownwardDog(landmarks) {
    // Logic: Inverted V. Hips are the highest point (lowest y value in computer vision coords).
    // Angle at hips < 120 approx.
    // Arms and legs straight.

    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const leftElbow = landmarks[LM.LEFT_ELBOW];
    const leftWrist = landmarks[LM.LEFT_WRIST];

    // Hip angle (Body V-shape)
    const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

    // Hips higher than shoulders and feet? (Only if camera is upright)
    const hipsHigher = (leftHip.y < leftShoulder.y) && (leftHip.y < leftAnkle.y);

    return (hipAngle < 100) && hipsHigher; // 90 degrees ideal, < 100 allows for flexibility variation
}

function isWarrior2(landmarks) {
    // Logic: Wide stance. Arms horizontal. One knee bent approx 90, other straight.

    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const rightShoulder = landmarks[LM.RIGHT_SHOULDER];
    const leftElbow = landmarks[LM.LEFT_ELBOW];
    const rightElbow = landmarks[LM.RIGHT_ELBOW];
    const leftWrist = landmarks[LM.LEFT_WRIST];
    const rightWrist = landmarks[LM.RIGHT_WRIST];
    const leftHip = landmarks[LM.LEFT_HIP];
    const rightHip = landmarks[LM.RIGHT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const rightKnee = landmarks[LM.RIGHT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const rightAnkle = landmarks[LM.RIGHT_ANKLE];

    // Arms straight and horizontal
    // Check simple arm straightness
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const armsStraight = leftArmAngle > 150 && rightArmAngle > 150;

    // Legs: One bent (~90), One straight (~180)
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    const isLeftBent = (leftKneeAngle > 70 && leftKneeAngle < 135);
    const isRightStraight = (rightKneeAngle > 150);

    const isRightBent = (rightKneeAngle > 70 && rightKneeAngle < 135);
    const isLeftStraight = (leftKneeAngle > 150);

    const legsWarrior = (isLeftBent && isRightStraight) || (isRightBent && isLeftStraight);

    return armsStraight && legsWarrior;
}
