import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Hackathon, Team, Invite, SwipeAction, GamificationTitle } from '../types';
import { userService, hackathonService, teamService, inviteService, swipeService } from '../api/services';
import { tokenUtils } from '../api/axiosClient';

// Вспомогательная функция для определения титула по очкам
const getTitleByPoints = (pts: number): GamificationTitle => {
  if (pts >= 1000) return 'Легенда';
  if (pts >= 500) return 'Профи';
  if (pts >= 200) return 'Активист';
  if (pts >= 50) return 'Участник';
  return 'Новичок';
};

// ============================================
// AUTH STORE
// ============================================
interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loginWithTelegram: (telegramData?: { id: string; name: string }) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  setCurrentHackathon: (hackathonId: string) => void;
  becomeCaptain: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      loginWithTelegram: async (_telegramData) => {
        set({ isLoading: true, error: null });
        try {
          // Токен уже должен быть установлен через setToken после авторизации через бота
          // Здесь просто загружаем профиль
          const user = await userService.getProfile();
          set({
            isAuthenticated: true,
            user,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Ошибка авторизации' 
          });
        }
      },

      loginAsAdmin: async (email, password) => {
        set({ isLoading: true, error: null });
        // TODO: Реализовать admin login через API
        // Пока используем простую проверку для разработки
        if (email === 'admin@itam.courses' && password === 'admin123') {
          const adminUser: User = {
            id: 'admin-1',
            name: 'Admin User',
            role: 'admin',
            status: 'inactive',
            skills: [],
            experience: '',
            mmr: 0,
            pts: 0,
            title: 'Новичок',
            nftStickers: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set({
            isAuthenticated: true,
            user: adminUser,
            token: 'admin-dev-token',
            isLoading: false,
          });
          return true;
        }
        set({ isLoading: false, error: 'Неверный email или пароль' });
        return false;
      },

      logout: () => {
        tokenUtils.removeToken();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
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

      becomeCaptain: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, role: 'captain' } });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        tokenUtils.setToken(token);
        set({ token, isAuthenticated: true });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        
        set({ isLoading: true, error: null });
        try {
          const user = await userService.getProfile();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Fetch profile error:', error);
          // Если токен невалидный - логаут
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'itam-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
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
  error: string | null;
  
  // Actions
  fetchHackathons: () => Promise<void>;
  selectHackathon: (id: string) => void;
  createHackathon: (data: Omit<Hackathon, 'id' | 'createdAt' | 'participantsCount' | 'teamsCount'>) => Promise<void>;
  updateHackathon: (id: string, data: Partial<Hackathon>) => Promise<void>;
  deleteHackathon: (id: string) => Promise<void>;
}

export const useHackathonStore = create<HackathonStore>((set, get) => ({
  hackathons: [],
  selectedHackathon: null,
  isLoading: false,
  error: null,

  fetchHackathons: async () => {
    set({ isLoading: true, error: null });
    try {
      const hackathons = await hackathonService.getAll();
      set({ hackathons, isLoading: false });
    } catch (error) {
      console.error('Fetch hackathons error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки хакатонов'
      });
    }
  },

  selectHackathon: (id) => {
    const hackathon = get().hackathons.find(h => h.id === id) || null;
    set({ selectedHackathon: hackathon });
  },

  createHackathon: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newHackathon = await hackathonService.create({
        name: data.name,
        description: data.description,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        registrationDeadline: data.registrationDeadline.toISOString(),
        maxTeamSize: data.maxTeamSize,
        minTeamSize: data.minTeamSize,
        imageUrl: data.imageUrl,
      });
      set(state => ({ 
        hackathons: [...state.hackathons, newHackathon],
        isLoading: false 
      }));
    } catch (error) {
      console.error('Create hackathon error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания хакатона'
      });
    }
  },

  updateHackathon: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hackathonService.update(id, {
        name: data.name,
        description: data.description,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        registrationDeadline: data.registrationDeadline?.toISOString(),
        maxTeamSize: data.maxTeamSize,
        minTeamSize: data.minTeamSize,
        imageUrl: data.imageUrl,
      });
      set(state => ({
        hackathons: state.hackathons.map(h => h.id === id ? updated : h),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Update hackathon error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления хакатона'
      });
    }
  },

  deleteHackathon: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await hackathonService.delete(id);
      set(state => ({
        hackathons: state.hackathons.filter(h => h.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Delete hackathon error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления хакатона'
      });
    }
  },
}));

