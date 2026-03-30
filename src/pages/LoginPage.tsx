import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Heart, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  // No form submission for Google login, so handleSubmit is removed

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-pro">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-4"
          >
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Upendo
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 text-lg"
          >
            Find your perfect match
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-3 rounded-2xl transition-all duration-300 hover:bg-white/30 mt-4"
          >
            <img src="/google-logo.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </motion.button>

        </div>




      </motion.div>
    </div>
  );
};

export default LoginPage;