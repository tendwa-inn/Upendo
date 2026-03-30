import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useAppSettingsStore } from './stores/appSettingsStore';
import { useMatchStore } from './stores/matchStore';
import { useNotificationStore } from './stores/notificationStore';

import { supabase } from './lib/supabaseClient';
import { useNetworkStore } from './stores/networkStore';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';
import FindPage from './pages/FindPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SystemMessagesPage from './pages/SystemMessagesPage'; // Import the new page
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CreateProfilePage from './pages/CreateProfilePage';
import CallbackPage from './pages/CallbackPage';
// Admin Imports
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsersPage from './admin/AdminUsersPage';
import AdminPromosPage from './admin/AdminPromosPage';
import AdminReportsPage from './admin/AdminReportsPage';
import AdminDormantAccountsPage from './admin/AdminDormantAccountsPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import AdminLoginPage from './admin/AdminLoginPage';
import WordFilterManagement from './admin/WordFilterManagement';
import AdminGifsPage from './admin/AdminGifsPage';
import SystemMessenger from './admin/SystemMessenger';
import BlockedPage from './pages/BlockedPage';
import AppealPage from './pages/AppealPage';
import OfflineNotifier from './components/common/OfflineNotifier';
import './index.css';

import RouteGuard from './RouteGuard';

import usePresenceStore from './stores/presenceStore';

function App() {
  const { checkUser, user } = useAuthStore();
  const { getSettings } = useAppSettingsStore();

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      getSettings();
      useNotificationStore.getState().fetchNotifications();
      const unsubscribeMatches = useMatchStore.getState().initializeRealtime();
      usePresenceStore.getState().initializePresence();

      return () => {
        unsubscribeMatches();
        usePresenceStore.getState().unsubscribePresence();
      };
    }
  }, [user, getSettings]);

  useEffect(() => {
    const { setOnline, setOffline } = useNetworkStore.getState();

    const handleOnline = () => setOnline();
    const handleOffline = () => setOffline();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <OfflineNotifier />
      <RouteGuard>
        <div className={`min-h-screen`}>
          <AppRoutes />
          <Toaster position="top-center" />
        </div>
      </RouteGuard>
    </Router>
  );
}

const AppRoutes = () => {
    const { session, profile } = useAuthStore();

    if (session) {
      if (profile?.name) {
        if (profile.role === 'admin') {
          return (
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="promos" element={<AdminPromosPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="word-filter" element={<WordFilterManagement />} />
                <Route path="system-messenger" element={<SystemMessenger />} />
                <Route path="gifs" element={<AdminGifsPage />} />
                <Route path="dormant" element={<AdminDormantAccountsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
              <Route path="/*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          );
        } else {
          return (
            <Layout>
              <Routes>
                <Route path="/find" element={<FindPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/system-messages" element={<SystemMessagesPage />} />
                {/* Fallback for user paths */}
                <Route path="/*" element={<Navigate to="/find" replace />} />
              </Routes>
            </Layout>
          );
        }
      } else {
        return (
          <Routes>
            <Route path="/create-profile" element={<CreateProfilePage />} />
            <Route path="/*" element={<Navigate to="/create-profile" replace />} />
          </Routes>
        );
      }
    } else {
      // Not authenticated
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} /> {/* Admin specific login route */}
          <Route path="/appeal" element={<AppealPage />} />
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    }
  };

export default App;
