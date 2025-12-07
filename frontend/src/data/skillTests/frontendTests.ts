import { SkillTest } from '../../types';

/**
 * Банк тестов для фронтенд-технологий
 * React, Vue, Angular, TypeScript
 * Каждый тест содержит 10 вопросов разной сложности
 */

// ============================================
// REACT TEST
// ============================================
export const reactTest: SkillTest = {
  id: 'react-test',
  skillName: 'React',
  category: 'frontend',
  description: 'Тест на знание React: компоненты, хуки, состояние, жизненный цикл',
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
      id: 'react-1',
      difficulty: 'easy',
      question: 'Что такое JSX?',
      options: [
        { id: 'react-1-a', text: 'JavaScript XML - синтаксическое расширение для описания UI', isCorrect: true },
        { id: 'react-1-b', text: 'Новый язык программирования', isCorrect: false },
        { id: 'react-1-c', text: 'Библиотека для работы с DOM', isCorrect: false },
        { id: 'react-1-d', text: 'Фреймворк для тестирования', isCorrect: false },
      ],
      explanation: 'JSX - это синтаксическое расширение JavaScript, которое позволяет писать HTML-подобный код в JavaScript.',
    },
    {
      id: 'react-2',
      difficulty: 'easy',
      question: 'Какой хук используется для управления состоянием в функциональном компоненте?',
      options: [
        { id: 'react-2-a', text: 'useEffect', isCorrect: false },
        { id: 'react-2-b', text: 'useState', isCorrect: true },
        { id: 'react-2-c', text: 'useContext', isCorrect: false },
        { id: 'react-2-d', text: 'useRef', isCorrect: false },
      ],
      explanation: 'useState возвращает пару: текущее значение состояния и функцию для его обновления.',
    },
    {
      id: 'react-3',
      difficulty: 'easy',
      question: 'Какой результат выполнения кода?',
      code: `function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
      options: [
        { id: 'react-3-a', text: 'Кнопка, увеличивающая счётчик при клике', isCorrect: true },
        { id: 'react-3-b', text: 'Ошибка - useState не определён', isCorrect: false },
        { id: 'react-3-c', text: 'Статичная кнопка с текстом "0"', isCorrect: false },
        { id: 'react-3-d', text: 'Бесконечный цикл', isCorrect: false },
      ],
      explanation: 'При клике вызывается setCount, обновляя состояние и перерендеривая компонент с новым значением.',
    },
    {
      id: 'react-4',
      difficulty: 'medium',
      question: 'Когда вызывается cleanup функция в useEffect?',
      code: `useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // cleanup
}, []);`,
      options: [
        { id: 'react-4-a', text: 'Только при монтировании', isCorrect: false },
        { id: 'react-4-b', text: 'При размонтировании и перед каждым повторным эффектом', isCorrect: true },
        { id: 'react-4-c', text: 'Никогда с пустым массивом зависимостей', isCorrect: false },
        { id: 'react-4-d', text: 'Сразу после эффекта', isCorrect: false },
      ],
      explanation: 'Cleanup вызывается при unmount компонента и перед повторным запуском эффекта (при изменении deps).',
    },
    {
      id: 'react-5',
      difficulty: 'medium',
      question: 'Что выведет console.log?',
      code: `function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count);
  };
  
  return <button onClick={handleClick}>Click</button>;
}`,
      options: [
        { id: 'react-5-a', text: '3', isCorrect: false },
        { id: 'react-5-b', text: '0 (при первом клике)', isCorrect: true },
        { id: 'react-5-c', text: '1', isCorrect: false },
        { id: 'react-5-d', text: 'undefined', isCorrect: false },
      ],
      explanation: 'setState асинхронен, count в замыкании остаётся 0. Все три setCount используют одно значение count.',
    },
    {
      id: 'react-6',
      difficulty: 'medium',
      question: 'Для чего используется useMemo?',
      options: [
        { id: 'react-6-a', text: 'Для создания мемоизированного состояния', isCorrect: false },
        { id: 'react-6-b', text: 'Для мемоизации вычисленного значения между рендерами', isCorrect: true },
        { id: 'react-6-c', text: 'Для кэширования API запросов', isCorrect: false },
        { id: 'react-6-d', text: 'Для создания ref', isCorrect: false },
      ],
      explanation: 'useMemo кэширует результат вычисления и пересчитывает только при изменении зависимостей.',
    },
    {
      id: 'react-7',
      difficulty: 'medium',
      question: 'В чём разница между useCallback и useMemo?',
      options: [
        { id: 'react-7-a', text: 'Нет разницы', isCorrect: false },
        { id: 'react-7-b', text: 'useCallback мемоизирует функцию, useMemo - значение', isCorrect: true },
        { id: 'react-7-c', text: 'useCallback для классов, useMemo для функций', isCorrect: false },
        { id: 'react-7-d', text: 'useMemo быстрее', isCorrect: false },
      ],
      explanation: 'useCallback(fn, deps) эквивалентен useMemo(() => fn, deps). useCallback возвращает саму функцию.',
    },
    {
      id: 'react-8',
      difficulty: 'hard',
      question: 'Что такое React.memo и когда его использовать?',
      options: [
        { id: 'react-8-a', text: 'Хук для мемоизации', isCorrect: false },
        { id: 'react-8-b', text: 'HOC для предотвращения ререндера при неизменных props', isCorrect: true },
        { id: 'react-8-c', text: 'Метод для оптимизации state', isCorrect: false },
        { id: 'react-8-d', text: 'Функция для lazy loading', isCorrect: false },
      ],
      explanation: 'React.memo - HOC, который делает shallow compare props и пропускает ререндер если props не изменились.',
    },
    {
      id: 'react-9',
      difficulty: 'hard',
      question: 'Какая проблема в этом коде?',
      code: `function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li>{user.name}</li>
      ))}
    </ul>
  );
}`,
      options: [
        { id: 'react-9-a', text: 'Нет проблем', isCorrect: false },
        { id: 'react-9-b', text: 'Отсутствует key prop у элементов списка', isCorrect: true },
        { id: 'react-9-c', text: 'Неправильный синтаксис map', isCorrect: false },
        { id: 'react-9-d', text: 'users может быть undefined', isCorrect: false },
      ],
      explanation: 'Элементы списка должны иметь уникальный key для эффективной работы алгоритма reconciliation.',
    },
    {
      id: 'react-10',
      difficulty: 'hard',
      question: 'Как правильно обновить объект в состоянии?',
      code: `const [user, setUser] = useState({ name: 'John', age: 25 });`,
      options: [
        { id: 'react-10-a', text: 'user.age = 26; setUser(user);', isCorrect: false },
        { id: 'react-10-b', text: 'setUser({ ...user, age: 26 });', isCorrect: true },
        { id: 'react-10-c', text: 'setUser(user.age = 26);', isCorrect: false },
        { id: 'react-10-d', text: 'user.age = 26;', isCorrect: false },
      ],
      explanation: 'Состояние должно быть иммутабельным. Нужно создать новый объект через spread оператор.',
    },
  ],
};

// ============================================
// VUE TEST
// ============================================
export const vueTest: SkillTest = {
  id: 'vue-test',
  skillName: 'Vue',
  category: 'frontend',
  description: 'Тест на знание Vue.js: реактивность, компоненты, Composition API, директивы',
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
      id: 'vue-1',
      difficulty: 'easy',
      question: 'Какая директива используется для двустороннего связывания данных?',
      options: [
        { id: 'vue-1-a', text: 'v-bind', isCorrect: false },
        { id: 'vue-1-b', text: 'v-model', isCorrect: true },
        { id: 'vue-1-c', text: 'v-on', isCorrect: false },
        { id: 'vue-1-d', text: 'v-if', isCorrect: false },
      ],
      explanation: 'v-model создаёт двустороннюю связь между input и данными компонента.',
    },
    {
      id: 'vue-2',
      difficulty: 'easy',
      question: 'Как передать prop компоненту?',
      code: `<MyComponent :title="pageTitle" />`,
      options: [
        { id: 'vue-2-a', text: ':title передаёт выражение JavaScript', isCorrect: true },
        { id: 'vue-2-b', text: ':title передаёт строку ":pageTitle"', isCorrect: false },
        { id: 'vue-2-c', text: 'Это синтаксическая ошибка', isCorrect: false },
        { id: 'vue-2-d', text: ':title создаёт событие', isCorrect: false },
      ],
      explanation: ':title - это сокращение v-bind:title, передаёт значение переменной pageTitle.',
    },
    {
      id: 'vue-3',
      difficulty: 'easy',
      question: 'Что делает директива v-for?',
      options: [
        { id: 'vue-3-a', text: 'Условный рендеринг', isCorrect: false },
        { id: 'vue-3-b', text: 'Итерация по массиву или объекту для рендеринга списка', isCorrect: true },
        { id: 'vue-3-c', text: 'Форматирование текста', isCorrect: false },
        { id: 'vue-3-d', text: 'Обработка событий', isCorrect: false },
      ],
      explanation: 'v-for используется для рендеринга списка элементов на основе массива.',
    },
    {
      id: 'vue-4',
      difficulty: 'medium',
      question: 'В чём разница между computed и methods?',
      options: [
        { id: 'vue-4-a', text: 'Нет разницы', isCorrect: false },
        { id: 'vue-4-b', text: 'computed кэшируется и пересчитывается при изменении зависимостей', isCorrect: true },
        { id: 'vue-4-c', text: 'methods быстрее', isCorrect: false },
        { id: 'vue-4-d', text: 'computed только для чтения', isCorrect: false },
      ],
      explanation: 'computed свойства кэшируются и обновляются только при изменении реактивных зависимостей.',
    },
    {
      id: 'vue-5',
      difficulty: 'medium',
      question: 'Что такое ref() в Composition API?',
      code: `const count = ref(0);`,
      options: [
        { id: 'vue-5-a', text: 'Ссылка на DOM элемент', isCorrect: false },
        { id: 'vue-5-b', text: 'Реактивная обёртка для примитивного значения', isCorrect: true },
        { id: 'vue-5-c', text: 'Функция для создания компонента', isCorrect: false },
        { id: 'vue-5-d', text: 'Импорт модуля', isCorrect: false },
      ],
      explanation: 'ref() создаёт реактивную ссылку. Значение доступно через .value в JavaScript.',
    },
    {
      id: 'vue-6',
      difficulty: 'medium',
      question: 'В чём разница между ref и reactive?',
      options: [
        { id: 'vue-6-a', text: 'Нет разницы', isCorrect: false },
        { id: 'vue-6-b', text: 'ref для примитивов (требует .value), reactive для объектов', isCorrect: true },
        { id: 'vue-6-c', text: 'reactive быстрее', isCorrect: false },
        { id: 'vue-6-d', text: 'ref только для DOM', isCorrect: false },
      ],
      explanation: 'ref оборачивает значение в объект с .value, reactive делает весь объект реактивным напрямую.',
    },
    {
      id: 'vue-7',
      difficulty: 'medium',
      question: 'Какой lifecycle hook вызывается после монтирования компонента в DOM?',
      options: [
        { id: 'vue-7-a', text: 'created', isCorrect: false },
        { id: 'vue-7-b', text: 'mounted / onMounted', isCorrect: true },
        { id: 'vue-7-c', text: 'beforeMount', isCorrect: false },
        { id: 'vue-7-d', text: 'updated', isCorrect: false },
      ],
      explanation: 'mounted (Options API) или onMounted (Composition API) вызывается после вставки компонента в DOM.',
    },
    {
      id: 'vue-8',
      difficulty: 'hard',
      question: 'Что делает watch с опцией deep: true?',
      code: `watch(obj, callback, { deep: true });`,
      options: [
        { id: 'vue-8-a', text: 'Ускоряет отслеживание', isCorrect: false },
        { id: 'vue-8-b', text: 'Отслеживает изменения вложенных свойств объекта', isCorrect: true },
        { id: 'vue-8-c', text: 'Создаёт глубокую копию', isCorrect: false },
        { id: 'vue-8-d', text: 'Отключает реактивность', isCorrect: false },
      ],
      explanation: 'deep: true заставляет Vue рекурсивно отслеживать все вложенные свойства объекта.',
    },
    {
      id: 'vue-9',
      difficulty: 'hard',
      question: 'Что такое provide/inject?',
      options: [
        { id: 'vue-9-a', text: 'Система маршрутизации', isCorrect: false },
        { id: 'vue-9-b', text: 'Механизм передачи данных от предка к потомкам без props', isCorrect: true },
        { id: 'vue-9-c', text: 'Система плагинов', isCorrect: false },
        { id: 'vue-9-d', text: 'Dependency Injection для сервисов', isCorrect: false },
      ],
      explanation: 'provide/inject позволяет передавать данные вниз по дереву компонентов без prop drilling.',
    },
    {
      id: 'vue-10',
      difficulty: 'hard',
      question: 'Что такое Teleport в Vue 3?',
      code: `<Teleport to="body">
  <Modal />
