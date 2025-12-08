import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Star,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SkillTest, TestResult, UserAnswer, SkillLevel } from '../../types';
import { getLevelDescription } from '../../data/skillTests';

interface SkillTestResultProps {
  test: SkillTest;
  result: Omit<TestResult, 'id' | 'userId' | 'completedAt'>;
  answers: UserAnswer[];
  onRetry: () => void;
  onClose: () => void;
  onViewAnswers: () => void;
}

/**
 * SkillTestResult - Компонент отображения результатов теста
 */
export function SkillTestResult({ 
  test, 
  result, 
  answers, 
  onRetry, 
  onClose,
  onViewAnswers
}: SkillTestResultProps) {
  const isPassed = result.score >= test.passingScore;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalQuestions = test.questions.length;
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Получить цвет для уровня
  const getLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'expert': return 'text-warning';
      case 'advanced': return 'text-success';
      case 'intermediate': return 'text-info';
      default: return 'text-base-content/60';
    }
  };
  
  // Получить иконку для уровня
  const getLevelIcon = (level: SkillLevel) => {
    switch (level) {
      case 'expert': return <Sparkles className="w-6 h-6" />;
      case 'advanced': return <Star className="w-6 h-6" />;
      case 'intermediate': return <Trophy className="w-6 h-6" />;
      default: return <CheckCircle2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100 z-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className={`py-8 px-4 shrink-0 ${isPassed ? 'bg-success/20' : 'bg-error/20'}`}>
        <div className="max-w-md mx-auto text-center">
          {/* Result icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isPassed ? 'bg-success text-success-content' : 'bg-error text-error-content'
          }`}>
            {isPassed ? (
              <Trophy className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {isPassed ? 'Тест пройден!' : 'Тест не пройден'}
          </h2>
          <p className="text-base-content/70">
            {isPassed 
              ? `Поздравляем! Вы подтвердили навык ${test.skillName}` 
              : `Для прохождения нужно набрать ${test.passingScore}%`
            }
          </p>
        </div>
      </div>
      
      {/* Score card */}
      <div className="px-4 -mt-6 shrink-0">
        <div className="card bg-base-100 shadow-xl max-w-md mx-auto">
          <div className="card-body">
            {/* Score circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="radial-progress text-primary" 
                style={{ 
                  // @ts-expect-error CSS custom property
                  '--value': result.score, 
                  '--size': '8rem', 
                  '--thickness': '0.8rem' 
                }}
              >
                <span className="text-3xl font-bold">{result.score}%</span>
              </div>
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <div className="flex items-center justify-center gap-1 text-success mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{correctCount}</p>
                <p className="text-xs text-base-content/60">Верно</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-error mb-1">
                  <XCircle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{totalQuestions - correctCount}</p>
                <p className="text-xs text-base-content/60">Неверно</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-info mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{formatTime(result.timeSpent)}</p>
                <p className="text-xs text-base-content/60">Время</p>
              </div>
            </div>
            
            {/* Level badge */}
            {isPassed && (
              <div className="bg-base-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${getLevelColor(result.level)}`}>
                    {getLevelIcon(result.level)}
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Ваш уровень</p>
                    <p className={`font-bold ${getLevelColor(result.level)}`}>
                      {getLevelDescription(result.level)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Level thresholds info */}
            <div className="collapse collapse-arrow bg-base-200 rounded-xl">
              <input type="checkbox" />
              <div className="collapse-title font-medium">
                Пороги уровней
              </div>
              <div className="collapse-content">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warning">Эксперт</span>
                    <span>{test.levelThresholds.expert}%+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-success">Продвинутый</span>
                    <span>{test.levelThresholds.advanced}-{test.levelThresholds.expert - 1}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-info">Средний</span>
                    <span>{test.levelThresholds.intermediate}-{test.levelThresholds.advanced - 1}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Начинающий</span>
                    <span>0-{test.levelThresholds.intermediate - 1}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex-1 flex flex-col justify-end p-4 pb-24 max-w-md mx-auto w-full">
        <div className="space-y-3">
          <button
            onClick={onViewAnswers}
            className="btn btn-ghost btn-block"
          >
            Посмотреть ответы
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onRetry}
            className="btn btn-outline btn-block"
          >
            <RotateCcw className="w-5 h-5" />
            Пройти заново
          </button>
          
          <button
            onClick={onClose}
            className="btn btn-primary btn-block"
          >
            {isPassed ? 'Готово' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SkillTestAnswers - Просмотр ответов после теста
 */
interface SkillTestAnswersProps {
  test: SkillTest;
  answers: UserAnswer[];
  onClose: () => void;
}

export function SkillTestAnswers({ test, answers, onClose }: SkillTestAnswersProps) {
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  
  return (
    <div className="fixed inset-0 bg-base-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-base-200 p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Разбор ответов</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Закрыть
          </button>
        </div>
      </div>
      
      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {test.questions.map((question, idx) => {
            const answer = answerMap.get(question.id);
            const isCorrect = answer?.isCorrect;
            const correctOption = question.options.find(o => o.isCorrect);
            const selectedOption = question.options.find(o => o.id === answer?.selectedOptionId);
            
            return (
              <div 
                key={question.id}
                className={`card ${isCorrect ? 'bg-success/10 border border-success/30' : 'bg-error/10 border border-error/30'}`}
              >
                <div className="card-body p-4">
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                      isCorrect ? 'bg-success text-success-content' : 'bg-error text-error-content'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <span className={`badge badge-sm mt-1 ${
                        question.difficulty === 'hard' ? 'badge-error' :
                        question.difficulty === 'medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {question.difficulty === 'hard' ? 'Сложный' :
                         question.difficulty === 'medium' ? 'Средний' : 'Лёгкий'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Code snippet */}
                  {question.code && (
                    <pre className="bg-base-300/50 p-3 rounded-lg text-sm mb-3 overflow-x-auto">
                      <code className="font-mono whitespace-pre">{question.code}</code>
                    </pre>
                  )}
                  
                  {/* Answer comparison */}
                  <div className="space-y-2">
                    {!isCorrect && selectedOption && (
                      <div className="flex items-start gap-2 text-error">
                        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Ваш ответ:</p>
                          <p className="text-sm">{selectedOption.text}</p>
                        </div>
                      </div>
                    )}
                    
                    {!answer?.selectedOptionId && (
                      <div className="flex items-start gap-2 text-error">
                        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">Нет ответа</p>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Правильный ответ:</p>
                        <p className="text-sm">{correctOption?.text}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Explanation */}
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <p className="text-sm text-base-content/70">
                      <span className="font-medium">Объяснение:</span> {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
