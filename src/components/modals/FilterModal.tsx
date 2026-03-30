import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const africanTribes = [
  'Akan', 'Bemba', 'Chewa', 'Ewe', 'Ga', 'Hausa', 'Igbo', 'Kaonde', 'Kikuyu', 'Lozi', 'Lunda', 'Luo', 'Maasai', 'Mambwe', 'Namwanga', 'Ndebele', 'Ngoni', 'Nsenga', 'Nyanja', 'Shona', 'Sotho', 'Tonga', 'Tumbuka', 'Venda', 'Xhosa', 'Yoruba', 'Zulu'
].sort();

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const { user } = useAuthStore();
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [distance, setDistance] = useState(50);
  const [tribe, setTribe] = useState('');

  const isVip = user?.subscription_tier === 'vip';

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ ageRange, distance, tribe: isVip ? tribe : '' });
    onClose();
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
          <h2 className="text-2xl font-bold">Filters</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Age Range: {ageRange[0]} - {ageRange[1]}</label>
            <input type="range" min="18" max="60" value={ageRange[1]} onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])} className="w-full" />
            <input type="range" min="18" max="60" value={ageRange[0]} onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Distance: {distance}km</label>
            <input type="range" min="1" max="100" value={distance} onChange={(e) => setDistance(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300 flex items-center">
              Tribe
              {!isVip && <Lock className="w-3 h-3 ml-2 text-yellow-400" />}
            </label>
            {isVip ? (
              <select value={tribe} onChange={(e) => setTribe(e.target.value)} className="w-full p-3 bg-white/5 rounded-md border border-white/10">
                <option value="">All Tribes</option>
                {africanTribes.map(t => <option key={t} value={t} className="bg-gray-800 text-white">{t}</option>)}
              </select>
            ) : (
              <div className="w-full p-3 bg-white/5 rounded-md border border-white/10 text-gray-500 cursor-not-allowed">
                VIP Feature
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button onClick={onClose} className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 font-semibold transition-all duration-300">
            Cancel
          </button>
          <button 
            onClick={handleApply}
            className="px-8 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-blue-600 transition-all duration-300"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterModal;
