/**
 * API-интегрированные хуки для Zustand stores
 * 
 * Этот файл содержит обёртки над существующими stores,
 * которые используют реальные API вызовы вместо mock данных.
 */

import { useAuthStore, useHackathonStore, useSwipeStore, useTeamStore, useInviteStore } from './useStore';
import { 
  authService, 
  userService, 
  hackathonService, 
  swipeService, 
  teamService, 
  inviteService,
  getTelegramInitData,
  initTelegramWebApp,
  telegramHapticFeedback,
} from '../api';
import { User } from '../types';

// ============================================
// AUTH HOOKS С API
// ============================================

/**
 * Инициализация Telegram WebApp и автологин
 */
export const useInitTelegramAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  const initAuth = async (): Promise<boolean> => {
    // Инициализируем Telegram WebApp
    initTelegramWebApp();
    
    // Если уже авторизованы - ничего не делаем
    if (isAuthenticated && user) {
      return true;
    }
    
    // Получаем initData из Telegram
    const initData = getTelegramInitData();
    if (!initData) {
      console.log('No Telegram initData available');
      return false;
    }
    
    try {
      // Отправляем на бэкенд для валидации
      const response = await authService.loginWithTelegram(initData);
      
      // Сохраняем токен
      localStorage.setItem('token', response.token);
      
      // Обновляем store
      useAuthStore.setState({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        isLoading: false,
      });
      
      telegramHapticFeedback('success');
      return true;
    } catch (error) {
      console.error('Telegram auth failed:', error);
      telegramHapticFeedback('error');
      return false;
    }
  };
  
  return { initAuth, user, isAuthenticated };
};

/**
 * Логин админа через API
 */
export const useAdminLogin = () => {
  const setLoading = (loading: boolean) => 
    useAuthStore.setState({ isLoading: loading });
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await authService.loginAdmin(email, password);
      
      localStorage.setItem('token', response.token);
      
      useAuthStore.setState({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      setLoading(false);
      return false;
    }
  };
  
  return { login };
};

/**
 * Выход из системы
 */
export const useLogout = () => {
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Игнорируем ошибки при logout
    } finally {
      localStorage.removeItem('token');
      useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  };
  
  return { logout };
};

/**
 * Обновление профиля через API
 */
export const useUpdateProfile = () => {
  const updateProfile = async (data: Parameters<typeof userService.updateProfile>[0]): Promise<User | null> => {
    try {
      const updatedUser = await userService.updateProfile(data);
      
      useAuthStore.setState({ user: updatedUser });
      telegramHapticFeedback('success');
      
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      telegramHapticFeedback('error');
      return null;
    }
  };
  
  return { updateProfile };
};

// ============================================
// HACKATHON HOOKS С API
// ============================================

/**
 * Загрузка хакатонов через API
 */
