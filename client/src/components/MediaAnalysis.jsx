import { getRecommendation } from '../utils/recommendationEngine';
// ... imports

// ... inside component
const [recommendation, setRecommendation] = useState(null);

// ... inside onResults
if (classification && classification.name !== 'Unknown') {
    const evaluation = evaluatePose(results.poseLandmarks, classification.name);
    setDashboardData(evaluation);

    // Get Recommendation
    const rec = getRecommendation(evaluation.pose, evaluation.radarData, evaluation.level);
    setRecommendation(rec);
}

// ... inside JSX sidebar
<div style={{ marginTop: '20px' }}>
    <h3 style={{ color: '#aaa', fontSize: '14px', textTransform: 'uppercase' }}>Performance Analysis</h3>
    <FeedbackRadar data={dashboardData.radarData} />
</div>

{
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
