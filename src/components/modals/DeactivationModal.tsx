import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const DeactivationModal = ({ onClose, onDeactivate }) => {
  const [reason, setReason] = useState('');

  const reasons = [
    'Too much time on Upendo',
    'I cannot find matches',
    'The app is not for me',
    'I met someone',
    'Other',
  ];

  const handleDeactivate = () => {
    // The onDelete function is no longer needed from the modal's perspective
    onDeactivate(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-8 w-full max-w-lg text-white border border-white/10 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
        </button>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Deactivate your account?</h2>
          <p className="text-gray-300 mb-6">
            This will deactivate your account, making it dormant and hidden from other users. 
            If you do not log back in within 30 days, your account and all its data will be permanently deleted.
            Your feedback helps us improve. Please select a reason for leaving.
          </p>
          <div className="space-y-3 mb-6">
            {reasons.map(r => (
              <button key={r} onClick={() => setReason(r)} className={`w-full p-3 rounded-lg text-left transition-colors ${
                reason === r ? 'bg-pink-600' : 'bg-white/10 hover:bg-white/20'
              }`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={handleDeactivate} disabled={!reason} className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed">
            Confirm Deactivation
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default DeactivationModal;
