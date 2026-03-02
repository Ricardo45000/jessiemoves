import React, { useState, useEffect } from 'react';
import '../pages/AdminDashboard.css';

const AdminStyle = () => {
    const [styleConfig, setStyleConfig] = useState(null);
    const [selectedSection, setSelectedSection] = useState('home');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fontOptions = [
        "'Euclid Circular A', Helvetica, Arial, sans-serif",
        "'Inter', sans-serif",
        "'Playfair Display', serif",
        "'Roboto', sans-serif",
        "'Open Sans', sans-serif",
        "'Montserrat', sans-serif",
        "system-ui, -apple-system, sans-serif"
    ];

    useEffect(() => {
        fetchStyleConfig();
    }, []);

    const fetchStyleConfig = async () => {
        try {
            const res = await fetch('/api/style');
            if (res.ok) {
                const data = await res.json();
                setStyleConfig(data);
            }
        } catch (err) {
            console.error('Failed to load style config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/style', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(styleConfig)
            });
            if (res.ok) {
                const updatedData = await res.json();
                setStyleConfig(updatedData);
                setMessage('Global styles updated successfully! Refresh to see changes globally.');
                setTimeout(() => setMessage(''), 5000);
            } else {
                setMessage('Failed to update styles');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server');
        } finally {
            setSaving(false);
        }
    };

    const handleColorChange = (field, value) => {
        setStyleConfig(prev => ({
            ...prev,
            [selectedSection]: {
                ...prev[selectedSection],
                colors: {
                    ...prev[selectedSection].colors,
                    [field]: value
                }
            }
        }));
    };

    const handleFontChange = (field, value) => {
        setStyleConfig(prev => ({
            ...prev,
            [selectedSection]: {
                ...prev[selectedSection],
                typography: {
                    ...prev[selectedSection].typography,
                    [field]: value
                }
            }
        }));
    };

    if (loading || !styleConfig) return <div>Loading Style Config...</div>;

    const currentConfig = styleConfig[selectedSection];

    return (
        <div className="admin-subpage">
            <header className="admin-subpage-header">
                <div>
                    <h2>Global Styles CMS</h2>
                    <p>Customize the colors and typography used throughout the application.</p>
                </div>
                <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Publish Theme'}
                </button>
            </header>

            {message && (
                <div style={{ padding: '10px 15px', backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.includes('success') ? '#10b981' : '#ef4444', borderRadius: '4px', border: `1px solid ${message.includes('success') ? '#10b981' : '#ef4444'}` }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '10px' }}>
                <button
                    type="button"
                    onClick={() => setSelectedSection('home')}
                    style={{ padding: '10px 20px', backgroundColor: selectedSection === 'home' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '4px', border: '1px solid var(--border-default)', cursor: 'pointer' }}
                >
                    Home Page
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedSection('classes')}
                    style={{ padding: '10px 20px', backgroundColor: selectedSection === 'classes' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '4px', border: '1px solid var(--border-default)', cursor: 'pointer' }}
                >
                    Classes Page
                </button>
            </div>

            <form onSubmit={handleSave} className="admin-categories-list">

                {/* Color Palette Section */}
                <div className="admin-category-card">
                    <h3>Color Palette ({selectedSection === 'home' ? 'Home' : 'Classes'})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Background Color (--bg-primary)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={currentConfig.colors.backgroundColor}
                                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={currentConfig.colors.backgroundColor}
                                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                    style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Accent Color (--accent-pink)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={currentConfig.colors.accentColor}
                                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={currentConfig.colors.accentColor}
                                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                                    style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Primary Text Color (--text-primary)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={currentConfig.colors.primaryTextColor}
                                    onChange={(e) => handleColorChange('primaryTextColor', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={currentConfig.colors.primaryTextColor}
                                    onChange={(e) => handleColorChange('primaryTextColor', e.target.value)}
                                    style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Secondary Text Color (--text-secondary)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={currentConfig.colors.secondaryTextColor}
                                    onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                                />
                                <input
                                    type="text"
                                    value={currentConfig.colors.secondaryTextColor}
                                    onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)}
                                    style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography Section */}
                <div className="admin-category-card">
                    <h3>Typography ({selectedSection === 'home' ? 'Home' : 'Classes'})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Heading Font (Titles & Headers)</label>
                            <select
                                value={currentConfig.typography.headingFont}
                                onChange={(e) => handleFontChange('headingFont', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', appearance: 'auto' }}
                            >
                                {fontOptions.map(font => (
                                    <option key={font} value={font} style={{ color: 'black' }}>{font.split(',')[0].replace(/'/g, '')}</option>
                                ))}
                            </select>
                            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <h1 style={{ fontFamily: currentConfig.typography.headingFont, margin: 0, fontSize: '1.5rem' }}>Heading Preview</h1>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Body Font (Paragraphs & UI)</label>
                            <select
                                value={currentConfig.typography.bodyFont}
                                onChange={(e) => handleFontChange('bodyFont', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', appearance: 'auto' }}
                            >
                                {fontOptions.map(font => (
                                    <option key={font} value={font} style={{ color: 'black' }}>{font.split(',')[0].replace(/'/g, '')}</option>
                                ))}
                            </select>
                            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <p style={{ fontFamily: currentConfig.typography.bodyFont, margin: 0, fontSize: '1rem' }}>This is a preview of the body font. It will affect all paragraphs, descriptions, and user interface elements.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default AdminStyle;
