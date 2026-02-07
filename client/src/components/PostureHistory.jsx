import React from 'react';

const PostureHistory = ({ history, onViewDetail }) => {
    // Sort logic handled in parent or here
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (history.length === 0) {
        return <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No history found. Start training!</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {sortedHistory.map((session, index) => (
                <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#1a1a1a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333'
                }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#fff' }}>{session.pose}</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                            {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {/* Optional small feedback preview */}
                        {session.feedback && (
                            <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                {Array.isArray(session.feedback) ? session.feedback[0] : session.feedback}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '5px 12px',
                                borderRadius: '15px',
                                background: session.score >= 80 ? 'rgba(76, 175, 80, 0.1)' : session.score >= 60 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                color: session.score >= 80 ? '#4caf50' : session.score >= 60 ? '#ffc107' : '#f44336',
                                fontWeight: 'bold',
                                fontSize: '1.2rem'
                            }}>
                                {session.score}
                            </span>
                        </div>
                        <button
                            onClick={() => onViewDetail(session)}
                            style={{
                                background: 'transparent',
                                border: '1px solid #2196f3',
                                color: '#2196f3',
                                padding: '5px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s'
                            }}
                        >
                            Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostureHistory;
