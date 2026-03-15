import React from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';

const LookingForStep: React.FC = () => {
  const { formData, updateFormData, nextStep } = useSignUpStore();

  const options = ['men', 'women', 'both'];

  const handleSelect = (option: 'men' | 'women' | 'both') => {
    updateFormData({ lookingFor: option });
    nextStep();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <h2 className="text-3xl font-bold mb-6 text-white">Who are you looking for?</h2>
      <div className="space-y-4">
        {options.map((option) => (
          <motion.button
            key={option}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option as 'men' | 'women' | 'both')}
            className={`w-full py-4 text-md font-bold rounded-2xl transition-all duration-300 ${formData.lookingFor === option
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/20 text-white/80'
              }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default LookingForStep;
