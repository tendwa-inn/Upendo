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

const SignUpPage: React.FC = () => {
  const { step, nextStep, updateData } = useSignUpStore();

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
        return <InterestsStep onNext={(interests) => { updateData({ interests }); nextStep(); }} />;
      case 8:
        return <PhotoUploadStep />;
      case 9:
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
        {renderStep()}
      </motion.div>
    </div>
  );
};

export default SignUpPage;