</Teleport>`,
      options: [
        { id: 'vue-10-a', text: 'Компонент для анимаций', isCorrect: false },
        { id: 'vue-10-b', text: 'Рендерит содержимое в другой части DOM, вне текущего компонента', isCorrect: true },
        { id: 'vue-10-c', text: 'Компонент для lazy loading', isCorrect: false },
        { id: 'vue-10-d', text: 'Система роутинга', isCorrect: false },
      ],
      explanation: 'Teleport позволяет рендерить содержимое в любом месте DOM (например, модалки в body).',
    },
  ],
};

// ============================================
// ANGULAR TEST
// ============================================
export const angularTest: SkillTest = {
  id: 'angular-test',
  skillName: 'Angular',
  category: 'frontend',
  description: 'Тест на знание Angular: компоненты, сервисы, DI, RxJS, роутинг',
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
      id: 'angular-1',
      difficulty: 'easy',
      question: 'Что такое декоратор @Component?',
      options: [
        { id: 'angular-1-a', text: 'Функция для создания сервиса', isCorrect: false },
        { id: 'angular-1-b', text: 'Метаданные, определяющие класс как Angular компонент', isCorrect: true },
        { id: 'angular-1-c', text: 'Директива для стилей', isCorrect: false },
        { id: 'angular-1-d', text: 'Модуль для роутинга', isCorrect: false },
      ],
      explanation: '@Component определяет selector, template, styles и другие метаданные компонента.',
    },
    {
      id: 'angular-2',
      difficulty: 'easy',
      question: 'Какой синтаксис используется для интерполяции в шаблоне?',
      options: [
        { id: 'angular-2-a', text: '{value}', isCorrect: false },
        { id: 'angular-2-b', text: '{{ value }}', isCorrect: true },
        { id: 'angular-2-c', text: '${value}', isCorrect: false },
        { id: 'angular-2-d', text: '[value]', isCorrect: false },
      ],
      explanation: 'Двойные фигурные скобки {{ }} используются для вывода значений в шаблоне.',
    },
    {
      id: 'angular-3',
      difficulty: 'easy',
      question: 'Что делает директива *ngIf?',
      options: [
        { id: 'angular-3-a', text: 'Итерирует по массиву', isCorrect: false },
        { id: 'angular-3-b', text: 'Условно добавляет/удаляет элемент из DOM', isCorrect: true },
        { id: 'angular-3-c', text: 'Применяет стили', isCorrect: false },
        { id: 'angular-3-d', text: 'Обрабатывает события', isCorrect: false },
      ],
      explanation: '*ngIf добавляет или удаляет элемент из DOM в зависимости от условия.',
    },
    {
      id: 'angular-4',
      difficulty: 'medium',
      question: 'Что такое Dependency Injection в Angular?',
      options: [
        { id: 'angular-4-a', text: 'Способ загрузки модулей', isCorrect: false },
        { id: 'angular-4-b', text: 'Паттерн, при котором зависимости предоставляются классу извне', isCorrect: true },
        { id: 'angular-4-c', text: 'Метод компиляции', isCorrect: false },
        { id: 'angular-4-d', text: 'Система событий', isCorrect: false },
      ],
      explanation: 'DI позволяет Angular автоматически предоставлять экземпляры сервисов компонентам.',
    },
    {
      id: 'angular-5',
      difficulty: 'medium',
      question: 'В чём разница между (click) и [disabled]?',
      options: [
        { id: 'angular-5-a', text: 'Нет разницы', isCorrect: false },
        { id: 'angular-5-b', text: '() - event binding, [] - property binding', isCorrect: true },
        { id: 'angular-5-c', text: '() для inputs, [] для outputs', isCorrect: false },
        { id: 'angular-5-d', text: 'Оба для стилей', isCorrect: false },
      ],
      explanation: '(event) привязывает обработчик события, [property] привязывает значение к свойству элемента.',
    },
    {
      id: 'angular-6',
      difficulty: 'medium',
      question: 'Что такое Observable в контексте Angular?',
      options: [
        { id: 'angular-6-a', text: 'Тип данных для хранения', isCorrect: false },
        { id: 'angular-6-b', text: 'Поток данных из RxJS, на который можно подписаться', isCorrect: true },
        { id: 'angular-6-c', text: 'Декоратор для компонентов', isCorrect: false },
        { id: 'angular-6-d', text: 'Модуль для форм', isCorrect: false },
      ],
      explanation: 'Observable - это ленивая коллекция значений, которые приходят асинхронно со временем.',
    },
    {
      id: 'angular-7',
      difficulty: 'medium',
      question: 'Какой lifecycle hook вызывается при изменении @Input свойств?',
      options: [
        { id: 'angular-7-a', text: 'ngOnInit', isCorrect: false },
        { id: 'angular-7-b', text: 'ngOnChanges', isCorrect: true },
        { id: 'angular-7-c', text: 'ngAfterViewInit', isCorrect: false },
        { id: 'angular-7-d', text: 'ngDoCheck', isCorrect: false },
      ],
      explanation: 'ngOnChanges вызывается при каждом изменении входных свойств, помеченных @Input.',
    },
    {
      id: 'angular-8',
      difficulty: 'hard',
      question: 'Что такое ChangeDetectionStrategy.OnPush?',
      options: [
        { id: 'angular-8-a', text: 'Стратегия роутинга', isCorrect: false },
        { id: 'angular-8-b', text: 'Оптимизация: проверка изменений только при изменении @Input ссылок', isCorrect: true },
        { id: 'angular-8-c', text: 'Стратегия кэширования', isCorrect: false },
        { id: 'angular-8-d', text: 'Метод lazy loading', isCorrect: false },
      ],
      explanation: 'OnPush запускает change detection только при изменении ссылки @Input или async pipe.',
    },
    {
      id: 'angular-9',
      difficulty: 'hard',
      question: 'Что делает оператор pipe() в RxJS?',
      code: `observable.pipe(
  map(x => x * 2),
  filter(x => x > 5)
)`,
      options: [
        { id: 'angular-9-a', text: 'Создаёт новый Observable', isCorrect: false },
        { id: 'angular-9-b', text: 'Композиция операторов для трансформации потока данных', isCorrect: true },
        { id: 'angular-9-c', text: 'Подписывается на Observable', isCorrect: false },
        { id: 'angular-9-d', text: 'Отменяет подписку', isCorrect: false },
      ],
      explanation: 'pipe() позволяет составлять цепочку операторов для обработки данных в потоке.',
    },
    {
      id: 'angular-10',
      difficulty: 'hard',
      question: 'Что такое NgModule и зачем он нужен?',
      options: [
        { id: 'angular-10-a', text: 'Класс компонента', isCorrect: false },
        { id: 'angular-10-b', text: 'Контейнер для организации связанных компонентов, директив, сервисов', isCorrect: true },
        { id: 'angular-10-c', text: 'Файл конфигурации', isCorrect: false },
        { id: 'angular-10-d', text: 'Система сборки', isCorrect: false },
      ],
      explanation: 'NgModule группирует связанный код и определяет контекст компиляции для компонентов.',
    },
  ],
};

// ============================================
// TYPESCRIPT TEST
// ============================================
export const typescriptTest: SkillTest = {
  id: 'typescript-test',
  skillName: 'TypeScript',
  category: 'frontend',
  description: 'Тест на знание TypeScript: типы, интерфейсы, дженерики, утилитарные типы',
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
      id: 'ts-1',
      difficulty: 'easy',
      question: 'В чём разница между interface и type?',
      options: [
        { id: 'ts-1-a', text: 'Нет разницы', isCorrect: false },
        { id: 'ts-1-b', text: 'interface можно расширять (extend/merge), type более гибкий', isCorrect: true },
        { id: 'ts-1-c', text: 'type только для примитивов', isCorrect: false },
        { id: 'ts-1-d', text: 'interface быстрее', isCorrect: false },
      ],
      explanation: 'interface поддерживает declaration merging, type может описывать union, tuple и mapped types.',
    },
    {
      id: 'ts-2',
      difficulty: 'easy',
      question: 'Что означает тип any?',
      options: [
        { id: 'ts-2-a', text: 'Пустой тип', isCorrect: false },
        { id: 'ts-2-b', text: 'Отключает проверку типов для переменной', isCorrect: true },
        { id: 'ts-2-c', text: 'Тип массива', isCorrect: false },
        { id: 'ts-2-d', text: 'Nullable тип', isCorrect: false },
      ],
      explanation: 'any позволяет присвоить любое значение и обойти проверку типов. Лучше избегать.',
    },
    {
      id: 'ts-3',
      difficulty: 'easy',
      question: 'Какой результат проверки типа?',
      code: `let x: number = 10;
