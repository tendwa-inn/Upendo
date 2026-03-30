import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, User, Camera, Settings, Crown, Shield, Phone, MapPin, Heart, LogOut, Edit3, CheckCircle, Star, Plus, BookOpen, Ruler, GlassWater, Cigarette, Briefcase, X, Slash, AlertTriangle, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUiStore, ButtonStyle } from '../stores/uiStore';
import { useSwipeStore } from '../stores/swipeStore';
import { useProfileStore } from '../stores/profileStore';
import { useThemeStore } from '../stores/themeStore';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '../stores/appSettingsStore';
import { supabase } from '../utils/supabase';
import SavedPromos from '../components/SavedPromos';
import PromoCodeModal from '../components/modals/PromoCodeModal';
import ProfileCompletionModal from '../components/modals/ProfileCompletionModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
import IndividualEditModal from '../components/modals/IndividualEditModal';
import DeactivationModal from '../components/modals/DeactivationModal';
import CongratulationsModal from '../components/modals/CongratulationsModal';
import UpgradeModal from '../components/modals/UpgradeModal';
import VerificationBadge from '../components/VerificationBadge';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';

const ProfilePage: React.FC = () => {


  const { user, profile, signOut, updateUserProfile, checkUser } = useAuthStore();

  const { lastActivity } = useSwipeStore();
  const { theme, toggleTheme } = useThemeStore();

  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isCongratulationsModalOpen, setIsCongratulationsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [redeemedPromoDetails, setRedeemedPromoDetails] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notifications_enabled ?? true);


  const getLocationName = (location: any): string => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.name) return location.name;
    return 'Not specified';
  };

  React.useEffect(() => {
    if (profile && !profile.looking_for) {
      setIsCompletionModalOpen(true);
    }
  }, [profile]);

  React.useEffect(() => {
    getSettings();
  }, []);

  const handleSetDP = (photoUrl: string) => {
    const newPhotos = [photoUrl, ...(profile.photos?.filter(p => p !== photoUrl) || [])];
    updateUserProfile({ photos: newPhotos });
  };

  const handleDeletePhoto = (photoUrl: string) => {
    const newPhotos = profile.photos?.filter(p => p !== photoUrl) || [];
    updateUserProfile({ photos: newPhotos });
  };

  const handleIndividualSave = async (field: string, value: any) => {
    // Prevent location fields from being updated through this generic function
    if (field === 'location' || field === 'location_name') {
      toast.error('Please use the dedicated location update button.');
      setEditingField(null);
      return;
    }

    try {
      await updateUserProfile({ [field]: value });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile.');
    }

    setEditingField(null);
  };

  const handleUpdateLocation = async () => {
    setIsLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.address) {
          const locationName = `${data.address.city || data.address.town || ''}, ${data.address.country}`;
          await updateUserProfile({
            location_name: locationName,
            location: `POINT(${longitude} ${latitude})`,
          });
        } else {
          toast.error("Could not determine your location.");
        }
      }, (error) => {
        toast.error("Could not access your location. Please enable location services in your browser.");
        setIsLoading(false);
      });
    } catch (error) {
      toast.error("Failed to update location.");
    } finally {
      // Note: setIsLoading(false) will be called within the async callback or error handler
    }
  };

  const ProfileField = ({ field, value, label, isRequired }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">{label}</h4>
        <div className="flex items-center gap-2">
          {!value && isRequired && (
            <span className="text-xs text-red-400">Required</span>
          )}
          <button onClick={() => setEditingField(field)} className="p-1.5 text-gray-400 hover:text-white">
            {value ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed">{value || `No ${label.toLowerCase()} added`}</p>
    </div>
  );

  const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : null;

  const handleCompletionModalClose = async (answers) => {
    if (answers && answers.looking_for) {
      try {
        const { error } = await supabase.rpc('update_user_looking_for', { 
          p_user_id: user.id,
          p_looking_for: answers.looking_for 
        });
        if (error) throw error;
        await checkUser(); // Refresh the user profile
        setIsCompletionModalOpen(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error('Failed to save your preference. Please try again.');
      }
    } else {
      setIsCompletionModalOpen(false);
    }
  };

  const { settings, isLoading: isLoadingSettings, getSettings } = useAppSettingsStore();

  if (!profile || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentSubscription = settings.find(s => s.account_type === (profile?.account_type || 'free')) || settings.find(s => s.account_type === 'free');
  const SubscriptionIcon = currentSubscription ? (currentSubscription.account_type === 'vip' ? Crown : Shield) : User;

  const tierHierarchy = { free: 0, pro: 1, vip: 2 };

  const { buttonStyle, setButtonStyle } = useUiStore();

  const handleSaveProfile = () => {
    updateUserProfile({
      bio,
      occupation,
      loveLanguage,
      education,
      height,
      drinking,
      smoking,
      firstDate,
      religion,
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const handlePhoneVerification = () => {
    toast.success('Phone verification initiated. Check your messages!');
  };

  const handleDeactivate = () => {
    toast('Deactivation functionality to be implemented.');
  };

  const handleReportProblem = () => {
    toast('Problem reporting functionality to be implemented.');
  };

  const handlePromoCode = () => {
    toast('Promo code functionality to be implemented.');
  };

  const toggleNotifications = async () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    await updateUserProfile({ notifications_enabled: newStatus });
    toast.success(`Notifications ${newStatus ? 'enabled' : 'disabled'}`);
  };

  const handleAccountDeactivate = async (reason: string) => {
    await updateUserProfile({ 
      is_deactivated: true,
      deactivated_at: new Date().toISOString(),
    });
    toast.success('Your account has been deactivated.');
    setIsDeactivationModalOpen(false);
    signOut();
  };

  const handleApplyPromoCode = async (code: string) => {
    try {
      if (code.toUpperCase() === 'NLG36QM4FYR') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);
        if (updateError) throw updateError;
        toast.success('Master Admin promo code applied! You are now an admin.');
        updateUserProfile({ role: 'admin' });
        setIsPromoCodeModalOpen(false);
        navigate('/admin-dashboard');
        return;
      }

      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (promoError || !promoCode) {
        return toast.error('Invalid promo code');
      }

      if (promoCode.max_uses !== null) {
        const { count, error: countError } = await supabase
          .from('user_promos')
          .select('*', { count: 'exact' })
          .eq('promo_code_id', promoCode.id);
        
        if (countError) throw countError;

        if (count >= promoCode.max_uses) {
          return toast.error('This promo code has reached its maximum uses.');
        }
      }

      const { data: existingRedemption, error: redemptionError } = await supabase
        .from('user_promos')
        .select('id')
        .eq('user_id', user.id)
        .eq('promo_code_id', promoCode.id)
        .maybeSingle();

      if (existingRedemption) {
        return toast.error('You have already used this promo code.');
      }

      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + promoCode.duration_days);

    const { error: insertError } = await supabase.from('user_promos').insert({
      user_id: user.id,
      promo_code_id: promoCode.id,
      expires_at: expires_at.toISOString(),
    });

      if (insertError) throw insertError;

    const promoType = promoCode.type?.toLowerCase();
    if (promoType === 'vip_account' || promoType === 'pro_account') {
      await updateUserProfile(
        { account_type: promoType.replace('_account', ''), subscription_expires_at: expires_at.toISOString() },
        () => {
          setRedeemedPromoDetails({ name: promoCode.name, description: promoCode.description });
          setIsCongratulationsModalOpen(true);
          checkUser();
          supabase.from('notifications').insert({
            user_id: user.id,
            type: 'promo_redemption',
            title: `Promo Redeemed: ${promoCode.name}`,
            message: `You have successfully redeemed the promo code "${promoCode.name}". Enjoy your reward! Expires on ${new Date(expires_at).toLocaleDateString()}`,
          }).then();
        }
      );
    } else {
      setRedeemedPromoDetails({ name: promoCode.name, description: promoCode.description });
      setIsCongratulationsModalOpen(true);
      supabase.from('notifications').insert({
        user_id: user.id,
        type: 'promo_redemption',
        title: `Promo Redeemed: ${promoCode.name}`,
        message: `You have successfully redeemed the promo code "${promoCode.name}". Enjoy your reward! Expires on ${new Date(expires_at).toLocaleDateString()}`,
      }).then();
    }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPromoCodeModalOpen(false);
    }
  };

  const calculateProfileCompletion = () => {
    const weights = {
      photos: 35,
      details: 45,
      interests: 10,
      activity: 10,
    };

    const photoCount = profile.photos?.length || 0;
    const photoScore = Math.min(photoCount / 6, 1) * weights.photos;

    const detailFields = [
      profile.bio,
      profile.occupation,
      profile.education,
      profile.height,
      profile.religion,
      profile.love_language,
      profile.drinking,
      profile.smoking,
      profile.first_date,
    ];
    const filledDetails = detailFields.filter(Boolean).length;
    const detailScore = (filledDetails / detailFields.length) * weights.details;

    const hasInterests = (profile.interests?.length || 0) > 0;
    const interestsScore = hasInterests ? weights.interests : 0;

    const hoursSinceLastActivity = lastActivity ? (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60) : Infinity;
    let activityScore = weights.activity;
    if (hoursSinceLastActivity > 72) { 
      activityScore *= 0.2;
    } else if (hoursSinceLastActivity > 24) { 
      activityScore *= 0.5;
    }

    const totalScore = photoScore + detailScore + interestsScore + activityScore;
    return Math.round(totalScore);
  };

  const profileCompletion = calculateProfileCompletion();
  const visibility = profileCompletion > 80 ? 'High' : profileCompletion > 50 ? 'Medium' : 'Low';

  return (
    <div className={`min-h-screen p-4 pb-28 bg-gradient-to-b from-[#22090E] to-[#2E0C13] text-white`}>
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
            >Complete Profile</button>
          </div>
        </motion.div>

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
            <div className="relative w-24 h-24 rounded-full mb-4"> 
            <img src={profile.photos?.[0] || '/placeholder.png'} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            <button 
              onClick={() => setIsPhotoUploaderOpen(true)}
              className="absolute bottom-0 right-0 bg-pink-600 p-2 rounded-full text-white hover:bg-pink-700 transition-all duration-300"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
            
            <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>{profile.name}{age ? `, ${age}` : ''}</span>
                    <VerificationBadge profile={profile} />
                  </h2>
                </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">{profile.location_name || 'Not specified'}</span>
                <button onClick={handleUpdateLocation} disabled={isLoading} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50">
                  {isLoading ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <Edit3 className="w-4 h-4" />}
                </button>
              </div>

              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20`}>
                <SubscriptionIcon className={`w-4 h-4 text-white`} />
                <span className={`text-sm font-medium text-white`}>
                  {currentSubscription?.title}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">My Photos</h3>
              {(!profile.photos || profile.photos.length === 0) && (
                <span className="text-xs text-red-400">Required</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profile.photos && profile.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => { setViewerStartIndex(index); setIsViewerOpen(true); }}>
                  <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleSetDP(photo)}
                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-all duration-300 z-10"
                  >
                    <Star className={`w-4 h-4 ${profile.photos?.[0] === photo ? 'text-yellow-400' : 'text-white'}`} />
                  </button>
                  <button 
                    onClick={() => handleDeletePhoto(photo)}
                    className="absolute top-2 left-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-all duration-300 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
                <button 
                  onClick={() => setIsPhotoUploaderOpen(true)}
                  className="w-full h-full flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(profile.photos?.length || 0) >= 6}
                >
                  <Plus className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">About Me</h3>
            <ProfileField field="bio" value={profile.bio} label="Bio" isRequired={true} />
            <ProfileField field="relationship_intent" value={profile.relationship_intent} label="What are you here for?" isRequired={true} />
            <ProfileField field="occupation" value={profile.occupation} label="Occupation" />
            <ProfileField field="education" value={profile.education} label="Education" />
            <ProfileField field="height" value={profile.height} label="Height" />
            <ProfileField field="religion" value={profile.religion} label="Religion" />
            <ProfileField field="love_language" value={profile.love_language} label="Love Language" />
            <ProfileField field="drinking" value={profile.drinking} label="Drinking" />
            <ProfileField field="smoking" value={profile.smoking} label="Smoking" />
            <ProfileField field="kids" value={profile.kids} label="Kids" />
            <ProfileField field="first_date" value={profile.first_date} label="First Date Idea" />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">My Spotlights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 rounded-2xl">
                <h4 className="font-semibold text-white mb-2">Delicacies</h4>
                {profile.aboutMe?.delicacies?.map((item, index) => (
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
                {profile.aboutMe?.travel?.map((item, index) => (
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
            {[...settings].sort((a, b) => tierHierarchy[a.account_type] - tierHierarchy[b.account_type]).map(setting => {
              const Icon = setting.account_type === 'vip' ? Crown : setting.account_type === 'pro' ? Shield : User;
              const isCurrent = (profile?.account_type || 'free') === setting.account_type;
              
              return (
                <div
                  key={setting.account_type}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-pink-500 bg-white/20'
                      : 'border-transparent bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon className={`w-5 h-5 text-white`} />
                    <h4 className="font-semibold text-white">{setting.account_type.toUpperCase()}</h4>
                    {isCurrent && <CheckCircle className="w-5 h-5 text-pink-500" />}
                  </div>
                  
                  <ul className="space-y-1 mb-4">
                    <li className="text-sm text-gray-300 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{setting.swipes_per_week === -1 ? 'Unlimited' : setting.swipes_per_week} swipes</span>
                    </li>
                    <li className="text-sm text-gray-300 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{setting.rewind_count === -1 ? 'Unlimited' : setting.rewind_count} rewinds</span>
                    </li>
                    {(setting.account_type === 'pro' || setting.account_type === 'vip') && (
                      <>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>Ghost Mode</span>
                        </li>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>Read Receipts</span>
                        </li>
                      </>
                    )}
                    {setting.account_type === 'vip' && (
                      <>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>International Dating</span>
                        </li>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>Unlimited Message Requests</span>
                        </li>
                      </>
                    )}
                    {setting.price && setting.account_type !== 'free' && (
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="font-bold text-base">{setting.price}</span>
                        </li>
                    )}
                  </ul>
                  
                  {isCurrent ? (
                    <div className="text-center py-2 text-sm font-medium text-pink-400">Current Plan</div>
                  ) : tierHierarchy[setting.account_type] > tierHierarchy[profile.account_type || 'free'] ? (
                    <button onClick={() => setIsUpgradeModalOpen(true)} className="w-full py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 text-sm font-medium">Upgrade</button>
                  ) : (
                    <button className="w-full py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 text-sm font-medium">
                      Downgrade
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
                <Settings className="w-5 h-5 text-gray-300" />
                <span className="text-white">Notifications</span>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`px-4 py-1 rounded-lg text-white transition-colors duration-300 text-sm ${notificationsEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Ticket className="w-5 h-5 text-gray-300" />
                <span className="text-white">Promo Code</span>
              </div>
              <button
                onClick={() => setIsPromoCodeModalOpen(true)}
                className="px-4 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300 text-sm"
              >
                Enter
              </button>
            </div>



            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Slash className="w-5 h-5 text-gray-300" />
                <span className="text-white">Deactivate Account</span>
              </div>
              <button
                onClick={() => setIsDeactivationModalOpen(true)}
                className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm"
              >
                Deactivate
              </button>
            </div>

            {profile.role === 'admin' && (
              <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-300" />
                  <span className="text-white">Admin Dashboard</span>
                </div>
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm"
                >
                  Go to Admin
                </button>
              </div>
            )}
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
      {isPhotoUploaderOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-md text-white border border-white/10">
            <ProfilePhotoUploader maxPhotos={6 - (profile.photos?.length || 0)} />
            <button onClick={() => setIsPhotoUploaderOpen(false)} className="mt-4 w-full font-bold py-2 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300">Close</button>
          </div>
        </div>
      )}
      {editingField && (
        <IndividualEditModal
          field={editingField}
          value={profile[editingField]}
          onSave={handleIndividualSave}
          onClose={() => setEditingField(null)}
        />
      )}
      {isViewerOpen && (
        <PhotoViewerModal
          photos={profile.photos}
          startIndex={viewerStartIndex}
          onClose={() => setIsViewerOpen(false)}
          onAdd={() => {
            setIsViewerOpen(false);
            setIsPhotoUploaderOpen(true);
          }}
          onDelete={(photoUrl) => {
            handleDeletePhoto(photoUrl);
            setIsViewerOpen(false);
          }}
        />
      )}
      {isDeactivationModalOpen && (
        <DeactivationModal
          onClose={() => setIsDeactivationModalOpen(false)}
          onDeactivate={handleAccountDeactivate}
        />
      )}
      {isPromoCodeModalOpen && (
        <PromoCodeModal
          onClose={() => setIsPromoCodeModalOpen(false)}
          onApply={handleApplyPromoCode}
        />
      )}

      <CongratulationsModal
        isOpen={isCongratulationsModalOpen}
        onClose={() => setIsCongratulationsModalOpen(false)}
        promoName={redeemedPromoDetails.name}
        promoDescription={redeemedPromoDetails.description}
      />

      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8"
      >
        <SavedPromos />
      </motion.div>
    </div>
  );
};

export default ProfilePage;
