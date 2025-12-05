import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Calendar,
  Users,
  UsersRound,
  BarChart3,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/useStore';
import { ROUTES } from '../routes';

/**
 * AdminLayout - Layout для административной панели (Desktop-First)
 */
export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const navItems = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Дашборд' },
    { to: ROUTES.ADMIN_HACKATHONS, icon: Calendar, label: 'Хакатоны' },
    { to: ROUTES.ADMIN_PARTICIPANTS, icon: Users, label: 'Участники' },
    { to: ROUTES.ADMIN_TEAMS, icon: UsersRound, label: 'Команды' },
    { to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, label: 'Аналитика' },
  ];

  return (
    <div className="min-h-screen bg-base-100 flex" data-theme={theme}>
      {/* Sidebar */}
      <aside className="w-64 bg-base-200 min-h-screen fixed left-0 top-0 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">ITAM Admin</h1>
          <p className="text-sm text-base-content/60">Панель управления</p>
        </div>

        {/* Admin Info */}
        <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg mb-6">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content w-10 rounded-full">
              <span className="text-lg">A</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <span className="badge badge-secondary badge-sm">Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-300'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-base-300 pt-4 mt-4">
          <button 
            className="btn btn-ghost btn-block justify-start mb-2"
            onClick={toggleTheme}
          >
            {theme === 'itamhack' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'itamhack' ? 'Светлая тема' : 'Тёмная тема'}
          </button>
          <button 
            className="btn btn-ghost btn-block justify-start text-error"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
