import { PoseClassifier } from './poseClassifier';
import { evaluatePose } from './poseEvaluator';
import { getSessionRecommendation } from './recommendationEngine';

/**
 * ═══════════════════════════════════════════════════════════════
 *  Pilates Video Sequence Analyzer
 *  Clean pipeline: Extract → Classify → Group → Clean → Score → Summarize
 * ═══════════════════════════════════════════════════════════════
 */

const SAMPLE_RATE = 0.5;            // Seconds between frames
const MIN_SEGMENT_DURATION = 2.0;   // Ignore segments shorter than 2s
const MERGE_GAP = 1.5;             // Merge identical segments within 1.5s
const TRANSITION_BUFFER_RATIO = 0.15; // Trim 15% of start/end of each segment
const BEST_FRAME_RATIO = 0.70;     // Keep top 70% of frames by confidence
const THUMBNAIL_W = 320;
const THUMBNAIL_H = 240;

// ─── MAIN ENTRY POINT ───────────────────────────────────────

/**
 * Analyzes a complete video to extract Pilates exercise sequence.
 * @param {HTMLVideoElement} video - The video element
 * @param {Object} poseDetector - Initialized MediaPipe Pose instance
 * @param {Function} onProgress - Callback (0-100)
 * @returns {Promise<Object>} Structured JSON result
 */
export async function analyzeVideoSequence(video, poseDetector, onProgress) {
    if (!video || !poseDetector) throw new Error('Missing video or detector');
    const duration = video.duration;
    if (!duration || isNaN(duration)) throw new Error('Video duration unknown');

    // Phase 1: Extract frames
    const rawFrames = await extractFrames(video, poseDetector, duration, onProgress);

    // Phase 2: Classify each frame
    const classifiedFrames = classifyFrames(rawFrames);

    // Phase 3: Group into temporal segments
    const segments = groupIntoSegments(classifiedFrames);

    // Phase 4: Clean & filter
    const cleanedSegments = cleanSegments(segments);

    // Phase 5: Quality analysis (Apex + Dynamic Metrics)
    const scoredSequence = analyzeSegments(cleanedSegments);

    // Phase 6: Session summary
    const sessionSummary = generateSessionSummary(scoredSequence);

    return {
        video_name: null,
        posture_sequence: scoredSequence,
        session_summary: sessionSummary
    };
}

// ─── PHASE 1: FRAME EXTRACTION ──────────────────────────────

async function extractFrames(video, detector, duration, onProgress) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const frames = [];
    let time = 0;

    // Wrap the seek + detect loop in a Promise
    return new Promise((resolve, reject) => {
        let frameTimeout = null;

        // Intercept MediaPipe results for each frame
        detector.onResults((results) => {
            if (frameTimeout) clearTimeout(frameTimeout);

            if (!results.poseLandmarks) {
                // No body detected — skip this frame
                advance();
                return;
            }

            // Capture thumbnail
            const thumbCanvas = document.createElement('canvas');
            const tCtx = thumbCanvas.getContext('2d');
            thumbCanvas.width = THUMBNAIL_W;
            thumbCanvas.height = THUMBNAIL_H;
            tCtx.drawImage(video, 0, 0, THUMBNAIL_W, THUMBNAIL_H);
            const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);

            // Average visibility across all landmarks
            const avgVisibility = results.poseLandmarks.reduce((s, lm) => s + (lm.visibility || 0), 0) / results.poseLandmarks.length;

            frames.push({
                time: video.currentTime,
                landmarks: results.poseLandmarks,
                visibility: avgVisibility,
                thumbnail
            });

            advance();
        });

        const advance = () => {
            time += SAMPLE_RATE;
            onProgress(Math.min(Math.round((time / duration) * 100), 100));

            if (time >= duration) {
                video.removeEventListener('seeked', onSeeked);
                resolve(frames);
                return;
            }

            // Safety timeout (3s per frame)
            frameTimeout = setTimeout(() => {
                console.warn(`Frame at ${time}s timed out, skipping`);
                advance();
            }, 3000);

            video.currentTime = time;
        };

        const onSeeked = async () => {
            if (time > duration) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            await detector.send({ image: canvas });
        };

        video.addEventListener('seeked', onSeeked);

        // Start
        time = 0;
        video.currentTime = 0;
    });
}

