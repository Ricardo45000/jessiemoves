import React, { useState, useContext } from 'react';
import PoseDetector from './components/PoseDetector';
import FileUpload from './components/FileUpload';
import MediaAnalysis from './components/MediaAnalysis';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';
import Dashboard from './components/Dashboard';

// Separate component for the content to use the Context
const AppContent = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState('login'); // login or register
  const [appMode, setAppMode] = useState('home'); // home, live, upload, analysis
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  // Not Logged In
  if (!user) {
    if (authMode === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
    } else {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
  }

  // Logged In - Main App Flow
  const handleFileSelect = (media) => {
    setSelectedMedia(media);
    setAppMode('analysis');
  };

  const renderContent = () => {
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

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
