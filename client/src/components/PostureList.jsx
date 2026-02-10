import React, { useState, useEffect } from 'react';

const PostureList = () => {
    const [postures, setPostures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/postures/available')
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

    if (loading) return <div className="loading-text">Loading available postures...</div>;

    return (
        <div className="posture-grid">
            {postures.map(posture => (
                <div key={posture.id} className="posture-card">
                    <div className="posture-emoji">🤸‍♀️</div>
                    <h3 className="posture-name">{posture.name}</h3>
                    <p className="posture-desc">{posture.description}</p>
                    <div className="posture-tags">
                        {posture.benefits.slice(0, 2).map((benefit, idx) => (
                            <span key={idx} className="posture-tag">{benefit}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostureList;
