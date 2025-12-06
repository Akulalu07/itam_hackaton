import { useState, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Trophy, 
  Code, 
  Clock, 
  Users, 
  Rocket,
  Check,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';

interface QuizQuestion {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  options: QuizOption[];
  weight: number; // множитель для PTS
}

interface QuizOption {
  id: string;
  label: string;
  description?: string;
  value: number; // базовые очки
  icon?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'experience',
    title: 'Сколько у тебя опыта в разработке?',
    subtitle: 'Выбери наиболее подходящий вариант',
    icon: <Clock className="w-8 h-8" />,
    weight: 1.5,
    options: [
      { id: 'exp-0', label: 'Только начинаю', description: 'Менее 6 месяцев', value: 50, icon: '🌱' },
      { id: 'exp-1', label: 'Есть базовый опыт', description: '6 месяцев - 1 год', value: 100, icon: '📚' },
      { id: 'exp-2', label: 'Уверенный Junior', description: '1-2 года опыта', value: 200, icon: '💪' },
      { id: 'exp-3', label: 'Middle специалист', description: '2-4 года опыта', value: 350, icon: '🚀' },
      { id: 'exp-4', label: 'Senior / Lead', description: '4+ лет опыта', value: 500, icon: '👑' },
    ],
  },
  {
    id: 'hackathons',
    title: 'Участвовал ли ты в хакатонах раньше?',
    subtitle: 'Учитывается любой формат участия',
    icon: <Trophy className="w-8 h-8" />,
    weight: 1.2,
    options: [
      { id: 'hack-0', label: 'Это мой первый', description: 'Только начинаю путь', value: 50, icon: '✨' },
      { id: 'hack-1', label: '1-2 хакатона', description: 'Есть опыт участия', value: 150, icon: '🎯' },
      { id: 'hack-2', label: '3-5 хакатонов', description: 'Регулярный участник', value: 300, icon: '🏅' },
      { id: 'hack-3', label: 'Более 5', description: 'Ветеран хакатонов', value: 450, icon: '🏆' },
    ],
  },
  {
    id: 'skills',
    title: 'Сколько технологий ты знаешь хорошо?',
    subtitle: 'Технологии, в которых ты уверен',
    icon: <Code className="w-8 h-8" />,
    weight: 1.0,
    options: [
      { id: 'skill-1', label: '1-2 технологии', description: 'Специализация', value: 100, icon: '🎯' },
      { id: 'skill-2', label: '3-4 технологии', description: 'Хороший набор', value: 200, icon: '🛠' },
      { id: 'skill-3', label: '5-7 технологий', description: 'Широкий стек', value: 350, icon: '💻' },
      { id: 'skill-4', label: 'Более 7', description: 'Full-stack+', value: 500, icon: '🦄' },
    ],
  },
  {
    id: 'teamwork',
    title: 'Как ты оцениваешь свои навыки работы в команде?',
    subtitle: 'Честная самооценка помогает найти подходящую команду',
    icon: <Users className="w-8 h-8" />,
    weight: 0.8,
    options: [
      { id: 'team-1', label: 'Предпочитаю соло', description: 'Лучше работаю один', value: 50, icon: '🐺' },
      { id: 'team-2', label: 'Адаптируюсь', description: 'Могу работать в команде', value: 150, icon: '🤝' },
      { id: 'team-3', label: 'Командный игрок', description: 'Люблю работать вместе', value: 300, icon: '👥' },
      { id: 'team-4', label: 'Лидер', description: 'Могу вести команду', value: 400, icon: '👑' },
    ],
  },
  {
    id: 'motivation',
    title: 'Что тебя мотивирует на хакатоне?',
    subtitle: 'Выбери главную мотивацию',
    icon: <Rocket className="w-8 h-8" />,
    weight: 0.5,
    options: [
      { id: 'mot-1', label: 'Опыт и обучение', description: 'Хочу научиться новому', value: 100, icon: '📖' },
      { id: 'mot-2', label: 'Нетворкинг', description: 'Познакомиться с людьми', value: 150, icon: '🌐' },
      { id: 'mot-3', label: 'Призы и победа', description: 'Иду за победой!', value: 250, icon: '🏆' },
      { id: 'mot-4', label: 'Создать продукт', description: 'Реализовать идею', value: 300, icon: '💡' },
    ],
  },
];

interface QuizFlowProps {
  onComplete: (pts: number) => void;
  onClose?: () => void;
}

/**
 * QuizFlow - Игровой квиз для калибровки PTS
 * Wizard с прогресс-баром и анимациями
 */
