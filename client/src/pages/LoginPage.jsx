import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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
        }
    };

    return (
        <div className="auth-container" style={{ color: 'white', maxWidth: '400px', margin: '0 auto', textAlign: 'center', paddingTop: '50px' }}>
            <h2>Welcome Back</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                />
                <button type="submit" style={{ padding: '10px', background: '#ff4081', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Login
                </button>
            </form>

            <p style={{ marginTop: '20px' }}>
                Don't have an account? <span onClick={onSwitchToRegister} style={{ color: '#2196f3', cursor: 'pointer', textDecoration: 'underline' }}>Register here</span>
            </p>
        </div>
    );
};

export default LoginPage;
