import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const { isLoading, signInWithGoogle } = useAuthStore();

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      // On successful sign-in, Supabase will redirect.
      // If the user is new, you might want to redirect them to a profile setup page.
      // This logic can be handled in the component that listens to auth state changes (e.g., App.tsx).
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      alert('Failed to sign up with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-pro p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6 text-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          <p className="text-white/80 mt-2">Join Upendo today to find your match.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <button 
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 bg-white/20 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:bg-white/30 active:scale-95"
          >
            <img src="/google-logo.svg" alt="Google" className="w-6 h-6" />
            Sign up with Google
          </button>
        )}

        <div className="flex items-center justify-center space-x-2">
          <div className="flex-grow h-px bg-white/20"></div>
          <span className="text-white/60 text-sm">OR</span>
          <div className="flex-grow h-px bg-white/20"></div>
        </div>

        <div className="text-center">
          <p className="text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-white hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
