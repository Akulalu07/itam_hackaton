// ============================================
// ROUTE CONSTANTS
// ============================================

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  TOKEN_AUTH: '/auth/token',
  
  // Participant routes
  DASHBOARD: '/dashboard',
  SELECT_HACKATHON: '/select-hackathon',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  SKILL_TESTS: '/skill-tests',
  INVENTORY: '/inventory',
  
  // Captain routes
  CREATE_TEAM: '/team/create',
  SWIPE: '/swipe',
  MY_TEAM: '/team',
  TEAM_MANAGE: '/team/manage',
  
  // Member routes
  INVITES: '/invites',
  
  // Admin routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_PASSWORD: '/admin/password',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_HACKATHONS: '/admin/hackathons',
  ADMIN_HACKATHON_CREATE: '/admin/hackathons/create',
  ADMIN_HACKATHON_EDIT: '/admin/hackathons/:id/edit',
  ADMIN_PARTICIPANTS: '/admin/participants',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_CASES: '/admin/cases',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
