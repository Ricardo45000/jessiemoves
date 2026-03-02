import React, { useState, useEffect } from 'react';
import '../pages/AdminDashboard.css';

const AdminOverview = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchHomepageContent();
    }, []);

    const fetchHomepageContent = async () => {
        try {
            const res = await fetch('/api/content/homepage');
            if (res.ok) {
                const data = await res.json();
                setContent(data);
            }
        } catch (err) {
            console.error('Failed to load homepage content:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/content/homepage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            if (res.ok) {
                const updatedData = await res.json();
                setContent(updatedData);
                setMessage('Homepage updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to update homepage');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error connecting to server');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    if (loading) return <div>Loading CMS...</div>;

    return (
        <div className="admin-subpage">
            <header className="admin-subpage-header">
                <div>
                    <h2>Homepage CMS</h2>
                    <p>Edit the text and images displayed on your live website's homepage.</p>
                </div>
                <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Publish Changes'}
                </button>
            </header>

            {message && (
                <div style={{ padding: '10px 15px', backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.includes('success') ? '#10b981' : '#ef4444', borderRadius: '4px', border: `1px solid ${message.includes('success') ? '#10b981' : '#ef4444'}` }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="admin-categories-list">

                {/* Hero Section */}
                <div className="admin-category-card">
                    <h3>Hero Section</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hero Title</label>
                            <input
                                type="text"
                                value={content.hero.title}
                                onChange={(e) => handleChange('hero', 'title', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hero Subtitle</label>
                            <textarea
                                value={content.hero.subtitle}
                                onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', minHeight: '80px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Background Image URL</label>
                            <input
                                type="text"
                                value={content.hero.backgroundImageUrl}
                                onChange={(e) => handleChange('hero', 'backgroundImageUrl', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Class Intro Section */}
                <div className="admin-category-card">
                    <h3>Classes Intro</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Classes Title</label>
                            <input
                                type="text"
                                value={content.classesSection.title}
                                onChange={(e) => handleChange('classesSection', 'title', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Classes Description</label>
                            <textarea
                                value={content.classesSection.description}
                                onChange={(e) => handleChange('classesSection', 'description', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', minHeight: '60px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Instructor Section */}
                <div className="admin-category-card">
                    <h3>Meet Your Instructor</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instructor Title</label>
                            <input
                                type="text"
                                value={content.instructorSection.title}
                                onChange={(e) => handleChange('instructorSection', 'title', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instructor Biography / Quote</label>
                            <textarea
                                value={content.instructorSection.quote}
                                onChange={(e) => handleChange('instructorSection', 'quote', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', minHeight: '80px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instructor Image URL</label>
                            <input
                                type="text"
                                value={content.instructorSection.imageUrl}
                                onChange={(e) => handleChange('instructorSection', 'imageUrl', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Testimonial Section */}
                <div className="admin-category-card">
                    <h3>Featured Testimonial</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quote</label>
                            <textarea
                                value={content.testimonial.quote}
                                onChange={(e) => handleChange('testimonial', 'quote', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px', minHeight: '80px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Author Name</label>
                            <input
                                type="text"
                                value={content.testimonial.author}
                                onChange={(e) => handleChange('testimonial', 'author', e.target.value)}
                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default AdminOverview;
