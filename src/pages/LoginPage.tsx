import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useAdminStore } from '../stores/adminStore';
import { Heart, Mail, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login: userLogin } = useAuthStore();
  const { login: adminLogin } = useAdminStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isAdminLogin) {
        if (!adminLogin) {
          toast.error('Admin service is currently unavailable. Please try again later.');
          setIsLoading(false);
          return;
        }
        const success = await adminLogin(email, password);
        if (success) {
          toast.success('Welcome Admin!');
          navigate('/admin/dashboard');
        } else {
          toast.error('Invalid admin credentials');
        }
      } else {
        await userLogin(email, password);
        toast.success('Welcome to Upendo!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {isAdminLogin ? (
              <Shield className="w-10 h-10 text-white" />
            ) : (
              <Heart className="w-10 h-10 text-white" fill="currentColor" />
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {isAdminLogin ? 'Admin Portal' : 'Upendo'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 text-lg"
          >
            {isAdminLogin ? 'Sign in to access administrative controls' : 'Find your perfect match'}
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6"
        >
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-white/70 text-sm">
            {isAdminLogin ? 'Not an admin?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsAdminLogin(!isAdminLogin)} className="text-white font-medium hover:underline">
              {isAdminLogin ? 'User Login' : 'Admin Login'}
            </button>
          </p>
          {!isAdminLogin && (
            <p className="text-white/70 text-sm mt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white font-medium hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;