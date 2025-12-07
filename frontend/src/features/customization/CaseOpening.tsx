import { useState, useRef } from 'react';
import { Gift, Sparkles, X, Loader2 } from 'lucide-react';
import { Case, CustomizationItem, ItemRarity } from '../../types';
import { getRarityColor, getRarityName, backgrounds, nameColors, avatarFrames, badges } from '../../data/customization';
import { inventoryService } from '../../api';

interface CaseOpeningProps {
  caseItem: Case;
  onComplete: (droppedItem: CustomizationItem) => void;
  onClose: () => void;
}

/**
 * CaseOpening - Компонент с анимацией открытия кейса
 * Показывает рулетку предметов и выпавший предмет
 */
export function CaseOpening({ caseItem, onComplete, onClose }: CaseOpeningProps) {
  const [stage, setStage] = useState<'intro' | 'loading' | 'spinning' | 'reveal' | 'complete' | 'error'>('intro');
  const [droppedItem, setDroppedItem] = useState<CustomizationItem | null>(null);
  const [spinItems, setSpinItems] = useState<CustomizationItem[]>([]);
  const [spinOffset, setSpinOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const spinContainerRef = useRef<HTMLDivElement>(null);
  
  // Генерация предметов для рулетки из каталога
  const generateSpinItems = (finalItem: CustomizationItem): CustomizationItem[] => {
    const allItems = [...backgrounds, ...nameColors, ...avatarFrames, ...badges];
    const items: CustomizationItem[] = [];
    
    // Заполняем массив случайными предметами
    while (items.length < 60) {
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      items.push(randomItem);
    }
    
    // Вставляем выпавший предмет в позицию ~45
    items[45] = finalItem;
    
    return items;
  };
  
  // Запуск открытия кейса
  const startSpin = async () => {
    setStage('loading');
    setError(null);
    
    try {
      // Вызываем API для открытия кейса
      const caseId = parseInt(caseItem.id);
      if (isNaN(caseId)) {
        throw new Error('Invalid case ID');
      }
      
      const response = await inventoryService.openCase(caseId);
      
      // Преобразуем ответ в CustomizationItem
      const dropped: CustomizationItem = {
        id: response.droppedItem.itemId,
        name: response.droppedItem.name,
        description: '',
        type: response.droppedItem.type as CustomizationItem['type'],
        rarity: response.droppedItem.rarity as ItemRarity,
        value: response.droppedItem.value || '',
        previewUrl: '',
        isAnimated: response.droppedItem.rarity === 'legendary' || response.droppedItem.rarity === 'epic',
      };
      
      setDroppedItem(dropped);
      
      // Генерируем предметы для рулетки
      const items = generateSpinItems(dropped);
      setSpinItems(items);
      
      // Запускаем анимацию рулетки
      setStage('spinning');
      
      // Анимация прокрутки
      // Каждый предмет: w-28 (112px) + gap-2 (8px) = 120px
      // Финальный предмет на позиции 45
      // Нужно чтобы центр предмета 45 был в центре контейнера
      // Контейнер примерно 800px (max-w-4xl), центр = 400px
      // Центр предмета 45 = 45 * 120 + 60 (половина предмета) = 5460px
      // Смещение = -(5460 - 400) = -5060px
      const itemWidth = 120; // w-28 + gap
      const targetIndex = 45;
      const containerCenter = 400; // примерный центр контейнера
      const itemCenter = targetIndex * itemWidth + itemWidth / 2;
      const targetPosition = itemCenter - containerCenter;
      
      setTimeout(() => {
        setSpinOffset(-targetPosition);
      }, 100);
      
      // Переход к reveal после анимации
      setTimeout(() => {
        setStage('reveal');
      }, 5000);
      
      // Complete
      setTimeout(() => {
        setStage('complete');
      }, 6500);
      
    } catch (err) {
      console.error('Failed to open case:', err);
      setError(err instanceof Error ? err.message : 'Ошибка открытия кейса');
      setStage('error');
    }
  };
  
  // Завершение
  const handleComplete = () => {
    if (droppedItem) {
      onComplete(droppedItem);
    }
  };
  
  // Цвета фона по редкости
  const getRarityGlow = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-400/50';
      case 'uncommon': return 'shadow-green-500/50';
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-amber-500/50';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Close button */}
      {(stage === 'complete' || stage === 'error') && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-circle"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      
      {/* Loading stage */}
      {stage === 'loading' && (
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg">Открываем кейс...</p>
        </div>
      )}
      
      {/* Error stage */}
      {stage === 'error' && (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
            <X className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-error">Ошибка</h2>
          <p className="text-base-content/60 mb-6">{error}</p>
          <button onClick={onClose} className="btn btn-primary">
            Закрыть
          </button>
        </div>
      )}
      
      {/* Intro stage - показываем кейс */}
      {stage === 'intro' && (
        <div className="text-center animate-fade-in">
          <div className={`w-48 h-48 mx-auto mb-8 relative`}>
            {/* Case glow effect */}
            <div 
              className={`absolute inset-0 rounded-2xl blur-xl opacity-50`}
              style={{ backgroundColor: getRarityColor(caseItem.rarity) }}
            />
            {/* Case icon */}
            <div 
              className={`relative w-full h-full rounded-2xl flex items-center justify-center ${getRarityGlow(caseItem.rarity)} shadow-2xl`}
              style={{ 
                background: `linear-gradient(135deg, ${getRarityColor(caseItem.rarity)}40, ${getRarityColor(caseItem.rarity)}20)`,
                border: `2px solid ${getRarityColor(caseItem.rarity)}`
              }}
            >
              <Gift className="w-24 h-24" style={{ color: getRarityColor(caseItem.rarity) }} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{caseItem.name}</h2>
          <p className="text-base-content/60 mb-2">{caseItem.description}</p>
          <span 
            className="badge badge-lg mb-8"
            style={{ 
              backgroundColor: `${getRarityColor(caseItem.rarity)}20`,
              color: getRarityColor(caseItem.rarity),
              borderColor: getRarityColor(caseItem.rarity)
            }}
          >
            {getRarityName(caseItem.rarity)}
          </span>
          
          <div>
            <button 
              onClick={startSpin}
              className="btn btn-lg btn-primary gap-2 animate-pulse"
            >
              <Sparkles className="w-5 h-5" />
              Открыть кейс
            </button>
          </div>
        </div>
      )}
      
      {/* Spinning stage - рулетка */}
      {stage === 'spinning' && (
        <div className="w-full max-w-4xl">
          {/* Indicator */}
          <div className="relative mb-4">
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-8 bg-primary z-10" />
            <div className="absolute left-1/2 -translate-x-1/2 top-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary z-10" />
          </div>
          
          {/* Spin container */}
          <div className="relative overflow-hidden rounded-xl bg-base-200 p-4">
            <div 
              ref={spinContainerRef}
              className="flex gap-2 transition-transform duration-[5000ms] ease-out"
              style={{ transform: `translateX(${spinOffset}px)` }}
            >
              {spinItems.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className={`flex-shrink-0 w-28 h-28 rounded-lg flex flex-col items-center justify-center p-2`}
                  style={{ 
                    background: item.type === 'background' ? item.value : `${getRarityColor(item.rarity)}20`,
                    border: `2px solid ${getRarityColor(item.rarity)}`
                  }}
                >
                  {item.type === 'badge' && <span className="text-3xl">{item.value}</span>}
                  {item.type === 'nameColor' && (
                    <span 
                      className="text-lg font-bold"
                      style={{ color: item.value.startsWith('linear') ? undefined : item.value }}
                    >
                      Aa
                    </span>
                  )}
                  {item.type === 'background' && <span className="text-xs text-center">{item.name}</span>}
                  {item.type === 'avatarFrame' && (
                    <div className="w-12 h-12 rounded-full bg-base-300" style={{ border: item.value !== 'none' ? item.value.split(';')[0] : undefined }} />
                  )}
                  {item.type === 'title' && <span className="text-sm font-medium">{item.value}</span>}
                  {item.type === 'effect' && <Sparkles className="w-8 h-8" style={{ color: getRarityColor(item.rarity) }} />}
                </div>
              ))}
            </div>
            
            {/* Gradient overlays */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-base-200 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-base-200 to-transparent pointer-events-none" />
          </div>
        </div>
      )}
      
      {/* Reveal/Complete stage - показываем выпавший предмет */}
      {(stage === 'reveal' || stage === 'complete') && droppedItem && (
        <div className="text-center animate-scale-in">
          {/* Glow effect */}
          <div className="relative">
            <div 
              className={`absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse`}
              style={{ 
                backgroundColor: getRarityColor(droppedItem.rarity),
                width: '300px',
                height: '300px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Item card */}
            <div 
              className={`relative w-64 h-64 mx-auto mb-8 rounded-2xl flex flex-col items-center justify-center ${getRarityGlow(droppedItem.rarity)} shadow-2xl`}
              style={{ 
                background: droppedItem.type === 'background' 
                  ? droppedItem.value 
                  : `linear-gradient(135deg, ${getRarityColor(droppedItem.rarity)}40, ${getRarityColor(droppedItem.rarity)}10)`,
                border: `3px solid ${getRarityColor(droppedItem.rarity)}`
              }}
            >
              {droppedItem.type === 'badge' && <span className="text-7xl">{droppedItem.value}</span>}
              {droppedItem.type === 'nameColor' && (
                <span 
                  className="text-5xl font-bold"
                  style={{ 
                    color: droppedItem.value.startsWith('linear') ? undefined : droppedItem.value,
                    background: droppedItem.value.startsWith('linear') ? droppedItem.value : undefined,
                    WebkitBackgroundClip: droppedItem.value.startsWith('linear') ? 'text' : undefined,
                    WebkitTextFillColor: droppedItem.value.startsWith('linear') ? 'transparent' : undefined,
                  }}
                >
                  Ник
                </span>
              )}
              {droppedItem.type === 'background' && (
                <span className="text-lg font-medium text-white drop-shadow-lg">{droppedItem.name}</span>
              )}
              {droppedItem.type === 'avatarFrame' && (
                <div 
                  className="w-24 h-24 rounded-full bg-base-300" 
                  style={{ border: droppedItem.value !== 'none' ? droppedItem.value.split(';')[0] : undefined }} 
                />
              )}
              {droppedItem.type === 'title' && (
                <span className="text-2xl font-bold">{droppedItem.value}</span>
              )}
              {droppedItem.type === 'effect' && (
                <Sparkles className="w-20 h-20" style={{ color: getRarityColor(droppedItem.rarity) }} />
              )}
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">{droppedItem.name}</h2>
          <p className="text-base-content/60 mb-2">{droppedItem.description}</p>
          <span 
            className="badge badge-lg mb-8"
            style={{ 
              backgroundColor: `${getRarityColor(droppedItem.rarity)}20`,
              color: getRarityColor(droppedItem.rarity),
              borderColor: getRarityColor(droppedItem.rarity)
            }}
          >
            {getRarityName(droppedItem.rarity)}
          </span>
          
          {stage === 'complete' && (
            <div className="space-y-3">
              <button 
                onClick={handleComplete}
                className="btn btn-lg btn-primary btn-block"
              >
                Забрать предмет
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* CSS animations */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/**
 * CaseCard - Карточка кейса в инвентаре
 */
interface CaseCardProps {
  caseItem: Case;
  onOpen: () => void;
}

export function CaseCard({ caseItem, onOpen }: CaseCardProps) {
  const rarityColor = getRarityColor(caseItem.rarity);
  
  return (
    <div 
      className="card bg-base-200 cursor-pointer hover:scale-105 transition-transform"
      onClick={onOpen}
    >
      <div className="card-body items-center text-center p-4">
        <div 
          className="w-20 h-20 rounded-xl flex items-center justify-center mb-2"
          style={{ 
            background: `linear-gradient(135deg, ${rarityColor}40, ${rarityColor}20)`,
            border: `2px solid ${rarityColor}`
          }}
        >
          <Gift className="w-10 h-10" style={{ color: rarityColor }} />
        </div>
        <h3 className="font-semibold text-sm">{caseItem.name}</h3>
        <span 
          className="badge badge-sm"
          style={{ 
            backgroundColor: `${rarityColor}20`,
            color: rarityColor,
          }}
        >
          {getRarityName(caseItem.rarity)}
        </span>
      </div>
    </div>
  );
}
