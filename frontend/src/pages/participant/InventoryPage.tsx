import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Sparkles, 
  Image, 
  Palette, 
  Frame, 
  Award, 
  Crown,
  Zap,
  Gift,
  Trophy,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  CustomizationItem, 
  CustomizationItemType, 
  Case,
  Achievement,
  InventoryItem
} from '../../types';
import { 
  achievements as allAchievements,
  getRarityColor,
  getRarityName
} from '../../data/customization';
import { CaseOpening, CaseCard } from '../../features/customization/CaseOpening';
import { useInventoryStore } from '../../store';

type InventoryTab = 'items' | 'cases' | 'achievements';
type ItemFilter = 'all' | CustomizationItemType;

const typeIcons: Record<CustomizationItemType, React.ReactNode> = {
  background: <Image className="w-4 h-4" />,
  nameColor: <Palette className="w-4 h-4" />,
  avatarFrame: <Frame className="w-4 h-4" />,
  badge: <Award className="w-4 h-4" />,
  title: <Crown className="w-4 h-4" />,
  effect: <Zap className="w-4 h-4" />,
};

const typeLabels: Record<CustomizationItemType | 'all', string> = {
  all: 'Все',
  background: 'Фоны',
  nameColor: 'Цвета ника',
  avatarFrame: 'Рамки',
  badge: 'Значки',
  title: 'Титулы',
  effect: 'Эффекты',
};

/**
 * InventoryPage - Страница инвентаря и кастомизации профиля
 * Использует реальный API через useInventoryStore
 */
export function InventoryPage() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<InventoryTab>('items');
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const [openingCase, setOpeningCase] = useState<Case | null>(null);
  const [selectedItem, setSelectedItem] = useState<CustomizationItem | null>(null);
  
  // Получаем данные из store
  const { 
    items: storeItems, 
    cases: storeCases, 
    achievements: storeAchievements,
    customization,
    isLoading,
    error,
    fetchInventory,
    equipItem: storeEquipItem,
    clearError
  } = useInventoryStore();
  
  // Загружаем инвентарь при монтировании (всегда обновляем при заходе на страницу)
  useEffect(() => {
    // Всегда загружаем при монтировании для актуальности данных
    fetchInventory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Конвертируем CustomizationItem[] в InventoryItem[] для отображения
  const inventory = useMemo<InventoryItem[]>(() => {
    return storeItems.map(item => ({
      item,
      quantity: 1, // TODO: добавить quantity в API
      obtainedAt: new Date(),
      isEquipped: isItemEquipped(item),
    }));
  }, [storeItems, customization]);
  
  // Проверка экипирован ли предмет
  function isItemEquipped(item: CustomizationItem): boolean {
    switch (item.type) {
      case 'background':
        return customization.background?.id === item.id;
      case 'nameColor':
        return customization.nameColor?.id === item.id;
      case 'avatarFrame':
        return customization.avatarFrame?.id === item.id;
      case 'title':
        return customization.title?.id === item.id;
      case 'effect':
        return customization.effect?.id === item.id;
      case 'badge':
        return customization.badges.some(b => b.id === item.id);
      default:
        return false;
    }
  }
  
  // Используем только реальные кейсы из API
  const cases = storeCases;
  
  const earnedAchievements = storeAchievements.length > 0 
    ? storeAchievements.filter(a => a.earnedAt) 
    : allAchievements.slice(0, 3).map(a => ({ ...a, earnedAt: new Date() }));
  
  // Фильтрация предметов
  const filteredItems = useMemo(() => {
    // Показываем только реальные предметы из API
    if (itemFilter === 'all') return inventory;
    return inventory.filter(inv => inv.item.type === itemFilter);
  }, [inventory, itemFilter]);
  
  // Неоткрытые кейсы
  const unopenedCases = cases.filter(c => !c.isOpened);
  
  // Экипировать предмет
  const equipItem = async (item: CustomizationItem) => {
    await storeEquipItem(item);
    setSelectedItem(null);
  };
  
  // Открытие кейса
  const handleOpenCase = (caseItem: Case) => {
    setOpeningCase(caseItem);
  };
  
  // Завершение открытия кейса - CaseOpening уже вызвал API
  const handleCaseOpened = (_droppedItem: CustomizationItem) => {
    if (!openingCase) return;
    
    // Обновляем состояние - перезагружаем инвентарь
    fetchInventory();
    setOpeningCase(null);
  };
  
  // Закрытие окна кейса
  const handleCaseClose = () => {
    // Перезагружаем инвентарь на случай если кейс был открыт
    fetchInventory();
    setOpeningCase(null);
  };
  
  // Рендер предмета
  const renderItem = (invItem: InventoryItem) => {
    const { item, isEquipped } = invItem;
    const rarityColor = getRarityColor(item.rarity);
    
    return (
      <div 
        key={item.id}
        onClick={() => setSelectedItem(item)}
        className={`card bg-base-200 cursor-pointer hover:scale-105 transition-all ${
          isEquipped ? 'ring-2 ring-primary' : ''
        }`}
      >
        <div className="card-body items-center text-center p-3">
          {/* Preview */}
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center mb-2"
            style={{ 
              background: item.type === 'background' ? item.value : `${rarityColor}20`,
              border: `2px solid ${rarityColor}`
            }}
          >
            {item.type === 'badge' && <span className="text-2xl">{item.value}</span>}
            {item.type === 'nameColor' && (
              <span 
                className="text-xl font-bold"
                style={{ 
                  color: item.value.startsWith('linear') ? undefined : item.value,
                  background: item.value.startsWith('linear') ? item.value : undefined,
                  WebkitBackgroundClip: item.value.startsWith('linear') ? 'text' : undefined,
                  WebkitTextFillColor: item.value.startsWith('linear') ? 'transparent' : undefined,
                }}
              >
                Aa
              </span>
            )}
            {item.type === 'avatarFrame' && (
              <div 
                className="w-10 h-10 rounded-full bg-base-300"
                style={{ border: item.value !== 'none' ? item.value.split(';')[0] : undefined }}
              />
            )}
            {item.type === 'title' && <Crown className="w-8 h-8" style={{ color: rarityColor }} />}
            {item.type === 'effect' && <Sparkles className="w-8 h-8" style={{ color: rarityColor }} />}
            {item.type === 'background' && <Image className="w-8 h-8 text-white/60" />}
          </div>
          
          <h4 className="font-medium text-xs truncate w-full">{item.name}</h4>
          
          <div className="flex items-center gap-1">
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: rarityColor }}
            />
            {isEquipped && <CheckCircle2 className="w-3 h-3 text-primary" />}
          </div>
        </div>
      </div>
    );
  };
  
  // Рендер достижения
  const renderAchievement = (achievement: Achievement, isEarned: boolean) => {
    const rarityColor = getRarityColor(achievement.rarity);
    
    return (
      <div 
        key={achievement.id}
        className={`card ${isEarned ? 'bg-base-200' : 'bg-base-200/50'}`}
      >
        <div className="card-body p-4">
          <div className="flex items-start gap-3">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                isEarned ? '' : 'grayscale opacity-50'
              }`}
              style={{ 
                background: `${rarityColor}20`,
                border: `2px solid ${rarityColor}`
              }}
            >
              {achievement.iconUrl}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{achievement.name}</h4>
              <p className="text-xs text-base-content/60">{achievement.description}</p>
              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mt-2">
                  <progress 
                    className="progress progress-primary w-full h-2" 
                    value={achievement.progress} 
                    max={achievement.maxProgress}
                  />
                  <p className="text-xs text-right mt-1">
                    {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              )}
            </div>
            {isEarned && (
              <span 
                className="badge badge-sm"
                style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
              >
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-100 pb-24">
      {/* Error Toast */}
      {error && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={clearError} className="btn btn-ghost btn-xs">✕</button>
          </div>
        </div>
      )}
      
      {/* Case Opening Modal */}
      {openingCase && (
        <CaseOpening 
          caseItem={openingCase}
          onComplete={handleCaseOpened}
          onClose={handleCaseClose}
        />
      )}
      
      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-base-100 rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{ 
                  background: selectedItem.type === 'background' 
                    ? selectedItem.value 
                    : `${getRarityColor(selectedItem.rarity)}20`,
                  border: `2px solid ${getRarityColor(selectedItem.rarity)}`
                }}
              >
                {selectedItem.type === 'badge' && <span className="text-4xl">{selectedItem.value}</span>}
                {selectedItem.type === 'nameColor' && (
                  <span 
                    className="text-3xl font-bold"
                    style={{ 
                      color: selectedItem.value.startsWith('linear') ? undefined : selectedItem.value,
                      background: selectedItem.value.startsWith('linear') ? selectedItem.value : undefined,
                      WebkitBackgroundClip: selectedItem.value.startsWith('linear') ? 'text' : undefined,
                      WebkitTextFillColor: selectedItem.value.startsWith('linear') ? 'transparent' : undefined,
                    }}
                  >
                    Aa
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{selectedItem.name}</h3>
                <p className="text-sm text-base-content/60">{selectedItem.description}</p>
                <span 
                  className="badge badge-sm mt-2"
                  style={{ 
                    backgroundColor: `${getRarityColor(selectedItem.rarity)}20`,
                    color: getRarityColor(selectedItem.rarity)
                  }}
                >
                  {getRarityName(selectedItem.rarity)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedItem(null)}
                className="btn btn-ghost flex-1"
              >
                Закрыть
              </button>
              <button 
                onClick={() => equipItem(selectedItem)}
                className="btn btn-primary flex-1"
              >
                Экипировать
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Инвентарь</h1>
            <p className="text-sm text-base-content/60">
              Кастомизация профиля
            </p>
          </div>
          <button 
            onClick={() => fetchInventory()}
            disabled={isLoading}
            className="btn btn-ghost btn-circle btn-sm"
            title="Обновить"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-300 p-1">
          <button 
            onClick={() => setActiveTab('items')}
            className={`tab flex-1 gap-1 ${activeTab === 'items' ? 'tab-active' : ''}`}
          >
            <Package className="w-4 h-4" />
            Предметы
          </button>
          <button 
            onClick={() => setActiveTab('cases')}
            className={`tab flex-1 gap-1 ${activeTab === 'cases' ? 'tab-active' : ''}`}
          >
            <Gift className="w-4 h-4" />
            Кейсы
            {unopenedCases.length > 0 && (
              <span className="badge badge-primary badge-xs">{unopenedCases.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`tab flex-1 gap-1 ${activeTab === 'achievements' ? 'tab-active' : ''}`}
          >
            <Trophy className="w-4 h-4" />
            Достижения
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Items tab */}
        {activeTab === 'items' && (
          <>
            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {(['all', 'background', 'nameColor', 'avatarFrame', 'badge', 'title', 'effect'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setItemFilter(type)}
                  className={`btn btn-sm gap-1 shrink-0 ${
                    itemFilter === type ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {type !== 'all' && typeIcons[type]}
                  {typeLabels[type]}
                </button>
              ))}
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                <p className="text-base-content/60">Предметы не найдены</p>
                <p className="text-sm text-base-content/40">Открывайте кейсы для получения предметов</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredItems.map(renderItem)}
              </div>
            )}
          </>
        )}
        
        {/* Cases tab */}
        {activeTab === 'cases' && (
          <>
            {unopenedCases.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                <p className="text-base-content/60">Нет доступных кейсов</p>
                <p className="text-sm text-base-content/40">
                  Кейсы можно получить за участие в хакатонах
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {unopenedCases.map(caseItem => (
                  <CaseCard 
                    key={caseItem.id}
                    caseItem={caseItem}
                    onOpen={() => handleOpenCase(caseItem)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Achievements tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-base-content/60 mb-2">
              Полученные ({earnedAchievements.length})
            </h3>
            {earnedAchievements.map(ach => renderAchievement(ach, true))}
            
            <h3 className="font-semibold text-sm text-base-content/60 mb-2 mt-6">
              Доступные ({allAchievements.length - earnedAchievements.length})
            </h3>
            {allAchievements
              .filter(a => !earnedAchievements.find(e => e.id === a.id))
              .map(ach => renderAchievement(ach, false))
            }
          </div>
        )}
      </div>
      
      {/* CSS */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
