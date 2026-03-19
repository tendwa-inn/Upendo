import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabaseClient'; // Import supabase client
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
import CreateProfilePage from './pages/CreateProfilePage';
import CallbackPage from './pages/CallbackPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import SystemMessages from './pages/admin/SystemMessages';
import KeywordFilters from './pages/admin/KeywordFilters';
import AdminSettings from './pages/admin/AdminSettings';
import './index.css';

function App() {
  return (
    <Router>
      <div className={`min-h-screen`}>
        <AppRoutes />
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

const AppRoutes = () => {
  const { session, loading, profile } = useAuthStore();

  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (session) {
    // User is authenticated
    if (profile?.name) { // Check if profile is complete
      // and has a profile, show protected app routes
      return (
        <Layout>
          <Routes>
            <Route path="/find" element={<FindPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/*" element={<Navigate to="/find" replace />} />
          </Routes>
        </Layout>
      );
    } else {
      // and has NO profile, force onboarding
      return (
        <Routes>
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/*" element={<Navigate to="/create-profile" replace />} />
        </Routes>
      );
    }
  }

  // User is not authenticated, show public routes
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
