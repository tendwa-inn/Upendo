import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore';
import { MessageCircle, Send, Camera, Phone, Video } from 'lucide-react';
import { Match } from '../types';
import ChatConversation from '../components/chat/ChatConversation';
import { mockMatches } from '../data/mockData';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const ChatPage: React.FC = () => {
  const { matches, selectedMatch, selectMatch } = useMatchStore();
  const { user, isVip } = useAuthStore();
  const { theme } = useThemeStore();
  const [localMatches] = useState(mockMatches);

  const getChatColors = () => {
    if (theme === 'dark') {
      return {
        container: 'bg-gray-900/95',
        border: 'border-gray-700',
        header: 'border-gray-700',
        textPrimary: 'text-gray-200',
        textSecondary: 'text-gray-400',
        bgPrimary: 'bg-gray-800',
        bgSecondary: 'bg-gray-700',
        bgActive: 'bg-gray-700',
        borderActive: 'border-gray-600',
      };
    }
    return {
      container: 'bg-white/95',
      border: 'border-gray-200',
      header: 'border-gray-200',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-600',
      bgPrimary: 'bg-white',
      bgSecondary: 'bg-gray-50',
      bgActive: 'bg-gradient-to-r from-pink-50 to-purple-50',
      borderActive: 'border-l-4 border-pink-500',
    };
  };

  const colors = getChatColors();

  return (
    <div className={`h-screen flex backdrop-blur-sm ${colors.container}`}>
      {/* Matches List */}
      <div className={`w-full md:w-1/3 border-r ${colors.border} ${selectedMatch ? 'hidden md:block' : 'block'}`}>
        <div className={`p-4 border-b ${colors.header}`}>
          <h2 className={`text-2xl font-bold ${colors.textPrimary}`}>Messages</h2>
          <p className={`${colors.textSecondary} text-sm mt-1`}>
            {localMatches.length} matches
          </p>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {localMatches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => selectMatch(match)}
              className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                selectedMatch?.id === match.id
                  ? `${colors.bgActive} ${colors.borderActive}`
                  : `hover:${colors.bgSecondary}`
              } ${colors.border}`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={match.user2.photos[0]}
                    alt={match.user2.name}
                    className={`w-12 h-12 rounded-full object-cover ${
                    theme === 'dark' ? 'border-2 border-gray-600' : ''
                  }`}
                  />
                  {match.user2.online && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${
                      theme === 'dark' ? 'border-gray-800' : 'border-white'
                    }`}></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold truncate ${colors.textPrimary}`}>
                      {match.user2.name}
                    </h3>
                    <span className={`text-xs ${colors.textSecondary}`}>
                      {new Date(match.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {match.lastMessage && (
                    <p className={`text-sm truncate mt-1 ${colors.textSecondary}`}>
                      {match.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Conversation */}
      <div className={`flex-1 flex-col ${selectedMatch ? 'flex' : 'hidden'} md:flex`}>
        {selectedMatch ? (
          <ChatConversation match={selectedMatch} />
        ) : (
          <div className={`flex-1 flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
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
  );
};

export default ChatPage;