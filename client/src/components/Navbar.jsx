import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ theme = 'dark', alwaysTransparent = false, isAdmin = false, activeAdminTab = '', onAdminTabChange = () => { }, onAdminLogout = () => { } }) => {
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
        <>
            {/* Overlay */}
            <div className={`tpc-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

            {/* Sidebar */}
            <div className={`tpc-sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="tpc-sidebar-header">
                    <img src="/jessie_signature.png" alt="Jessie Moves Signature" className="tpc-sidebar-signature" />
                </div>

                {isAdmin ? (
                    <>
                        <span className={`tpc-nav-link-mobile ${activeAdminTab === 'overview' ? 'active' : ''}`} onClick={() => { onAdminTabChange('overview'); toggleSidebar(); }} style={{ color: activeAdminTab === 'overview' ? 'white' : 'inherit', display: 'flex', alignItems: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </span>
                        <span className={`tpc-nav-link-mobile ${activeAdminTab === 'classes' ? 'active' : ''}`} onClick={() => { onAdminTabChange('classes'); toggleSidebar(); }} style={{ color: activeAdminTab === 'classes' ? 'white' : 'inherit' }}>Classes</span>
                        <span className={`tpc-nav-link-mobile ${activeAdminTab === 'users' ? 'active' : ''}`} onClick={() => { onAdminTabChange('users'); toggleSidebar(); }} style={{ color: activeAdminTab === 'users' ? 'white' : 'inherit' }}>Users</span>
                        <span className={`tpc-nav-link-mobile ${activeAdminTab === 'style' ? 'active' : ''}`} onClick={() => { onAdminTabChange('style'); toggleSidebar(); }} style={{ color: activeAdminTab === 'style' ? 'white' : 'inherit' }}>Style</span>
                        <span className="tpc-nav-link-mobile" onClick={() => { onAdminLogout(); toggleSidebar(); }} style={{ color: '#ef4444', marginTop: '20px' }}>Logout</span>
                    </>
                ) : (
                    <span className="tpc-nav-link-mobile" onClick={() => { navigate('/classes'); toggleSidebar(); }}>Classes</span>
                )}

                <div className="tpc-mobile-socials">
                    <a href="https://www.youtube.com/@Thejessie" target="_blank" rel="noopener noreferrer" className="tpc-social-icon-mobile">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                    </a>
                    <a href="https://www.instagram.com/thejessiemoves" target="_blank" rel="noopener noreferrer" className="tpc-social-icon-mobile">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                </div>
            </div>

            <nav className={navbarClasses}>
                {/* Left Column: Classes (Desktop) / Hamburger (Mobile) */}
                <div className="tpc-nav-left">
                    {isAdmin ? (
                        <>
                            <span className="tpc-nav-link desktop-only" onClick={() => onAdminTabChange('overview')} style={{ marginRight: '20px', color: activeAdminTab === 'overview' ? 'white' : 'inherit', display: 'flex', alignItems: 'center' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </span>
                            <span className="tpc-nav-link desktop-only" onClick={() => onAdminTabChange('classes')} style={{ marginRight: '20px', color: activeAdminTab === 'classes' ? 'white' : 'inherit' }}>Classes</span>
                            <span className="tpc-nav-link desktop-only" onClick={() => onAdminTabChange('users')} style={{ marginRight: '20px', color: activeAdminTab === 'users' ? 'white' : 'inherit' }}>Users</span>
                            <span className="tpc-nav-link desktop-only" onClick={() => onAdminTabChange('style')} style={{ color: activeAdminTab === 'style' ? 'white' : 'inherit' }}>Style</span>
                        </>
                    ) : (
                        <span className="tpc-nav-link desktop-only" onClick={() => navigate('/classes')}>Classes</span>
                    )}

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
                    <div className="tpc-social-links desktop-only">
                        <a href="https://www.youtube.com/@Thejessie" target="_blank" rel="noopener noreferrer" className="tpc-social-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                        </a>
                        <a href="https://www.instagram.com/thejessiemoves" target="_blank" rel="noopener noreferrer" className="tpc-social-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                    </div>
                    {isAdmin ? (
                        <div className="tpc-profile-icon" onClick={onAdminLogout} title="Logout" style={{ color: '#ef4444' }}>
                            {/* Simple Logout SVG Icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </div>
                    ) : (
                        <div className="tpc-profile-icon" onClick={() => navigate('/ai/login')}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
