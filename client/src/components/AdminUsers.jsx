import React, { useState, useEffect } from 'react';
import '../pages/AdminDashboard.css'; // Reusing established styles

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Note: In a real app we would map this to an Admin-only User fetch route.
            // Using a generic get-all for demo purposes.
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            // Placeholder: Assume delete route exists or will be added to userRoutes
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== id));
            } else {
                alert('Failed to delete user');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="admin-subpage">
            <header className="admin-subpage-header">
                <h2>User Management</h2>
                <p>Total Users: {users.length}</p>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.email}</td>
                                <td>{user.email === 'moloney.jessie@gmail.com' ? 'Admin' : 'Member'}</td>
                                <td>
                                    {user.email !== 'moloney.jessie@gmail.com' && (
                                        <button className="admin-btn-delete" onClick={() => handleDelete(user._id)}>Remove</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
