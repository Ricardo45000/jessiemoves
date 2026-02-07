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

    // 1. Pelvic Curl (Bridge-like)
    if (isPelvicCurl(landmarks)) {
        return { name: 'Pelvic Curl', confidence: 0.85 };
    }

    // 2. Chest Lift (Crunch-like)
    if (isChestLift(landmarks)) {
        return { name: 'Chest Lift', confidence: 0.85 };
    }

    // 3. The Hundred (Legs up/out, Head up, Arms active)
    if (isTheHundred(landmarks)) {
        return { name: 'The Hundred', confidence: 0.85 };
    }

    // 4. One-Leg Circle (Lying, one leg up)
    if (isOneLegCircle(landmarks)) {
        return { name: 'One-Leg Circle', confidence: 0.85 };
    }

    // 5. Roll-Up (Seated C-Curve)
    if (isRollUp(landmarks)) {
        return { name: 'Roll-Up', confidence: 0.85 };
    }

    // 6. Spine Stretch (Seated L-shape)
    if (isSpineStretch(landmarks)) {
        return { name: 'Spine Stretch', confidence: 0.85 };
    }

    return { name: 'Unknown', confidence: 0 };
}

// --- Helper Functions ---

function isPelvicCurl(landmarks) {
    // Shoulders, Hips, Knees roughly in line (180 deg).
    // Hips elevated off floor (lower Y than ankles in image coords).
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

    // Body straightness at peak
    const isStraight = bodyAngle > 150;
    // Knees bent approx 90 degrees
    const isKneesBent = kneeAngle < 120 && kneeAngle > 60;
    // Hips higher than ankles (y is inverted, so smaller y is higher)
    const hipsHigh = leftHip.y < leftAnkle.y;

    return isStraight && isKneesBent && hipsHigh;
}

function isChestLift(landmarks) {
    // Shoulders higher than hips (but not seated upright).
    // Shoulders off ground (detected by relative angle or position).
    // Knees bent.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    // Torso angle relative to floor (horizontal-ish but lifted)
    const torsoAngle = Math.abs(Math.atan2(leftShoulder.y - leftHip.y, leftShoulder.x - leftHip.x) * 180 / Math.PI);

    const isKneesBent = kneeAngle < 120;
    // Torso lift: Not flat (0/180) and not vertical (90). Say 10-45 degrees lift.
    // Simplifying: Shoulders higher than hips, but close in X.
    // Ideally compare to nose for "crunch" shape.

    return isKneesBent && (leftShoulder.y < leftHip.y); // Very basic check
}

function isTheHundred(landmarks) {
    // Head/Shoulders up.
    // Legs extended or tabletop.
    // Arms parallel to body/floor.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    // Check legs lifted
    const feetHigh = leftAnkle.y < leftHip.y; // Feet higher than hips usually in advanced
    // Or just check leg straightness for extended variation
    const legStraightness = calculateAngle(leftHip, leftKnee, leftAnkle);

    return feetHigh || (legStraightness > 150 && leftKnee.y < leftHip.y + 0.1);
}

function isOneLegCircle(landmarks) {
    // Lying flat (Shoulders and Hips level).
    // One leg vertical (90 deg flexion), one leg horizontal.
    const leftHip = landmarks[LM.LEFT_HIP];
    const rightHip = landmarks[LM.RIGHT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const rightKnee = landmarks[LM.RIGHT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const rightAnkle = landmarks[LM.RIGHT_ANKLE];

    const leftLegAngle = calculateAngle(leftHip, leftKnee, leftAnkle); // Straightness
    const rightLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle); // Straightness

    // Check verticality (approx)
    const isLeftUp = leftAnkle.y < leftHip.y && Math.abs(leftAnkle.x - leftHip.x) < 0.2;
    const isRightUp = rightAnkle.y < rightHip.y && Math.abs(rightAnkle.x - rightHip.x) < 0.2;

    return (isLeftUp || isRightUp) && (leftLegAngle > 150 && rightLegAngle > 150);
}

function isRollUp(landmarks) {
    // Seated forward fold.
    // Shoulders forward of Hips.
    // Hands near feet.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const leftWrist = landmarks[LM.LEFT_WRIST];

    const isSeated = leftHip.y > leftShoulder.y; // Hips lower than shoulders (visual Y) or on same plane if viewed from top
    // Hands reaching feet
    const reach = Math.abs(leftWrist.x - leftAnkle.x) < 0.3 && Math.abs(leftWrist.y - leftAnkle.y) < 0.3;

    return isSeated && reach;
}

function isSpineStretch(landmarks) {
    // Seated L-shape.
    // Back vertical or slightly curved forward.
    // Legs straight.
    const leftShoulder = landmarks[LM.LEFT_SHOULDER];
    const leftHip = landmarks[LM.LEFT_HIP];
    const leftKnee = landmarks[LM.LEFT_KNEE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];

    const legStraight = calculateAngle(leftHip, leftKnee, leftAnkle) > 160;
    const torsoVertical = Math.abs(leftShoulder.x - leftHip.x) < 0.2;

    return legStraight && torsoVertical;
}
