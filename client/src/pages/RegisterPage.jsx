import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [goals, setGoals] = useState('');
    const [error, setError] = useState(null);
    const { register } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const goalsArray = goals.split(',').map(g => g.trim());

        const res = await register({ name, email, password, goals: goalsArray });
        if (!res.success) {
            setError(res.error);
        }
    };

    return (
        <div className="auth-container" style={{ color: 'white', maxWidth: '400px', margin: '0 auto', textAlign: 'center', paddingTop: '50px' }}>
            <h2>Join JessieMoves</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                />
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
                <input
                    type="text"
                    placeholder="Goals (comma separated, e.g. Flexibility, Strength)"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
                />
                <button type="submit" style={{ padding: '10px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Register
                </button>
            </form>

            <p style={{ marginTop: '20px' }}>
                Already have an account? <span onClick={onSwitchToLogin} style={{ color: '#ff4081', cursor: 'pointer', textDecoration: 'underline' }}>Login here</span>
            </p>
        </div>
    );
};

export default RegisterPage;
