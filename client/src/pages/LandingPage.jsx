import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);

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
            <Navbar theme="dark" alwaysTransparent={true} />

            {/* Hero Section */
            /* Added padding-top to account for fixed navbar in CSS if needed, 
               but transparent nav usually overlays content. 
               The hero-section in CSS has padding: var(--space-3xl) which is usually sufficient. 
             */}
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
                    <button onClick={() => navigate('/ai/register')} className="btn-primary">
                        Try It Now (Free)
                    </button>
                    <a href="#beta" className="btn-secondary">
                        Join Private Beta
                    </a>
                </div>

                <div className="hero-visual">
                    <div style={{ color: 'white', textAlign: 'center' }}>
                        <h2>🤖 AI Posture Analysis</h2>
                        <p>Real-time Pilates coaching</p>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="features-section">
                <h2 className="section-title">Why JessieMoves?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <span className="feature-icon">🔍</span>
                        <h3>Instant Feedback</h3>
                        <p>Our AI analyzes your alignment in real-time and tells you exactly what to fix.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🏠</span>
                        <h3>Practice Anywhere</h3>
                        <p>Your personal Pilates coach is always with you. All you need is a camera.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">📈</span>
                        <h3>Track Progress</h3>
                        <p>Visualize your improvement over time with detailed charts and scores.</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon">🤸‍♀️</span>
                        <h3>34 Exercises</h3>
                        <p>All classical Pilates mat exercises from Return to Life Through Contrology.</p>
                    </div>
                </div>
            </section>

            {/* Waitlist */}
            <section id="beta" className="roadmap-section">
                <h2>Join the Revolution</h2>
                <p>
                    We are building the future of home fitness. Join our private beta to get early access.
                </p>

                {status === 'success' ? (
                    <div className="beta-success">
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
                {status === 'error' && <p className="beta-error">Something went wrong. Please try again.</p>}
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2026 JessieMoves. AI-Powered Pilates Coach.</p>
                <p className="version">Version: Alpha Release | Built for Web & Mobile</p>
            </footer>
        </div>
    );
};

export default LandingPage;
