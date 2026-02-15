import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ theme = 'dark', alwaysTransparent = false }) => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll for navbar transparency
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const navbarClasses = `tpc-navbar ${(!alwaysTransparent && isScrolled) ? 'scrolled' : ''} ${alwaysTransparent ? 'absolute-nav' : ''} ${theme}`;

    return (
        <nav className={navbarClasses}>
            {/* Overlay */}
            <div className={`tpc-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

            {/* Sidebar */}
            <div className={`tpc-sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="tpc-sidebar-header">
                    <img src="/jessie_signature.png" alt="Jessie Moves Signature" className="tpc-sidebar-signature" />
                </div>
                <span className="tpc-nav-link-mobile" onClick={() => { navigate('/classes'); toggleSidebar(); }}>Classes</span>
                <a href="https://www.instagram.com/thejessiemoves" target="_blank" rel="noopener noreferrer" className="tpc-community-link-mobile">Community</a>
            </div>

            {/* Left Column: Classes (Desktop) / Hamburger (Mobile) */}
            <div className="tpc-nav-left">
                <span className="tpc-nav-link desktop-only" onClick={() => navigate('/classes')}>Classes</span>

                {/* Mobile Hamburger */}
                <div className="tpc-hamburger" onClick={toggleSidebar}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                        <path d="M3 12H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 6H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 18H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Center Column: Logo */}
            <div className="tpc-logo" onClick={() => navigate('/')}>THE JESSIE MOVES</div>

            {/* Right Column: Actions */}
            <div className="tpc-nav-actions">
                <a href="https://www.instagram.com/thejessiemoves" target="_blank" rel="noopener noreferrer" className="tpc-community-link desktop-only">Community</a>
                <div className="tpc-profile-icon" onClick={() => navigate('/ai/login')}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
