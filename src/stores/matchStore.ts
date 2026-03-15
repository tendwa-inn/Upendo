import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Match, User, Message } from '../types';
import { useAuthStore } from './authStore';

interface MatchState {
  matches: Match[];
  selectedMatch: Match | null;
  fetchMatches: () => Promise<void>;
  createMatch: (user2Id: string) => Promise<Match | null>;
  selectMatch: (match: Match | null) => void;
  addMessage: (matchId: string, content: string, type: 'text' | 'image' | 'gif') => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  selectedMatch: null,

  fetchMatches: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('matches')
      .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages:messages(*)')
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }
    set({ matches: data });
  },

  createMatch: async (user2Id) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return null;

    const { data, error } = await supabase
      .from('matches')
      .insert({ user1_id: currentUser.id, user2_id: user2Id })
      .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages:messages(*)')
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return null;
    }
    if (data) {
      set((state) => ({ matches: [data, ...state.matches] }));
      return data;
    }
    return null;
  },

  selectMatch: (match) => {
    set({ selectedMatch: match });
  },

  addMessage: async (matchId, content, type) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({ match_id: matchId, sender_id: currentUser.id, content, type })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return;
    }
    if (data) {
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === matchId
            ? { ...match, messages: [...match.messages, data], lastMessage: data }
            : match
        ),
        selectedMatch: state.selectedMatch?.id === matchId
          ? { ...state.selectedMatch, messages: [...state.selectedMatch.messages, data], lastMessage: data }
          : state.selectedMatch,
      }));
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
}));