export function QuizFlow({ onComplete, onClose }: QuizFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [finalPTS, setFinalPTS] = useState<number | null>(null);
  const { updateProfile } = useAuthStore();

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;
  const isLastQuestion = currentStep === QUIZ_QUESTIONS.length - 1;

  // Выбрать ответ
  const selectAnswer = useCallback((option: QuizOption) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  }, [currentQuestion]);

  // Следующий вопрос
  const nextStep = useCallback(() => {
    if (!answers[currentQuestion.id]) return;

    if (isLastQuestion) {
      // Вычисляем PTS
      setIsCalculating(true);
      
      setTimeout(() => {
        let totalPTS = 0;
        QUIZ_QUESTIONS.forEach(q => {
          const answer = answers[q.id];
          if (answer) {
            totalPTS += answer.value * q.weight;
          }
        });
        
        // Добавляем немного рандома для реалистичности
        totalPTS = Math.floor(totalPTS * (0.9 + Math.random() * 0.2));
        
        setFinalPTS(totalPTS);
        updateProfile({ pts: totalPTS, mmr: Math.floor(totalPTS * 0.8) });
        setIsCalculating(false);
      }, 2000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, answers, currentQuestion, isLastQuestion, updateProfile]);

  // Предыдущий вопрос
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Экран результата
  if (finalPTS !== null) {
    return (
      <div className="fixed inset-0 bg-base-300/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card bg-base-100 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="card-body items-center text-center py-10">
            {/* Celebration */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-warning to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-warning/40 animate-bounce">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-warning animate-pulse" />
              <Star className="absolute -bottom-1 -left-2 w-6 h-6 text-warning animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Калибровка завершена!</h2>
            <p className="text-base-content/60 mb-6">Твой начальный рейтинг:</p>

            {/* PTS Display */}
            <div className="bg-base-200 rounded-2xl px-8 py-6 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-warning" />
                <span className="text-5xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
                  {finalPTS}
                </span>
              </div>
              <p className="text-sm text-base-content/60 mt-2">PTS (Points)</p>
            </div>

            {/* Title earned */}
            <div className="mb-6">
              <p className="text-sm text-base-content/60 mb-2">Твой титул:</p>
              <span className={`badge badge-lg ${
                finalPTS >= 1500 ? 'badge-warning' :
                finalPTS >= 500 ? 'badge-success' :
                finalPTS >= 100 ? 'badge-info' : 'badge-ghost'
              }`}>
                {finalPTS >= 1500 ? '🏆 Профи' :
                 finalPTS >= 500 ? '⚡ Активист' :
                 finalPTS >= 100 ? '🌟 Участник' : '🌱 Новичок'}
              </span>
            </div>

            <button 
              onClick={() => onComplete(finalPTS)}
              className="btn btn-primary btn-lg w-full"
            >
              Отлично!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Экран загрузки
  if (isCalculating) {
    return (
      <div className="fixed inset-0 bg-base-300/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card bg-base-100 w-full max-w-md shadow-2xl">
          <div className="card-body items-center text-center py-16">
            <div className="loading loading-spinner loading-lg text-primary mb-6"></div>
            <h2 className="text-xl font-bold mb-2">Вычисляем твой рейтинг...</h2>
            <p className="text-base-content/60">Анализируем ответы</p>
            
            {/* Fake progress indicators */}
            <div className="w-full max-w-xs mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm">Опыт учтён</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm">Навыки оценены</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="loading loading-spinner loading-xs"></div>
                <span className="text-sm text-base-content/60">Калибровка рейтинга...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основной квиз
  return (
    <div className="fixed inset-0 bg-base-300/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-lg shadow-2xl">
        <div className="card-body">
          {/* Header with progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-base-content/60">
                Вопрос {currentStep + 1} из {QUIZ_QUESTIONS.length}
              </span>
              {onClose && (
                <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                  ✕
                </button>
              )}
            </div>
            <progress 
              className="progress progress-primary w-full h-2" 
              value={progress} 
              max="100"
            />
          </div>

          {/* Question */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              {currentQuestion.icon}
            </div>
            <h2 className="text-xl font-bold mb-1">{currentQuestion.title}</h2>
            {currentQuestion.subtitle && (
              <p className="text-sm text-base-content/60">{currentQuestion.subtitle}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id]?.id === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => selectAnswer(option)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                      : 'border-base-content/10 hover:border-primary/50 hover:bg-base-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      {option.description && (
                        <p className="text-sm text-base-content/60">{option.description}</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-content" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn btn-ghost flex-1"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </button>
            <button
              onClick={nextStep}
              disabled={!answers[currentQuestion.id]}
              className="btn btn-primary flex-1"
            >
              {isLastQuestion ? 'Завершить' : 'Далее'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
