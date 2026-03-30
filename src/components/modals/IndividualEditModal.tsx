import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { 
  occupations, 
  heights, 
  religions, 
  loveLanguages, 
  drinkingAndSmokingOptions, 
  firstDateIdeas,
  educationOptions,
  relationshipIntentOptions,
  kidsOptions
} from '../../lib/options';

const IndividualEditModal = ({ field, value, onSave, onClose }) => {
  const [currentValue, setCurrentValue] = useState(value || '');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOccupations = useMemo(() => {
    if (field !== 'occupation') return [];
    return occupations.filter(occ => 
      occ.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, field]);

  const renderInput = () => {
    switch (field) {
      case 'occupation':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            <option className="text-black" value="">Nothing</option>
            {occupations.map(occ => (
              <option className="text-black" key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        );
      case 'height':
        return (
                    <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {heights.map(h => <option className="text-black" key={h} value={h}>{h}</option>)}
          </select>
        );
      case 'religion':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {religions.map(r => <option className="text-black" key={r} value={r}>{r}</option>)}
          </select>
        );
      case 'love_language':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {loveLanguages.map(ll => <option className="text-black" key={ll} value={ll}>{ll}</option>)}
          </select>
        );
      case 'drinking':
      case 'smoking':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {drinkingAndSmokingOptions.map(opt => <option className="text-black" key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'first_date':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {firstDateIdeas.map(idea => <option className="text-black" key={idea} value={idea}>{idea}</option>)}
          </select>
        );
      case 'education':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {educationOptions.map(edu => <option className="text-black" key={edu} value={edu}>{edu}</option>)}
          </select>
        );
      case 'relationship_intent':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {relationshipIntentOptions.map(intent => <option className="text-black" key={intent} value={intent}>{intent}</option>)}
          </select>
        );
      case 'kids':
        return (
          <select value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white">
            {kidsOptions.map(option => <option className="text-black" key={option} value={option}>{option}</option>)}
          </select>
        );
      case 'bio':
        return <textarea value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white" />;
      default:
        return <input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white" />;
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
          <h2 className="text-xl font-bold">Edit {field}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="min-h-[150px] sm:min-h-[100px]">
          {renderInput()}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white/10 rounded-lg font-semibold transition-colors hover:bg-white/20"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(field, currentValue)} 
            className="px-5 py-2 bg-pink-600 rounded-lg font-semibold transition-colors hover:bg-pink-700"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default IndividualEditModal;
