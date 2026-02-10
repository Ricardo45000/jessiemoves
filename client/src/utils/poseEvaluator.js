import { calculateAngle, calculateDistance } from './geometry';

/**
 * Pose Evaluator for all 34 Classical Pilates Mat Exercises
 * Reference: Joseph Pilates — "Return to Life Through Contrology" (1945)
 * Each evaluator produces: indicators, feedback[], radarData[], globalScore, level
 */

const LM = {
    NOSE: 0,
    LEFT_EAR: 7, RIGHT_EAR: 8,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
    LEFT_HEEL: 29, RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32
};

function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
function clamp(v) { return Math.min(100, Math.max(0, v)); }

function buildResult(evaluation) {
    const scores = evaluation.radarData.map(d => d.A);
    evaluation.globalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    if (evaluation.globalScore >= 85) evaluation.level = 'Advanced';
    else if (evaluation.globalScore >= 65) evaluation.level = 'Intermediate';
    else evaluation.level = 'Beginner';

    if (evaluation.feedback.length === 0) evaluation.feedback.push('Great form! Maintain your breathing rhythm.');
    evaluation.prioritizedTip = evaluation.feedback[0];
    return evaluation;
}

function makeEval(poseName) {
    return { pose: poseName, indicators: {}, feedback: [], radarData: [], globalScore: 0, level: 'Beginner', prioritizedTip: '' };
}

// ─── Evaluator Hub ─────────────────────────────────────────────
export function evaluatePose(landmarks, poseName) {
    if (!landmarks || !poseName) return null;

    const evaluators = {
        'The Hundred': evalTheHundred,
        'Roll-Up': evalRollUp,
        'Roll Over': evalRollOver,
        'One-Leg Circle': evalOneLegCircle,
        'Rolling Like a Ball': evalRollingLikeABall,
        'One-Leg Stretch': evalOneLegStretch,
        'Double-Leg Stretch': evalDoubleLegStretch,
        'Spine Stretch': evalSpineStretch,
        'Open-Leg Rocker': evalOpenLegRocker,
        'Corkscrew': evalCorkscrew,
        'The Saw': evalTheSaw,
        'Swan Dive': evalSwanDive,
        'One-Leg Kick': evalOneLegKick,
        'Double-Leg Kick': evalDoubleLegKick,
        'Neck Pull': evalNeckPull,
        'Scissors': evalScissors,
        'Bicycle': evalBicycle,
        'Shoulder Bridge': evalShoulderBridge,
        'Spine Twist': evalSpineTwist,
        'Jackknife': evalJackknife,
        'Side Kick': evalSideKick,
        'Teaser': evalTeaser,
        'Hip Twist': evalHipTwist,
        'Swimming': evalSwimming,
        'Leg Pull Front': evalLegPullFront,
        'Leg Pull Back': evalLegPullBack,
        'Kneeling Side Kick': evalKneelingSideKick,
        'Side Bend': evalSideBend,
        'Boomerang': evalBoomerang,
        'Seal': evalSeal,
        'Crab': evalCrab,
        'Rocking': evalRocking,
        'Control Balance': evalControlBalance,
        'Push-Up': evalPushUp,
        'Chest Lift': evalChestLift,
        'Pelvic Curl': evalShoulderBridge // alias
    };

    const evaluator = evaluators[poseName];
    if (!evaluator) return null;
    return evaluator(landmarks);
}

// ─── Individual Evaluators ────────────────────────────────────

