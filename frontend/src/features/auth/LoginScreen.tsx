import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Users, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { useInitTelegramAuth } from '../../store/apiHooks';
import { isTelegramWebApp, getTelegramInitData, initTelegramWebApp } from '../../api';
import { ROUTES } from '../../routes';

/**
 * LoginScreen - Экран входа с кнопкой "Войти через Telegram"
 * Mobile-first дизайн с градиентным фоном
 * 
 * При загрузке внутри Telegram WebApp - автоматически авторизуется
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const { loginWithTelegram, isLoading, isAuthenticated } = useAuthStore();
  const { initAuth } = useInitTelegramAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Автоматический вход через Telegram WebApp
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // Проверяем, запущено ли внутри Telegram
      if (!isTelegramWebApp()) {
        console.log('Not in Telegram WebApp, showing manual login');
        setAutoLoginAttempted(true);
        return;
      }

      // Инициализируем Telegram WebApp
      initTelegramWebApp();

      // Получаем initData
      const initData = getTelegramInitData();
      if (!initData) {
        console.log('No initData available');
        setAutoLoginAttempted(true);
        return;
      }

      setIsAnimating(true);
      
      try {
        // Пробуем авторизоваться через API
        const success = await initAuth();
        
        if (success) {
          // Успешно - переходим к профилю
          navigate(ROUTES.PROFILE_EDIT, { replace: true });
        } else {
          // Фоллбэк на mock логин
          console.log('API auth failed, using mock login');
          await loginWithTelegram();
          navigate(ROUTES.PROFILE_EDIT, { replace: true });
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        // Фоллбэк на ручной вход
        setIsAnimating(false);
      } finally {
        setAutoLoginAttempted(true);
      }
    };

    if (!autoLoginAttempted && !isAuthenticated) {
      attemptAutoLogin();
    }
  }, [autoLoginAttempted, isAuthenticated, initAuth, loginWithTelegram, navigate]);

  // Если уже авторизованы - редиректим
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.PROFILE_EDIT, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTelegramLogin = async () => {
    // Если внутри Telegram WebApp - пробуем автоматическую авторизацию
    if (isTelegramWebApp()) {
      setIsAnimating(true);
      const success = await initAuth();
      if (success) {
        navigate(ROUTES.PROFILE_EDIT, { replace: true });
        return;
      }
      setIsAnimating(false);
    }
    
    // Иначе - переходим на страницу авторизации через токен
    navigate(ROUTES.TOKEN_AUTH);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-primary/20 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
            <span className="text-5xl">🚀</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-content" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ITAM Courses Hack
          </span>
        </h1>
        <p className="text-base-content/70 text-center max-w-xs mb-8">
          Найди идеальную команду для хакатона с помощью умного мэтчинга
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
          <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Свайпай тиммейтов</p>
          </div>
          <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-sm font-medium">Зарабатывай рейтинг</p>
          </div>
        </div>

        {/* Telegram Login Button */}
        <button
          onClick={handleTelegramLogin}
          disabled={isLoading || isAnimating}
          className={`btn btn-lg w-full max-w-sm gap-3 text-white border-0 ${
            isLoading || isAnimating 
              ? 'bg-[#0088cc]/70' 
              : 'bg-[#0088cc] hover:bg-[#0077b5] active:scale-95'
          } transition-all duration-200 shadow-lg shadow-[#0088cc]/30`}
        >
          {isLoading || isAnimating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.25c-.15.67-.54.83-1.1.52l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.08 5.6-5.07c.24-.22-.05-.34-.37-.13l-6.92 4.36-2.98-.93c-.65-.2-.66-.65.14-.96l11.63-4.48c.54-.2 1.01.13.83.96z"/>
            </svg>
          )}
          {isLoading || isAnimating ? 'Подключение...' : 'Войти через Telegram'}
        </button>

        {/* Terms */}
        <p className="text-xs text-base-content/50 text-center mt-4 max-w-xs">
          Нажимая кнопку, вы соглашаетесь с условиями использования сервиса
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="h-24 bg-gradient-to-t from-primary/10 to-transparent" />
    </div>
  );
}
