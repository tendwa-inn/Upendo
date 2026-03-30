import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../stores/onboardingStore';
import NameStep from '../components/onboarding/NameStep';
import DobStep from '../components/onboarding/DobStep';
import GenderStep from '../components/onboarding/GenderStep';
import TribeStep from '../components/onboarding/TribeStep';
import InterestsStep from '../components/onboarding/InterestsStep';
import LookingForStep from '../components/onboarding/LookingForStep';
import LocationStep from '../components/onboarding/LocationStep';
import KidsStep from '../components/onboarding/KidsStep';

import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const CreateProfilePage: React.FC = () => {
  const { step, prevStep } = useOnboardingStore();
  const navigate = useNavigate();

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else {
      prevStep();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <NameStep />;
      case 2:
        return <DobStep />;
      case 3:
        return <GenderStep />;
      case 4:
        return <LookingForStep />;
      case 5:
        return <KidsStep />;
      case 6:
        return <TribeStep />;
      case 7:
        return <InterestsStep />;
      case 8:
        return <LocationStep />;
      default:
        return <NameStep />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 z-20 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Go back"
      >
        <IoArrowBack size={24} />
      </button>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/SIGN%20UP.png)', // Use URL encoding for the space
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateProfilePage;
