import { SkillTest } from '../../types';

/**
 * Банк тестов для ML/Data Science
 * Python ML, TensorFlow/PyTorch, SQL, Data Analysis
 */

// ============================================
// PYTHON ML TEST
// ============================================
export const pythonMLTest: SkillTest = {
  id: 'python-ml-test',
  skillName: 'Python ML',
  category: 'ml',
  description: 'Тест на знание Python для ML: NumPy, Pandas, Scikit-learn, основы ML',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'pyml-1',
      difficulty: 'easy',
      question: 'Какая библиотека используется для работы с многомерными массивами в Python?',
      options: [
        { id: 'pyml-1-a', text: 'Pandas', isCorrect: false },
        { id: 'pyml-1-b', text: 'NumPy', isCorrect: true },
        { id: 'pyml-1-c', text: 'Matplotlib', isCorrect: false },
        { id: 'pyml-1-d', text: 'Seaborn', isCorrect: false },
      ],
      explanation: 'NumPy предоставляет ndarray - эффективную структуру для численных вычислений.',
    },
    {
      id: 'pyml-2',
      difficulty: 'easy',
      question: 'Что такое DataFrame в Pandas?',
      options: [
        { id: 'pyml-2-a', text: 'Одномерный массив', isCorrect: false },
        { id: 'pyml-2-b', text: 'Двумерная таблица с метками строк и столбцов', isCorrect: true },
        { id: 'pyml-2-c', text: 'График данных', isCorrect: false },
        { id: 'pyml-2-d', text: 'Модель машинного обучения', isCorrect: false },
      ],
      explanation: 'DataFrame - основная структура Pandas, похожая на таблицу Excel или SQL.',
    },
    {
      id: 'pyml-3',
      difficulty: 'easy',
      question: 'Какой метод заполняет пропущенные значения в Pandas?',
      options: [
        { id: 'pyml-3-a', text: 'dropna()', isCorrect: false },
        { id: 'pyml-3-b', text: 'fillna()', isCorrect: true },
        { id: 'pyml-3-c', text: 'isna()', isCorrect: false },
        { id: 'pyml-3-d', text: 'notna()', isCorrect: false },
      ],
      explanation: 'fillna() заполняет NaN значения указанным значением или методом (ffill, bfill).',
    },
    {
      id: 'pyml-4',
      difficulty: 'medium',
      question: 'Что такое train_test_split в scikit-learn?',
      code: `from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)`,
      options: [
        { id: 'pyml-4-a', text: 'Обучает модель', isCorrect: false },
        { id: 'pyml-4-b', text: 'Разделяет данные на обучающую и тестовую выборки', isCorrect: true },
        { id: 'pyml-4-c', text: 'Нормализует данные', isCorrect: false },
        { id: 'pyml-4-d', text: 'Создаёт признаки', isCorrect: false },
      ],
      explanation: 'train_test_split случайно разделяет данные для обучения и валидации модели.',
    },
    {
      id: 'pyml-5',
      difficulty: 'medium',
      question: 'Что такое overfitting (переобучение)?',
      options: [
        { id: 'pyml-5-a', text: 'Модель слишком медленная', isCorrect: false },
        { id: 'pyml-5-b', text: 'Модель запомнила обучающие данные и плохо обобщает на новые', isCorrect: true },
        { id: 'pyml-5-c', text: 'Модель недообучена', isCorrect: false },
        { id: 'pyml-5-d', text: 'Ошибка в данных', isCorrect: false },
      ],
      explanation: 'Overfitting - высокая точность на train, низкая на test. Модель выучила шум, а не паттерны.',
    },
    {
      id: 'pyml-6',
      difficulty: 'medium',
      question: 'Для чего используется StandardScaler?',
      options: [
        { id: 'pyml-6-a', text: 'Для кодирования категорий', isCorrect: false },
        { id: 'pyml-6-b', text: 'Для нормализации признаков (mean=0, std=1)', isCorrect: true },
        { id: 'pyml-6-c', text: 'Для отбора признаков', isCorrect: false },
        { id: 'pyml-6-d', text: 'Для уменьшения размерности', isCorrect: false },
      ],
      explanation: 'StandardScaler приводит признаки к стандартному нормальному распределению (z-score).',
    },
    {
      id: 'pyml-7',
      difficulty: 'medium',
      question: 'Что такое cross-validation?',
      options: [
        { id: 'pyml-7-a', text: 'Тип модели', isCorrect: false },
        { id: 'pyml-7-b', text: 'Метод оценки модели путём разбиения данных на K фолдов', isCorrect: true },
        { id: 'pyml-7-c', text: 'Способ очистки данных', isCorrect: false },
        { id: 'pyml-7-d', text: 'Алгоритм оптимизации', isCorrect: false },
      ],
      explanation: 'K-Fold CV разбивает данные на K частей, обучая K раз на K-1 частях и тестируя на оставшейся.',
    },
    {
      id: 'pyml-8',
      difficulty: 'hard',
      question: 'Что делает этот код?',
      code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV

param_grid = {'n_estimators': [100, 200], 'max_depth': [10, 20]}
grid_search = GridSearchCV(RandomForestClassifier(), param_grid, cv=5)
grid_search.fit(X_train, y_train)`,
      options: [
        { id: 'pyml-8-a', text: 'Обучает один RandomForest', isCorrect: false },
        { id: 'pyml-8-b', text: 'Ищет лучшие гиперпараметры методом перебора с кросс-валидацией', isCorrect: true },
        { id: 'pyml-8-c', text: 'Создаёт ансамбль моделей', isCorrect: false },
        { id: 'pyml-8-d', text: 'Генерирует признаки', isCorrect: false },
      ],
      explanation: 'GridSearchCV перебирает все комбинации параметров, оценивая каждую через CV.',
    },
    {
      id: 'pyml-9',
      difficulty: 'hard',
      question: 'В чём разница между L1 и L2 регуляризацией?',
      options: [
        { id: 'pyml-9-a', text: 'Нет разницы', isCorrect: false },
        { id: 'pyml-9-b', text: 'L1 (Lasso) даёт sparse веса, L2 (Ridge) уменьшает все веса', isCorrect: true },
        { id: 'pyml-9-c', text: 'L2 быстрее', isCorrect: false },
        { id: 'pyml-9-d', text: 'L1 только для классификации', isCorrect: false },
      ],
      explanation: 'L1 штрафует |w|, обнуляя неважные признаки. L2 штрафует w², уменьшая все веса равномерно.',
    },
    {
      id: 'pyml-10',
      difficulty: 'hard',
      question: 'Что такое confusion matrix и какие метрики из неё выводятся?',
      options: [
        { id: 'pyml-10-a', text: 'Матрица корреляций', isCorrect: false },
        { id: 'pyml-10-b', text: 'Таблица TP/FP/TN/FN для вычисления precision, recall, F1', isCorrect: true },
        { id: 'pyml-10-c', text: 'Матрица весов модели', isCorrect: false },
        { id: 'pyml-10-d', text: 'Матрица признаков', isCorrect: false },
      ],
      explanation: 'Confusion matrix показывает распределение предсказаний. Precision=TP/(TP+FP), Recall=TP/(TP+FN).',
    },
  ],
};

// ============================================
// TENSORFLOW/PYTORCH TEST
// ============================================
export const deepLearningTest: SkillTest = {
  id: 'deep-learning-test',
  skillName: 'Deep Learning',
  category: 'ml',
  description: 'Тест на знание Deep Learning: нейронные сети, TensorFlow, PyTorch',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'dl-1',
      difficulty: 'easy',
      question: 'Что такое нейрон в нейронной сети?',
      options: [
        { id: 'dl-1-a', text: 'Тип данных', isCorrect: false },
        { id: 'dl-1-b', text: 'Вычислительный узел: взвешенная сумма входов + активация', isCorrect: true },
        { id: 'dl-1-c', text: 'Функция потерь', isCorrect: false },
        { id: 'dl-1-d', text: 'Оптимизатор', isCorrect: false },
      ],
      explanation: 'Нейрон вычисляет: output = activation(sum(weights * inputs) + bias).',
    },
    {
      id: 'dl-2',
      difficulty: 'easy',
      question: 'Для чего нужна функция активации?',
      options: [
        { id: 'dl-2-a', text: 'Для ускорения обучения', isCorrect: false },
        { id: 'dl-2-b', text: 'Для добавления нелинейности в модель', isCorrect: true },
        { id: 'dl-2-c', text: 'Для нормализации данных', isCorrect: false },
        { id: 'dl-2-d', text: 'Для регуляризации', isCorrect: false },
      ],
      explanation: 'Без нелинейности многослойная сеть эквивалентна одному линейному слою.',
    },
    {
      id: 'dl-3',
      difficulty: 'easy',
      question: 'Что такое epoch в обучении нейросети?',
      options: [
        { id: 'dl-3-a', text: 'Один batch данных', isCorrect: false },
        { id: 'dl-3-b', text: 'Один полный проход по всему обучающему набору', isCorrect: true },
        { id: 'dl-3-c', text: 'Один нейрон', isCorrect: false },
        { id: 'dl-3-d', text: 'Одна итерация градиентного спуска', isCorrect: false },
      ],
      explanation: 'Epoch - полный проход по dataset. Обычно обучение занимает много epochs.',
    },
    {
      id: 'dl-4',
      difficulty: 'medium',
      question: 'Что такое backpropagation?',
      options: [
        { id: 'dl-4-a', text: 'Прямой проход по сети', isCorrect: false },
        { id: 'dl-4-b', text: 'Алгоритм вычисления градиентов через цепное правило', isCorrect: true },
        { id: 'dl-4-c', text: 'Функция потерь', isCorrect: false },
        { id: 'dl-4-d', text: 'Тип слоя', isCorrect: false },
      ],
      explanation: 'Backprop вычисляет ∂Loss/∂weights для каждого слоя, распространяя градиенты от выхода к входу.',
    },
    {
      id: 'dl-5',
      difficulty: 'medium',
      question: 'В чём разница между ReLU и Sigmoid?',
      options: [
        { id: 'dl-5-a', text: 'Нет разницы', isCorrect: false },
        { id: 'dl-5-b', text: 'ReLU = max(0,x), решает проблему vanishing gradient; Sigmoid сжимает в [0,1]', isCorrect: true },
        { id: 'dl-5-c', text: 'Sigmoid быстрее', isCorrect: false },
        { id: 'dl-5-d', text: 'ReLU только для классификации', isCorrect: false },
      ],
      explanation: 'ReLU не насыщается для положительных x, что ускоряет обучение глубоких сетей.',
    },
    {
      id: 'dl-6',
      difficulty: 'medium',
      question: 'Для чего используется Dropout?',
      options: [
        { id: 'dl-6-a', text: 'Для ускорения обучения', isCorrect: false },
        { id: 'dl-6-b', text: 'Для регуляризации - случайно отключает нейроны во время обучения', isCorrect: true },
        { id: 'dl-6-c', text: 'Для нормализации', isCorrect: false },
        { id: 'dl-6-d', text: 'Для уменьшения модели', isCorrect: false },
      ],
      explanation: 'Dropout предотвращает переобучение, заставляя сеть не полагаться на конкретные нейроны.',
    },
    {
      id: 'dl-7',
      difficulty: 'medium',
      question: 'Что такое CNN (Convolutional Neural Network)?',
      options: [
        { id: 'dl-7-a', text: 'Сеть для текста', isCorrect: false },
        { id: 'dl-7-b', text: 'Архитектура со свёрточными слоями, эффективная для изображений', isCorrect: true },
        { id: 'dl-7-c', text: 'Рекуррентная сеть', isCorrect: false },
        { id: 'dl-7-d', text: 'Генеративная модель', isCorrect: false },
      ],
      explanation: 'CNN использует свёртки для извлечения локальных паттернов, эффективна для визуальных данных.',
    },
    {
      id: 'dl-8',
      difficulty: 'hard',
      question: 'Что делает этот PyTorch код?',
      code: `model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(256, 10)
)`,
      options: [
        { id: 'dl-8-a', text: 'Загружает предобученную модель', isCorrect: false },
        { id: 'dl-8-b', text: 'Создаёт нейросеть: 784→256→ReLU→Dropout→10', isCorrect: true },
        { id: 'dl-8-c', text: 'Обучает модель', isCorrect: false },
        { id: 'dl-8-d', text: 'Делает предсказание', isCorrect: false },
      ],
      explanation: 'Sequential создаёт сеть из слоёв. 784 входов (28x28 изображение), 10 выходов (цифры 0-9).',
    },
    {
      id: 'dl-9',
      difficulty: 'hard',
      question: 'Что такое Batch Normalization и зачем она нужна?',
      options: [
        { id: 'dl-9-a', text: 'Увеличивает batch size', isCorrect: false },
        { id: 'dl-9-b', text: 'Нормализует входы слоя, ускоряет обучение и стабилизирует градиенты', isCorrect: true },
        { id: 'dl-9-c', text: 'Уменьшает модель', isCorrect: false },
        { id: 'dl-9-d', text: 'Заменяет Dropout', isCorrect: false },
      ],
      explanation: 'BatchNorm нормализует активации по batch, что позволяет использовать большие learning rate.',
    },
    {
      id: 'dl-10',
      difficulty: 'hard',
      question: 'Что такое Transfer Learning?',
      options: [
        { id: 'dl-10-a', text: 'Обучение с нуля', isCorrect: false },
        { id: 'dl-10-b', text: 'Использование предобученной модели и её дообучение на новых данных', isCorrect: true },
        { id: 'dl-10-c', text: 'Передача данных между моделями', isCorrect: false },
        { id: 'dl-10-d', text: 'Тип данных', isCorrect: false },
      ],
      explanation: 'Transfer Learning использует знания из одной задачи (ImageNet) для решения другой с меньшим dataset.',
    },
  ],
};

// ============================================
// SQL TEST
// ============================================
export const sqlTest: SkillTest = {
  id: 'sql-test',
  skillName: 'SQL',
  category: 'ml',
  description: 'Тест на знание SQL: запросы, JOIN, агрегации, оптимизация',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'sql-1',
      difficulty: 'easy',
      question: 'Какой оператор выбирает данные из таблицы?',
      options: [
        { id: 'sql-1-a', text: 'INSERT', isCorrect: false },
        { id: 'sql-1-b', text: 'SELECT', isCorrect: true },
        { id: 'sql-1-c', text: 'UPDATE', isCorrect: false },
        { id: 'sql-1-d', text: 'DELETE', isCorrect: false },
      ],
      explanation: 'SELECT извлекает данные из одной или нескольких таблиц.',
    },
    {
      id: 'sql-2',
      difficulty: 'easy',
      question: 'Что делает WHERE в SQL запросе?',
      options: [
        { id: 'sql-2-a', text: 'Сортирует результаты', isCorrect: false },
        { id: 'sql-2-b', text: 'Фильтрует строки по условию', isCorrect: true },
        { id: 'sql-2-c', text: 'Группирует данные', isCorrect: false },
        { id: 'sql-2-d', text: 'Объединяет таблицы', isCorrect: false },
      ],
      explanation: 'WHERE задаёт условие для фильтрации строк до агрегации.',
    },
    {
      id: 'sql-3',
      difficulty: 'easy',
      question: 'Какой результат запроса?',
      code: `SELECT COUNT(*) FROM users WHERE age > 18;`,
      options: [
        { id: 'sql-3-a', text: 'Список пользователей старше 18', isCorrect: false },
        { id: 'sql-3-b', text: 'Количество пользователей старше 18', isCorrect: true },
        { id: 'sql-3-c', text: 'Средний возраст', isCorrect: false },
        { id: 'sql-3-d', text: 'Сумма возрастов', isCorrect: false },
      ],
      explanation: 'COUNT(*) считает количество строк, удовлетворяющих условию.',
    },
    {
      id: 'sql-4',
      difficulty: 'medium',
      question: 'В чём разница между INNER JOIN и LEFT JOIN?',
      options: [
        { id: 'sql-4-a', text: 'Нет разницы', isCorrect: false },
        { id: 'sql-4-b', text: 'INNER возвращает только совпадения, LEFT - все из левой + совпадения', isCorrect: true },
        { id: 'sql-4-c', text: 'LEFT быстрее', isCorrect: false },
        { id: 'sql-4-d', text: 'INNER объединяет больше таблиц', isCorrect: false },
      ],
      explanation: 'LEFT JOIN сохраняет все строки левой таблицы, заполняя NULL для несовпадений.',
    },
    {
      id: 'sql-5',
      difficulty: 'medium',
      question: 'Что делает GROUP BY?',
      code: `SELECT department, AVG(salary) 