x = "hello"; // ?`,
      options: [
        { id: 'ts-3-a', text: 'Код выполнится успешно', isCorrect: false },
        { id: 'ts-3-b', text: 'Ошибка компиляции: Type string is not assignable to type number', isCorrect: true },
        { id: 'ts-3-c', text: 'Runtime ошибка', isCorrect: false },
        { id: 'ts-3-d', text: 'x станет "hello"', isCorrect: false },
      ],
      explanation: 'TypeScript проверяет типы во время компиляции и не позволит присвоить string к number.',
    },
    {
      id: 'ts-4',
      difficulty: 'medium',
      question: 'Что такое Union Type?',
      code: `type Status = "pending" | "success" | "error";`,
      options: [
        { id: 'ts-4-a', text: 'Массив строк', isCorrect: false },
        { id: 'ts-4-b', text: 'Тип, который может быть одним из перечисленных типов', isCorrect: true },
        { id: 'ts-4-c', text: 'Enum', isCorrect: false },
        { id: 'ts-4-d', text: 'Объект с тремя полями', isCorrect: false },
      ],
      explanation: 'Union Type (|) означает, что значение может быть любым из указанных типов.',
    },
    {
      id: 'ts-5',
      difficulty: 'medium',
      question: 'Что делает оператор ?. (optional chaining)?',
      code: `const name = user?.profile?.name;`,
      options: [
        { id: 'ts-5-a', text: 'Проверяет типы', isCorrect: false },
        { id: 'ts-5-b', text: 'Безопасно обращается к свойствам, возвращая undefined если путь не существует', isCorrect: true },
        { id: 'ts-5-c', text: 'Создаёт optional свойство', isCorrect: false },
        { id: 'ts-5-d', text: 'Приводит к типу', isCorrect: false },
      ],
      explanation: '?. возвращает undefined вместо ошибки, если промежуточное значение null или undefined.',
    },
    {
      id: 'ts-6',
      difficulty: 'medium',
      question: 'Что такое Generic?',
      code: `function identity<T>(arg: T): T {
  return arg;
}`,
      options: [
        { id: 'ts-6-a', text: 'Глобальная переменная', isCorrect: false },
        { id: 'ts-6-b', text: 'Параметризованный тип, определяемый при использовании', isCorrect: true },
        { id: 'ts-6-c', text: 'Тип по умолчанию', isCorrect: false },
        { id: 'ts-6-d', text: 'Абстрактный класс', isCorrect: false },
      ],
      explanation: 'Generics позволяют создавать переиспользуемые компоненты, работающие с разными типами.',
    },
    {
      id: 'ts-7',
      difficulty: 'medium',
      question: 'Что делает утилитарный тип Partial<T>?',
      options: [
        { id: 'ts-7-a', text: 'Удаляет все свойства', isCorrect: false },
        { id: 'ts-7-b', text: 'Делает все свойства типа T опциональными', isCorrect: true },
        { id: 'ts-7-c', text: 'Делает все свойства обязательными', isCorrect: false },
        { id: 'ts-7-d', text: 'Создаёт частичную копию объекта', isCorrect: false },
      ],
      explanation: 'Partial<T> создаёт тип, где все свойства T становятся optional (?:).',
    },
    {
      id: 'ts-8',
      difficulty: 'hard',
      question: 'Что такое Type Guard?',
      code: `function isString(x: unknown): x is string {
  return typeof x === "string";
}`,
      options: [
        { id: 'ts-8-a', text: 'Защита от null', isCorrect: false },
        { id: 'ts-8-b', text: 'Функция, сужающая тип в условном блоке', isCorrect: true },
        { id: 'ts-8-c', text: 'Валидатор данных', isCorrect: false },
        { id: 'ts-8-d', text: 'Декоратор', isCorrect: false },
      ],
      explanation: 'Type Guard с синтаксисом "x is Type" говорит TypeScript сузить тип после проверки.',
    },
    {
      id: 'ts-9',
      difficulty: 'hard',
      question: 'Что делает keyof?',
      code: `type Keys = keyof { name: string; age: number };`,
      options: [
        { id: 'ts-9-a', text: 'Создаёт массив ключей', isCorrect: false },
        { id: 'ts-9-b', text: 'Создаёт union type из ключей объекта: "name" | "age"', isCorrect: true },
        { id: 'ts-9-c', text: 'Проверяет наличие ключа', isCorrect: false },
        { id: 'ts-9-d', text: 'Удаляет ключ', isCorrect: false },
      ],
      explanation: 'keyof извлекает union всех ключей типа объекта как строковые литералы.',
    },
    {
      id: 'ts-10',
      difficulty: 'hard',
      question: 'Какой тип у переменной result?',
      code: `const arr = [1, "hello", true] as const;
type Result = typeof arr[number];`,
      options: [
        { id: 'ts-10-a', text: 'number | string | boolean', isCorrect: false },
        { id: 'ts-10-b', text: '1 | "hello" | true', isCorrect: true },
        { id: 'ts-10-c', text: 'readonly [1, "hello", true]', isCorrect: false },
        { id: 'ts-10-d', text: 'any[]', isCorrect: false },
      ],
      explanation: 'as const делает массив readonly tuple с literal types. [number] извлекает union элементов.',
    },
  ],
};

// ============================================
// EXPORT ALL FRONTEND TESTS
// ============================================
export const frontendTests: SkillTest[] = [
  reactTest,
  vueTest,
  angularTest,
  typescriptTest,
];

// Получить тест по названию навыка
export const getFrontendTestBySkill = (skillName: string): SkillTest | undefined => {
  return frontendTests.find(
    test => test.skillName.toLowerCase() === skillName.toLowerCase()
  );
};
