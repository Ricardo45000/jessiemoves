import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    // Check if user is logged in (via HttpOnly cookie)
    const checkUserLoggedIn = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                // Include credentials to send cookies
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                setUser(null);
            } else {
                setUser(data);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data);
            return { success: true };
        } else {
            return { success: false, error: data.message };
        }
    };

    // Register
    const register = async (userData) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data);
            return { success: true };
        } else {
            return { success: false, error: data.message };
        }
    };

    // Logout
    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
