import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import axiosClient from '../../api/axiosClient';

const TELEGRAM_BOT_USERNAME = 'itam_chan_bot';

/**
 * TokenAuthPage - Страница авторизации по токену от TG бота
 * 
 * Флоу:
 * 1. Пользователь нажимает "Войти через Telegram" → открывается бот
 * 2. Бот выдаёт токен (действует 10 минут)
 * 3. Пользователь вводит токен на этой странице ИЛИ переходит по ссылке с токеном
 * 4. Фронтенд отправляет токен на /api/token
 * 5. Бэкенд возвращает JWT → пользователь авторизован
 */
export function TokenAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Проверяем токен из URL параметра
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setTokenInput(tokenFromUrl);
      handleSubmit(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (token?: string) => {
    const tokenToUse = token || tokenInput.trim();
    
    if (!tokenToUse) {
      setError('Введите токен');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/api/token', { token: tokenToUse });
      
      if (response.data.token && response.data.user) {
        // Сохраняем JWT токен
        setToken(response.data.token);
        
        // Сохраняем данные пользователя
        setUser({
          id: response.data.user.id.toString(),
          name: response.data.user.name || response.data.name,
          telegramId: response.data.user.telegramId?.toString(),
          role: response.data.user.role || 'participant',
          status: 'looking',
          skills: [],
          experience: '',
          mmr: 1000,
          pts: 0,
          title: 'Новичок',
          nftStickers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setSuccess(true);
        
        // Редирект через 1.5 сек
        setTimeout(() => {
          if (response.data.isNewUser) {
            navigate(ROUTES.PROFILE_EDIT, { replace: true });
          } else {
            navigate(ROUTES.DASHBOARD, { replace: true });
          }
        }, 1500);
      } else {
        setError('Некорректный ответ сервера');
      }
    } catch (err: any) {
      console.error('Token auth error:', err);
      if (err.response?.status === 400) {
        setError('Неверный или истёкший токен. Получите новый в боте.');
      } else {
        setError('Ошибка авторизации. Попробуйте снова.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openTelegramBot = () => {
    window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=login`, '_blank');
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://t.me/${TELEGRAM_BOT_USERNAME}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-base-content/60">Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-primary/20 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-lg mb-8">
          <span className="text-4xl">🔐</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Авторизация</h1>
        <p className="text-base-content/60 text-center mb-8 max-w-sm">
          Получите токен в Telegram боте и введите его ниже
        </p>

        {/* Step 1: Open bot */}
        <div className="w-full max-w-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="font-medium">Откройте бота</span>
          </div>
          
          <button
            onClick={openTelegramBot}
            className="btn btn-outline btn-primary w-full gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.25c-.15.67-.54.83-1.1.52l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.08 5.6-5.07c.24-.22-.05-.34-.37-.13l-6.92 4.36-2.98-.93c-.65-.2-.66-.65.14-.96l11.63-4.48c.54-.2 1.01.13.83.96z"/>
            </svg>
            Открыть @{TELEGRAM_BOT_USERNAME}
          </button>
          
          <button
            onClick={copyBotLink}
            className="btn btn-ghost btn-xs w-full mt-2 gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Скопировано!' : 'Скопировать ссылку'}
          </button>
        </div>

        {/* Step 2: Get token */}
        <div className="w-full max-w-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="font-medium">Отправьте команду /login</span>
          </div>
          <p className="text-sm text-base-content/50 ml-8">
            Бот выдаст вам уникальный токен для входа
          </p>
        </div>

        {/* Step 3: Enter token */}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="font-medium">Введите токен</span>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Введите токен"
              className={`input input-bordered w-full text-center text-xl tracking-wider font-mono ${
                error ? 'input-error' : ''
              }`}
              maxLength={20}
              disabled={isLoading}
            />
            
            {error && (
              <div className="flex items-center gap-2 text-error text-sm">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !tokenInput.trim()}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Проверка...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <p className="text-xs text-base-content/40 text-center mt-8 max-w-xs">
          Токен действителен 10 минут. После входа он станет недействительным.
        </p>
      </div>
    </div>
  );
}

export default TokenAuthPage;
