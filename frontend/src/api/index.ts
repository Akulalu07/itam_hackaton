// API Layer - центральный экспорт
export { default as axiosClient } from './axiosClient';
export * from './authService';
export * from './services';

// Re-export типы для удобства
export type { UpdateProfileData, CreateHackathonData, CreateTeamData, SwipeResponse, AdminStats } from './services';
