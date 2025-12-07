import { 
  CustomizationItem, 
  Achievement, 
  Case, 
  ItemRarity,
  CustomizationItemType 
} from '../../types';

/**
 * Банк предметов кастомизации профиля
 * Фоны, цвета ников, рамки аватаров, бейджи, титулы
 */

// ============================================
// BACKGROUNDS - Фоны профиля
// ============================================
export const backgrounds: CustomizationItem[] = [
  // COMMON
  {
    id: 'bg-default',
    name: 'По умолчанию',
    type: 'background',
    rarity: 'common',
    value: 'linear-gradient(135deg, hsl(var(--b2)) 0%, hsl(var(--b3)) 100%)',
    description: 'Стандартный фон профиля',
  },
  {
    id: 'bg-ocean',
    name: 'Океан',
    type: 'background',
    rarity: 'common',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Спокойные оттенки океана',
  },
  {
    id: 'bg-sunset',
    name: 'Закат',
    type: 'background',
    rarity: 'common',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Тёплые оттенки заката',
  },
  
  // UNCOMMON
  {
    id: 'bg-northern-lights',
    name: 'Северное сияние',
    type: 'background',
    rarity: 'uncommon',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)',
    description: 'Магические переливы полярного сияния',
  },
  {
    id: 'bg-deep-space',
    name: 'Глубокий космос',
    type: 'background',
    rarity: 'uncommon',
    value: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #2d1b4e 100%)',
    description: 'Бескрайний космос',
  },
  {
    id: 'bg-forest',
    name: 'Зачарованный лес',
    type: 'background',
    rarity: 'uncommon',
    value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    description: 'Таинственный лесной градиент',
  },
  
  // RARE
  {
    id: 'bg-cyberpunk',
    name: 'Киберпанк',
    type: 'background',
    rarity: 'rare',
    value: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ff00ff 100%)',
    description: 'Неоновые огни будущего',
    isAnimated: true,
  },
  {
    id: 'bg-fire',
    name: 'Пламя',
    type: 'background',
    rarity: 'rare',
    value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    description: 'Огненный градиент для горячих профилей',
  },
  {
    id: 'bg-galaxy',
    name: 'Галактика',
    type: 'background',
    rarity: 'rare',
    value: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 50%, #654ea3 100%)',
    description: 'Космические туманности',
    isAnimated: true,
  },
  
  // EPIC
  {
    id: 'bg-aurora',
    name: 'Аврора',
    type: 'background',
    rarity: 'epic',
    value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 25%, #7c3aed 50%, #ff0080 75%, #00c6ff 100%)',
    description: 'Волшебные переливы северного сияния',
    isAnimated: true,
  },
  {
    id: 'bg-matrix',
    name: 'Матрица',
    type: 'background',
    rarity: 'epic',
    value: 'linear-gradient(180deg, #000000 0%, #003300 50%, #00ff00 100%)',
    description: 'Цифровой дождь кода',
    isAnimated: true,
  },
  {
    id: 'bg-holographic',
    name: 'Голографический',
    type: 'background',
    rarity: 'epic',
    value: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%)',
    description: 'Радужные голографические переливы',
    isAnimated: true,
  },
  
  // LEGENDARY
  {
    id: 'bg-itam-champion',
    name: 'ITAM Champion',
    type: 'background',
    rarity: 'legendary',
    value: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF4500 50%, #FFD700 75%, #FFFFFF 100%)',
    description: 'Эксклюзивный фон для чемпионов ITAM',
    isAnimated: true,
  },
  {
    id: 'bg-void',
    name: 'Бездна',
    type: 'background',
    rarity: 'legendary',
    value: 'radial-gradient(ellipse at center, #1a0033 0%, #000000 50%, #1a0033 100%)',
    description: 'Таинственная пустота с пульсирующим свечением',
    isAnimated: true,
  },
];

// ============================================
// NAME COLORS - Цвета никнеймов
// ============================================
export const nameColors: CustomizationItem[] = [
  // COMMON
  {
    id: 'nc-white',
    name: 'Белый',
    type: 'nameColor',
    rarity: 'common',
    value: '#FFFFFF',
    description: 'Классический белый цвет',
  },
  {
    id: 'nc-blue',
    name: 'Синий',
    type: 'nameColor',
    rarity: 'common',
    value: '#3B82F6',
    description: 'Спокойный синий',
  },
  {
    id: 'nc-green',
    name: 'Зелёный',
    type: 'nameColor',
    rarity: 'common',
    value: '#22C55E',
    description: 'Свежий зелёный',
  },
  
  // UNCOMMON
  {
    id: 'nc-purple',
    name: 'Фиолетовый',
    type: 'nameColor',
    rarity: 'uncommon',
    value: '#A855F7',
    description: 'Загадочный фиолетовый',
  },
  {
    id: 'nc-orange',
    name: 'Оранжевый',
    type: 'nameColor',
    rarity: 'uncommon',
    value: '#F97316',
    description: 'Энергичный оранжевый',
  },
  {
    id: 'nc-pink',
    name: 'Розовый',
    type: 'nameColor',
    rarity: 'uncommon',
    value: '#EC4899',
    description: 'Яркий розовый',
  },
  
  // RARE
  {
    id: 'nc-gradient-fire',
    name: 'Огненный градиент',
    type: 'nameColor',
    rarity: 'rare',
    value: 'linear-gradient(90deg, #f12711, #f5af19)',
    description: 'Горящий текст',
    isAnimated: true,
  },
  {
    id: 'nc-gradient-ice',
    name: 'Ледяной градиент',
    type: 'nameColor',
    rarity: 'rare',
    value: 'linear-gradient(90deg, #00c6ff, #0072ff)',
    description: 'Морозные переливы',
    isAnimated: true,
  },
  {
    id: 'nc-gold',
    name: 'Золотой',
    type: 'nameColor',
    rarity: 'rare',
    value: '#FFD700',
    description: 'Благородный золотой',
  },
  
  // EPIC
  {
    id: 'nc-rainbow',
    name: 'Радужный',
    type: 'nameColor',
    rarity: 'epic',
    value: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
    description: 'Все цвета радуги',
    isAnimated: true,
  },
  {
    id: 'nc-neon',
    name: 'Неон',
    type: 'nameColor',
    rarity: 'epic',
    value: '#00FF00',
    description: 'Яркий неоновый с эффектом свечения',
    isAnimated: true,
  },
  
  // LEGENDARY
  {
    id: 'nc-champion',
    name: 'Чемпионский',
    type: 'nameColor',
    rarity: 'legendary',
    value: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700)',
    description: 'Сияющий золотой для победителей',
    isAnimated: true,
  },
];

