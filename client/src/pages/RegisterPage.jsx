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
        <div className="auth-page">
            <div className="auth-container">
                <h2>Join JessieMoves</h2>
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="First Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <input
                        type="text"
                        placeholder="Goals (e.g. Flexibility, Strength)"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                    />
                    <button type="submit" className="btn-auth blue">
                        Register
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <a className="pink" onClick={onSwitchToLogin}>Login here</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
