import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Rocket, 
  ArrowLeft,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuthStore, useTeamStore, useHackathonStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import axiosClient from '../../api/axiosClient';

/**
 * CreateTeam - Страница создания команды
 */
export function CreateTeam() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { setCurrentTeam } = useTeamStore();
  const { selectedHackathon } = useHackathonStore();
  
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hackathonId = selectedHackathon?.id || user?.currentHackathonId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Введите название команды');
      return;
    }
    
    if (!hackathonId) {
      setError('Сначала зарегистрируйтесь на хакатон');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post('/api/teams', {
        name: teamName.trim(),
        hackathonId: Number(hackathonId),
        description: description.trim() || undefined,
      });

      const newTeam = response.data;
      
      // Обновляем стор
      setCurrentTeam(newTeam);
      
      // Обновляем пользователя
      if (user) {
        setUser({
          ...user,
          currentTeamId: String(newTeam.id),
          role: 'captain',
        });
      }

      // Переходим на страницу свайпов
      navigate(ROUTES.SWIPE);
    } catch (err: any) {
      console.error('Create team error:', err);
      setError(err.response?.data?.error || 'Не удалось создать команду');
    } finally {
      setIsLoading(false);
    }
  };

  // Если нет текущего хакатона
  if (!hackathonId) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-warning mb-4" />
        <h2 className="text-xl font-bold mb-2">Сначала выберите хакатон</h2>
        <p className="text-base-content/60 text-center mb-6">
          Чтобы создать команду, нужно зарегистрироваться на хакатон
        </p>
        <button 
          onClick={() => navigate(ROUTES.HACKATHONS)}
          className="btn btn-primary"
        >
          Выбрать хакатон
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="px-4 py-4 border-b border-base-300">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          Создание команды
        </h1>
        <p className="text-base-content/60 mt-1">
          Придумай название и начни набор участников
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Error message */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Team Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Название команды</span>
          </label>
          <input
            type="text"
            placeholder="Например: Dream Team"
            className="input input-bordered input-lg"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={50}
            autoFocus
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">
              {teamName.length}/50 символов
            </span>
          </label>
        </div>

        {/* Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Описание (необязательно)</span>
          </label>
          <textarea
            placeholder="Расскажите о своей команде, какие навыки ищете..."
            className="textarea textarea-bordered h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">
              {description.length}/300 символов
            </span>
          </label>
        </div>

        {/* Info card */}
        <div className="card bg-primary/10 border border-primary/30">
          <div className="card-body p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Что будет дальше?</h3>
                <p className="text-sm text-base-content/70 mt-1">
                  После создания команды ты станешь капитаном и сможешь приглашать 
                  участников через свайп-систему, как в Tinder!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-full"
          disabled={isLoading || !teamName.trim()}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Создать команду
            </>
          )}
        </button>
      </form>
    </div>
  );
}