// ─── PHASE 2: CLASSIFICATION ────────────────────────────────

function classifyFrames(rawFrames) {
    const classifier = new PoseClassifier(); // Fresh instance = clean buffer

    return rawFrames.map(frame => {
        const result = classifier.classify(frame.landmarks);
        return {
            ...frame,
            pose: result.name,
            score: result.score,
            isSteady: result.isSteady
        };
    });
}

// ─── PHASE 3: TEMPORAL GROUPING ─────────────────────────────

function groupIntoSegments(frames) {
    if (!frames.length) return [];

    const segments = [];
    let current = {
        pose: frames[0].pose,
        startTime: frames[0].time,
        endTime: frames[0].time,
        frames: [frames[0]]
    };

    for (let i = 1; i < frames.length; i++) {
        const f = frames[i];
        if (f.pose === current.pose) {
            current.endTime = f.time;
            current.frames.push(f);
        } else {
            segments.push(current);
            current = {
                pose: f.pose,
                startTime: f.time,
                endTime: f.time,
                frames: [f]
            };
        }
    }
    segments.push(current);
    return segments;
}

// ─── PHASE 4: CLEANUP & FILTERING ──────────────────────────

function cleanSegments(segments) {
    // Step 1: Remove "Unknown" segments
    let cleaned = segments.filter(s => s.pose !== 'Unknown');

    // Step 2: Remove segments shorter than MIN_SEGMENT_DURATION
    cleaned = cleaned.filter(s => (s.endTime - s.startTime) >= MIN_SEGMENT_DURATION);

    // Step 3: Merge nearby identical segments (separated by a short gap)
    const merged = [];
    for (const seg of cleaned) {
        const prev = merged[merged.length - 1];
        if (prev && prev.pose === seg.pose && (seg.startTime - prev.endTime) < MERGE_GAP) {
            // Merge
            prev.endTime = seg.endTime;
            prev.frames = prev.frames.concat(seg.frames);
        } else {
            merged.push({ ...seg });
        }
    }

    return merged;
}

// ─── PHASE 5: QUALITY ANALYSIS ──────────────────────────────

function analyzeSegments(segments) {
    return segments.map(seg => analyzeOneSegment(seg));
}

function analyzeOneSegment(segment) {
    const { pose, startTime, endTime, frames } = segment;
    const duration = endTime - startTime;

    // ── A. Trim transition frames (first/last 15%, max 1s) ──
    const buffer = Math.min(1.0, duration * TRANSITION_BUFFER_RATIO);
    const stableFrames = frames.filter(f =>
        f.time >= (startTime + buffer) &&
        f.time <= (endTime - buffer) &&
        f.visibility > 0.4
    );
    const pool = stableFrames.length > 2 ? stableFrames : frames.filter(f => f.visibility > 0.3);

    if (pool.length === 0) {
        return buildEmptyResult(pose, startTime, endTime, duration, frames);
    }

    // ── B. Select best N frames (top 70% by visibility) ──
    const sorted = [...pool].sort((a, b) => b.visibility - a.visibility);
    const keepCount = Math.max(2, Math.ceil(sorted.length * BEST_FRAME_RATIO));
    const bestFrames = sorted.slice(0, keepCount);

    // ── C. Evaluate each best frame ──
    const evaluations = bestFrames.map(f => {
        if (!f.landmarks) return null;
        const ev = evaluatePose(f.landmarks, pose);
        if (ev) {
            ev._time = f.time;
            ev._thumbnail = f.thumbnail;
        }
        return ev;
    }).filter(Boolean);

    if (evaluations.length === 0) {
        return buildEmptyResult(pose, startTime, endTime, duration, frames);
    }

    // ── D. Apex Detection (highest globalScore) ──
    let apex = evaluations[0];
    for (const ev of evaluations) {
        if (ev.globalScore > apex.globalScore) apex = ev;
    }

    // ── E. Aggregated scores (mean across best frames) ──
    const indicatorKeys = Object.keys(apex.indicators);
    const avgScores = {};
    for (const key of indicatorKeys) {
        const sum = evaluations.reduce((s, e) => s + (e.indicators[key] || 0), 0);
        avgScores[key] = Math.round(sum / evaluations.length);
    }

    // ── F. Find best confidence frame for key_frame ──
    const bestConfFrame = frames.reduce((best, f) => f.score > best.score ? f : best, frames[0]);

    // ── G. Dynamic Metrics (whole segment, not just best frames) ──
    const dynamicMetrics = calculateDynamicMetrics(pool, evaluations);

    // ── H. Aggregate feedback (unique) ──
    const allFeedback = evaluations.flatMap(e => e.feedback || []);
    const uniqueFeedback = [...new Set(allFeedback)].slice(0, 4);

    // ── I. Final level ──
    const globalScore = apex.globalScore;
    let level = 'Beginner';
    if (globalScore > 85) level = 'Advanced';
    else if (globalScore > 70) level = 'Intermediate';

    return {
        pose,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        duration_sec: duration.toFixed(1),
        confidence: bestConfFrame.score || 0,
        key_frame: apex._thumbnail || bestConfFrame.thumbnail,
        global_score: Math.round(globalScore),
        level,
        detected_variant: apex.detectedVariant || null,
        score: avgScores,
        feedback: uniqueFeedback,
        apex_timestamp: apex._time,
        dynamic_metrics: dynamicMetrics
    };
}

