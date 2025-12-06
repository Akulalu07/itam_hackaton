import axiosClient, { tokenUtils } from './axiosClient';
import { User } from '../types';

// ============================================
// TYPES
// ============================================

export interface TelegramAuthData {
  initData: string;  // Raw initData string from Telegram WebApp
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

// ============================================
// TELEGRAM WEBAPP HELPERS
// ============================================

/**
 * Проверяет, запущено ли приложение внутри Telegram WebApp
 */
export const isTelegramWebApp = (): boolean => {
  return !!(window as any).Telegram?.WebApp?.initData;
};

/**
 * Получает initData из Telegram WebApp
 */
export const getTelegramInitData = (): string | null => {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg?.initData) return null;
  return tg.initData;
};

/**
 * Получает данные пользователя из Telegram WebApp
 */
export const getTelegramUser = () => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user || null;
};

/**
 * Инициализирует Telegram WebApp
 */
export const initTelegramWebApp = () => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    // Устанавливаем цвет header bar
    tg.setHeaderColor('#1D232A');
    tg.setBackgroundColor('#1D232A');
  }
};

/**
 * Показать главную кнопку Telegram
 */
export const showTelegramMainButton = (text: string, onClick: () => void) => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.MainButton) {
    tg.MainButton.text = text;
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  }
};

/**
 * Скрыть главную кнопку Telegram
 */
export const hideTelegramMainButton = () => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.MainButton) {
    tg.MainButton.hide();
  }
};

/**
 * Тактильный отклик Telegram
 * @param type - тип фидбэка: 
 *   - 'success' | 'error' | 'warning' - уведомления
 *   - 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' - удары
 *   - 'selection' - выбор
 */
export const telegramHapticFeedback = (
  type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'selection' = 'medium'
) => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    // Уведомления
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg.HapticFeedback.notificationOccurred(type);
    }
    // Выбор
    else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
    // Удары (impact)
    else {
      tg.HapticFeedback.impactOccurred(type);
    }
  }
};

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  /**
   * Авторизация через Telegram WebApp
   * Отправляет initData на бэкенд для верификации
   */
  loginWithTelegram: async (initData?: string): Promise<AuthResponse> => {
    const data = initData || getTelegramInitData();
    
    if (!data) {
      throw new Error('Telegram initData not available');
    }

    const response = await axiosClient.post<AuthResponse>('/auth/telegram', {
      initData: data,
    });

    // Сохраняем токен
    if (response.data.token) {
      tokenUtils.setToken(response.data.token);
      if (response.data.refreshToken) {
        tokenUtils.setRefreshToken(response.data.refreshToken);
      }
    }

    return response.data;
  },

  /**
   * Авторизация админа по email/password
   */
  loginAdmin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/admin', {
      email,
      password,
    });

    // Сохраняем токен
    if (response.data.token) {
      tokenUtils.setToken(response.data.token);
      if (response.data.refreshToken) {
        tokenUtils.setRefreshToken(response.data.refreshToken);
      }
    }

    return response.data;
  },

  /**
   * Выход из системы
   */
  logout: async (): Promise<void> => {
    try {
      // Попытка сделать запрос на сервер (для инвалидации токена)
      await axiosClient.post('/auth/logout');
    } catch (error) {
      // Игнорируем ошибки logout
      console.log('Logout request failed, clearing local tokens');
    } finally {
      tokenUtils.clearAll();
    }
  },

  /**
   * Обновление токена
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = tokenUtils.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axiosClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.token) {
      tokenUtils.setToken(response.data.token);
      if (response.data.refreshToken) {
        tokenUtils.setRefreshToken(response.data.refreshToken);
      }
    }

    return response.data;
  },

  /**
   * Проверка, авторизован ли пользователь
   */
  isAuthenticated: (): boolean => {
    return tokenUtils.isAuthenticated();
  },

  /**
   * Получение текущего токена
   */
  getToken: (): string | null => {
    return tokenUtils.getToken();
  },
};

export default authService;
