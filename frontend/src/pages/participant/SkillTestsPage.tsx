import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  BookOpen,
  Code2,
  Server,
  Database,
  Brain,
  Filter
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { userService } from '../../api';
import { 
  SkillTestFlow, 
  SkillTestCard 
} from '../../features/skillTest/SkillTestFlow';
import { 
  SkillTestResult, 
  SkillTestAnswers 
} from '../../features/skillTest/SkillTestResult';
import { 
  allSkillTests, 
  getTestBySkill,
  calculateTestResult 
} from '../../data/skillTests';
import { SkillTest, UserAnswer, TestResult } from '../../types';

type TestStage = 'list' | 'testing' | 'result' | 'answers';
type CategoryFilter = 'all' | 'backend' | 'frontend' | 'devops' | 'ml';

const categoryIcons: Record<CategoryFilter, React.ReactNode> = {
  all: <BookOpen className="w-4 h-4" />,
  backend: <Server className="w-4 h-4" />,
  frontend: <Code2 className="w-4 h-4" />,
  devops: <Database className="w-4 h-4" />,
  ml: <Brain className="w-4 h-4" />,
};

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Все',
  backend: 'Backend',
  frontend: 'Frontend',
  devops: 'DevOps',
  ml: 'ML/Data',
};

/**
 * SkillTestsPage - Страница выбора и прохождения тестов на навыки
 */
export function SkillTestsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateProfileLocal } = useAuthStore();
  
  // URL params
  const initialSkill = searchParams.get('skill');
  
  // State
  const [stage, setStage] = useState<TestStage>(() => {
    // Если передан skill в URL, сразу открываем тест
    if (initialSkill && getTestBySkill(initialSkill)) {
      return 'testing';
    }
    return 'list';
  });
  const [selectedTest, setSelectedTest] = useState<SkillTest | null>(() => {
    if (initialSkill) {
      return getTestBySkill(initialSkill) || null;
    }
    return null;
  });
  const [testResult, setTestResult] = useState<Omit<TestResult, 'id' | 'userId' | 'completedAt'> | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  
  // Фильтрация тестов
  const filteredTests = useMemo(() => {
    return allSkillTests.filter(test => {
      // Поиск по названию
      const matchesSearch = test.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Фильтр по категории
      const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);
  
  // Группировка по категориям
  const testsByCategory = useMemo(() => {
    const grouped: Record<string, SkillTest[]> = {};
    filteredTests.forEach(test => {
      if (!grouped[test.category]) {
        grouped[test.category] = [];
      }
      grouped[test.category].push(test);
    });
    return grouped;
  }, [filteredTests]);
  
  // Проверка пройденных тестов (из user skills)
  const getCompletedLevel = (skillName: string) => {
    const skill = user?.skills.find(s => 
      s.name.toLowerCase() === skillName.toLowerCase() && s.verified
    );
    return skill?.level;
  };
  
  // Обработчики
  const handleStartTest = (test: SkillTest) => {
    setSelectedTest(test);
    setStage('testing');
  };
  
  const handleCompleteTest = async (answers: UserAnswer[], timeSpent: number) => {
    if (!selectedTest) return;
    
    const result = calculateTestResult(selectedTest, answers, timeSpent);
    setTestResult(result);
    setUserAnswers(answers);
    setStage('result');
    
    // Обновляем навыки пользователя, если тест пройден
    if (result.score >= selectedTest.passingScore && user) {
      const existingSkillIndex = user.skills.findIndex(
        s => s.name.toLowerCase() === selectedTest.skillName.toLowerCase()
      );
      
      const newSkill = {
        id: `skill-${selectedTest.skillName.toLowerCase()}`,
        name: selectedTest.skillName,
        level: result.level,
        verified: true,
      };
      
      let updatedSkills;
      if (existingSkillIndex >= 0) {
        // Обновляем существующий навык
        updatedSkills = [...user.skills];
        updatedSkills[existingSkillIndex] = newSkill;
      } else {
        // Добавляем новый навык
        updatedSkills = [...user.skills, newSkill];
      }
      
      // Локальное обновление
      updateProfileLocal({ skills: updatedSkills });
      
      // Сохраняем в БД через API
      try {
        await userService.updateProfile({ skills: updatedSkills });
        console.log('[SkillTest] Verified skill saved to DB:', selectedTest.skillName);
      } catch (error) {
        console.error('[SkillTest] Failed to save verified skill:', error);
      }
    }
  };
  
  const handleCancelTest = () => {
    setSelectedTest(null);
    setStage('list');
  };
  
  const handleRetryTest = () => {
    setTestResult(null);
    setUserAnswers([]);
    setStage('testing');
  };
  
  const handleViewAnswers = () => {
    setStage('answers');
  };
  
  const handleCloseResult = () => {
    setSelectedTest(null);
    setTestResult(null);
    setUserAnswers([]);
    setStage('list');
  };
  
  // Рендер по stage
  if (stage === 'testing' && selectedTest) {
    return (
      <SkillTestFlow
        test={selectedTest}
        onComplete={handleCompleteTest}
        onCancel={handleCancelTest}
      />
    );
  }
  
  if (stage === 'result' && selectedTest && testResult) {
    return (
      <SkillTestResult
        test={selectedTest}
        result={testResult}
        answers={userAnswers}
        onRetry={handleRetryTest}
        onClose={handleCloseResult}
        onViewAnswers={handleViewAnswers}
      />
    );
  }
  
  if (stage === 'answers' && selectedTest) {
    return (
      <SkillTestAnswers
        test={selectedTest}
        answers={userAnswers}
        onClose={() => setStage('result')}
      />
    );
  }
  
  // List stage - выбор теста
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Тесты на навыки</h1>
            <p className="text-sm text-base-content/60">
              Подтвердите свои знания
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input
            type="text"
            placeholder="Поиск теста..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>
        
        {/* Category filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`btn btn-sm gap-1 shrink-0 ${
                categoryFilter === category ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {categoryIcons[category]}
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tests list */}
      <div className="p-4">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
            <p className="text-base-content/60">Тесты не найдены</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="btn btn-ghost btn-sm mt-2"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(testsByCategory).map(([category, tests]) => (
              <div key={category}>
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  {categoryIcons[category as CategoryFilter]}
                  {categoryLabels[category as CategoryFilter] || category}
                  <span className="badge badge-ghost badge-sm">{tests.length}</span>
                </h2>
                <div className="space-y-3">
                  {tests.map(test => (
                    <SkillTestCard
                      key={test.id}
                      test={test}
                      onStart={() => handleStartTest(test)}
                      isCompleted={!!getCompletedLevel(test.skillName)}
                      completedLevel={getCompletedLevel(test.skillName)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Stats section */}
      <div className="p-4 pt-0">
        <div className="bg-base-200 rounded-xl p-4 mt-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{allSkillTests.length}</p>
              <p className="text-xs text-base-content/60">Тестов доступно</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {user?.skills.filter(s => s.verified).length || 0}
              </p>
              <p className="text-xs text-base-content/60">Подтверждено</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {allSkillTests.reduce((acc, t) => acc + t.questions.length, 0)}
              </p>
              <p className="text-xs text-base-content/60">Вопросов</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
