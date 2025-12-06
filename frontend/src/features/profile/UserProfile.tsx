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
  Share2
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { Badge, getTitleVariant } from '../../components/gamification/Badge';
import { StickerShowcase } from '../../components/gamification/StickerSlot';
import { Portfolio, mockHackathonHistory } from '../../components/gamification/Portfolio';
import { QuizFlow } from '../../components/gamification/QuizFlow';

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

  return (
    <div className="min-h-screen bg-base-100 pb-24">
      {/* Quiz Modal */}
      {showQuiz && (
        <QuizFlow 
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20 pt-6 pb-20 px-4">
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
              <div className="w-24 h-24 rounded-2xl ring-4 ring-primary ring-offset-2 ring-offset-base-100 shadow-xl">
                <img src={user.avatar} alt={user.name} />
              </div>
            </div>
            <button 
              onClick={() => navigate(ROUTES.PROFILE_EDIT)}
              className="absolute -bottom-2 -right-2 btn btn-primary btn-sm btn-circle shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <Badge 
              variant={getTitleVariant(user.pts)} 
              size="md" 
              animated={user.pts >= 5000}
              className="mt-2"
            />
          </div>
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
                <h3 className="font-semibold mb-3">Навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => (
                    <span 
                      key={skill.id}
                      className={`badge badge-lg ${
                        skill.level === 'expert' ? 'badge-warning' :
                        skill.level === 'advanced' ? 'badge-success' :
                        skill.level === 'intermediate' ? 'badge-info' : 'badge-ghost'
                      }`}
                    >
                      {skill.name}
                    </span>
                  ))}
                  {user.skills.length === 0 && (
                    <p className="text-base-content/60 text-sm">Навыки не указаны</p>
                  )}
                </div>
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

        {/* History tab */}
        {activeTab === 'history' && (
          <Portfolio history={mockHackathonHistory} />
        )}
      </div>
    </div>
  );
}
