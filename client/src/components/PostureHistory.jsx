import React from 'react';

const PostureHistory = ({ history, onViewDetail }) => {
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (history.length === 0) {
        return <div className="history-empty">No history found. Start training!</div>;
    }

    const getScoreClass = (score) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'amber';
        return 'red';
    };

    return (
        <div className="history-list">
            {sortedHistory.map((session, index) => (
                <div key={index} className="history-item">
                    <div className="history-info">
                        <h4>{session.pose}</h4>
                        <p className="history-date">
                            {new Date(session.date).toLocaleDateString()} at{' '}
                            {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {session.feedback && (
                            <p className="history-preview">
                                {Array.isArray(session.feedback) ? session.feedback[0] : session.feedback}
                            </p>
                        )}
                    </div>

                    <div className="history-actions">
                        <span className={`score-badge ${getScoreClass(session.score)}`}>
                            {session.score}
                        </span>
                        <button className="btn-details" onClick={() => onViewDetail(session)}>
                            Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostureHistory;
