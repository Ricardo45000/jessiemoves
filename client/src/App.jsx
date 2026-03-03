import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PoseDetector from './components/PoseDetector';
import FileUpload from './components/FileUpload';
import MediaAnalysis from './components/MediaAnalysis';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import WebsiteHome from './pages/WebsiteHome';
import ClassesPage from './pages/ClassesPage';
import PremiumPage from './pages/PremiumPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';
import Dashboard from './components/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

// Main Application Component (Protected)
const MainApp = ({ initialMode = 'home' }) => {
  const { user, logout } = useContext(AuthContext);
  const [appMode, setAppMode] = useState(initialMode);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleFileSelect = (media) => {
    setSelectedMedia(media);
    setAppMode('analysis');
  };

  switch (appMode) {
    case 'live':
      return (
        <div style={{ position: 'relative' }}>
          <button className="back-btn" onClick={() => setAppMode('home')}>
            ← Back
          </button>
          <PoseDetector />
        </div>
      );
    case 'upload':
      return (
        <div style={{ position: 'relative' }}>
          <button className="back-btn" onClick={() => setAppMode('home')}>
            ← Back
          </button>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
      );
    case 'analysis':
      return (
        <MediaAnalysis
          fileUrl={selectedMedia.url}
          type={selectedMedia.type}
          onBack={() => setAppMode('upload')}
        />
      );
    case 'home':
    default:
      return (
        <Dashboard
          user={user}
          onLogout={logout}
          onStartLive={() => setAppMode('live')}
          onStartUpload={() => setAppMode('upload')}
        />
      );
  }
};

// Route wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-container">Loading Application...</div>;

  if (!user) {
    return <Navigate to="/ai/login" replace />;
  }

  return children;
};

// Route wrapper for Admin exclusively
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-container">Loading Application...</div>;

  if (!user || user.email !== 'moloney.jessie@gmail.com') {
    return <Navigate to="/ai/dashboard" replace />;
  }

  return children;
};

// Route wrapper for public-only routes (Login/Register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-container">Loading...</div>;

  if (user) {
    return <Navigate to="/ai/dashboard" replace />;
  }

  return children;
};

// Dynamic Dashboard Route (Redirects admin to admin panel)
const DashboardRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-container">Loading Application...</div>;

  if (!user) {
    return <Navigate to="/ai/login" replace />;
  }

  if (user.email === 'moloney.jessie@gmail.com') {
    return <Navigate to="/ai/admin" replace />;
  }

  return <MainApp initialMode="home" />;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Main Website */}
      <Route path="/" element={<WebsiteHome />} />
      <Route path="/classes" element={<ClassesPage />} />
      <Route path="/play/:id" element={<VideoPlayerPage />} />

      {/* AI App Landing */}
      <Route path="/ai" element={<LandingPage />} />

      <Route
        path="/ai/login"
        element={
          <PublicRoute>
            <LoginPage onSwitchToRegister={() => navigate('/ai/register')} />
          </PublicRoute>
        }
      />

      <Route
        path="/ai/register"
        element={
          <PublicRoute>
            <RegisterPage onSwitchToLogin={() => navigate('/ai/login')} />
          </PublicRoute>
        }
      />

      <Route
        path="/ai/dashboard"
        element={<DashboardRoute />}
      />

      <Route
        path="/ai/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/ai/upload"
        element={
          <ProtectedRoute>
            <MainApp initialMode="upload" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai/premium"
        element={
          <ProtectedRoute>
            <PremiumPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy Redirects - Catch old bookmarks */}
      <Route path="/login" element={<Navigate to="/ai/login" replace />} />
      <Route path="/register" element={<Navigate to="/ai/register" replace />} />
      <Route path="/dashboard" element={<Navigate to="/ai/dashboard" replace />} />

      {/* Catch all - redirect to Website Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const GlobalStyleInjector = () => {
  const location = useLocation();
  const [fullConfig, setFullConfig] = useState(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const res = await fetch('/api/style');
        if (res.ok) {
          const data = await res.json();
          setFullConfig(data);
        }
      } catch (err) {
        console.error("Failed to load global styles:", err);
      }
    };

    fetchStyles();
  }, []);

  useEffect(() => {
    if (!fullConfig) return;

    // Determine active section based on route
    let activeConfig = fullConfig.home;
    if (location.pathname.startsWith('/classes') || location.pathname.startsWith('/play')) {
      activeConfig = fullConfig.classes;
    }

    const root = document.documentElement;
    root.style.setProperty('--bg-primary', activeConfig.colors.backgroundColor);
    root.style.setProperty('--body-bg', activeConfig.colors.backgroundColor); // some older paths might use body-bg
    root.style.setProperty('--text-primary', activeConfig.colors.primaryTextColor);
    root.style.setProperty('--text-secondary', activeConfig.colors.secondaryTextColor);
    root.style.setProperty('--accent-pink', activeConfig.colors.accentColor);
    root.style.setProperty('--font-family', activeConfig.typography.bodyFont);

    // Apply heading font specifically if needed (can be used on h1, h2, etc manually)
    root.style.setProperty('--font-heading', activeConfig.typography.headingFont);

    // Remove direct body manipulation to prevent overriding page-specific backgrounds and text
    // document.body.style.fontFamily = activeConfig.typography.bodyFont;
    // document.body.style.backgroundColor = activeConfig.colors.backgroundColor;
    // document.body.style.color = activeConfig.colors.primaryTextColor;
  }, [location.pathname, fullConfig]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyleInjector />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
