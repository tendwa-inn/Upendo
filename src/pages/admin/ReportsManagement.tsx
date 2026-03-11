import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  AlertTriangle, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  Shield,
  Ban,
  MessageSquare,
  UserX,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ReportsManagement: React.FC = () => {
  const { 
    reports, 
    assignReport, 
    resolveReport, 
    escalateToAdmin,
    currentAdmin 
  } = useAdminStore();
  const { theme } = useThemeStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState<string | null>(null);
  const [resolutionData, setResolutionData] = useState({
    action: 'warning' as 'warning' | 'suspension' | 'permanent_ban' | 'content_removal' | 'dismiss',
    duration: 7,
    reason: ''
  });

  const isDark = theme === 'dark';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolve = async () => {
    if (!showResolutionModal) return;
    
    try {
      const action = {
        id: `action-${Date.now()}`,
        reportId: showResolutionModal,
        action: resolutionData.action as any, // Cast to any to avoid type error
        duration: resolutionData.action === 'suspension' ? resolutionData.duration : undefined,
        reason: resolutionData.reason,
        performedBy: currentAdmin?.id || '',
        performedAt: new Date(),
        expiresAt: resolutionData.action === 'suspension' 
          ? new Date(Date.now() + resolutionData.duration * 24 * 60 * 60 * 1000)
          : undefined,
        isActive: true,
      };

      await resolveReport(showResolutionModal, action);
      setShowResolutionModal(null);
      setResolutionData({ action: 'warning', duration: 7, reason: '' });
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const ReportCard = ({ report }: { report: any }) => {
    const isExpanded = selectedReport === report.id;
    const isAssigned = report.assignedTo === currentAdmin?.id;

    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${getPriorityColor(report.priority)}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </span>
                </div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {report.reason.replace('_', ' ').toUpperCase()}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Reported by user {report.reportedBy} against user {report.reportedUserId}
                </p>
                <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {report.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedReport(isExpanded ? null : report.id)}
              className={`p-2 rounded-md ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {report.status === 'pending' && (
                  <button
                    onClick={() => assignReport(report.id, currentAdmin?.id || '')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Assign to Me
                  </button>
                )}
                
                {report.status === 'under_review' && isAssigned && (
                  <button
                    onClick={() => setShowResolutionModal(report.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                  </button>
                )}

                {currentAdmin?.role === 'moderator' && report.status === 'under_review' && (
                  <button
                    onClick={() => escalateToAdmin(report.id, 'Requires admin intervention')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Escalate to Admin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(report.createdAt).toLocaleString()}
          </div>
          {report.assignedTo && (
            <div className="flex items-center text-sm text-gray-500">
              <User className="w-4 h-4 mr-2" />
              Assigned to {report.assignedTo}
            </div>
          )}
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
            Reports Management
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and moderate user reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            Total: {reports.length}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending: {reports.filter(r => r.status === 'pending').length}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Under Review: {reports.filter(r => r.status === 'under_review').length}
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
        {reports.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No reports found
            </h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Great! There are no pending reports to review.
            </p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Resolve Report
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Action
                </label>
                <select
                  value={resolutionData.action}
                  onChange={(e) => setResolutionData({...resolutionData, action: e.target.value as any})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="warning">Warning</option>
                  <option value="suspension">Suspension</option>
                  <option value="permanent_ban">Permanent Ban</option>
                  <option value="content_removal">Content Removal</option>
                  <option value="dismiss">Dismiss Report</option>
                </select>
              </div>

              {resolutionData.action === 'suspension' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={resolutionData.duration}
                    onChange={(e) => setResolutionData({...resolutionData, duration: parseInt(e.target.value)})}
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

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason
                </label>
                <textarea
                  value={resolutionData.reason}
                  onChange={(e) => setResolutionData({...resolutionData, reason: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  placeholder="Enter reason for this action..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowResolutionModal(null)}
                className={`px-4 py-2 rounded-md ${
                  isDark 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;