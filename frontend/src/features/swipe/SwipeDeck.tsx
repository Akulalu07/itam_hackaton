import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import { 
  X, 
  Heart, 
  Undo2, 
  Star, 
  Trophy, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { User } from '../../types';
import { useSwipeStore, useTeamStore, useHackathonStore, useAuthStore } from '../../store/useStore';
import { EmptyState } from '../../components/common';
import { ROUTES } from '../../routes';
import { getRarityColor } from '../../data/customization';
import { SwipeFiltersModal } from './SwipeFiltersModal';

// Skill level colors
const skillLevelColors: Record<string, string> = {
  beginner: 'badge-ghost',
  intermediate: 'badge-info',
  advanced: 'badge-success',
  expert: 'badge-warning',
};

// Title colors
const titleColors: Record<string, string> = {
  'Новичок': 'text-base-content/60',
  'Участник': 'text-info',
  'Активист': 'text-success',
  'Профи': 'text-warning',
  'Легенда': 'text-error',
};

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: string) => void;
  onCardLeftScreen: (direction: string) => void;
  style?: React.CSSProperties;
  isTop?: boolean;
}

/**
 * SwipeCard - Карточка пользователя для свайпа
 */
function SwipeCard({ user, onSwipe, onCardLeftScreen, style, isTop = false }: SwipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Получаем стили кастомизации
  const customization = user.customization;
  
  // Фон карточки
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!customization?.background) {
      return {};
    }
    return {
      background: customization.background.value,
    };
  };
  
  // Стиль имени
  const getNameStyle = (): React.CSSProperties => {
    if (!customization?.nameColor) return {};
    const value = customization.nameColor.value;
    if (value.startsWith('linear-gradient')) {
      return {
        background: value,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return { color: value };
  };
  
  // Стиль рамки аватара
  const getFrameStyle = (): React.CSSProperties => {
    if (!customization?.avatarFrame) {
      return {};
    }
    const frame = customization.avatarFrame;
    // Применяем цвет рамки на основе редкости
    return {
      boxShadow: `0 0 0 3px ${getRarityColor(frame.rarity)}, 0 0 15px ${getRarityColor(frame.rarity)}50`,
    };
  };

  return (
    <TinderCard
      className={`absolute w-full h-full ${isTop ? 'swipe-card-top' : ''}`}
      onSwipe={onSwipe}
      onCardLeftScreen={onCardLeftScreen}
      preventSwipe={['up', 'down']}
      swipeRequirementType="position"
      swipeThreshold={100}
    >
      <div 
        className="card bg-base-200 w-full h-full shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={style}
      >
        {/* Background gradient - с кастомизацией */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={customization?.background ? getBackgroundStyle() : undefined}
        >
          {!customization?.background && (
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-base-200" />
          )}
        </div>
        
        {/* Avatar Section */}
        <div className="relative pt-6 px-6">
          <div className="flex items-start gap-4">
            {/* Avatar с кастомной рамкой */}
            <div className="relative">
              <div className="avatar">
                <div 
                  className="w-20 h-20 rounded-2xl ring-2 ring-offset-2 ring-offset-base-200"
                  style={customization?.avatarFrame ? getFrameStyle() : { boxShadow: '0 0 0 2px hsl(var(--p))' }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="rounded-2xl" />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-2xl font-bold rounded-2xl w-full h-full">
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-base-200" />
              {/* Effect indicator */}
              {customization?.effect && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-warning text-[10px] items-center justify-center">✨</span>
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 
                className="text-xl font-bold truncate"
                style={getNameStyle()}
              >
                {user.name}
              </h2>
              
              {/* Custom Title or Default */}
              {customization?.title ? (
                <span 
                  className="text-sm font-medium badge badge-sm"
                  style={{ 
                    backgroundColor: getRarityColor(customization.title.rarity) + '20',
                    color: getRarityColor(customization.title.rarity)
                  }}
                >
                  {customization.title.value}
                </span>
              ) : (
                <p className={`text-sm font-medium ${titleColors[user.title] || 'text-base-content'}`}>
                  {user.title}
                </p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold">{user.pts || 0}</span>
                  <span className="text-xs text-base-content/60">PTS</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold">{user.mmr || 0}</span>
                  <span className="text-xs text-base-content/60">MMR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges (кастомные бейджи или NFT стикеры) */}
          {customization?.badges && customization.badges.length > 0 ? (
            <div className="flex gap-2 mt-3">
              {customization.badges.slice(0, 4).map(badge => (
                <div 
                  key={badge.id}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl tooltip"
                  style={{ backgroundColor: getRarityColor(badge.rarity) + '20' }}
                  data-tip={badge.name}
                >
                  {badge.value}
                </div>
              ))}
            </div>
          ) : user.nftStickers && user.nftStickers.length > 0 ? (
            <div className="flex gap-2 mt-3">
              {user.nftStickers.slice(0, 4).map(sticker => (
                <div 
                  key={sticker.id}
                  className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center text-xl tooltip"
                  data-tip={sticker.name}
                >
                  {sticker.imageUrl}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Skills */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-base-content/70 mb-2">Навыки</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills && user.skills.slice(0, expanded ? undefined : 4).map(skill => (
              <span 
                key={skill.id}
                className={`badge ${skillLevelColors[skill.level]} badge-lg`}
              >
                {skill.name}
              </span>
            ))}
            {!expanded && user.skills && user.skills.length > 4 && (
              <span className="badge badge-outline badge-lg">
                +{user.skills.length - 4}
              </span>
            )}
            {(!user.skills || user.skills.length === 0) && (
              <span className="text-sm text-base-content/50">Навыки не указаны</span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 flex-1 overflow-hidden">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-base-content/70 mb-2"
          >
            <span>О себе</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <p className={`text-sm text-base-content/80 ${expanded ? '' : 'line-clamp-3'}`}>
            {user.bio || 'Пользователь пока не рассказал о себе'}
          </p>
        </div>

        {/* Experience Badge */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">Опыт:</span>
            <span className="badge badge-primary badge-outline">
              {user.experience || 'Не указан'}
            </span>
          </div>
        </div>

        {/* Swipe Indicators - LIKE (right) */}
        <div className="absolute top-12 left-6 pointer-events-none swipe-like-indicator transition-all duration-200">
          <div className="flex items-center gap-2 bg-success text-success-content px-6 py-3 rounded-2xl font-bold rotate-[-15deg] border-4 border-success shadow-2xl">
            <Heart className="w-6 h-6 fill-current" />
            <span className="text-xl">ПРИГЛАСИТЬ</span>
          </div>
        </div>
        
        {/* Swipe Indicators - NOPE (left) */}
        <div className="absolute top-12 right-6 pointer-events-none swipe-nope-indicator transition-all duration-200">
          <div className="flex items-center gap-2 bg-error text-error-content px-6 py-3 rounded-2xl font-bold rotate-[15deg] border-4 border-error shadow-2xl">
            <X className="w-6 h-6" />
            <span className="text-xl">ПРОПУСТИТЬ</span>
          </div>
        </div>
      </div>
    </TinderCard>
  );
}

/**
 * SwipeDeck - Tinder-like свайп интерфейс для капитанов
 */
export function SwipeDeck() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTeam } = useTeamStore();
  const { selectedHackathon } = useHackathonStore();
  const { 
    deck, 
    lastSwipedUser, 
    isLoading, 
    error, 
    fetchDeck, 
    swipe: performSwipe, 
    undoLastSwipe,
    resetDeck 
  } = useSwipeStore();
  
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const currentIndex = deck.length - 1;
  const cardRefs = useRef<(any)[]>([]);

  // Загрузка колоды при монтировании
  useEffect(() => {
    const hackathonId = selectedHackathon?.id || user?.currentHackathonId;
    fetchDeck(hackathonId);
  }, [fetchDeck, selectedHackathon?.id, user?.currentHackathonId]);

  // Обновить колоду после изменения фильтров
  const handleFiltersApply = useCallback(() => {
    const hackathonId = selectedHackathon?.id || user?.currentHackathonId;
    resetDeck();
    fetchDeck(hackathonId);
  }, [fetchDeck, resetDeck, selectedHackathon?.id, user?.currentHackathonId]);

  // Swipe handlers
  const handleSwipe = useCallback(async (direction: string, swipedUser: User) => {
    setSwipeDirection(direction);
    setToastVisible(true);
    
    // Скрыть toast через 2 секунды
    setTimeout(() => {
      setToastVisible(false);
      setSwipeDirection(null);
    }, 2000);
    
    // Отправить свайп на сервер
    const swipeDir = direction === 'right' ? 'right' : 'left';
    await performSwipe(swipedUser.id, swipeDir);
  }, [performSwipe]);

  const handleCardLeftScreen = useCallback((_userId: string) => {
    // Карточка уже удалена из стора при свайпе
  }, []);

  // Manual swipe buttons
  const swipeLeft = useCallback(() => {
    if (currentIndex < 0) return;
    cardRefs.current[currentIndex]?.swipe('left');
  }, [currentIndex]);

  const swipeRight = useCallback(() => {
    if (currentIndex < 0) return;
    cardRefs.current[currentIndex]?.swipe('right');
  }, [currentIndex]);

  // Undo last swipe
  const handleUndo = useCallback(async () => {
    await undoLastSwipe();
  }, [undoLastSwipe]);

  // Refresh deck
  const handleRefresh = useCallback(() => {
    const hackathonId = selectedHackathon?.id || user?.currentHackathonId;
    resetDeck();
    fetchDeck(hackathonId);
  }, [fetchDeck, resetDeck, selectedHackathon?.id, user?.currentHackathonId]);

  // Loading state
  if (isLoading && deck.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Error state
  if (error && deck.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
        <EmptyState
          icon="⚠️"
          title="Ошибка загрузки"
          description={error}
          actionText="Повторить"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  // Empty state - no candidates
  if (deck.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-base-200/50 backdrop-blur-lg sticky top-0 z-20">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <h1 className="font-bold">{currentTeam?.name || 'Поиск тиммейтов'}</h1>
              <p className="text-sm text-base-content/60">0 кандидатов</p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            icon="🔍"
            title="Все кандидаты просмотрены!"
            description="Ты просмотрел всех доступных участников. Проверь свою команду или подожди новых участников."
            actionText="Обновить"
            onAction={handleRefresh}
          />
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-base-100">
          <div className="max-w-lg mx-auto">
            <button 
              onClick={() => navigate(ROUTES.MY_TEAM)}
              className="btn btn-primary w-full"
            >
              <Users className="w-4 h-4" />
              Моя команда
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-base-200/50 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="font-bold">{currentTeam?.name || 'Поиск тиммейтов'}</h1>
            <p className="text-sm text-base-content/60">
              Осталось: {deck.length} кандидатов
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setFiltersOpen(true)}
              className="btn btn-ghost btn-sm btn-circle"
              title="Настройки поиска"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate(ROUTES.MY_TEAM)}
              className="btn btn-ghost btn-sm"
            >
              <Users className="w-4 h-4" />
              Команда
            </button>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      <SwipeFiltersModal
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleFiltersApply}
      />

      {/* Card Stack */}
      <div className="flex-1 relative max-w-lg mx-auto w-full px-4 py-4">
        <div className="relative w-full h-[calc(100vh-220px)] min-h-[400px]">
          {deck.map((cardUser, index) => (
            <SwipeCard
              key={cardUser.id}
              user={cardUser}
              onSwipe={(dir) => handleSwipe(dir, cardUser)}
              onCardLeftScreen={() => handleCardLeftScreen(cardUser.id)}
              isTop={index === deck.length - 1}
              style={{
                zIndex: index,
              }}
            />
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="px-4 py-6 bg-gradient-to-t from-base-100 via-base-100 to-transparent">
        <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={!lastSwipedUser}
            className="btn btn-circle btn-lg btn-ghost border-2 border-base-300 disabled:opacity-30"
          >
            <Undo2 className="w-6 h-6 text-warning" />
          </button>

          {/* Skip Button */}
          <button
            onClick={swipeLeft}
            disabled={currentIndex < 0}
            className="btn btn-circle btn-xl bg-error/20 border-2 border-error text-error hover:bg-error hover:text-error-content"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Like/Invite Button */}
          <button
            onClick={swipeRight}
            disabled={currentIndex < 0}
            className="btn btn-circle btn-xl bg-success/20 border-2 border-success text-success hover:bg-success hover:text-success-content"
          >
            <Heart className="w-8 h-8" />
          </button>

          {/* Super Like */}
          <button
            disabled
            className="btn btn-circle btn-lg btn-ghost border-2 border-base-300 opacity-30 cursor-not-allowed"
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-base-content/50 mt-4">
          ← Свайп влево: Пропустить | Свайп вправо: Пригласить →
        </p>
      </div>

      {/* Swipe Feedback Toast */}
      {toastVisible && swipeDirection && lastSwipedUser && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${swipeDirection === 'right' ? 'alert-success' : 'alert-error'}`}>
            <span>
              {swipeDirection === 'right' 
                ? `✓ Приглашение отправлено ${lastSwipedUser.name}` 
                : `✗ Пропущен ${lastSwipedUser.name}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
