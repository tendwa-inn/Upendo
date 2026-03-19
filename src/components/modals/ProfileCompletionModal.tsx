import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';

const defaultOccupations = ['Accountant', 'Teacher', 'Engineer', 'Doctor', 'Nurse', 'Lawyer', 'Entrepreneur', 'Artist', 'Musician', 'Chef', 'Driver', 'Sales', 'Manager', 'Developer', 'Consultant', 'Not Working'];
const firstDateOptions = ['Coffee', 'Museum', 'Park walk', 'Dinner', 'Movie'];

const questions = [
  {
    key: 'loveLanguage',
    question: 'What is your love language?',
    type: 'multiple-choice',
    options: ['Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 'Quality Time', 'Physical Touch'],
  },
  {
    key: 'education',
    question: 'What is your highest level of education?',
    type: 'dropdown',
    options: ['Not Completed', 'High School', 'Undergraduate', 'Associate\'s Degree', 'Bachelor\'s Degree', 'Master\'s', 'Graduate', 'Postgraduate', 'Student'],
  },
  {
    key: 'height',
    question: 'What is your height?',
    type: 'dropdown',
    skippable: true,
    options: ['4\'11" (150cm)', '5\'0" (152cm)', '5\'1" (155cm)', '5\'2" (157cm)', '5\'3" (160cm)', '5\'4" (163cm)', '5\'5" (165cm)', '5\'6" (168cm)', '5\'7" (170cm)', '5\'8" (173cm)', '5\'9" (175cm)', '5\'10" (178cm)', '5\'11" (180cm)', '6\'0" (183cm)', '6\'1" (185cm)', '6\'2" (188cm)', '6\'3" (191cm)'],
  },
  {
    key: 'drinking',
    question: 'Do you drink?',
    type: 'dropdown',
    options: ['Never', 'Socially', 'Occasionally', 'Frequently'],
  },
  {
    key: 'smoking',
    question: 'Do you smoke?',
    type: 'dropdown',
    options: ['Never', 'Socially', 'Occasionally', 'Frequently'],
  },
  {
    key: 'firstDate',
    question: 'What would you want to do on a first date?',
    type: 'dropdown-with-text',
    skippable: true,
    options: firstDateOptions,
    placeholder: 'Or suggest your own idea...'
  },
  {
    key: 'working',
    question: 'Are you currently working?',
    type: 'multiple-choice',
    options: ['Yes', 'No'],
  },
  {
    key: 'occupation',
    question: 'What is your occupation?',
    type: 'dropdown-with-text',
    options: defaultOccupations,
    placeholder: 'Search or type your profession...',
    condition: (answers) => answers.working === 'Yes',
  },
  {
    key: 'bio',
    question: 'Tell us more about yourself:',
    type: 'textarea',
    placeholder: 'Your future matches will see this...'
  },
  {
    key: 'religion',
    question: 'What is your religion?',
    type: 'dropdown',
    skippable: true,
    options: ['Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian', 'Hindu', 'Jewish', 'Muslim', 'Sikh', 'Spiritual', 'Other'],
  },
];

const ProfileCompletionModal = ({ onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [localOccupations, setLocalOccupations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchTerm('');
  }, [currentQuestionIndex]);

  const handleAnswer = (key, answer) => {
    setAnswers(prev => ({ ...prev, [key]: answer }));
  };

  const handleAddLocalOccupation = () => {
    const newOccupation = answers.occupation;
    if (newOccupation && !defaultOccupations.includes(newOccupation) && !localOccupations.includes(newOccupation)) {
      setLocalOccupations(prev => [...prev, newOccupation]);
    }
  };

  const getNextQuestionIndex = (currentIndex, currentAnswers) => {
    let nextIndex = currentIndex + 1;
    while (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      if (!nextQuestion.condition || nextQuestion.condition(currentAnswers)) {
        return nextIndex;
      }
      nextIndex++;
    }
    return nextIndex;
  };

  const getPreviousQuestionIndex = (currentIndex, currentAnswers) => {
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
      const prevQuestion = questions[prevIndex];
      if (!prevQuestion.condition || prevQuestion.condition(currentAnswers)) {
        return prevIndex;
      }
      prevIndex--;
    }
    return prevIndex;
  };

  const handleNext = async () => {
    const nextIndex = getNextQuestionIndex(currentQuestionIndex, answers);
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setIsLoading(true);
      try {
        await onClose(answers);
      } catch (error) {
        console.error('Error saving profile:', error);
        // Error is already handled in updateUserProfile function
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    const prevIndex = getPreviousQuestionIndex(currentQuestionIndex, answers);
    if (prevIndex >= 0) {
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const currentQuestion = questions[currentQuestionIndex];

  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {currentQuestion.options.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(currentQuestion.key, option)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  answers[currentQuestion.key] === option
                    ? 'bg-pink-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <select 
            onChange={(e) => handleAnswer(currentQuestion.key, e.target.value)}
            value={answers[currentQuestion.key] || ''}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="" disabled>Select an option</option>
            {currentQuestion.options.map(option => (
              <option key={option} value={option} className="bg-[#2E0C13]">{option}</option>
            ))}
          </select>
        );
      case 'dropdown-with-text':
        const allOptions = currentQuestion.key === 'occupation' ? [...currentQuestion.options, ...localOccupations] : currentQuestion.options;
        const filteredOptions = allOptions.filter(opt => 
          opt.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div>
            <div className="relative">
              <input
                type="text"
                value={answers[currentQuestion.key] || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleAnswer(currentQuestion.key, e.target.value);
                }}
                placeholder={currentQuestion.placeholder}
                className="w-full p-3 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 mb-2"
              />
              {currentQuestion.key === 'occupation' && (
                <button onClick={handleAddLocalOccupation} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 rounded-full hover:bg-white/30">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    handleAnswer(currentQuestion.key, option);
                    setSearchTerm(option);
                  }}
                  className="w-full p-2 rounded-md text-left bg-white/5 hover:bg-white/10"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 'text-input':
        return (
          <input
            type="text"
            value={answers[currentQuestion.key] || ''}
            onChange={(e) => handleAnswer(currentQuestion.key, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        );
      case 'textarea':
        return (
          <textarea
            value={answers[currentQuestion.key] || ''}
            onChange={(e) => handleAnswer(currentQuestion.key, e.target.value)}
            placeholder={currentQuestion.placeholder}
            rows={4}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        );
      default:
        return null;
    }
  };

  const isLastQuestion = getNextQuestionIndex(currentQuestionIndex, answers) >= questions.length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-md text-white border border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Complete Your Profile</h2>
          <button onClick={() => onClose()} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="min-h-[200px]">
          <p className="text-lg mb-4 font-semibold">{currentQuestion.question}</p>
          {renderInput()}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevious} 
              disabled={getPreviousQuestionIndex(currentQuestionIndex, answers) < 0}
              className="px-5 py-2 bg-white/20 rounded-lg font-semibold disabled:opacity-50 transition-opacity"
            >
              Back
            </button>
            {currentQuestion.skippable && (
              <button onClick={handleSkip} className="px-5 py-2 bg-transparent text-gray-400 rounded-lg font-semibold hover:bg-white/10">Skip</button>
            )}
          </div>
          <button 
            onClick={handleNext} 
            disabled={isLoading}
            className="px-5 py-2 bg-pink-600 rounded-lg font-semibold transition-colors hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (isLastQuestion ? 'Finish' : 'Next')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionModal;