import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore';
import { Settings, SlidersHorizontal, Check } from 'lucide-react';
import { Match, User } from '../types';
import ChatConversation from '../components/chat/ChatConversation';
import { mockUsers } from '../data/mockData';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import SafeImage from '../components/common/SafeImage';

const ChatPage: React.FC = () => {
  const { matches, selectedMatch, selectMatch, createMatch, addMessage } = useMatchStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (user) {
      const upendoAssistant = mockUsers.find(u => u.id === 'upendo-assistant');
      const hasMatchWithUpendo = matches.some(m => m.user2.id === 'upendo-assistant');

      if (upendoAssistant && !hasMatchWithUpendo) {
        const currentUser = mockUsers.find(u => u.id === 'current-user') || mockUsers[0];
        const newMatch = createMatch(currentUser, upendoAssistant);
        addMessage(newMatch.id, {
          id: `msg-${Date.now()}`,
          matchId: newMatch.id,
          senderId: upendoAssistant.id,
          content: `Welcome to Upendo! I'm here to help you get started. A complete profile gets more attention. Why not start by filling out your Details, Delicacies, and Travel sections? Let's make your profile shine! ✨`,
          timestamp: new Date(),
          isRead: false,
          type: 'text',
        });
      }
    }
  }, [user, matches, createMatch, addMessage]);

  return (
    <div className="h-screen flex flex-col text-white bg-stone-900">
      {selectedMatch ? (
        <ChatConversation match={selectedMatch} />
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src="/Logo white.png" alt="Upendo Logo" className="w-3/4 h-3/4 object-contain opacity-5" />
          </div>
          <div className="flex justify-between items-center p-4 pt-safe-top">
            <button className="p-2">
              <Settings className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Messages</h1>
            <button className="p-2">
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className="px-4">
            <div>
              <h2 className="text-pink-500 font-bold my-4">NEW MATCHES</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {matches.slice(0, 5).map((match) => {
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
                          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-stone-900"></div>
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
                {matches.map((match) => {
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
                          <div className="absolute top-0 right-0 w-4 h-4 bg-pink-500 rounded-full border-2 border-stone-900 flex items-center justify-center text-xs">
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
    </div>
  );
};

export default ChatPage;
