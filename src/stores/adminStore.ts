import { create } from 'zustand';
import { AdminUser, UserReport, SystemMessage, KeywordFilter, EscalationTicket, ModerationAction } from '../types/admin';
import { User } from '../types';
import { useMatchStore } from './matchStore'; // Import match store
import { useDiscoverStore } from './discoverStore'; // Import discover store
import { mockUsers } from '../data/mockData'; // Import mockUsers

interface AdminState {
  // Admin authentication
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  
  // User management
  allUsers: User[];
  filteredUsers: User[];
  userFilter: {
    subscription: 'all' | 'free' | 'pro' | 'vip';
    status: 'all' | 'active' | 'suspended' | 'blocked';
    search: string;
  };
  
  // Reports and moderation
  reports: UserReport[];
  moderationActions: ModerationAction[];
  escalationTickets: EscalationTicket[];
  
  // System messages
  systemMessages: SystemMessage[];
  
  // Keyword filtering
  keywordFilters: KeywordFilter[];
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // User management
  fetchAllUsers: () => Promise<void>;
  filterUsers: () => void;
  setUserFilter: (filter: Partial<AdminState['userFilter']>) => void;
  deleteUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, duration: number, reason: string) => Promise<void>;
  blockUser: (userId: string, reason: string) => Promise<void>;
  
  // Reports
  fetchReports: () => Promise<void>;
  assignReport: (reportId: string, adminId: string) => Promise<void>;
  resolveReport: (reportId: string, action: ModerationAction) => Promise<void>;
  
  // Escalation
  escalateToAdmin: (reportId: string, reason: string) => Promise<void>;
  resolveEscalation: (escalationId: string, resolution: string) => Promise<void>;
  
  // System messages
  createSystemMessage: (message: Omit<SystemMessage, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateSystemMessage: (messageId: string, updates: Partial<SystemMessage>) => Promise<void>;
  deleteSystemMessage: (messageId: string) => Promise<void>;
  
  // Keyword filtering
  addKeywordFilter: (keyword: string, category: string, severity: string, autoAction: string) => Promise<void>;
  updateKeywordFilter: (filterId: string, updates: Partial<KeywordFilter>) => Promise<void>;
  deleteKeywordFilter: (filterId: string) => Promise<void>;
}

// Mock admin users
const mockAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@upendo.com',
    name: 'Super Admin',
    role: 'admin',
    permissions: ['all'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: 'mod-1',
    email: 'mod@upendo.com',
    name: 'Moderator',
    role: 'moderator',
    permissions: ['reports', 'users', 'content_moderation'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
  },
];

