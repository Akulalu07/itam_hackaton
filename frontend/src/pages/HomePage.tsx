import { useNavigate } from 'react-router-dom';
import { Rocket, Users, Trophy, Sparkles } from 'lucide-react';
import { ROUTES } from '../routes';
import { useUIStore } from '../store/useStore';

/**
 * HomePage - Лендинг страница приложения
 */
export function HomePage() {
  const navigate = useNavigate();
  const { theme } = useUIStore();

  return (
    <div className="min-h-screen bg-base-100" data-theme={theme}>
      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
                <Rocket className="w-10 h-10 text-primary-content" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ITAM Courses Hack
            </h1>
            
            <p className="py-6 text-lg text-base-content/70">
              Платформа для формирования команд на хакатоны. 
              Найди идеальных тиммейтов с помощью умного мэтчинга!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn btn-primary btn-lg gap-2"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-1.97 9.25c-.15.67-.54.83-1.1.52l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.08 5.6-5.07c.24-.22-.05-.34-.37-.13l-6.92 4.36-2.98-.93c-.65-.2-.66-.65.14-.96l11.63-4.48c.54-.2 1.01.13.83.96z"/>
                </svg>
                Войти через Telegram
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="card bg-base-200">
                <div className="card-body items-center text-center">
                  <Users className="w-12 h-12 text-primary mb-2" />
                  <h3 className="card-title text-lg">Умный поиск</h3>
                  <p className="text-sm text-base-content/60">
                    Свайпай карточки участников как в Tinder
                  </p>
                </div>
              </div>
              
              <div className="card bg-base-200">
                <div className="card-body items-center text-center">
                  <Trophy className="w-12 h-12 text-secondary mb-2" />
                  <h3 className="card-title text-lg">Рейтинг</h3>
                  <p className="text-sm text-base-content/60">
                    Зарабатывай очки и повышай свой статус
                  </p>
                </div>
              </div>
              
              <div className="card bg-base-200">
                <div className="card-body items-center text-center">
                  <Sparkles className="w-12 h-12 text-accent mb-2" />
                  <h3 className="card-title text-lg">NFT Стикеры</h3>
                  <p className="text-sm text-base-content/60">
                    Коллекционируй достижения
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
