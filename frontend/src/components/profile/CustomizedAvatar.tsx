import { User, ProfileCustomization } from '../../types';

interface CustomizedAvatarProps {
  user: User;
  customization?: ProfileCustomization;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFrame?: boolean;
  className?: string;
}

/**
 * CustomizedAvatar - Аватар с кастомизацией (рамка)
 */
export function CustomizedAvatar({ 
  user, 
  customization, 
  size = 'md',
  showFrame = true,
  className = ''
}: CustomizedAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const frame = customization?.avatarFrame;
  
  // Стили рамки
  const getFrameStyle = () => {
    if (!frame || !showFrame) return {};
    
    switch (frame.id) {
      case 'frame_basic':
        return { boxShadow: '0 0 0 3px #6366f1' };
      case 'frame_golden':
        return { 
          boxShadow: '0 0 0 3px #f59e0b, 0 0 15px rgba(245, 158, 11, 0.5)',
          animation: 'pulse 2s infinite'
        };
      case 'frame_neon':
        return { 
          boxShadow: '0 0 0 3px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #22d3ee',
        };
      case 'frame_gradient':
        return { 
          boxShadow: '0 0 0 4px transparent',
          backgroundImage: 'linear-gradient(to right, #ec4899, #8b5cf6, #06b6d4)',
          backgroundClip: 'padding-box',
          border: '3px solid transparent',
          backgroundOrigin: 'border-box',
        };
      case 'frame_fire':
        return { 
          boxShadow: '0 0 0 3px #ef4444, 0 0 20px rgba(239, 68, 68, 0.7)',
          animation: 'fireGlow 1s ease-in-out infinite alternate'
        };
      case 'frame_ice':
        return { 
          boxShadow: '0 0 0 3px #06b6d4, 0 0 20px rgba(6, 182, 212, 0.5)',
        };
      case 'frame_rainbow':
        return { 
          animation: 'rainbowBorder 3s linear infinite',
        };
      case 'frame_hacker':
        return { 
          boxShadow: '0 0 0 3px #22c55e, 0 0 15px rgba(34, 197, 94, 0.5)',
        };
      case 'frame_champion':
        return { 
          boxShadow: '0 0 0 4px #fbbf24, 0 0 25px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(251, 191, 36, 0.2)',
        };
      case 'frame_legendary':
        return { 
          boxShadow: '0 0 0 4px #a855f7, 0 0 30px rgba(168, 85, 247, 0.7), 0 0 60px rgba(168, 85, 247, 0.4)',
          animation: 'legendaryPulse 2s ease-in-out infinite'
        };
      default:
        return {};
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Frame glow effect */}
      {frame && showFrame && (
        <div 
          className={`absolute inset-0 rounded-2xl blur-sm`}
          style={getFrameStyle()}
        />
      )}
      
      {/* Avatar */}
      <div className="avatar">
        <div 
          className={`${sizeClasses[size]} rounded-2xl overflow-hidden`}
          style={getFrameStyle()}
        >
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Badge overlay (if any effect equipped) */}
      {customization?.effect && (
        <div className="absolute -top-1 -right-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>
      )}
    </div>
  );
}

interface CustomizedNameProps {
  name: string;
  customization?: ProfileCustomization;
  className?: string;
}

/**
 * CustomizedName - Имя с кастомизированным цветом
 */
