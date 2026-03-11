import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  Settings, 
  Bell, 
  Shield, 
  UserPlus,
  Save,
  LogOut
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { currentAdmin, logout } = useAdminStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: {
      newReports: true,
      escalations: true,
      systemHealth: false,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30, // in minutes
    },
  });

  const isDark = theme === 'dark';

  const handleSave = () => {
    // Mock save - in real app this would be an API call
    alert('Settings saved!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Admin Settings
        </h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your admin account and notification preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Notification Settings */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Bell className="w-5 h-5 inline-block mr-2" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Reports</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.newReports}
                  onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, newReports: e.target.checked}})}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Escalations</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.escalations}
                  onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, escalations: e.target.checked}})}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>System Health Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.systemHealth}
                  onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, systemHealth: e.target.checked}})}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-5 h-5 inline-block mr-2" />
              Security Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Two-Factor Authentication</span>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings({...settings, security: {...settings.security, twoFactorAuth: e.target.checked}})}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({...settings, security: {...settings.security, sessionTimeout: parseInt(e.target.value)}})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="5"
                  max="120"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Management (for super admins) */}
        {currentAdmin?.role === 'admin' && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <UserPlus className="w-5 h-5 inline-block mr-2" />
              Admin Management
            </h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Invite and manage other admins and moderators.
            </p>
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite New Admin/Mod
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 space-x-4">
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;