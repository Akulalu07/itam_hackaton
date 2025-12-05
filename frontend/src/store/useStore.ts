import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Hackathon, Team, Invite, SwipeAction } from '../types';
import { 
  mockUsers, 
  mockHackathons, 
  mockTeams, 
  mockInvites, 
  mockCurrentUser,
  mockAdminUser,
  getTitleByPoints 
} from '../data/mockData';

// ============================================
// AUTH STORE
// ============================================
interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  
  // Actions
  loginWithTelegram: (telegramData?: { id: string; name: string }) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  setCurrentHackathon: (hackathonId: string) => void;
  becomeCapatin: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      loginWithTelegram: async (telegramData) => {
        set({ isLoading: true });
        // Mock delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user: User = {
          ...mockCurrentUser,
          id: telegramData?.id || mockCurrentUser.id,
          name: telegramData?.name || mockCurrentUser.name,
          telegramId: telegramData?.id || mockCurrentUser.telegramId,
        };
        
        set({
          isAuthenticated: true,
          user,
          token: 'mock-jwt-token-' + Date.now(),
          isLoading: false,
        });
      },

      loginAsAdmin: async (email, password) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock admin auth
        if (email === 'admin@itam.courses' && password === 'admin123') {
          set({
            isAuthenticated: true,
            user: mockAdminUser,
            token: 'mock-admin-jwt-token-' + Date.now(),
            isLoading: false,
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      updateProfile: (data) => {
        const { user } = get();
        if (user) {
          const updatedUser = { 
            ...user, 
            ...data,
            title: getTitleByPoints(data.pts || user.pts),
            updatedAt: new Date() 
          };
          set({ user: updatedUser });
        }
      },

      setCurrentHackathon: (hackathonId) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, currentHackathonId: hackathonId } });
        }
      },

      becomeCapatin: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, role: 'captain' } });
        }
      },
    }),
    {
      name: 'itam-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// HACKATHON STORE
// ============================================
interface HackathonStore {
  hackathons: Hackathon[];
  selectedHackathon: Hackathon | null;
  isLoading: boolean;
  
  // Actions
  fetchHackathons: () => Promise<void>;
  selectHackathon: (id: string) => void;
  createHackathon: (data: Omit<Hackathon, 'id' | 'createdAt' | 'participantsCount' | 'teamsCount'>) => void;
  updateHackathon: (id: string, data: Partial<Hackathon>) => void;
  deleteHackathon: (id: string) => void;
}

export const useHackathonStore = create<HackathonStore>((set, get) => ({
  hackathons: [],
  selectedHackathon: null,
  isLoading: false,

  fetchHackathons: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ hackathons: mockHackathons, isLoading: false });
  },

  selectHackathon: (id) => {
    const hackathon = get().hackathons.find(h => h.id === id) || null;
    set({ selectedHackathon: hackathon });
  },

  createHackathon: (data) => {
    const newHackathon: Hackathon = {
      ...data,
      id: 'hack-' + Date.now(),
      participantsCount: 0,
      teamsCount: 0,
      createdAt: new Date(),
    };
    set(state => ({ hackathons: [...state.hackathons, newHackathon] }));
  },

  updateHackathon: (id, data) => {
    set(state => ({
      hackathons: state.hackathons.map(h => 
        h.id === id ? { ...h, ...data } : h
      ),
    }));
  },

  deleteHackathon: (id) => {
    set(state => ({
      hackathons: state.hackathons.filter(h => h.id !== id),
    }));
  },
}));

// ============================================
// SWIPE STORE
// ============================================
interface SwipeStore {
  deck: User[];
  swipedUsers: SwipeAction[];
  isLoading: boolean;
  
  // Actions
  fetchDeck: (hackathonId: string) => Promise<void>;
  swipe: (userId: string, direction: 'left' | 'right') => void;
  undoLastSwipe: () => void;
  resetDeck: () => void;
}

export const useSwipeStore = create<SwipeStore>((set, get) => ({
  deck: [],
  swipedUsers: [],
  isLoading: false,

  fetchDeck: async (hackathonId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    // Filter out users already in teams for this hackathon
    console.log('Fetching deck for hackathon:', hackathonId);
    const availableUsers = mockUsers.filter(u => u.status === 'looking');
    set({ deck: availableUsers, isLoading: false });
  },

  swipe: (userId, direction) => {
    const { deck, swipedUsers } = get();
    const swipeAction: SwipeAction = {
      id: 'swipe-' + Date.now(),
      swiperId: 'current-user',
      targetUserId: userId,
      direction,
      createdAt: new Date(),
    };
    
    set({
      deck: deck.filter(u => u.id !== userId),
      swipedUsers: [...swipedUsers, swipeAction],
    });

    // If swiped right, create an invite (mock)
    if (direction === 'right') {
      const targetUser = deck.find(u => u.id === userId);
      if (targetUser) {
        console.log(`Invite sent to ${targetUser.name}`);
      }
    }
  },

  undoLastSwipe: () => {
    const { swipedUsers } = get();
    if (swipedUsers.length === 0) return;
    
    const lastSwipe = swipedUsers[swipedUsers.length - 1];
    const restoredUser = mockUsers.find(u => u.id === lastSwipe.targetUserId);
    
    if (restoredUser) {
      set(state => ({
        deck: [restoredUser, ...state.deck],
        swipedUsers: state.swipedUsers.slice(0, -1),
      }));
    }
  },

  resetDeck: () => {
    set({ deck: [], swipedUsers: [] });
  },
}));

