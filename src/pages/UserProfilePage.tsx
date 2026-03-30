import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Heart, MoreVertical, Flag, Ban, X } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useMatchStore } from '../stores/matchStore';
import { useLikesStore } from '../stores/likesStore';
import { reportService } from '../services/reportService';
import { profileService } from '../services/profileService';
import { notificationService } from '../services/notificationService';
import FullScreenImageViewer from '../components/common/FullScreenImageViewer';
import ReportUserModal from '../components/modals/ReportUserModal';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const { createMatch, matches, selectMatch } = useMatchStore();
  const { usersWhoLikedMe, fetchUsersWhoLikedMe } = useLikesStore();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setUser(data);

        if (currentUser && currentUser.id !== data.id) {
          const lastViewed = localStorage.getItem(`viewed_${data.id}`);
          const now = new Date().getTime();

          if (!lastViewed || (now - Number(lastViewed)) > 24 * 60 * 60 * 1000) {
            notificationService.createNotification({
              user_id: data.id,
              actor_id: currentUser.id,
              type: 'profile_view',
            });
            localStorage.setItem(`viewed_${data.id}`, now.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
    fetchUsersWhoLikedMe();
  }, [userId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMenu && !target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-center">User not found</div>;
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const handleMessage = () => {
    if (!currentUser || !user) return;

    const existingMatch = matches.find(
      m => (m.user1.id === currentUser.id && m.user2.id === user.id) || (m.user1.id === user.id && m.user2.id === currentUser.id)
    );

    if (existingMatch) {
      selectMatch(existingMatch);
    } else {
      createMatch(user.id).then(newMatch => {
        if (newMatch) {
          selectMatch(newMatch);
        }
      });
    }
    navigate('/chat');
  };

  const handleBlockUser = async () => {
    if (!currentUser || !user) return;
    
    try {
      await profileService.blockUser(currentUser.id, user.id);
      
      alert('User blocked successfully');
      setShowMenu(false);
      navigate('/find');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    }
  };

  const handleReportUser = async (reason: string) => {
    if (!currentUser || !user) {
      console.error('No current user or target user found');
      alert('Error: User information not available');
      return;
    }
    
    console.log('Reporting user:', user.id, 'Reason:', reason);
    
    try {
      await reportService.createUserReport(user.id, currentUser.id, reason);
      
      alert('User reported successfully');
      setShowReportModal(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to report user: ' + (error as Error).message);
    }
  };

  const isDark = theme === 'dark';

  const DetailItem = ({ label, value, capitalize = false }) => {
    if (!value) return null;
    return (
      <div>
        <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{label}</p>
        <p className={`${capitalize ? 'capitalize' : ''} ${isDark ? 'text-white' : 'text-white'}`}>{value}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative bg-transparent">
      {/* Back Arrow & Menu */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Link to="/find" className={`p-2 rounded-full ${isDark ? 'bg-gray-800/50 text-white' : 'bg-black/20 text-white'} backdrop-blur-md`}>
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        {/* 3 Dots Menu */}
        <div className="relative menu-container">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-full ${isDark ? 'bg-gray-800/50 text-white' : 'bg-black/20 text-white'} backdrop-blur-md`}
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          
          {showMenu && (
            <div className={`absolute right-0 top-12 w-48 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={handleBlockUser}
                className={`w-full px-4 py-3 text-left flex items-center ${isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'} transition-colors`}
              >
                <Ban className="w-4 h-4 mr-3" />
                Block User
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className={`w-full px-4 py-3 text-left flex items-center ${isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'} transition-colors`}
              >
                <Flag className="w-4 h-4 mr-3" />
                Report User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 pt-16">
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(user.photos || []).map((photo, index) => (
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
            {(user.interests || []).map(interest => (
              <span key={interest} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-purple-600' : 'bg-gray-700'} text-white`}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>Here For</h3>
          <div className="flex flex-wrap gap-2">
            {(user.hereFor || []).map(purpose => (
              <span key={purpose} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-purple-600' : 'bg-gray-700'} text-white`}>
                {purpose}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <DetailItem label="Height" value={user.height ? `${user.height} cm` : null} />
          <DetailItem label="Education" value={user.education} capitalize={true} />
          <DetailItem label="Religion" value={user.religion} />
          <DetailItem label="First Date" value={user.firstDate?.replace('-',' ')} capitalize={true} />
          <DetailItem label="Drinking" value={user.drinking} capitalize={true} />
          <DetailItem label="Smoking" value={user.smoking} capitalize={true} />
          <DetailItem label="Kids" value={user.kids} />
          <DetailItem label="Occupation" value={user.occupation} />
          <DetailItem label="Love Language" value={user.love_language} />
          <DetailItem label="What are you here for?" value={user.relationship_intent} />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'}`}>
            <Heart className="w-5 h-5 inline mr-2" />
            Send Like
          </button>
          {usersWhoLikedMe.some(u => u.id === userId) && (
            <button onClick={handleMessage} className={`flex-1 py-3 rounded-full font-semibold border-2 ${isDark ? 'border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white' : 'border-white text-white hover:bg-white hover:text-purple-600'}`}>Message</button>
          )}
        </div>
      </div>

      {isViewerOpen && (
        <FullScreenImageViewer 
          images={user.photos || []}
          initialIndex={selectedImageIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-80 mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Report User</h3>
              <button onClick={() => setShowReportModal(false)}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                'Catfishing/Fake Profile',
                'Inappropriate Content',
                'Harassment/Abuse',
                'Spam/Scam',
                'Underage User',
                'Other'
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReportUser(reason)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
