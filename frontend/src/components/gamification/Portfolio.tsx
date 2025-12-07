import { Trophy, Calendar, Users, Medal, ChevronRight } from 'lucide-react';

export interface HackathonHistoryItem {
  id: string;
  eventName: string;
  date: Date;
  teamName: string;
  placement: number | null; // null = участие без места
  totalTeams: number;
  role: string;
  ptsEarned: number;
}

interface PortfolioProps {
  history: HackathonHistoryItem[];
  onItemClick?: (item: HackathonHistoryItem) => void;
}

// Получить эмодзи и стиль для места
const getPlacementStyle = (placement: number | null) => {
  if (placement === null) return { emoji: '✓', class: 'text-base-content/60', label: 'Участник' };
  if (placement === 1) return { emoji: '🥇', class: 'text-warning', label: '1 место' };
  if (placement === 2) return { emoji: '🥈', class: 'text-base-content/80', label: '2 место' };
  if (placement === 3) return { emoji: '🥉', class: 'text-orange-400', label: '3 место' };
  return { emoji: '🏅', class: 'text-base-content/60', label: `${placement} место` };
};

/**
 * PortfolioItem - Карточка одного хакатона
 */
function PortfolioItem({ 
  item, 
  onClick 
}: { 
  item: HackathonHistoryItem; 
  onClick?: () => void;
}) {
  const placementStyle = getPlacementStyle(item.placement);
  
  return (
    <div 
      onClick={onClick}
      className={`
        card bg-base-200 hover:bg-base-300 transition-all cursor-pointer
        ${onClick ? 'active:scale-[0.98]' : ''}
      `}
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-4">
          {/* Placement badge */}
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center text-2xl
            ${item.placement && item.placement <= 3 
              ? 'bg-gradient-to-br from-warning/20 to-orange-500/20' 
              : 'bg-base-300'
            }
          `}>
            {placementStyle.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{item.eventName}</h3>
            
            <div className="flex items-center gap-4 mt-1 text-sm text-base-content/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(item.date).toLocaleDateString('ru-RU', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {item.teamName}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span className={`badge badge-sm ${
                item.placement && item.placement <= 3 ? 'badge-warning' : 'badge-ghost'
              }`}>
                {placementStyle.label}
              </span>
              <span className="text-xs text-base-content/60">
                из {item.totalTeams} команд
              </span>
              <span className="text-xs text-success font-medium">
                +{item.ptsEarned} PTS
              </span>
            </div>
          </div>

          {onClick && (
            <ChevronRight className="w-5 h-5 text-base-content/40" />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Portfolio - История участия в хакатонах
 */
export function Portfolio({ history, onItemClick }: PortfolioProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
        <h3 className="text-lg font-medium mb-2">Пока нет истории</h3>
        <p className="text-base-content/60 text-sm max-w-xs mx-auto">
          Участвуй в хакатонах, чтобы заполнить своё портфолио и повысить рейтинг!
        </p>
      </div>
    );
  }

  // Статистика
  const totalHackathons = history.length;
  const wins = history.filter(h => h.placement === 1).length;
  const podiums = history.filter(h => h.placement && h.placement <= 3).length;
  const totalPTS = history.reduce((sum, h) => sum + h.ptsEarned, 0);

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-base-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{totalHackathons}</p>
          <p className="text-xs text-base-content/60">Хакатонов</p>
        </div>
        <div className="bg-base-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-warning">{wins}</p>
          <p className="text-xs text-base-content/60">Побед</p>
        </div>
        <div className="bg-base-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{podiums}</p>
          <p className="text-xs text-base-content/60">Топ-3</p>
        </div>
        <div className="bg-base-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-success">+{totalPTS}</p>
          <p className="text-xs text-base-content/60">PTS</p>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" />
          История участия
        </h3>
        
        {history.map((item) => (
          <PortfolioItem 
            key={item.id} 
            item={item}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
