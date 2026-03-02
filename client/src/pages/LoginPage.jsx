import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LoginPage = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const res = await login(email, password);
        if (!res.success) {
            setError(res.error);
        } else {
            // Force reload to let AppRoots logic handle DashboardRoute correctly if needed,
            // or we could just let the AuthContext update trigger the redirect via PublicRoute
            // PublicRoute redirects to /ai/dashboard, which then checks the admin email.
            // This is already handled elegantly by the DashboardRoute we made in App.jsx.
        }
    };

    return (
        <div className="auth-page">
            <Navbar theme="dark" alwaysTransparent={true} />
            <div className="auth-container">
                <h2>Welcome Back</h2>
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-auth pink">
                        Login
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <a className="blue" onClick={onSwitchToRegister}>Register here</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
