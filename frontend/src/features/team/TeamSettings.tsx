import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Palette, 
  Type, 
  Square,
  Check,
  Package
} from 'lucide-react';
import { Team } from '../../types';
import { teamService, TeamCustomization, inventoryService, InventoryItem } from '../../api/services';

interface TeamSettingsProps {
  team: Team;
  onClose: () => void;
  onUpdate: (team: Team) => void;
}

// Базовые бесплатные опции
const DEFAULT_BACKGROUNDS = [
  { id: 'default', name: 'По умолчанию', value: '', rarity: 'common' as const },
];

const DEFAULT_BORDERS = [
  { id: 'none', name: 'Без рамки', value: '', rarity: 'common' as const },
];

const DEFAULT_NAME_COLORS = [
  { id: 'white', name: 'Белый', value: '', rarity: 'common' as const },
];

// Функция для получения цвета редкости
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'text-yellow-500';
    case 'epic': return 'text-purple-500';
    case 'rare': return 'text-blue-500';
    case 'uncommon': return 'text-green-500';
    default: return 'text-base-content/50';
  }
};

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'ring-yellow-500';
    case 'epic': return 'ring-purple-500';
    case 'rare': return 'ring-blue-500';
    case 'uncommon': return 'ring-green-500';
    default: return 'ring-base-content/20';
  }
};

/**
 * TeamSettings - Настройки кастомизации команды
 */
