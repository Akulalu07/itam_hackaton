import axiosClient from './axiosClient';
import { User, Hackathon, Team, Invite, UserSkill, UserRole, UserStatus, GamificationTitle } from '../types';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Трансформирует роль с бэкенда в роль фронтенда
const mapBackendRole = (role: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'user': 'participant',
    'hackathon_creator': 'captain',
    'admin': 'admin',
  };
  return roleMap[role] || 'participant';
};

// Трансформирует строковые скиллы с бэкенда в объекты UserSkill
const mapSkillsFromBackend = (skills: string[] | null | undefined, verifiedSkills: string[] | null | undefined = []): UserSkill[] => {
  console.log('[DEBUG] mapSkillsFromBackend input:', skills, 'verifiedSkills:', verifiedSkills);
  if (!skills || !Array.isArray(skills)) {
    console.log('[DEBUG] skills empty or not array, returning []');
    return [];
  }
  const verifiedSet = new Set(verifiedSkills || []);
  const result = skills.map((name, index) => ({
    id: `skill-${index}`,
    name,
    level: 'intermediate' as const,
    category: 'other' as const,
    verified: verifiedSet.has(name),
  }));
  console.log('[DEBUG] mapSkillsFromBackend output:', result);
  return result;
};

// Трансформирует данные пользователя с бэкенда для фронтенда
// Экспортируется для использования в TokenAuthPage
export const transformUserFromBackend = (data: any): User => {
  console.log('[DEBUG] transformUserFromBackend input data:', data);
  console.log('[DEBUG] data.skills:', data.skills, 'data.verifiedSkills:', data.verifiedSkills);
  
  // Трансформируем customization если есть
  let customization: User['customization'] = undefined;
  if (data.customization) {
    customization = {
      badges: [],
      showcaseAchievements: [],
    };
    
    if (data.customization.background) {
      customization.background = {
        id: data.customization.background.id,
        name: data.customization.background.name,
        type: 'background',
        rarity: data.customization.background.rarity || 'common',
        value: data.customization.background.value,
      };
    }
    
    if (data.customization.nameColor) {
      customization.nameColor = {
        id: data.customization.nameColor.id,
        name: data.customization.nameColor.name,
        type: 'nameColor',
        rarity: data.customization.nameColor.rarity || 'common',
        value: data.customization.nameColor.value,
      };
    }
    
    if (data.customization.avatarFrame) {
      customization.avatarFrame = {
        id: data.customization.avatarFrame.id,
        name: data.customization.avatarFrame.name,
        type: 'avatarFrame',
        rarity: data.customization.avatarFrame.rarity || 'common',
        value: data.customization.avatarFrame.value,
      };
    }
    
    if (data.customization.title) {
      customization.title = {
        id: data.customization.title.id,
        name: data.customization.title.name,
        type: 'title',
        rarity: data.customization.title.rarity || 'common',
        value: data.customization.title.value,
      };
    }
    
    if (data.customization.effect) {
      customization.effect = {
        id: data.customization.effect.id,
        name: data.customization.effect.name,
        type: 'effect',
        rarity: data.customization.effect.rarity || 'common',
        value: data.customization.effect.value,
      };
    }
    
    if (data.customization.badges && Array.isArray(data.customization.badges)) {
      customization.badges = data.customization.badges.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: 'badge' as const,
        rarity: b.rarity || 'common',
        value: b.value,
      }));
    }
  }
  
  return {
    id: String(data.id),
    telegramId: data.telegramUserId ? String(data.telegramUserId) : (data.telegramId ? String(data.telegramId) : undefined),
    name: data.name || data.username || 'Пользователь',
    avatar: data.avatarUrl || data.avatar,
    bio: data.bio || '',
    role: mapBackendRole(data.role),
    status: (data.teamId ? 'in_team' : 'looking') as UserStatus,
    skills: mapSkillsFromBackend(data.skills, data.verifiedSkills),
    experience: data.experience || '',
    lookingFor: data.lookingFor || [],
    contactInfo: data.contactInfo || '',
    mmr: data.mmr || data.skillRating || 1000,
    pts: data.pts || 0,
    title: (data.title || 'Новичок') as GamificationTitle,
    nftStickers: data.nftStickers || [],
    currentHackathonId: data.currentHackathonId ? String(data.currentHackathonId) : undefined,
    currentTeamId: data.teamId ? String(data.teamId) : undefined,
    profileComplete: data.profileComplete || false,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    customization,
  };
};

