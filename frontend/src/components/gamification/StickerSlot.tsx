import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { NFTSticker } from '../../types';

export type StickerRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface StickerSlotProps {
  sticker?: NFTSticker;
  size?: 'sm' | 'md' | 'lg';
  locked?: boolean;
  onClick?: () => void;
}

const rarityConfig: Record<StickerRarity, {
  border: string;
  glow: string;
  bg: string;
  label: string;
}> = {
  common: {
    border: 'border-base-content/30',
    glow: '',
    bg: 'bg-base-200',
    label: 'Обычный',
  },
  rare: {
    border: 'border-info',
    glow: 'shadow-lg shadow-info/30',
    bg: 'bg-info/10',
    label: 'Редкий',
  },
  epic: {
    border: 'border-secondary',
    glow: 'shadow-lg shadow-secondary/40',
    bg: 'bg-secondary/10',
    label: 'Эпический',
  },
  legendary: {
    border: 'border-warning',
    glow: 'shadow-xl shadow-warning/50 animate-pulse',
    bg: 'bg-gradient-to-br from-warning/20 to-orange-500/20',
    label: 'Легендарный',
  },
};

const sizeConfig = {
  sm: 'w-12 h-12 text-xl',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl',
};

/**
 * StickerSlot - Слот для NFT стикера
 * Показывает стикер или заблокированный слот
 */
export function StickerSlot({ sticker, size = 'md', locked = false, onClick }: StickerSlotProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (locked || !sticker) {
    return (
      <div 
        className={`
          ${sizeConfig[size]} 
          rounded-xl border-2 border-dashed border-base-content/20 
          bg-base-200/50 flex items-center justify-center
          transition-all hover:border-base-content/40
        `}
      >
        <Lock className="w-5 h-5 text-base-content/30" />
      </div>
    );
  }

  const rarity = rarityConfig[sticker.rarity];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
    >
      <div 
        className={`
          ${sizeConfig[size]} 
          rounded-xl border-2 ${rarity.border} ${rarity.bg} ${rarity.glow}
          flex items-center justify-center cursor-pointer
          transition-all hover:scale-110 active:scale-95
        `}
      >
        <span className="select-none">{sticker.imageUrl}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-base-300 rounded-lg p-2 shadow-xl min-w-[120px] text-center">
            <p className="font-medium text-sm">{sticker.name}</p>
            <p className={`text-xs ${
              sticker.rarity === 'legendary' ? 'text-warning' :
              sticker.rarity === 'epic' ? 'text-secondary' :
              sticker.rarity === 'rare' ? 'text-info' : 'text-base-content/60'
            }`}>
              {rarity.label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * StickerGrid - Сетка стикеров для профиля
 */
interface StickerGridProps {
  stickers: NFTSticker[];
  maxSlots?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StickerGrid({ stickers, maxSlots = 6, size = 'md' }: StickerGridProps) {
  const slots = Array(maxSlots).fill(null).map((_, i) => stickers[i] || null);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-warning" />
        <h3 className="font-semibold">NFT Стикеры</h3>
        <span className="text-sm text-base-content/60">
          {stickers.length}/{maxSlots}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {slots.map((sticker, index) => (
          <StickerSlot 
            key={index} 
            sticker={sticker || undefined} 
            size={size}
            locked={!sticker}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * StickerShowcase - Витрина стикеров с анимацией
 */
interface StickerShowcaseProps {
  stickers: NFTSticker[];
}

export function StickerShowcase({ stickers }: StickerShowcaseProps) {
  if (stickers.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        <Lock className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>Пока нет стикеров</p>
        <p className="text-sm">Участвуй в хакатонах, чтобы получить награды!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stickers.map((sticker) => (
        <div key={sticker.id} className="flex flex-col items-center gap-2">
          <StickerSlot sticker={sticker} size="lg" />
          <div className="text-center">
            <p className="text-sm font-medium truncate max-w-[80px]">{sticker.name}</p>
            <p className="text-xs text-base-content/60">
              {new Date(sticker.earnedAt).toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
