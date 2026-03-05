import React from 'react';
import { mockUsers } from '../../data/mockData';
import { MapPin, MessageSquare } from 'lucide-react';

const DiscoverGrid: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Discover</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {mockUsers.map((user) => (
          <div key={user.id} className="relative rounded-2xl overflow-hidden aspect-[3/4]">
            <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
              <h3 className="text-white font-bold text-lg">{user.name}, {user.age}</h3>
              <div className="flex items-center text-white/80 text-sm mt-1">
                <MapPin size={14} className="mr-1" />
                <span>{user.location.city}</span>
              </div>
            </div>
            <button className="absolute top-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white">
              <MessageSquare size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverGrid;