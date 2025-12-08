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
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateProfileLocal: (data: Partial<User>) => void;
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

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        
        // Сразу обновляем локально (особенно важно для pts/mmr)
        const { user: currentUser } = get();
        if (currentUser) {
          const localUpdate = { 
            ...currentUser, 
            ...data,
            title: getTitleByPoints(data.pts ?? currentUser.pts),
          };
          set({ user: localUpdate });
        }
        
        try {
          // userService.updateProfile уже делает преобразование данных
          const updatedUser = await userService.updateProfile(data as any);
          set({ 
            user: { ...updatedUser, title: getTitleByPoints(updatedUser.pts || data.pts || 0) },
            isLoading: false 
          });
        } catch (error) {
          console.error('Update profile error:', error);
          // При ошибке оставляем локальные изменения (pts/mmr важнее)
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Ошибка обновления профиля' 
          });
          // Не бросаем ошибку для pts/mmr - они уже сохранены локально
          if (!data.pts && !data.mmr) {
            throw error;
          }
        }
      },

      updateProfileLocal: (data) => {
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
        const { token, user: currentUser } = get();
        if (!token) return;
        
        set({ isLoading: true, error: null });
        try {
          const serverUser = await userService.getProfile();
          
          // Получаем текущую кастомизацию из inventoryStore (она может быть более актуальной)
          const inventoryCustomization = useInventoryStore.getState().customization;
          
          // Приоритет: inventoryStore > serverUser > currentUser
          // inventoryStore всегда самый актуальный, так как обновляется при equipItem
          const hasInventoryCustomization = inventoryCustomization && (
            inventoryCustomization.background || 
            inventoryCustomization.nameColor || 
            inventoryCustomization.avatarFrame ||
            inventoryCustomization.title ||
            inventoryCustomization.effect ||
            (inventoryCustomization.badges && inventoryCustomization.badges.length > 0)
          );
          
          const finalCustomization = hasInventoryCustomization 
            ? inventoryCustomization 
            : (serverUser.customization || currentUser?.customization);
          
          // Сохраняем локальные pts/mmr если они больше серверных (сервер может не хранить pts)
          const mergedUser = {
            ...serverUser,
            pts: Math.max(serverUser.pts || 0, currentUser?.pts || 0),
            mmr: Math.max(serverUser.mmr || 0, currentUser?.mmr || 0),
            avatar: serverUser.avatar || currentUser?.avatar,
            title: getTitleByPoints(Math.max(serverUser.pts || 0, currentUser?.pts || 0)),
            // Используем приоритетную кастомизацию
            customization: finalCustomization,
          };
          set({ user: mergedUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Fetch profile error:', error);
          // НЕ делаем logout при ошибке - сохраняем локальные данные
          // Пользователь может быть оффлайн или сервер временно недоступен
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'itam-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // После восстановления состояния синхронизируем токен
        if (state?.token) {
          tokenUtils.setToken(state.token);
        }
      },
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
  updateTeamStatus: (teamId: string, status: 'looking' | 'closed') => Promise<void>;
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
        // API returns members as User[] directly, not TeamMember[]
        const members = Array.isArray(team.members) 
          ? (team.members[0]?.user ? team.members.map(m => m.user) : team.members as unknown as User[])
          : [];
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
      
      // API returns members as User[] directly
      const members = Array.isArray(newTeam.members) 
        ? (newTeam.members[0]?.user ? newTeam.members.map(m => m.user) : newTeam.members as unknown as User[])
        : [];
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
      
      // API returns members as User[] directly
      const members = Array.isArray(team.members) 
        ? (team.members[0]?.user ? team.members.map(m => m.user) : team.members as unknown as User[])
        : [];
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
    // API returns members as User[] directly
    const members = Array.isArray(team?.members) 
      ? (team?.members[0]?.user ? team.members.map(m => m.user) : team.members as unknown as User[])
      : [];
    set({ currentTeam: team, teamMembers: members });
  },

  updateTeamStatus: async (teamId, status) => {
    set({ isLoading: true, error: null });
    try {
      await teamService.updateStatus(teamId, status);
      // Не заменяем весь объект currentTeam, а только обновляем статус,
      // чтобы не потерять members и другие локальные данные
      set(state => ({
        teams: state.teams.map(t => t.id === teamId ? { ...t, status } : t),
        currentTeam: state.currentTeam?.id === teamId 
          ? { ...state.currentTeam, status } 
          : state.currentTeam,
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

// ============================================
// INVENTORY STORE
// ============================================
import { inventoryService, InventoryItem as InventoryItemAPI, UserCaseAPI, UserAchievementAPI, OpenCaseResponse } from '../api/services';
import { CustomizationItem, ProfileCustomization, Case, Achievement, CustomizationItemType } from '../types';

// Преобразование из API типов в фронтенд типы
const transformInventoryItem = (item: InventoryItemAPI): CustomizationItem => ({
  id: item.itemId,
  type: item.type as CustomizationItemType,
  rarity: item.rarity,
  name: item.name,
  value: item.value,
  previewUrl: '', // TODO: добавить в API
  isAnimated: item.rarity === 'legendary' || item.rarity === 'epic',
});

const transformCase = (c: UserCaseAPI): Case => ({
  id: c.id.toString(),
  name: c.caseName,
  description: `Кейс ${c.caseType}`,
  imageUrl: `/cases/${c.caseType}.png`,
  rarity: c.rarity,
  possibleItems: [], // Заполняется на сервере
  isOpened: c.isOpened,
  receivedAt: new Date(c.receivedAt),
  openedAt: c.openedAt ? new Date(c.openedAt) : undefined,
});

const transformAchievement = (a: UserAchievementAPI): Achievement => ({
  id: a.achievementId,
  name: a.name,
  description: a.description,
  iconUrl: a.iconUrl,
  rarity: a.rarity,
  category: 'special',
  progress: a.progress,
  maxProgress: a.maxProgress,
  earnedAt: a.earnedAt ? new Date(a.earnedAt) : undefined,
});

interface InventoryStore {
  items: CustomizationItem[];
  cases: Case[];
  achievements: Achievement[];
  customization: ProfileCustomization;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  
  // Actions
  fetchInventory: () => Promise<void>;
  equipItem: (item: CustomizationItem) => Promise<void>;
  unequipItem: (type: CustomizationItemType) => Promise<void>;
  openCase: (caseId: string) => Promise<OpenCaseResponse | null>;
  addItems: (newItems: CustomizationItem[]) => void;
  addCase: (newCase: Case) => void;
  clearError: () => void;
  getEquippedItem: (type: CustomizationItemType) => CustomizationItem | undefined;
}

const defaultCustomization: ProfileCustomization = {
  badges: [],
  showcaseAchievements: [],
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],
      cases: [],
      achievements: [],
      customization: defaultCustomization,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchInventory: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await inventoryService.getInventory();
          console.log('[DEBUG] fetchInventory response:', response);
          console.log('[DEBUG] response.cases:', response.cases);
          console.log('[DEBUG] response.items:', response.items);
          
          const items = response.items.map(transformInventoryItem);
          const cases = response.cases.map(transformCase);
          console.log('[DEBUG] transformed cases:', cases);
          const achievements = response.achievements.map(transformAchievement);
          
          // Собираем customization из экипированных предметов
          const equippedItems = response.items.filter(i => i.isEquipped);
          const customization: ProfileCustomization = {
            badges: [],
            showcaseAchievements: [],
          };
          
          equippedItems.forEach(item => {
            const transformed = transformInventoryItem(item);
            switch (item.type) {
              case 'background':
                customization.background = transformed;
                break;
              case 'nameColor':
                customization.nameColor = transformed;
                break;
              case 'avatarFrame':
                customization.avatarFrame = transformed;
                break;
              case 'title':
                customization.title = transformed;
                break;
              case 'effect':
                customization.effect = transformed;
                break;
              case 'badge':
                if (customization.badges.length < 3) {
                  customization.badges.push(transformed);
                }
                break;
            }
          });
          
          set({
            items,
            cases,
            achievements,
            customization,
            isLoading: false,
            lastFetched: new Date(),
          });
          
          // Синхронизируем кастомизацию в authStore
          const authStore = useAuthStore.getState();
          if (authStore.user) {
            authStore.updateProfileLocal({ customization });
          }
        } catch (error) {
          console.error('Fetch inventory error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка загрузки инвентаря',
          });
        }
      },

      equipItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          await inventoryService.equipItem({
            itemId: item.id,
            itemType: item.type,
            equip: true,
          });
          
          // Обновляем локальное состояние inventory store
          set(state => {
            const newCustomization = { ...state.customization };
            
            switch (item.type) {
              case 'background':
                newCustomization.background = item;
                break;
              case 'nameColor':
                newCustomization.nameColor = item;
                break;
              case 'avatarFrame':
                newCustomization.avatarFrame = item;
                break;
              case 'title':
                newCustomization.title = item;
                break;
              case 'effect':
                newCustomization.effect = item;
                break;
              case 'badge':
                // Добавляем бейдж если есть место
                if (!newCustomization.badges.find(b => b.id === item.id) && newCustomization.badges.length < 3) {
                  newCustomization.badges = [...newCustomization.badges, item];
                }
                break;
            }
            
            return {
              customization: newCustomization,
              isLoading: false,
            };
          });
          
          // Также обновляем auth store с кастомизацией пользователя
          const authStore = useAuthStore.getState();
          if (authStore.user) {
            const currentCustomization = authStore.user.customization || { badges: [], showcaseAchievements: [] };
            const newUserCustomization: ProfileCustomization = { 
              ...currentCustomization,
              badges: currentCustomization.badges || [],
              showcaseAchievements: currentCustomization.showcaseAchievements || [],
            };
            switch (item.type) {
              case 'background':
                newUserCustomization.background = item;
                break;
              case 'nameColor':
                newUserCustomization.nameColor = item;
                break;
              case 'avatarFrame':
                newUserCustomization.avatarFrame = item;
                break;
              case 'title':
                newUserCustomization.title = item;
                break;
              case 'effect':
                newUserCustomization.effect = item;
                break;
              case 'badge':
                if (!newUserCustomization.badges.find(b => b.id === item.id) && newUserCustomization.badges.length < 3) {
                  newUserCustomization.badges = [...newUserCustomization.badges, item];
                }
                break;
            }
            authStore.updateProfileLocal({ customization: newUserCustomization });
          }
        } catch (error) {
          console.error('Equip item error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка экипировки предмета',
          });
        }
      },

      unequipItem: async (type) => {
        set({ isLoading: true, error: null });
        try {
          const currentItem = get().getEquippedItem(type);
          if (!currentItem) {
            set({ isLoading: false });
            return;
          }
          
          await inventoryService.equipItem({
            itemId: currentItem.id,
            itemType: type,
            equip: false,
          });
          
          // Обновляем локальное состояние
          set(state => {
            const newCustomization = { ...state.customization };
            
            switch (type) {
              case 'background':
                delete newCustomization.background;
                break;
              case 'nameColor':
                delete newCustomization.nameColor;
                break;
              case 'avatarFrame':
                delete newCustomization.avatarFrame;
                break;
              case 'title':
                delete newCustomization.title;
                break;
              case 'effect':
                delete newCustomization.effect;
                break;
              case 'badge':
                // Для бейджей нужно знать какой именно снимать
                newCustomization.badges = [];
                break;
            }
            
            return {
              customization: newCustomization,
              isLoading: false,
            };
          });
        } catch (error) {
          console.error('Unequip item error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка снятия предмета',
          });
        }
      },

      openCase: async (caseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await inventoryService.openCase(parseInt(caseId));
          
          // Добавляем новый предмет в инвентарь
          const newItem = transformInventoryItem(response.droppedItem);
          
          set(state => ({
            items: [...state.items, newItem],
            cases: state.cases.map(c =>
              c.id === caseId ? { ...c, isOpened: true, openedAt: new Date() } : c
            ),
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          console.error('Open case error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Ошибка открытия кейса',
          });
          return null;
        }
      },

      addItems: (newItems) => {
        set(state => ({
          items: [...state.items, ...newItems],
        }));
      },

      addCase: (newCase) => {
        set(state => ({
          cases: [...state.cases, newCase],
        }));
      },

      clearError: () => set({ error: null }),
      
      getEquippedItem: (type) => {
        const state = get();
        switch (type) {
          case 'background':
            return state.customization.background;
          case 'nameColor':
            return state.customization.nameColor;
          case 'avatarFrame':
            return state.customization.avatarFrame;
          case 'title':
            return state.customization.title;
          case 'effect':
            return state.customization.effect;
          case 'badge':
            return state.customization.badges[0];
          default:
            return undefined;
        }
      },
    }),
    {
      name: 'itam-inventory-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cases: state.cases,
        achievements: state.achievements,
        customization: state.customization,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
