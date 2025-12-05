import { User, Hackathon, Team, Invite, GamificationTitle } from '../types';

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate gamification title based on points
export const getTitleByPoints = (pts: number): GamificationTitle => {
  if (pts < 100) return 'Новичок';
  if (pts < 500) return 'Участник';
  if (pts < 1500) return 'Активист';
  if (pts < 5000) return 'Профи';
  return 'Легенда';
};

// Mock Users for swipe deck
export const mockUsers: User[] = [
  {
    id: generateId(),
    telegramId: '123456789',
    name: 'Алексей Петров',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    bio: 'Full-stack разработчик с опытом в React и Node.js. Люблю участвовать в хакатонах!',
    role: 'participant',
    status: 'looking',
    skills: [
      { id: '1', name: 'React', level: 'advanced', category: 'frontend' },
      { id: '2', name: 'TypeScript', level: 'intermediate', category: 'frontend' },
      { id: '3', name: 'Node.js', level: 'advanced', category: 'backend' },
    ],
    experience: '3 года',
    mmr: 1850,
    pts: 2340,
    title: 'Активист',
    nftStickers: [
      { id: '1', name: 'First Win', imageUrl: '🏆', rarity: 'rare', earnedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    telegramId: '987654321',
    name: 'Мария Иванова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    bio: 'UI/UX дизайнер. Figma, Sketch, Adobe XD. Создаю красивые и удобные интерфейсы.',
    role: 'participant',
    status: 'looking',
    skills: [
      { id: '4', name: 'Figma', level: 'expert', category: 'design' },
      { id: '5', name: 'UI/UX', level: 'advanced', category: 'design' },
      { id: '6', name: 'Prototyping', level: 'advanced', category: 'design' },
    ],
    experience: '4 года',
    mmr: 2100,
    pts: 4500,
    title: 'Профи',
    nftStickers: [
      { id: '2', name: 'Design Master', imageUrl: '🎨', rarity: 'epic', earnedAt: new Date() },
      { id: '3', name: 'Team Player', imageUrl: '🤝', rarity: 'common', earnedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    telegramId: '456789123',
    name: 'Дмитрий Сидоров',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry',
    bio: 'Backend-разработчик. Go, Python, PostgreSQL. Архитектура высоконагруженных систем.',
    role: 'participant',
    status: 'looking',
    skills: [
      { id: '7', name: 'Go', level: 'expert', category: 'backend' },
      { id: '8', name: 'Python', level: 'advanced', category: 'backend' },
      { id: '9', name: 'PostgreSQL', level: 'advanced', category: 'backend' },
      { id: '10', name: 'Docker', level: 'intermediate', category: 'devops' },
    ],
    experience: '5 лет',
    mmr: 2350,
    pts: 6200,
    title: 'Легенда',
    nftStickers: [
      { id: '4', name: 'Backend God', imageUrl: '⚡', rarity: 'legendary', earnedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    telegramId: '789123456',
    name: 'Анна Козлова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
    bio: 'ML Engineer. TensorFlow, PyTorch. Специализируюсь на NLP и Computer Vision.',
    role: 'participant',
    status: 'looking',
    skills: [
      { id: '11', name: 'Python', level: 'expert', category: 'ml' },
      { id: '12', name: 'TensorFlow', level: 'advanced', category: 'ml' },
      { id: '13', name: 'PyTorch', level: 'advanced', category: 'ml' },
    ],
    experience: '2 года',
    mmr: 1950,
    pts: 1800,
    title: 'Активист',
    nftStickers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    telegramId: '321654987',
    name: 'Игорь Волков',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=igor',
    bio: 'Project Manager & Scrum Master. Помогу команде достичь целей!',
    role: 'participant',
    status: 'looking',
    skills: [
      { id: '14', name: 'Scrum', level: 'expert', category: 'management' },
      { id: '15', name: 'Jira', level: 'advanced', category: 'management' },
      { id: '16', name: 'Communication', level: 'expert', category: 'management' },
    ],
    experience: '6 лет',
    mmr: 2000,
    pts: 3200,
    title: 'Профи',
    nftStickers: [
      { id: '5', name: 'Leader', imageUrl: '👑', rarity: 'rare', earnedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    telegramId: '654987321',
    name: 'Елена Смирнова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    bio: 'Frontend разработчик. Vue.js, React, CSS animations. Люблю делать красиво!',
    role: 'participant',
    status: 'looking',
    skills: [
      { id: '17', name: 'Vue.js', level: 'advanced', category: 'frontend' },
      { id: '18', name: 'React', level: 'intermediate', category: 'frontend' },
      { id: '19', name: 'CSS', level: 'expert', category: 'frontend' },
    ],
    experience: '3 года',
    mmr: 1750,
    pts: 890,
    title: 'Участник',
    nftStickers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Hackathons
export const mockHackathons: Hackathon[] = [
  {
    id: 'hack-1',
    name: 'ITAM Tech Challenge 2024',
    description: 'Главный хакатон года! Создайте инновационное решение для образования.',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-17'),
    registrationDeadline: new Date('2024-12-10'),
    maxTeamSize: 5,
    minTeamSize: 2,
    status: 'registration',
    participantsCount: 156,
    teamsCount: 34,
    createdAt: new Date(),
  },
  {
    id: 'hack-2',
    name: 'AI & ML Hackathon',
    description: 'Разработайте AI-решение для реальных бизнес-задач.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-01-22'),
    registrationDeadline: new Date('2025-01-15'),
    maxTeamSize: 4,
    minTeamSize: 2,
    status: 'upcoming',
    participantsCount: 89,
    teamsCount: 21,
    createdAt: new Date(),
  },
  {
    id: 'hack-3',
    name: 'Green Tech Sprint',
    description: 'Экологические решения для устойчивого будущего.',
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800',
    startDate: new Date('2025-02-10'),
    endDate: new Date('2025-02-12'),
    registrationDeadline: new Date('2025-02-05'),
    maxTeamSize: 5,
    minTeamSize: 3,
    status: 'upcoming',
    participantsCount: 45,
    teamsCount: 12,
    createdAt: new Date(),
  },
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Code Warriors',
    hackathonId: 'hack-1',
    captainId: mockUsers[0].id,
    members: [
      { userId: mockUsers[0].id, user: mockUsers[0], role: 'captain', joinedAt: new Date() },
      { userId: mockUsers[1].id, user: mockUsers[1], role: 'member', joinedAt: new Date() },
    ],
    maxSize: 5,
    description: 'Команда опытных разработчиков',
    lookingFor: ['Backend Developer', 'ML Engineer'],
    createdAt: new Date(),
  },
];

// Mock Invites
export const mockInvites: Invite[] = [
  {
    id: 'invite-1',
    teamId: 'team-1',
    team: mockTeams[0],
    fromUserId: mockUsers[0].id,
    fromUser: mockUsers[0],
    toUserId: mockUsers[2].id,
    toUser: mockUsers[2],
    status: 'pending',
    message: 'Привет! Нам нужен крутой бэкендер. Присоединяйся!',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

// Current authenticated user (mock)
export const mockCurrentUser: User = {
  id: 'current-user',
  telegramId: '999999999',
  name: 'Вы',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
  bio: 'Расскажите о себе...',
  role: 'participant',
  status: 'looking',
  skills: [],
  experience: '',
  mmr: 1000,
  pts: 50,
  title: 'Новичок',
  nftStickers: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Admin user (mock)
export const mockAdminUser: User = {
  id: 'admin-user',
  email: 'admin@itam.courses',
  name: 'Администратор',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
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