// Mock data
const mockReports: UserReport[] = [
  {
    id: 'report-1',
    reportedUserId: '1',
    reportedBy: '2',
    reason: 'inappropriate_behavior',
    description: 'User sent inappropriate messages',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'report-2',
    reportedUserId: '2',
    reportedBy: '1',
    reason: 'fake_profile',
    description: 'Profile seems fake',
    status: 'under_review',
    priority: 'low',
    assignedTo: 'mod-1',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

const mockKeywordFilters: KeywordFilter[] = [
  {
    id: 'filter-1',
    keyword: 'spam',
    category: 'spam',
    severity: 'medium',
    autoAction: 'flag',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date(),
    matchCount: 5,
  },
  {
    id: 'filter-2',
    keyword: 'inappropriate',
    category: 'harassment',
    severity: 'high',
    autoAction: 'review',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date(),
    matchCount: 2,
  },
];

export const useAdminStore = create<AdminState>()((set, get) => ({
  currentAdmin: null,
  isAuthenticated: false,
  allUsers: [],
  filteredUsers: [],
  userFilter: {
    subscription: 'all',
    status: 'all',
    search: '',
  },
  reports: mockReports,
  moderationActions: [],
  escalationTickets: [],
  systemMessages: [],
  keywordFilters: mockKeywordFilters,

  login: async (email: string, password: string) => {
    // Mock authentication
    const admin = mockAdmins.find(a => a.email === email && password === 'admin123');
    if (admin) {
      set({ currentAdmin: admin, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentAdmin: null, isAuthenticated: false });
  },

  fetchAllUsers: async () => {
    // Mock fetch - in real app this would be an API call
    const { mockUsers } = await import('../data/mockData');
    set({ allUsers: mockUsers });
    get().filterUsers();
  },

  setUserFilter: (filter) => {
    set(state => ({
      userFilter: { ...state.userFilter, ...filter }
    }));
    get().filterUsers();
  },

  filterUsers: () => {
    const { allUsers, userFilter } = get();
    let filtered = allUsers;

    if (userFilter.subscription !== 'all') {
      filtered = filtered.filter(user => user.subscription === userFilter.subscription);
    }

    if (userFilter.search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(userFilter.search.toLowerCase())
      );
    }

    set({ filteredUsers: filtered });
  },

  deleteUser: async (userId: string) => {
    // Mock delete - in real app this would be an API call
    set(state => ({
      allUsers: state.allUsers.filter(user => user.id !== userId),
    }));
    get().filterUsers();
  },

  suspendUser: async (userId: string, duration: number, reason: string) => {
    // Mock suspend - in real app this would be an API call
    const action: ModerationAction = {
      id: `action-${Date.now()}`,
      reportId: '',
      action: 'suspension',
      duration,
      reason,
      performedBy: get().currentAdmin?.id || '',
      performedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      isActive: true,
    };
    
    set(state => ({
      moderationActions: [...state.moderationActions, action],
    }));
  },

  blockUser: async (userId: string, reason: string) => {
    // Mock block - in real app this would be an API call
    const action: ModerationAction = {
      id: `action-${Date.now()}`,
      reportId: '',
      action: 'permanent_ban',
      reason,
      performedBy: get().currentAdmin?.id || '',
      performedAt: new Date(),
      isActive: true,
    };
    
    set(state => ({
      moderationActions: [...state.moderationActions, action],
    }));
  },

  fetchReports: async () => {
    // Mock fetch - reports are already in state
    console.log('Fetching reports...');
  },

  assignReport: async (reportId: string, adminId: string) => {
    set(state => ({
      reports: state.reports.map(report => 
        report.id === reportId ? { ...report, assignedTo: adminId } : report
      ),
    }));
  },

  resolveReport: async (reportId: string, action: ModerationAction) => {
    set(state => ({
      reports: state.reports.map(report => 
        report.id === reportId ? { ...report, status: 'resolved', resolvedAt: new Date() } : report
      ),
      moderationActions: [...state.moderationActions, action],
    }));
  },

  escalateToAdmin: async (reportId: string, reason: string) => {
    const escalation: EscalationTicket = {
      id: `escalation-${Date.now()}`,
      originalReportId: reportId,
      escalatedBy: get().currentAdmin?.id || '',
      escalatedTo: 'admin-1', // Default to super admin
      reason,
      status: 'pending',
      priority: 'high',
      createdAt: new Date(),
    };
    
    set(state => ({
      escalationTickets: [...state.escalationTickets, escalation],
    }));
  },

  resolveEscalation: async (escalationId: string, resolution: string) => {
    set(state => ({
      escalationTickets: state.escalationTickets.map(ticket => 
        ticket.id === escalationId ? { 
          ...ticket, 
          status: 'resolved', 
          resolution,
          resolvedAt: new Date() 
        } : ticket
      ),
    }));
  },

  createSystemMessage: async (message) => {
    const newMessage: SystemMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date(),
      createdBy: get().currentAdmin?.id || '',
      sentCount: 0,
    };
    
    set(state => ({
      systemMessages: [...state.systemMessages, newMessage],
    }));

    // Send message from Upendo assistant
    const upendoAssistant = mockUsers.find(u => u.id === 'upendo-assistant');
    if (!upendoAssistant) return;

    const { createMatch, addMessage } = useMatchStore.getState();
    const { addStory } = useDiscoverStore.getState();

    const targetUsers = 
      message.targetAudience === 'all' ? mockUsers.filter(u => u.id !== 'upendo-assistant') :
      message.targetAudience === 'specific_users' ? mockUsers.filter(u => message.targetUsers?.includes(u.id)) :
      mockUsers.filter(u => u.subscription === message.targetAudience && u.id !== 'upendo-assistant');

    if (message.deliveryMethod === 'story' || message.deliveryMethod === 'both') {
      addStory({
        user: upendoAssistant,
        type: 'text',
        content: newMessage.content,
        duration: 5000,
        createdAt: new Date(),
        viewedBy: [],
      });
    }

    for (const user of targetUsers) {
      if (message.deliveryMethod === 'inbox' || message.deliveryMethod === 'both') {
        const match = useMatchStore.getState().matches.find(m => m.user1.id === user.id && m.user2.id === upendoAssistant.id) || useMatchStore.getState().matches.find(m => m.user1.id === upendoAssistant.id && m.user2.id === user.id);
        
        let matchId: string;
        if (match) {
          matchId = match.id;
        } else {
          const newMatch = createMatch(user, upendoAssistant);
          matchId = newMatch.id;
        }

        addMessage(matchId, {
          id: `sys-msg-${Date.now()}`,
          matchId: matchId,
          senderId: upendoAssistant.id,
          content: newMessage.content,
          timestamp: new Date(),
          isRead: false,
          type: 'text',
        });
      }
    }
  },

  submitReport: (reporterId: string, reportedUserId: string, reason: string, details: string) => {
    const newReport: UserReport = {
      id: `report-${Date.now()}`,
      reportedUserId,
      reportedBy: reporterId,
      reason,
      description: details,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(),
    };
    set(state => ({
      reports: [newReport, ...state.reports],
    }));
  },

  updateSystemMessage: async (messageId: string, updates) => {
    set(state => ({
      systemMessages: state.systemMessages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },

  deleteSystemMessage: async (messageId: string) => {
    set(state => ({
      systemMessages: state.systemMessages.filter(msg => msg.id !== messageId),
    }));
  },

  addKeywordFilter: async (keyword, category, severity, autoAction) => {
    const newFilter: KeywordFilter = {
      id: `filter-${Date.now()}`,
      keyword,
      category: category as any,
      severity: severity as any,
      autoAction: autoAction as any,
      isActive: true,
      createdBy: get().currentAdmin?.id || '',
      createdAt: new Date(),
      matchCount: 0,
    };
    
    set(state => ({
      keywordFilters: [...state.keywordFilters, newFilter],
    }));
  },

  updateKeywordFilter: async (filterId: string, updates) => {
    set(state => ({
      keywordFilters: state.keywordFilters.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      ),
    }));
  },

  deleteKeywordFilter: async (filterId: string) => {
    set(state => ({
      keywordFilters: state.keywordFilters.filter(filter => filter.id !== filterId),
    }));
  },
}));