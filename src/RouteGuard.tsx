import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import SplashScreen from './components/SplashScreen';
import { wordFilterService } from './services/wordFilterService';

const RouteGuard = ({ children }) => {
  const { session, profile, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Wait until authentication check is complete

    const checkSuspension = async () => {
      if (session && profile && profile.role !== 'admin') {
        const suspension = await wordFilterService.getCurrentUserSuspension(profile.id);
        if (suspension) {
          if (location.pathname !== '/appeal') {
            navigate(`/appeal?actionId=${suspension.id}`, { replace: true });
          }
          return true;
        }
        if (profile.is_blocked) {
          if (location.pathname !== '/blocked') {
            navigate('/blocked', { replace: true });
          }
          return true;
        }
      }
      return false;
    };

    const handleRouting = async () => {
      const isSuspended = await checkSuspension();
      if (isSuspended) return;

      const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/callback' || location.pathname === '/appeal';

      if (session && profile) {
        // User is logged in and has a profile
        if (isAuthPage && location.pathname !== '/appeal') {
          navigate(profile.role === 'admin' ? '/admin/dashboard' : '/find', { replace: true });
        }
      } else if (session && !profile) {
        // User has a session but no profile (new user or deleted account).
        // Redirect to onboarding to create a profile.
        navigate('/create-profile', { replace: true });
      } else if (!session && !isAuthPage) {
        // User is not logged in and not on an auth page
        navigate('/login', { replace: true });
      }
    };

    handleRouting();
  }, [session, profile, loading, navigate, location.pathname]);

  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  return children;
};

export default RouteGuard;