function buildEmptyResult(pose, startTime, endTime, duration, frames) {
    const bestFrame = frames[0];
    return {
        pose,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        duration_sec: duration.toFixed(1),
        confidence: 0,
        key_frame: bestFrame ? bestFrame.thumbnail : null,
        global_score: 0,
        level: 'N/A',
        detected_variant: null,
        score: {},
        feedback: ['Visibility too low for quality analysis.'],
        apex_timestamp: null,
        dynamic_metrics: { stability: 0, endurance: 0, fluidity: 0 }
    };
}

// ─── DYNAMIC METRICS ────────────────────────────────────────

function calculateDynamicMetrics(frames, evaluations) {
    // 1. Stability: Variance of Powerhouse center (landmarks 11,12,23,24)
    const boxCenters = frames
        .filter(f => f.landmarks && f.landmarks[11] && f.landmarks[24])
        .map(f => {
            const ls = f.landmarks[11], rs = f.landmarks[12];
            const lh = f.landmarks[23], rh = f.landmarks[24];
            return {
                x: (ls.x + rs.x + lh.x + rh.x) / 4,
                y: (ls.y + rs.y + lh.y + rh.y) / 4
            };
        });

    let stabilityScore = 100;
    if (boxCenters.length > 1) {
        const varX = variance(boxCenters.map(p => p.x));
        const varY = variance(boxCenters.map(p => p.y));
        stabilityScore = Math.max(0, 100 - ((varX + varY) * 20000));
    }

    // 2. Endurance: Score drop from first 30% to last 30%
    let enduranceScore = 100;
    if (evaluations.length > 3) {
        const split = Math.floor(evaluations.length * 0.3);
        const avg = (arr) => arr.reduce((s, e) => s + e.globalScore, 0) / arr.length;
        const drop = avg(evaluations.slice(0, split)) - avg(evaluations.slice(-split));
        enduranceScore = drop > 0 ? Math.max(0, 100 - (drop * 2)) : 100;
    }

    // 3. Fluidity: Jerk analysis on hip center
    let fluidityScore = 100;
    const hipPoints = frames
        .filter(f => f.landmarks && f.landmarks[23] && f.landmarks[24])
        .map(f => ({
            x: (f.landmarks[23].x + f.landmarks[24].x) / 2,
            y: (f.landmarks[23].y + f.landmarks[24].y) / 2,
            t: f.time
        }));

    if (hipPoints.length >= 3) {
        let totalJerk = 0;
        for (let i = 2; i < hipPoints.length; i++) {
            const v1x = hipPoints[i - 1].x - hipPoints[i - 2].x;
            const v1y = hipPoints[i - 1].y - hipPoints[i - 2].y;
            const v2x = hipPoints[i].x - hipPoints[i - 1].x;
            const v2y = hipPoints[i].y - hipPoints[i - 1].y;
            const jerk = Math.sqrt((v2x - v1x) ** 2 + (v2y - v1y) ** 2);
            totalJerk += jerk;
        }
        const avgJerk = totalJerk / (hipPoints.length - 2);
        fluidityScore = Math.max(0, 100 - (avgJerk * 5000));
    }

    return {
        stability: Math.round(stabilityScore),
        endurance: Math.round(enduranceScore),
        fluidity: Math.round(fluidityScore)
    };
}

