import React from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../stores/signUpStore';
import NameStep from '../components/auth/NameStep';
import DobStep from '../components/auth/DobStep';
import GenderStep from '../components/auth/GenderStep';
import TribeStep from '../components/auth/TribeStep';
import PurposeStep from '../components/auth/PurposeStep';
import PhotoUploadStep from '../components/auth/PhotoUploadStep';
import InterestsStep from '../components/auth/InterestsStep';
import LocationStep from '../components/auth/LocationStep';
import WelcomeStep from '../components/auth/WelcomeStep';
import PhoneStep from '../components/auth/PhoneStep';
import OtpStep from '../components/auth/OtpStep';
import { useAuthStore } from '../stores/authStore';

const SignUpPage: React.FC = () => {
  const { step, nextStep, updateFormData, formData } = useSignUpStore();
  const { signUp, isLoading } = useAuthStore();

  const handlePhoneSubmit = async (phone: string) => {
    updateFormData({ phone });
    try {
      await sendOtp(phone);
      nextStep();
    } catch (error) {
      alert('Failed to send OTP. Please try again.');
    }
  };
  
  const handleOtpSubmit = async (otp: string) => {
    try {
      await verifyOtp(formData.phone, otp);
      // After OTP verification, create the user profile
      await signUp(formData);
      nextStep();
    } catch (error) {
      alert('Sign up failed. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <LocationStep />;
      case 2:
        return <NameStep />;
      case 3:
        return <DobStep />;
      case 4:
        return <GenderStep />;
      case 5:
        return <TribeStep />;
      case 6:
        return <PurposeStep />;
      case 7:
        return <InterestsStep onNext={(interests) => { updateFormData({ interests }); nextStep(); }} />;
      case 8:
        return <PhotoUploadStep />;
      case 9:
        return <PhoneStep onNext={handlePhoneSubmit} />;
      case 10:
        return <OtpStep onNext={handleOtpSubmit} />;
      case 11:
        return <WelcomeStep />;
      default:
        return <LocationStep />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-pro p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 space-y-6"
      >
        {isLoading ? <p>Loading...</p> : renderStep()}
      </motion.div>
    </div>
  );
};

export default SignUpPage;