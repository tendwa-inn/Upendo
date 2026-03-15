import React, { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { UserReport } from '../../types/admin';
import { useThemeStore } from '../../stores/themeStore';
import { 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { 
    reports, 
    allUsers, 
    systemMessages, 
    keywordFilters,
    fetchAllUsers 
  } = useAdminStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const isDark = theme === 'dark';

  // Calculate stats
  const stats = {
    totalUsers: allUsers.length,
    freeUsers: allUsers.filter(user => user.subscription === 'free').length,
    proUsers: allUsers.filter(user => user.subscription === 'pro').length,
    vipUsers: allUsers.filter(user => user.subscription === 'vip' || user.subscription === 'premium').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    underReviewReports: reports.filter(r => r.status === 'under_review').length,
    activeMessages: systemMessages.filter(msg => msg.isActive).length,
    activeFilters: keywordFilters.filter(f => f.isActive).length,
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) => (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  const RecentReport = ({ report }: { report: UserReport }) => (
    <div className={`flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${
          report.priority === 'urgent' ? 'bg-red-100' :
          report.priority === 'high' ? 'bg-orange-100' :
          report.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
        }`}>
          <AlertTriangle className={`w-4 h-4 ${
            report.priority === 'urgent' ? 'text-red-600' :
            report.priority === 'high' ? 'text-orange-600' :
            report.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {report.reason}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Reported by user {report.reportedBy}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          report.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {report.status}
        </span>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Admin Dashboard
        </h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Overview of platform activity and moderation status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Free Users" 
          value={stats.freeUsers} 
          icon={Users} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Pro Users" 
          value={stats.proUsers} 
          icon={Users} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="VIP Users" 
          value={stats.vipUsers} 
          icon={Users} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Summary */}
        <div>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Reports Summary
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className={`text-center p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pendingReports}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
              </div>
              <div className={`text-center p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.underReviewReports}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Under Review</p>
              </div>
              <div className={`text-center p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            System Status
          </h2>
          <div className="space-y-4">
            <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-blue-500 mr-3" />
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Active System Messages</span>
                </div>
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeMessages}
                </span>
              </div>
            </div>
            <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-green-500 mr-3" />
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Active Keyword Filters</span>
                </div>
                <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeFilters}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Reports
        </h2>
        <div className="space-y-4">
          {reports.slice(0, 5).map((report) => (
            <RecentReport key={report.id} report={report} />
          ))}
          {reports.length === 0 && (
            <div className={`text-center py-8 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No reports found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;