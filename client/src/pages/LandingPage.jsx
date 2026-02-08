import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="landing-container">
            {/* Header / Nav would go here */}

            {/* Hero Section */}
            <header className="hero-section">
                <h1 className="hero-title">
                    Master Your Pilates<br />
                    With AI Precision
                </h1>
                <p className="hero-subtitle">
                    Get instant, personalized feedback on your form using advanced computer vision.
                    Practice effectively, safely, and measure your progress—right from your browser.
                </p>
                <div className="cta-group">
                    <button onClick={() => navigate('/register')} className="btn-primary">
                        Try It Now (Free)
                    </button>
                    <a href="#beta" className="btn-secondary">
                        Join Private Beta
                    </a>
                </div>

                {/* Visual Placeholder - Ideally replaced with a real demo screenshot */}
                <div className="hero-visual">
                    <div style={{ color: 'white', textAlign: 'center' }}>
                        <h2>🤖 AI Posture Analysis Demo</h2>
                        <p>(Dashboard Preview)</p>
                    </div>
                </div>
            </header>

            {/* Problem / Solution Section */}
            <section className="features-section">
                <h2 className="section-title">Why JessieMoves?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🔍</span>
                        <h3>Instant Feedback</h3>
                        <p>No more guessing. Our AI analyzes your alignment in real-time and tells you exactly what to fix.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🏠</span>
                        <h3>Practice Anywhere</h3>
                        <p>Your personal Pilates coach is always with you. All you need is a laptop and a webcam.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📈</span>
                        <h3>Track Progress</h3>
                        <p>Visualize your improvement over time with detailed history charts and scores.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🤸‍♀️</span>
                        <h3>Pilates Focus</h3>
                        <p>Specialized tailored classifiers for key movements like The Hundred, Roll-Up, and more.</p>
                    </div>
                </div>
            </section>

            {/* Waitlist Section */}
            <section id="beta" className="roadmap-section">
                <h2>Join the Revolution</h2>
                <p style={{ maxWidth: '600px', margin: '20px auto', color: '#e0e0e0' }}>
                    We are building the future of home fitness. Join our private beta to get early access to new features and shape the product.
                </p>

                {status === 'success' ? (
                    <div style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        🎉 You're on the list! Thank you.
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="beta-form">
                        <input
                            type="email"
                            className="beta-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Joining...' : 'Join Beta'}
                        </button>
                    </form>
                )}
                {status === 'error' && <p style={{ color: '#ff4081', marginTop: '10px' }}>Something went wrong. Please try again.</p>}
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2026 JessieMoves. AI-Powered Pilates Coach.</p>
                <p style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.7 }}>
                    Version: Alpha Release | Built for Web
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