export function TeamSettings({ team, onClose, onUpdate }: TeamSettingsProps) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || '');
  const [background, setBackground] = useState(team.background || '');
  const [borderColor, setBorderColor] = useState(team.borderColor || '');
  const [nameColor, setNameColor] = useState(team.nameColor || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'style'>('general');
  
  // Предметы из инвентаря
  const [inventoryBackgrounds, setInventoryBackgrounds] = useState<InventoryItem[]>([]);
  const [inventoryBorders, setInventoryBorders] = useState<InventoryItem[]>([]);
  const [inventoryNameColors, setInventoryNameColors] = useState<InventoryItem[]>([]);

  // Загрузка инвентаря
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await inventoryService.getInventory();
        const items = response.items || [];
        
        // Фильтруем предметы по типу
        setInventoryBackgrounds(items.filter(i => i.type === 'background'));
        setInventoryBorders(items.filter(i => i.type === 'avatarFrame')); // Используем avatarFrame как рамку
        setInventoryNameColors(items.filter(i => i.type === 'nameColor'));
      } catch (error) {
        console.error('Failed to load inventory:', error);
      } finally {
        setIsLoadingInventory(false);
      }
    };
    
    loadInventory();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const data: TeamCustomization = {
        name: name !== team.name ? name : undefined,
        description: description !== team.description ? description : undefined,
        background: background || undefined,
        borderColor: borderColor || undefined,
        nameColor: nameColor || undefined,
      };

      const updatedTeam = await teamService.updateCustomization(team.id, data);
      onUpdate(updatedTeam);
      onClose();
    } catch (error) {
      console.error('Failed to update team:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setIsLoading(false);
    }
  };

  const getNameStyle = (): React.CSSProperties => {
    if (!nameColor) return {};
    if (nameColor.startsWith('linear-gradient')) {
      return {
        background: nameColor,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return { color: nameColor };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-base-100 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h2 className="text-lg font-bold">Настройки команды</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div 
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{
            background: background || 'hsl(var(--b2))',
            border: borderColor ? `2px solid ${borderColor}` : undefined,
          }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold" style={getNameStyle()}>
              {name || 'Название команды'}
            </h3>
            {description && (
              <p className="text-sm text-base-content/60 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mx-4 mt-4">
          <button 
            className={`tab flex-1 ${activeTab === 'general' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Основное
          </button>
          <button 
            className={`tab flex-1 ${activeTab === 'style' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            Стиль
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Название команды</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input input-bordered"
                  maxLength={30}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Описание</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="textarea textarea-bordered"
                  rows={3}
                  placeholder="Расскажите о своей команде..."
                  maxLength={200}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isLoadingInventory ? (
                <div className="flex flex-col items-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary" />
                  <p className="text-sm text-base-content/60 mt-2">Загрузка инвентаря...</p>
                </div>
              ) : (
                <>
                  {/* Background */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Palette className="w-4 h-4" />
                      Фон
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Базовый бесплатный фон */}
                      {DEFAULT_BACKGROUNDS.map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => setBackground(bg.value)}
                          className={`aspect-square rounded-lg border-2 transition-all ${
                            background === bg.value 
                              ? 'border-primary ring-2 ring-primary/30' 
                              : 'border-base-300 hover:border-base-content/30'
                          }`}
                          style={{ background: bg.value || 'hsl(var(--b2))' }}
                          title={bg.name}
                        >
                          {background === bg.value && (
                            <Check className="w-5 h-5 text-base-content drop-shadow-lg mx-auto" />
                          )}
                        </button>
                      ))}
                      
                      {/* Фоны из инвентаря */}
                      {inventoryBackgrounds.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setBackground(item.value)}
                          className={`aspect-square rounded-lg border-2 transition-all relative ${
                            background === item.value 
                              ? `border-primary ring-2 ${getRarityBorder(item.rarity)}` 
                              : `border-base-300 hover:border-base-content/30`
                          }`}
                          style={{ background: item.value || 'hsl(var(--b2))' }}
                          title={`${item.name} (${item.rarity})`}
                        >
                          {background === item.value && (
                            <Check className="w-5 h-5 text-white drop-shadow-lg mx-auto" />
                          )}
                          <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getRarityColor(item.rarity).replace('text-', 'bg-')}`} />
                        </button>
                      ))}
                      
                      {inventoryBackgrounds.length === 0 && (
                        <div className="col-span-3 flex items-center gap-2 text-sm text-base-content/50 p-2">
                          <Package className="w-4 h-4" />
                          <span>Откройте кейсы, чтобы получить фоны</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Border */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Square className="w-4 h-4" />
                      Рамка
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Базовая без рамки */}
                      {DEFAULT_BORDERS.map(border => (
                        <button
                          key={border.id}
                          onClick={() => setBorderColor(border.value)}
                          className={`aspect-square rounded-lg transition-all ${
                            borderColor === border.value 
                              ? 'ring-2 ring-primary' 
                              : ''
                          }`}
                          style={{ 
                            border: '3px dashed hsl(var(--bc) / 0.2)',
                            background: 'hsl(var(--b2))',
                          }}
                          title={border.name}
                        >
                          {borderColor === border.value && (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          )}
                        </button>
                      ))}
                      
                      {/* Рамки из инвентаря */}
                      {inventoryBorders.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setBorderColor(item.value)}
                          className={`aspect-square rounded-lg transition-all relative ${
                            borderColor === item.value 
                              ? `ring-2 ${getRarityBorder(item.rarity)}` 
                              : ''
                          }`}
                          style={{ 
                            border: `3px solid ${item.value}`,
                            background: 'hsl(var(--b2))',
                          }}
                          title={`${item.name} (${item.rarity})`}
                        >
                          {borderColor === item.value && (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          )}
                          <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getRarityColor(item.rarity).replace('text-', 'bg-')}`} />
                        </button>
                      ))}
                      
                      {inventoryBorders.length === 0 && (
                        <div className="col-span-3 flex items-center gap-2 text-sm text-base-content/50 p-2">
                          <Package className="w-4 h-4" />
                          <span>Откройте кейсы, чтобы получить рамки</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name color */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Type className="w-4 h-4" />
                      Цвет названия
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Базовый белый цвет */}
                      {DEFAULT_NAME_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setNameColor(color.value)}
                          className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                            nameColor === color.value 
                              ? 'border-primary ring-2 ring-primary/30' 
                              : 'border-base-300 hover:border-base-content/30'
                          }`}
                          style={{ background: 'hsl(var(--b2))' }}
                          title={color.name}
                        >
                          <span className="font-bold text-sm">Aa</span>
                        </button>
                      ))}
                      
                      {/* Цвета из инвентаря */}
                      {inventoryNameColors.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setNameColor(item.value)}
                          className={`h-10 rounded-lg border-2 transition-all flex items-center justify-center relative ${
                            nameColor === item.value 
                              ? `border-primary ring-2 ${getRarityBorder(item.rarity)}` 
                              : 'border-base-300 hover:border-base-content/30'
                          }`}
                          style={{ background: 'hsl(var(--b2))' }}
                          title={`${item.name} (${item.rarity})`}
                        >
                          <span 
                            className="font-bold text-sm"
                            style={
                              item.value.startsWith('linear-gradient') 
                                ? {
                                    background: item.value,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                  }
                                : { color: item.value || 'inherit' }
                            }
                          >
                            Aa
                          </span>
                          <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getRarityColor(item.rarity).replace('text-', 'bg-')}`} />
                        </button>
                      ))}
                      
                      {inventoryNameColors.length === 0 && (
                        <div className="col-span-3 flex items-center gap-2 text-sm text-base-content/50 p-2">
                          <Package className="w-4 h-4" />
                          <span>Откройте кейсы, чтобы получить цвета</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-base-200">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Отмена
          </button>
          <button 
            onClick={handleSave} 
            className="btn btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
