import { classifyPose } from './poseClassifier';

/**
 * Analyzes a video file to extract a sequence of Pilates poses.
 * @param {HTMLVideoElement} videoElement - The video element to analyze.
 * @param {Object} poseDetector - The initialized MediaPipe Pose instance.
 * @param {Function} onProgress - Callback for progress updates (0-100).
 * @returns {Promise<Object>} - JSON object with sequence data.
 */
export async function analyzeVideoSequence(videoElement, poseDetector, onProgress) {
    if (!videoElement || !poseDetector) throw new Error("Missing video or detector");

    const duration = videoElement.duration;
    if (!duration || isNaN(duration)) throw new Error("Video duration unknown");

    const analysisResults = [];
    const keywords = ['Pelvic Curl', 'Chest Lift', 'The Hundred', 'One-Leg Circle', 'Roll-Up', 'Spine Stretch'];

    // Sampling rate: How often to check a frame (in seconds)
    // 0.5s is a good balance between speed and precision for exercise detection
    const SAMPLE_RATE = 0.5;
    let currentTime = 0;

    // We need to capture the video frame to a canvas for MediaPipe
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;

    // Helper to process a single frame
    const processTimestamp = async (time) => {
        return new Promise((resolve) => {
            const onSeek = async () => {
                videoElement.removeEventListener('seeked', onSeek);

                // Draw current video frame to canvas
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // Send to MediaPipe
                // We need to hook into the existing onResults of the pose detector
                // But for a utility, it works differently. MediaPipe's send() is async but doesn't return results directly.
                // We'll trust the global/configured onResults handler? No, that's messy.
                // Better approach: We assume the existing 'pose' instance is passed, allowing us to send()
                // BUT we need to capture the specific result for *this* frame.
                // Standard MediaPipe pattern is event-driven.
                // For this utility, we might need to create our OWN discrete detector or use a Promise wrapper around onResults.

                // Let's assume passed poseDetector is properly configured to just accept the image.
                // We need to intercept the result.

                // Wait for the result of *this specific* send.
                // Since MediaPipe usage in the main component is real-time, reusing it here might conflict if not careful.
                // Ideally, we'd instantiate a dedicated analyzer here, but for efficiency, let's reuse if possible,
                // or just instantiate a temporary lightweight one?
                // Actually, let's reuse the one passed in but wrap the onResults temporarily.

                await poseDetector.send({ image: canvas });
                // Note: The onResults in the parent component will trigger. 
                // We might need to expose a way to get the *last* result or pass a callback.
                // Refactor: Ideally this function shouldn't depend on external event loops.
                // Strategy: The parent component should probably drive the loop to avoid fighting over the onResults callback.

                // However, solely for this utility, we can accept the *result* if the design allows.
                // Alternative: The main component drives the seeking and calls a "classify" helper.

                resolve();
            };

            videoElement.addEventListener('seeked', onSeek);
            videoElement.currentTime = time;
        });
    };

    // --- REFINED STRATEGY FOR IMPLEMENTATION IN REACT CONTEXT ---
    // Instead of a standalone black-box function that controls the video, 
    // it is cleaner if this function is a "Generator" or "Manager" that returns the next timestamp to seek to,
    // and expects the result to be fed back in.
    // BUT the request asks for a "function... to extract automatically".

    // Let's implement a 'smart' version that hijacks the onResults for the duration of the analysis.
    // This requires the poseDetector to support `onResults`.

    return new Promise(async (resolve, reject) => {
        const originalOnResults = poseDetector.onResults; // Save original handler if accessible (MediaPipe internals vary)
        // MediaPipe `pose.onResults` registers a listener. It doesn't return the old one. 
        // We might simply overwrite it and hope to restore it, or create a NEW Pose instance.
        // Creating a new instance is safer to avoid side effects on the live view.

        // ... Wait, creating a new instance is expensive (loading WASM).
        // Let's try to overwrite onResults and restore it.

        const capturedFrames = [];

        poseDetector.onResults((results) => {
            if (!results.poseLandmarks) {
                capturedFrames.push({ time: videoElement.currentTime, pose: 'Unknown', confidence: 0, image: null });
                nextFrame();
                return;
            }

            const classification = classifyPose(results.poseLandmarks);
            let poseName = 'Unknown';
            let confidence = 0;

            if (classification) {
                poseName = classification.name;
                confidence = classification.confidence;
            }

            // Capture Keyframe (DataURL) - Scaling down for performance/memory
            const keyframeCanvas = document.createElement('canvas');
            const kCtx = keyframeCanvas.getContext('2d');
            keyframeCanvas.width = 320; // Thumbnail size
            keyframeCanvas.height = 240;
            kCtx.drawImage(videoElement, 0, 0, keyframeCanvas.width, keyframeCanvas.height);
            const keyframeImage = keyframeCanvas.toDataURL('image/jpeg', 0.7);

            capturedFrames.push({
                time: videoElement.currentTime,
                pose: poseName,
                confidence,
                image: keyframeImage,
                landmarks: results.poseLandmarks // [NEW] Store landmarks for post-analysis
            });

            nextFrame();
        });

        const nextFrame = async () => {
            if (currentTime >= duration) {
                // Done
                finishAnalysis();
                return;
            }

            currentTime += SAMPLE_RATE;
            onProgress(Math.min(Math.round((currentTime / duration) * 100), 100)); // Update progress

            videoElement.currentTime = currentTime;
            // The 'seeked' event logic needs to happen here to trigger the send
        };

        const onSeeked = async () => {
            if (currentTime >= duration) return; // double check
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            await poseDetector.send({ image: canvas });
        };

        videoElement.addEventListener('seeked', onSeeked);

        // Start
        currentTime = 0;
        videoElement.currentTime = 0;

        const finishAnalysis = () => {
            videoElement.removeEventListener('seeked', onSeeked);
            // Restore? We can't easily. The caller should re-bind their live listener.

            // --- POST PROCESSING ---
            const sequence = cleanSequence(capturedFrames);
            const sessionSummary = generateSessionSummary(sequence); // [NEW] Generate Global Summary

            resolve({
                video_name: null,
                posture_sequence: sequence,
                session_summary: sessionSummary // [NEW] Return summary
            });
        };
    });
}

