import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';
import { ROUTES } from '../../routes';
import { useAuthStore, useUIStore } from '../../store/useStore';
import axiosClient from '../../api/axiosClient';

/**
 * AdminPasswordPage - Страница ввода пароля администратора
 * Доступна только после ввода секретной команды /login-admin
 */
export function AdminPasswordPage() {
  const navigate = useNavigate();
  const { theme } = useUIStore();
  const { setUser, setToken } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/admin/api/login', { password });
      
      if (response.data.token && response.data.user) {
        setToken(response.data.token);
        setUser({
          id: String(response.data.user.id),
          name: response.data.user.name,
          role: 'admin',
          status: 'inactive',
          skills: [],
          experience: '',
          mmr: 0,
          pts: 0,
          title: 'Легенда',
          nftStickers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        navigate(ROUTES.ADMIN_DASHBOARD);
      }
    } catch (err: any) {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        setError('Превышено количество попыток. Возврат на главную...');
        setTimeout(() => {
          navigate(ROUTES.HOME);
        }, 2000);
      } else {
        setError(`Неверный пароль. Осталось попыток: ${2 - attempts}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4" data-theme={theme}>
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <button 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-warning" />
              <h2 className="card-title text-lg">Вход в панель администратора</h2>
            </div>
          </div>

          {/* Info */}
          <div className="alert alert-warning mb-4">
            <Lock className="w-5 h-5" />
            <span className="text-sm">
              Доступ ограничен. Введите пароль администратора для продолжения.
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Пароль администратора</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль..."
                  className={`input input-bordered w-full pr-12 ${error ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading || attempts >= 3}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!password || isLoading || attempts >= 3}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Проверка...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Войти в админ-панель
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <div className="text-center mt-4 text-xs text-base-content/50">
            Забыли пароль? Обратитесь к главному администратору.
          </div>
        </div>
      </div>
    </div>
  );
}
