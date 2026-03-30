
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Phone, Video, Heart, ArrowLeft, MoreVertical, Plus, Smile, UserX, ShieldX, Flag, Check, X, Trash2, MessageSquare, Edit, MoreHorizontal } from 'lucide-react';
import { Match, Message } from '../../types';
import { useMatchStore } from '../../stores/matchStore';
import SafeImage from '../common/SafeImage';
import { useAuthStore } from '../../stores/authStore';
import { reportService } from '../../services/reportService';
import ReportUserModal from '../modals/ReportUserModal';
import { blockService } from '../../services/blockService';
import { Link } from 'react-router-dom';
import { encryptMessage, decryptMessage } from '../../lib/encryption';
import GifPicker from './GifPicker';
import { supabase } from '../../lib/supabaseClient';

const ConversationStarter: React.FC<{ onSendHey: () => void }> = ({ onSendHey }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
    <div className="mb-4">
      <img 
        src="/Hey.png" 
        alt="Hey sticker" 
        className="w-24 h-24 object-contain cursor-pointer hover:scale-110 transition-transform"
        onClick={onSendHey}
        title="Click to send 'Hey' sticker"
      />
    </div>
    <div className="text-white/80 text-lg font-medium mb-2">
      Say Hi. Don't be Shy
    </div>
    <div className="text-white/60 text-sm">
      Click the sticker above or type your message below
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-[#3a1a22] px-4 py-3 rounded-2xl flex gap-2">
      <motion.span
        className="w-2 h-2 bg-white/60 rounded-full"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="w-2 h-2 bg-white/60 rounded-full"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.span
        className="w-2 h-2 bg-white/60 rounded-full"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: Message; onReply: (message: Message) => void; otherUserAvatar?: string; currentUserAvatar?: string; }> = ({ message, onReply, otherUserAvatar, currentUserAvatar }) => {
  const { user: currentUser } = useAuthStore();
  const sender = (message as any).sender_id || message.senderId;
  const isSender = sender === currentUser?.id;

  // Handle sticker messages
  if (message.content === '/sticker hey') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, x: isSender ? 50 : -50 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`flex items-end gap-2 w-full ${isSender ? "justify-end" : "justify-start"}`}>
        {!isSender && (
          <SafeImage src={otherUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
        )}
        <div className="max-w-[75%]">
          <div className="rounded-2xl text-sm leading-relaxed shadow-lg bg-transparent p-0">
            <img 
              src="/Hey.png" 
              alt="Hey sticker" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className={`text-[10px] mt-1 opacity-60 ${isSender ? "text-right" : "text-left"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {isSender && (
          <SafeImage src={currentUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: isSender ? 50 : -50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex items-end gap-2 w-full ${isSender ? "justify-end" : "justify-start"}`}>
      {!isSender && (
        <SafeImage src={otherUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
      )}
      <div className={`max-w-[75%]`}>
        <div className={`rounded-2xl text-sm leading-relaxed shadow-lg ${isSender ? "bg-gradient-to-b from-pink-500 to-pink-700" : "bg-gradient-to-b from-[#3a1a22] to-[#2E0C13]"} ${message.type === 'gif' ? 'p-0' : 'px-4 py-3'}`}>
          {message.type === 'gif' ? (
            <img src={message.content} alt="gif" className="rounded-2xl" />
          ) : (
            message.content
          )}
        </div>
        <div className={`text-[10px] mt-1 opacity-60 ${isSender ? "text-right" : "text-left"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isSender && (
        <SafeImage src={currentUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
      )}
    </motion.div>
  );
};


import usePresenceStore from '../../stores/presenceStore';
import { formatDistanceToNowStrict } from 'date-fns';

const ChatConversation: React.FC<{ match: Match }> = ({ match }) => {
  const { user: currentUser } = useAuthStore();
  if (!currentUser) return null;

  const { onlineUsers } = usePresenceStore();
  const otherUser = match.user1.id === currentUser?.id ? match.user2 : match.user1;
  const aCurrentUser = match.user1.id === currentUser?.id ? match.user1 : match.user2;

  const isOnline = onlineUsers[otherUser.id];
  const lastActive = otherUser.last_active ? formatDistanceToNowStrict(new Date(otherUser.last_active), { addSuffix: true }) : 'never';

  // Check if this is a new conversation (no messages yet)
  const isNewConversation = match.messages.length === 0;

  const [message, setMessage] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isUnmatchDialogOpen, setUnmatchDialogOpen] = useState(false);
  const [isBlockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isGifPickerOpen, setGifPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showConversationStarter, setShowConversationStarter] = useState(isNewConversation);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReport = () => {
    setMenuOpen(false);
    setReportModalOpen(true);
  };

  const handleUnmatchClick = () => {
    setMenuOpen(false);
    setUnmatchDialogOpen(true);
  };

  const handleBlockClick = () => {
    setMenuOpen(false);
    setBlockDialogOpen(true);
  };

  const { addMessage, selectMatch, unmatch, setTyping, typingUsers } = useMatchStore();

  // Show conversation starter for new conversations
  useEffect(() => {
    if (isNewConversation) {
      setShowConversationStarter(true);
    }
  }, [isNewConversation]);

  // Hide conversation starter when any message is received
  useEffect(() => {
    if (match.messages.length > 0 && showConversationStarter) {
      setShowConversationStarter(false);
    }
  }, [match.messages.length, showConversationStarter]);

  const handleUnmatch = async () => {
    await unmatch(match.id);
    setUnmatchDialogOpen(false);
  };

  const handleBlock = async () => {
    if (!currentUser) return;
    await blockService.blockUser(currentUser.id, otherUser.id);
    await unmatch(match.id);
    setBlockDialogOpen(false);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendHeySticker = () => {
    addMessage(match.id, {
      senderId: currentUser.id,
      content: '/sticker hey',
      type: 'text',
    });
    setShowConversationStarter(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Hide conversation starter when sending a message
    if (showConversationStarter) {
      setShowConversationStarter(false);
    }

    // Stop typing indicator when sending message
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTyping(match.id, currentUser.id, false);

    addMessage(match.id, {
      senderId: currentUser.id,
      content: message,
      type: 'text',
    });
    setMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Hide conversation starter when user starts typing
    if (showConversationStarter && newMessage.trim()) {
      setShowConversationStarter(false);
    }

    // Start typing indicator
    if (newMessage.trim()) {
      setTyping(match.id, currentUser.id, true);
      
      // Broadcast typing event
      const channel = supabase.channel('messages-channel');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { matchId: match.id, userId: currentUser.id, isTyping: true },
      });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(match.id, currentUser.id, false);
        
        // Broadcast stop typing event
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: match.id, userId: currentUser.id, isTyping: false },
        });
        
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      // Stop typing if message is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(match.id, currentUser.id, false);
      
      // Broadcast stop typing event
      const channel = supabase.channel('messages-channel');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { matchId: match.id, userId: currentUser.id, isTyping: false },
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [match.messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when leaving the chat
      setTyping(match.id, currentUser.id, false);
    };
  }, []);

  // Check if other user is typing in this match
  const otherUserTyping = typingUsers[match.id]?.includes(otherUser.id) || false;


  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#2b0f16] to-[#120508] text-white relative">
      <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-5 z-0" style={{ backgroundImage: "url('/Upendo Chat Theme.png')" }}></div>
      <div className="relative h-full flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => selectMatch(null)} className="p-1">
              <ArrowLeft />
            </button>
            <div className="relative">
              <SafeImage src={otherUser.photos[0]} alt="avatar" className="w-10 h-10 rounded-full" fallbackSrc="/upendo-logo.png" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#2b0f16]"></div>
            </div>
            <div>
              <Link to={`/user/${otherUser.id}`} className="font-semibold hover:underline">
                {otherUser.name}
              </Link>
              <div className="text-xs text-gray-400">
                {isOnline ? <span className="text-pink-400">Online now</span> : `Active ${lastActive}`}
              </div>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2">
              <MoreVertical />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-48 bg-[#3a1a22] rounded-md shadow-lg z-10"
                >
                  <ul className="py-1">
                    <li>
                      <button onClick={handleUnmatchClick} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                        <UserX size={16} /> Unmatch
                      </button>
                    </li>
                    <li>
                      <button onClick={handleBlockClick} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                        <ShieldX size={16} /> Block
                      </button>
                    </li>
                    <li>
                      <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2">
                        <Flag size={16} /> Report
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {showConversationStarter && (
            <ConversationStarter onSendHey={handleSendHeySticker} />
          )}
          {!showConversationStarter && (
            <>
              <div className="text-center text-xs text-white/40 uppercase">Yesterday</div>
              {match.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onReply={() => {}} otherUserAvatar={otherUser.photos ? otherUser.photos[0] : undefined} currentUserAvatar={aCurrentUser.photos ? aCurrentUser.photos[0] : undefined} />
              ))}
            </>
          )}
          {otherUserTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
          <button type="button" className="p-2 rounded-full bg-white/10">
            <Plus size={18} />
          </button>
          <input
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button type="button" onClick={() => setGifPickerOpen(!isGifPickerOpen)} className="p-2 rounded-full bg-white/10">
            <Smile size={18} />
          </button>
          <button
            type="submit"
            className="p-3 rounded-full bg-pink-500 hover:bg-pink-600 transition"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Confirmation Dialogs */}
      <AnimatePresence>
        {isUnmatchDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setUnmatchDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#3a1a22] rounded-lg p-6 mx-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Unmatch User</h3>
              <p className="text-white/80 mb-4">Are you sure you want to unmatch {otherUser.name}? This will remove the conversation and you won't be able to message them unless you match again.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setUnmatchDialogOpen(false)}
                  className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnmatch}
                  className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 transition"
                >
                  Unmatch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlockDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setBlockDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#3a1a22] rounded-lg p-6 mx-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Block User</h3>
              <p className="text-white/80 mb-4">Are you sure you want to block {otherUser.name}? This will remove the conversation and they won't be able to see you or contact you again.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setBlockDialogOpen(false)}
                  className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 transition"
                >
                  Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUserId={otherUser.id}
      />

      <AnimatePresence>
        {isGifPickerOpen && (
          <GifPicker
            message={message}
            onSelect={(gifUrl) => {
              addMessage(match.id, {
                senderId: currentUser.id,
                content: gifUrl,
                type: 'gif',
              });
              setGifPickerOpen(false);
            }}
            onClose={() => setGifPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatConversation;
