import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabaseClient';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateUserProfile } = useAuthStore();
  const { isAutoUnmatchEnabled, toggleAutoUnmatch } = useSettingsStore();
  const [isGhostMode, setGhostMode] = React.useState(profile?.ghost_mode_enabled || false);

  const toggleGhostMode = async () => {
    if (!user) return;
    const newStatus = !isGhostMode;
    setGhostMode(newStatus);
    await updateUserProfile({ ghost_mode_enabled: newStatus });
  };

  const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-stone-800 rounded-t-2xl w-full max-w-md h-auto absolute bottom-0 mb-20 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Message Filters</h2>
              <button onClick={onClose}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Automatic Unmatch</h4>
                    <p className="text-sm text-gray-400">Unmatch after 2 days of inactivity.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isAutoUnmatchEnabled} onChange={toggleAutoUnmatch} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-pink-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between ${!isPremium ? 'opacity-50' : ''}`}>
                  <div>
                    <h4 className="font-semibold flex items-center">
                      Ghost Mode {!isPremium && <Lock className="w-4 h-4 ml-2" />}
                    </h4>
                    <p className="text-sm text-gray-400">Hide your active status.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" disabled={!isPremium} checked={isGhostMode} onChange={toggleGhostMode} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-pink-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between ${!isPremium ? 'opacity-50' : ''}`}>
                  <div>
                    <h4 className="font-semibold flex items-center">
                      Read Receipts {!isPremium && <Lock className="w-4 h-4 ml-2" />}
                    </h4>
                    <p className="text-sm text-gray-400">See if others have read your messages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" disabled={!isPremium} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-pink-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className={`flex items-center justify-between ${!isPremium ? 'opacity-50' : ''}`}>
                  <div>
                    <h4 className="font-semibold flex items-center">
                      Disappearing Voice Notes {!isPremium && <Lock className="w-4 h-4 ml-2" />}
                    </h4>
                    <p className="text-sm text-gray-400">Voice notes disappear after 5 minutes.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" disabled={!isPremium} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-pink-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                {!isPremium && (
                  <div className="text-center pt-4">
                    <button className="bg-pink-500 text-white font-bold py-2 px-4 rounded-full">
                      Upgrade to Pro/VIP
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatSettingsModal;
