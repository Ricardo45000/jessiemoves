import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ClassesPage.css';

const ClassesPage = () => {
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, clsRes] = await Promise.all([
                fetch('/api/content/categories'),
                fetch('/api/content/classes')
            ]);

            if (catRes.ok) setCategories(await catRes.json());
            if (clsRes.ok) setClasses(await clsRes.json());

        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="classes-page">
                <Navbar theme="dark" alwaysTransparent={false} />
                <div style={{ padding: '150px 20px', textAlign: 'center', color: 'white' }}>Loading classes...</div>
            </div>
        );
    }

    return (
        <div className="classes-page">
            <Navbar theme="dark" alwaysTransparent={false} />

            <div className="classes-container">
                <header className="classes-main-header">
                    <h1 className="classes-hero-title">Class Categories</h1>
                    <p className="classes-hero-subtitle">Find the perfect class for your mood, energy, and goals.</p>
                </header>

                {categories.map((category) => (
                    <section key={category.id} className="category-section" id={category.id}>
                        <div className="category-header">
                            <div className="category-info">
                                <h2 className="category-title">{category.title}</h2>
                                <div className="category-tags">
                                    <span className={`intensity-pill ${category.intensity.toLowerCase()}`}>{category.intensity}</span>
                                    <span className="duration-pill">{category.duration}</span>
                                </div>
                                <p className="category-description">{category.description}</p>
                                <button className="btn-preview">Preview a Class</button>
                            </div>
                            <div className="category-image-container">
                                <img src={category.image} alt={category.title} className="category-image" />
                            </div>
                        </div>

                        <div className="most-popular-section">
                            <h3 className="most-popular-title">Classes in {category.title}</h3>
                            <div className="classes-grid-scroll">
                                {classes.filter(c => c.categoryId === category.id).map((cls) => (
                                    <div key={cls._id} className="class-card-small" onClick={() => navigate(`/play/${cls._id}`)}>
                                        {/* Use thumbnail if exists, else fallback gradient */}
                                        {cls.thumbnail ? (
                                            <img src={cls.thumbnail} alt={cls.title} className="class-card-thumb" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div className="class-card-thumb" style={{ background: 'linear-gradient(135deg, #1C1C1C 0%, #3a3a3a 100%)' }}></div>
                                        )}
                                        <div className="class-card-meta">
                                            <span className="class-card-title">{cls.title}</span>
                                            <span className="class-card-duration">{cls.duration}</span>
                                        </div>
                                    </div>
                                ))}
                                {classes.filter(c => c.categoryId === category.id).length === 0 && (
                                    <p style={{ color: 'var(--text-muted)' }}>More classes coming soon!</p>
                                )}
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default ClassesPage;
