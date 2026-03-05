import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, User, Camera, Settings, Crown, Shield, Phone, MapPin, Heart, LogOut, Edit3, CheckCircle, Star, Plus, BookOpen, Ruler, GlassWater, Cigarette } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { currentUser } from '../data/mockData';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(currentUser.bio);
  const [age, setAge] = useState(currentUser.age);
  const [location, setLocation] = useState(currentUser.location.city);

  const subscriptionConfig = {
    free: {
      title: 'Free Account',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: User,
      features: ['50 swipes first day', '10 daily swipes', 'Basic filters'],
      price: 'Free',
      theme: 'gradient-romantic',
    },
    pro: {
      title: 'Pro Account',
      color: 'text-white',
      bgColor: 'bg-pro-grey',
      icon: Shield,
      features: ['Unlimited swipes', 'Blue verification', 'Advanced filters', 'See who liked you'],
      price: 'K20/week or K100/month',
      theme: 'gradient-pro',
    },
    vip: {
      title: 'VIP Account',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Crown,
      features: ['Exclusive lobby', 'Gold verification', 'International mode', 'Priority visibility'],
      price: 'K50/week',
      theme: 'vip-gradient',
    },
  };

  const currentSubscription = subscriptionConfig[user?.subscription || 'free'];
  const SubscriptionIcon = currentSubscription.icon;

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handlePhoneVerification = () => {
    toast.success('Phone verification initiated. Check your messages!');
  };

  return (
    <div className={`min-h-screen p-4 ${currentSubscription.theme}`}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <img
                src={currentUser.photos[0]}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/50"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
                <span className="text-xl text-gray-300">{age}</span>
                {user?.subscription === 'vip' && (
                  <img src="/VIP.png" alt="VIP" className="w-6 h-6 ml-2" />
                )}
                {currentUser.isVerified && (
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">{location}</span>
              </div>

              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20`}>
                <SubscriptionIcon className={`w-4 h-4 text-white`} />
                <span className={`text-sm font-medium text-white`}>
                  {currentSubscription.title}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">About Me</h3>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-white placeholder-gray-400"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">{bio}</p>
            )}
          </div>

          {/* About Me Sections */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Spotlights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Delicacies */}
              <div className="p-4 bg-white/50 rounded-2xl">
                <h4 className="font-semibold text-gray-800 mb-2">Delicacies</h4>
                {currentUser.aboutMe.delicacies?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-2">
                    {item.photo && <img src={item.photo} alt={item.food} className="w-10 h-10 rounded-lg object-cover" />}
                    <p className="text-gray-700">{item.food}</p>
                  </div>
                ))}
                {isEditing && (
                  <button className="w-full mt-2 py-2 border-2 border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Delicacy
                  </button>
                )}
              </div>

              {/* Travel */}
              <div className="p-4 bg-white/50 rounded-2xl">
                <h4 className="font-semibold text-gray-800 mb-2">Travel</h4>
                {currentUser.aboutMe.travel?.map((item, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-semibold text-gray-700">{item.place}</p>
                    <p className="text-sm text-gray-600">{item.summary}</p>
                  </div>
                ))}
                {isEditing && (
                  <button className="w-full mt-2 py-2 border-2 border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Travel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* My Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Education</p>
                  <p className="text-gray-300 capitalize">{currentUser.education || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Height</p>
                  <p className="text-gray-300">{currentUser.height ? `${currentUser.height} cm` : '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <GlassWater className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Drinking</p>
                  <p className="text-gray-300 capitalize">{currentUser.drinking || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Cigarette className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Smoking</p>
                  <p className="text-gray-300 capitalize">{currentUser.smoking || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Religion</p>
                  <p className="text-gray-300">{currentUser.religion || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Heart className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">First Date</p>
                  <p className="text-gray-300 capitalize">{currentUser.firstDate?.replace('-', ' ') || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Subscription</h3>
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(subscriptionConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isCurrent = user?.subscription === key;
              
              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-pink-500 bg-white/20'
                      : 'border-transparent bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon className={`w-5 h-5 text-white`} />
                    <h4 className="font-semibold text-white">{config.title}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{config.price}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {config.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && (
                    <button className="w-full py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 text-sm font-medium">
                      Upgrade
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-300" />
                <span className="text-white">Phone Verification</span>
              </div>
              <button
                onClick={handlePhoneVerification}
                className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm"
              >
                Verify
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-gray-300" />
                <span className="text-white">Distance Preference</span>
              </div>
              <span className="text-gray-300 text-sm">{currentUser.preferences.distance}km</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-300" />
                <span className="text-white">Notifications</span>
              </div>
              <button className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm">
                Enabled
              </button>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;