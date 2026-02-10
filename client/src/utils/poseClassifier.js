import { calculateAngle, calculateDistance } from './geometry';

/**
 * Pose Classifier for all 34 Classical Pilates Mat Exercises
 * Reference: Joseph Pilates — "Return to Life Through Contrology" (1945)
 * Uses 2D MediaPipe Pose landmarks (33 points) for geometric classification.
 */

const LM = {
    NOSE: 0,
    LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7, RIGHT_EAR: 8,
    MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_PINKY: 17, RIGHT_PINKY: 18,
    LEFT_INDEX: 19, RIGHT_INDEX: 20,
    LEFT_THUMB: 21, RIGHT_THUMB: 22,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
    LEFT_HEEL: 29, RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32
};

// ─── Helper geometry ───────────────────────────────────────────
function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function isSupine(lm) {
    // Lying on back: hips lower (larger y) than shoulders, torso roughly horizontal
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return Math.abs(sh.y - hp.y) < 0.15 && hp.y > 0.4;
}

function isProne(lm) {
    // Lying face down: nose below or near shoulders, torso horizontal
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const nose = lm[LM.NOSE];
    return Math.abs(sh.y - hp.y) < 0.15 && nose.y >= sh.y - 0.05;
}

function isSeated(lm) {
    // Seated: hips lower than shoulders, torso more vertical
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return hp.y > sh.y + 0.08;
}

function isSideLying(lm) {
    // Side-lying: shoulders stacked (close in x), hips stacked
    const shoulderDiffX = Math.abs(lm[LM.LEFT_SHOULDER].x - lm[LM.RIGHT_SHOULDER].x);
    const hipDiffX = Math.abs(lm[LM.LEFT_HIP].x - lm[LM.RIGHT_HIP].x);
    return shoulderDiffX < 0.08 && hipDiffX < 0.08;
}

function headLifted(lm) {
    const nose = lm[LM.NOSE];
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    return nose.y < sh.y - 0.02;
}

function legsElevated(lm) {
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const leftAnkle = lm[LM.LEFT_ANKLE];
    const rightAnkle = lm[LM.RIGHT_ANKLE];
    return leftAnkle.y < hp.y && rightAnkle.y < hp.y;
}

function oneLegUp(lm) {
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const lUp = lm[LM.LEFT_ANKLE].y < hp.y - 0.1;
    const rUp = lm[LM.RIGHT_ANKLE].y < hp.y - 0.1;
    return (lUp && !rUp) || (!lUp && rUp);
}

function legAngle(lm, side) {
    if (side === 'left') return calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    return calculateAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
}

function torsoAngle(lm) {
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return Math.abs(Math.atan2(sh.y - hp.y, sh.x - hp.x) * 180 / Math.PI);
}

function isPlank(lm) {
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const an = midpoint(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    const bodyLine = Math.abs(sh.y - hp.y) < 0.1 && Math.abs(hp.y - an.y) < 0.15;
    const armsStraight = calculateAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]) > 150;
    return bodyLine && armsStraight && sh.y < 0.5;
}

function hipsLifted(lm) {
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const an = midpoint(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    return hp.y < an.y;
}

function kneesBent(lm) {
    return legAngle(lm, 'left') < 130 && legAngle(lm, 'right') < 130;
}

function legsOverhead(lm) {
    const an = midpoint(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    return an.y < sh.y;
}

// ─── Classification Functions (ordered most specific → least specific) ───

function isPushUp(lm) {
    return isPlank(lm);
}

function isLegPullFront(lm) {
    if (!isPlank(lm)) return false;
    return oneLegUp(lm);
}

function isLegPullBack(lm) {
    // Reverse plank: face up, arms behind, body straight
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const wrist = midpoint(lm[LM.LEFT_WRIST], lm[LM.RIGHT_WRIST]);
    return Math.abs(sh.y - hp.y) < 0.12 && wrist.y > sh.y && lm[LM.NOSE].y < sh.y;
}

function isSideBend(lm) {
    // Side plank: one arm on ground, body in lateral line
    if (!isSideLying(lm)) return false;
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return hp.y < 0.5; // hips lifted off ground
}

function isKneelingSideKick(lm) {
    // One knee down, torso lateral, other leg extended
    const lKnee = lm[LM.LEFT_KNEE];
    const rKnee = lm[LM.RIGHT_KNEE];
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const oneKneeDown = (lKnee.y > hp.y + 0.15) !== (rKnee.y > hp.y + 0.15);
    return oneKneeDown && !isSupine(lm);
}

function isSwanDive(lm) {
    if (!isProne(lm)) return false;
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return sh.y < hp.y - 0.05; // chest lifted above hips
}

function isRocking(lm) {
    if (!isProne(lm)) return false;
    // Holding ankles behind: wrists near ankles
    const lDist = calculateDistance(lm[LM.LEFT_WRIST], lm[LM.LEFT_ANKLE]);
    const rDist = calculateDistance(lm[LM.RIGHT_WRIST], lm[LM.RIGHT_ANKLE]);
    return lDist < 0.15 && rDist < 0.15;
}

function isSwimming(lm) {
    if (!isProne(lm)) return false;
    // Arms extended forward, opposite arm/leg pattern
    const lWrist = lm[LM.LEFT_WRIST];
    const rWrist = lm[LM.RIGHT_WRIST];
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const armsForward = lWrist.y < sh.y && rWrist.y < sh.y;
    return armsForward;
}

function isOneLegKick(lm) {
    if (!isProne(lm)) return false;
    // On forearms, one leg kicks toward glute
    const elbowAngle = calculateAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]);
    const onForearms = elbowAngle < 120;
    const lKneeAngle = legAngle(lm, 'left');
    const rKneeAngle = legAngle(lm, 'right');
    const oneKicking = (lKneeAngle < 90) !== (rKneeAngle < 90);
    return onForearms && oneKicking;
}

