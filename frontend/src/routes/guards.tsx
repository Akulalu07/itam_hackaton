import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { tokenUtils } from '../api/axiosClient';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'participant' | 'captain' | 'admin';
}

/**
 * PrivateRoute - Защищённый маршрут для авторизованных пользователей
 * 
 * STRICT SECURITY:
 * - Проверяет наличие JWT токена в localStorage
 * - Проверяет состояние авторизации в Zustand store
 * - Перенаправляет на /login если пользователь не авторизован
 * - Поддерживает ролевой доступ (participant, captain, admin)
 */
export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const [isHydrated, setIsHydrated] = useState(false);

  // Ждём пока Zustand восстановит состояние из localStorage
  useEffect(() => {
    // Небольшая задержка чтобы zustand persist успел восстановить состояние
    const timer = setTimeout(() => setIsHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Проверяем наличие токена в localStorage
  const token = tokenUtils.getToken();
  const hasValidToken = !!token;

  // Если токен отсутствует - разлогиниваем и редиректим
  useEffect(() => {
    if (isHydrated && !hasValidToken && isAuthenticated) {
      // Токен был удалён (например, истёк) - разлогиниваем
      logout();
    }
  }, [hasValidToken, isAuthenticated, logout, isHydrated]);

  // Показываем загрузку пока store не восстановлен
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // STRICT CHECK: Нет токена ИЛИ не авторизован ИЛИ нет пользователя
  if (!hasValidToken || !isAuthenticated || !user) {
    // Сохраняем текущий путь для редиректа после авторизации
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка роли, если требуется
  if (requiredRole) {
    const userRole = user.role;
    
    // Admin имеет доступ везде
    if (userRole === 'admin') {
      return <>{children}</>;
    }
    
    // Проверяем соответствие роли
    if (userRole !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

/**
 * AdminRoute - Защищённый маршрут только для администраторов
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const token = tokenUtils.getToken();
  const hasValidToken = !!token;

  useEffect(() => {
    if (isHydrated && !hasValidToken && isAuthenticated) {
      logout();
    }
  }, [hasValidToken, isAuthenticated, logout, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!hasValidToken || !isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * PublicRoute - Публичный маршрут, редиректит авторизованных на dashboard
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const token = tokenUtils.getToken();
  const hasValidToken = !!token;

  // Если пользователь авторизован И имеет валидный токен - редирект на дашборд
  if (isAuthenticated && user && hasValidToken) {
    const from = location.state?.from?.pathname || 
      (user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

/**
 * OnboardingGuard - Проверяет заполненность профиля
 * Редиректит на страницу настройки профиля если профиль не заполнен
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем, заполнены ли минимально необходимые данные профиля
  const isProfileComplete = checkProfileComplete(user);

  if (!isProfileComplete) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
}

/**
 * Проверяет заполненность профиля пользователя
 */
function checkProfileComplete(user: { 
  name?: string; 
  skills?: any[]; 
  bio?: string; 
  experience?: string 
}): boolean {
  // Минимальные требования для заполненного профиля:
  // 1. Есть имя (обычно приходит из TG)
  
  if (!user.name || user.name.trim() === '') {
    return false;
  }

  // Для MVP считаем профиль заполненным если есть имя
  // В продакшене можно требовать больше полей:
  // - user.skills && user.skills.length > 0
  // - user.bio && user.bio.trim().length > 0
  // - user.experience && user.experience.trim().length > 0
  
  return true;
}

/**
 * HackathonGuard - Проверяет выбран ли хакатон
 * Редиректит на страницу выбора хакатона если не выбран
 */
export function HackathonGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем, выбран ли хакатон
  if (!user.currentHackathonId) {
    return <Navigate to="/hackathons" replace />;
  }

  return <>{children}</>;
}
