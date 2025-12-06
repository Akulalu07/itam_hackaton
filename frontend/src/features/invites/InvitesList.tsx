import { useState, useEffect } from 'react';
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
  Bell,
  RefreshCw
} from 'lucide-react';
import { Invite } from '../../types';
import { useInviteStore, useTeamStore } from '../../store';
import { EmptyState } from '../../components/common';
import { ROUTES } from '../../routes';

// Title colors
const titleColors: Record<string, string> = {
  'Новичок': 'text-base-content/60',
  'Участник': 'text-info',
  'Активист': 'text-success',
  'Профи': 'text-warning',
  'Легенда': 'text-error',
};

interface InviteItemProps {
  invite: Invite;
  onAccept: () => void;
  onDecline: () => void;
  isProcessing?: boolean;
}

/**
 * InviteItem - Карточка приглашения
 */
function InviteItem({ invite, onAccept, onDecline, isProcessing }: InviteItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isPending = invite.status === 'pending';
  const captain = invite.fromUser;

  return (
    <div className={`card bg-base-200 shadow-sm ${!isPending ? 'opacity-60' : ''}`}>
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-14 h-14 rounded-xl ring-2 ring-primary/30 ring-offset-1 ring-offset-base-200">
              {captain?.avatar ? (
                <img src={captain.avatar} alt={captain?.name || 'Капитан'} />
              ) : (
                <div className="bg-primary text-primary-content flex items-center justify-center text-xl font-bold">
                  {captain?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold truncate">{invite.team?.name || 'Команда'}</h3>
              {isPending && (
                <span className="badge badge-primary badge-sm">Новое</span>
              )}
            </div>
            <p className="text-sm text-base-content/70">
              Капитан: <span className="font-medium">{captain?.name || 'Неизвестно'}</span>
            </p>
            {captain?.title && (
              <p className={`text-xs ${titleColors[captain.title] || 'text-base-content/60'}`}>
                {captain.title}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="text-right text-xs text-base-content/50">
            <Clock className="w-3 h-3 inline-block mr-1" />
            {formatTimeAgo(new Date(invite.createdAt))}
          </div>
        </div>

        {/* Captain Stats */}
        {captain && (
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-warning" />
              <span className="font-semibold">{captain.pts || 0}</span>
              <span className="text-xs text-base-content/60">PTS</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-secondary" />
              <span className="font-semibold">{captain.mmr || 0}</span>
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
        )}

        {/* Expanded Details */}
        {expanded && captain && (
          <div className="mt-3 pt-3 border-t border-base-300 space-y-3 animate-in slide-in-from-top duration-200">
            {/* Captain Skills */}
            {captain.skills && captain.skills.length > 0 && (
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
            )}

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
              disabled={isProcessing}
              className="btn btn-outline btn-error btn-sm"
            >
              <X className="w-4 h-4" />
              Отклонить
            </button>
            <button 
              onClick={onAccept}
              disabled={isProcessing}
              className="btn btn-success btn-sm"
            >
              {isProcessing ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Check className="w-4 h-4" />
              )}
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
  const { invites, isLoading, error, fetchInvites, acceptInvite, declineInvite } = useInviteStore();
  const { fetchMyTeam } = useTeamStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Загрузка приглашений при монтировании
  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const pendingInvites = invites.filter(i => i.status === 'pending');

  const handleAccept = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await acceptInvite(inviteId);
      // После принятия приглашения обновляем информацию о команде
      await fetchMyTeam();
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await declineInvite(inviteId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefresh = () => {
    fetchInvites();
  };

  // Loading state
  if (isLoading && invites.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Error state
  if (error && invites.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 p-6">
        <EmptyState
          icon="⚠️"
          title="Ошибка загрузки"
          description={error}
          actionText="Повторить"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  // Empty state
  if (invites.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 pb-24">
        {/* Header */}
        <div className="px-4 py-4 bg-base-200/50 backdrop-blur-lg sticky top-0 z-20">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Приглашения</h1>
                <p className="text-sm text-base-content/60">0 новых</p>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
          <EmptyState
            icon="📬"
            title="Пока нет приглашений"
            description="Капитаны команд смогут приглашать тебя после того, как увидят твой профиль"
            actionText="Улучшить профиль"
            onAction={() => navigate(ROUTES.PROFILE)}
          />
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
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
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
              {pendingInvites.map(invite => (
                <InviteItem
                  key={invite.id}
                  invite={invite}
                  onAccept={() => handleAccept(invite.id)}
                  onDecline={() => handleDecline(invite.id)}
                  isProcessing={processingId === invite.id}
                />
              ))}
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
