import React, { useState, useEffect } from 'react';
import '../pages/AdminDashboard.css';

const AdminClasses = () => {
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCat, setNewCat] = useState({ id: '', title: '', description: '', duration: '', intensity: '', image: '' });

    // Edit Category State
    const [editingCat, setEditingCat] = useState(null);

    // Add Video State
    const [addingVideoTo, setAddingVideoTo] = useState(null);
    const [newVideo, setNewVideo] = useState({ title: '', duration: '', thumbnail: '', videoUrl: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catRes, classRes] = await Promise.all([
                fetch('/api/content/categories'),
                // For simplicity in Admin, we can fetch all classes and filter them locally, 
                // or you could add a 'GET /api/content/classes' route that fetches all.
                // Assuming we add a get all classes route or we just fetch per category.
                // Let's assume we update the backend to allow GET /api/content/classes (no categoryId) in a moment.
                fetch('/api/content/classes')
            ]);

            if (catRes.ok) setCategories(await catRes.json());
            if (classRes.ok) setClasses(await classRes.json());

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/content/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            });
            if (res.ok) {
                const added = await res.json();
                setCategories([...categories, added]);
                setShowAddModal(false);
                setNewCat({ id: '', title: '', description: '', duration: '', intensity: '', image: '' });
            } else {
                alert('Failed to create category');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/content/categories/${editingCat._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCat)
            });
            if (res.ok) {
                const updated = await res.json();
                setCategories(categories.map(c => c._id === updated._id ? updated : c));
                setEditingCat(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        try {
            const videoData = { ...newVideo, categoryId: addingVideoTo.id };
            const res = await fetch('/api/content/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoData)
            });
            if (res.ok) {
                const added = await res.json();
                setClasses([...classes, added]);
                setAddingVideoTo(null);
                setNewVideo({ title: '', duration: '', thumbnail: '', videoUrl: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('Delete this video?')) return;
        try {
            const res = await fetch(`/api/content/classes/${id}`, { method: 'DELETE' });
            if (res.ok) setClasses(classes.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading classes...</div>;

    return (
        <div className="admin-subpage">
            <header className="admin-subpage-header">
                <h2>Class Management</h2>
                <button className="admin-btn-primary" onClick={() => setShowAddModal(true)}>Add New Category</button>
            </header>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>Create New Category</h3>
                        <form onSubmit={handleCreateCategory}>
                            <input type="text" placeholder="ID (e.g. essentials)" value={newCat.id} onChange={e => setNewCat({ ...newCat, id: e.target.value })} required />
                            <input type="text" placeholder="Title" value={newCat.title} onChange={e => setNewCat({ ...newCat, title: e.target.value })} required />
                            <textarea placeholder="Description" value={newCat.description} onChange={e => setNewCat({ ...newCat, description: e.target.value })} required />
                            <input type="text" placeholder="Duration (e.g. 28 min)" value={newCat.duration} onChange={e => setNewCat({ ...newCat, duration: e.target.value })} required />
                            <input type="text" placeholder="Intensity (e.g. Satisfying)" value={newCat.intensity} onChange={e => setNewCat({ ...newCat, intensity: e.target.value })} required />
                            <input type="text" placeholder="Image URL" value={newCat.image} onChange={e => setNewCat({ ...newCat, image: e.target.value })} required />
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="admin-btn-primary">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {editingCat && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>Edit Category</h3>
                        <form onSubmit={handleEditCategory}>
                            <input type="text" placeholder="ID" value={editingCat.id} onChange={e => setEditingCat({ ...editingCat, id: e.target.value })} required />
                            <input type="text" placeholder="Title" value={editingCat.title} onChange={e => setEditingCat({ ...editingCat, title: e.target.value })} required />
                            <textarea placeholder="Description" value={editingCat.description} onChange={e => setEditingCat({ ...editingCat, description: e.target.value })} required />
                            <input type="text" placeholder="Duration" value={editingCat.duration} onChange={e => setEditingCat({ ...editingCat, duration: e.target.value })} required />
                            <input type="text" placeholder="Intensity" value={editingCat.intensity} onChange={e => setEditingCat({ ...editingCat, intensity: e.target.value })} required />
                            <input type="text" placeholder="Image URL" value={editingCat.image} onChange={e => setEditingCat({ ...editingCat, image: e.target.value })} required />
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn-secondary" onClick={() => setEditingCat(null)}>Cancel</button>
                                <button type="submit" className="admin-btn-primary">Update Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Video Modal */}
            {addingVideoTo && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>Add Video to {addingVideoTo.title}</h3>
                        <form onSubmit={handleAddVideo}>
                            <input type="text" placeholder="Video Title" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} required />
                            <input type="text" placeholder="Duration (e.g. 15 min)" value={newVideo.duration} onChange={e => setNewVideo({ ...newVideo, duration: e.target.value })} required />
                            <input type="text" placeholder="Thumbnail URL" value={newVideo.thumbnail} onChange={e => setNewVideo({ ...newVideo, thumbnail: e.target.value })} />
                            <input type="text" placeholder="Vimeo/Video URL" value={newVideo.videoUrl} onChange={e => setNewVideo({ ...newVideo, videoUrl: e.target.value })} required />
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn-secondary" onClick={() => setAddingVideoTo(null)}>Cancel</button>
                                <button type="submit" className="admin-btn-primary">Save Video</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-categories-list">
                {categories.length === 0 ? (
                    <p>No categories found. Click "Add New Category" to begin.</p>
                ) : (
                    categories.map(cat => (
                        <div key={cat._id} className="admin-category-card">
                            <div className="admin-category-header">
                                <h3>{cat.title}</h3>
                                <div className="admin-category-actions">
                                    <button className="admin-btn-secondary" onClick={() => setEditingCat(cat)}>Edit</button>
                                    <button className="admin-btn-delete">Delete</button>
                                </div>
                            </div>
                            <p className="admin-category-desc">{cat.description}</p>
                            <div className="admin-category-meta">
                                <span>Duration: {cat.duration}</span>
                                <span>Intensity: {cat.intensity}</span>
                            </div>

                            {/* Display Classes under this Category */}
                            <div className="admin-classes-list" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                                <h4>Videos in this sequence:</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
                                    {classes.filter(c => c.categoryId === cat.id).map(cls => (
                                        <li key={cls._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span>{cls.title} ({cls.duration})</span>
                                            <button className="admin-btn-delete" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => handleDeleteVideo(cls._id)}>Remove</button>
                                        </li>
                                    ))}
                                    {classes.filter(c => c.categoryId === cat.id).length === 0 && (
                                        <li style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No videos added yet.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="admin-classes-block" style={{ marginTop: '1rem' }}>
                                <button className="admin-btn-outline" onClick={() => setAddingVideoTo(cat)}>Add Video to {cat.title}</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminClasses;
