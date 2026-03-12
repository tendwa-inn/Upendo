import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Phone, Video, Heart, ArrowLeft, MoreVertical, Plus, Smile, UserX, ShieldX, Flag, Check, X, Trash2, MessageSquare, Edit, MoreHorizontal } from 'lucide-react';
import { Match, Message } from '../../types';
import { useMatchStore } from '../../stores/matchStore';
import { mockMessages } from '../../data/mockData';
import SafeImage from '../common/SafeImage';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import ReportUserModal from '../modals/ReportUserModal';
import { useThemeStore } from '../../stores/themeStore';
import GifPicker from './GifPicker';

interface ChatConversationProps {
  match: Match;
}

import { Link } from 'react-router-dom';
import { encryptMessage, decryptMessage } from '../../lib/encryption';

const ReplyPreview: React.FC<{ message: Message; onCancel: () => void }> = ({ message, onCancel }) => (
  <div className="p-2 bg-gray-700/50 rounded-t-xl">
    <div className="flex justify-between items-center">
      <p className="text-sm font-bold">Replying to {message.senderId === useAuthStore.getState().user?.id ? "yourself" : "them"}</p>
      <button onClick={onCancel}><X className="w-4 h-4" /></button>
    </div>
    <p className="text-sm text-gray-400 truncate">{decryptMessage(message.content)}</p>
  </div>
);

