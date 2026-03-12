import { create } from 'zustand';
import { Match, Message, User } from '../types';

interface MatchState {
  matches: Match[];
  selectedMatch: Match | null;
  messages: Record<string, Message[]>; // matchId -> messages
  isLoading: boolean;
  userLikes: Record<string, Set<string>>; // Simulating a backend table of likes

  // Actions
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  createMatch: (user1: User, user2: User) => Match;
  selectMatch: (match: Match | null) => void;
  addMessage: (matchId: string, message: Message) => void;
  setMessages: (matchId: string, messages: Message[]) => void;
  markAsRead: (matchId: string, messageId: string) => void;
  unmatch: (matchId: string) => void;
  checkMatch: (currentUser: User, swipedUser: User) => boolean;
  editMessage: (matchId: string, messageId: string, newContent: string) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  selectedMatch: null,
  messages: {},
  isLoading: false,
  userLikes: {
    // Simulate that some users have liked the current user
    'user-2': new Set(['current-user']),
    'user-4': new Set(['current-user']),
    'user-5': new Set(['current-user']),
  },

  setMatches: (matches) => {
    set({ matches });
  },

  addMatch: (match) => {
    set((state) => {
      if (state.matches.some(m => m.id === match.id)) return {};
      return { matches: [match, ...state.matches] };
    });
  },

  editMessage: (matchId, messageId, newContent) => {
    set(state => ({
      messages: {
        ...state.messages,
        [matchId]: state.messages[matchId]?.map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg
        ) || [],
      },
    }));
  },

  unmatch: (matchId) => {
    set((state) => ({
      matches: state.matches.filter((match) => match.id !== matchId),
      selectedMatch: state.selectedMatch?.id === matchId ? null : state.selectedMatch,
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

  checkMatch: (currentUser, swipedUser) => {
    const { userLikes } = get();
    const doesSwipedUserLikeCurrentUser = userLikes[swipedUser.id]?.has(currentUser.id);
    if (doesSwipedUserLikeCurrentUser) {
      get().createMatch(currentUser, swipedUser);
      return true;
    }
    return false;
  },

  selectMatch: (match) => {
    set({ selectedMatch: match });
  },

  addMessage: (matchId, message) => {
    set(state => ({
      matches: state.matches.map(match =>
        match.id === matchId
          ? { ...match, lastMessage: message, timestamp: new Date() }
          : match
      ),
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    }));
  },

  deleteMessage: (matchId, messageId) => {
    set(state => ({
      messages: {
        ...state.messages,
        [matchId]: (state.messages[matchId] || []).filter(
          m => m.id !== messageId
        ),
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