import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore';
<<<<<<< HEAD
import { Settings, SlidersHorizontal, Check } from 'lucide-react';
import { Match } from '../types';
=======
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { Match, User } from '../types';
>>>>>>> 8b783fd8e98547dabf835663ef7d5dcbb7eb78b3
import ChatConversation from '../components/chat/ChatConversation';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import SafeImage from '../components/common/SafeImage';
import ChatSettingsModal from '../components/modals/ChatSettingsModal';

const ChatPage: React.FC = () => {
  const { matches, selectedMatch, selectMatch, fetchMatches } = useMatchStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user, fetchMatches]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMatches = matches.filter(match => {
    const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-700 rounded-full px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  autoFocus
                />
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
                {filteredMatches.slice(0, 5).map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  return (
                    <div key={match.id} className="flex-shrink-0 flex flex-col items-center space-y-1" onClick={() => selectMatch(match)}>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 p-1">
                          <SafeImage
                            src={otherUser.photos[0]}
                            alt={otherUser.name}
                            className="w-full h-full object-cover rounded-full"
                            fallbackSrc="/upendo-logo.png"
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
                {filteredMatches.map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  const unreadCount = (match.messages || []).filter(m => !m.isRead && m.senderId !== user?.id).length;
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => selectMatch(match)}
                      className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden">
                          <SafeImage
                            src={otherUser.photos[0]}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                            fallbackSrc="/upendo-logo.png"
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
                            {new Date(match.timestamp).toLocaleTimeString([], {
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