/**
 * Post-processes the raw frame data to create a clean sequence.
 * 1. Merge consecutive same poses.
 * 2. Filter short noise (< 2s).
 * 3. Select best keyframe (highest confidence).
 */
function cleanSequence(rawFrames) {
    if (!rawFrames.length) return [];

    const merged = [];
    let currentSegment = null;

    // 1. Group Consecutive
    rawFrames.forEach(frame => {
        if (!currentSegment) {
            currentSegment = {
                pose: frame.pose,
                start_time: frame.time,
                end_time: frame.time,
                frames: [frame]
            };
        } else if (frame.pose === currentSegment.pose) {
            currentSegment.end_time = frame.time;
            currentSegment.frames.push(frame); // Store to find best keyframe
        } else {
            // Pose changed
            merged.push(currentSegment);
            currentSegment = {
                pose: frame.pose,
                start_time: frame.time,
                end_time: frame.time,
                frames: [frame]
            };
        }
    });
    if (currentSegment) merged.push(currentSegment);

    // 2. Filter & Refine & Analyze Quality
    const cleaned = merged.filter(seg => {
        const duration = seg.end_time - seg.start_time;
        if (seg.pose === 'Unknown' && duration < 3.0) return false;
        if (duration < 1.0) return false;
        return true;
    }).map(seg => {
        // 3. Select Best Keyframe
        let bestFrame = seg.frames[0];
        if (seg.pose !== 'Unknown') {
            bestFrame = seg.frames.reduce((prev, curr) => (curr.confidence > prev.confidence ? curr : prev), seg.frames[0]);
        } else {
            const midIdx = Math.floor(seg.frames.length / 2);
            bestFrame = seg.frames[midIdx];
        }

        // 4. Advanced Quality Analysis (Pilates)
        let qualityReport = { score: {}, feedback: [], level: 'Beginner' };

        if (seg.pose !== 'Unknown') {
            qualityReport = analyzeSegmentQuality(seg.frames, seg.pose, seg.start_time, seg.end_time);
        }

        return {
            pose: seg.pose,
            start_time: formatTime(seg.start_time),
            end_time: formatTime(seg.end_time),
            confidence: bestFrame.confidence,
            key_frame: bestFrame.image,
            duration_sec: (seg.end_time - seg.start_time).toFixed(1),
            ...qualityReport // Spread score, feedback, level
        };
    });

    return cleaned;
}

/**
 * Analyzes quality of a pose segment by aggregating multi-frame data.
 */
// [NEW] Comparison helper
import { evaluatePose } from './poseEvaluator';

