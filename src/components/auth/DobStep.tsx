import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const DobStep: React.FC = () => {
  const { nextStep, updateData } = useSignUpStore();
  const [date, setDate] = useState('');

  const handleNext = () => {
    if (!date) {
      toast.error('Please enter your date of birth');
      return;
    }
    const birthDate = new Date(date);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      toast.error('You must be at least 18 years old to sign up');
      return;
    }
    updateData({ dateOfBirth: birthDate, age });
    nextStep();
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <Calendar className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">When's your birthday?</h2>
      
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full mb-8 px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white text-center placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
        required
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
      >
        Next
      </motion.button>
    </div>
  );
};

export default DobStep;