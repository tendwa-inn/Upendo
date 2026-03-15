import React from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { useAuthStore } from '../../stores/authStore';
import { PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

import { User, AuthUser } from '../../types';

const WelcomeStep: React.FC = () => {
  const { formData } = useSignUpStore();
  const { signUp } = useAuthStore();

  const handleStart = async () => {
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name || 'Zarah',
        age: formData.age || 25,
        dateOfBirth: formData.dateOfBirth || new Date(),
        gender: formData.gender || 'woman',
        lookingFor: formData.lookingFor || 'men',
        tribe: formData.tribe || 'Bemba',
        hereFor: formData.hereFor || ['Dating'],
        interests: formData.interests || ['Hiking', 'Reading'],
        bio: formData.bio || 'Lover of nature and good books.',
        photos: formData.photos || [],
        location: formData.location || { latitude: -15.4167, longitude: 28.2833, city: 'Lusaka' },
        subscription: 'free',
        isVerified: false,
        online: true,
        preferences: {
          ageRange: [18, 55],
          distance: 50,
        },
        aboutMe: {},
        email: `${(formData.name || 'zarah').toLowerCase().replace(/\s/g, '.')}@upendo.com`,
      };

      const newAuthUser: AuthUser = {
        ...newUser,
        email: newUser.email,
      };

      await signUp(newAuthUser);
      toast.success(`Welcome to Upendo, ${newUser.name}!`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <PartyPopper className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">Welcome, {formData.name}!</h2>
      <p className="text-white/80 mb-8">
        You're all set! Get ready to find your perfect match.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStart}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
      >
        Start Swiping
      </motion.button>
    </div>
  );
};

export default WelcomeStep;