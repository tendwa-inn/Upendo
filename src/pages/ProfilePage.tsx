import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, User, Camera, Settings, Crown, Shield, Phone, MapPin, Heart, LogOut, Edit3, CheckCircle, Star, Plus, BookOpen, Ruler, GlassWater, Cigarette, Briefcase } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUiStore, ButtonStyle } from '../stores/uiStore';
import { useSwipeStore } from '../stores/swipeStore';
import { useProfileStore } from '../stores/profileStore';
import { useThemeStore } from '../stores/themeStore';
import toast from 'react-hot-toast';
import { subscriptionConfig } from '../data/mockData';
import ProfileCompletionModal from '../components/modals/ProfileCompletionModal';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currentUser, updateCurrentUser } = useProfileStore();
  const { theme, toggleTheme } = useThemeStore();
  const { lastActivity } = useSwipeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age || 0);
  const [location, setLocation] = useState(user?.location?.city || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [education, setEducation] = useState(user?.education || '');
  const [drinking, setDrinking] = useState(user?.drinking || '');
  const [smoking, setSmoking] = useState(user?.smoking || '');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleCompletionModalClose = (answers) => {
    if (answers) {
      updateCurrentUser(answers);
      toast.success('Profile updated!');
    }
    setIsCompletionModalOpen(false);
  };

  const currentSubscription = subscriptionConfig[user.subscription || 'free'];
  const SubscriptionIcon = currentSubscription.icon;

  const { buttonStyle, setButtonStyle } = useUiStore();

  const handleSaveProfile = () => {
    updateCurrentUser({
      bio,
      age,
      occupation,
      education,
      drinking,
      smoking,
    });
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

  const calculateProfileCompletion = () => {
    const fields = [
      currentUser.bio,
      currentUser.age,
      currentUser.location?.city,
      currentUser.occupation,
      currentUser.education,
      currentUser.drinking,
      currentUser.smoking,
      (currentUser.photos?.length || 0) > 1,
      currentUser.interests?.length > 0,
      currentUser.hereFor?.length > 0,
      currentUser.aboutMe?.delicacies?.length > 0,
      currentUser.aboutMe?.travel?.length > 0,
      currentUser.religion,
      currentUser.height,
      currentUser.firstDate
    ];
    const completedFields = fields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'number') return true;
      return field && field.length > 0;
    });
    let completion = (completedFields.length / fields.length);

    // Adjust for activity
    const hoursSinceLastActivity = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastActivity > 72) { // 3 days
      completion *= 0.8;
    } else if (hoursSinceLastActivity > 24) { // 1 day
      completion *= 0.9;
    }

    // Placeholder for unmatch penalty
    // completion *= (1 - (unmatchCount * 0.05));

    return Math.round(completion * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const visibility = profileCompletion > 80 ? 'High' : profileCompletion > 50 ? 'Medium' : 'Low';

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-b from-[#22090E] to-[#2E0C13] text-white`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-300">Profile Completion</p>
                <p className="text-lg font-bold text-white">{profileCompletion}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Visibility</p>
                <p className={`text-lg font-bold ${visibility === 'High' ? 'text-green-400' : visibility === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{visibility}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCompletionModalOpen(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300"
            >
              Complete Profile
            </button>
          </div>
        </motion.div>

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

          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <img
                src={user.photos[0]}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/50"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <span className="text-xl text-gray-300">{age}</span>
                {user.subscription === 'vip' && (
                  <img src="/VIP.png" alt="VIP" className="w-6 h-6 ml-2" />
                )}
                {user.isVerified && (
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

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Spotlights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 rounded-2xl">
                <h4 className="font-semibold text-white mb-2">Delicacies</h4>
                {user.aboutMe?.delicacies?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-2">
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
                {isEditing && (
                  <button className="w-full mt-2 py-2 border-2 border-dashed border-gray-500 text-gray-300 rounded-lg hover:bg-white/10 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Delicacy
                  </button>
                )}
              </div>

              <div className="p-4 bg-white/50 rounded-2xl">
                <h4 className="font-semibold text-white mb-2">Travel</h4>
                {user.aboutMe?.travel?.map((item, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-semibold text-gray-200">{item}</p>
                  </div>
                ))}
                {isEditing && (
                  <button className="w-full mt-2 py-2 border-2 border-dashed border-gray-500 text-gray-300 rounded-lg hover:bg-white/10 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Travel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Education</p>
                  <p className="text-gray-300 capitalize">{user.education || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Height</p>
                  <p className="text-gray-300">{user.height ? `${user.height} cm` : '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <GlassWater className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Drinking</p>
                  <p className="text-gray-300 capitalize">{user.drinking || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Cigarette className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Smoking</p>
                  <p className="text-gray-300 capitalize">{user.smoking || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Religion</p>
                  <p className="text-gray-300">{user.religion || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Heart className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">First Date</p>
                  <p className="text-gray-300 capitalize">{user.firstDate?.replace('-', ' ') || '-'}</p>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-200">Occupation</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
                      placeholder="e.g. Accountant"
                    />
                  ) : (
                    <p className="text-gray-300 capitalize">{occupation || '-'}</p>
                  )}
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
              const isCurrent = user.subscription === key;
              
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
              <span className="text-gray-300 text-sm">{user.preferences?.distance}km</span>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Button Style</h3>
          <div className="flex justify-around">
            <button 
              onClick={() => setButtonStyle('upendo-color')}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${buttonStyle === 'upendo-color' ? 'bg-pink-500' : 'bg-white/20'}`}>
              Upendo Color
            </button>
            <button 
              onClick={() => setButtonStyle('white-clean')}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${buttonStyle === 'white-clean' ? 'bg-pink-500' : 'bg-white/20'}`}>
              White Clean
            </button>
            <button 
              onClick={() => setButtonStyle('vintage')}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${buttonStyle === 'vintage' ? 'bg-pink-500' : 'bg-white/20'}`}>
              Vintage
            </button>
          </div>
        </motion.div>

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
      {isCompletionModalOpen && (
        <ProfileCompletionModal onClose={handleCompletionModalClose} />
      )}
    </div>
  );
};

export default ProfilePage;
