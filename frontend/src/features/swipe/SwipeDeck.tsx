import { useState, useRef, useCallback } from 'react';
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
  Users
} from 'lucide-react';
import { User } from '../../types';
import { dummyUsers } from '../../data/dummyData';
import { useTeamStore } from '../../store/useStore';
import { ROUTES } from '../../routes';

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
}

/**
 * SwipeCard - Карточка пользователя для свайпа
 */
function SwipeCard({ user, onSwipe, onCardLeftScreen, style }: SwipeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TinderCard
      className="absolute w-full h-full"
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
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-base-200 pointer-events-none" />
        
        {/* Avatar Section */}
        <div className="relative pt-6 px-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="avatar">
                <div className="w-20 h-20 rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-base-200">
                  <img src={user.avatar} alt={user.name} />
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-base-200" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user.name}</h2>
              <p className={`text-sm font-medium ${titleColors[user.title] || 'text-base-content'}`}>
                {user.title}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold">{user.pts}</span>
                  <span className="text-xs text-base-content/60">PTS</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold">{user.mmr}</span>
                  <span className="text-xs text-base-content/60">MMR</span>
                </div>
              </div>
            </div>
          </div>

          {/* NFT Stickers */}
          {user.nftStickers.length > 0 && (
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
          )}
        </div>

        {/* Skills */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-base-content/70 mb-2">Навыки</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, expanded ? undefined : 4).map(skill => (
              <span 
                key={skill.id}
                className={`badge ${skillLevelColors[skill.level]} badge-lg`}
              >
                {skill.name}
              </span>
            ))}
            {!expanded && user.skills.length > 4 && (
              <span className="badge badge-outline badge-lg">
                +{user.skills.length - 4}
              </span>
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
            {user.bio}
          </p>
        </div>

        {/* Experience Badge */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">Опыт:</span>
            <span className="badge badge-primary badge-outline">
              {user.experience === 'student' && 'Студент'}
              {user.experience === 'junior' && 'Junior'}
              {user.experience === 'middle' && 'Middle'}
              {user.experience === 'senior' && 'Senior'}
            </span>
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 opacity-0 transition-opacity duration-200 pointer-events-none swipe-right-indicator">
          <div className="bg-success text-success-content px-4 py-2 rounded-lg font-bold rotate-[-20deg] border-4 border-success">
            INVITE
          </div>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-0 transition-opacity duration-200 pointer-events-none swipe-left-indicator">
          <div className="bg-error text-error-content px-4 py-2 rounded-lg font-bold rotate-[20deg] border-4 border-error">
            SKIP
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
  const { currentTeam } = useTeamStore();
  
  // Use dummy data
  const [deck, setDeck] = useState<User[]>([...dummyUsers].reverse());
  const [lastSwipedUser, setLastSwipedUser] = useState<User | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  
  const currentIndex = deck.length - 1;
  const cardRefs = useRef<(any)[]>([]);

  // Swipe handlers
  const handleSwipe = useCallback((direction: string, user: User) => {
    setLastSwipedUser(user);
    setSwipeDirection(direction);
    
    if (direction === 'right') {
      // Show invite sent feedback
      console.log('Invite sent to:', user.name);
    }
  }, []);

  const handleCardLeftScreen = useCallback((userId: string) => {
    setDeck(prev => prev.filter(u => u.id !== userId));
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
  const undoSwipe = useCallback(() => {
    if (!lastSwipedUser) return;
    setDeck(prev => [...prev, lastSwipedUser]);
    setLastSwipedUser(null);
    setSwipeDirection(null);
  }, [lastSwipedUser]);

  // Empty state
  if (deck.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-6">
          <Users className="w-12 h-12 text-base-content/30" />
        </div>
        <h2 className="text-xl font-bold mb-2">Все кандидаты просмотрены!</h2>
        <p className="text-base-content/60 mb-6">
          Ты просмотрел всех доступных участников. Проверь свою команду или подожди новых участников.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => setDeck([...dummyUsers].reverse())}
            className="btn btn-outline"
          >
            <Undo2 className="w-4 h-4" />
            Начать заново
          </button>
          <button 
            onClick={() => navigate(ROUTES.MY_TEAM)}
            className="btn btn-primary"
          >
            Моя команда
          </button>
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
          <button 
            onClick={() => navigate(ROUTES.MY_TEAM)}
            className="btn btn-ghost btn-sm"
          >
            <Users className="w-4 h-4" />
            Команда
          </button>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative max-w-lg mx-auto w-full px-4 py-4">
        <div className="relative w-full h-[calc(100vh-220px)] min-h-[400px]">
          {deck.map((cardUser, index) => (
            <SwipeCard
              key={cardUser.id}
              user={cardUser}
              onSwipe={(dir) => handleSwipe(dir, cardUser)}
              onCardLeftScreen={() => handleCardLeftScreen(cardUser.id)}
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
            onClick={undoSwipe}
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
      {swipeDirection && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${swipeDirection === 'right' ? 'alert-success' : 'alert-error'}`}>
            <span>
              {swipeDirection === 'right' 
                ? `✓ Приглашение отправлено ${lastSwipedUser?.name}` 
                : `✗ Пропущен ${lastSwipedUser?.name}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
