import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore';
import { MessageCircle, Send, Camera, Phone, Video } from 'lucide-react';
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
        // Use currentUser from mockData instead of auth user
        const newMatch = createMatch(mockUsers.find(u => u.id === 'current-user') || mockUsers[0], upendoAssistant);
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
    <div className="h-screen flex backdrop-blur-sm bg-transparent">
      {/* Matches List */}
      <div className={`w-full md:w-1/3 border-r border-white/10 ${selectedMatch ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <p className="text-gray-300 text-sm mt-1">
            {matches.length} matches
          </p>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {matches.map((match) => {
            const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => selectMatch(match)}
                className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                  selectedMatch?.id === match.id
                    ? `bg-white/10 border-l-4 border-purple-500`
                    : `hover:bg-white/5`
                } border-white/10`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600`} style={{ backgroundImage: 'url(/upendo-logo.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <SafeImage
                        src={otherUser.photos[0]}
                        alt={otherUser.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="/upendo-logo.png"
                      />
                    </div>
                    {otherUser.online && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800`}></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold truncate text-gray-200`}>
                        {otherUser.name}
                      </h3>
                      <span className={`text-xs text-gray-400`}>
                        {new Date(match.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {match.lastMessage && (
                      <p className={`text-sm truncate mt-1 text-gray-400`}>
                        {match.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chat Conversation */}
      <div className={`relative flex-1 flex-col ${selectedMatch ? 'flex' : 'hidden'} md:flex`}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/chat-bg.png')" }}></div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex-1 flex flex-col">
          {selectedMatch ? (
            <ChatConversation match={selectedMatch} />
          ) : (
            <div className={`flex-1 flex items-center justify-center`}>
              <div className="text-center">
                <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Select a conversation
                </h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Choose a match to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default ChatPage;
