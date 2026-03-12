import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';
import FindPage from './pages/FindPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import SystemMessages from './pages/admin/SystemMessages';
import KeywordFilters from './pages/admin/KeywordFilters';
import AdminSettings from './pages/admin/AdminSettings';
import './index.css';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const getThemeClass = () => {
    if (user?.subscription === 'vip') {
      return 'gradient-vip';
    }
    return theme === 'dark' ? 'gradient-pro' : 'gradient-romantic';
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
        <SplashScreen onComplete={handleSplashComplete} />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${getThemeClass()}`}>
        <Routes>
          {isAuthenticated ? (
            <Route path="/*" element={<AuthenticatedApp />} />
          ) : (
            <Route path="/*" element={<UnauthenticatedApp />} />
          )}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="messages" element={<SystemMessages />} />
            <Route path="filters" element={<KeywordFilters />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

const AuthenticatedApp = () => (
  <Layout>
    <Routes>
      <Route path="find" element={<FindPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="discover" element={<DiscoverPage />} />
      <Route path="user/:userId" element={<UserProfilePage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="/" element={<Navigate to="find" replace />} />
    </Routes>
  </Layout>
);

const UnauthenticatedApp = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
