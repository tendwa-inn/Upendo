import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockUsers } from '../data/mockData';
import { User } from '../types';
import { ArrowLeft, MapPin, Calendar, Heart } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { theme } = useThemeStore();
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    return <div className="p-4 text-center">User not found</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-900 via-purple-800 to-black'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 p-4 ${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white/10 backdrop-blur-md border-b border-white/20'}`}>
        <div className="flex items-center space-x-4">
          <Link to="/chat" className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-white hover:bg-white/20'}`}>
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-white'}`}>{user.name}</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={user.photos[0]} 
            alt={user.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-lg mb-4"
          />
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-white'}`}>{user.name}, {user.age}</h2>
          <div className={`flex items-center space-x-1 mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-white/80'}`}>
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{user.location}</span>
          </div>
        </div>

        {/* Bio */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/10 backdrop-blur-md'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>About</h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-white/90'}`}>{user.bio}</p>
        </div>

        {/* Interests */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/10 backdrop-blur-md'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-white/20 text-white'}`}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'}`}>
            <Heart className="w-5 h-5 inline mr-2" />
            Send Like
          </button>
          <button className={`flex-1 py-3 rounded-full font-semibold border-2 ${theme === 'dark' ? 'border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white' : 'border-white text-white hover:bg-white hover:text-purple-600'}`}>
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