// ============================================
// SWIPE STORE
// ============================================
interface SwipeStore {
  deck: User[];
  swipedUsers: SwipeAction[];
  lastSwipedUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDeck: (hackathonId?: string) => Promise<void>;
  swipe: (userId: string, direction: 'left' | 'right') => Promise<void>;
  undoLastSwipe: () => Promise<void>;
  resetDeck: () => void;
}

export const useSwipeStore = create<SwipeStore>((set, get) => ({
  deck: [],
  swipedUsers: [],
  lastSwipedUser: null,
  isLoading: false,
  error: null,

  fetchDeck: async (hackathonId) => {
    set({ isLoading: true, error: null });
    try {
      const users = await swipeService.getDeck(hackathonId);
      set({ deck: users, isLoading: false });
    } catch (error) {
      console.error('Fetch deck error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки рекомендаций'
      });
    }
  },

  swipe: async (userId, direction) => {
    const { deck } = get();
    const targetUser = deck.find(u => u.id === userId);
    
    // Оптимистичное обновление UI
    set(state => ({
      deck: state.deck.filter(u => u.id !== userId),
      lastSwipedUser: targetUser || null,
      swipedUsers: [...state.swipedUsers, {
        id: 'swipe-' + Date.now(),
        swiperId: 'current-user',
        targetUserId: userId,
        direction,
        createdAt: new Date(),
      }],
    }));

    try {
      const action = direction === 'right' ? 'like' : 'pass';
      const response = await swipeService.swipe(parseInt(userId, 10), action);
      
      if (response.match && targetUser) {
        console.log(`Match with ${targetUser.name}!`);
        // Можно добавить уведомление о match
      }
    } catch (error) {
      console.error('Swipe error:', error);
      // Откатываем изменение при ошибке
      if (targetUser) {
        set(state => ({
          deck: [targetUser, ...state.deck],
          swipedUsers: state.swipedUsers.slice(0, -1),
        }));
      }
    }
  },

  undoLastSwipe: async () => {
    const { lastSwipedUser, swipedUsers } = get();
    if (!lastSwipedUser || swipedUsers.length === 0) return;
    
    try {
      await swipeService.undoSwipe();
      set(state => ({
        deck: [lastSwipedUser, ...state.deck],
        swipedUsers: state.swipedUsers.slice(0, -1),
        lastSwipedUser: null,
      }));
    } catch (error) {
      console.error('Undo swipe error:', error);
    }
  },

  resetDeck: () => {
    set({ deck: [], swipedUsers: [], lastSwipedUser: null });
  },
}));

