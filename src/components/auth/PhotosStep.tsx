import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { UploadCloud, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PhotosStep: React.FC = () => {
  const { formData, updateFormData, nextStep } = useSignUpStore();
  const [photos, setPhotos] = useState<string[]>(formData.photos || []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (photos.length + event.target.files.length > 6) {
        toast.error('You can upload a maximum of 6 photos.');
        return;
      }
      const newPhotos = Array.from(event.target.files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (photos.length < 2) {
      toast.error('Please upload at least 2 photos.');
      return;
    }
    updateFormData({ photos });
    nextStep();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <h2 className="text-3xl font-bold mb-2 text-white">Add your photos</h2>
      <p className="text-white/80 mb-6">Add at least 2 photos to continue.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
            <img src={photo} alt={`user photo ${index + 1}`} className="w-full h-full object-cover" />
            <button onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full">
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}

        {photos.length < 6 && (
          <label className="aspect-square flex flex-col items-center justify-center bg-white/10 rounded-lg cursor-pointer">
            <UploadCloud className="w-8 h-8 text-white/50 mb-2" />
            <span className="text-sm text-white/50">Upload</span>
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        )}
      </div>

      <button onClick={handleNext} className="w-full p-4 bg-purple-600 text-white rounded-lg font-bold">
        Next
      </button>
    </motion.div>
  );
};

export default PhotosStep;
