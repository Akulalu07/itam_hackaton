import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Clock, 
  Users, 
  Trophy, 
  Star,
  MessageCircle,
  ChevronRight,
  Inbox,
  Bell
} from 'lucide-react';
import { User } from '../../types';
import { dummyUsers } from '../../data/dummyData';
import { ROUTES } from '../../routes';

// Статусы приглашений
type InviteStatus = 'pending' | 'accepted' | 'declined';

interface InviteItemProps {
  invite: MockInvite;
  captain: User;
  onAccept: () => void;
  onDecline: () => void;
}

interface MockInvite {
  id: string;
  teamId: string;
  teamName: string;
  captainId: string;
  message?: string;
  createdAt: Date;
  status: InviteStatus;
}

// Title colors
const titleColors: Record<string, string> = {
  'Новичок': 'text-base-content/60',
  'Участник': 'text-info',
  'Активист': 'text-success',
  'Профи': 'text-warning',
  'Легенда': 'text-error',
};

/**
 * InviteItem - Карточка приглашения
 */
function InviteItem({ invite, captain, onAccept, onDecline }: InviteItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isPending = invite.status === 'pending';

  return (
    <div className={`card bg-base-200 shadow-sm ${!isPending ? 'opacity-60' : ''}`}>
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-14 h-14 rounded-xl ring-2 ring-primary/30 ring-offset-1 ring-offset-base-200">
              <img src={captain.avatar} alt={captain.name} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold truncate">{invite.teamName}</h3>
              {isPending && (
                <span className="badge badge-primary badge-sm">Новое</span>
              )}
            </div>
            <p className="text-sm text-base-content/70">
              Капитан: <span className="font-medium">{captain.name}</span>
            </p>
            <p className={`text-xs ${titleColors[captain.title] || 'text-base-content/60'}`}>
              {captain.title}
            </p>
          </div>

          {/* Time */}
          <div className="text-right text-xs text-base-content/50">
            <Clock className="w-3 h-3 inline-block mr-1" />
            {formatTimeAgo(invite.createdAt)}
          </div>
        </div>

        {/* Captain Stats */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="font-semibold">{captain.pts}</span>
            <span className="text-xs text-base-content/60">PTS</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-secondary" />
            <span className="font-semibold">{captain.mmr}</span>
            <span className="text-xs text-base-content/60">MMR</span>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="ml-auto btn btn-ghost btn-xs"
          >
            Подробнее
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-base-300 space-y-3 animate-in slide-in-from-top duration-200">
            {/* Captain Skills */}
            <div>
              <p className="text-xs font-semibold text-base-content/70 mb-1">Навыки капитана:</p>
              <div className="flex flex-wrap gap-1">
                {captain.skills.slice(0, 5).map(skill => (
                  <span key={skill.id} className="badge badge-sm badge-outline">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Message */}
            {invite.message && (
              <div className="bg-base-300/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm italic">"{invite.message}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status or Actions */}
        {isPending ? (
          <div className="card-actions justify-end mt-3 pt-3 border-t border-base-300">
            <button 
              onClick={onDecline}
              className="btn btn-outline btn-error btn-sm"
            >
              <X className="w-4 h-4" />
              Отклонить
            </button>
            <button 
              onClick={onAccept}
              className="btn btn-success btn-sm"
            >
              <Check className="w-4 h-4" />
              Принять
            </button>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-base-300">
            <span className={`badge ${
              invite.status === 'accepted' ? 'badge-success' : 'badge-error'
            } badge-outline`}>
              {invite.status === 'accepted' ? '✓ Принято' : '✗ Отклонено'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Форматирование времени
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин.`;
  if (hours < 24) return `${hours} ч.`;
  if (days < 7) return `${days} дн.`;
  return date.toLocaleDateString('ru-RU');
}

/**
 * InvitesList - Список входящих приглашений для участников
 */
export function InvitesList() {
  const navigate = useNavigate();
  
  // Mock invites data
  const [invites, setInvites] = useState<MockInvite[]>([
    {
      id: '1',
      teamId: 'team1',
      teamName: 'Code Crusaders',
      captainId: dummyUsers[0].id,
      message: 'Привет! Видел твой профиль, нам нужен frontend разработчик с опытом React. Присоединяйся!',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
      status: 'pending',
    },
    {
      id: '2',
      teamId: 'team2',
      teamName: 'Byte Builders',
      captainId: dummyUsers[1].id,
      message: 'Собираем команду для AI хакатона, будем рады видеть тебя в команде!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
      status: 'pending',
    },
    {
      id: '3',
      teamId: 'team3',
      teamName: 'Debug Dragons',
      captainId: dummyUsers[2].id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 день назад
      status: 'pending',
    },
  ]);

  const pendingInvites = invites.filter(i => i.status === 'pending');
  const processedInvites = invites.filter(i => i.status !== 'pending');

  const handleAccept = (inviteId: string) => {
    setInvites(prev => prev.map(inv => 
      inv.id === inviteId ? { ...inv, status: 'accepted' as InviteStatus } : inv
    ));
    // Show success feedback
  };

  const handleDecline = (inviteId: string) => {
    setInvites(prev => prev.map(inv => 
      inv.id === inviteId ? { ...inv, status: 'declined' as InviteStatus } : inv
    ));
  };

  // Empty state
  if (invites.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6">
          <Inbox className="w-12 h-12 text-base-content/30" />
        </div>
        <h2 className="text-xl font-bold mb-2">Пока нет приглашений</h2>
        <p className="text-base-content/60 mb-6 max-w-xs">
          Капитаны команд смогут приглашать тебя после того, как увидят твой профиль
        </p>
        <button 
          onClick={() => navigate(ROUTES.PROFILE)}
          className="btn btn-primary"
        >
          Улучшить профиль
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pb-24">
      {/* Header */}
      <div className="px-4 py-4 bg-base-200/50 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Приглашения</h1>
              <p className="text-sm text-base-content/60">
                {pendingInvites.length} {pendingInvites.length === 1 ? 'новое' : 'новых'}
              </p>
            </div>
            {pendingInvites.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-content text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingInvites.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invites List */}
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-base-content/70 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Ожидают ответа
            </h2>
            <div className="space-y-3">
              {pendingInvites.map(invite => {
                const captain = dummyUsers.find(u => u.id === invite.captainId)!;
                return (
                  <InviteItem
                    key={invite.id}
                    invite={invite}
                    captain={captain}
                    onAccept={() => handleAccept(invite.id)}
                    onDecline={() => handleDecline(invite.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Processed Invites */}
        {processedInvites.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-base-content/70 mb-3">
              История
            </h2>
            <div className="space-y-3">
              {processedInvites.map(invite => {
                const captain = dummyUsers.find(u => u.id === invite.captainId)!;
                return (
                  <InviteItem
                    key={invite.id}
                    invite={invite}
                    captain={captain}
                    onAccept={() => {}}
                    onDecline={() => {}}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-base-100 via-base-100 to-transparent">
        <div className="max-w-lg mx-auto">
          <div className="alert bg-base-200/80 backdrop-blur-lg">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Хочешь создать свою команду?</p>
              <p className="text-xs text-base-content/60">Стань капитаном и сам выбирай участников</p>
            </div>
            <button 
              onClick={() => navigate(ROUTES.CREATE_TEAM)}
              className="btn btn-primary btn-sm"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
