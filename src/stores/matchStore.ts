import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Match, Message } from '../types';
import { useAuthStore } from './authStore';
import { encryptMessage } from '../lib/crypto';
import { normalizeMessage } from '../lib/messageUtils';

interface MatchState {
  matches: Match[];
  selectedMatch: Match | null;
  typingUsers: Record<string, string[]>; // matchId -> array of userIds who are typing
  fetchMatches: () => Promise<void>;
  selectMatch: (match: Match | null) => void;
  addMessage: (matchId: string, message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
  initializeRealtime: () => () => void; // Returns an unsubscribe function
  createMatch: (matchedUserId: string) => Promise<void>;
  setTyping: (matchId: string, userId: string, isTyping: boolean) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  selectedMatch: null,
  typingUsers: {},

  fetchMatches: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('matches')
      .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages(*)')
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    const matchesWithNormalizedMessages = data.map(match => {
      const messages = match.messages || [];
      const normalizedMessages = messages.map(normalizeMessage).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return { ...match, messages: normalizedMessages, lastMessage: normalizedMessages[normalizedMessages.length - 1] };
    });
    
    const sortedMatches = matchesWithNormalizedMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    set({ matches: sortedMatches });
  },

  addMessage: async (matchId, message) => {
    const encryptedContent = message.type === "text" ? encryptMessage(message.content) : message.content;

    const { data, error } = await supabase
      .from("messages")
      .insert({ content: encryptedContent, type: message.type, sender_id: message.senderId, match_id: matchId })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    // The realtime listener will handle adding the message to the state, but we can also add it here for immediate feedback
    const cleanMessage = normalizeMessage(data);
    set((state) => {
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return state;

      const existingMessages = state.matches[matchIndex].messages || [];
      const exists = existingMessages.some((m) => m.id === cleanMessage.id);
      if (exists) return state;

      const updatedMatch = {
        ...state.matches[matchIndex],
        messages: [...existingMessages, cleanMessage],
        lastMessage: cleanMessage,
      };

      const newMatches = [...state.matches];
      newMatches[matchIndex] = updatedMatch;

      const sortedMatches = newMatches.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      });

      return {
        matches: sortedMatches,
        selectedMatch: state.selectedMatch?.id === matchId ? updatedMatch : state.selectedMatch,
      };
    });
  },
  
  selectMatch: (match) => {
    set({ selectedMatch: match });
    if (match) {
        // Mark messages as read
    }
  },

  unmatch: async (matchId) => {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) {
      console.error('Error unmatching:', error);
      return;
    }
    set((state) => ({
      matches: state.matches.filter((match) => match.id !== matchId),
      selectedMatch: state.selectedMatch?.id === matchId ? null : state.selectedMatch,
    }));
  },

  initializeRealtime: () => {
    const channel = supabase.channel('messages-channel');
    
    // Handle message inserts
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = normalizeMessage(payload.new);
        const state = get();
        
        const matchIndex = state.matches.findIndex(m => m.id === newMessage.match_id);

        if (matchIndex === -1) {
          get().fetchMatches();
          return;
        }

        const match = state.matches[matchIndex];
        const existingMessages = match.messages || [];
        const exists = existingMessages.some(m => m.id === newMessage.id);
        if (exists) return; // Prevent duplicate insert

        const updatedMatch = {
            ...match,
            messages: [...existingMessages, newMessage],
            lastMessage: newMessage,
        };

        const newMatches = [...state.matches];
        newMatches[matchIndex] = updatedMatch;
        
        const sortedMatches = newMatches.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
        });

        set({ 
            matches: sortedMatches,
            selectedMatch: state.selectedMatch?.id === newMessage.match_id ? updatedMatch : state.selectedMatch
        });
    });

    // Handle typing events through broadcast
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const { matchId, userId, isTyping: typingStatus } = payload.payload;
      get().setTyping(matchId, userId, typingStatus);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  createMatch: async (matchedUserId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return null;

    const { data, error } = await supabase.from('matches').insert({ user1_id: currentUser.id, user2_id: matchedUserId }).select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages(*)').single();
    if (error) {
      console.error('Error creating match:', error);
      return null;
    }

    // Send notification to the other user
    const { data: matchedUserProfile } = await supabase.from('profiles').select('name').eq('id', currentUser.id).single();
    await supabase.from('notifications').insert({
      user_id: matchedUserId,
      title: 'New Match!',
      message: `You matched with ${matchedUserProfile?.name || 'someone'}`,
      type: 'match',
    });

    get().fetchMatches();
    return data;
  },

  setTyping: (matchId: string, userId: string, isTyping: boolean) => {
    set((state) => {
      const currentTypingUsers = state.typingUsers[matchId] || [];
      let newTypingUsers: string[];
      
      if (isTyping) {
        // Add userId if not already typing
        if (!currentTypingUsers.includes(userId)) {
          newTypingUsers = [...currentTypingUsers, userId];
        } else {
          newTypingUsers = currentTypingUsers;
        }
      } else {
        // Remove userId from typing users
        newTypingUsers = currentTypingUsers.filter(id => id !== userId);
      }
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [matchId]: newTypingUsers
        }
      };
    });
  },
}));
