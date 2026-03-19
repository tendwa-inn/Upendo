import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const interestsList = [
  'Reading', 'Traveling', 'Movies', 'Music', 'Cooking', 'Dancing', 'Art', 'Photography', 
  'Hiking', 'Sports', 'Gaming', 'Yoga', 'Writing', 'Fashion', 'Technology', 'History'
].sort();

const InterestsStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData.interests || []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = () => {
    updateFormData({ interests: selectedInterests });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">What are your interests?</h1>
        <p className="text-white/60 mt-1">Select a few to find better matches.</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {interestsList.map(interest => (
          <button 
            key={interest} 
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedInterests.includes(interest) ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/80'}`}>
            {interest}
          </button>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        <button onClick={handleNext} disabled={selectedInterests.length === 0} className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed">Next</button>
      </div>
    </motion.div>
  );
};

export default InterestsStep;
