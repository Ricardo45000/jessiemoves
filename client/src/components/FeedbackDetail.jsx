import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

const FeedbackDetail = ({ session, onClose }) => {
    // If no session is selected, don't render anything
    if (!session) return null;

    // Transform indicators for Radar Chart
    // Expected indicators: { Alignment: 80, Stability: 70, Symmetry: 90 }
    // We map keys of the indicators object to the format required by Recharts RadarChart
    const radarData = session.indicators ? Object.keys(session.indicators).map(key => ({
        subject: key,
        A: session.indicators[key],
        fullMark: 100
    })) : [];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a',
                padding: '30px',
                borderRadius: '15px',
                border: '1px solid #333',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: '#aaa',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px', color: '#fff' }}>
                    Session Analysis: <span style={{ color: '#ff4081', fontSize: '0.9em' }}>{session.pose}</span>
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <p style={{ color: '#aaa', margin: 0 }}>Date</p>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p style={{ color: '#aaa', margin: 0 }}>Score</p>
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: session.score >= 80 ? '#4caf50' : session.score >= 60 ? '#ffc107' : '#f44336'
                        }}>
                            {session.score}
                        </span>
                    </div>
                </div>

                {/* Radar Chart */}
                {radarData.length > 0 ? (
                    <div style={{ width: '100%', height: '300px', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="#2196f3"
                                    fill="#2196f3"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No detailed metrics available for this session.
                    </div>
                )}

                {/* Text Feedback */}
                <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2196f3' }}>Coach Feedback</h4>
                    <p style={{ lineHeight: '1.5', color: '#ddd' }}>
                        {Array.isArray(session.feedback) ? session.feedback.join('. ') : (session.feedback || 'No feedback available.')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDetail;
