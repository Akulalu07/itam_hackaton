import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Heart, 
  User, 
  Mail,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/useStore';
import { ROUTES } from '../routes';
import { useState } from 'react';

/**
 * MainLayout - Основной layout для участников (Mobile-First)
 * Включает нижнюю навигацию для мобильных устройств
 */
export function MainLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { to: ROUTES.DASHBOARD, icon: Home, label: 'Главная' },
    { to: ROUTES.SWIPE, icon: Heart, label: 'Поиск', show: user?.role === 'captain' },
    { to: ROUTES.MY_TEAM, icon: Users, label: 'Команда' },
    { to: ROUTES.INVITES, icon: Mail, label: 'Инвайты' },
    { to: ROUTES.PROFILE, icon: User, label: 'Профиль' },
  ].filter(item => item.show !== false);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col" data-theme={theme}>
      {/* Header - Mobile */}
      <header className="navbar bg-base-200 sticky top-0 z-50 lg:hidden">
        <div className="flex-1">
          <span className="text-xl font-bold text-primary">ITAM Hack</span>
        </div>
        <div className="flex-none">
          <button 
            className="btn btn-ghost btn-circle"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-16 right-0 left-0 bg-base-200 z-40 p-4 shadow-lg lg:hidden animate-fade-in">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={user?.avatar} alt={user?.name} />
                </div>
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-base-content/60">{user?.title}</p>
              </div>
            </div>
            
            <label className="flex items-center gap-3 p-3 cursor-pointer">
              <span>Тёмная тема</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={theme === 'itamhack'}
                onChange={toggleTheme}
              />
            </label>
            
            <button 
              className="btn btn-error btn-outline"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <aside className="w-64 bg-base-200 min-h-screen fixed left-0 top-0 p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">ITAM Hack</h1>
            <p className="text-sm text-base-content/60">Team Formation Platform</p>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg mb-6">
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img src={user?.avatar} alt={user?.name} />
              </div>
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-sm">{user?.pts} PTS</span>
                <span className="text-xs text-base-content/60">{user?.title}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
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
          <div className="absolute bottom-4 left-4 right-4">
            <label className="flex items-center justify-between p-3 cursor-pointer">
              <span className="text-sm">Тема</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary toggle-sm" 
                checked={theme === 'itamhack'}
                onChange={toggleTheme}
              />
            </label>
            <button 
              className="btn btn-ghost btn-block justify-start"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-4">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="btm-nav btm-nav-sm bg-base-200 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'active text-primary' : 'text-base-content/60'
            }
          >
            <item.icon size={20} />
            <span className="btm-nav-label text-xs">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