// ─── PHASE 6: SESSION SUMMARY ───────────────────────────────

function generateSessionSummary(sequence) {
    if (!sequence || sequence.length === 0) {
        return {
            globalScore: 0,
            totalPoses: 0,
            level: 'Beginner',
            feedback: 'No poses were successfully analyzed. Ensure you are fully visible in the frame.',
            weakestIndicator: 'Visibility',
            advancedMetrics: { consistency: 0, stability: 0, endurance: 0, fluidity: 0 },
            bestPoses: [],
            worstPoses: []
        };
    }

    // Accumulate scores
    const globalScores = {};
    const globalCounts = {};
    const poseScores = [];
    const consistencyMap = {};

    sequence.forEach(item => {
        if (!item.score || Object.keys(item.score).length === 0) return;

        const mean = Object.values(item.score).reduce((a, b) => a + b, 0) / Object.values(item.score).length || 0;
        poseScores.push({ name: item.pose, score: mean });

        if (!consistencyMap[item.pose]) consistencyMap[item.pose] = [];
        consistencyMap[item.pose].push(mean);

        Object.entries(item.score).forEach(([key, val]) => {
            if (!globalScores[key]) { globalScores[key] = 0; globalCounts[key] = 0; }
            globalScores[key] += val;
            globalCounts[key]++;
        });
    });

    // Average global scores
    const avgScores = {};
    Object.keys(globalScores).forEach(key => {
        avgScores[key] = Math.round(globalScores[key] / globalCounts[key]);
    });

    // Weakest indicator
    let minScore = 101, weakestIndicator = null;
    Object.entries(avgScores).forEach(([key, val]) => {
        if (val < minScore) { minScore = val; weakestIndicator = key; }
    });

    // Rank poses
    poseScores.sort((a, b) => b.score - a.score);
    const bestPoses = poseScores.slice(0, 3);
    const worstPoses = poseScores.slice(-3).reverse();

    // Global mean
    const globalMean = Object.values(avgScores).length > 0
        ? Object.values(avgScores).reduce((a, b) => a + b, 0) / Object.values(avgScores).length
        : 0;

    // Feedback
    let feedbackText = `Level: ${globalMean > 85 ? 'Advanced' : globalMean > 70 ? 'Intermediate' : 'Beginner'} (${Math.round(globalMean)}/100). `;
    if (minScore > 80) feedbackText += 'Excellent session! Your form is very consistent.';
    else if (minScore > 60) feedbackText += `Good effort. Focus on improving your ${weakestIndicator} to reach the next level.`;
    else feedbackText += `Keep practicing. Your ${weakestIndicator} needs significant attention.`;

    // Recommendation
    const recommendation = getSessionRecommendation(weakestIndicator);

    // Consistency: StdDev of repeated poses
    let totalConsistency = 0, consistencyCount = 0;
    Object.values(consistencyMap).forEach(scores => {
        if (scores.length > 1) {
            const stdDev = Math.sqrt(variance(scores));
            totalConsistency += Math.max(0, 100 - (stdDev * 5));
            consistencyCount++;
        }
    });
    const consistency = consistencyCount > 0 ? Math.round(totalConsistency / consistencyCount) : 100;

    // Aggregate dynamic metrics
    let totalStab = 0, totalEnd = 0, totalFluid = 0, dynCount = 0;
    sequence.forEach(item => {
        if (item.dynamic_metrics) {
            totalStab += item.dynamic_metrics.stability;
            totalEnd += item.dynamic_metrics.endurance;
            totalFluid += item.dynamic_metrics.fluidity;
            dynCount++;
        }
    });

    return {
        scores: avgScores,
        weakestIndicator,
        bestPoses,
        worstPoses,
        feedback: feedbackText,
        recommendation,
        totalPoses: sequence.length,
        globalScore: Math.round(globalMean),
        advancedMetrics: {
            consistency,
            stability: dynCount ? Math.round(totalStab / dynCount) : 0,
            endurance: dynCount ? Math.round(totalEnd / dynCount) : 0,
            fluidity: dynCount ? Math.round(totalFluid / dynCount) : 0
        }
    };
}

// ─── HELPERS ────────────────────────────────────────────────

function variance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
