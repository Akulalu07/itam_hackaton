import { ReactNode } from 'react';
import { Star, Trophy, Crown, Sparkles, Zap, Shield } from 'lucide-react';

export type BadgeVariant = 'beginner' | 'participant' | 'activist' | 'pro' | 'legend';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

const badgeConfig: Record<BadgeVariant, {
  label: string;
  colors: string;
  icon: ReactNode;
  glow?: string;
}> = {
  beginner: {
    label: 'Новичок',
    colors: 'bg-base-300 text-base-content border-base-content/20',
    icon: <Star className="w-3 h-3" />,
  },
  participant: {
    label: 'Участник',
    colors: 'bg-info/20 text-info border-info/30',
    icon: <Zap className="w-3 h-3" />,
  },
  activist: {
    label: 'Активист',
    colors: 'bg-success/20 text-success border-success/30',
    icon: <Shield className="w-3 h-3" />,
  },
  pro: {
    label: 'Профи',
    colors: 'bg-warning/20 text-warning border-warning/30',
    icon: <Trophy className="w-3 h-3" />,
    glow: 'shadow-warning/20',
  },
  legend: {
    label: 'Легенда',
    colors: 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30',
    icon: <Crown className="w-3 h-3" />,
    glow: 'shadow-primary/30',
  },
};

const sizeConfig: Record<BadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

/**
 * Badge - Бейдж титула пользователя
 * Отображает уровень игрока с иконкой и анимацией
 */
export function Badge({ 
  variant, 
  size = 'sm', 
  showIcon = true, 
  animated = false,
  className = '' 
}: BadgeProps) {
  const config = badgeConfig[variant];
  
  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.colors}
        ${sizeConfig[size]}
        ${config.glow ? `shadow-lg ${config.glow}` : ''}
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}

/**
 * getTitleVariant - Получить вариант бейджа по PTS
 */
export function getTitleVariant(pts: number): BadgeVariant {
  if (pts < 100) return 'beginner';
  if (pts < 500) return 'participant';
  if (pts < 1500) return 'activist';
  if (pts < 5000) return 'pro';
  return 'legend';
}

/**
 * PTSDisplay - Отображение PTS рейтинга
 */
interface PTSDisplayProps {
  pts: number;
  mmr?: number;
  size?: 'sm' | 'md' | 'lg';
  showChange?: number; // +/- изменение
}

export function PTSDisplay({ pts, mmr, size = 'md', showChange }: PTSDisplayProps) {
  const sizeStyles = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Sparkles className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'} text-warning`} />
        <span className={`font-bold ${sizeStyles[size]} bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent`}>
          {pts.toLocaleString()}
        </span>
        <span className="text-base-content/60 text-sm">PTS</span>
        {showChange !== undefined && showChange !== 0 && (
          <span className={`text-sm font-medium ${showChange > 0 ? 'text-success' : 'text-error'}`}>
            {showChange > 0 ? '+' : ''}{showChange}
          </span>
        )}
      </div>
      {mmr !== undefined && (
        <div className="flex items-center gap-1 text-base-content/60">
          <Trophy className="w-4 h-4" />
          <span className="text-sm">{mmr} MMR</span>
        </div>
      )}
    </div>
  );
}
