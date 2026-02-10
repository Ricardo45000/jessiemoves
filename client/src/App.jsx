import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PoseDetector from './components/PoseDetector';
import FileUpload from './components/FileUpload';
import MediaAnalysis from './components/MediaAnalysis';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PremiumPage from './pages/PremiumPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';
import Dashboard from './components/Dashboard';

// Main Application Component (Protected)
const MainApp = ({ initialMode = 'home' }) => {
  const { user, logout } = useContext(AuthContext);
  const [appMode, setAppMode] = useState(initialMode); // home, live, upload, analysis
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Handle internal modes (Dashboard vs Tools)
  const handleFileSelect = (media) => {
    setSelectedMedia(media);
    setAppMode('analysis');
  };

  switch (appMode) {
    case 'live':
      return (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAppMode('home')}
            style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, padding: '10px 15px', background: '#555', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Back
          </button>
          <PoseDetector />
        </div>
      );
    case 'upload':
      return (
        <div className="upload-screen">
          <button
            onClick={() => setAppMode('home')}
            style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, padding: '10px 15px', background: '#555', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Back
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

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route wrapper for public-only routes (Login/Register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div></div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage onSwitchToRegister={() => navigate('/register')} />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage onSwitchToLogin={() => navigate('/login')} />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainApp initialMode="home" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <MainApp initialMode="upload" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/premium"
        element={
          <ProtectedRoute>
            <PremiumPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
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
