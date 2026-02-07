import React from 'react';

const ScoreCard = ({ score, level, tip }) => {
    const getLevelColor = (level) => {
        switch (level) {
            case 'Expert': return '#FFD700'; // Gold
            case 'Advanced': return '#C0C0C0'; // Silver
            case 'Intermediate': return '#CD7F32'; // Bronze
            default: return '#FFFFFF'; // White
        }
    };

    return (
        <div style={{
            background: 'rgba(30, 30, 30, 0.8)',
            borderRadius: '15px',
            padding: '20px',
            color: 'white',
            textAlign: 'center',
            border: `2px solid ${getLevelColor(level)}`,
            marginBottom: '20px'
        }}>
            <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#aaa' }}>Global Score</div>
            <div style={{ fontSize: '64px', fontWeight: 'bold', color: getLevelColor(level) }}>
                {score}
            </div>

            <div style={{
                display: 'inline-block',
                padding: '5px 15px',
                borderRadius: '20px',
                background: getLevelColor(level),
                color: 'black',
                fontWeight: 'bold',
                marginTop: '10px',
                marginBottom: '20px'
            }}>
                {level}
            </div>

            <div style={{ borderTop: '1px solid #555', paddingTop: '15px', marginTop: '10px' }}>
                <div style={{ color: '#FF4081', fontWeight: 'bold', marginBottom: '5px' }}>💡 COACH'S TIP</div>
                <div style={{ fontStyle: 'italic' }}>"{tip}"</div>
            </div>
        </div>
    );
};

export default ScoreCard;
