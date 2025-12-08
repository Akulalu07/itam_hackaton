import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Trophy,
  ChevronRight,
  Check,
  AlertCircle,
  Search
} from 'lucide-react';
import { hackathonService } from '../../api/services';
import { Hackathon } from '../../types';
import { useAuthStore, useHackathonStore } from '../../store/useStore';
import { ROUTES } from '../../routes';

// Форматирование даты
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

// Статус хакатона
const getStatusBadge = (hackathon: Hackathon) => {
  const now = new Date();
  const start = new Date(hackathon.startDate);
  const end = new Date(hackathon.endDate);
  const regDeadline = new Date(hackathon.registrationDeadline);

  if (now < regDeadline) {
    return <span className="badge badge-success badge-sm">Регистрация открыта</span>;
  }
  if (now >= start && now <= end) {
    return <span className="badge badge-warning badge-sm">Идёт сейчас</span>;
  }
  if (now > end) {
    return <span className="badge badge-ghost badge-sm">Завершён</span>;
  }
  return <span className="badge badge-info badge-sm">Скоро начнётся</span>;
};

interface HackathonCardProps {
  hackathon: Hackathon;
  isRegistered: boolean;
  onRegister: () => void;
  onSelect: () => void;
}

function HackathonCard({ hackathon, isRegistered, onRegister, onSelect }: HackathonCardProps) {
  const now = new Date();
  const regDeadline = new Date(hackathon.registrationDeadline);
  const canRegister = now < regDeadline && !isRegistered;

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
      {/* Image */}
      {hackathon.imageUrl && (
        <figure className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20">
          <img 
            src={hackathon.imageUrl} 
            alt={hackathon.name}
            className="w-full h-full object-cover"
          />
        </figure>
      )}
      {!hackathon.imageUrl && (
        <figure className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-primary/50" />
        </figure>
      )}

      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base line-clamp-1">{hackathon.name}</h2>
          {getStatusBadge(hackathon)}
        </div>

        {/* Description */}
        <p className="text-sm text-base-content/60 line-clamp-2">
          {hackathon.description}
        </p>

        {/* Info */}
        <div className="flex flex-wrap gap-3 text-xs text-base-content/70 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {hackathon.minTeamSize}-{hackathon.maxTeamSize} чел.
          </div>
          {hackathon.participantsCount !== undefined && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {hackathon.participantsCount} участников
            </div>
          )}
        </div>

        {/* Registration deadline */}
        {canRegister && (
          <div className="flex items-center gap-1 text-xs text-warning mt-1">
            <Clock className="w-3 h-3" />
            Регистрация до {formatDate(hackathon.registrationDeadline)}
          </div>
        )}

        {/* Actions */}
        <div className="card-actions mt-3">
          {isRegistered ? (
            <button 
              className="btn btn-primary btn-sm flex-1"
              onClick={onSelect}
            >
              <Check className="w-4 h-4" />
              Участвую
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : canRegister ? (
            <button 
              className="btn btn-outline btn-primary btn-sm flex-1"
              onClick={onRegister}
            >
              Зарегистрироваться
            </button>
          ) : (
            <button 
              className="btn btn-ghost btn-sm flex-1"
              onClick={onSelect}
            >
              Подробнее
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HackathonsPage() {
  const navigate = useNavigate();
  const { user, setCurrentHackathon } = useAuthStore();
  const { fetchHackathons, hackathons, isLoading } = useHackathonStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const handleRegister = async (hackathonId: string) => {
    try {
      await hackathonService.register(hackathonId);
      setCurrentHackathon(hackathonId);
      // Обновляем список
      await fetchHackathons();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleSelect = (hackathonId: string) => {
    setCurrentHackathon(hackathonId);
    navigate(ROUTES.SWIPE);
  };

  // Фильтрация
  const filteredHackathons = hackathons.filter(h => {
    // Поиск
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по статусу
    const now = new Date();
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);

    switch (filter) {
      case 'active':
        return now >= start && now <= end;
      case 'upcoming':
        return now < start;
      case 'past':
        return now > end;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      {/* Header */}
      <div className="px-4 py-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <h1 className="text-2xl font-bold">Хакатоны</h1>
        <p className="text-base-content/60 mt-1">
          Найди свой хакатон и собери команду
        </p>
      </div>

      {/* Search & Filters */}
      <div className="px-4 py-3 sticky top-0 bg-base-100 z-10 border-b border-base-300">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Поиск хакатонов..."
            className="input input-bordered input-sm w-full pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Все' },
            { key: 'active', label: 'Активные' },
            { key: 'upcoming', label: 'Скоро' },
            { key: 'past', label: 'Прошедшие' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`btn btn-sm ${
                filter === tab.key ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setFilter(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
            <p className="text-base-content/60">Хакатоны не найдены</p>
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
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                isRegistered={user?.currentHackathonId === hackathon.id}
                onRegister={() => handleRegister(hackathon.id)}
                onSelect={() => handleSelect(hackathon.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current Hackathon Banner */}
      {user?.currentHackathonId && (
        <div className="fixed bottom-20 left-4 right-4">
          <div className="alert alert-info shadow-lg">
            <Check className="w-5 h-5" />
            <div>
              <span className="font-semibold">Ты участвуешь в хакатоне!</span>
              <p className="text-xs opacity-80">
                Переходи к поиску тиммейтов
              </p>
            </div>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => navigate(ROUTES.SWIPE)}
            >
              Поиск
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
