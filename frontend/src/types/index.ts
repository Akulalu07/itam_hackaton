// User Roles
export type UserRole = 'participant' | 'captain' | 'admin';

// User Status
export type UserStatus = 'looking' | 'in_team' | 'inactive';

// Skill levels
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Gamification titles based on rating
export type GamificationTitle = 
  | 'Новичок' 
  | 'Участник' 
  | 'Активист' 
  | 'Профи' 
  | 'Легенда';

// NFT Sticker type
export interface NFTSticker {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

// User Skill
export interface UserSkill {
  id: string;
  name: string;
  level: SkillLevel;
  category?: 'frontend' | 'backend' | 'design' | 'ml' | 'devops' | 'management' | 'other';
  verified?: boolean; // подтверждён тестом
}

// User Profile
export interface User {
  id: string;
  telegramId?: string;
  email?: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  skills: UserSkill[];
  experience: string; // e.g., "2 years", "Junior", etc.
  lookingFor?: string[]; // Roles/skills looking for in team
  contactInfo?: string; // telegram, email, etc.
  
  // Gamification
  mmr: number;        // Match Making Rating
  pts: number;        // Points
  title: GamificationTitle;
  nftStickers: NFTSticker[];
  
  // Hackathon related
  currentHackathonId?: string;
  currentTeamId?: string;
  profileComplete?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Hackathon
export interface Hackathon {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxTeamSize: number;
  minTeamSize: number;
  status: 'upcoming' | 'active' | 'registration' | 'completed';
  participantsCount: number;
  teamsCount: number;
  createdAt: Date;
}

// Team Status
export type TeamStatus = 'open' | 'closed' | 'full';

// Team
export interface Team {
  id: string;
  name: string;
  hackathonId: string;
  captainId: string;
  members: TeamMember[];
  maxSize: number;
  maxMembers?: number; // alias for maxSize
  status?: TeamStatus;
  description?: string;
  lookingFor?: string[]; // Skills they need
  createdAt: Date;
}

// Team Member
export interface TeamMember {
  userId: string;
  user: User;
  role: 'captain' | 'member';
  joinedAt: Date;
}

// Invite
export interface Invite {
  id: string;
  teamId: string;
  team: Team;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
}

// Swipe action
export interface SwipeAction {
  id: string;
  swiperId: string;
  targetUserId: string;
  direction: 'left' | 'right';
  createdAt: Date;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Admin Analytics
export interface Analytics {
  totalUsers: number;
  totalTeams: number;
  usersLooking: number;
  usersInTeams: number;
  hackathonsActive: number;
  dailySignups: { date: string; count: number }[];
  skillDistribution: { skill: string; count: number }[];
}

// ============================================
// SKILL TEST TYPES - Тесты для подтверждения навыков
// ============================================

// Категории навыков для тестов
export type SkillCategory = 'frontend' | 'backend' | 'design' | 'ml' | 'devops' | 'management' | 'other';

// Вопрос теста
export interface TestQuestion {
  id: string;
  question: string;
  code?: string; // Код для показа в вопросе
  options: TestOption[];
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string; // Объяснение правильного ответа
}

// Вариант ответа
export interface TestOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Тест по навыку
export interface SkillTest {
  id: string;
  skillName: string; // "Go", "React", "TypeScript" и т.д.
  category: SkillCategory;
  description: string;
  questions: TestQuestion[];
  passingScore: number; // Минимум правильных для прохождения (в процентах)
  timeLimit?: number; // Лимит времени в секундах (опционально)
  levelThresholds: {
    beginner: number;    // 0-49%
    intermediate: number; // 50-69%
    advanced: number;     // 70-89%
    expert: number;       // 90-100%
  };
}

// Ответ пользователя
export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent?: number; // Время на ответ в секундах
}

// Результат прохождения теста
export interface TestResult {
  id: string;
  userId: string;
  skillName: string;
  score: number; // Процент правильных ответов
  level: SkillLevel; // Определённый уровень
  answers: UserAnswer[];
  completedAt: Date;
  timeSpent: number; // Общее время в секундах
}

// Статус теста по навыку для пользователя
export interface UserSkillTestStatus {
  skillName: string;
  isVerified: boolean;
  level?: SkillLevel;
  lastTestResult?: TestResult;
  canRetake: boolean; // Можно ли пересдать
  retakeAvailableAt?: Date; // Когда можно пересдать
}
