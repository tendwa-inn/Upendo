import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Phone, Video, Heart, ArrowLeft, Lock } from 'lucide-react';
import { Match, Message } from '../../types';
import { useMatchStore } from '../../stores/matchStore';
import { mockMessages } from '../../data/mockData';

interface ChatConversationProps {
  match: Match;
}

import { Link } from 'react-router-dom';
import { encryptMessage, decryptMessage } from '../../lib/encryption';

const ChatConversation: React.FC<ChatConversationProps> = ({ match }) => {
  const { theme } = useThemeStore();
  
  // Safety check: if match is not provided, show a fallback UI
  if (!match) {
    return (
      <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              No conversation selected
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Please select a match to start chatting
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages[match.id] || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { addMessage, selectMatch } = useMatchStore();

  const handleTyping = () => {
    console.log('Typing detected...');
    setIsTyping(true);
    // Also simulate the other user seeing you type
    setTimeout(() => {
      setIsTyping(false);
      console.log('Typing indicator hidden');
    }, 2000); // Stop showing typing after 2 seconds
  };

  // Simulate other user typing
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of typing
        console.log('Other user started typing');
        setOtherUserTyping(true);
        setTimeout(() => {
          setOtherUserTyping(false);
          console.log('Other user stopped typing');
        }, 3000);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      matchId: match.id,
      senderId: 'current-user',
      content: encryptMessage(message),
      timestamp: new Date(),
      isRead: false,
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    addMessage(match.id, newMessage);
    setMessage('');
  };

  const sendHeart = () => {
    const heartMessage: Message = {
      id: `msg-${Date.now()}`,
      matchId: match.id,
      senderId: 'current-user',
      content: '❤️',
      timestamp: new Date(),
      isRead: false,
      type: 'text',
    };

    setMessages([...messages, heartMessage]);
    addMessage(match.id, heartMessage);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} transition-all duration-300`}>
        <Link to={`/user/${match.user2.id}`} className="flex items-center space-x-3">
          <img
            src={match.user2.photos[0]}
            alt={match.user2.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" />
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{match.user2.name}</h3>
            <p className={`text-sm ${otherUserTyping ? 'text-orange-400' : isRecording ? 'text-red-500' : match.user2.online ? 'text-green-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {otherUserTyping ? '🔥 TYPING...' : isRecording ? '🎤 Recording Audio...' : match.user2.online ? '🟢 Online' : 'Active 2h ago'}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Lock className="w-3 h-3 mr-1" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
            <Phone className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 flex flex-col justify-end space-y-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'
              }`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.senderId === 'current-user'
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-200 text-gray-800'
                }`}>
                <p className="text-sm">{decryptMessage(msg.content)}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === 'current-user'
                      ? theme === 'dark'
                        ? 'text-gray-300'
                        : 'text-white/70'
                      : theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                  }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {otherUserTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start">
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'} shadow-lg`}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">typing...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={sendHeart}
            className={`p-2 rounded-full ${theme === 'dark' ? 'text-pink-500 hover:text-pink-400 hover:bg-gray-700' : 'text-pink-500 hover:text-pink-600 hover:bg-pink-50'}`}>
            <Heart className="w-5 h-5" fill="currentColor" />
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsRecording(true);
              setTimeout(() => {
                setIsRecording(false);
              }, 3000);
            }}
            className={`p-2 rounded-full ${isRecording ? (theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-500 text-white') : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'}`}>
            <Camera className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className={`w-full px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-purple-500' : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-500 focus:ring-pink-400'} focus:outline-none focus:border-transparent`}
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-full text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'}`}>
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatConversation;