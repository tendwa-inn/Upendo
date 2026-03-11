import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft,
  ToggleRight,
  Shield
} from 'lucide-react';

const KeywordFilters: React.FC = () => {
  const { 
    keywordFilters, 
    addKeywordFilter, 
    updateKeywordFilter, 
    deleteKeywordFilter 
  } = useAdminStore();
  const { theme } = useThemeStore();
  const [showModal, setShowModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    keyword: '',
    category: 'profanity' as any,
    severity: 'medium' as any,
    autoAction: 'flag' as any,
    isActive: true,
  });

  const isDark = theme === 'dark';

  const handleOpenModal = (filter: any | null = null) => {
    if (filter) {
      setEditingFilter(filter);
      setFormData(filter);
    } else {
      setEditingFilter(null);
      setFormData({
        keyword: '',
        category: 'profanity',
        severity: 'medium',
        autoAction: 'flag',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFilter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFilter) {
        await updateKeywordFilter(editingFilter.id, formData);
      } else {
        await addKeywordFilter(formData.keyword, formData.category, formData.severity, formData.autoAction);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const FilterCard = ({ filter }: { filter: any }) => (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-mono font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {filter.keyword}
          </h3>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Category: {filter.category} | Severity: {filter.severity}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Auto-action: {filter.autoAction}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => updateKeywordFilter(filter.id, { isActive: !filter.isActive })} className={`p-2 rounded-md ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            {filter.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
          </button>
          <button onClick={() => handleOpenModal(filter)} className={`p-2 rounded-md ${isDark ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}>
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => deleteKeywordFilter(filter.id)} className={`p-2 rounded-md ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Keyword Filters
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage automated content filtering rules
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Filter
        </button>
      </div>

      {/* Filters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keywordFilters.map((filter) => (
          <FilterCard key={filter.id} filter={filter} />
        ))}
      </div>
      {keywordFilters.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No keyword filters found
          </h3>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Create a new filter to start moderating content automatically.
          </p>
        </div>
      )}

      {/* Filter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-lg w-full mx-4`}>
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingFilter ? 'Edit' : 'Create'} Keyword Filter
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Keyword
                </label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({...formData, keyword: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. spam, inappropriate"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="profanity">Profanity</option>
                    <option value="sexual">Sexual</option>
                    <option value="harassment">Harassment</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value as any})}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Auto-Action
                </label>
                <select
                  value={formData.autoAction}
                  onChange={(e) => setFormData({...formData, autoAction: e.target.value as any})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="none">None</option>
                  <option value="flag">Flag for Review</option>
                  <option value="block">Block Content</option>
                  <option value="review">Review & Block</option>
                </select>
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
                  {editingFilter ? 'Save Changes' : 'Create Filter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordFilters;