import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, 
  Trophy, 
  Star, 
  Sparkles, 
  Medal,
  ChevronRight,
  Settings,
  LogOut,
  Share2,
  BookCheck,
  Package,
  Gift
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { Badge, getTitleVariant } from '../../components/gamification/Badge';
import { getRarityColor } from '../../data/customization';
import { StickerShowcase } from '../../components/gamification/StickerSlot';
import { Portfolio } from '../../components/gamification/Portfolio';
import { QuizFlow } from '../../components/gamification/QuizFlow';
import { getTestBySkill } from '../../data/skillTests';

/**
 * UserProfile - Полный профиль пользователя с gamification элементами
 */
export function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'stickers' | 'history'>('stats');
  const [showQuiz, setShowQuiz] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const handleQuizComplete = () => {
    setShowQuiz(false);
    // PTS уже обновлен в QuizFlow
  };

  // Получаем стили кастомизации
  const customization = user.customization;
  
  // Фон профиля
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!customization?.background) {
      return {};
    }
    return {
      background: customization.background.value,
    };
  };
  
  // Стиль имени
  const getNameStyle = (): React.CSSProperties => {
    if (!customization?.nameColor) return {};
    const value = customization.nameColor.value;
    if (value.startsWith('linear-gradient')) {
      return {
        background: value,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return { color: value };
  };
  
  // Стиль рамки аватара
  const getFrameStyle = (): React.CSSProperties => {
    if (!customization?.avatarFrame) {
      return {};
    }
    const frame = customization.avatarFrame;
    return {
      boxShadow: `0 0 0 4px ${getRarityColor(frame.rarity)}, 0 0 20px ${getRarityColor(frame.rarity)}60`,
    };
  };

  return (
    <div className="min-h-screen bg-base-100 pb-24">
      {/* Quiz Modal */}
      {showQuiz && (
        <QuizFlow 
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* Header with gradient - с кастомизацией фона */}
      <div 
        className="pt-6 pb-20 px-4 relative"
        style={customization?.background ? getBackgroundStyle() : undefined}
      >
        {/* Default gradient если нет кастомного фона */}
        {!customization?.background && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20 pointer-events-none" />
        )}
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Мой профиль</h1>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-circle btn-sm">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Avatar and main info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="avatar">
                <div 
                  className="w-24 h-24 rounded-2xl ring-offset-2 ring-offset-base-100 shadow-xl"
                  style={customization?.avatarFrame ? getFrameStyle() : { boxShadow: '0 0 0 4px hsl(var(--p))' }}
                >
                  <img src={user.avatar} alt={user.name} className="rounded-2xl" />
                </div>
              </div>
              {/* Effect indicator */}
              {customization?.effect && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-warning text-xs items-center justify-center">✨</span>
                  </span>
                </div>
              )}
              <button 
                onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                className="absolute -bottom-2 -right-2 btn btn-primary btn-sm btn-circle shadow-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <h2 
                className="text-2xl font-bold"
                style={getNameStyle()}
              >
                {user.name}
              </h2>
              {/* Custom title or default badge */}
              {customization?.title ? (
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2"
                  style={{ 
                    backgroundColor: getRarityColor(customization.title.rarity) + '20',
                    color: getRarityColor(customization.title.rarity)
                  }}
                >
                  {customization.title.value}
                </span>
              ) : (
                <Badge 
                  variant={getTitleVariant(user.pts)} 
                  size="md" 
                  animated={user.pts >= 5000}
                  className="mt-2"
                />
              )}
            </div>
          </div>
          
          {/* Badges showcase */}
          {customization?.badges && customization.badges.length > 0 && (
            <div className="flex gap-2 mt-4">
              {customization.badges.slice(0, 3).map(badge => (
                <div 
                  key={badge.id}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl tooltip"
                  style={{ backgroundColor: getRarityColor(badge.rarity) + '20' }}
                  data-tip={badge.name}
                >
                  {badge.value}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats card - overlapping header */}
      <div className="px-4 -mt-12">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <div className="grid grid-cols-3 divide-x divide-base-300">
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-warning">{user.pts.toLocaleString()}</p>
                <p className="text-xs text-base-content/60">PTS</p>
              </div>
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold">{user.mmr.toLocaleString()}</p>
                <p className="text-xs text-base-content/60">MMR</p>
              </div>
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Medal className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{user.nftStickers?.length || 0}</p>
                <p className="text-xs text-base-content/60">Стикеры</p>
              </div>
            </div>

            {/* Calibration button */}
            {user.pts < 100 && (
              <button 
                onClick={() => setShowQuiz(true)}
                className="btn btn-primary btn-block mt-4"
              >
                <Star className="w-5 h-5" />
                Пройти калибровку PTS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="tabs tabs-boxed bg-base-200 p-1">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`tab flex-1 ${activeTab === 'stats' ? 'tab-active' : ''}`}
          >
            Профиль
          </button>
          <button 
            onClick={() => setActiveTab('stickers')}
            className={`tab flex-1 ${activeTab === 'stickers' ? 'tab-active' : ''}`}
          >
            Стикеры
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`tab flex-1 ${activeTab === 'history' ? 'tab-active' : ''}`}
          >
            История
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 mt-4">
        {/* Stats tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Bio */}
            {user.bio && (
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-2">О себе</h3>
                  <p className="text-base-content/80">{user.bio}</p>
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Навыки</h3>
                  <button 
                    onClick={() => navigate(ROUTES.SKILL_TESTS)}
                    className="btn btn-ghost btn-xs"
                  >
                    Подтвердить навык
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => {
                    const hasTest = !!getTestBySkill(skill.name);
                    const isVerified = skill.verified;
                    return (
                      <button 
                        key={skill.id}
                        onClick={() => hasTest && navigate(`${ROUTES.SKILL_TESTS}?skill=${encodeURIComponent(skill.name)}`)}
                        className={`badge badge-lg gap-1 ${
                          skill.level === 'expert' ? 'badge-warning' :
                          skill.level === 'advanced' ? 'badge-success' :
                          skill.level === 'intermediate' ? 'badge-info' : 'badge-ghost'
                        } ${hasTest ? 'cursor-pointer hover:opacity-80' : ''}`}
                        title={isVerified ? 'Навык подтверждён' : hasTest ? 'Нажмите для прохождения теста' : ''}
                      >
                        {isVerified && <Star className="w-3 h-3" />}
                        {skill.name}
                      </button>
                    );
                  })}
                  {user.skills.length === 0 && (
                    <p className="text-base-content/60 text-sm">Навыки не указаны</p>
                  )}
                </div>
                {user.skills.some(s => !s.verified && getTestBySkill(s.name)) && (
                  <p className="text-xs text-base-content/60 mt-2">
                    💡 Нажмите на навык, чтобы подтвердить его тестом
                  </p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h3 className="font-semibold mb-2">Опыт</h3>
                <p className="text-base-content/80">{user.experience || 'Не указан'}</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <button 
                onClick={() => navigate(ROUTES.PROFILE_EDIT)}
                className="btn btn-ghost justify-between w-full"
              >
                <span className="flex items-center gap-3">
                  <Edit2 className="w-5 h-5" />
                  Редактировать профиль
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => navigate(ROUTES.SKILL_TESTS)}
                className="btn btn-ghost justify-between w-full"
              >
                <span className="flex items-center gap-3">
                  <BookCheck className="w-5 h-5" />
                  Тесты на навыки
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button 
                onClick={() => navigate(ROUTES.INVENTORY)}
                className="btn btn-ghost justify-between w-full"
              >
                <span className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  Инвентарь и кастомизация
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button 
                onClick={() => navigate(ROUTES.INVENTORY + '?tab=cases')}
                className="btn btn-ghost justify-between w-full"
              >
                <span className="flex items-center gap-3">
                  <Gift className="w-5 h-5" />
                  Мои кейсы
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setShowQuiz(true)}
                className="btn btn-ghost justify-between w-full"
              >
                <span className="flex items-center gap-3">
                  <Star className="w-5 h-5" />
                  Пересдать калибровку
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button 
                onClick={handleLogout}
                className="btn btn-ghost justify-between w-full text-error"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Выйти из аккаунта
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stickers tab */}
        {activeTab === 'stickers' && (
          <div className="card bg-base-200">
            <div className="card-body">
              <StickerShowcase stickers={user.nftStickers || []} />
            </div>
          </div>
        )}

        {/* History tab - показываем реальную историю (пустую для новых пользователей) */}
        {activeTab === 'history' && (
          <Portfolio history={[]} />
        )}
      </div>
    </div>
  );
}