export function CustomizedName({ 
  name, 
  customization,
  className = ''
}: CustomizedNameProps) {
  const nameColor = customization?.nameColor;
  
  const getNameStyle = (): React.CSSProperties => {
    if (!nameColor) return {};
    
    switch (nameColor.id) {
      case 'color_gold':
        return { color: '#fbbf24' };
      case 'color_silver':
        return { color: '#94a3b8' };
      case 'color_bronze':
        return { color: '#d97706' };
      case 'color_emerald':
        return { color: '#10b981' };
      case 'color_ruby':
        return { color: '#ef4444' };
      case 'color_sapphire':
        return { color: '#3b82f6' };
      case 'color_amethyst':
        return { color: '#a855f7' };
      case 'color_neon':
        return { 
          color: '#22d3ee',
          textShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee'
        };
      case 'color_rainbow':
        return { 
          background: 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        };
      case 'color_fire':
        return { 
          background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        };
      case 'color_ice':
        return { 
          background: 'linear-gradient(90deg, #67e8f9, #22d3ee, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        };
      case 'color_cosmic':
        return { 
          background: 'linear-gradient(90deg, #a855f7, #ec4899, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'cosmicShift 3s ease-in-out infinite',
        };
      default:
        return {};
    }
  };

  return (
    <span className={className} style={getNameStyle()}>
      {name}
    </span>
  );
}

interface CustomizedTitleProps {
  customization?: ProfileCustomization;
  className?: string;
}

/**
 * CustomizedTitle - Кастомный титул пользователя
 */
export function CustomizedTitle({ customization, className = '' }: CustomizedTitleProps) {
  const title = customization?.title;
  
  if (!title) return null;

  return (
    <div className={`badge badge-outline badge-sm ${className}`}>
      {title.value}
    </div>
  );
}

interface ProfileBackgroundProps {
  customization?: ProfileCustomization;
  children: React.ReactNode;
  className?: string;
}

/**
 * ProfileBackground - Фон профиля с кастомизацией
 */
export function ProfileBackground({ customization, children, className = '' }: ProfileBackgroundProps) {
  const background = customization?.background;
  
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) {
      return {
        background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.2))'
      };
    }
    
    switch (background.id) {
      case 'bg_default':
        return { background: 'linear-gradient(to bottom right, #1f2937, #111827)' };
      case 'bg_gradient_blue':
        return { background: 'linear-gradient(to bottom right, #1e3a5f, #0f172a)' };
      case 'bg_gradient_purple':
        return { background: 'linear-gradient(to bottom right, #4c1d95, #1e1b4b)' };
      case 'bg_gradient_green':
        return { background: 'linear-gradient(to bottom right, #14532d, #052e16)' };
      case 'bg_gradient_red':
        return { background: 'linear-gradient(to bottom right, #7f1d1d, #450a0a)' };
      case 'bg_gradient_gold':
        return { background: 'linear-gradient(to bottom right, #78350f, #451a03)' };
      case 'bg_sunset':
        return { background: 'linear-gradient(to bottom right, #9333ea, #ec4899, #f59e0b)' };
      case 'bg_ocean':
        return { background: 'linear-gradient(to bottom right, #0ea5e9, #06b6d4, #14b8a6)' };
      case 'bg_forest':
        return { background: 'linear-gradient(to bottom right, #166534, #15803d, #22c55e)' };
      case 'bg_neon':
        return { 
          background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a2e)',
          boxShadow: 'inset 0 0 100px rgba(34, 211, 238, 0.1)'
        };
      case 'bg_space':
        return { 
          background: 'linear-gradient(to bottom, #0f0f1a, #1a1a3e, #0f0f1a)',
        };
      case 'bg_rainbow':
        return { 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.3), rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
        };
      case 'bg_matrix':
        return { 
          background: 'linear-gradient(to bottom, #001a00, #003300, #001a00)',
        };
      case 'bg_aurora':
        return { 
          background: 'linear-gradient(135deg, #1e3a5f, #2d1b69, #14532d, #1e3a5f)',
          animation: 'aurora 10s ease-in-out infinite'
        };
      default:
        return {};
    }
  };

  return (
    <div className={className} style={getBackgroundStyle()}>
      {children}
    </div>
  );
}

// CSS для анимаций (добавить в index.css)
export const customizationStyles = `
@keyframes fireGlow {
  from { box-shadow: 0 0 0 3px #ef4444, 0 0 15px rgba(239, 68, 68, 0.5); }
  to { box-shadow: 0 0 0 3px #f97316, 0 0 25px rgba(249, 115, 22, 0.7); }
}

@keyframes rainbowBorder {
  0% { box-shadow: 0 0 0 3px #ef4444; }
  16% { box-shadow: 0 0 0 3px #f59e0b; }
  33% { box-shadow: 0 0 0 3px #22c55e; }
  50% { box-shadow: 0 0 0 3px #06b6d4; }
  66% { box-shadow: 0 0 0 3px #3b82f6; }
  83% { box-shadow: 0 0 0 3px #8b5cf6; }
  100% { box-shadow: 0 0 0 3px #ef4444; }
}

@keyframes legendaryPulse {
  0%, 100% { 
    box-shadow: 0 0 0 4px #a855f7, 0 0 20px rgba(168, 85, 247, 0.5); 
  }
  50% { 
    box-shadow: 0 0 0 4px #c084fc, 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(192, 132, 252, 0.4); 
  }
}

@keyframes cosmicShift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
}

@keyframes aurora {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`;
