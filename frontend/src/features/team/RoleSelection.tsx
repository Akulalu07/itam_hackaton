import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Mail, ChevronRight, Shield } from 'lucide-react';
import { useAuthStore, useTeamStore } from '../../store/useStore';
import { ROUTES } from '../../routes';

/**
 * RoleSelection - Экран выбора роли: Капитан или Участник
 * Две большие карточки для выбора пути
 */
export function RoleSelection() {
  const navigate = useNavigate();
  const { user, becomeCapatin, updateProfile } = useAuthStore();
  const { createTeam } = useTeamStore();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');

  // Handle becoming captain
  const handleBecomeCaptain = () => {
    setShowTeamModal(true);
  };

  // Create team and navigate to swipe
  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    
    becomeCapatin();
    createTeam(teamName.trim(), 'hack-1', user?.id || 'current-user');
    navigate(ROUTES.SWIPE, { replace: true });
  };

  // Handle waiting for invites
  const handleWaitForInvites = () => {
    updateProfile({ status: 'looking' });
    navigate(ROUTES.INVITES, { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Выбери свой путь</h1>
        <p className="text-base-content/60">
          Хочешь собрать команду или присоединиться к существующей?
        </p>
      </div>

      {/* Role Cards */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* Captain Card */}
        <button
          onClick={handleBecomeCaptain}
          className="card bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 hover:border-primary transition-all active:scale-[0.98] text-left"
        >
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Crown className="w-8 h-8 text-primary-content" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="card-title text-xl">Создать команду</h2>
                  <span className="badge badge-primary badge-sm">Капитан</span>
                </div>
                <p className="text-base-content/70 text-sm">
                  Стань лидером, придумай название команды и набери тиммейтов через свайпы
                </p>
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">👆</div>
                <p className="text-xs text-base-content/60">Свайпай участников</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">💌</div>
                <p className="text-xs text-base-content/60">Отправляй инвайты</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⚙️</div>
                <p className="text-xs text-base-content/60">Управляй командой</p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 text-primary">
              <span className="text-sm font-medium">Начать</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Member Card */}
        <button
          onClick={handleWaitForInvites}
          className="card bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary/30 hover:border-secondary transition-all active:scale-[0.98] text-left"
        >
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30">
                <Mail className="w-8 h-8 text-secondary-content" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="card-title text-xl">Ждать приглашения</h2>
                  <span className="badge badge-secondary badge-sm">Участник</span>
                </div>
                <p className="text-base-content/70 text-sm">
                  Капитаны увидят твой профиль и смогут пригласить тебя в команду
                </p>
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">📋</div>
                <p className="text-xs text-base-content/60">Твой профиль виден</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📬</div>
                <p className="text-xs text-base-content/60">Получай инвайты</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">✅</div>
                <p className="text-xs text-base-content/60">Выбирай команду</p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 text-secondary">
              <span className="text-sm font-medium">Продолжить</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Info */}
        <div className="alert bg-base-200 border-0">
          <Shield className="w-5 h-5 text-info" />
          <div>
            <p className="text-sm">
              Не переживай! Ты всегда сможешь изменить свою роль позже в настройках.
            </p>
          </div>
        </div>
      </div>

      {/* Team Name Modal */}
      {showTeamModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-primary" />
              Создание команды
            </h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Название команды</span>
              </label>
              <input
                type="text"
                placeholder="Например: Code Warriors"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                className="input input-bordered input-primary"
                maxLength={30}
                autoFocus
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Придумай крутое название для своей команды
                </span>
                <span className="label-text-alt">{teamName.length}/30</span>
              </label>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowTeamModal(false)}
              >
                Отмена
              </button>
              <button 
                className="btn btn-primary"
                disabled={!teamName.trim()}
                onClick={handleCreateTeam}
              >
                Создать команду
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowTeamModal(false)} />
        </div>
      )}
    </div>
  );
}
