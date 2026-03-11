import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  Search, 
  Filter, 
  Trash2, 
  Ban, 
  UserX, 
  Calendar,
  Mail,
  Shield,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const { 
    allUsers, 
    filteredUsers, 
    userFilter, 
    fetchAllUsers, 
    setUserFilter, 
    deleteUser, 
    suspendUser, 
    blockUser 
  } = useAdminStore();
  const { theme } = useThemeStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'delete' | 'suspend' | 'block';
    userId: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const isDark = theme === 'dark';

  const handleAction = (type: 'delete' | 'suspend' | 'block', userId: string, userName: string) => {
    setShowConfirmDialog({ type, userId, userName });
    setSelectedUser(null);
  };

  const confirmAction = async (duration?: number, reason?: string) => {
    if (!showConfirmDialog) return;

    const { type, userId } = showConfirmDialog;
    try {
      switch (type) {
        case 'delete':
          await deleteUser(userId);
          break;
        case 'suspend':
          await suspendUser(userId, duration || 7, reason || 'Policy violation');
          break;
        case 'block':
          await blockUser(userId, reason || 'Severe policy violation');
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setShowConfirmDialog(null);
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ConfirmationDialog = () => {
    const [duration, setDuration] = useState(7);
    const [reason, setReason] = useState('');

    if (!showConfirmDialog) return null;

    const { type, userName } = showConfirmDialog;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Confirm {type} action
          </h3>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you sure you want to {type} user "{userName}"?
          </p>
          
          {type === 'suspend' && (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Duration (days)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                min="1"
                max="365"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={3}
              placeholder="Enter reason for this action..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmDialog(null)}
              className={`px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => confirmAction(duration, reason)}
              className={`px-4 py-2 rounded-md ${
                type === 'delete' 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : type === 'suspend'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Confirm {type}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage platform users and their subscriptions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search users..."
              value={userFilter.search}
              onChange={(e) => setUserFilter({ search: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
        <select
          value={userFilter.subscription}
          onChange={(e) => setUserFilter({ subscription: e.target.value as any })}
          className={`px-4 py-2 border rounded-lg ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Subscriptions</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      {/* Users Table */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  User
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Subscription
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Joined
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.age} years old
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscription)}`}>
                      {user.subscription.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        Active
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {new Date(user.dateOfBirth).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction('suspend', user.id, user.name)}
                        className={`p-1 rounded ${isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-500'}`}
                        title="Suspend user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('block', user.id, user.name)}
                        className={`p-1 rounded ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                        title="Block user"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('delete', user.id, user.name)}
                        className={`p-1 rounded ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  );
};

export default UserManagement;