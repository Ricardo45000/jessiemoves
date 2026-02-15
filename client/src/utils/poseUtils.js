/**
 * Vector Embedding Utilities for Pose Estimation
 * 
 * Functions to normalize, flatten, and compare pose vectors.
 */

const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
    LEFT_HIP: 23, RIGHT_HIP: 24
};

/**
 * Normalizes MediaPipe landmarks into a position-invariant, scale-invariant vector.
 * @param {Array} landmarks - Array of 33 landmarks from MediaPipe ({x, y, z, visibility}).
 * @returns {Float32Array} - Flattened vector of 99 values (33 points * 3 dims).
 */
export function normalizeLandmarks(landmarks) {
    if (!landmarks || landmarks.length < 33) return null;

    // Check visibility of Key Anchors (Hips & Shoulders)
    // Lowered threshold to 0.3 for better tolerance during close-ups/zooms
    const mustHave = [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP];
    if (mustHave.some(idx => !landmarks[idx] || landmarks[idx].visibility < 0.3)) {
        return null;
    }

    // 1. Center the Pose (Hip Midpoint)
    const hipX = (landmarks[LM.LEFT_HIP].x + landmarks[LM.RIGHT_HIP].x) / 2;
    const hipY = (landmarks[LM.LEFT_HIP].y + landmarks[LM.RIGHT_HIP].y) / 2;
    const hipZ = (landmarks[LM.LEFT_HIP].z + landmarks[LM.RIGHT_HIP].z) / 2;

    // 2. Scale Factor (Torso Length: Mid-Hip to Mid-Shoulder)
    const shoulderX = (landmarks[LM.LEFT_SHOULDER].x + landmarks[LM.RIGHT_SHOULDER].x) / 2;
    const shoulderY = (landmarks[LM.LEFT_SHOULDER].y + landmarks[LM.RIGHT_SHOULDER].y) / 2;
    const shoulderZ = (landmarks[LM.LEFT_SHOULDER].z + landmarks[LM.RIGHT_SHOULDER].z) / 2;

    const dx = shoulderX - hipX;
    const dy = shoulderY - hipY;
    const dz = shoulderZ - hipZ;
    const torsoLength = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1.0;

    // 3. Normalize & Flatten
    const vector = new Float32Array(landmarks.length * 3);

    for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];

        // Handle missing/invisible landmarks
        // If a landmark is low visibility, we infer or zero it out relative to hip?
        // For now, if visibility is low, we still calculate it but maybe the classifier handles it?
        // Actually, if it's missing (e.g. cut off screen), x/y might be out of bounds or accurate.
        // MediaPipe tries to guess off-screen points. We'll trust the coordinate but maybe clamp?

        // Shift to origin (Hip Center)
        let x = lm.x - hipX;
        let y = lm.y - hipY;
        let z = lm.z - hipZ;

        // Scale by Torso Length
        x /= torsoLength;
        y /= torsoLength;
        z /= torsoLength;

        // Perspective Compensation (User Request: Z-axis weight 1.5)
        z *= 1.5;

        vector[i * 3] = x;
        vector[i * 3 + 1] = y;
        vector[i * 3 + 2] = z;
    }

    return vector;
}

/**
 * Calculates Cosine Similarity between two vectors.
 * Returns value between -1.0 and 1.0 (1.0 = identical).
 */
export function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculates Weighted Euclidean Distance for specific body parts.
 * Useful for providing specific feedback (e.g. "Your legs are too low").
 * @param {Float32Array} vecA - User Vector
 * @param {Float32Array} vecB - Target Vector
 * @param {Array<number>} indices - Array of Landmark Indices to compare (e.g., [23, 24, 25...])
 * @returns {number} - Average distance for these points.
 */
export function weightedDistance(vecA, vecB, indices) {
    let totalDist = 0;
    let count = 0;

    for (const idx of indices) {
        // Each landmark has 3 components in the vector
        const base = idx * 3;
        const dx = vecA[base] - vecB[base];
        const dy = vecA[base + 1] - vecB[base + 1];
        const dz = vecA[base + 2] - vecB[base + 2];

        totalDist += Math.sqrt(dx * dx + dy * dy + dz * dz);
        count++;
    }

    return count === 0 ? 0 : totalDist / count;
}
