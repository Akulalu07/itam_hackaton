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
  category: 'frontend' | 'backend' | 'design' | 'ml' | 'devops' | 'management' | 'other';
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
  
  // Gamification
  mmr: number;        // Match Making Rating
  pts: number;        // Points
  title: GamificationTitle;
  nftStickers: NFTSticker[];
  
  // Hackathon related
  currentHackathonId?: string;
  currentTeamId?: string;
  
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