function isDoubleLegKick(lm) {
    if (!isProne(lm)) return false;
    // Both knees bent simultaneously
    return legAngle(lm, 'left') < 110 && legAngle(lm, 'right') < 110;
}

function isRollOver(lm) {
    if (!isSupine(lm)) return false;
    return legsOverhead(lm);
}

function isJackknife(lm) {
    if (!isSupine(lm)) return false;
    // Legs straight up toward ceiling (more vertical than roll over)
    const an = midpoint(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return an.y < hp.y - 0.2 && Math.abs(an.x - hp.x) < 0.15 && legAngle(lm, 'left') > 150;
}

function isControlBalance(lm) {
    if (!isSupine(lm)) return false;
    // One leg overhead, one reaches up — asymmetric overhead
    return legsOverhead(lm) && oneLegUp(lm);
}

function isScissors(lm) {
    if (!isSupine(lm)) return false;
    // Both legs up, split vertically
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rAnkle = lm[LM.RIGHT_ANKLE];
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const bothUp = lAnkle.y < hp.y && rAnkle.y < hp.y;
    const split = Math.abs(lAnkle.y - rAnkle.y) > 0.15;
    return bothUp && split && legAngle(lm, 'left') > 140;
}

function isBicycle(lm) {
    if (!isSupine(lm)) return false;
    // Both legs up, one bent one straight (cycling)
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const bothUp = lm[LM.LEFT_ANKLE].y < hp.y && lm[LM.RIGHT_ANKLE].y < hp.y;
    const lAngle = legAngle(lm, 'left');
    const rAngle = legAngle(lm, 'right');
    const oneBentOneStraight = Math.abs(lAngle - rAngle) > 30;
    return bothUp && oneBentOneStraight;
}

function isTeaser(lm) {
    // V-sit: balance on sit bones, legs and torso both elevated
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const an = midpoint(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    const torsoUp = sh.y < hp.y - 0.05;
    const legsUp = an.y < hp.y;
    const legsStraight = legAngle(lm, 'left') > 140;
    return torsoUp && legsUp && legsStraight;
}

function isOpenLegRocker(lm) {
    // Seated V-balance with legs apart
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const legsUp = lm[LM.LEFT_ANKLE].y < hp.y && lm[LM.RIGHT_ANKLE].y < hp.y;
    const legsApart = Math.abs(lm[LM.LEFT_ANKLE].x - lm[LM.RIGHT_ANKLE].x) > 0.2;
    const balanced = sh.y < hp.y;
    return legsUp && legsApart && balanced;
}

function isHipTwist(lm) {
    if (!isSeated(lm)) return false;
    // Weight on hands behind, legs circling
    const wrist = midpoint(lm[LM.LEFT_WRIST], lm[LM.RIGHT_WRIST]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    return wrist.y > hp.y && legsElevated(lm);
}

function isRollingLikeABall(lm) {
    // Seated tuck, knees to chest, rounded
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const kneeToChest = calculateDistance(lm[LM.LEFT_KNEE], lm[LM.LEFT_SHOULDER]) < 0.2;
    const rounded = kneesBent(lm) && sh.y < hp.y;
    return rounded && kneeToChest;
}

function isSeal(lm) {
    // Very similar to Rolling Like a Ball — differentiate by hand position between legs
    const lWrist = lm[LM.LEFT_WRIST];
    const rWrist = lm[LM.RIGHT_WRIST];
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rAnkle = lm[LM.RIGHT_ANKLE];
    const handsBetweenLegs = lWrist.y > lm[LM.LEFT_KNEE].y && rWrist.y > lm[LM.RIGHT_KNEE].y;
    const handsNearAnkles = calculateDistance(lWrist, lAnkle) < 0.15;
    return isRollingLikeABall(lm) && handsBetweenLegs;
}

function isCrab(lm) {
    // Similar to seal but cross-legged — hard to distinguish in 2D, fallback check
    return isRollingLikeABall(lm) && !isSeal(lm);
}

function isBoomerang(lm) {
    // Complex flow — detect as seated balance with legs crossed/extended
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const an = midpoint(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    return sh.y < hp.y && an.y < hp.y + 0.05 && legAngle(lm, 'left') > 120;
}

function isTheHundred(lm) {
    if (!isSupine(lm)) return false;
    const lifted = headLifted(lm);
    const feetUp = legsElevated(lm);
    // Arms parallel to body at hip level
    const wristNearHip = Math.abs(lm[LM.LEFT_WRIST].y - lm[LM.LEFT_HIP].y) < 0.15;
    return lifted && (feetUp || wristNearHip);
}

function isOneLegStretch(lm) {
    if (!isSupine(lm)) return false;
    if (!headLifted(lm)) return false;
    // One knee to chest, other extended
    const lKnee = legAngle(lm, 'left');
    const rKnee = legAngle(lm, 'right');
    return (lKnee < 90 && rKnee > 140) || (rKnee < 90 && lKnee > 140);
}

function isDoubleLegStretch(lm) {
    if (!isSupine(lm)) return false;
    if (!headLifted(lm)) return false;
    // Both limbs extended or both tucked
    const bothExtended = legAngle(lm, 'left') > 150 && legAngle(lm, 'right') > 150;
    const armsUp = lm[LM.LEFT_WRIST].y < lm[LM.LEFT_SHOULDER].y;
    return bothExtended && armsUp && legsElevated(lm);
}

function isOneLegCircle(lm) {
    if (!isSupine(lm)) return false;
    return oneLegUp(lm) && legAngle(lm, 'left') > 140;
}

function isCorkscrew(lm) {
    if (!isSupine(lm)) return false;
    // Both legs up and together
    return legsElevated(lm) && !oneLegUp(lm) && legAngle(lm, 'left') > 140;
}

function isShoulderBridge(lm) {
    if (!isSupine(lm)) return false;
    return hipsLifted(lm) && kneesBent(lm);
}

function isNeckPull(lm) {
    // Roll-up variation with hands behind head
    const lWrist = lm[LM.LEFT_WRIST];
    const rWrist = lm[LM.RIGHT_WRIST];
    const nose = lm[LM.NOSE];
    const handsAtHead = calculateDistance(lWrist, nose) < 0.15 || calculateDistance(rWrist, nose) < 0.15;
    return isSeated(lm) && handsAtHead;
}

function isRollUp(lm) {
    // Seated forward fold, hands reaching feet
    if (!isSeated(lm)) return false;
    const lWrist = lm[LM.LEFT_WRIST];
    const lAnkle = lm[LM.LEFT_ANKLE];
    const reach = calculateDistance(lWrist, lAnkle) < 0.3;
    return reach;
}

function isSpineStretch(lm) {
    if (!isSeated(lm)) return false;
    const legStraight = legAngle(lm, 'left') > 150;
    const sh = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const torsoVertical = Math.abs(sh.x - hp.x) < 0.2;
    return legStraight && torsoVertical;
}

function isTheSaw(lm) {
    if (!isSeated(lm)) return false;
    // Seated with legs apart, rotational reach
    const legsApart = Math.abs(lm[LM.LEFT_ANKLE].x - lm[LM.RIGHT_ANKLE].x) > 0.25;
    const sh = lm[LM.LEFT_SHOULDER];
    const hp = lm[LM.LEFT_HIP];
    // Torso rotated: shoulders not aligned with hips
    const rotated = Math.abs(lm[LM.LEFT_SHOULDER].x - lm[LM.RIGHT_SHOULDER].x) > 0.1;
    return legsApart && rotated;
}

function isSpineTwist(lm) {
    if (!isSeated(lm)) return false;
    // Upright seated, torso twisted (shoulders rotated relative to hips)
    const legStraight = legAngle(lm, 'left') > 150;
    const shoulderRotation = Math.abs(lm[LM.LEFT_SHOULDER].x - lm[LM.RIGHT_SHOULDER].x);
    const hipWidth = Math.abs(lm[LM.LEFT_HIP].x - lm[LM.RIGHT_HIP].x);
    const twisted = shoulderRotation < hipWidth * 0.6; // shoulders closer together = rotated
    return legStraight && twisted;
}

function isSideKick(lm) {
    if (!isSideLying(lm)) return false;
    // Top leg extended forward or back
    const lAnkle = lm[LM.LEFT_ANKLE];
    const rAnkle = lm[LM.RIGHT_ANKLE];
    const legSpread = Math.abs(lAnkle.x - rAnkle.x) > 0.15;
    return legSpread;
}

function isChestLift(lm) {
    if (!isSupine(lm)) return false;
    return headLifted(lm) && kneesBent(lm) && !legsElevated(lm);
}

// ─── Main Classifier ──────────────────────────────────────────
export function classifyPose(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    // === PRONE EXERCISES (face down) ===
    if (isRocking(landmarks)) return { name: 'Rocking', confidence: 0.85 };
    if (isOneLegKick(landmarks)) return { name: 'One-Leg Kick', confidence: 0.85 };
    if (isDoubleLegKick(landmarks)) return { name: 'Double-Leg Kick', confidence: 0.80 };
    if (isSwimming(landmarks)) return { name: 'Swimming', confidence: 0.85 };
    if (isSwanDive(landmarks)) return { name: 'Swan Dive', confidence: 0.85 };

    // === PLANK / SUPPORT EXERCISES ===
    if (isLegPullFront(landmarks)) return { name: 'Leg Pull Front', confidence: 0.85 };
    if (isLegPullBack(landmarks)) return { name: 'Leg Pull Back', confidence: 0.80 };
    if (isSideBend(landmarks)) return { name: 'Side Bend', confidence: 0.80 };
    if (isPushUp(landmarks)) return { name: 'Push-Up', confidence: 0.80 };

    // === SIDE-LYING ===
    if (isSideKick(landmarks)) return { name: 'Side Kick', confidence: 0.85 };

    // === KNEELING ===
    if (isKneelingSideKick(landmarks)) return { name: 'Kneeling Side Kick', confidence: 0.80 };

    // === SUPINE — LEGS OVERHEAD ===
    if (isControlBalance(landmarks)) return { name: 'Control Balance', confidence: 0.75 };
    if (isRollOver(landmarks)) return { name: 'Roll Over', confidence: 0.85 };
    if (isJackknife(landmarks)) return { name: 'Jackknife', confidence: 0.80 };

    // === SUPINE — SPECIFIC PATTERNS ===
    if (isOneLegStretch(landmarks)) return { name: 'One-Leg Stretch', confidence: 0.85 };
    if (isDoubleLegStretch(landmarks)) return { name: 'Double-Leg Stretch', confidence: 0.80 };
    if (isScissors(landmarks)) return { name: 'Scissors', confidence: 0.85 };
    if (isBicycle(landmarks)) return { name: 'Bicycle', confidence: 0.80 };
    if (isCorkscrew(landmarks)) return { name: 'Corkscrew', confidence: 0.80 };
    if (isOneLegCircle(landmarks)) return { name: 'One-Leg Circle', confidence: 0.85 };
    if (isTheHundred(landmarks)) return { name: 'The Hundred', confidence: 0.85 };
    if (isShoulderBridge(landmarks)) return { name: 'Shoulder Bridge', confidence: 0.85 };
    if (isChestLift(landmarks)) return { name: 'Chest Lift', confidence: 0.80 };

    // === V-SIT / BALANCE ===
    if (isTeaser(landmarks)) return { name: 'Teaser', confidence: 0.85 };
    if (isOpenLegRocker(landmarks)) return { name: 'Open-Leg Rocker', confidence: 0.80 };
    if (isHipTwist(landmarks)) return { name: 'Hip Twist', confidence: 0.75 };
    if (isBoomerang(landmarks)) return { name: 'Boomerang', confidence: 0.70 };

    // === SEATED ROLLING ===
    if (isSeal(landmarks)) return { name: 'Seal', confidence: 0.80 };
    if (isRollingLikeABall(landmarks)) return { name: 'Rolling Like a Ball', confidence: 0.85 };

    // === SEATED ===
    if (isNeckPull(landmarks)) return { name: 'Neck Pull', confidence: 0.80 };
    if (isTheSaw(landmarks)) return { name: 'The Saw', confidence: 0.85 };
    if (isSpineTwist(landmarks)) return { name: 'Spine Twist', confidence: 0.80 };
    if (isRollUp(landmarks)) return { name: 'Roll-Up', confidence: 0.85 };
    if (isSpineStretch(landmarks)) return { name: 'Spine Stretch', confidence: 0.85 };

    return { name: 'Unknown', confidence: 0 };
}