// ============================================
// AVATAR FRAMES - Рамки аватаров
// ============================================
export const avatarFrames: CustomizationItem[] = [
  // COMMON
  {
    id: 'af-none',
    name: 'Без рамки',
    type: 'avatarFrame',
    rarity: 'common',
    value: 'none',
    description: 'Чистый аватар без рамки',
  },
  {
    id: 'af-simple-blue',
    name: 'Синяя рамка',
    type: 'avatarFrame',
    rarity: 'common',
    value: '4px solid #3B82F6',
    description: 'Простая синяя рамка',
  },
  
  // UNCOMMON
  {
    id: 'af-gradient-sunset',
    name: 'Закатная',
    type: 'avatarFrame',
    rarity: 'uncommon',
    value: '4px solid transparent; background: linear-gradient(135deg, #f093fb, #f5576c); background-clip: padding-box',
    description: 'Градиентная рамка в тёплых тонах',
  },
  {
    id: 'af-double',
    name: 'Двойная',
    type: 'avatarFrame',
    rarity: 'uncommon',
    value: '4px double #A855F7',
    description: 'Элегантная двойная рамка',
  },
  
  // RARE
  {
    id: 'af-glow-blue',
    name: 'Синее свечение',
    type: 'avatarFrame',
    rarity: 'rare',
    value: '4px solid #3B82F6; box-shadow: 0 0 20px #3B82F6',
    description: 'Рамка с неоновым свечением',
    isAnimated: true,
  },
  {
    id: 'af-fire-ring',
    name: 'Огненное кольцо',
    type: 'avatarFrame',
    rarity: 'rare',
    value: '4px solid #f97316; box-shadow: 0 0 15px #f97316, 0 0 30px #f12711',
    description: 'Пылающая рамка',
    isAnimated: true,
  },
  
  // EPIC
  {
    id: 'af-rainbow-glow',
    name: 'Радужное свечение',
    type: 'avatarFrame',
    rarity: 'epic',
    value: 'rainbow-animated',
    description: 'Переливающаяся радужная рамка',
    isAnimated: true,
  },
  {
    id: 'af-electric',
    name: 'Электрическая',
    type: 'avatarFrame',
    rarity: 'epic',
    value: '4px solid #00ffff; box-shadow: 0 0 20px #00ffff, inset 0 0 10px #00ffff',
    description: 'Рамка с эффектом молний',
    isAnimated: true,
  },
  
  // LEGENDARY
  {
    id: 'af-champion-crown',
    name: 'Корона Чемпиона',
    type: 'avatarFrame',
    rarity: 'legendary',
    value: 'champion-crown',
    description: 'Золотая рамка с короной',
    isAnimated: true,
  },
  {
    id: 'af-void-portal',
    name: 'Портал Бездны',
    type: 'avatarFrame',
    rarity: 'legendary',
    value: 'void-portal',
    description: 'Мистический портал вокруг аватара',
    isAnimated: true,
  },
];

// ============================================
// BADGES - Значки/бейджи
// ============================================
export const badges: CustomizationItem[] = [
  // COMMON
  {
    id: 'badge-participant',
    name: 'Участник',
    type: 'badge',
    rarity: 'common',
    value: '🎯',
    description: 'Участник платформы',
  },
  {
    id: 'badge-coder',
    name: 'Кодер',
    type: 'badge',
    rarity: 'common',
    value: '💻',
    description: 'Любитель кода',
  },
  
  // UNCOMMON
  {
    id: 'badge-team-player',
    name: 'Командный игрок',
    type: 'badge',
    rarity: 'uncommon',
    value: '🤝',
    description: 'Участвовал в команде',
  },
  {
    id: 'badge-early-bird',
    name: 'Ранняя пташка',
    type: 'badge',
    rarity: 'uncommon',
    value: '🐦',
    description: 'Один из первых пользователей',
  },
  
  // RARE
  {
    id: 'badge-hackathon-finisher',
    name: 'Финишёр',
    type: 'badge',
    rarity: 'rare',
    value: '🏁',
    description: 'Завершил хакатон',
  },
  {
    id: 'badge-mentor',
    name: 'Ментор',
    type: 'badge',
    rarity: 'rare',
    value: '🎓',
    description: 'Помогал другим участникам',
  },
  
  // EPIC
  {
    id: 'badge-top-10',
    name: 'Топ-10',
    type: 'badge',
    rarity: 'epic',
    value: '🏅',
    description: 'Вошёл в топ-10 хакатона',
  },
  {
    id: 'badge-skill-master',
    name: 'Мастер навыков',
    type: 'badge',
    rarity: 'epic',
    value: '⚡',
    description: 'Подтвердил 10+ навыков на expert',
  },
  
  // LEGENDARY
  {
    id: 'badge-champion',
    name: 'Чемпион',
    type: 'badge',
    rarity: 'legendary',
    value: '🏆',
    description: 'Победитель хакатона',
  },
  {
    id: 'badge-legend',
    name: 'Легенда',
    type: 'badge',
    rarity: 'legendary',
    value: '👑',
    description: 'Победил в 3+ хакатонах',
  },
];

// ============================================
// TITLES - Кастомные титулы
// ============================================
export const titles: CustomizationItem[] = [
  // UNCOMMON
  {
    id: 'title-hacker',
    name: 'Хакер',
    type: 'title',
    rarity: 'uncommon',
    value: 'Хакер',
    description: 'Для настоящих хакеров',
  },
  {
    id: 'title-ninja',
    name: 'Кодо-ниндзя',
    type: 'title',
    rarity: 'uncommon',
    value: 'Кодо-ниндзя',
    description: 'Незаметен, но эффективен',
  },
  
  // RARE
  {
    id: 'title-architect',
    name: 'Архитектор',
    type: 'title',
    rarity: 'rare',
    value: 'Архитектор',
    description: 'Строит системы любой сложности',
  },
  {
    id: 'title-innovator',
    name: 'Инноватор',
    type: 'title',
    rarity: 'rare',
    value: 'Инноватор',
    description: 'Генератор идей',
  },
  
  // EPIC
  {
    id: 'title-wizard',
    name: 'Техно-маг',
    type: 'title',
    rarity: 'epic',
    value: 'Техно-маг',
    description: 'Владеет цифровой магией',
  },
  {
    id: 'title-guru',
    name: 'Гуру',
    type: 'title',
    rarity: 'epic',
    value: 'Гуру',
    description: 'Мастер своего дела',
  },
  
  // LEGENDARY
  {
    id: 'title-champion',
    name: 'Чемпион ITAM',
    type: 'title',
    rarity: 'legendary',
    value: 'Чемпион ITAM',
    description: 'Победитель хакатона ITAM',
  },
  {
    id: 'title-legend',
    name: 'Живая Легенда',
    type: 'title',
    rarity: 'legendary',
    value: 'Живая Легенда',
    description: 'Достиг вершины мастерства',
  },
];

// ============================================
// EFFECTS - Визуальные эффекты
// ============================================
export const effects: CustomizationItem[] = [
  // RARE
  {
    id: 'effect-sparkles',
    name: 'Искры',
    type: 'effect',
    rarity: 'rare',
    value: 'sparkles',
    description: 'Лёгкие искры вокруг профиля',
    isAnimated: true,
  },
  {
    id: 'effect-glow',
    name: 'Свечение',
    type: 'effect',
    rarity: 'rare',
    value: 'glow',
    description: 'Мягкое свечение профиля',
    isAnimated: true,
  },
  
  // EPIC
  {
    id: 'effect-fire-particles',
    name: 'Огненные частицы',
    type: 'effect',
    rarity: 'epic',
    value: 'fire-particles',
    description: 'Летящие огненные частицы',
    isAnimated: true,
  },
  {
    id: 'effect-snow',
    name: 'Снегопад',
    type: 'effect',
    rarity: 'epic',
    value: 'snow',
    description: 'Падающие снежинки',
    isAnimated: true,
  },
  
  // LEGENDARY
  {
    id: 'effect-lightning',
    name: 'Молнии',
    type: 'effect',
    rarity: 'legendary',
    value: 'lightning',
    description: 'Электрические разряды',
    isAnimated: true,
  },
  {
    id: 'effect-void-energy',
    name: 'Энергия Бездны',
    type: 'effect',
    rarity: 'legendary',
    value: 'void-energy',
    description: 'Тёмная энергия окружает профиль',
    isAnimated: true,
  },
];

// ============================================
// ACHIEVEMENTS - Достижения
// ============================================
export const achievements: Achievement[] = [
  // COMMON
  {
    id: 'ach-first-login',
    name: 'Первые шаги',
    description: 'Зарегистрируйся на платформе',
    iconUrl: '🚀',
    rarity: 'common',
    category: 'social',
  },
  {
    id: 'ach-profile-complete',
    name: 'Заполненный профиль',
    description: 'Заполни все поля профиля',
    iconUrl: '📝',
    rarity: 'common',
    category: 'social',
  },
  {
    id: 'ach-first-skill',
    name: 'Первый навык',
    description: 'Подтверди первый навык тестом',
    iconUrl: '✅',
    rarity: 'common',
    category: 'skill',
  },
  
  // UNCOMMON
  {
    id: 'ach-join-team',
    name: 'Командный игрок',
    description: 'Вступи в команду',
    iconUrl: '👥',
    rarity: 'uncommon',
    category: 'social',
  },
  {
    id: 'ach-create-team',
    name: 'Лидер',
    description: 'Создай свою команду',
    iconUrl: '⭐',
    rarity: 'uncommon',
    category: 'social',
  },
  {
    id: 'ach-5-skills',
    name: 'Многопрофильный',
    description: 'Подтверди 5 навыков',
    iconUrl: '🎯',
    rarity: 'uncommon',
    category: 'skill',
    progress: 0,
    maxProgress: 5,
  },
  
  // RARE
  {
    id: 'ach-first-hackathon',
    name: 'Первый хакатон',
    description: 'Участвуй в первом хакатоне',
    iconUrl: '🎪',
    rarity: 'rare',
    category: 'hackathon',
  },
  {
    id: 'ach-expert-skill',
    name: 'Эксперт',
    description: 'Получи уровень Expert в любом навыке',
    iconUrl: '🏅',
    rarity: 'rare',
    category: 'skill',
  },
  {
    id: 'ach-full-team',
    name: 'Полная команда',
    description: 'Собери команду максимального размера',
    iconUrl: '🤝',
    rarity: 'rare',
    category: 'social',
  },
  
  // EPIC
  {
    id: 'ach-top-10',
    name: 'Топ-10',
    description: 'Войди в топ-10 на хакатоне',
    iconUrl: '🎖️',
    rarity: 'epic',
    category: 'hackathon',
  },
  {
    id: 'ach-10-expert-skills',
    name: 'Мастер навыков',
    description: 'Получи Expert в 10 навыках',
    iconUrl: '⚡',
    rarity: 'epic',
    category: 'skill',
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'ach-3-hackathons',
    name: 'Ветеран',
    description: 'Участвуй в 3 хакатонах',
    iconUrl: '🎗️',
    rarity: 'epic',
    category: 'hackathon',
    progress: 0,
    maxProgress: 3,
  },
  
  // LEGENDARY
  {
    id: 'ach-winner',
    name: 'Чемпион',
    description: 'Выиграй хакатон',
    iconUrl: '🏆',
    rarity: 'legendary',
    category: 'hackathon',
  },
  {
    id: 'ach-triple-champion',
    name: 'Тройной чемпион',
    description: 'Выиграй 3 хакатона',
    iconUrl: '👑',
    rarity: 'legendary',
    category: 'hackathon',
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'ach-legend',
    name: 'Легенда ITAM',
    description: 'Достигни 10000 PTS',
    iconUrl: '🌟',
    rarity: 'legendary',
    category: 'special',
    progress: 0,
    maxProgress: 10000,
  },
];