export const useFetchHackathons = () => {
  const setLoading = (loading: boolean) => 
    useHackathonStore.setState({ isLoading: loading });
  
  const fetchHackathons = async () => {
    setLoading(true);
    
    try {
      const hackathons = await hackathonService.getAll();
      useHackathonStore.setState({ hackathons, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
      setLoading(false);
    }
  };
  
  const fetchActiveHackathons = async () => {
    setLoading(true);
    
    try {
      const hackathons = await hackathonService.getActive();
      useHackathonStore.setState({ hackathons, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch active hackathons:', error);
      setLoading(false);
    }
  };
  
  return { fetchHackathons, fetchActiveHackathons };
};

// ============================================
// SWIPE HOOKS С API
// ============================================

/**
 * Работа с колодой свайпов через API
 */
export const useSwipeAPI = () => {
  const { deck } = useSwipeStore();
  
  const fetchDeck = async (hackathonId?: string) => {
    useSwipeStore.setState({ isLoading: true });
    
    try {
      const users = await swipeService.getDeck(hackathonId);
      useSwipeStore.setState({ deck: users, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch swipe deck:', error);
      useSwipeStore.setState({ isLoading: false });
    }
  };
  
  const sendSwipe = async (targetUserId: string, action: 'like' | 'pass') => {
    try {
      const response = await swipeService.swipe(parseInt(targetUserId), action);
      
      // Удаляем пользователя из колоды
      useSwipeStore.setState(state => ({
        deck: state.deck.filter(u => u.id !== targetUserId),
        swipedUsers: [...state.swipedUsers, {
          id: 'swipe-' + Date.now(),
          swiperId: 'current-user',
          targetUserId,
          direction: action === 'like' ? 'right' : 'left',
          createdAt: new Date(),
        }],
      }));
      
      // Хаптик при мэтче
      if (response.match) {
        telegramHapticFeedback('success');
      } else {
        telegramHapticFeedback('light');
      }
      
      return response;
    } catch (error) {
      console.error('Swipe failed:', error);
      telegramHapticFeedback('error');
      return null;
    }
  };
  
  const undoSwipe = async () => {
    try {
      await swipeService.undoSwipe();
      // Здесь нужно восстановить пользователя в колоду
      // Но для этого нужен refetch
      await fetchDeck();
    } catch (error) {
      console.error('Undo swipe failed:', error);
    }
  };
  
  return { deck, fetchDeck, sendSwipe, undoSwipe };
};

// ============================================
// TEAM HOOKS С API
// ============================================

/**
 * Работа с командами через API
 */
export const useTeamAPI = () => {
  const { teams, currentTeam, teamMembers } = useTeamStore();
  
  const fetchTeams = async (hackathonId?: string) => {
    useTeamStore.setState({ isLoading: true });
    
    try {
      const teams = await teamService.getAll(hackathonId);
      useTeamStore.setState({ teams, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      useTeamStore.setState({ isLoading: false });
    }
  };
  
  const fetchMyTeam = async () => {
    useTeamStore.setState({ isLoading: true });
    
    try {
      const team = await teamService.getMyTeam();
      const members = team?.members.map(m => m.user) || [];
      useTeamStore.setState({ 
        currentTeam: team, 
        teamMembers: members,
        isLoading: false,
      });
      return team;
    } catch (error) {
      console.error('Failed to fetch my team:', error);
      useTeamStore.setState({ isLoading: false });
      return null;
    }
  };
  
  const createTeam = async (name: string, hackathonId: string, description?: string) => {
    try {
      const team = await teamService.create({ name, hackathonId, description });
      const members = team.members.map(m => m.user);
      
      useTeamStore.setState(state => ({
        teams: [...state.teams, team],
        currentTeam: team,
        teamMembers: members,
      }));
      
      // Становимся капитаном
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, role: 'captain' } : null,
      }));
      
      telegramHapticFeedback('success');
      return team;
    } catch (error) {
      console.error('Failed to create team:', error);
      telegramHapticFeedback('error');
      return null;
    }
  };
  
  const leaveTeam = async (teamId: string) => {
    try {
      await teamService.leave(teamId);
      
      useTeamStore.setState({
        currentTeam: null,
        teamMembers: [],
      });
      
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, role: 'participant', status: 'looking' } : null,
      }));
      
      telegramHapticFeedback('success');
    } catch (error) {
      console.error('Failed to leave team:', error);
      telegramHapticFeedback('error');
    }
  };
  
  const kickMember = async (teamId: string, userId: string) => {
    try {
      await teamService.kickMember(teamId, userId);
      
      useTeamStore.setState(state => ({
        teamMembers: state.teamMembers.filter(m => m.id !== userId),
        currentTeam: state.currentTeam ? {
          ...state.currentTeam,
          members: state.currentTeam.members.filter(m => m.userId !== userId),
        } : null,
      }));
      
      telegramHapticFeedback('success');
    } catch (error) {
      console.error('Failed to kick member:', error);
      telegramHapticFeedback('error');
    }
  };
  
  const updateTeamStatus = async (teamId: string, status: 'looking' | 'closed') => {
    try {
      const updatedTeam = await teamService.updateStatus(teamId, status);
      
      useTeamStore.setState(state => ({
        teams: state.teams.map(t => t.id === teamId ? updatedTeam : t),
        currentTeam: state.currentTeam?.id === teamId ? updatedTeam : state.currentTeam,
      }));
      
      telegramHapticFeedback('success');
    } catch (error) {
      console.error('Failed to update team status:', error);
      telegramHapticFeedback('error');
    }
  };
  
  const generateInviteLink = async (teamId: string) => {
    try {
      const { link, code } = await teamService.generateInviteLink(teamId);
      return { link, code };
    } catch (error) {
      console.error('Failed to generate invite link:', error);
      return null;
    }
  };
  
  const joinByCode = async (code: string) => {
    try {
      const team = await teamService.joinByCode(code);
      const members = team.members.map(m => m.user);
      
      useTeamStore.setState({
        currentTeam: team,
        teamMembers: members,
      });
      
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, status: 'in_team' } : null,
      }));
      
      telegramHapticFeedback('success');
      return team;
    } catch (error) {
      console.error('Failed to join team:', error);
      telegramHapticFeedback('error');
      return null;
    }
  };
  
  return {
    teams,
    currentTeam,
    teamMembers,
    fetchTeams,
    fetchMyTeam,
    createTeam,
    leaveTeam,
    kickMember,
    updateTeamStatus,
    generateInviteLink,
    joinByCode,
  };
};

