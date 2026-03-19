import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const LocationStep: React.FC = () => {
  const { prevStep, updateFormData, formData } = useOnboardingStore();
  const { createProfile } = useAuthStore();
  const navigate = useNavigate();
  const [location, setLocation] = useState(formData.location || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    setIsLoading(true);
    const finalData = { ...formData, location };
    try {
      await createProfile(finalData);
      navigate('/find', { replace: true });
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Where are you located?</h1>
        <p className="text-white/60 mt-1">This helps us find matches near you.</p>
      </div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter your city, country"
        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
      />
      <div className="flex gap-4">
        <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        <button onClick={handleFinish} disabled={!location || isLoading} className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed">
          {isLoading ? 'Finishing Up...' : 'You are all set'}
        </button>
      </div>
    </motion.div>
  );
};

export default LocationStep;
