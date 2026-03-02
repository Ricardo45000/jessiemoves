import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const VideoPlayerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchVideo();
    }, [id]);

    const fetchVideo = async () => {
        try {
            const res = await fetch(`/api/content/class/${id}`);
            if (!res.ok) throw new Error('Video not found');
            const data = await res.json();
            setVideo(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ backgroundColor: '#1A1A1A', minHeight: '100vh', color: 'white' }}>
                <Navbar theme="dark" alwaysTransparent={false} />
                <div style={{ padding: '150px 20px', textAlign: 'center' }}>Loading video...</div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div style={{ backgroundColor: '#1A1A1A', minHeight: '100vh', color: 'white' }}>
                <Navbar theme="dark" alwaysTransparent={false} />
                <div style={{ padding: '150px 20px', textAlign: 'center' }}>
                    <h2>{error || 'Video not found'}</h2>
                    <button
                        onClick={() => navigate('/classes')}
                        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', backgroundColor: 'transparent', color: 'white', border: '1px solid white' }}
                    >
                        Back to Classes
                    </button>
                </div>
            </div>
        );
    }

    // Attempt to parse Vimeo ID to use their clean player embed, or fallback to exact URL
    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('vimeo.com')) {
            const vimeoId = url.split('/').pop();
            return `https://player.vimeo.com/video/${vimeoId}`;
        }
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URL(url).searchParams;
            const ytId = urlParams.get('v');
            return `https://www.youtube.com/embed/${ytId}`;
        }
        if (url.includes('youtu.be')) {
            const ytId = url.split('/').pop();
            return `https://www.youtube.com/embed/${ytId}`;
        }
        return url; // Fallback
    };

    return (
        <div style={{ backgroundColor: '#1A1A1A', minHeight: '100vh', color: 'white', fontFamily: "'Euclid Circular A', sans-serif" }}>
            <Navbar theme="dark" alwaysTransparent={false} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 40px 20px' }}>
                <button
                    onClick={() => navigate('/classes')}
                    style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span>←</span> Back to Classes
                </button>

                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'black', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <iframe
                        src={getEmbedUrl(video.videoUrl)}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                    ></iframe>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h1 style={{ fontFamily: "'Canela', 'Playfair Display', serif", fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '400' }}>{video.title}</h1>
                    <div style={{ display: 'flex', gap: '15px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        <span>Duration: {video.duration}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerPage;
