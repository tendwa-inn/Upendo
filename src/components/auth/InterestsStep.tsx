import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface InterestsStepProps {
  onNext: (interests: string[]) => void;
}

const interestsOptions = [
  'Football', 'Movies', 'Date Nights', 'Staying In', 'Music', 'Art', 'Gaming', 'Cooking',
  'Dancing', 'Reading', 'Travel', 'Fitness', 'Photography', 'Fashion', 'Writing', 'Business'
];

const InterestsStep: React.FC<InterestsStepProps> = ({ onNext }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (selectedInterests.length >= 3 && selectedInterests.length <= 5) {
      onNext(selectedInterests);
    } else {
      // You can add a toast notification here to inform the user
      alert('Please select between 3 and 5 interests.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="text-center"
    >
      <h2 className="text-3xl font-bold mb-4 text-white">Your Interests</h2>
      <p className="text-gray-300 mb-8">Select 3 to 5 interests that best describe you.</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
        {interestsOptions.map(interest => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <motion.button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`relative p-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                isSelected ? 'bg-pink-600/50 ring-2 ring-pink-400' : 'bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {interest}
              {isSelected && (
                <motion.div 
                  className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <button 
        onClick={handleNext}
        disabled={selectedInterests.length < 3 || selectedInterests.length > 5}
        className="w-full max-w-xs mx-auto bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 disabled:bg-gray-500 hover:bg-pink-700"
      >
        Next
      </button>
    </motion.div>
  );
};

export default InterestsStep;