// ============================================
// USER SERVICE - Работа с профилем
// ============================================

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  skills?: UserSkill[];
  experience?: string;
  avatar?: string;
  pts?: number;
  mmr?: number;
  lookingFor?: string[];
  verifiedSkills?: string[]; // Для прямой отправки verified skills
}

// Преобразует данные профиля для бэкенда
const transformProfileForBackend = (data: UpdateProfileData) => {
  const result: any = {};
  
  if (data.name !== undefined) result.name = data.name;
  if (data.bio !== undefined) result.bio = data.bio;
  if (data.experience !== undefined) result.experience = data.experience;
  if (data.avatar !== undefined) result.avatarUrl = data.avatar;
  if (data.pts !== undefined) result.pts = data.pts;
  if (data.mmr !== undefined) result.mmr = data.mmr;
  if (data.lookingFor !== undefined) result.lookingFor = data.lookingFor;
  
  // Преобразуем skills из UserSkill[] в string[]
  if (data.skills !== undefined) {
    result.skills = data.skills.map(s => s.name);
    // Также отправляем verified skills
    result.verifiedSkills = data.skills.filter(s => s.verified).map(s => s.name);
  }
  
  // Если отдельно передаём verifiedSkills
  if (data.verifiedSkills !== undefined) {
    result.verifiedSkills = data.verifiedSkills;
  }
  
  return result;
};

export const userService = {
  /**
   * Получить текущий профиль пользователя
   */
  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get('/api/users/me');
    return transformUserFromBackend(response.data);
  },

  /**
   * Обновить профиль пользователя
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const backendData = transformProfileForBackend(data);
    const response = await axiosClient.patch('/api/users/me/profile', backendData);
    return transformUserFromBackend(response.data);
  },

  /**
   * Получить профиль пользователя по ID
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await axiosClient.get(`/api/users/${userId}`);
    return transformUserFromBackend(response.data);
  },

  /**
   * Загрузить аватар
   */
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosClient.post<{ url: string }>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Обновить калибровку PTS
   */
  updateCalibration: async (answers: Record<string, number>): Promise<{ pts: number; mmr: number }> => {
    const response = await axiosClient.post<{ pts: number; mmr: number }>('/user/calibration', {
      answers,
    });
    return response.data;
  },
};

// ============================================
// HACKATHON SERVICE - Работа с хакатонами
// ============================================

export interface CreateHackathonData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeamSize: number;
  minTeamSize: number;
  imageUrl?: string;
}

export const hackathonService = {
  /**
   * Получить список всех хакатонов
   */
  getAll: async (): Promise<Hackathon[]> => {
    const response = await axiosClient.get<Hackathon[]>('/api/hackathons');
    return response.data;
  },

  /**
   * Получить активные хакатоны (для регистрации)
   */
  getActive: async (): Promise<Hackathon[]> => {
    const response = await axiosClient.get<Hackathon[]>('/api/hackathons/active');
    return response.data;
  },

  /**
   * Получить хакатон по ID
   */
  getById: async (id: string): Promise<Hackathon> => {
    const response = await axiosClient.get<Hackathon>(`/api/hackathons/${id}`);
    return response.data;
  },

  /**
   * Создать хакатон (Admin only)
   */
  create: async (data: CreateHackathonData): Promise<Hackathon> => {
    const response = await axiosClient.post<Hackathon>('/api/admin/hackathons', data);
    return response.data;
  },

  /**
   * Обновить хакатон (Admin only)
   */
  update: async (id: string, data: Partial<CreateHackathonData>): Promise<Hackathon> => {
    const response = await axiosClient.put<Hackathon>(`/api/admin/hackathons/${id}`, data);
    return response.data;
  },

  /**
   * Удалить хакатон (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/admin/hackathons/${id}`);
  },

  /**
   * Зарегистрироваться на хакатон
   */
  register: async (hackathonId: string): Promise<void> => {
    await axiosClient.post(`/api/hackathons/${hackathonId}/register`);
  },
};

// ============================================
// SWIPE SERVICE - Рекомендации и свайпы
// ============================================

export interface SwipeResponse {
  match: boolean;  // Если оба свайпнули right
  invite?: Invite; // Если создан invite
}