// ============================================
// CASES - Кейсы/лутбоксы
// ============================================
export const caseTemplates: Omit<Case, 'id' | 'receivedAt' | 'openedAt' | 'isOpened'>[] = [
  {
    name: 'Стартовый кейс',
    description: 'Базовый кейс для новых участников',
    imageUrl: '/cases/starter.png',
    rarity: 'common',
    possibleItems: [
      ...backgrounds.filter(b => b.rarity === 'common').map(item => ({ item, dropChance: 30 })),
      ...nameColors.filter(b => b.rarity === 'common').map(item => ({ item, dropChance: 30 })),
      ...badges.filter(b => b.rarity === 'common').map(item => ({ item, dropChance: 40 })),
    ],
  },
  {
    name: 'Хакатон кейс',
    description: 'Награда за участие в хакатоне',
    imageUrl: '/cases/hackathon.png',
    rarity: 'uncommon',
    possibleItems: [
      ...backgrounds.filter(b => ['common', 'uncommon'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'uncommon' ? 20 : 30 
      })),
      ...nameColors.filter(b => ['common', 'uncommon'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'uncommon' ? 15 : 25 
      })),
      ...avatarFrames.filter(b => ['common', 'uncommon'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'uncommon' ? 10 : 20 
      })),
    ],
  },
  {
    name: 'Финалист кейс',
    description: 'Награда за выход в финал хакатона',
    imageUrl: '/cases/finalist.png',
    rarity: 'rare',
    possibleItems: [
      ...backgrounds.filter(b => ['uncommon', 'rare'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'rare' ? 15 : 25 
      })),
      ...nameColors.filter(b => ['uncommon', 'rare'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'rare' ? 15 : 20 
      })),
      ...avatarFrames.filter(b => ['uncommon', 'rare'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'rare' ? 10 : 15 
      })),
      ...titles.filter(b => ['uncommon', 'rare'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'rare' ? 10 : 15 
      })),
    ],
  },
  {
    name: 'Чемпионский кейс',
    description: 'Эксклюзивная награда победителям хакатона',
    imageUrl: '/cases/champion.png',
    rarity: 'epic',
    possibleItems: [
      ...backgrounds.filter(b => ['rare', 'epic'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'epic' ? 10 : 20 
      })),
      ...nameColors.filter(b => ['rare', 'epic'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'epic' ? 10 : 15 
      })),
      ...avatarFrames.filter(b => ['rare', 'epic'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'epic' ? 10 : 15 
      })),
      ...effects.filter(b => ['rare', 'epic'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'epic' ? 5 : 10 
      })),
      ...titles.filter(b => ['rare', 'epic'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'epic' ? 5 : 10 
      })),
    ],
  },
  {
    name: 'Легендарный кейс',
    description: 'Самый редкий кейс с легендарными предметами',
    imageUrl: '/cases/legendary.png',
    rarity: 'legendary',
    possibleItems: [
      ...backgrounds.filter(b => ['epic', 'legendary'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'legendary' ? 5 : 15 
      })),
      ...nameColors.filter(b => ['epic', 'legendary'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'legendary' ? 5 : 15 
      })),
      ...avatarFrames.filter(b => ['epic', 'legendary'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'legendary' ? 5 : 10 
      })),
      ...effects.filter(b => ['epic', 'legendary'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'legendary' ? 5 : 10 
      })),
      ...titles.filter(b => ['epic', 'legendary'].includes(b.rarity)).map(item => ({ 
        item, 
        dropChance: item.rarity === 'legendary' ? 5 : 10 
      })),
    ],
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Получить все предметы по типу
export const getItemsByType = (type: CustomizationItemType): CustomizationItem[] => {
  switch (type) {
    case 'background': return backgrounds;
    case 'nameColor': return nameColors;
    case 'avatarFrame': return avatarFrames;
    case 'badge': return badges;
    case 'title': return titles;
    case 'effect': return effects;
    default: return [];
  }
};

// Получить предмет по ID
export const getItemById = (id: string): CustomizationItem | undefined => {
  const allItems = [
    ...backgrounds,
    ...nameColors,
    ...avatarFrames,
    ...badges,
    ...titles,
    ...effects,
  ];
  return allItems.find(item => item.id === id);
};

// Получить достижение по ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(ach => ach.id === id);
};

// Получить цвет редкости
export const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case 'common': return '#9CA3AF';      // gray-400
    case 'uncommon': return '#22C55E';    // green-500
    case 'rare': return '#3B82F6';        // blue-500
    case 'epic': return '#A855F7';        // purple-500
    case 'legendary': return '#F59E0B';   // amber-500
    default: return '#9CA3AF';
  }
};

// Получить название редкости
export const getRarityName = (rarity: ItemRarity): string => {
  switch (rarity) {
    case 'common': return 'Обычный';
    case 'uncommon': return 'Необычный';
    case 'rare': return 'Редкий';
    case 'epic': return 'Эпический';
    case 'legendary': return 'Легендарный';
    default: return 'Обычный';
  }
};

// Открыть кейс (случайный дроп)
export const openCase = (caseItem: Case): CustomizationItem => {
  const totalChance = caseItem.possibleItems.reduce((sum, item) => sum + item.dropChance, 0);
  let random = Math.random() * totalChance;
  
  for (const dropItem of caseItem.possibleItems) {
    random -= dropItem.dropChance;
    if (random <= 0) {
      return dropItem.item;
    }
  }
  
  // Fallback - первый предмет
  return caseItem.possibleItems[0].item;
};
