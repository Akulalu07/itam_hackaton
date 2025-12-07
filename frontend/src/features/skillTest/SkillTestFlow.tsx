import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Code
} from 'lucide-react';
import { SkillTest, UserAnswer } from '../../types';
import { shuffleQuestions } from '../../data/skillTests';

interface SkillTestFlowProps {
  test: SkillTest;
  onComplete: (answers: UserAnswer[], timeSpent: number) => void;
  onCancel: () => void;
}

/**
 * SkillTestFlow - Компонент прохождения теста на навык
 * Показывает вопросы с таймером, прогрессом и навигацией
 */
export function SkillTestFlow({ test, onComplete, onCancel }: SkillTestFlowProps) {
  const [questions] = useState(() => shuffleQuestions(test.questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [timeLeft, setTimeLeft] = useState(test.timeLimit || 600);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.size;
  
  // Таймер
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Выбор ответа
  const handleSelectAnswer = (optionId: string) => {
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    if (!selectedOption) return;
    
    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect: selectedOption.isCorrect,
    };
    
    setAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
  };
  
  // Навигация
  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };
  
  // Завершение теста
  const handleSubmit = useCallback(() => {
    const timeSpent = (test.timeLimit || 600) - timeLeft;
    const answersArray = Array.from(answers.values());
    
    // Добавляем пустые ответы для неотвеченных вопросов
    questions.forEach(q => {
      if (!answers.has(q.id)) {
        answersArray.push({
          questionId: q.id,
          selectedOptionId: '',
          isCorrect: false,
        });
      }
    });
    
    onComplete(answersArray, timeSpent);
  }, [answers, onComplete, questions, test.timeLimit, timeLeft]);
  
  const currentAnswer = answers.get(currentQuestion.id);
  const isLastQuestion = currentIndex === questions.length - 1;
  
  // Определение цвета таймера
  const timerColor = timeLeft <= 60 ? 'text-error' : timeLeft <= 180 ? 'text-warning' : 'text-base-content';
  
  return (
    <div className="fixed inset-0 bg-base-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{test.skillName}</h2>
            <p className="text-sm text-base-content/60">Тест на подтверждение навыка</p>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg ${timerColor}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Вопрос {currentIndex + 1} из {questions.length}</span>
            <span>{answeredCount} отвечено</span>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={progress} 
            max="100"
          />
        </div>
      </div>
      
      {/* Question navigation dots */}
      <div className="bg-base-200 px-4 py-2 border-b border-base-300 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {questions.map((q, idx) => {
            const isAnswered = answers.has(q.id);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  isCurrent 
                    ? 'bg-primary text-primary-content scale-110' 
                    : isAnswered 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-base-300 text-base-content/60'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Question content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Difficulty badge */}
          <div className="mb-4">
            <span className={`badge ${
              currentQuestion.difficulty === 'hard' ? 'badge-error' :
              currentQuestion.difficulty === 'medium' ? 'badge-warning' : 'badge-info'
            }`}>
              {currentQuestion.difficulty === 'hard' ? 'Сложный' :
               currentQuestion.difficulty === 'medium' ? 'Средний' : 'Лёгкий'}
            </span>
          </div>
          
          {/* Question text */}
          <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
          
          {/* Code snippet */}
          {currentQuestion.code && (
            <div className="mb-6">
              <div className="bg-base-300 rounded-t-lg px-4 py-2 flex items-center gap-2 border-b border-base-content/10">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Код</span>
              </div>
              <pre className="bg-base-300/50 p-4 rounded-b-lg overflow-x-auto">
                <code className="text-sm font-mono whitespace-pre">{currentQuestion.code}</code>
              </pre>
            </div>
          )}
          
          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentAnswer?.selectedOptionId === option.id;
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-base-300 hover:border-primary/50 bg-base-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                      isSelected ? 'bg-primary text-primary-content' : 'bg-base-300'
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1 pt-1">{option.text}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Navigation footer */}
      <div className="bg-base-200 border-t border-base-300 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="btn btn-ghost gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </button>
          
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm text-error"
          >
            Отменить
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="btn btn-primary gap-1"
            >
              Завершить
              <CheckCircle2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="btn btn-primary gap-1"
            >
              Далее
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-warning" />
              <h3 className="text-lg font-bold">Завершить тест?</h3>
            </div>
            
            <p className="text-base-content/70 mb-4">
              Вы ответили на {answeredCount} из {questions.length} вопросов.
              {answeredCount < questions.length && (
                <span className="text-warning block mt-1">
                  Неотвеченные вопросы будут засчитаны как неверные.
                </span>
              )}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-ghost flex-1"
              >
                Вернуться
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary flex-1"
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SkillTestCard - Карточка теста для выбора
 */
interface SkillTestCardProps {
  test: SkillTest;
  onStart: () => void;
  isCompleted?: boolean;
  completedLevel?: string;
}

export function SkillTestCard({ test, onStart, isCompleted, completedLevel }: SkillTestCardProps) {
  const easyCount = test.questions.filter(q => q.difficulty === 'easy').length;
  const mediumCount = test.questions.filter(q => q.difficulty === 'medium').length;
  const hardCount = test.questions.filter(q => q.difficulty === 'hard').length;
  
  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="card-title text-lg">{test.skillName}</h3>
            <p className="text-sm text-base-content/60 mt-1">{test.description}</p>
          </div>
          {isCompleted && (
            <div className={`badge ${
              completedLevel === 'expert' ? 'badge-warning' :
              completedLevel === 'advanced' ? 'badge-success' :
              completedLevel === 'intermediate' ? 'badge-info' : 'badge-ghost'
            }`}>
              {completedLevel === 'expert' ? 'Эксперт' :
               completedLevel === 'advanced' ? 'Продвинутый' :
               completedLevel === 'intermediate' ? 'Средний' : 'Начинающий'}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="text-info">{easyCount} лёгких</span>
          <span className="text-warning">{mediumCount} средних</span>
          <span className="text-error">{hardCount} сложных</span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Clock className="w-4 h-4" />
            {Math.floor((test.timeLimit || 600) / 60)} минут
          </div>
          
          <button
            onClick={onStart}
            className="btn btn-primary btn-sm"
          >
            {isCompleted ? 'Пересдать' : 'Начать тест'}
          </button>
        </div>
      </div>
    </div>
  );
}
