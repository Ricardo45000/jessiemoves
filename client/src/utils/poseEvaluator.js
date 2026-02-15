import { normalizeLandmarks, weightedDistance } from './poseUtils';
import { POSE_ANCHORS } from './poseLibrary';

/**
 * Vector-Based Pose Evaluator
 * 
 * Scores the user's pose by comparing it to the "Gold Standard"
 * vector in the library.
 * 
 * Scoring Logic:
 * - 100 points = Perfect match (distance ~ 0)
 * - Deduct points based on weighted Euclidean distance of specific body segments.
 */

const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
    LEFT_WRIST: 15, RIGHT_WRIST: 16,
    LEFT_HIP: 23, RIGHT_HIP: 24,
    LEFT_KNEE: 25, RIGHT_KNEE: 26,
    LEFT_ANKLE: 27, RIGHT_ANKLE: 28
};

// Semantic Groups for Feedback
const GROUPS = {
    "Upper Body": [11, 12, 13, 14, 15, 16], // Shoulders, Arms
    "Core/Hips": [23, 24],                 // Hips
    "Lower Body": [25, 26, 27, 28]         // Legs
};

function clamp(v) { return Math.min(100, Math.max(0, v)); }

export function evaluatePose(landmarks, poseName) {
    if (!landmarks || !poseName) return null;

    // 1. Find Target Vector (with Search-and-Rescue)
    let targetPose = POSE_ANCHORS.find(p => p.name === poseName);

    // Fallback: Check if inputs are "The Hundred - Variation"
    if (!targetPose && poseName.includes(" - ")) {
        const parts = poseName.split(" - ");
        const parent = POSE_ANCHORS.find(a => a.name === parts[0]);
        if (parent) {
            targetPose = parent; // Use parent metadata
            const v = parent.variations.find(v => v.name === parts[1]);
            if (v) targetPose = { ...parent, vector: v.vector, name: parts[0] }; // Use variation vector
        }
    }

    if (!targetPose) {
        return {
            pose: poseName,
            indicators: { Accuracy: 50 },
            feedback: ["Reference pose not found. Please capture it first."],
            radarData: [{ subject: 'Accuracy', A: 50, fullMark: 100 }],
            globalScore: 50,
            level: 'Beginner'
        };
    }

    // 2. Normalize User Input
    // (We do this early to use for variation checking)
    const userVector = normalizeLandmarks(landmarks);
    if (!userVector) return null;

    // 3. Search-and-Rescue: Check all variations
    // Even if we have a target, check if a sub-variation matches BETTER
    // This rescues "Good form, wrong variation" scores.
    let targetVector = targetPose.vector;

    // Resolve Anchor from Library if needed to get variations
    const anchorInfo = POSE_ANCHORS.find(a => a.name === targetPose.name);

    if (anchorInfo && anchorInfo.variations) {
        // Calculate Unweighted Cosine Similarity (Utils function needed? Or just distance?)
        // We will use weightedDistance as a proxy (lower is better) or just minimal deviation.
        // Let's use the simplest metric: Distance on Key Joints.
        // Actually, we can't import cosineSimilarity here easily without loop. 
        // Let's iterate and check the "Overall Match" deviation for each.

        let bestDist = Infinity;
        let bestVec = targetPose.vector;
        let originalVec = targetPose.vector;

        // Check Original
        let totalOriginal = 0;
        for (const [_, indices] of Object.entries(GROUPS)) {
            totalOriginal += weightedDistance(userVector, originalVec, indices);
        }
        bestDist = totalOriginal;

        // Check Variations
        for (const variation of anchorInfo.variations) {
            if (!variation.vector) continue;
            let totalVar = 0;
            for (const [_, indices] of Object.entries(GROUPS)) {
                totalVar += weightedDistance(userVector, variation.vector, indices);
            }

            if (totalVar < bestDist) {
                bestDist = totalVar;
                bestVec = variation.vector;
                targetPose = { ...variation }; // [FIX] Switch the whole object so we get the name
                // console.log("Rescued by variation:", variation.name);
            }
        }
        targetVector = bestVec;
    }

    // 3b. Variation Rescue (Geometric Override for "The Hundred")
    // If the pose is "The Hundred", use geometry to pick the variation
    if (poseName === "The Hundred" && userVector) {
        // Calculate Knee Angle (Hip-Knee-Ankle)
        // Indices: Hip(23/24), Knee(25/26), Ankle(27/28). Use Left side (23,25,27) as proxy
        const getAngle = (idxA, idxB, idxC) => {
            // Vector BA
            const v1 = { x: userVector[idxA * 3] - userVector[idxB * 3], y: userVector[idxA * 3 + 1] - userVector[idxB * 3 + 1] };
            // Vector BC
            const v2 = { x: userVector[idxC * 3] - userVector[idxB * 3], y: userVector[idxC * 3 + 1] - userVector[idxB * 3 + 1] };

            const dot = v1.x * v2.x + v1.y * v2.y;
            const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
            const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
            if (mag1 * mag2 === 0) return 0;
            return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
        };

        const kneeAngle = getAngle(23, 25, 27);
        // Tabletop: ~90 deg. High Diagonal: ~135-150 deg. Low Legs: ~160-180 deg.

        let geoVariant = null;
        if (kneeAngle < 110) geoVariant = "Tabletop Legs";
        else if (kneeAngle < 155) geoVariant = "High Diagonal";
        else geoVariant = "Low Legs";

        // Override target if geometry is strong
        if (geoVariant) {
            const variantObj = anchorInfo.variations.find(v => v.name === geoVariant);
            if (variantObj) {
                targetPose = { ...variantObj }; // Override
                targetVector = variantObj.vector;
                // console.log(`Geometric Rescue: Switched to ${geoVariant} (Angle: ${Math.round(kneeAngle)})`);
            }
        }
    }

    // 3. Calculate Deviation per Group
    const deviations = {};
    let totalDeviation = 0;

    for (const [groupName, indices] of Object.entries(GROUPS)) {
        const dist = weightedDistance(userVector, targetVector, indices);
        deviations[groupName] = dist;
        totalDeviation += dist;
    }

    // 4. Generate Scores (Scaling Law: 0.1 dist is ~10 points off)
    const SCALE = 150;

    const scores = {
        "Upper Body": clamp(100 - deviations["Upper Body"] * SCALE),
        "Core & Hips": clamp(100 - deviations["Core/Hips"] * SCALE),
        "Lower Body": clamp(100 - deviations["Lower Body"] * SCALE),
        "Overall Match": clamp(100 - (totalDeviation / 3) * SCALE)
    };

    // 5. Generate Dynamic Feedback
    const feedback = [];
    if (scores["Upper Body"] < 80) feedback.push("Check arm placement and shoulder alignment.");
    if (scores["Core & Hips"] < 80) feedback.push("Stabilize your core and hips.");
    if (scores["Lower Body"] < 80) feedback.push("Focus on leg extension and positioning.");
    if (feedback.length === 0) feedback.push(targetPose.tips ? targetPose.tips[0] : "Excellent form!");

    // 6. Build Result Object
    const globalScore = Math.round(scores["Overall Match"]);

    // Determine return name: If we switched to a variation, let the UI know.
    let detectedVariant = null;
    if (targetPose.name !== poseName) {
        detectedVariant = targetPose.name;
    }

    // Amplitude-Based Level Override
    // If the user is doing "The Hundred" with full extension (Low Legs), award Advanced
    let level = globalScore > 85 ? 'Advanced' : globalScore > 70 ? 'Intermediate' : 'Beginner';

    if (poseName === "The Hundred" && detectedVariant === "Low Legs") {
        // Full extension detected — reward the difficulty
        level = 'Advanced';
    } else if (poseName === "The Hundred" && detectedVariant === "High Diagonal" && globalScore > 65) {
        // High diagonal with decent score = at least Intermediate
        level = globalScore > 80 ? 'Advanced' : 'Intermediate';
    }

    return {
        pose: poseName,
        detectedVariant: detectedVariant,
        indicators: scores,
        feedback: feedback,
        radarData: [
            { subject: 'Upper Body', A: Math.round(scores["Upper Body"]), fullMark: 100 },
            { subject: 'Core & Hips', A: Math.round(scores["Core & Hips"]), fullMark: 100 },
            { subject: 'Lower Body', A: Math.round(scores["Lower Body"]), fullMark: 100 },
            { subject: 'Stability', A: 85, fullMark: 100 },
            { subject: 'Flow', A: 80, fullMark: 100 }
        ],
        globalScore: globalScore,
        level: level
    };
}

