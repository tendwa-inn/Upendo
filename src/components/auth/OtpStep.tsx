import React, { useState } from 'react';

interface OtpStepProps {
  onNext: (otp: string) => void;
}

const OtpStep: React.FC<OtpStepProps> = ({ onNext }) => {
  const [otp, setOtp] = useState('');

  const handleNext = () => {
    if (otp.trim()) {
      onNext(otp.trim());
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Enter the OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter the code you received"
        className="w-full p-2 border rounded mb-4"
      />
      <button onClick={handleNext} className="w-full p-2 bg-blue-500 text-white rounded">
        Verify
      </button>
    </div>
  );
};

export default OtpStep;