const MessageBubble: React.FC<{ message: Message; onReply: (message: Message) => void; onOptionsMenuClick: (message: Message, anchor: HTMLElement) => void }> = ({ message, onReply, onOptionsMenuClick }) => {
  const { user: currentUser } = useAuthStore();
  const isSender = message.senderId === currentUser?.id;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50 && !isSender) {
      onReply(message);
    } else if (info.offset.x > 50 && isSender) {
      onReply(message);
    }
  };

  return (
    <div className={`group flex items-center gap-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {isSender && (
        <button ref={menuButtonRef} onClick={() => onOptionsMenuClick(message, menuButtonRef.current!)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-white/10 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      )}
       <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
        {!isSender && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <SafeImage
              src={useMatchStore.getState().matches.find(m => m.id === message.matchId)?.user2.photos[0] || ''}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div
          className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-lg ${ 
            isSender ? 'bg-gradient-to-br from-[#FF4F87] to-[#FF6A9C] text-white rounded-br-none' : 'bg-[#5A1C2B] text-white rounded-bl-none'
          }`}>
          {message.parentMessage && (
            <div className="bg-black/20 p-2 rounded-lg mb-2">
              <p className="text-xs font-bold">Replying to {message.parentMessage.senderId === currentUser?.id ? "yourself" : "them"}</p>
              <p className="text-xs text-white/80 truncate">{decryptMessage(message.parentMessage.content)}</p>
            </div>
          )}
          {message.type === 'text' ? (
            <p className="text-sm">{decryptMessage(message.content)}</p>
          ) : message.type === 'gif' ? (
            <img src={message.content} alt="gif" className="w-full h-auto rounded-lg" />
          ) : message.type === 'image' ? (
            <img src={message.content} alt="image" className="w-full h-auto rounded-lg" />
          ) : null}
          <div className={`text-xs mt-1 flex items-center gap-1 ${isSender ? 'text-white/70 justify-end' : 'text-gray-400'}`}>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.isEdited && <span className="text-xs text-white/70">(edited)</span>}
            {isSender && <Check className="w-4 h-4" />}
          </div>
        </div>
      </motion.div>
      {!isSender && (
        <button ref={menuButtonRef} onClick={() => onOptionsMenuClick(message, menuButtonRef.current!)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-white/10 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

const ChatConversation: React.FC<ChatConversationProps> = ({ match }) => {
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  
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

  const otherUser = match.user1.id === currentUser?.id ? match.user2 : match.user1;
  
  const [message, setMessage] = useState('');
  const { messages: storeMessages, addMessage, selectMatch, unmatch, editMessage, deleteMessage } = useMatchStore();
  const messages = storeMessages[match.id] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [messageForMenu, setMessageForMenu] = useState<{ message: Message; anchor: HTMLElement } | null>(null);
  const { submitReport } = useAdminStore();
  const { addBlockedUser } = useAuthStore();

  const handleBack = () => {
    selectMatch(null);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    if (editingMessage) {
      editMessage(match.id, editingMessage.id, encryptMessage(message));
      setEditingMessage(null);
    } else {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        matchId: match.id,
        senderId: currentUser.id,
        content: encryptMessage(message),
        timestamp: new Date(),
        isRead: false,
        type: 'text',
        replyTo: replyingTo?.id,
        parentMessage: replyingTo ? { content: replyingTo.content, senderId: replyingTo.senderId } : undefined,
      };
      addMessage(match.id, newMessage);
    }

    setMessage('');
    setReplyingTo(null);
  };

  const handleDeleteMessage = (message: Message) => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (new Date().getTime() - new Date(message.timestamp).getTime() < twentyFourHours) {
      deleteMessage(match.id, message.id);
      setLongPressedMessage(null);
    } else {
      toast.error("Cannot delete messages older than 24 hours.");
    }
  };

  const handleGifSelect = (gif: any) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      matchId: match.id,
      senderId: currentUser.id,
      content: gif.images.downsized.url,
      timestamp: new Date(),
      isRead: false,
      type: 'gif',
    };
    addMessage(match.id, newMessage);
    setIsGifPickerOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          matchId: match.id,
          senderId: currentUser.id,
          content: event.target?.result as string,
          timestamp: new Date(),
          isRead: false,
          type: 'image',
        };
        addMessage(match.id, newMessage);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = (reason: string, details: string) => {
    if (currentUser) {
      submitReport(currentUser.id, otherUser.id, reason, details);
      setIsReportModalOpen(false);
      setIsMenuOpen(false);
      alert('Report submitted. Thank you for your feedback.');
    }
  };

  const handleBlock = () => {
    addBlockedUser(otherUser.id);
    unmatch(match.id);
    selectMatch(null);
    alert(`${otherUser.name} has been blocked.`);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#22090E] to-[#2E0C13] text-white relative">
      <div className="absolute inset-0 z-0">
        <img src="/Upendo Chat Theme.png" alt="Chat background" className="w-full h-full object-cover opacity-[.03]" />
      </div>
      <div className="relative z-10 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top border-b border-white/10 bg-[#2A0A11]">
        <div className="flex items-center space-x-3">
          <button onClick={handleBack} className="p-1 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Link to={`/user/${otherUser.id}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
               <SafeImage
                src={otherUser.photos[0]}
                alt={otherUser.name}
                className="w-full h-full object-cover"
                fallbackSrc="/upendo-logo.png"
              />
            </div>
            <div>
              <h3 className="font-semibold">{otherUser.name}</h3>
              <p className={`text-sm ${otherUser.online ? 'text-[#FF4F87]' : 'text-gray-400'}`}>
                {otherUser.online ? 'Online now' : 'Offline'}
              </p>
            </div>
          </Link>
        </div>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 rounded-full hover:bg-white/10">
            <MoreVertical className="w-6 h-6" />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-20"
              >
                <button onClick={() => { unmatch(match.id); selectMatch(null); }} className="flex items-center w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">
                  <UserX className="w-4 h-4 mr-2" /> Unmatch
                </button>
                <button onClick={handleBlock} className="flex items-center w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">
                  <ShieldX className="w-4 h-4 mr-2" /> Block
                </button>
                <button onClick={() => { setIsReportModalOpen(true); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-white/5">
                  <Flag className="w-4 h-4 mr-2" /> Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end">
        <div className="space-y-2">
          <div className="text-center text-xs text-gray-500 uppercase my-4">Yesterday</div>
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} onReply={() => { setReplyingTo(msg); setMessageForMenu(null); }} onOptionsMenuClick={setMessageForMenu} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messageForMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMessageForMenu(null)}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: messageForMenu.anchor.getBoundingClientRect().bottom + 8,
              left: messageForMenu.anchor.getBoundingClientRect().left,
            }}
            className="bg-gray-800 rounded-lg shadow-lg z-20 flex divide-x divide-gray-700"
          >
            <button onClick={() => { setReplyingTo(messageForMenu.message); setMessageForMenu(null); }} className="flex items-center px-4 py-2 text-left text-sm hover:bg-white/5 rounded-l-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
            </button>
            {messageForMenu.message.senderId === currentUser?.id ? (
              new Date().getTime() - new Date(messageForMenu.message.timestamp).getTime() < 24 * 60 * 60 * 1000 && (
                <>
                  <button onClick={() => { setEditingMessage(messageForMenu.message); setMessage(decryptMessage(messageForMenu.message.content)); setMessageForMenu(null); }} className="flex items-center px-4 py-2 text-left text-sm hover:bg-white/5">
                    <Edit className="w-4 h-4 mr-2" />
                  </button>
                  <button onClick={() => {handleDeleteMessage(messageForMenu.message); setMessageForMenu(null);}} className="flex items-center px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-r-lg">
                    <Trash2 className="w-4 h-4 mr-2" />
                  </button>
                </>
              )
            ) : (
              <button onClick={() => { setIsReportModalOpen(true); setMessageForMenu(null); }} className="flex items-center px-4 py-2 text-left text-sm hover:bg-white/5 rounded-r-lg">
                <Flag className="w-4 h-4 mr-2" />
              </button>
            )}
          </motion.div>
        </>
      )}

      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />

      {isGifPickerOpen && (
        <div className="absolute bottom-20 right-4 z-20">
          <GifPicker onGifClick={handleGifSelect} />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#3A0F18]">
        {replyingTo && <ReplyPreview message={replyingTo} onCancel={() => setReplyingTo(null)} />}
        <input type="file" id="image-upload" className="hidden" onChange={handleImageSelect} accept="image/*" />
        <div className="flex items-center space-x-2 bg-premium-chat-maroon-dark rounded-full px-2">
           <button type="button" onClick={() => document.getElementById('image-upload')?.click()} className="p-2 text-[#B78491] hover:text-white">
            <Plus className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-[#B78491] focus:outline-none px-2 py-3"
          />
          <button type="button" onClick={() => setIsGifPickerOpen(!isGifPickerOpen)} className="p-2 text-[#B78491] hover:text-white">
            <Smile className="w-6 h-6" />
          </button>
           <button
            type="submit"
            disabled={!message.trim()}
            className="p-3 rounded-full bg-[#FF4F87] text-white disabled:bg-gray-500 transition-all">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default ChatConversation;
