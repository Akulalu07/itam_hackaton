import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'participant' | 'captain' | 'admin';
}

/**
 * PrivateRoute - Защищённый маршрут для авторизованных пользователей
 * Перенаправляет на страницу входа, если пользователь не авторизован
 */
export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Сохраняем текущий путь для редиректа после авторизации
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка роли, если требуется
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * AdminRoute - Защищённый маршрут только для администраторов
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
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

  // Если пользователь авторизован - редирект на дашборд
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname || 
      (user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

/**
 * OnboardingGuard - Проверяет заполненность профиля
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем, выбран ли хакатон
  if (!user.currentHackathonId) {
    return <Navigate to="/select-hackathon" replace />;
  }

  // Проверяем, заполнен ли профиль
  if (!user.skills.length || !user.bio || !user.experience) {
    return <Navigate to="/profile/edit" replace />;
  }

  return <>{children}</>;
}
