import React from 'react';

const ScoreCard = ({ score, level, tip }) => {
    const getLevelColor = (level) => {
        switch (level) {
            case 'Expert': return '#FFD700';
            case 'Advanced': return '#C0C0C0';
            case 'Intermediate': return '#CD7F32';
            default: return '#FFFFFF';
        }
    };

    return (
        <div className="score-card" style={{ borderColor: getLevelColor(level) }}>
            <div className="score-card-label">Global Score</div>
            <div className="score-card-value" style={{ color: getLevelColor(level) }}>
                {score}
            </div>
            <div className="score-card-level" style={{ background: getLevelColor(level) }}>
                {level}
            </div>
            <div className="score-card-tip">
                <div className="score-card-tip-label">💡 COACH'S TIP</div>
                <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{tip}"</div>
            </div>
        </div>
    );
};

export default ScoreCard;
