import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './WebsiteHome.css';

const WebsiteHome = () => {
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="tpc-container">
            {/* Navbar */}
            <Navbar theme="dark" />

            {/* Hero Section */}
            <header className="tpc-hero">
                <div className="tpc-hero-content">
                    <h1 className="tpc-hero-title">Moves for every mood.</h1>
                    <p className="tpc-hero-subtitle">
                        The JM Method is a transformative approach designed to help you feel stronger, longer, and leaner,
                        while releasing both physical and mental tension - so you can move with confidence. One class for every body!
                    </p>
                    <button className="tpc-btn" style={{ padding: '16px 32px', fontSize: '14px' }} onClick={() => navigate('/ai/register')}>
                        Start 7 Day Free Trial
                    </button>
                </div>
            </header>

            {/* Classes Section */}
            <section className="tpc-section">
                <div className="tpc-section-header">
                    <h2 className="tpc-section-title">My Classes</h2>
                    <p className="tpc-section-desc">
                        From high-intensity burn to restorative flows, I have designed something for every energy level.
                    </p>
                </div>

                <div className="tpc-grid">
                    <div className="tpc-card">
                        <img src="https://plus.unsplash.com/premium_photo-1737321092731-b0c0bf8ed2f9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGlsYXRlcyUyMHJlZm9ybWVyfGVufDB8fDB8fHww" alt="Pilates Strength" className="tpc-card-img" />
                        <h3 className="tpc-card-title">Pilates x Strength</h3>
                        <p className="tpc-card-text">
                            Blends the core principles of Pilates with low impact resistance training to help you build real, functional strength.
                            Expect sweaty, powerful sessions that challenge and energize you.
                        </p>
                    </div>
                    <div className="tpc-card">
                        <img src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=1000" alt="Energy Boost" className="tpc-card-img" />
                        <h3 className="tpc-card-title">Energy Boost</h3>
                        <p className="tpc-card-text">
                            Designed to wake up your body and elevate your mood, fast. Whether you’ve hit the afternoon slump
                            or just need a pick-me-up, these short, effective sessions will get your blood flowing.
                        </p>
                    </div>
                    <div className="tpc-card">
                        <img src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=1000" alt="Breathwork" className="tpc-card-img" />
                        <h3 className="tpc-card-title">Breathwork</h3>
                        <p className="tpc-card-text">
                            Focus on the power of intentional breathing to calm your mind, regulate your nervous system,
                            and reconnect you to the present moment. Your go-to for clarity, balance, and inner peace.
                        </p>
                    </div>
                </div>
            </section>

            {/* Instructors Section */}
            <section className="tpc-section" style={{ backgroundColor: 'white' }}>
                <div className="tpc-section-header">
                    <h2 className="tpc-section-title">Meet Your Instructor</h2>
                    <p className="tpc-section-desc">
                        Guiding you through every breath and movement.
                    </p>
                </div>
                <div className="tpc-instructor-grid" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="tpc-instructor-card" style={{ maxWidth: '400px' }}>
                        {/* Placeholder for the attached image - User needs to place 'jessie_pole.jpg' in public folder */}
                        <img src="/jessie_pole.png" alt="Jessie" className="tpc-instructor-img" style={{ height: '500px', objectFit: 'cover' }} />
                        <h3 className="tpc-card-title">Jessie</h3>
                        <p className="tpc-card-text">Founder & Lead Instructor</p>
                        <p className="tpc-card-text" style={{ fontSize: '0.9rem', marginTop: '10px', color: '#666' }}>
                            "My approach combines classical Pilates precision with athletic conditioning.
                            I created The Jessie Moves to help you find strength in softness and power in control."
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="tpc-testimonial-bg">
                <div className="tpc-section-header">
                    <p className="tpc-quote">
                        "While you can feel the burn the next day, these aren’t the kind of workouts you’ll hate or dread.
                        Instead, they invite you to connect with your body and breath, and simultaneously get the dopamine pumping."
                    </p>
                    <p className="tpc-quote-author">Clarissa</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="tpc-footer">
                <div className="tpc-footer-links">
                    <span className="tpc-footer-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai/login')}>Login</span>
                    <span className="tpc-footer-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai')}>AI Coach</span>
                    <span className="tpc-footer-link">Contact</span>
                    <span className="tpc-footer-link">FAQ</span>
                    <span className="tpc-footer-link">Terms</span>
                </div>
                <p style={{ opacity: 0.5, fontSize: '12px' }}>&copy; 2026 JessieMoves. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default WebsiteHome;
