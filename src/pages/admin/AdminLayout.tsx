import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Funnel, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

const AdminLayout: React.FC = () => {
  const { currentAdmin, logout } = useAdminStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentAdmin) {
      navigate('/login');
    }
  }, [currentAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: TrendingUp },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: AlertTriangle },
    { name: 'System Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Keyword Filters', href: '/admin/filters', icon: Funnel },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (!currentAdmin) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className={`fixed inset-0 ${isDark ? 'bg-gray-900/80' : 'bg-gray-900/80'}`} onClick={() => setIsSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-64 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Admin Panel
              </h2>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? isDark
                          ? 'bg-purple-900 text-purple-200'
                          : 'bg-purple-100 text-purple-700'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-col flex-grow h-full ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center h-16 px-4">
            <div className="flex items-center">
              <Shield className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'} mr-3`} />
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Upendo Admin
              </h1>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-purple-900 text-purple-200'
                        : 'bg-purple-100 text-purple-700'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* User info and logout */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentAdmin.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentAdmin.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-md ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className={`sticky top-0 z-40 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                className={`lg:hidden p-2 rounded-md ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;