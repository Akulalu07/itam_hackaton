import { useState, useEffect } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { teamService, TeamBalance } from '../../api/services';

interface TeamBalanceCardProps {
  className?: string;
  compact?: boolean;
}

// Цвет в зависимости от балла
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  if (score >= 40) return 'text-orange-500';
  return 'text-error';
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-success/20';
  if (score >= 60) return 'bg-warning/20';
  if (score >= 40) return 'bg-orange-500/20';
  return 'bg-error/20';
};

const getScoreText = (score: number): string => {
  if (score >= 80) return 'Отлично';
  if (score >= 60) return 'Хорошо';
  if (score >= 40) return 'Средне';
  return 'Нужно улучшить';
};

export function TeamBalanceCard({ className, compact = false }: TeamBalanceCardProps) {
  const [balance, setBalance] = useState<TeamBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getBalance();
      setBalance(data);
    } catch (err) {
      console.error('Failed to fetch team balance:', err);
      setError('Не удалось загрузить баланс команды');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  if (loading) {
    return (
      <div className={`card bg-base-200 ${className}`}>
        <div className="card-body flex items-center justify-center py-8">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className={`card bg-base-200 ${className}`}>
        <div className="card-body py-4">
          <div className="flex items-center justify-between">
            <span className="text-base-content/60 text-sm">{error || 'Нет данных'}</span>
            <button onClick={fetchBalance} className="btn btn-ghost btn-xs btn-circle">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-200 ${className}`}>
      <div className="card-body p-4">
        {/* Header with Score */}
        <div 
          className={`flex items-center justify-between ${compact ? 'cursor-pointer' : ''}`}
          onClick={() => compact && setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getScoreBg(balance.score)}`}>
              <Scale className={`w-5 h-5 ${getScoreColor(balance.score)}`} />
            </div>
            <div>
              <h3 className="font-semibold">Баланс команды</h3>
              <p className={`text-sm ${getScoreColor(balance.score)}`}>
                {getScoreText(balance.score)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-3xl font-bold ${getScoreColor(balance.score)}`}>
              {Math.round(balance.score)}
            </div>
            {compact && (
              <button className="btn btn-ghost btn-xs btn-circle">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-base-300 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  balance.score >= 80 ? 'bg-success' :
                  balance.score >= 60 ? 'bg-warning' :
                  balance.score >= 40 ? 'bg-orange-500' : 'bg-error'
                }`}
                style={{ width: `${balance.score}%` }}
              />
            </div>

            {/* MMR Stats */}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-info" />
              <span className="text-base-content/60">Средний MMR:</span>
              <span className="font-semibold">{Math.round(balance.mmrStats.average)}</span>
              <span className="text-base-content/40">
                ({balance.mmrStats.min} - {balance.mmrStats.max})
              </span>
            </div>

            {/* Warnings */}
            {balance.warnings.length > 0 && (
              <div className="space-y-2">
                {balance.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {balance.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-base-content/60 uppercase font-semibold">Рекомендации</p>
                {balance.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                    <span>{suggestion.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Coverage */}
            {Object.keys(balance.skillCoverage).length > 0 && (
              <div>
                <p className="text-xs text-base-content/60 uppercase font-semibold mb-2">Навыки в команде</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(balance.skillCoverage).slice(0, 10).map(([skill, count]) => (
                    <span key={skill} className="badge badge-sm badge-outline">
                      {skill} {count > 1 && <span className="ml-1 text-primary">×{count}</span>}
                    </span>
                  ))}
                  {Object.keys(balance.skillCoverage).length > 10 && (
                    <span className="badge badge-sm badge-ghost">
                      +{Object.keys(balance.skillCoverage).length - 10}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Roles */}
            {Object.keys(balance.roles).length > 0 && (
              <div>
                <p className="text-xs text-base-content/60 uppercase font-semibold mb-2">Роли</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(balance.roles).map(([role, count]) => (
                    <span key={role} className="badge badge-sm badge-secondary">
                      {roleToLabel(role)} {count > 1 && <span className="ml-1">×{count}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <button 
              onClick={fetchBalance} 
              className="btn btn-ghost btn-xs w-full mt-2"
            >
              <RefreshCw className="w-3 h-3" />
              Обновить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function roleToLabel(role: string): string {
  const mapping: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    designer: 'Дизайн',
    pm: 'PM',
    devops: 'DevOps',
    data: 'Data',
    mobile: 'Mobile',
  };
  return mapping[role] || role;
}
