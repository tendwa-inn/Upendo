import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../stores/authStore';
import { User } from '../../types';
import { MapPin, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiscoverGrid: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser, profile, messageRequestsSent, messageRequestResetDate, incrementMessageRequests } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase.rpc('get_discover_users', { current_user_id: currentUser.id, count: 15 });

      if (error) {
        console.error('Error fetching discover users:', error);
        return;
      }
      setUsers(data as User[]);
    };

    fetchUsers();
  }, [currentUser]);

  const canSendMessageRequest = () => {
    if (!profile) return false;
    if (profile.subscription === 'pro' || profile.subscription === 'vip') return true;

    const now = new Date();
    if (messageRequestResetDate && now < messageRequestResetDate) {
      return messageRequestsSent < 5;
    } else {
      // Reset the count if the reset date has passed
      // This should ideally be handled by a backend job, but we can do it here for now
      return true;
    }
  };

  const getCity = (location: any) => {
    if (!location) return "Unknown";
    if (typeof location === "string") return location;
    return location.city || location.name || "Unknown";
  };

  const formatDistance = (distanceInMeters: number | null) => {
    if (distanceInMeters === null || typeof distanceInMeters === 'undefined') {
      return null;
    }
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m away`;
    }
    const distanceInKm = distanceInMeters / 1000;
    return `${distanceInKm.toFixed(1)}km away`;
  };

  const handleSendMessageRequest = (userId: string) => {
    if (!canSendMessageRequest()) {
      alert('You have reached your message request limit for today.');
      return;
    }
    console.log(`Sending message request to ${userId}`);
    incrementMessageRequests();
    // TODO: Implement actual message request logic
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Discover</h2>
      <div className="grid grid-cols-5 gap-4">
        {users.map((user) => (
          <Link to={`/user/${user.id}`} key={user.id} className="relative flex flex-col items-center space-y-2">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-sm">{user.name}, {user.age}</h3>
              <div className="flex items-center justify-center text-white/80 text-xs mt-1">
                <span>{formatDistance(user.distance)}</span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessageRequest(user.id);
              }}
              className="absolute top-0 right-0 w-8 h-8 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white">
              <MessageSquare size={16} />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiscoverGrid;