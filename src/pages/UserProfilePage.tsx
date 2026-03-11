import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockUsers } from '../data/mockData';
import { ArrowLeft, Heart, MoreVertical, Flag, Ban } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { useMatchStore } from '../stores/matchStore';
import { useLocation } from 'react-router-dom';
import FullScreenImageViewer from '../components/common/FullScreenImageViewer';
import ReportUserModal from '../components/modals/ReportUserModal';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { theme } = useThemeStore();
  const { user: currentUser, useMessageRequest } = useAuthStore();
  const { submitReport } = useAdminStore();
  const { createMatch, matches, selectMatch } = useMatchStore();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || mockUsers.find((u) => u.id === userId);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) {
    return <div className="p-4 text-center">User not found</div>;
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const handleReportSubmit = (reason: string, details: string) => {
    if (currentUser) {
      submitReport(currentUser.id, user.id, reason, details);
      setIsReportModalOpen(false);
      // In a real app, you'd show a toast notification here
      alert('Report submitted. Thank you for your feedback.');
    }
  };

  const handleMessage = () => {
    if (!currentUser || !user) return;

    if (currentUser.subscription === 'free') {
      if (useMessageRequest()) {
        // Proceed with messaging
      } else {
        alert('You have no message requests left this week. Upgrade to send more!');
        return;
      }
    }

    const existingMatch = matches.find(
      m => (m.user1.id === currentUser.id && m.user2.id === user.id) || (m.user1.id === user.id && m.user2.id === currentUser.id)
    );

    if (existingMatch) {
      selectMatch(existingMatch);
    } else {
      const newMatch = createMatch(currentUser, user);
      selectMatch(newMatch);
    }
    navigate('/chat');
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen relative bg-transparent">
      {/* Back Arrow & Menu */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Link to="/find" className={`p-2 rounded-full ${isDark ? 'bg-gray-800/50 text-white' : 'bg-black/20 text-white'} backdrop-blur-md`}>
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-full ${isDark ? 'bg-gray-800/50 text-white' : 'bg-black/20 text-white'} backdrop-blur-md`}>
            <MoreVertical className="w-6 h-6" />
          </button>
          {isMenuOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
              <div className="py-1">
                <button onClick={() => { setIsReportModalOpen(true); setIsMenuOpen(false); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Flag className="w-4 h-4 mr-2" /> Report
                </button>
                <button className={`w-full text-left flex items-center px-4 py-2 text-sm ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}>
                  <Ban className="w-4 h-4 mr-2" /> Block
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 pt-16">
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {user.photos.map((photo, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageClick(index)}>
              <img src={photo} alt={`${user.name} photo ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-white'}`}>{user.name}, {user.age}</h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-white/90'}`}>{user.bio}</p>
        </div>

        <div className="mt-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map(interest => (
              <span key={interest} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-purple-600' : 'bg-gray-700'} text-white`}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>Here For</h3>
          <div className="flex flex-wrap gap-2">
            {user.hereFor.map(purpose => (
              <span key={purpose} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-purple-600' : 'bg-gray-700'} text-white`}>
                {purpose}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Height</p>
            <p className={`${isDark ? 'text-white' : 'text-white'}`}>{user.height ? `${user.height} cm` : 'Not specified'}</p>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Education</p>
            <p className={`capitalize ${isDark ? 'text-white' : 'text-white'}`}>{user.education || 'Not specified'}</p>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Religion</p>
            <p className={`${isDark ? 'text-white' : 'text-white'}`}>{user.religion || 'Not specified'}</p>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>First Date</p>
            <p className={`capitalize ${isDark ? 'text-white' : 'text-white'}`}>{user.firstDate?.replace('-',' ') || 'Not specified'}</p>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Drinking</p>
            <p className={`capitalize ${isDark ? 'text-white' : 'text-white'}`}>{user.drinking || 'Not specified'}</p>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Smoking</p>
            <p className={`capitalize ${isDark ? 'text-white' : 'text-white'}`}>{user.smoking || 'Not specified'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'}`}>
            <Heart className="w-5 h-5 inline mr-2" />
            Send Like
          </button>
          {(!user.canMessage && currentUser?.subscription === 'free') ? null : (
            <button onClick={handleMessage} className={`flex-1 py-3 rounded-full font-semibold border-2 ${isDark ? 'border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white' : 'border-white text-white hover:bg-white hover:text-purple-600'}`}>
              Message
            </button>
          )}
        </div>
      </div>

      {isViewerOpen && (
        <FullScreenImageViewer 
          images={user.photos}
          initialIndex={selectedImageIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      <ReportUserModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default UserProfilePage;
