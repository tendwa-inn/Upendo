import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, User, Compass, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

import { useThemeStore } from '../stores/themeStore';

interface LayoutProps {
  children: React.ReactNode;
}

import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import ProfileCompletionModal from './modals/ProfileCompletionModal';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { isProfileCompletionModalOpen, closeProfileCompletionModal } = useUiStore();
  const isFindPage = location.pathname === '/find';

  const getNavColors = () => {
    if (theme === 'dark') {
      return {
        find: 'text-gray-300',
        discover: 'text-gray-300',
        chat: 'text-gray-400',
        profile: 'text-white',
      };
    }
    return {
      find: 'text-pink-500',
      discover: 'text-pink-500',
      chat: 'text-purple-500',
      profile: 'text-indigo-500',
    };
  };

  const navItems = [
    {
      path: '/find',
      icon: Heart,
      label: 'FIND',
      color: getNavColors().find,
    },
    {
      path: '/discover',
      icon: Compass,
      label: 'DISCOVER',
      color: getNavColors().discover,
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'CHAT',
      color: getNavColors().chat,
    },
    {
      path: '/profile',
      icon: User,
      label: 'PROFILE',
      color: getNavColors().profile,
    },
  ];

  const getThemeClass = () => {
    if (user?.subscription === 'vip') {
      return 'gradient-vip';
    }
    return theme === 'dark' ? 'gradient-pro' : 'gradient-romantic';
  };

  return (
    <div className={`relative min-h-screen ${getThemeClass()}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-stone-900" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/Logo-White.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {isProfileCompletionModalOpen && (
          <ProfileCompletionModal onClose={closeProfileCompletionModal} />
        )}

        {/* Bottom Navigation */}
        {!isProfileCompletionModalOpen && (
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 pb-safe-area-bottom z-50",
          "bg-transparent",
          "border-transparent"
        )}>
          <div className="flex justify-around items-center h-20 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center w-20 h-16 rounded-2xl transition-all duration-300',
                    'hover:bg-white/20 active:scale-95',
                    isActive
                      ? 'bg-white/30 shadow-lg scale-105'
                      : user?.subscription === 'vip'
                      ? 'bg-black'
                      : 'bg-transparent'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 mb-1 transition-all duration-300',
                      isActive ? item.color : user?.subscription === 'vip' ? 'text-orange-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-600',
                      isActive && 'drop-shadow-lg'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-bold transition-all duration-300',
                      isActive ? item.color : user?.subscription === 'vip' ? 'text-orange-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;