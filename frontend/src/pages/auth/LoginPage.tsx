import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { Loader2 } from 'lucide-react';

/**
 * LoginPage - Страница входа через Telegram (для участников)
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithTelegram, isLoading } = useAuthStore();
  const { theme } = useUIStore();
  
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleTelegramLogin = async () => {
    // Mock Telegram login
    await loginWithTelegram({
      id: 'tg-' + Date.now(),
      name: 'Пользователь ' + Math.floor(Math.random() * 1000),
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4" data-theme={theme}>
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          
          <h1 className="card-title text-2xl">Добро пожаловать!</h1>
          <p className="text-base-content/60 mb-6">
            Войдите, чтобы найти команду для хакатона
          </p>

          {/* Telegram Login Button */}
          <button 
            className="btn btn-primary btn-lg w-full gap-2"
            onClick={handleTelegramLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.25c-.15.67-.54.83-1.1.52l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.08 5.6-5.07c.24-.22-.05-.34-.37-.13l-6.92 4.36-2.98-.93c-.65-.2-.66-.65.14-.96l11.63-4.48c.54-.2 1.01.13.83.96z"/>
              </svg>
            )}
            Войти через Telegram
          </button>

          <div className="divider text-xs text-base-content/40">или</div>

          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(ROUTES.HOME)}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AdminLoginPage - Страница входа для администраторов
 */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAsAdmin, isLoading } = useAuthStore();
  const { theme } = useUIStore();
  
  const [email, setEmail] = useState('admin@itam.courses');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await loginAsAdmin(email, password);
    if (success) {
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4" data-theme={theme}>
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <form onSubmit={handleSubmit} className="card-body">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center">
              <span className="text-3xl">👑</span>
            </div>
          </div>
          
          <h1 className="card-title text-2xl justify-center">Админ-панель</h1>
          <p className="text-base-content/60 text-center mb-6">
            Введите учётные данные администратора
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              type="email" 
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Пароль</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            className="btn btn-secondary w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Войти'
            )}
          </button>

          <div className="divider text-xs text-base-content/40">Demo credentials</div>
          <p className="text-xs text-center text-base-content/40">
            Email: admin@itam.courses<br />
            Password: admin123
          </p>
        </form>
      </div>
    </div>
  );
}
