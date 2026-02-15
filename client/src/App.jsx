import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PoseDetector from './components/PoseDetector';
import FileUpload from './components/FileUpload';
import MediaAnalysis from './components/MediaAnalysis';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import WebsiteHome from './pages/WebsiteHome';
import ClassesPage from './pages/ClassesPage';
import PremiumPage from './pages/PremiumPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';
import Dashboard from './components/Dashboard';

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

// Route wrapper for public-only routes (Login/Register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-container">Loading...</div>;

  if (user) {
    return <Navigate to="/ai/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Main Website */}
      <Route path="/" element={<WebsiteHome />} />
      <Route path="/classes" element={<ClassesPage />} />

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
        element={
          <ProtectedRoute>
            <MainApp initialMode="home" />
          </ProtectedRoute>
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