export const swipeService = {
  /**
   * Получить колоду рекомендаций для свайпа
   */
  getDeck: async (hackathonId?: string): Promise<User[]> => {
    const params = hackathonId ? { hackathonId } : {};
    const response = await axiosClient.get<any[]>('/api/recommendations', { params });
    // Трансформируем каждого пользователя включая кастомизацию
    return response.data.map(transformUserFromBackend);
  },

  /**
   * Отправить свайп
   */
  swipe: async (targetUserId: number, action: 'like' | 'pass'): Promise<SwipeResponse> => {
    const response = await axiosClient.post<SwipeResponse>('/api/swipe', {
      targetUserId,
      action,
    });
    return response.data;
  },

  /**
   * Отменить последний свайп
   */
  undoSwipe: async (): Promise<void> => {
    await axiosClient.post('/api/swipe/undo');
  },
};

// ============================================
// TEAM SERVICE - Работа с командами
// ============================================

export interface CreateTeamData {
  name: string;
  hackathonId: string;
  description?: string;
  lookingFor?: string[];
}

export const teamService = {
  /**
   * Получить все команды (для хакатона)
   */
  getAll: async (hackathonId?: string): Promise<Team[]> => {
    const params = hackathonId ? { hackathonId } : {};
    const response = await axiosClient.get<Team[]>('/api/teams', { params });
    return response.data;
  },

  /**
   * Получить мою текущую команду
   */
  getMyTeam: async (): Promise<Team | null> => {
    try {
      const response = await axiosClient.get<Team>('/api/teams/my');
      return response.data;
    } catch (error) {
      // Если команды нет - вернём null
      return null;
    }
  },

  /**
   * Получить команду по ID
   */
  getById: async (teamId: string): Promise<Team> => {
    const response = await axiosClient.get<Team>(`/api/teams/${teamId}`);
    return response.data;
  },

  /**
   * Создать команду (стать капитаном)
   */
  create: async (data: CreateTeamData): Promise<Team> => {
    const response = await axiosClient.post<Team>('/api/teams', data);
    return response.data;
  },

  /**
   * Обновить команду
   */
  update: async (teamId: string, data: Partial<CreateTeamData>): Promise<Team> => {
    const response = await axiosClient.put<Team>(`/api/teams/${teamId}`, data);
    return response.data;
  },

  /**
   * Удалить/распустить команду
   */
  delete: async (teamId: string): Promise<void> => {
    await axiosClient.delete(`/api/teams/${teamId}`);
  },

  /**
   * Выйти из команды
   */
  leave: async (teamId: string): Promise<void> => {
    await axiosClient.post(`/api/teams/${teamId}/leave`);
  },

  /**
   * Исключить участника (Captain only)
   */
  kickMember: async (teamId: string, userId: string): Promise<void> => {
    await axiosClient.post(`/api/teams/${teamId}/kick`, { userId });
  },

  /**
   * Изменить статус команды
   */
  updateStatus: async (teamId: string, status: 'open' | 'closed'): Promise<Team> => {
    const response = await axiosClient.put<Team>(`/api/teams/${teamId}/status`, { status });
    return response.data;
  },

  /**
   * Сгенерировать invite ссылку
   */
  generateInviteLink: async (teamId: string): Promise<{ link: string; code: string }> => {
    const response = await axiosClient.post<{ link: string; code: string }>(`/api/teams/${teamId}/invite-link`);
    return response.data;
  },

  /**
   * Присоединиться по invite коду
   */
  joinByCode: async (code: string): Promise<Team> => {
    const response = await axiosClient.post<Team>('/api/teams/join', { code });
    return response.data;
  },
};

// ============================================
// INVITE SERVICE - Работа с приглашениями
// ============================================

export const inviteService = {
  /**
   * Получить входящие приглашения
   */
  getIncoming: async (): Promise<Invite[]> => {
    const response = await axiosClient.get<Invite[]>('/api/invites/incoming');
    return response.data;
  },

  /**
   * Получить исходящие приглашения (для капитана)
   */
  getOutgoing: async (): Promise<Invite[]> => {
    const response = await axiosClient.get<Invite[]>('/api/invites/outgoing');
    return response.data;
  },

  /**
   * Отправить приглашение
   */
  send: async (toUserId: string, teamId: string, message?: string): Promise<Invite> => {
    const response = await axiosClient.post<Invite>('/api/invites', {
      toUserId,
      teamId,
      message,
    });
    return response.data;
  },

  /**
   * Принять приглашение
   */
  accept: async (inviteId: string): Promise<Team> => {
    const response = await axiosClient.post<Team>(`/api/invites/${inviteId}/accept`);
    return response.data;
  },

  /**
   * Отклонить приглашение
   */
  decline: async (inviteId: string): Promise<void> => {
    await axiosClient.post(`/api/invites/${inviteId}/decline`);
  },

  /**
   * Отменить приглашение (отправитель)
   */
  cancel: async (inviteId: string): Promise<void> => {
    await axiosClient.delete(`/api/invites/${inviteId}`);
  },
};