function analyzeSegmentQuality(frames, poseName, startTime, endTime) {
    // A. Filter Frames: Remove transitions (first/last 10-15% of duration)
    const duration = endTime - startTime;
    const buffer = Math.min(1.0, duration * 0.15); // max 1s buffer or 15%

    const stableFrames = frames.filter(f =>
        f.time >= (startTime + buffer) &&
        f.time <= (endTime - buffer) &&
        f.confidence > 0.6 // Min confidence threshold
    );

    // If too few frames left, fall back to all frames with decent confidence
    const analysisFrames = stableFrames.length > 2 ? stableFrames : frames.filter(f => f.confidence > 0.5);

    if (analysisFrames.length === 0) {
        return { score: { 'Reliability': 0 }, feedback: ['Pose detected but visibility too low for analysis.'], level: 'N/A' };
    }

    // B. Run Evaluation on each frame
    const evaluations = analysisFrames.map(f => {
        if (!f.landmarks) return null;
        return evaluatePose(f.landmarks, poseName);
    }).filter(e => e !== null);

    if (evaluations.length === 0) return { score: {}, feedback: [], level: 'Unknown' };

    // C. Aggregate Scores (Mean per indicator)
    // evaluations[i].indicators = { Alignment: 80, Stability: 90, ... }
    const scoreSums = {};
    const scoreCounts = {};
    const allFeedback = [];

    evaluations.forEach(ev => {
        Object.keys(ev.indicators).forEach(key => {
            if (!scoreSums[key]) { scoreSums[key] = 0; scoreCounts[key] = 0; }
            scoreSums[key] += ev.indicators[key];
            scoreCounts[key]++;
        });
        if (ev.feedback) allFeedback.push(...ev.feedback);
    });

    const finalScores = {};
    Object.keys(scoreSums).forEach(key => {
        finalScores[key] = Math.round(scoreSums[key] / scoreCounts[key]);
    });

    // D. Aggregate Feedback (Deduplicate & limit)
    // Simple dedupe
    const uniqueFeedback = [...new Set(allFeedback)];
    // Limit to top 3? Or return all? 
    // The prompt asks for "Feedback textuel agrégé".

    // E. Determine Level based on Global Score
    // Calculate global mean
    const scoreValues = Object.values(finalScores);
    const globalMean = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

    let level = 'Beginner';
    if (globalMean > 85) level = 'Advanced';
    else if (globalMean > 70) level = 'Intermediate';

    return {
        score: finalScores,
        feedback: uniqueFeedback.slice(0, 4), // Limit to 4 items
        level: level,
        global_score: Math.round(globalMean)
    };
}

/**
 * Generates a global session summary from the sequence data.
 */
import { getSessionRecommendation } from './recommendationEngine';

function generateSessionSummary(sequenceData) {
    if (!sequenceData || sequenceData.length === 0) return null;

    // 1. Accumulate Scores
    const globalScores = {};
    const globalCounts = {};
    const poseScores = []; // { name, score, id }

    sequenceData.forEach(item => {
        if (!item.score) return;

        // Track per-pose score for ranking
        const itemMean = Object.values(item.score).reduce((a, b) => a + b, 0) / Object.values(item.score).length || 0;
        poseScores.push({ name: item.pose, score: itemMean });

        // Accumulate global
        Object.entries(item.score).forEach(([key, val]) => {
            if (!globalScores[key]) { globalScores[key] = 0; globalCounts[key] = 0; }
            globalScores[key] += val;
            globalCounts[key]++;
        });
    });

    // 2. Average Global Scores
    const averagedScores = {};
    Object.keys(globalScores).forEach(key => {
        averagedScores[key] = Math.round(globalScores[key] / globalCounts[key]);
    });

    // 3. Find Weakest Link
    let minScore = 101;
    let weakestIndicator = null;
    Object.entries(averagedScores).forEach(([key, val]) => {
        if (val < minScore) {
            minScore = val;
            weakestIndicator = key;
        }
    });

    // 4. Rank Poses
    poseScores.sort((a, b) => b.score - a.score);
    const bestPoses = poseScores.slice(0, 3);
    const worstPoses = poseScores.slice(-3).reverse(); // Worst first

    // 5. Generate Feedback Text
    const globalMean = Object.values(averagedScores).reduce((a, b) => a + b, 0) / Object.values(averagedScores).length || 0;

    let feedbackText = `Level: ${globalMean > 85 ? 'Advanced' : globalMean > 70 ? 'Intermediate' : 'Beginner'} (${Math.round(globalMean)}/100). `;
    if (minScore > 80) feedbackText += "Excellent session! Your form is very consistent.";
    else if (minScore > 60) feedbackText += `Good effort. Focus on improving your ${weakestIndicator} to reach the next level.`;
    else feedbackText += `Keep practicing. Your ${weakestIndicator} needs significant attention.`;

    // 6. Get Recommendation
    const recommendation = getSessionRecommendation(weakestIndicator);

    return {
        scores: averagedScores,
        weakestIndicator,
        bestPoses,
        worstPoses,
        feedback: feedbackText,
        recommendation,
        totalPoses: sequenceData.length,
        globalScore: Math.round(globalMean)
    };
}

