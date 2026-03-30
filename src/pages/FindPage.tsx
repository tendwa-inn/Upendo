import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeStore } from '../stores/swipeStore';
import { useMatchStore } from '../stores/matchStore';

import { useDiscoveryStore } from '../stores/discoveryStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useLikesStore } from '../stores/likesStore';
import { useViewsStore } from '../stores/viewsStore';
import SwipeCard from '../components/swipe/SwipeCard';
import UserListItem from '../components/UserListItem';
import FilterModal from '../components/modals/FilterModal';
import { SlidersHorizontal, Bell, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhotoWall from '../components/PhotoWall';
import ProfileCompletionWall from '../components/ProfileCompletionWall';
import MatchAnimation from '../components/modals/MatchAnimation';
import { useMatchAnimationStore } from '../stores/matchAnimationStore';

const FindPage: React.FC = () => {
  const { swipeRight, swipeLeft, loadSwipeState } = useSwipeStore();
  const { potentialMatches, fetchPotentialMatches } = useDiscoveryStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { user: currentUser, profile } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { createMatch, matches } = useMatchStore();
  const { usersWhoLikedMe, fetchUsersWhoLikedMe } = useLikesStore();
  const { usersWhoViewedMe, fetchUsersWhoViewedMe } = useViewsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [isInterstitialVisible, setIsInterstitialVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { buttonStyle } = useUiStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'views' | 'likes'>('discover');
  const { isMatchAnimationVisible, matchedUser, hideMatchAnimation } = useMatchAnimationStore();



  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchPotentialMatches();
      await fetchUsersWhoLikedMe();
      await fetchUsersWhoViewedMe();
      setIsLoading(false);
    };
    loadData();
  }, [fetchUsersWhoLikedMe, fetchUsersWhoViewedMe]);

  useEffect(() => {
    loadSwipeState();
    fetchNotifications();
  }, [loadSwipeState, fetchNotifications]);

  const handleSwipeRight = async (userId: string) => {
    const swipedUser = potentialMatches.find((u) => u.id === userId);
    if (!swipedUser) return;

    const { matched } = await swipeRight(userId);
    if (matched) {
      useMatchAnimationStore.getState().showMatchAnimation(swipedUser);
    }
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleSwipeLeft = (userId: string) => {
    swipeLeft(userId);
    setCurrentCardIndex(prev => prev + 1);
  };





  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-white bg-gradient-to-b from-[#22090E] to-[#2E0C13]">Loading...</div>;
  }

  const getMissingFields = () => {
    const missing = [];
    if (!profile?.bio) missing.push('Add a bio');
    if (!profile?.relationship_intent) missing.push('Set what you are here for');
    if (!profile?.photos || profile.photos.length < 1) missing.push('Upload at least one photo');
    return missing;
  };

  const missingFields = getMissingFields();

  if (missingFields.length > 0) {
    return <ProfileCompletionWall missingFields={missingFields} />;
  }

  const handleLikeBack = async (userId: string) => {
    await swipeRight(userId);
    // Refresh the likes list after liking back
    await fetchUsersWhoLikedMe();
  };

  const currentMatch = potentialMatches[currentCardIndex];
  const handleApplyFilters = (newFilters: any) => setFilters(newFilters);

  return (
    <div className="relative h-screen w-screen text-white bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
      {isMatchAnimationVisible && matchedUser && (
        <MatchAnimation matchedUser={matchedUser} onClose={hideMatchAnimation} />
      )}

      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 w-full max-w-md mx-auto flex items-center p-4 pt-safe-top">
        <button onClick={() => setIsFilterModalOpen(true)} className="p-2"><SlidersHorizontal className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold flex-1 text-center">Find</h1>
        <Link to="/notifications" className="p-2 relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full text-xs flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </Link>
      </div>

      {/* Tabs */}
      <div className="absolute top-16 left-0 right-0 z-20 w-full max-w-md mx-auto px-4">
        <div className="flex justify-center items-center gap-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`text-sm font-medium transition-all ${
              activeTab === 'discover' 
                ? 'text-pink-400 border-b-2 border-pink-400 pb-1' 
                : 'text-white/70 hover:text-white'
            }`}
          >Discover</button>
          <button
            onClick={() => setActiveTab('views')}
            className={`text-sm font-medium transition-all flex items-center gap-1 ${
              activeTab === 'views' 
                ? 'text-pink-400 border-b-2 border-pink-400 pb-1' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Views
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`text-sm font-medium transition-all flex items-center gap-1 ${
              activeTab === 'likes' 
                ? 'text-pink-400 border-b-2 border-pink-400 pb-1' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            Likes
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="absolute top-32 left-0 right-0 bottom-0">
        {activeTab === 'discover' && (
          <>
            {/* Photo Progress */}
            {currentMatch && (
              <div className="absolute bottom-20 left-4 right-4 z-20 flex space-x-1">
                {currentMatch.photos.map((_, index) => (
                  <div key={index} className="h-1.5 flex-1 rounded-full bg-white/30 backdrop-blur-sm">
                    <motion.div
                      className={`h-full rounded-full ${buttonStyle === 'white-clean' ? 'bg-white' : 'bg-yellow-500'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: index === currentPhotoIndex ? '100%' : '0%' }}
                      transition={{ duration: 0.2, ease: 'linear' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="absolute inset-0">
              <AnimatePresence>
                {potentialMatches.slice(currentCardIndex).map((user, index) => (
                  <SwipeCard
                    key={user.id}
                    user={user}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    isActive={index === 0}
                    currentPhotoIndex={currentPhotoIndex}
                    setCurrentPhotoIndex={setCurrentPhotoIndex}
                  />
                ))}
              </AnimatePresence>
              
              {currentCardIndex >= potentialMatches.length && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div className="mt-64">
                    <h2 className="text-2xl font-bold">No more profiles</h2>
                    <p className="mt-2">Check back later for more potential matches.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'views' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Profile Views</h2>
            {usersWhoViewedMe.length === 0 ? (
              <p className="text-white/70">No one has viewed your profile yet.</p>
            ) : (
              <div className="space-y-3">
                {usersWhoViewedMe.map((user) => (
                  <UserListItem key={user.id} user={user} type="view" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Likes</h2>
            {usersWhoLikedMe.length === 0 ? (
              <p className="text-white/70">No one has liked you yet.</p>
            ) : (
              <div className="space-y-3">
                {usersWhoLikedMe.map((user) => (
                  <UserListItem 
                    key={user.id} 
                    user={user} 
                    type="like" 
                    onLikeBack={handleLikeBack}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} />
    </div>
  );
};

export default FindPage;