// ============================================
// TEAM STORE
// ============================================
interface TeamStore {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  
  // Actions
  fetchTeams: (hackathonId?: string) => Promise<void>;
  createTeam: (name: string, hackathonId: string, captainId: string) => Team;
  joinTeam: (teamId: string, userId: string) => void;
  leaveTeam: (teamId: string, userId: string) => void;
  kickMember: (teamId: string, userId: string) => void;
  setCurrentTeam: (team: Team | null) => void;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  currentTeam: null,
  isLoading: false,

  fetchTeams: async (hackathonId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const teams = hackathonId 
      ? mockTeams.filter(t => t.hackathonId === hackathonId)
      : mockTeams;
    set({ teams, isLoading: false });
  },

  createTeam: (name, hackathonId, captainId) => {
    const captain = mockUsers.find(u => u.id === captainId) || mockCurrentUser;
    const newTeam: Team = {
      id: 'team-' + Date.now(),
      name,
      hackathonId,
      captainId,
      members: [{
        userId: captainId,
        user: captain,
        role: 'captain',
        joinedAt: new Date(),
      }],
      maxSize: 5,
      createdAt: new Date(),
    };
    
    set(state => ({ 
      teams: [...state.teams, newTeam],
      currentTeam: newTeam,
    }));
    
    return newTeam;
  },

  joinTeam: (teamId, userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;
    
    set(state => ({
      teams: state.teams.map(t => {
        if (t.id === teamId && t.members.length < t.maxSize) {
          return {
            ...t,
            members: [...t.members, { userId, user, role: 'member', joinedAt: new Date() }],
          };
        }
        return t;
      }),
    }));
  },

  leaveTeam: (teamId, userId) => {
    set(state => ({
      teams: state.teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            members: t.members.filter(m => m.userId !== userId),
          };
        }
        return t;
      }),
    }));
  },

  kickMember: (teamId, userId) => {
    get().leaveTeam(teamId, userId);
  },

  setCurrentTeam: (team) => {
    set({ currentTeam: team });
  },
}));

// ============================================
// INVITE STORE
// ============================================
interface InviteStore {
  invites: Invite[];
  sentInvites: Invite[];
  isLoading: boolean;
  
  // Actions
  fetchInvites: (userId: string) => Promise<void>;
  sendInvite: (teamId: string, toUserId: string, message?: string) => void;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
}

export const useInviteStore = create<InviteStore>((set) => ({
  invites: [],
  sentInvites: [],
  isLoading: false,

  fetchInvites: async (userId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const userInvites = mockInvites.filter(i => i.toUserId === userId && i.status === 'pending');
    const sent = mockInvites.filter(i => i.fromUserId === userId);
    set({ invites: userInvites, sentInvites: sent, isLoading: false });
  },

  sendInvite: (teamId, toUserId, message) => {
    const team = mockTeams.find(t => t.id === teamId);
    const toUser = mockUsers.find(u => u.id === toUserId);
    if (!team || !toUser) return;

    const newInvite: Invite = {
      id: 'invite-' + Date.now(),
      teamId,
      team,
      fromUserId: 'current-user',
      fromUser: mockCurrentUser,
      toUserId,
      toUser,
      status: 'pending',
      message,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    set(state => ({ sentInvites: [...state.sentInvites, newInvite] }));
  },

  acceptInvite: (inviteId) => {
    set(state => ({
      invites: state.invites.map(i => 
        i.id === inviteId ? { ...i, status: 'accepted' } : i
      ),
    }));
  },

  declineInvite: (inviteId) => {
    set(state => ({
      invites: state.invites.map(i => 
        i.id === inviteId ? { ...i, status: 'declined' } : i
      ),
    }));
  },
}));

// ============================================
// UI STORE
// ============================================
interface UIStore {
  theme: 'itamhack' | 'itamlight';
  isMobileMenuOpen: boolean;
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  
  // Actions
  toggleTheme: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'itamhack',
      isMobileMenuOpen: false,
      isModalOpen: false,
      modalContent: null,

      toggleTheme: () => {
        set(state => ({
          theme: state.theme === 'itamhack' ? 'itamlight' : 'itamhack',
        }));
      },

      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      
      openModal: (content) => set({ isModalOpen: true, modalContent: content }),
      
      closeModal: () => set({ isModalOpen: false, modalContent: null }),
    }),
    {
      name: 'itam-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
