import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminOverview from '../components/AdminOverview';
import AdminUsers from '../components/AdminUsers';
import AdminClasses from '../components/AdminClasses';
import AdminStyle from '../components/AdminStyle';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="admin-dashboard-container">
            <Navbar
                theme="dark"
                alwaysTransparent={false}
                isAdmin={true}
                activeAdminTab={activeTab}
                onAdminTabChange={handleTabSwitch}
                onAdminLogout={handleLogout}
            />

            <main className="admin-main-content">
                <div className="admin-content-area">
                    {activeTab === 'overview' && <AdminOverview />}
                    {activeTab === 'classes' && <AdminClasses />}
                    {activeTab === 'users' && <AdminUsers />}
                    {activeTab === 'style' && <AdminStyle />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
