import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import PostureList from './PostureList';
import PostureHistory from './PostureHistory';
import FeedbackDetail from './FeedbackDetail';

const Dashboard = ({ user, onLogout, onStartLive, onStartUpload }) => {
    // State for Feedback Detail Modal
    const [selectedSession, setSelectedSession] = useState(null);

    // Safe default if history is empty
    const history = user.posture_history || [];

    // Process data for charts
    // Sort by date to ensure line chart flows correctly
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Format data for Recharts
    const chartData = sortedHistory.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: entry.score,
        pose: entry.pose
    }));

    // Calculate stats
    const totalSessions = history.length;
    const averageScore = totalSessions > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalSessions)
        : 0;

    return (
        <div className="dashboard-container" style={{
            padding: '40px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Feedback Detail Modal */}
            {selectedSession && (
                <FeedbackDetail
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}

            {/* Header Section */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                borderBottom: '1px solid #333',
                paddingBottom: '20px'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', background: 'linear-gradient(90deg, #ff4081, #2196f3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Hello, {user.profile.first_name}
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                        Level: <span style={{ color: '#2196f3', fontWeight: 'bold' }}>{user.profile.level}</span> •
                        Status: <span style={{ color: '#4caf50' }}>Active</span>
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid #ff4081',
                        color: '#ff4081',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Logout
                </button>
            </header>

            {/* Quick Actions */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div
                    onClick={onStartLive}
                    style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        border: '1px solid #333',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>🎥</span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Live Session</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Real-time posture AI analysis</p>
                </div>

                <div
                    onClick={onStartUpload}
                    style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        padding: '30px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        border: '1px solid #333',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>📁</span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Upload Video</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Analyze pre-recorded content</p>
                </div>

                <div style={{
                    background: '#1a1a1a',
                    padding: '30px',
                    borderRadius: '15px',
                    border: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <div>
                            <h4 style={{ fontSize: '2rem', color: '#ff4081', margin: 0 }}>{totalSessions}</h4>
                            <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '5px' }}>Total Sessions</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '2rem', color: '#2196f3', margin: 0 }}>{averageScore}</h4>
                            <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '5px' }}>Avg Score</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Available Postures */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderLeft: '4px solid #4caf50', paddingLeft: '15px' }}>Available Exercises</h2>
                <PostureList />
            </section>

            {/* Progress Chart */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderLeft: '4px solid #ff4081', paddingLeft: '15px' }}>Progress Over Time</h2>
                <div style={{ height: '300px', background: '#1a1a1a', padding: '20px', borderRadius: '15px', border: '1px solid #333' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis stroke="#666" domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#2d2d2d', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#ff4081"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            No data yet. Complete your first session!
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Activity / History */}
            <section>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', borderLeft: '4px solid #2196f3', paddingLeft: '15px' }}>Your Journey</h2>
                <PostureHistory
                    history={history}
                    onViewDetail={setSelectedSession}
                />
            </section>
        </div>
    );
};

export default Dashboard;
