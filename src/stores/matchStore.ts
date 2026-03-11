import { create } from 'zustand';
import { Match, Message, User } from '../types';

interface MatchState {
  matches: Match[];
  selectedMatch: Match | null;
  messages: Record<string, Message[]>; // matchId -> messages
  isLoading: boolean;
  
  // Actions
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  createMatch: (user1: User, user2: User) => Match;
  selectMatch: (match: Match | null) => void;
  addMessage: (matchId: string, message: Message) => void;
  setMessages: (matchId: string, messages: Message[]) => void;
  markAsRead: (matchId: string, messageId: string) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  selectedMatch: null,
  messages: {},
  isLoading: false,

  setMatches: (matches) => {
    set({ matches });
  },

  addMatch: (match) => {
    set((state) => ({
      matches: [match, ...state.matches],
    }));
  },

  createMatch: (user1, user2) => {
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      user1,
      user2,
      timestamp: new Date(),
      lastMessage: null,
    };
    get().addMatch(newMatch);
    return newMatch;
  },

  selectMatch: (match) => {
    set({ selectedMatch: match });
  },

  addMessage: (matchId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    }));
  },

  setMessages: (matchId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: messages,
      },
    }));
  },

  markAsRead: (matchId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: state.messages[matchId]?.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ) || [],
      },
    }));
  },
}));