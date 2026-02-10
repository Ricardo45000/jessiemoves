import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

const FeedbackDetail = ({ session, onClose }) => {
    if (!session) return null;

    const radarData = session.indicators ? Object.keys(session.indicators).map(key => ({
        subject: key,
        A: session.indicators[key],
        fullMark: 100
    })) : [];

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--accent-green)';
        if (score >= 60) return 'var(--accent-amber)';
        return 'var(--accent-red)';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <h2 className="modal-title">
                    Session Analysis: <span className="pose-name">{session.pose}</span>
                </h2>

                <div className="modal-meta">
                    <div>
                        <p className="modal-meta-label">Date</p>
                        <p className="modal-meta-value">{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="modal-meta-label">Score</p>
                        <span className="modal-meta-value" style={{ fontSize: '1.5rem', color: getScoreColor(session.score) }}>
                            {session.score}
                        </span>
                    </div>
                </div>

                {radarData.length > 0 ? (
                    <div className="modal-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="var(--accent-blue)"
                                    fill="var(--accent-blue)"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="chart-empty">
                        No detailed metrics available for this session.
                    </div>
                )}

                <div className="coach-feedback">
                    <h4>💡 Coach Feedback</h4>
                    <p>
                        {Array.isArray(session.feedback) ? session.feedback.join('. ') : (session.feedback || 'No feedback available.')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDetail;
