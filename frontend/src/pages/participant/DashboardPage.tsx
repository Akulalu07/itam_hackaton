import { useNavigate } from 'react-router-dom';
import { Users, Mail, User, Trophy, Zap } from 'lucide-react';
import { useAuthStore, useHackathonStore, useInviteStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { useEffect } from 'react';

/**
 * DashboardPage - Главная страница для участника
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { user, becomeCaptain } = useAuthStore();
  const { selectedHackathon, fetchHackathons, hackathons, selectHackathon } = useHackathonStore();
  const { invites, fetchInvites } = useInviteStore();

  useEffect(() => {
    fetchHackathons();
    fetchInvites();
  }, []);

  useEffect(() => {
    if (hackathons.length > 0 && !selectedHackathon) {
      selectHackathon(hackathons[0].id);
    }
  }, [hackathons]);

  const handleCreateTeam = () => {
    becomeCaptain();
    navigate(ROUTES.CREATE_TEAM);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Привет, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-base-content/60">Готов найти команду мечты?</p>
      </div>

      {/* Current Hackathon Card */}
      {selectedHackathon && (
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-6">
          <div className="card-body">
            <h2 className="card-title text-lg">{selectedHackathon.name}</h2>
            <p className="text-sm opacity-80">
              {new Date(selectedHackathon.startDate).toLocaleDateString('ru-RU')} - {new Date(selectedHackathon.endDate).toLocaleDateString('ru-RU')}
            </p>
            <div className="flex gap-4 mt-2">
              <div className="stat-value text-2xl">{selectedHackathon.participantsCount}</div>
              <div className="stat-value text-2xl">{selectedHackathon.teamsCount}</div>
            </div>
            <div className="flex gap-4 text-xs opacity-80">
              <span>участников</span>
              <span>команд</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6 bg-base-200">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="stat-title">Рейтинг</div>
          <div className="stat-value text-primary">{user?.pts}</div>
          <div className="stat-desc">PTS</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <Zap className="w-8 h-8" />
          </div>
          <div className="stat-title">MMR</div>
          <div className="stat-value text-secondary">{user?.mmr}</div>
          <div className="stat-desc">{user?.title}</div>
        </div>
      </div>

      {/* Action Cards */}
      <h2 className="text-lg font-semibold mb-4">Что хотите сделать?</h2>
      
      <div className="grid gap-4">
        {/* Create Team Card */}
        <div 
          className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
          onClick={handleCreateTeam}
        >
          <div className="card-body flex-row items-center">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="font-semibold">Создать команду</h3>
              <p className="text-sm text-base-content/60">Стать капитаном и набрать тиммейтов</p>
            </div>
            <div className="badge badge-primary">Капитан</div>
          </div>
        </div>

        {/* Check Invites Card */}
        <div 
          className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
          onClick={() => navigate(ROUTES.INVITES)}
        >
          <div className="card-body flex-row items-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="font-semibold">Мои приглашения</h3>
              <p className="text-sm text-base-content/60">Проверить инвайты от капитанов</p>
            </div>
            <div className="badge badge-ghost">{invites.length > 0 ? `${invites.length} новых` : 'нет новых'}</div>
          </div>
        </div>

        {/* Profile Card */}
        <div 
          className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          <div className="card-body flex-row items-center">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="font-semibold">Мой профиль</h3>
              <p className="text-sm text-base-content/60">Навыки, опыт и достижения</p>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Stickers Section */}
      {user?.nftStickers && user.nftStickers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Мои NFT стикеры</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {user.nftStickers.map((sticker) => (
              <div 
                key={sticker.id}
                className="flex-shrink-0 w-16 h-16 bg-base-200 rounded-xl flex items-center justify-center text-3xl tooltip"
                data-tip={sticker.name}
              >
                {sticker.imageUrl}
              </div>
            ))}
            <div className="flex-shrink-0 w-16 h-16 bg-base-200 rounded-xl flex items-center justify-center border-2 border-dashed border-base-300">
              <span className="text-2xl opacity-30">+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