function evalTheHundred(lm) {
    const e = makeEval('The Hundred');
    const legAng = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    const extension = clamp((legAng / 180) * 100);
    e.indicators.Extension = extension;
    if (legAng < 160) e.feedback.push('Try to straighten your legs further.');
    e.feedback.push('Pump arms vigorously with breath.');
    e.radarData = [
        { subject: 'Stamina', A: 90, fullMark: 100 },
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Leg Extension', A: extension, fullMark: 100 },
        { subject: 'Arm Vigor', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 85, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalRollUp(lm) {
    const e = makeEval('Roll-Up');
    const reach = clamp(100 - calculateDistance(lm[LM.LEFT_WRIST], lm[LM.LEFT_ANKLE]) * 200);
    e.indicators.Articulation = reach;
    if (reach < 70) e.feedback.push('Peel spine off mat one vertebra at a time.');
    e.radarData = [
        { subject: 'Articulation', A: reach, fullMark: 100 },
        { subject: 'Abdominal Strength', A: 90, fullMark: 100 },
        { subject: 'Hamstring Flexibility', A: 80, fullMark: 100 },
        { subject: 'Shoulder Relax', A: 85, fullMark: 100 },
        { subject: 'Flow', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalRollOver(lm) {
    const e = makeEval('Roll Over');
    const ankleOverHead = lm[LM.LEFT_ANKLE].y < lm[LM.LEFT_SHOULDER].y;
    const controlScore = ankleOverHead ? 85 : 55;
    const legStraight = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Control = controlScore;
    if (!ankleOverHead) e.feedback.push('Bring legs further overhead with control.');
    e.radarData = [
        { subject: 'Spinal Mobility', A: controlScore, fullMark: 100 },
        { subject: 'Abdominal Control', A: 85, fullMark: 100 },
        { subject: 'Leg Extension', A: legStraight, fullMark: 100 },
        { subject: 'Precision', A: 80, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalOneLegCircle(lm) {
    const e = makeEval('One-Leg Circle');
    const legStraight = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Flexibility = legStraight;
    if (legStraight < 80) e.feedback.push('Extend reaching leg fully.');
    e.radarData = [
        { subject: 'Pelvic Stability', A: 80, fullMark: 100 },
        { subject: 'Hip Mobility', A: 85, fullMark: 100 },
        { subject: 'Leg Straightness', A: legStraight, fullMark: 100 },
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalRollingLikeABall(lm) {
    const e = makeEval('Rolling Like a Ball');
    const compact = clamp(100 - calculateDistance(lm[LM.LEFT_KNEE], lm[LM.LEFT_SHOULDER]) * 300);
    e.indicators.Compactness = compact;
    if (compact < 70) e.feedback.push('Tuck tighter — heels close to sit bones.');
    e.radarData = [
        { subject: 'Balance', A: 80, fullMark: 100 },
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Compactness', A: compact, fullMark: 100 },
        { subject: 'Spinal Massage', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalOneLegStretch(lm) {
    const e = makeEval('One-Leg Stretch');
    const lLeg = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    const rLeg = calculateAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
    const extension = clamp((Math.max(lLeg, rLeg) / 180) * 100);
    e.indicators.Extension = extension;
    if (extension < 80) e.feedback.push('Extend the straight leg further from center.');
    e.radarData = [
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Leg Extension', A: extension, fullMark: 100 },
        { subject: 'Pelvic Control', A: 80, fullMark: 100 },
        { subject: 'Coordination', A: 85, fullMark: 100 },
        { subject: 'Breath', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalDoubleLegStretch(lm) {
    const e = makeEval('Double-Leg Stretch');
    const legExt = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    const armReach = lm[LM.LEFT_WRIST].y < lm[LM.LEFT_SHOULDER].y ? 90 : 60;
    e.indicators.Extension = legExt;
    if (legExt < 80) e.feedback.push('Reach arms and legs further from center.');
    e.radarData = [
        { subject: 'Core Power', A: 85, fullMark: 100 },
        { subject: 'Leg Extension', A: legExt, fullMark: 100 },
        { subject: 'Arm Reach', A: armReach, fullMark: 100 },
        { subject: 'Coordination', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 85, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSpineStretch(lm) {
    const e = makeEval('Spine Stretch');
    const legStraight = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    const posture = clamp((legStraight / 180) * 100);
    e.indicators.Posture = posture;
    if (posture < 85) e.feedback.push('Sit taller through the crown of your head.');
    e.radarData = [
        { subject: 'Posture', A: posture, fullMark: 100 },
        { subject: 'Articulation', A: 85, fullMark: 100 },
        { subject: 'Abdominal Scoop', A: 80, fullMark: 100 },
        { subject: 'Shoulder Stability', A: 90, fullMark: 100 },
        { subject: 'Breath', A: 85, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalOpenLegRocker(lm) {
    const e = makeEval('Open-Leg Rocker');
    const legExt = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    const balance = 80;
    e.indicators.Balance = balance;
    if (legExt < 80) e.feedback.push('Straighten legs while maintaining balance.');
    e.radarData = [
        { subject: 'Balance', A: balance, fullMark: 100 },
        { subject: 'Hamstring Flexibility', A: legExt, fullMark: 100 },
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Spinal Articulation', A: 80, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalCorkscrew(lm) {
    const e = makeEval('Corkscrew');
    const legStraight = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Control = legStraight;
    if (legStraight < 80) e.feedback.push('Keep legs together and straight during circles.');
    e.radarData = [
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Pelvic Stability', A: 80, fullMark: 100 },
        { subject: 'Leg Extension', A: legStraight, fullMark: 100 },
        { subject: 'Spinal Mobility', A: 80, fullMark: 100 },
        { subject: 'Precision', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalTheSaw(lm) {
    const e = makeEval('The Saw');
    const rotation = clamp(Math.abs(lm[LM.LEFT_SHOULDER].x - lm[LM.RIGHT_SHOULDER].x) * 300);
    const reach = clamp(100 - calculateDistance(lm[LM.LEFT_WRIST], lm[LM.RIGHT_ANKLE]) * 200);
    e.indicators.Rotation = rotation;
    if (rotation < 60) e.feedback.push('Rotate torso more — think of wringing out a towel.');
    e.radarData = [
        { subject: 'Rotation', A: rotation, fullMark: 100 },
        { subject: 'Reach', A: reach, fullMark: 100 },
        { subject: 'Hamstring Flex', A: 80, fullMark: 100 },
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Breath', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSwanDive(lm) {
    const e = makeEval('Swan Dive');
    const sh = mid(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const liftHeight = clamp((hp.y - sh.y) * 500);
    e.indicators.Extension = liftHeight;
    if (liftHeight < 60) e.feedback.push('Press through palms to lift chest higher.');
    e.radarData = [
        { subject: 'Back Extension', A: liftHeight, fullMark: 100 },
        { subject: 'Core Support', A: 85, fullMark: 100 },
        { subject: 'Shoulder Opening', A: 80, fullMark: 100 },
        { subject: 'Glute Engagement', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalOneLegKick(lm) {
    const e = makeEval('One-Leg Kick');
    const kickAngle = Math.min(calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]),
        calculateAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]));
    const kickDepth = clamp(100 - (kickAngle / 180) * 100);
    e.indicators.KickDepth = kickDepth;
    if (kickDepth < 60) e.feedback.push('Kick heel closer to glute with control.');
    e.radarData = [
        { subject: 'Hamstring Strength', A: kickDepth, fullMark: 100 },
        { subject: 'Glute Activation', A: 85, fullMark: 100 },
        { subject: 'Core Stability', A: 80, fullMark: 100 },
        { subject: 'Upper Body', A: 80, fullMark: 100 },
        { subject: 'Rhythm', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalDoubleLegKick(lm) {
    const e = makeEval('Double-Leg Kick');
    const lKick = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    const rKick = calculateAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
    const symmetry = clamp(100 - Math.abs(lKick - rKick) * 3);
    e.indicators.Symmetry = symmetry;
    if (symmetry < 80) e.feedback.push('Keep both legs kicking evenly.');
    e.radarData = [
        { subject: 'Posterior Chain', A: 85, fullMark: 100 },
        { subject: 'Symmetry', A: symmetry, fullMark: 100 },
        { subject: 'Back Extension', A: 80, fullMark: 100 },
        { subject: 'Coordination', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalNeckPull(lm) {
    const e = makeEval('Neck Pull');
    const handPos = calculateDistance(lm[LM.LEFT_WRIST], lm[LM.NOSE]);
    const handsAtHead = handPos < 0.15 ? 90 : 60;
    const rollControl = 80;
    e.indicators.Articulation = rollControl;
    if (handsAtHead < 70) e.feedback.push('Keep hands behind head throughout the movement.');
    e.radarData = [
        { subject: 'Spinal Articulation', A: rollControl, fullMark: 100 },
        { subject: 'Abdominal Strength', A: 85, fullMark: 100 },
        { subject: 'Hand Position', A: handsAtHead, fullMark: 100 },
        { subject: 'Control', A: 80, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalScissors(lm) {
    const e = makeEval('Scissors');
    const split = Math.abs(lm[LM.LEFT_ANKLE].y - lm[LM.RIGHT_ANKLE].y);
    const splitScore = clamp(split * 400);
    const legStraight = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Split = splitScore;
    if (splitScore < 60) e.feedback.push('Open the scissors wider with control.');
    e.radarData = [
        { subject: 'Hip Flexibility', A: splitScore, fullMark: 100 },
        { subject: 'Leg Extension', A: legStraight, fullMark: 100 },
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Shoulder Support', A: 80, fullMark: 100 },
        { subject: 'Precision', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalBicycle(lm) {
    const e = makeEval('Bicycle');
    const lLeg = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    const rLeg = calculateAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
    const range = clamp(Math.abs(lLeg - rLeg) * 2);
    e.indicators.Range = range;
    if (range < 50) e.feedback.push('Exaggerate the cycling motion — full extension on each pedal.');
    e.radarData = [
        { subject: 'Range of Motion', A: range, fullMark: 100 },
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Coordination', A: 80, fullMark: 100 },
        { subject: 'Spinal Mobility', A: 80, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalShoulderBridge(lm) {
    const e = makeEval('Shoulder Bridge');
    const bodyAngle = calculateAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE]);
    const alignment = clamp(100 - Math.abs(180 - bodyAngle));
    const kneeAng = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
    e.indicators.Alignment = alignment;
    if (bodyAngle < 160) e.feedback.push('Lift hips higher to create a straight line.');
    e.radarData = [
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Glute Strength', A: 80, fullMark: 100 },
        { subject: 'Alignment', A: alignment, fullMark: 100 },
        { subject: 'Stability', A: 85, fullMark: 100 },
        { subject: 'Breath', A: 70, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSpineTwist(lm) {
    const e = makeEval('Spine Twist');
    const shoulderW = Math.abs(lm[LM.LEFT_SHOULDER].x - lm[LM.RIGHT_SHOULDER].x);
    const hipW = Math.abs(lm[LM.LEFT_HIP].x - lm[LM.RIGHT_HIP].x);
    const rotationScore = clamp((1 - shoulderW / (hipW + 0.01)) * 150);
    e.indicators.Rotation = rotationScore;
    if (rotationScore < 60) e.feedback.push('Rotate further — feel the twist through your entire spine.');
    e.radarData = [
        { subject: 'Rotation', A: rotationScore, fullMark: 100 },
        { subject: 'Spinal Mobility', A: 85, fullMark: 100 },
        { subject: 'Oblique Strength', A: 80, fullMark: 100 },
        { subject: 'Posture', A: 85, fullMark: 100 },
        { subject: 'Breath', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalJackknife(lm) {
    const e = makeEval('Jackknife');
    const an = mid(lm[LM.LEFT_ANKLE], lm[LM.RIGHT_ANKLE]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const heightScore = clamp((hp.y - an.y) * 500);
    const legStraight = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Height = heightScore;
    if (heightScore < 60) e.feedback.push('Drive legs straight up toward the ceiling.');
    e.radarData = [
        { subject: 'Abdominal Power', A: 85, fullMark: 100 },
        { subject: 'Height', A: heightScore, fullMark: 100 },
        { subject: 'Leg Extension', A: legStraight, fullMark: 100 },
        { subject: 'Spinal Articulation', A: 80, fullMark: 100 },
        { subject: 'Control', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSideKick(lm) {
    const e = makeEval('Side Kick');
    const legSpread = Math.abs(lm[LM.LEFT_ANKLE].x - lm[LM.RIGHT_ANKLE].x);
    const kickRange = clamp(legSpread * 400);
    e.indicators.KickRange = kickRange;
    if (kickRange < 60) e.feedback.push('Kick leg further front and back while keeping torso stable.');
    e.radarData = [
        { subject: 'Lateral Stability', A: 85, fullMark: 100 },
        { subject: 'Kick Range', A: kickRange, fullMark: 100 },
        { subject: 'Core Control', A: 80, fullMark: 100 },
        { subject: 'Hip Mobility', A: 80, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalTeaser(lm) {
    const e = makeEval('Teaser');
    const legExt = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    const sh = mid(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const balance = clamp((hp.y - sh.y) * 400);
    e.indicators.Balance = balance;
    if (legExt < 80) e.feedback.push('Extend legs fully to achieve the V-shape.');
    e.radarData = [
        { subject: 'Balance', A: balance, fullMark: 100 },
        { subject: 'Core Strength', A: 90, fullMark: 100 },
        { subject: 'Leg Extension', A: legExt, fullMark: 100 },
        { subject: 'Control', A: 85, fullMark: 100 },
        { subject: 'Precision', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalHipTwist(lm) {
    const e = makeEval('Hip Twist');
    const legExt = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Control = 80;
    e.radarData = [
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Hip Mobility', A: 80, fullMark: 100 },
        { subject: 'Leg Extension', A: legExt, fullMark: 100 },
        { subject: 'Shoulder Stability', A: 80, fullMark: 100 },
        { subject: 'Precision', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSwimming(lm) {
    const e = makeEval('Swimming');
    const sh = mid(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const liftScore = clamp((hp.y - sh.y) * 400);
    e.indicators.Extension = liftScore;
    if (liftScore < 60) e.feedback.push('Lift chest and legs higher off the mat.');
    e.radarData = [
        { subject: 'Back Extension', A: liftScore, fullMark: 100 },
        { subject: 'Glute Activation', A: 85, fullMark: 100 },
        { subject: 'Coordination', A: 80, fullMark: 100 },
        { subject: 'Stamina', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalLegPullFront(lm) {
    const e = makeEval('Leg Pull Front');
    const sh = mid(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const plankLine = clamp(100 - Math.abs(sh.y - hp.y) * 500);
    e.indicators.Alignment = plankLine;
    if (plankLine < 70) e.feedback.push('Keep hips level — avoid sagging or piking.');
    e.radarData = [
        { subject: 'Plank Alignment', A: plankLine, fullMark: 100 },
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Shoulder Strength', A: 80, fullMark: 100 },
        { subject: 'Glute Activation', A: 80, fullMark: 100 },
        { subject: 'Control', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalLegPullBack(lm) {
    const e = makeEval('Leg Pull Back');
    const sh = mid(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const plankLine = clamp(100 - Math.abs(sh.y - hp.y) * 500);
    e.indicators.Alignment = plankLine;
    if (plankLine < 70) e.feedback.push('Press hips up to form a straight line.');
    e.radarData = [
        { subject: 'Reverse Plank', A: plankLine, fullMark: 100 },
        { subject: 'Triceps Strength', A: 80, fullMark: 100 },
        { subject: 'Glute Activation', A: 85, fullMark: 100 },
        { subject: 'Shoulder Stability', A: 80, fullMark: 100 },
        { subject: 'Control', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalKneelingSideKick(lm) {
    const e = makeEval('Kneeling Side Kick');
    e.indicators.Balance = 80;
    e.radarData = [
        { subject: 'Balance', A: 80, fullMark: 100 },
        { subject: 'Lateral Strength', A: 85, fullMark: 100 },
        { subject: 'Core Control', A: 80, fullMark: 100 },
        { subject: 'Hip Mobility', A: 80, fullMark: 100 },
        { subject: 'Precision', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSideBend(lm) {
    const e = makeEval('Side Bend');
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const liftScore = clamp((0.5 - hp.y) * 300);
    e.indicators.Lift = liftScore;
    if (liftScore < 60) e.feedback.push('Lift hips higher into the arc.');
    e.radarData = [
        { subject: 'Lateral Strength', A: liftScore, fullMark: 100 },
        { subject: 'Shoulder Stability', A: 85, fullMark: 100 },
        { subject: 'Core Control', A: 80, fullMark: 100 },
        { subject: 'Hip Flexibility', A: 80, fullMark: 100 },
        { subject: 'Flow', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalBoomerang(lm) {
    const e = makeEval('Boomerang');
    e.indicators.Flow = 80;
    e.feedback.push('Maintain smooth transitions between phases.');
    e.radarData = [
        { subject: 'Flow', A: 80, fullMark: 100 },
        { subject: 'Core Control', A: 85, fullMark: 100 },
        { subject: 'Balance', A: 80, fullMark: 100 },
        { subject: 'Coordination', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalSeal(lm) {
    const e = makeEval('Seal');
    const compact = clamp(100 - calculateDistance(lm[LM.LEFT_KNEE], lm[LM.LEFT_SHOULDER]) * 300);
    e.indicators.Compactness = compact;
    if (compact < 70) e.feedback.push('Hold tighter — clap feet three times at each end.');
    e.radarData = [
        { subject: 'Balance', A: 80, fullMark: 100 },
        { subject: 'Core Activation', A: 85, fullMark: 100 },
        { subject: 'Compactness', A: compact, fullMark: 100 },
        { subject: 'Rhythm', A: 80, fullMark: 100 },
        { subject: 'Playfulness', A: 85, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalCrab(lm) {
    const e = makeEval('Crab');
    const compact = clamp(100 - calculateDistance(lm[LM.LEFT_KNEE], lm[LM.LEFT_SHOULDER]) * 300);
    e.indicators.Compactness = compact;
    e.radarData = [
        { subject: 'Balance', A: 80, fullMark: 100 },
        { subject: 'Spinal Massage', A: 85, fullMark: 100 },
        { subject: 'Compactness', A: compact, fullMark: 100 },
        { subject: 'Coordination', A: 80, fullMark: 100 },
        { subject: 'Control', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalRocking(lm) {
    const e = makeEval('Rocking');
    const holdAnkles = clamp(100 - (calculateDistance(lm[LM.LEFT_WRIST], lm[LM.LEFT_ANKLE]) + calculateDistance(lm[LM.RIGHT_WRIST], lm[LM.RIGHT_ANKLE])) * 200);
    e.indicators.BackExtension = holdAnkles;
    if (holdAnkles < 60) e.feedback.push('Hold ankles firmly and rock forward and back.');
    e.radarData = [
        { subject: 'Back Extension', A: holdAnkles, fullMark: 100 },
        { subject: 'Quad Stretch', A: 80, fullMark: 100 },
        { subject: 'Hip Flexor Opening', A: 80, fullMark: 100 },
        { subject: 'Rhythm', A: 75, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalControlBalance(lm) {
    const e = makeEval('Control Balance');
    const legStraight = clamp((calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) / 180) * 100);
    e.indicators.Balance = 80;
    e.radarData = [
        { subject: 'Balance', A: 80, fullMark: 100 },
        { subject: 'Core Stability', A: 90, fullMark: 100 },
        { subject: 'Leg Extension', A: legStraight, fullMark: 100 },
        { subject: 'Shoulder Strength', A: 80, fullMark: 100 },
        { subject: 'Control', A: 85, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalPushUp(lm) {
    const e = makeEval('Push-Up');
    const elbowAngle = calculateAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]);
    const depth = clamp(100 - (elbowAngle / 180) * 100);
    const sh = mid(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hp = mid(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const plankLine = clamp(100 - Math.abs(sh.y - hp.y) * 500);
    e.indicators.Depth = depth;
    if (plankLine < 70) e.feedback.push('Keep body in a straight line — avoid sagging hips.');
    e.radarData = [
        { subject: 'Plank Alignment', A: plankLine, fullMark: 100 },
        { subject: 'Chest Strength', A: 80, fullMark: 100 },
        { subject: 'Core Stability', A: 85, fullMark: 100 },
        { subject: 'Shoulder Strength', A: 80, fullMark: 100 },
        { subject: 'Control', A: 80, fullMark: 100 }
    ];
    return buildResult(e);
}

function evalChestLift(lm) {
    const e = makeEval('Chest Lift');
    const liftScore = (lm[LM.LEFT_HIP].y - lm[LM.LEFT_SHOULDER].y) > 0.1 ? 90 : 60;
    e.indicators.Amplitude = liftScore;
    if (liftScore < 80) e.feedback.push('Curl up higher using your abdominals.');
    e.radarData = [
        { subject: 'Core Strength', A: 85, fullMark: 100 },
        { subject: 'Neck Comfort', A: 90, fullMark: 100 },
        { subject: 'Lift Height', A: liftScore, fullMark: 100 },
        { subject: 'Pelvic Neutral', A: 80, fullMark: 100 },
        { subject: 'Breath', A: 75, fullMark: 100 }
    ];
    return buildResult(e);
}
