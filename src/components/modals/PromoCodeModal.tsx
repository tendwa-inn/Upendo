import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const PromoCodeModal = ({ onClose, onApply }) => {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code) {
      onApply(code);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-md text-white border border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Enter Promo Code</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter your code"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button 
            onClick={handleApply} 
            className="w-full px-5 py-3 bg-pink-600 rounded-lg font-semibold transition-colors hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed"
            disabled={!code}
          >
            Apply Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PromoCodeModal;
