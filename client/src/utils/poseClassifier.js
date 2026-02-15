import { normalizeLandmarks, cosineSimilarity } from './poseUtils';
import { POSE_ANCHORS } from './poseLibrary';
import { MovingAverageBuffer } from './movingAverageBuffer';

/**
 * Temporal Sequence State Machine for Pose Classification
 * Uses a sliding window buffer to smooth out jitter and detect transitions.
 */
export class PoseClassifier {
    constructor(bufferSize = 30) {
        this.buffer = new MovingAverageBuffer(bufferSize);
        this.MATCH_THRESHOLD = 0.75; // Lenient: grasp the pose immediately

        // Velocity Gate (Powerhouse only)
        this.VELOCITY_STABLE = 0.12;

        // Simplified State (no more Transitioning blocker)
        this.state = {
            type: 'Idle', // Idle, Stable
            confirmedPose: 'Unknown',
            pendingPose: 'Unknown',
            framesStable: 0,
            lastScore: 0
        };
    }

    /**
     * Position-First Classification.
     * Always returns the best match — never blocks with "Transitioning...".
     * @param {Array} landmarks - Raw MediaPipe landmarks
     * @returns {Object}
     */
    classify(landmarks) {
        const currentVector = normalizeLandmarks(landmarks);
        if (!currentVector) return { name: "Unknown", score: 0, isSteady: false, isTransitioning: false };

        // 1. Add to Buffer & Smooth
        this.buffer.add(currentVector);
        const smoothedVector = this.buffer.getAverage();
        if (!smoothedVector) return { name: "Unknown", score: 0 };

        // 2. Velocity Check (Powerhouse Only: Shoulders & Hips)
        // Arms can pump freely without affecting state.
        const velocity = this.buffer.getVelocity([11, 12, 23, 24]);
        const isCoreStable = velocity < this.VELOCITY_STABLE;

        // 3. Compare against Anchors (with Variation Rescue)
        let bestMatch = { name: "Unknown", score: 0, variations: [] };

        for (const anchor of POSE_ANCHORS) {
            let anchorScore = cosineSimilarity(smoothedVector, anchor.vector);

            // Always check variations — pick the best among parent + all sub-variations
            let bestVarScore = 0;
            let bestVarName = null;

            if (anchor.variations && anchor.variations.length > 0) {
                for (const variation of anchor.variations) {
                    if (!variation.vector) continue;
                    const varScore = cosineSimilarity(smoothedVector, variation.vector);
                    if (varScore > bestVarScore) {
                        bestVarScore = varScore;
                        bestVarName = variation.name;
                    }
                }
            }

            const effectiveScore = Math.max(anchorScore, bestVarScore);
            // Use parent name always — the evaluator determines the specific variation via geometric rescue
            const effectiveName = anchor.name;

            if (effectiveScore > bestMatch.score) {
                bestMatch = {
                    name: effectiveName,
                    score: effectiveScore,
                    variations: []
                };
            }
        }

        // Legacy fallback for poses not in POSE_ANCHORS
        if (bestMatch.score < this.MATCH_THRESHOLD) {
            for (const original of POSE_ANCHORS) {
                if (POSE_ANCHORS.find(a => a.name === original.name)) continue;
                const score = cosineSimilarity(smoothedVector, original.vector);
                if (score > bestMatch.score) {
                    bestMatch = { name: original.name, score: score, variations: [] };
                }
            }
        }

        // 4. Simplified State: Always return best name, track stability for scoring
        let finalName = bestMatch.name;

        if (bestMatch.score >= this.MATCH_THRESHOLD) {
            // Track consecutive frames for the same pose
            if (finalName === this.state.pendingPose) {
                this.state.framesStable++;
            } else {
                this.state.pendingPose = finalName;
                this.state.framesStable = 1;
            }

            if (this.state.framesStable >= 3) {
                this.state.confirmedPose = finalName;
                this.state.type = 'Stable';
            }
        } else {
            // Low score — still show the name but mark as Idle
            this.state.type = 'Idle';
            this.state.framesStable = 0;
            finalName = (bestMatch.score > 0.5) ? bestMatch.name : "Unknown";
        }

        // isSteady: Core is stable (arms can move freely)
        const isSteady = this.state.type === 'Stable' && isCoreStable;

        return {
            name: finalName,
            rawName: bestMatch.name,
            score: bestMatch.score,
            isSteady: isSteady,
            isTransitioning: false, // Never block anymore
            state: this.state.type,
            velocity: velocity
        };
    }

    reset() {
        this.buffer = new MovingAverageBuffer(this.bufferSize);
        this.state = { type: 'Idle', confirmedPose: 'Unknown', pendingPose: 'Unknown', framesStable: 0, lastScore: 0 };
    }
}

// Singleton instance for backward compatibility with functional components
const globalClassifier = new PoseClassifier();

export const classifyPose = (landmarks) => {
    return globalClassifier.classify(landmarks);
};