// ============================================
// ADMIN SERVICE - Административные функции
// ============================================

export interface AdminStats {
  totalUsers: number;
  totalTeams: number;
  totalHackathons: number;
  activeHackathons: number;
  usersLookingForTeam: number;
  usersInTeam: number;
}

export const adminService = {
  /**
   * Получить статистику
   */
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosClient.get<AdminStats>('/api/admin/stats');
    return response.data;
  },

  /**
   * Получить всех пользователей
   */
  getUsers: async (filters?: { 
    status?: string; 
    hackathonId?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number }> => {
    const response = await axiosClient.get<{ users: User[]; total: number }>('/api/admin/users', { params: filters });
    return response.data;
  },

  /**
   * Обновить пользователя (Admin)
   */
  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await axiosClient.put<User>(`/api/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Получить все команды (Admin)
   */
  getTeams: async (hackathonId?: string): Promise<Team[]> => {
    const params = hackathonId ? { hackathonId } : {};
    const response = await axiosClient.get<Team[]>('/api/admin/teams', { params });
    return response.data;
  },

  /**
   * Назначить пользователя в команду (Admin)
   */
  assignToTeam: async (userId: number, teamId: number): Promise<void> => {
    await axiosClient.post('/api/admin/assign', { userId, teamId });
  },

  /**
   * Экспорт данных в CSV
   */
  exportCSV: async (type: 'users' | 'teams', hackathonId?: string): Promise<Blob> => {
    const response = await axiosClient.get(`/api/admin/export/${type}`, {
      params: { hackathonId },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Выдать кейсы пользователям (Admin)
   */
  giveCases: async (data: {
    userIds: number[];
    caseType: string;
    caseName: string;
    rarity: string;
  }): Promise<{ message: string; givenCount: number }> => {
    const response = await axiosClient.post('/api/admin/cases/give', data);
    return response.data;
  },
};

// ============================================
// INVENTORY SERVICE - Инвентарь и кастомизация
// ============================================

export interface InventoryItem {
  id: number;
  userId: number;
  itemId: string;
  type: 'background' | 'nameColor' | 'avatarFrame' | 'badge' | 'title' | 'effect';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  name: string;
  value: string;
  isEquipped: boolean;
  quantity: number;
  obtainedAt: string;
}

export interface UserCaseAPI {
  id: number;
  userId: number;
  caseType: string;
  caseName: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isOpened: boolean;
  receivedAt: string;
  openedAt?: string;
}

export interface UserAchievementAPI {
  id: number;
  userId: number;
  achievementId: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  earnedAt?: string;
}

export interface ProfileCustomizationAPI {
  id: number;
  userId: number;
  backgroundId?: string;
  nameColorId?: string;
  avatarFrameId?: string;
  titleId?: string;
  effectId?: string;
  badge1Id?: string;
  badge2Id?: string;
  badge3Id?: string;
}

export interface InventoryResponse {
  items: InventoryItem[];
  cases: UserCaseAPI[];
  achievements: UserAchievementAPI[];
  customization: ProfileCustomizationAPI | null;
}

export interface OpenCaseResponse {
  droppedItem: InventoryItem;
  isNew: boolean;
}

export const inventoryService = {
  /**
   * Получить инвентарь текущего пользователя
   */
  getInventory: async (): Promise<InventoryResponse> => {
    const response = await axiosClient.get<InventoryResponse>('/api/inventory');
    return response.data;
  },

  /**
   * Экипировать/снять предмет
   */
  equipItem: async (data: {
    itemId: string;
    itemType: 'background' | 'nameColor' | 'avatarFrame' | 'badge' | 'title' | 'effect';
    equip: boolean;
  }): Promise<ProfileCustomizationAPI> => {
    const response = await axiosClient.post<ProfileCustomizationAPI>('/api/inventory/equip', data);
    return response.data;
  },

  /**
   * Открыть кейс
   */
  openCase: async (caseId: number): Promise<OpenCaseResponse> => {
    const response = await axiosClient.post<OpenCaseResponse>('/api/inventory/cases/open', { caseId });
    return response.data;
  },

  /**
   * Получить кастомизацию пользователя по ID
   */
  getUserCustomization: async (userId: string): Promise<ProfileCustomizationAPI> => {
    const response = await axiosClient.get<ProfileCustomizationAPI>(`/api/users/${userId}/customization`);
    return response.data;
  },
};
