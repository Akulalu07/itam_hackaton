import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Crown, 
  Shield,
  Check,
  Clock
} from 'lucide-react';
import { Team } from '../../types';
import { teamService, MyJoinRequest } from '../../api/services';
import { useAuthStore } from '../../store/useStore';

interface TeamCardProps {
  team: Team;
  onRequestJoin: (teamId: string) => void;
  myRequests: MyJoinRequest[];
  isLoading: boolean;
}

/**
 * TeamCard - Карточка команды в списке
 */
function TeamCard({ team, onRequestJoin, myRequests, isLoading }: TeamCardProps) {
  const pendingRequest = myRequests.find(r => r.teamId === Number(team.id) && r.status === 'pending');
  const memberCount = team.memberCount || team.members?.length || 0;
  const maxMembers = team.maxMembers || team.maxSize || 5;
  const isFull = memberCount >= maxMembers;
  const isOpen = team.status === 'looking' || team.status === 'open';

  const getTeamStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (team.background) {
      style.background = team.background;
    }
    if (team.borderColor) {
      style.borderColor = team.borderColor;
      style.borderWidth = '2px';
      style.borderStyle = 'solid';
    }
    return style;
  };

  const getNameStyle = (): React.CSSProperties => {
    if (!team.nameColor) return {};
    if (team.nameColor.startsWith('linear-gradient')) {
      return {
        background: team.nameColor,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return { color: team.nameColor };
  };

  return (
    <div 
      className="card bg-base-200 hover:shadow-lg transition-shadow"
      style={getTeamStyle()}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Team avatar */}
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ 
              background: team.avatarUrl ? `url(${team.avatarUrl}) center/cover` : 'linear-gradient(135deg, hsl(var(--p)) 0%, hsl(var(--s)) 100%)',
            }}
          >
            {!team.avatarUrl && <Shield className="w-7 h-7 text-white" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate" style={getNameStyle()}>
              {team.name}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge badge-sm ${isOpen ? 'badge-success' : 'badge-warning'}`}>
                {isOpen ? 'Ищут участников' : 'Набор закрыт'}
              </span>
              <span className="text-sm text-base-content/60">
                {memberCount}/{maxMembers}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {team.description && (
          <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
            {team.description}
          </p>
        )}

        {/* Captain */}
        {team.captain && (
          <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
            <Crown className="w-4 h-4 text-warning" />
            <span>Капитан: {team.captain.name}</span>
          </div>
        )}

        {/* Members preview */}
        {team.members && team.members.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="avatar-group -space-x-3">
              {team.members.slice(0, 4).filter(m => m).map((member, idx) => (
                <div key={member?.userId || idx} className="avatar">
                  <div className="w-8">
                    <img 
                      src={member?.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member?.userId || idx}`} 
                      alt="" 
                    />
                  </div>
                </div>
              ))}
              {team.members.length > 4 && (
                <div className="avatar placeholder">
                  <div className="w-8 bg-neutral text-neutral-content">
                    <span className="text-xs">+{team.members.length - 4}</span>
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-base-content/50">
              {team.members.length} участник{team.members.length === 1 ? '' : team.members.length < 5 ? 'а' : 'ов'}
            </span>
          </div>
        )}

        {/* Action button */}
        <div className="card-actions justify-end mt-3">
          {pendingRequest ? (
            <button className="btn btn-sm btn-ghost" disabled>
              <Clock className="w-4 h-4" />
              Запрос отправлен
            </button>
          ) : isFull ? (
            <button className="btn btn-sm btn-ghost" disabled>
              Команда полная
            </button>
          ) : !isOpen ? (
            <button className="btn btn-sm btn-ghost" disabled>
              Набор закрыт
            </button>
          ) : (
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => onRequestJoin(team.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Подать заявку
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TeamBrowser - Просмотр и поиск команд
 */
export function TeamBrowser() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myRequests, setMyRequests] = useState<MyJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestingTeamId, setRequestingTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [user?.currentHackathonId]);

  const loadData = async () => {
    if (!user?.currentHackathonId) return;
    
    setIsLoading(true);
    try {
      const [teamsData, requestsData] = await Promise.all([
        teamService.getPublicTeams(String(user.currentHackathonId)),
        teamService.getMyJoinRequests(),
      ]);
      setTeams(teamsData);
      setMyRequests(requestsData);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestJoin = async (teamId: string) => {
    setRequestingTeamId(teamId);
    try {
      await teamService.requestJoin(teamId);
      setSuccessMessage('Заявка отправлена! Ожидайте решения капитана.');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Refresh requests
      const requestsData = await teamService.getMyJoinRequests();
      setMyRequests(requestsData);
    } catch (error: any) {
      console.error('Failed to request join:', error);
      alert(error.response?.data?.error || 'Не удалось отправить заявку');
    } finally {
      setRequestingTeamId(null);
    }
  };

  // Filter teams
  const filteredTeams = teams.filter(team => {
    // Exclude own team
    if (user?.currentTeamId && String(team.id) === String(user.currentTeamId)) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = team.name.toLowerCase().includes(query);
      const matchesCaptain = team.captain?.name.toLowerCase().includes(query);
      if (!matchesName && !matchesCaptain) return false;
    }
    
    // Status filter
    if (statusFilter === 'open' && team.status !== 'looking' && team.status !== 'open') return false;
    if (statusFilter === 'closed' && team.status !== 'closed') return false;
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/10 px-4 pt-6 pb-6">
        <h1 className="text-2xl font-bold mb-2">Команды</h1>
        <p className="text-base-content/60 text-sm">
          Найди команду и подай заявку на вступление
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mx-4 mt-4">
          <div className="alert alert-success">
            <Check className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="px-4 py-4 sticky top-0 bg-base-100 z-10 border-b border-base-200">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Поиск команд..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
            className="select select-bordered select-sm"
          >
            <option value="all">Все</option>
            <option value="open">Открытые</option>
            <option value="closed">Закрытые</option>
          </select>
        </div>
      </div>

      {/* My pending requests */}
      {myRequests.filter(r => r.status === 'pending').length > 0 && (
        <div className="px-4 py-3 bg-info/10 border-b border-info/20">
          <div className="flex items-center gap-2 text-sm text-info">
            <Clock className="w-4 h-4" />
            <span>
              У вас {myRequests.filter(r => r.status === 'pending').length} активных заявок
            </span>
          </div>
        </div>
      )}

      {/* Teams grid */}
      <div className="px-4 py-4">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 text-base-content/50">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Команды не найдены</p>
            {searchQuery && (
              <button 
                className="btn btn-ghost btn-sm mt-2"
                onClick={() => setSearchQuery('')}
              >
                Сбросить поиск
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onRequestJoin={handleRequestJoin}
                myRequests={myRequests}
                isLoading={requestingTeamId === team.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