// ============================================
// INVITE HOOKS С API
// ============================================

/**
 * Работа с приглашениями через API
 */
export const useInviteAPI = () => {
  const { invites, sentInvites } = useInviteStore();
  
  const fetchInvites = async () => {
    useInviteStore.setState({ isLoading: true });
    
    try {
      const [incoming, outgoing] = await Promise.all([
        inviteService.getIncoming(),
        inviteService.getOutgoing(),
      ]);
      
      useInviteStore.setState({
        invites: incoming,
        sentInvites: outgoing,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch invites:', error);
      useInviteStore.setState({ isLoading: false });
    }
  };
  
  const sendInvite = async (toUserId: string, teamId: string, message?: string) => {
    try {
      const invite = await inviteService.send(toUserId, teamId, message);
      
      useInviteStore.setState(state => ({
        sentInvites: [...state.sentInvites, invite],
      }));
      
      telegramHapticFeedback('success');
      return invite;
    } catch (error) {
      console.error('Failed to send invite:', error);
      telegramHapticFeedback('error');
      return null;
    }
  };
  
  const acceptInvite = async (inviteId: string) => {
    try {
      const team = await inviteService.accept(inviteId);
      
      // Обновляем статус инвайта
      useInviteStore.setState(state => ({
        invites: state.invites.map(i => 
          i.id === inviteId ? { ...i, status: 'accepted' as const } : i
        ),
      }));
      
      // Обновляем текущую команду
      const members = team.members.map(m => m.user);
      useTeamStore.setState({
        currentTeam: team,
        teamMembers: members,
      });
      
      // Обновляем статус пользователя
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, status: 'in_team' } : null,
      }));
      
      telegramHapticFeedback('success');
      return team;
    } catch (error) {
      console.error('Failed to accept invite:', error);
      telegramHapticFeedback('error');
      return null;
    }
  };
  
  const declineInvite = async (inviteId: string) => {
    try {
      await inviteService.decline(inviteId);
      
      useInviteStore.setState(state => ({
        invites: state.invites.map(i => 
          i.id === inviteId ? { ...i, status: 'declined' as const } : i
        ),
      }));
      
      telegramHapticFeedback('light');
    } catch (error) {
      console.error('Failed to decline invite:', error);
      telegramHapticFeedback('error');
    }
  };
  
  const cancelInvite = async (inviteId: string) => {
    try {
      await inviteService.cancel(inviteId);
      
      useInviteStore.setState(state => ({
        sentInvites: state.sentInvites.filter(i => i.id !== inviteId),
      }));
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  };
  
  return {
    invites,
    sentInvites,
    fetchInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  };
};
