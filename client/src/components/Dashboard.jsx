import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import PostureList from './PostureList';
import PostureHistory from './PostureHistory';
import FeedbackDetail from './FeedbackDetail';

const Dashboard = ({ user, onLogout, onStartLive, onStartUpload }) => {
    const [selectedSession, setSelectedSession] = useState(null);

    const history = user.posture_history || [];
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

    const chartData = sortedHistory.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: entry.score,
        pose: entry.pose
    }));

    const totalSessions = history.length;
    const averageScore = totalSessions > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalSessions)
        : 0;

    return (
        <div className="dashboard">
            {selectedSession && (
                <FeedbackDetail
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}

            {/* Header */}
            <header className="dash-header">
                <div>
                    <h1 className="dash-greeting gradient-text">
                        Hello, {user.profile.first_name}
                    </h1>
                    <p className="dash-meta">
                        Level: <span className="level">{user.profile.level}</span> •{' '}
                        Status: <span className="status">Active</span>
                    </p>
                </div>
                <div className="dash-actions">
                    {!user.is_premium && (
                        <button className="btn-upgrade" onClick={() => window.location.href = '/premium'}>
                            Upgrade to Premium 💎
                        </button>
                    )}
                    <button className="btn-logout" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {/* Quick Actions */}
            <section className="quick-actions">
                <div className="action-card" onClick={onStartLive}>
                    <span className="action-icon">🎥</span>
                    <h3 className="action-title">Live Session</h3>
                    <p className="action-desc">Real-time posture AI analysis</p>
                </div>

                <div className="action-card" onClick={onStartUpload}>
                    <span className="action-icon">📁</span>
                    <h3 className="action-title">Upload Video</h3>
                    <p className="action-desc">Analyze pre-recorded content</p>
                </div>

                <div className="stats-card">
                    <div>
                        <h4 className="stat-value pink">{totalSessions}</h4>
                        <p className="stat-label">Total Sessions</p>
                    </div>
                    <div>
                        <h4 className="stat-value blue">{averageScore}</h4>
                        <p className="stat-label">Avg Score</p>
                    </div>
                </div>
            </section>

            {/* Available Postures */}
            <section className="dash-section">
                <h2 className="section-header green">Available Pilates Exercises</h2>
                <PostureList />
            </section>

            {/* Progress Chart */}
            <section className="dash-section">
                <h2 className="section-header pink">Progress Over Time</h2>
                <div className="chart-container">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#555" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">
                            No data yet. Complete your first session!
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="dash-section">
                <h2 className="section-header blue">Your Journey</h2>
                <PostureHistory
                    history={history}
                    onViewDetail={setSelectedSession}
                />
            </section>
        </div>
    );
};

export default Dashboard;
