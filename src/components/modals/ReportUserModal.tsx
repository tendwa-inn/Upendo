import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

const reportReasons = [
  'Inappropriate Profile Photo',
  'Spam or Scam',
  'Underage User',
  'Catfishing / Fake Profile',
  'Harassment or Hate Speech',
  'Other',
];

const ReportUserModal: React.FC<ReportUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason) {
      onSubmit(reason, details);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md p-6 text-white border border-purple-500/20 shadow-2xl shadow-purple-500/10"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Report User</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-gray-400 text-sm">Your safety is our priority. Please provide details so we can investigate.</p>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Reason for reporting</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-white/5 rounded-md border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
            >
              <option value="" disabled>Select a reason...</option>
              {reportReasons.map(r => <option key={r} value={r} className="bg-gray-800 text-white">{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Help us understand what happened..."
              className="w-full p-3 bg-white/5 rounded-md border border-white/10 h-28 resize-none focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button onClick={onClose} className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 font-semibold transition-all duration-300">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!reason}
            className="px-8 py-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
          >
            Submit Report
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportUserModal;
