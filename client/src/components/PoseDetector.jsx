import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { classifyPose } from '../utils/poseClassifier';
import { evaluatePose } from '../utils/poseEvaluator';

const PoseDetector = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [detectedPose, setDetectedPose] = useState(null);
    const [poseFeedback, setPoseFeedback] = useState(null);

    // Initialize Pose on mount using CDN-loaded globals
    useEffect(() => {
        const { Pose, POSE_CONNECTIONS } = window;
        const { Camera } = window;
        const { drawConnectors, drawLandmarks } = window;

        if (!Pose || !Camera) {
            console.error('MediaPipe not loaded. Ensure CDN scripts are in index.html.');
            return;
        }

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

        pose.onResults((results) => onResults(results, drawConnectors, drawLandmarks, POSE_CONNECTIONS));

        if (
            typeof webcamRef.current !== 'undefined' &&
            webcamRef.current !== null
        ) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (webcamRef.current && webcamRef.current.video) {
                        await pose.send({ image: webcamRef.current.video });
                    }
                },
                width: 1280,
                height: 720,
            });
            camera.start();
            setCameraActive(true);
        }
    }, []);

    const onResults = (results, drawConnectors, drawLandmarks, POSE_CONNECTIONS) => {
        if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // 0. Always Draw Skeleton First (Resilience)
        if (results.poseLandmarks) {
            try {
                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 4,
                });
                drawLandmarks(canvasCtx, results.poseLandmarks, {
                    color: '#FF0000',
                    lineWidth: 2,
                    radius: 3,
                });
            } catch (e) {
                console.error("Drawing error:", e);
            }

            // 1. Classify Pose
            let poseAnalysis = null;
            try {
                poseAnalysis = classifyPose(results.poseLandmarks);
            } catch (error) {
                console.error("Classification Error:", error);
            }

            setDetectedPose(poseAnalysis);

            let currentFeedback = null;

            // Use rawName for feedback/radar if available, so we see it during 'Entering'
            const poseNameForEval = poseAnalysis ? (poseAnalysis.rawName || poseAnalysis.name) : null;

            if (poseNameForEval && poseNameForEval !== 'Unknown') {
                // 2. Evaluate Pose Quality
                currentFeedback = evaluatePose(results.poseLandmarks, poseNameForEval);
                setPoseFeedback(currentFeedback);

                // Draw Text Overlay
                canvasCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
                canvasCtx.fillRect(0, 0, 400, 250); // Background for text

                canvasCtx.font = "bold 40px Arial";
                canvasCtx.fillStyle = "#00FF00";
                canvasCtx.fillText(poseAnalysis ? poseAnalysis.name : poseNameForEval, 20, 50);

                canvasCtx.font = "20px Arial";
                canvasCtx.fillStyle = "white";
                canvasCtx.fillText(`Confidence: ${(poseAnalysis ? poseAnalysis.score * 100 : 0).toFixed(0)}%`, 20, 80);

                if (currentFeedback) {
                    // Draw Indicators
                    let yPos = 120;
                    Object.entries(currentFeedback.indicators).forEach(([key, value]) => {
                        canvasCtx.fillStyle = "#AAAAAA";
                        canvasCtx.fillText(`${key}: ${value.toFixed(0)}%`, 20, yPos);

                        // Simple bar
                        canvasCtx.fillStyle = "white";
                        canvasCtx.fillRect(150, yPos - 15, value, 10);
                        yPos += 30;
                    });

                    // Draw Feedback Messages
                    yPos += 10;
                    canvasCtx.fillStyle = "#FFFF00";
                    currentFeedback.feedback.forEach(msg => {
                        canvasCtx.fillText(`• ${msg}`, 20, yPos);
                        yPos += 30;
                    });
                }
            }
        }

        canvasCtx.restore();
    };

    return (
        <div className="pose-container" style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000' }}>
            <Webcam
                ref={webcamRef}
                style={{
                    position: 'absolute',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 9,
                    width: 1280,
                    height: 720,
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 9,
                    width: 1280,
                    height: 720,
                }}
            />
            {!cameraActive && <div style={{ position: 'absolute', color: 'white', zIndex: 10 }}>Initializing Camera & Model...</div>}
        </div>
    );
};

export default PoseDetector;