FROM employees 
GROUP BY department;`,
      options: [
        { id: 'sql-5-a', text: 'Сортирует по отделу', isCorrect: false },
        { id: 'sql-5-b', text: 'Группирует строки для агрегации по каждому отделу', isCorrect: true },
        { id: 'sql-5-c', text: 'Фильтрует отделы', isCorrect: false },
        { id: 'sql-5-d', text: 'Объединяет таблицы', isCorrect: false },
      ],
      explanation: 'GROUP BY создаёт группы для вычисления агрегатных функций (AVG, SUM, COUNT) по каждой.',
    },
    {
      id: 'sql-6',
      difficulty: 'medium',
      question: 'В чём разница между WHERE и HAVING?',
      options: [
        { id: 'sql-6-a', text: 'Нет разницы', isCorrect: false },
        { id: 'sql-6-b', text: 'WHERE фильтрует до группировки, HAVING - после (по агрегатам)', isCorrect: true },
        { id: 'sql-6-c', text: 'HAVING быстрее', isCorrect: false },
        { id: 'sql-6-d', text: 'WHERE только для чисел', isCorrect: false },
      ],
      explanation: 'HAVING фильтрует группы после GROUP BY, может использовать агрегатные функции.',
    },
    {
      id: 'sql-7',
      difficulty: 'medium',
      question: 'Что такое индекс в базе данных?',
      options: [
        { id: 'sql-7-a', text: 'Номер строки', isCorrect: false },
        { id: 'sql-7-b', text: 'Структура данных для ускорения поиска по столбцам', isCorrect: true },
        { id: 'sql-7-c', text: 'Тип данных', isCorrect: false },
        { id: 'sql-7-d', text: 'Связь между таблицами', isCorrect: false },
      ],
      explanation: 'Индекс (обычно B-tree) ускоряет SELECT/WHERE, но замедляет INSERT/UPDATE.',
    },
    {
      id: 'sql-8',
      difficulty: 'hard',
      question: 'Что вернёт запрос?',
      code: `SELECT name, salary,
       RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;`,
      options: [
        { id: 'sql-8-a', text: 'Ошибка синтаксиса', isCorrect: false },
        { id: 'sql-8-b', text: 'Сотрудников с рангом по зарплате (одинаковые зарплаты = одинаковый ранг)', isCorrect: true },
        { id: 'sql-8-c', text: 'Только топ-1 по зарплате', isCorrect: false },
        { id: 'sql-8-d', text: 'Сумму зарплат', isCorrect: false },
      ],
      explanation: 'RANK() - оконная функция, присваивающая ранг с пропусками при одинаковых значениях.',
    },
    {
      id: 'sql-9',
      difficulty: 'hard',
      question: 'Что такое CTE (Common Table Expression)?',
      code: `WITH high_earners AS (
  SELECT * FROM employees WHERE salary > 100000
)
SELECT department, COUNT(*) FROM high_earners GROUP BY department;`,
      options: [
        { id: 'sql-9-a', text: 'Постоянная таблица', isCorrect: false },
        { id: 'sql-9-b', text: 'Временный именованный результат запроса для использования в основном запросе', isCorrect: true },
        { id: 'sql-9-c', text: 'Хранимая процедура', isCorrect: false },
        { id: 'sql-9-d', text: 'Индекс', isCorrect: false },
      ],
      explanation: 'CTE (WITH) создаёт читаемые подзапросы, существующие только во время выполнения.',
    },
    {
      id: 'sql-10',
      difficulty: 'hard',
      question: 'Как предотвратить SQL-инъекции?',
      options: [
        { id: 'sql-10-a', text: 'Экранировать кавычки', isCorrect: false },
        { id: 'sql-10-b', text: 'Использовать параметризованные запросы / prepared statements', isCorrect: true },
        { id: 'sql-10-c', text: 'Валидировать длину ввода', isCorrect: false },
        { id: 'sql-10-d', text: 'Использовать HTTPS', isCorrect: false },
      ],
      explanation: 'Prepared statements отделяют код SQL от данных, полностью предотвращая инъекции.',
    },
  ],
};

// ============================================
// DATA ANALYSIS TEST
// ============================================
export const dataAnalysisTest: SkillTest = {
  id: 'data-analysis-test',
  skillName: 'Data Analysis',
  category: 'ml',
  description: 'Тест на знание анализа данных: статистика, визуализация, EDA',
  passingScore: 50,
  timeLimit: 600,
  levelThresholds: {
    beginner: 0,
    intermediate: 50,
    advanced: 70,
    expert: 90,
  },
  questions: [
    {
      id: 'da-1',
      difficulty: 'easy',
      question: 'Что такое среднее (mean) значение?',
      options: [
        { id: 'da-1-a', text: 'Наиболее частое значение', isCorrect: false },
        { id: 'da-1-b', text: 'Сумма всех значений, делённая на их количество', isCorrect: true },
        { id: 'da-1-c', text: 'Значение посередине отсортированного ряда', isCorrect: false },
        { id: 'da-1-d', text: 'Разница между max и min', isCorrect: false },
      ],
      explanation: 'Mean = Σx / n. Чувствительно к выбросам.',
    },
    {
      id: 'da-2',
      difficulty: 'easy',
      question: 'Что такое медиана?',
      options: [
        { id: 'da-2-a', text: 'Среднее значение', isCorrect: false },
        { id: 'da-2-b', text: 'Значение, разделяющее отсортированный ряд пополам', isCorrect: true },
        { id: 'da-2-c', text: 'Наиболее частое значение', isCorrect: false },
        { id: 'da-2-d', text: 'Стандартное отклонение', isCorrect: false },
      ],
      explanation: 'Медиана - 50-й перцентиль. Устойчива к выбросам.',
    },
    {
      id: 'da-3',
      difficulty: 'easy',
      question: 'Какой график лучше показывает распределение одной переменной?',
      options: [
        { id: 'da-3-a', text: 'Scatter plot', isCorrect: false },
        { id: 'da-3-b', text: 'Histogram', isCorrect: true },
        { id: 'da-3-c', text: 'Line chart', isCorrect: false },
        { id: 'da-3-d', text: 'Pie chart', isCorrect: false },
      ],
      explanation: 'Гистограмма показывает частоту значений в интервалах (bins).',
    },
    {
      id: 'da-4',
      difficulty: 'medium',
      question: 'Что такое корреляция?',
      options: [
        { id: 'da-4-a', text: 'Причинно-следственная связь', isCorrect: false },
        { id: 'da-4-b', text: 'Мера линейной зависимости между переменными [-1, 1]', isCorrect: true },
        { id: 'da-4-c', text: 'Разброс данных', isCorrect: false },
        { id: 'da-4-d', text: 'Среднее отклонение', isCorrect: false },
      ],
      explanation: 'Корреляция Пирсона показывает силу и направление линейной связи. Не означает причинность!',
    },
    {
      id: 'da-5',
      difficulty: 'medium',
      question: 'Что такое выброс (outlier)?',
      options: [
        { id: 'da-5-a', text: 'Пропущенное значение', isCorrect: false },
        { id: 'da-5-b', text: 'Значение, сильно отличающееся от остальных', isCorrect: true },
        { id: 'da-5-c', text: 'Дубликат', isCorrect: false },
        { id: 'da-5-d', text: 'Категориальная переменная', isCorrect: false },
      ],
      explanation: 'Outliers могут быть ошибками или реальными экстремальными значениями. Определяются через IQR или z-score.',
    },
    {
      id: 'da-6',
      difficulty: 'medium',
      question: 'Что показывает box plot (ящик с усами)?',
      options: [
        { id: 'da-6-a', text: 'Тренд во времени', isCorrect: false },
        { id: 'da-6-b', text: 'Медиану, квартили, размах и выбросы', isCorrect: true },
        { id: 'da-6-c', text: 'Корреляцию переменных', isCorrect: false },
        { id: 'da-6-d', text: 'Доли категорий', isCorrect: false },
      ],
      explanation: 'Box plot показывает Q1, медиану, Q3, усы (1.5*IQR) и выбросы.',
    },
    {
      id: 'da-7',
      difficulty: 'medium',
      question: 'Что такое EDA (Exploratory Data Analysis)?',
      options: [
        { id: 'da-7-a', text: 'Алгоритм машинного обучения', isCorrect: false },
        { id: 'da-7-b', text: 'Процесс исследования данных для понимания их структуры и паттернов', isCorrect: true },
        { id: 'da-7-c', text: 'Метод очистки данных', isCorrect: false },
        { id: 'da-7-d', text: 'Тип визуализации', isCorrect: false },
      ],
      explanation: 'EDA - первый этап анализа: статистики, визуализации, поиск аномалий и паттернов.',
    },
    {
      id: 'da-8',
      difficulty: 'hard',
      question: 'Что такое p-value в статистике?',
      options: [
        { id: 'da-8-a', text: 'Вероятность верности гипотезы', isCorrect: false },
        { id: 'da-8-b', text: 'Вероятность получить такие или более экстремальные данные при верной H0', isCorrect: true },
        { id: 'da-8-c', text: 'Точность модели', isCorrect: false },
        { id: 'da-8-d', text: 'Размер выборки', isCorrect: false },
      ],
      explanation: 'p-value < α (обычно 0.05) означает отвержение нулевой гипотезы.',
    },
    {
      id: 'da-9',
      difficulty: 'hard',
      question: 'В чём разница между дисперсией и стандартным отклонением?',
      options: [
        { id: 'da-9-a', text: 'Нет разницы', isCorrect: false },
        { id: 'da-9-b', text: 'Стандартное отклонение = √дисперсии, в тех же единицах что и данные', isCorrect: true },
        { id: 'da-9-c', text: 'Дисперсия всегда больше', isCorrect: false },
        { id: 'da-9-d', text: 'Используются для разных типов данных', isCorrect: false },
      ],
      explanation: 'Дисперсия = Σ(x-μ)²/n в квадратных единицах. SD = √Var в исходных единицах.',
    },
    {
      id: 'da-10',
      difficulty: 'hard',
      question: 'Что такое A/B тестирование?',
      options: [
        { id: 'da-10-a', text: 'Сравнение двух алгоритмов ML', isCorrect: false },
        { id: 'da-10-b', text: 'Эксперимент для сравнения двух версий (контроль vs treatment)', isCorrect: true },
        { id: 'da-10-c', text: 'Метод кросс-валидации', isCorrect: false },
        { id: 'da-10-d', text: 'Тип визуализации', isCorrect: false },
      ],
      explanation: 'A/B тест случайно делит пользователей на группы для измерения эффекта изменений.',
    },
  ],
};

// ============================================
// EXPORT ALL ML TESTS
// ============================================
export const mlTests: SkillTest[] = [
  pythonMLTest,
  deepLearningTest,
  sqlTest,
  dataAnalysisTest,
];

export const getMlTestBySkill = (skillName: string): SkillTest | undefined => {
  return mlTests.find(
    test => test.skillName.toLowerCase() === skillName.toLowerCase()
  );
};
