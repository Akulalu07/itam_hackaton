import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Users, 
  UserMinus, 
  Link2, 
  Check, 
  Copy, 
  Settings,
  Shield,
  Trophy,
  Star,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Search,
  Palette,
  UserPlus
} from 'lucide-react';
import { useAuthStore, useTeamStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { User } from '../../types';
import { Badge, getTitleVariant } from '../../components/gamification/Badge';
import { TeamSettings } from './TeamSettings';
import { JoinRequests } from './JoinRequests';

// Skill level badges
const skillLevelBadge: Record<string, string> = {
  beginner: 'badge-ghost',
  intermediate: 'badge-info',
  advanced: 'badge-success',
  expert: 'badge-warning',
};

interface TeamMemberCardProps {
  member: User;
  isCaptain: boolean;
  onKick?: () => void;
}

/**
 * TeamMemberCard - Карточка участника команды
 */
function TeamMemberCard({ member, isCaptain, onKick }: TeamMemberCardProps) {
  const [showKickConfirm, setShowKickConfirm] = useState(false);

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="avatar">
              <div className="w-14 h-14 rounded-xl ring-2 ring-primary/30 ring-offset-1 ring-offset-base-200">
                <img src={member.avatar} alt={member.name} />
              </div>
            </div>
            {isCaptain && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-warning-content" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold truncate">{member.name}</h3>
              {isCaptain && (
                <span className="badge badge-warning badge-sm">Капитан</span>
              )}
            </div>
            
            <Badge variant={getTitleVariant(member.pts)} size="xs" className="mt-1" />
            
            {/* Skills preview */}
            <div className="flex flex-wrap gap-1 mt-2">
              {member.skills.slice(0, 3).map(skill => (
                <span 
                  key={skill.id} 
                  className={`badge badge-sm ${skillLevelBadge[skill.level]}`}
                >
                  {skill.name}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="badge badge-sm badge-ghost">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Trophy className="w-4 h-4 text-warning" />
              <span className="font-semibold">{member.pts}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-base-content/60">
              <Star className="w-3 h-3" />
              <span>{member.mmr} MMR</span>
            </div>
          </div>

          {/* Kick button (not for captain) */}
          {!isCaptain && onKick && (
            <div className="relative">
              {showKickConfirm ? (
                <div className="flex gap-1">
                  <button 
                    onClick={() => setShowKickConfirm(false)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    ✕
                  </button>
                  <button 
                    onClick={() => {
                      onKick();
                      setShowKickConfirm(false);
                    }}
                    className="btn btn-error btn-sm"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowKickConfirm(true)}
                  className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/20"
                >
                  <UserMinus className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TeamHub - Центр управления командой для капитана
 */
export function TeamHub() {
  const navigate = useNavigate();
  useAuthStore(); // для будущего использования
  const { currentTeam, teamMembers, kickMember, updateTeamStatus, fetchMyTeam } = useTeamStore();
  
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');

  // Генерация ссылки-приглашения
  const generateInviteLink = useCallback(() => {
    if (!currentTeam) return '';
    return `${window.location.origin}/invite/${currentTeam.id}`;
  }, [currentTeam]);

  // Копирование ссылки
  const copyInviteLink = useCallback(async () => {
    const link = generateInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateInviteLink]);

  // Кик участника
  const handleKick = useCallback((memberId: string) => {
    if (!currentTeam) return;
    kickMember(currentTeam.id, memberId);
  }, [currentTeam, kickMember]);

  // Переключение статуса команды (looking - ищем участников, closed - не ищем)
  const toggleTeamStatus = useCallback(() => {
    if (!currentTeam) return;
    const newStatus = currentTeam.status === 'looking' ? 'closed' : 'looking';
    updateTeamStatus(currentTeam.id, newStatus);
  }, [currentTeam, updateTeamStatus]);

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
          <h2 className="text-xl font-bold mb-2">Нет команды</h2>
          <p className="text-base-content/60 mb-6">Создайте команду, чтобы управлять ей</p>
          <button 
            onClick={() => navigate(ROUTES.CREATE_TEAM)}
            className="btn btn-primary"
          >
            Создать команду
          </button>
        </div>
      </div>
    );
  }

  const isTeamFull = teamMembers.length >= (currentTeam.maxMembers || 5);
  const availableSlots = (currentTeam.maxMembers || 5) - teamMembers.length;

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/10 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Моя команда</h1>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-ghost btn-circle"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Team card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{currentTeam.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${currentTeam.status === 'looking' ? 'badge-success' : 'badge-warning'}`}>
                    {currentTeam.status === 'looking' ? 'Ищем участников' : 'Набор закрыт'}
                  </span>
                  <span className="text-sm text-base-content/60">
                    {teamMembers.length}/{currentTeam.maxMembers || 5} участников
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-base-content/60">Заполненность команды</span>
                <span className="font-medium">{teamMembers.length}/{currentTeam.maxMembers || 5}</span>
              </div>
              <progress 
                className="progress progress-primary w-full" 
                value={teamMembers.length} 
                max={currentTeam.maxMembers || 5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-4 py-4 bg-base-200 border-b border-base-300">
          <h3 className="font-semibold mb-4">Настройки команды</h3>
          
          {/* Status toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Статус набора</p>
              <p className="text-sm text-base-content/60">
                {currentTeam.status === 'looking' 
                  ? 'Команда ищет участников' 
                  : 'Набор в команду закрыт'}
              </p>
            </div>
            <button 
              onClick={toggleTeamStatus}
              className={`btn btn-lg ${currentTeam.status === 'looking' ? 'btn-success' : 'btn-warning'}`}
            >
              {currentTeam.status === 'looking' ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="divider my-2"></div>

          {/* Invite link */}
          <div className="py-3">
            <p className="font-medium mb-2">Пригласительная ссылка</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={generateInviteLink()} 
                className="input input-bordered flex-1 text-sm"
              />
              <button 
                onClick={copyInviteLink}
                className={`btn ${inviteLinkCopied ? 'btn-success' : 'btn-primary'}`}
              >
                {inviteLinkCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Копировать
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="divider my-2"></div>

          {/* Customization button */}
          <div className="py-3">
            <button 
              onClick={() => setShowCustomization(true)}
              className="btn btn-outline btn-block gap-2"
            >
              <Palette className="w-5 h-5" />
              Настроить внешний вид
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={copyInviteLink}
            className="btn btn-outline gap-2"
          >
            <Link2 className="w-5 h-5" />
            {inviteLinkCopied ? 'Скопировано!' : 'Поделиться'}
          </button>
          <button 
            onClick={() => navigate(ROUTES.SWIPE)}
            disabled={isTeamFull}
            className="btn btn-primary gap-2"
          >
            <Search className="w-5 h-5" />
            Искать участников
          </button>
        </div>

        {isTeamFull && (
          <div className="alert alert-warning mt-4">
            <Sparkles className="w-5 h-5" />
            <span>Команда укомплектована! Удачи на хакатоне! 🚀</span>
          </div>
        )}

        {!isTeamFull && availableSlots > 0 && (
          <p className="text-center text-sm text-base-content/60 mt-3">
            Осталось {availableSlots} {availableSlots === 1 ? 'место' : availableSlots < 5 ? 'места' : 'мест'}
          </p>
        )}
      </div>

      {/* Team members */}
      <div className="px-4">
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-4">
          <button 
            className={`tab flex-1 gap-2 ${activeTab === 'members' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users className="w-4 h-4" />
            Состав ({teamMembers.length})
          </button>
          <button 
            className={`tab flex-1 gap-2 ${activeTab === 'requests' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <UserPlus className="w-4 h-4" />
            Заявки
          </button>
        </div>

        {activeTab === 'members' ? (
          <div className="space-y-3">
            {teamMembers.filter(m => m && m.id).map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isCaptain={member.id === currentTeam.captainId}
                onKick={member.id !== currentTeam.captainId ? () => handleKick(member.id) : undefined}
              />
            ))}

            {teamMembers.length === 0 && (
              <div className="text-center py-8 text-base-content/60">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>В команде пока только вы</p>
                <p className="text-sm">Начните искать участников!</p>
              </div>
            )}
          </div>
        ) : (
          <JoinRequests 
            teamId={currentTeam.id} 
            onRequestHandled={() => fetchMyTeam()}
          />
        )}
      </div>

      {/* Team Settings Modal */}
      {showCustomization && currentTeam && (
        <TeamSettings
          team={currentTeam}
          onClose={() => setShowCustomization(false)}
          onUpdate={() => {
            fetchMyTeam();
          }}
        />
      )}
    </div>
  );
}
