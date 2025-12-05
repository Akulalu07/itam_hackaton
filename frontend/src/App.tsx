import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUIStore } from './store/useStore';
import { ROUTES, PrivateRoute, AdminRoute, PublicRoute } from './routes';
import { MainLayout, AdminLayout } from './layouts';

// Pages
import { 
  HomePage,
  LoginPage, 
  AdminLoginPage,
  DashboardPage,
  SelectHackathonPage,
  ProfilePage,
  ProfileEditPage,
  CreateTeamPage,
  SwipePage,
  TeamPage,
  TeamManagePage,
  InvitesPage,
  AdminDashboardPage,
  AdminHackathonsPage,
  AdminHackathonCreatePage,
  AdminHackathonEditPage,
  AdminParticipantsPage,
  AdminTeamsPage,
  AdminAnalyticsPage,
} from './pages';

function App() {
  const { theme } = useUIStore();

  return (
    <div data-theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* ================================ */}
          {/* PUBLIC ROUTES */}
          {/* ================================ */}
          
          {/* Home / Landing */}
          <Route 
            path={ROUTES.HOME} 
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            } 
          />
          
          {/* Participant Login (Telegram) */}
          <Route 
            path={ROUTES.LOGIN} 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* Admin Login */}
          <Route 
            path={ROUTES.ADMIN_LOGIN} 
            element={
              <PublicRoute>
                <AdminLoginPage />
              </PublicRoute>
            } 
          />

          {/* ================================ */}
          {/* PARTICIPANT ROUTES (Protected) */}
          {/* ================================ */}
          
          <Route 
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* Dashboard */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            
            {/* Hackathon Selection */}
            <Route path={ROUTES.SELECT_HACKATHON} element={<SelectHackathonPage />} />
            
            {/* Profile */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.PROFILE_EDIT} element={<ProfileEditPage />} />
            
            {/* Team Creation (becomes Captain) */}
            <Route path={ROUTES.CREATE_TEAM} element={<CreateTeamPage />} />
            
            {/* Captain: Swipe Interface */}
            <Route 
              path={ROUTES.SWIPE} 
              element={
                <PrivateRoute requiredRole="captain">
                  <SwipePage />
                </PrivateRoute>
              } 
            />
            
            {/* Team Management */}
            <Route path={ROUTES.MY_TEAM} element={<TeamPage />} />
            <Route 
              path={ROUTES.TEAM_MANAGE} 
              element={
                <PrivateRoute requiredRole="captain">
                  <TeamManagePage />
                </PrivateRoute>
              } 
            />
            
            {/* Invites */}
            <Route path={ROUTES.INVITES} element={<InvitesPage />} />
          </Route>

          {/* ================================ */}
          {/* ADMIN ROUTES (Protected) */}
          {/* ================================ */}
          
          <Route 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_HACKATHONS} element={<AdminHackathonsPage />} />
            <Route path={ROUTES.ADMIN_HACKATHON_CREATE} element={<AdminHackathonCreatePage />} />
            <Route path={ROUTES.ADMIN_HACKATHON_EDIT} element={<AdminHackathonEditPage />} />
            <Route path={ROUTES.ADMIN_PARTICIPANTS} element={<AdminParticipantsPage />} />
            <Route path={ROUTES.ADMIN_TEAMS} element={<AdminTeamsPage />} />
            <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
          </Route>

          {/* ================================ */}
          {/* FALLBACK */}
          {/* ================================ */}
          
          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
