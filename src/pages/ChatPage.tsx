import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Check, X } from 'lucide-react';
import { Match, User } from '../types';
import ChatConversation from '../components/chat/ChatConversation';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import SafeImage from '../components/common/SafeImage';

import ChatSettingsModal from '../components/modals/ChatSettingsModal';

import { Megaphone } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { matches, selectedMatch, selectMatch, fetchMatches } = useMatchStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnnouncementsVisible, setIsAnnouncementsVisible] = useState(true);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const deleteTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user, fetchMatches]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDelete = (id: string, name: string, deleteAction: () => void) => {
    setPendingDeletions(prev => [...prev, id]);

    const toastId = toast(
      (t) => (
        <div className="flex items-center">
          <span>
            Deleted <b>{name}</b>
          </span>
          <button
            className="ml-4 p-1 text-sm font-medium text-pink-500 border border-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-all"
            onClick={() => {
              clearTimeout(deleteTimers.current[id]);
              setPendingDeletions(prev => prev.filter(pId => pId !== id));
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 10000 }
    );

    deleteTimers.current[id] = setTimeout(() => {
      deleteAction();
      toast.dismiss(toastId);
    }, 10000);
  };

  const filteredMatches = matches.filter(match => {
    const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const newMatches = filteredMatches.filter(match => !match.lastMessage);
  const conversations = filteredMatches.filter(match => match.lastMessage);

  return (
    <div className="h-screen flex flex-col text-white bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
      {selectedMatch ? (
        <ChatConversation match={selectedMatch} />
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src="/Logo white.png" alt="Upendo Logo" className="w-3/4 h-3/4 object-contain opacity-5" />
          </div>
          <div className="flex justify-between items-center p-4 pt-safe-top">
            {isSearchActive ? (
              <div className="w-full flex items-center bg-stone-700 rounded-full px-2">
                <input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2 px-2 text-white focus:outline-none"
                  autoFocus
                />
                <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }} className="p-2">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setIsSearchActive(true)} className="p-2">
                  <Search className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Messages</h1>
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-2">
                  <SlidersHorizontal className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="px-4">
            
            <div>
              <h2 className="text-pink-500 font-bold my-4">NEW MATCHES</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {newMatches.map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  return (
                    <div key={match.id} className="flex-shrink-0 flex flex-col items-center space-y-1" onClick={() => selectMatch(match)}>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 p-1">
                          <SafeImage
                            src={otherUser.photos[0]}
                            alt={otherUser.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        {otherUser.online && (
                          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2E0C13]"></div>
                        )}
                      </div>
                      <span className="text-sm font-semibold">{otherUser.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-pink-500 font-bold my-4">CONVERSATIONS</h2>
              <div className="overflow-y-auto h-full">
                {/* Static Announcements Link */}
                {isAnnouncementsVisible && !pendingDeletions.includes('announcements') && (
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    onDragEnd={(event, info) => {
                      if (info.offset.x < -50) {
                        handleDelete('announcements', 'Announcements', () => setIsAnnouncementsVisible(false));
                      }
                    }}
                  >
                    <Link to="/system-messages" className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-pink-500/20 flex items-center justify-center">
                          <Megaphone className="w-8 h-8 text-pink-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-gray-200">Announcements</h3>
                        <p className="text-sm truncate mt-1 text-gray-400">Official messages from Upendo</p>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {conversations.filter(match => !pendingDeletions.includes(match.id)).map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  const unreadCount = (match.messages || []).filter(m => !m.isRead && m.senderId !== user?.id).length;
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      drag="x"
                      dragConstraints={{ left: -100, right: 0 }}
                      onDragEnd={(event, info) => {
                        if (info.offset.x < -50) {
                          handleDelete(match.id, otherUser.name, () => useMatchStore.getState().unmatch(match.id));
                        }
                      }}
                      onClick={() => selectMatch(match)}
                      className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden">
                          <SafeImage
                            src={otherUser.photos[0]}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-pink-500 rounded-full border-2 border-[#2E0C13] flex items-center justify-center text-xs">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate text-gray-200">{otherUser.name}</h3>
                          <span className="text-xs text-gray-400">
                            {match.lastMessage && new Date(match.lastMessage.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {match.lastMessage && (
                          <p className="text-sm truncate mt-1 text-gray-400 flex items-center">
                            {match.lastMessage.senderId === user?.id && <Check className="w-4 h-4 mr-1" />}
                            {match.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      <ChatSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  );
};

export default ChatPage;
