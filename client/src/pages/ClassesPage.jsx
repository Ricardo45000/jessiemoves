import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import './ClassesPage.css';

const ClassesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categories = [
        {
            id: 'essentials',
            title: 'Essentials',
            description: 'The foundation of the JM Method. Master the basics, improve your form, and build a strong connection to your core.',
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=2670',
            duration: '28 min',
            intensity: 'Satisfying'
        },
        {
            id: 'body',
            title: 'Body',
            description: 'Full body sculpting sequences designed to tone, lengthen, and strengthen every muscle group.',
            image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2670',
            duration: '45 min',
            intensity: 'Sweaty'
        },
        {
            id: 'goals',
            title: 'Goals',
            description: 'Targeted classes to help you reach specific objectives, whether it\'s flexibility, posture, or glute strength.',
            image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&q=80&w=2670',
            duration: '35 min',
            intensity: 'Intense'
        },
        {
            id: 'barre',
            title: 'Barre',
            description: 'A fusion of ballet-inspired moves, Pilates, and strength training. Expect high reps and a deep burn.',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2670',
            duration: '30 min',
            intensity: 'Satisfying'
        }
    ];

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
                            <h3 className="most-popular-title">Most Popular {category.title}</h3>
                            <div className="classes-grid-scroll">
                                {/* Placeholder Content for Grid */}
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="class-card-small">
                                        <div className="class-card-thumb"></div>
                                        <div className="class-card-meta">
                                            <span className="class-card-title">{category.title} Flow {item}</span>
                                            <span className="class-card-duration">20 min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default ClassesPage;
