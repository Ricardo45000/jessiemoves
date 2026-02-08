import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { classifyPose } from '../utils/poseClassifier';
import { evaluatePose } from '../utils/poseEvaluator';
import { getRecommendation } from '../utils/recommendationEngine';
import FeedbackRadar from './FeedbackRadar';
import ScoreCard from './ScoreCard';

const MediaAnalysis = ({ fileUrl, type, onBack }) => {
    const mediaRef = useRef(null); // img or video element
    const canvasRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

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

            {/* Main Content Area */}
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
        </div>
    );
};

export default MediaAnalysis;
