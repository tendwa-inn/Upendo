import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Star, Trash2, Plus } from 'lucide-react';

const PhotoViewerModal = ({ photos, startIndex, onClose, onAdd, onDelete, onSetDP }) => {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const next = () => setIndex((i) => (i + 1) % photos.length);
  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);

  const currentPhoto = photos[index];
  const isFirstPhoto = photos[0] === currentPhoto;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.img
          key={index}
          src={currentPhoto}
          className="max-h-[80vh] max-w-[80vw] object-contain"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        />
      </AnimatePresence>

      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/75">
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/75">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/75">
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4 p-2 rounded-full bg-black/50">
        <button onClick={() => onSetDP(currentPhoto)} className={`p-2 rounded-full hover:bg-white/20 ${isFirstPhoto ? 'text-yellow-400' : 'text-white'}`}>
          <Star className="w-6 h-6" />
        </button>
        <button onClick={() => {
          onDelete(currentPhoto);
          if (photos.length <= 1) onClose();
          else setIndex(0);
        }} className="text-white p-2 rounded-full hover:bg-white/20">
          <Trash2 className="w-6 h-6" />
        </button>
        <button onClick={onAdd} className="text-white p-2 rounded-full hover:bg-white/20">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default PhotoViewerModal;
