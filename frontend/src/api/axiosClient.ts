import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Получаем базовый URL из переменных окружения
// В продакшене через nginx все /api/* запросы проксируются на backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

// Ключ для хранения токена в localStorage
export const TOKEN_KEY = 'itam_hack_token';
export const REFRESH_TOKEN_KEY = 'itam_hack_refresh_token';

/**
 * Axios instance с настроенным baseURL и interceptors
 */
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor - добавляет JWT токен к каждому запросу
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логирование в dev режиме
    if ((import.meta as any).env?.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - обработка ошибок
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    
    // Если получили 401 - токен истёк или невалидный
    // НЕ удаляем токены автоматически - пользователь сам выйдет или получит новый токен
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized - token may be expired');
      // Не очищаем localStorage - сохраняем локальные данные пользователя
      return Promise.reject(new Error('Unauthorized - Please login again'));
    }
    
    // Если 403 - недостаточно прав
    if (error.response?.status === 403) {
      console.error('[API] Access forbidden');
      return Promise.reject(new Error('Access forbidden'));
    }
    
    // Если 500+ - серверная ошибка
    if (error.response?.status && error.response.status >= 500) {
      console.error('[API] Server error:', error.response.status);
      return Promise.reject(new Error('Server error - Please try again later'));
    }
    
    // Если нет ответа от сервера (сеть)
    if (!error.response) {
      console.error('[API] Network error');
      return Promise.reject(new Error('Network error - Please check your connection'));
    }
    
    // Возвращаем оригинальную ошибку с данными от сервера
    const errorMessage = (error.response.data as any)?.error || 
                         (error.response.data as any)?.message || 
                         'An error occurred';
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Хелперы для работы с токеном
 */
export const tokenUtils = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};

export default axiosClient;
