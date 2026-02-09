import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { classifyPose } from '../utils/poseClassifier';
import { evaluatePose } from '../utils/poseEvaluator';
import { getRecommendation } from '../utils/recommendationEngine';
import { analyzeVideoSequence } from '../utils/videoSequenceAnalyzer';   // [NEW]
import FeedbackRadar from './FeedbackRadar';
import ScoreCard from './ScoreCard';

const MediaAnalysis = ({ fileUrl, type, onBack }) => {
    const mediaRef = useRef(null); // img or video element
    const canvasRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Sequence Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [sequenceData, setSequenceData] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null); // [NEW]

    // New State for Dashboard
    const [dashboardData, setDashboardData] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);

        const processFrame = async () => {
            if (mediaRef.current && canvasRef.current) {
                // Adjust canvas to match media dimensions
                const media = mediaRef.current;

                if (media.videoWidth) { // It's a video
                    canvasRef.current.width = media.videoWidth;
                    canvasRef.current.height = media.videoHeight;
                } else if (media.naturalWidth) { // It's an image
                    canvasRef.current.width = media.naturalWidth;
                    canvasRef.current.height = media.naturalHeight;
                }

                await pose.send({ image: media });

                if (type === 'video' && !media.paused && !media.ended) {
                    requestAnimationFrame(processFrame);
                }
            }
        };

        if (type === 'image') {
            const img = mediaRef.current;
            if (img) {
                if (img.complete) {
                    processFrame();
                } else {
                    img.onload = processFrame;
                }
            }
        } else if (type === 'video') {
            const vid = mediaRef.current;
            if (vid) {
                vid.onloadeddata = () => {
                    setIsLoaded(true);
                    // Loop processFrame when playing
                    vid.addEventListener('play', () => {
                        const loop = async () => {
                            if (!vid.paused && !vid.ended) {
                                await processFrame();
                                requestAnimationFrame(loop);
                            }
                        };
                        loop();
                    });
                };
            }
        }

        return () => {
            pose.close();
        };
    }, [fileUrl, type]);

    const onResults = (results) => {
        if (!canvasRef.current || !mediaRef.current) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 4,
            });
            drawLandmarks(canvasCtx, results.poseLandmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 3,
            });

            // Analyze and Log
            const classification = classifyPose(results.poseLandmarks);

            if (classification && classification.name !== 'Unknown') {
                const evaluation = evaluatePose(results.poseLandmarks, classification.name);
                setDashboardData(evaluation); // Update React State for Side Panel

                // Get Recommendation
                if (evaluation) {
                    const rec = getRecommendation(evaluation.pose, evaluation.radarData, evaluation.level);
                    setRecommendation(rec);
                }
            }
        }

        canvasCtx.restore();
    };

    // [NEW] Trigger Full Sequence Analysis
    const handleAnalyzeSequence = async () => {
        if (!mediaRef.current || type !== 'video') return;

        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setSequenceData(null);

        // Pause live loop
        mediaRef.current.pause();

        try {
            const pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                },
            });
            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
            await pose.initialize();

            const result = await analyzeVideoSequence(mediaRef.current, pose, (progress) => {
                setAnalysisProgress(progress);
            });

            setSequenceData(result.posture_sequence);
            setSessionSummary(result.session_summary); // [NEW]
            pose.close();

        } catch (err) {
            console.error("Sequence Analysis Failed:", err);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="media-analysis-container" style={{ position: 'relative', width: '100%', height: '100vh', background: '#222', display: 'flex', flexDirection: 'row' }}>

            {/* Sidebar Dashboard */}
            <div style={{ width: '350px', background: '#111', height: '100vh', padding: '20px', boxSizing: 'border-box', overflowY: 'auto', borderRight: '1px solid #333' }}>
                <button
                    onClick={onBack}
                    style={{
                        marginBottom: '20px', width: '100%', padding: '10px', background: '#444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px'
                    }}>
                    ← Back to Upload
                </button>

                {dashboardData ? (
                    <>
                        <h2 style={{ color: 'white', textAlign: 'center' }}>{dashboardData.pose}</h2>
                        <ScoreCard
                            score={dashboardData.globalScore}
                            level={dashboardData.level}
                            tip={dashboardData.prioritizedTip}
                        />

                        {/* [NEW] Sequence Analysis Button & Results */}
                        {type === 'video' && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                                {!sequenceData ? (
                                    <button
                                        onClick={handleAnalyzeSequence}
                                        disabled={isAnalyzing}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: isAnalyzing ? '#444' : 'linear-gradient(90deg, #ff4081, #f50057)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: isAnalyzing ? 'wait' : 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {isAnalyzing ? `Analyzing... ${analysisProgress}%` : 'Generate Full Session Report 📊'}
                                    </button>
                                ) : (
                                ): (
                                        <div>
                                        {/* [NEW] Session Summary Card */ }
                                        {
                                    sessionSummary && (
                                        <div style={{ background: '#1a1a2e', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
                                            <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                                                Session Report 📋
                                            </h3>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{sessionSummary.globalScore}</div>
                                                    <div style={{ fontSize: '10px', color: '#aaa' }}>Global Score</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '12px', color: '#fff' }}>{sessionSummary.totalPoses}</div>
                                                    <div style={{ fontSize: '10px', color: '#aaa' }}>Poses Analyzed</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '12px', color: '#ff9800' }}>{sessionSummary.weakestIndicator || 'None'}</div>
                                                    <div style={{ fontSize: '10px', color: '#aaa' }}>Main Focus</div>
                                                </div>
                                            </div>

                                            <p style={{ color: '#ccc', fontSize: '12px', fontStyle: 'italic', marginBottom: '15px' }}>
                                                "{sessionSummary.feedback}"
                                            </p>

                                            {/* Recommendation */}
                                            {sessionSummary.recommendation && (
                                                <div style={{ background: '#333', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #e91e63', marginBottom: '15px' }}>
                                                    <div style={{ fontSize: '10px', color: '#ff4081', fontWeight: 'bold', textTransform: 'uppercase' }}>Recommended for you</div>
                                                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{sessionSummary.recommendation.title}</div>
                                                    <div style={{ color: '#bbb', fontSize: '11px', marginTop: '2px' }}>{sessionSummary.recommendation.description}</div>
                                                    <a href={sessionSummary.recommendation.media} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '5px', fontSize: '11px', color: '#2196f3', textDecoration: 'none' }}>► Watch Tutorial</a>
                                                </div>
                                            )}

                                            {/* [NEW] Advanced Metrics Bars */}
                                            {sessionSummary.advancedMetrics && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                    {Object.entries(sessionSummary.advancedMetrics).map(([key, val]) => (
                                                        <div key={key}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                                <span style={{ color: '#aaa', fontSize: '10px', textTransform: 'capitalize' }}>{key}</span>
                                                                <span style={{ color: '#fff', fontSize: '10px' }}>{val}%</span>
                                                            </div>
                                                            <div style={{ height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', width: `${val}%`, background: val > 80 ? '#4caf50' : val > 60 ? '#ff9800' : '#f44336' }}></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                        <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '10px' }}>Session Timeline</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {sequenceData.map((item, idx) => (
                                        <div key={idx} style={{ background: '#222', padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'flex-start', borderBottom: '1px solid #333' }}>
                                            <div style={{ position: 'relative' }}>
                                                <img src={item.key_frame} alt="Keyframe" style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '6px' }} />
                                                <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '3px' }}>
                                                    {item.duration_sec}s
                                                </div>
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ color: '#2196f3', fontSize: '15px', fontWeight: 'bold' }}>{item.pose}</div>
                                                    {item.level && (
                                                        <div style={{
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            background: item.level === 'Advanced' ? '#4caf50' : item.level === 'Intermediate' ? '#ff9800' : '#2196f3',
                                                            color: '#fff'
                                                        }}>
                                                            {item.level} ({item.global_score || 0})
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>{item.start_time} - {item.end_time}</div>

                                                {/* Feedback Section */}
                                                {item.feedback && item.feedback.length > 0 && (
                                                    <div style={{ marginTop: '8px', padding: '8px', background: '#333', borderRadius: '4px' }}>
                                                        <div style={{ color: '#aaa', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}>Review</div>
                                                        <ul style={{ margin: 0, paddingLeft: '15px', color: '#ccc', fontSize: '12px' }}>
                                                            {item.feedback.map((fb, fidx) => (
                                                                <li key={fidx}>{fb}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Score Identifiers */}
                                                {item.score && (
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                                        {Object.entries(item.score).map(([key, val]) => (
                                                            <div key={key} style={{ fontSize: '10px', color: '#888', background: '#222', border: '1px solid #444', padding: '2px 6px', borderRadius: '3px' }}>
                                                                {key}: <span style={{ color: val > 80 ? '#4caf50' : '#ff9800' }}>{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setSequenceData(null)}
                                    style={{ marginTop: '10px', width: '100%', padding: '8px', background: '#333', color: '#aaa', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    Reset Analysis
                                </button>
                            </div>
                        )}
                    </div>
                        )}

                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ color: '#aaa', fontSize: '14px', textTransform: 'uppercase' }}>Performance Analysis</h3>
                    <FeedbackRadar data={dashboardData.radarData} />
                </div>

                {recommendation && (
                    <div style={{ marginTop: '20px', background: '#222', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #6a11cb' }}>
                        <h3 style={{ color: 'white', marginTop: 0, fontSize: '16px' }}>Recommended for You</h3>
                        <p style={{ color: '#ccc', fontSize: '13px', margin: '5px 0' }}>{recommendation.reason}</p>
                        <div style={{ marginTop: '10px' }}>
                            <h4 style={{ color: '#fff', fontSize: '14px', margin: '0 0 5px 0' }}>{recommendation.title}</h4>
                            <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{recommendation.description}</p>
                            {recommendation.media && (
                                <a href={recommendation.media} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#6a11cb', fontSize: '13px', textDecoration: 'none' }}>
                                    ▶ Watch Video
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </>
            ) : (
            <div style={{ color: '#666', marginTop: '50px', textAlign: 'center' }}>
                Waiting for pose detection...
            </div>
                )}
        </div>

            {/* Main Content Area */ }
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', background: '#000' }}>
        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90vh' }}>
            {type === 'image' ? (
                <img ref={mediaRef} src={fileUrl} alt="Analysis Target" style={{ maxWidth: '100%', maxHeight: '90vh', display: 'block' }} />
            ) : (
                <video ref={mediaRef} src={fileUrl} controls style={{ maxWidth: '100%', maxHeight: '90vh', display: 'block' }} />
            )}

            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'
                }}
            />
        </div>
    </div>
        </div >
    );
};

export default MediaAnalysis;
