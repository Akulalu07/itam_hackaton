/**
 * Skill Tests - Банк тестов для подтверждения навыков
 * 
 * Структура:
 * - backendTests.ts - Go, Python, Node.js, Java
 * - frontendTests.ts - React, Vue, Angular, TypeScript
 * - devopsTests.ts - Docker, Kubernetes, CI/CD, Linux
 * - mlTests.ts - Python ML, Deep Learning, SQL, Data Analysis
 * - designTests.ts - UI/UX, Figma (TODO)
 */

export * from './backendTests';
export * from './frontendTests';
export * from './devopsTests';
export * from './mlTests';

// Утилиты для работы с тестами
import { SkillTest, SkillLevel, TestResult, UserAnswer } from '../../types';
import { backendTests, getBackendTestBySkill } from './backendTests';
import { frontendTests, getFrontendTestBySkill } from './frontendTests';
import { devopsTests, getDevopsTestBySkill } from './devopsTests';
import { mlTests, getMlTestBySkill } from './mlTests';

// Все доступные тесты
export const allSkillTests: SkillTest[] = [
  ...backendTests,
  ...frontendTests,
  ...devopsTests,
  ...mlTests,
];

// Получить тест по названию навыка (поиск по всем категориям)
export const getTestBySkill = (skillName: string): SkillTest | undefined => {
  return getBackendTestBySkill(skillName) 
    || getFrontendTestBySkill(skillName)
    || getDevopsTestBySkill(skillName)
    || getMlTestBySkill(skillName);
};

// Получить список всех доступных навыков с тестами
export const getAvailableSkillsWithTests = (): string[] => {
  return allSkillTests.map(test => test.skillName);
};

/**
 * Рассчитать результат теста
 */
export const calculateTestResult = (
  test: SkillTest,
  answers: UserAnswer[],
  timeSpent: number
): Omit<TestResult, 'id' | 'userId' | 'completedAt'> => {
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const score = Math.round((correctAnswers / test.questions.length) * 100);
  
  let level: SkillLevel;
  if (score >= test.levelThresholds.expert) {
    level = 'expert';
  } else if (score >= test.levelThresholds.advanced) {
    level = 'advanced';
  } else if (score >= test.levelThresholds.intermediate) {
    level = 'intermediate';
  } else {
    level = 'beginner';
  }
  
  return {
    skillName: test.skillName,
    score,
    level,
    answers,
    timeSpent,
  };
};

/**
 * Получить описание уровня
 */
export const getLevelDescription = (level: SkillLevel): string => {
  const descriptions: Record<SkillLevel, string> = {
    beginner: 'Начинающий - базовые знания',
    intermediate: 'Средний - уверенное владение основами',
    advanced: 'Продвинутый - глубокое понимание',
    expert: 'Эксперт - мастерское владение',
  };
  return descriptions[level];
};

/**
 * Получить цвет badge для уровня
 */
export const getLevelBadgeClass = (level: SkillLevel): string => {
  const classes: Record<SkillLevel, string> = {
    beginner: 'badge-ghost',
    intermediate: 'badge-info',
    advanced: 'badge-success',
    expert: 'badge-warning',
  };
  return classes[level];
};

/**
 * Перемешать вопросы (для случайного порядка)
 */
export const shuffleQuestions = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
