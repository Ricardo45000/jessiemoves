import React, { useState, useEffect } from 'react';

const PostureList = () => {
    const [postures, setPostures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5001/api/postures/available')
            .then(res => res.json())
            .then(data => {
                setPostures(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch postures", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ color: '#aaa', fontStyle: 'italic' }}>Loading available postures...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {postures.map(posture => (
                <div key={posture.id} style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧘</div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>{posture.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '15px' }}>{posture.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                        {posture.benefits.slice(0, 2).map((benefit, idx) => (
                            <span key={idx} style={{
                                background: '#2d2d2d',
                                color: '#2196f3',
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: '10px'
                            }}>
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostureList;
