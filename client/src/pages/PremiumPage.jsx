import React from 'react';
import axios from 'axios';
import './PremiumPage.css'; // We'll create this next

const PremiumPage = () => {

    const handleCheckout = async () => {
        try {
            // Call backend to create checkout session
            // Replace with your actual Price ID from Stripe Dashboard
            const response = await axios.post('/api/payment/create-checkout-session', {
                priceId: 'price_1Q...' // PLACEHOLDER
            }, { withCredentials: true });

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Failed to start checkout. Please try again.");
        }
    };

    return (
        <div className="premium-page">
            <div className="premium-hero">
                <h1>Unlock Your Full Potential</h1>
                <p>Get personalized AI coaching, advanced analytics, and exclusive content.</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="icon">🚀</div>
                    <h3>Advanced Poses</h3>
                    <p>Master complex inversions and balances with specialized AI feedback.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">📈</div>
                    <h3>Pro Analytics</h3>
                    <p>Track your progress with detailed historical charts and trend analysis.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">🧠</div>
                    <h3>Smart Recommendations</h3>
                    <p>Get unlimited remedial exercise suggestions tailored to your weak points.</p>
                </div>
            </div>

            <div className="pricing-card">
                <h2>Premium Membership</h2>
                <div className="price">$9.99<span>/month</span></div>
                <ul className="benefits-list">
                    <li>✅ Unlimited AI Analysis</li>
                    <li>✅ Access to All 50+ Poses</li>
                    <li>✅ Detailed Progress History</li>
                    <li>✅ Priority Support</li>
                </ul>
                <button className="cta-button" onClick={handleCheckout}>
                    Upgrade Now
                </button>
            </div>
        </div>
    );
};

export default PremiumPage;