// ============================================
// TEAM STORE
// ============================================
interface TeamStore {
  teams: Team[];
  currentTeam: Team | null;
  teamMembers: User[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTeams: (hackathonId?: string) => Promise<void>;
  fetchMyTeam: () => Promise<void>;
  createTeam: (data: { name: string; hackathonId: string; description?: string }) => Promise<Team | null>;
  joinTeam: (teamId: string, code?: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  kickMember: (teamId: string, userId: string) => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  updateTeamStatus: (teamId: string, status: 'open' | 'closed') => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  currentTeam: null,
  teamMembers: [],
  isLoading: false,
  error: null,

  fetchTeams: async (hackathonId) => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamService.getAll(hackathonId);
      set({ teams, isLoading: false });
    } catch (error) {
      console.error('Fetch teams error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки команд'
      });
    }
  },

  fetchMyTeam: async () => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamService.getMyTeam();
      if (team) {
        const members = team.members?.map(m => m.user) || [];
        set({ currentTeam: team, teamMembers: members, isLoading: false });
      } else {
        set({ currentTeam: null, teamMembers: [], isLoading: false });
      }
    } catch (error) {
      console.error('Fetch my team error:', error);
      set({ currentTeam: null, teamMembers: [], isLoading: false });
    }
  },

  createTeam: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTeam = await teamService.create({
        name: data.name,
        hackathonId: data.hackathonId,
        description: data.description,
      });
      
      const members = newTeam.members?.map(m => m.user) || [];
      set(state => ({ 
        teams: [...state.teams, newTeam],
        currentTeam: newTeam,
        teamMembers: members,
        isLoading: false,
      }));
      
      return newTeam;
    } catch (error) {
      console.error('Create team error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания команды'
      });
      return null;
    }
  },

  joinTeam: async (teamId, code) => {
    set({ isLoading: true, error: null });
    try {
      let team: Team;
      if (code) {
        team = await teamService.joinByCode(code);
      } else {
        // Если нет кода, предполагаем что есть invite - используем teamId напрямую
        team = await teamService.getById(teamId);
      }
      
      const members = team.members?.map(m => m.user) || [];
      set(state => ({
        teams: state.teams.map(t => t.id === teamId ? team : t),
        currentTeam: team,
        teamMembers: members,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Join team error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка присоединения к команде'
      });
    }
  },

  leaveTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      await teamService.leave(teamId);
      set(state => ({
        teams: state.teams.filter(t => t.id !== teamId),
        currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
        teamMembers: state.currentTeam?.id === teamId ? [] : state.teamMembers,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Leave team error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка выхода из команды'
      });
    }
  },

  kickMember: async (teamId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await teamService.kickMember(teamId, userId);
      set(state => ({
        teamMembers: state.teamMembers.filter(m => m.id !== userId),
        currentTeam: state.currentTeam ? {
          ...state.currentTeam,
          members: state.currentTeam.members.filter(m => m.userId !== userId),
        } : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Kick member error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка исключения участника'
      });
    }
  },

  setCurrentTeam: (team) => {
    const members = team?.members?.map(m => m.user) || [];
    set({ currentTeam: team, teamMembers: members });
  },

  updateTeamStatus: async (teamId, status) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await teamService.updateStatus(teamId, status);
      set(state => ({
        teams: state.teams.map(t => t.id === teamId ? updated : t),
        currentTeam: state.currentTeam?.id === teamId ? updated : state.currentTeam,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Update team status error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления статуса команды'
      });
    }
  },
}));

// ============================================
// INVITE STORE
// ============================================
interface InviteStore {
  invites: Invite[];
  sentInvites: Invite[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchInvites: () => Promise<void>;
  sendInvite: (toUserId: string, teamId: string, message?: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
}

export const useInviteStore = create<InviteStore>((set) => ({
  invites: [],
  sentInvites: [],
  isLoading: false,
  error: null,

  fetchInvites: async () => {
    set({ isLoading: true, error: null });
    try {
      const [incoming, outgoing] = await Promise.all([
        inviteService.getIncoming(),
        inviteService.getOutgoing(),
      ]);
      set({ invites: incoming, sentInvites: outgoing, isLoading: false });
    } catch (error) {
      console.error('Fetch invites error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки приглашений'
      });
    }
  },

  sendInvite: async (toUserId, teamId, message) => {
    set({ isLoading: true, error: null });
    try {
      const newInvite = await inviteService.send(toUserId, teamId, message);
      set(state => ({ 
        sentInvites: [...state.sentInvites, newInvite],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Send invite error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка отправки приглашения'
      });
    }
  },

  acceptInvite: async (inviteId) => {
    set({ isLoading: true, error: null });
    try {
      await inviteService.accept(inviteId);
      set(state => ({
        invites: state.invites.filter(i => i.id !== inviteId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Accept invite error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка принятия приглашения'
      });
    }
  },

  declineInvite: async (inviteId) => {
    set({ isLoading: true, error: null });
    try {
      await inviteService.decline(inviteId);
      set(state => ({
        invites: state.invites.filter(i => i.id !== inviteId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Decline invite error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка отклонения приглашения'
      });
    }
  },

  cancelInvite: async (inviteId) => {
    set({ isLoading: true, error: null });
    try {
      await inviteService.cancel(inviteId);
      set(state => ({
        sentInvites: state.sentInvites.filter(i => i.id !== inviteId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Cancel invite error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка отмены приглашения'
      });
    }
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
