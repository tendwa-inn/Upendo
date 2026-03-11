import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Eye,
  EyeOff,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';

const SystemMessages: React.FC = () => {
  const { 
    systemMessages, 
    createSystemMessage, 
    updateSystemMessage, 
    deleteSystemMessage 
  } = useAdminStore();
  const { theme } = useThemeStore();
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as any,
    targetAudience: 'all' as any,
    deliveryMethod: 'inbox' as any,
    isActive: true,
  });

  const isDark = theme === 'dark';

  const handleOpenModal = (message: any | null = null) => {
    if (message) {
      setEditingMessage(message);
      setFormData(message);
    } else {
      setEditingMessage(null);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        targetAudience: 'all',
        deliveryMethod: 'inbox',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMessage) {
        await updateSystemMessage(editingMessage.id, formData);
      } else {
        await createSystemMessage(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const MessageCard = ({ message }: { message: any }) => (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {message.title}
          </h3>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {message.content}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => handleOpenModal(message)} className={`p-2 rounded-md ${isDark ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}>
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => deleteSystemMessage(message.id)} className={`p-2 rounded-md ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            message.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {message.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`inline-flex items-center text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Send className="w-3 h-3 mr-1" /> {message.deliveryMethod}
          </span>
          <span className={`inline-flex items-center text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Users className="w-3 h-3 mr-1" /> {message.targetAudience}
          </span>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          Created: {new Date(message.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            System Messages
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Broadcast messages to users via inbox or story
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Message
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-6">
        {systemMessages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
        {systemMessages.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No system messages found
            </h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Create a new message to broadcast to users.
            </p>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-lg w-full mx-4`}>
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingMessage ? 'Edit' : 'Create'} System Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. Welcome to Upendo Premium"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={4}
                  placeholder="Enter message content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free Users</option>
                    <option value="pro">Pro Users</option>
                    <option value="vip">VIP Users</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Delivery Method
                  </label>
                  <select
                    value={formData.deliveryMethod}
                    onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value as any})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="inbox">Inbox</option>
                    <option value="story">Story</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 rounded-md ${
                    isDark 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  {editingMessage ? 'Save Changes' : 'Create Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMessages;