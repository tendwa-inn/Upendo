import React from 'react';
import { mockUsers } from '../../data/mockData';
import { Plus } from 'lucide-react';

const Stories: React.FC = () => {
  const stories = mockUsers.slice(0, 5); // Get first 5 users for stories

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Stories</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {/* Add Story button */}
        <div className="flex-shrink-0 w-20 h-28 flex flex-col items-center justify-center bg-white/10 rounded-2xl">
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white mb-2">
            <Plus size={24} />
          </button>
          <p className="text-xs text-white font-medium">Add Story</p>
        </div>

        {/* Stories */}
        {stories.map((user) => (
          <div key={user.id} className="flex-shrink-0 w-20 h-28 rounded-2xl overflow-hidden relative">
            <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <p className="absolute bottom-2 left-2 text-xs text-white font-bold">{user.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;