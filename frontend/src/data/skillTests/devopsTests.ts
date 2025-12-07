import { SkillTest } from '../../types';

/**
 * Банк тестов для DevOps технологий
 * Docker, Kubernetes, CI/CD, Linux
 */

// ============================================
// DOCKER TEST
// ============================================
export const dockerTest: SkillTest = {
  id: 'docker-test',
  skillName: 'Docker',
  category: 'devops',
  description: 'Тест на знание Docker: контейнеры, образы, Dockerfile, docker-compose',
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
      id: 'docker-1',
      difficulty: 'easy',
      question: 'Что такое Docker контейнер?',
      options: [
        { id: 'docker-1-a', text: 'Виртуальная машина', isCorrect: false },
        { id: 'docker-1-b', text: 'Изолированный процесс с собственной файловой системой', isCorrect: true },
        { id: 'docker-1-c', text: 'Физический сервер', isCorrect: false },
        { id: 'docker-1-d', text: 'Операционная система', isCorrect: false },
      ],
      explanation: 'Контейнер - это изолированный процесс, использующий namespaces и cgroups Linux для изоляции.',
    },
    {
      id: 'docker-2',
      difficulty: 'easy',
      question: 'Какая команда запускает контейнер?',
      options: [
        { id: 'docker-2-a', text: 'docker start', isCorrect: false },
        { id: 'docker-2-b', text: 'docker run', isCorrect: true },
        { id: 'docker-2-c', text: 'docker exec', isCorrect: false },
        { id: 'docker-2-d', text: 'docker create', isCorrect: false },
      ],
      explanation: 'docker run создаёт и запускает контейнер. docker start запускает существующий остановленный контейнер.',
    },
    {
      id: 'docker-3',
      difficulty: 'easy',
      question: 'Что делает инструкция FROM в Dockerfile?',
      code: `FROM node:20-alpine`,
      options: [
        { id: 'docker-3-a', text: 'Копирует файлы', isCorrect: false },
        { id: 'docker-3-b', text: 'Указывает базовый образ для сборки', isCorrect: true },
        { id: 'docker-3-c', text: 'Устанавливает переменную окружения', isCorrect: false },
        { id: 'docker-3-d', text: 'Запускает команду', isCorrect: false },
      ],
      explanation: 'FROM определяет родительский образ, на основе которого строится новый образ.',
    },
    {
      id: 'docker-4',
      difficulty: 'medium',
      question: 'В чём разница между COPY и ADD в Dockerfile?',
      options: [
        { id: 'docker-4-a', text: 'Нет разницы', isCorrect: false },
        { id: 'docker-4-b', text: 'ADD умеет распаковывать архивы и скачивать URL, COPY только копирует', isCorrect: true },
        { id: 'docker-4-c', text: 'COPY быстрее', isCorrect: false },
        { id: 'docker-4-d', text: 'ADD устарел', isCorrect: false },
      ],
      explanation: 'ADD имеет дополнительные возможности (URL, tar), но COPY предпочтительнее для простого копирования.',
    },
    {
      id: 'docker-5',
      difficulty: 'medium',
      question: 'Что делает флаг -v в docker run?',
      code: `docker run -v /host/path:/container/path myimage`,
      options: [
        { id: 'docker-5-a', text: 'Verbose режим', isCorrect: false },
        { id: 'docker-5-b', text: 'Монтирует том (volume) из хоста в контейнер', isCorrect: true },
        { id: 'docker-5-c', text: 'Указывает версию', isCorrect: false },
        { id: 'docker-5-d', text: 'Виртуальная сеть', isCorrect: false },
      ],
      explanation: '-v (--volume) монтирует директорию хоста в контейнер для персистентного хранения данных.',
    },
    {
      id: 'docker-6',
      difficulty: 'medium',
      question: 'Что такое multi-stage build?',
      code: `FROM node:20 AS builder
WORKDIR /app
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html`,
      options: [
        { id: 'docker-6-a', text: 'Сборка нескольких образов одновременно', isCorrect: false },
        { id: 'docker-6-b', text: 'Использование нескольких FROM для уменьшения размера итогового образа', isCorrect: true },
        { id: 'docker-6-c', text: 'Параллельная сборка', isCorrect: false },
        { id: 'docker-6-d', text: 'Кэширование слоёв', isCorrect: false },
      ],
      explanation: 'Multi-stage позволяет использовать артефакты из одного этапа в другом, оставляя только нужное.',
    },
    {
      id: 'docker-7',
      difficulty: 'medium',
      question: 'В чём разница между CMD и ENTRYPOINT?',
      options: [
        { id: 'docker-7-a', text: 'Нет разницы', isCorrect: false },
        { id: 'docker-7-b', text: 'ENTRYPOINT - основная команда, CMD - аргументы по умолчанию', isCorrect: true },
        { id: 'docker-7-c', text: 'CMD выполняется первым', isCorrect: false },
        { id: 'docker-7-d', text: 'ENTRYPOINT устарел', isCorrect: false },
      ],
      explanation: 'ENTRYPOINT задаёт исполняемый файл, CMD предоставляет аргументы по умолчанию, которые можно переопределить.',
    },
    {
      id: 'docker-8',
      difficulty: 'hard',
      question: 'Что такое Docker layer и как работает кэширование?',
      options: [
        { id: 'docker-8-a', text: 'Слой - это отдельный контейнер', isCorrect: false },
        { id: 'docker-8-b', text: 'Каждая инструкция создаёт слой; неизменённые слои кэшируются', isCorrect: true },
        { id: 'docker-8-c', text: 'Слои используются только для сети', isCorrect: false },
        { id: 'docker-8-d', text: 'Кэширование отключено по умолчанию', isCorrect: false },
      ],
      explanation: 'Каждая инструкция Dockerfile создаёт read-only слой. При пересборке переиспользуются неизменённые слои.',
    },
    {
      id: 'docker-9',
      difficulty: 'hard',
      question: 'Какой результат выполнения docker-compose команды?',
      code: `docker-compose up -d --scale web=3`,
      options: [
        { id: 'docker-9-a', text: 'Запустит 3 разных сервиса', isCorrect: false },
        { id: 'docker-9-b', text: 'Запустит 3 реплики сервиса web в фоне', isCorrect: true },
        { id: 'docker-9-c', text: 'Ошибка синтаксиса', isCorrect: false },
        { id: 'docker-9-d', text: 'Обновит образ web 3 раза', isCorrect: false },
      ],
      explanation: '--scale позволяет запустить несколько экземпляров сервиса. -d запускает в detached режиме.',
    },
    {
      id: 'docker-10',
      difficulty: 'hard',
      question: 'Как правильно передать секреты в Docker контейнер?',
      options: [
        { id: 'docker-10-a', text: 'Захардкодить в Dockerfile', isCorrect: false },
        { id: 'docker-10-b', text: 'Использовать Docker Secrets или монтировать через volumes в runtime', isCorrect: true },
        { id: 'docker-10-c', text: 'Передать через ARG', isCorrect: false },
        { id: 'docker-10-d', text: 'Записать в LABEL', isCorrect: false },
      ],
      explanation: 'Секреты нельзя хранить в образе. Используйте Docker Secrets, env-файлы или volumes в runtime.',
    },
  ],
};

// ============================================
// KUBERNETES TEST
// ============================================
export const kubernetesTest: SkillTest = {
  id: 'kubernetes-test',
  skillName: 'Kubernetes',
  category: 'devops',
  description: 'Тест на знание Kubernetes: pods, deployments, services, configmaps',
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
      id: 'k8s-1',
      difficulty: 'easy',
      question: 'Что такое Pod в Kubernetes?',
      options: [
        { id: 'k8s-1-a', text: 'Виртуальная машина', isCorrect: false },
        { id: 'k8s-1-b', text: 'Минимальная единица развёртывания, содержащая один или несколько контейнеров', isCorrect: true },
        { id: 'k8s-1-c', text: 'Физический сервер', isCorrect: false },
        { id: 'k8s-1-d', text: 'Docker образ', isCorrect: false },
      ],
      explanation: 'Pod - это группа контейнеров с общими ресурсами (сеть, storage), запускаемых вместе.',
    },
    {
      id: 'k8s-2',
      difficulty: 'easy',
      question: 'Какая команда показывает список pods?',
      options: [
        { id: 'k8s-2-a', text: 'kubectl list pods', isCorrect: false },
        { id: 'k8s-2-b', text: 'kubectl get pods', isCorrect: true },
        { id: 'k8s-2-c', text: 'kubectl show pods', isCorrect: false },
        { id: 'k8s-2-d', text: 'kubectl pods list', isCorrect: false },
      ],
      explanation: 'kubectl get - основная команда для получения списка ресурсов в Kubernetes.',
    },
    {
      id: 'k8s-3',
      difficulty: 'easy',
      question: 'Что такое Deployment?',
      options: [
        { id: 'k8s-3-a', text: 'Процесс установки Kubernetes', isCorrect: false },
        { id: 'k8s-3-b', text: 'Контроллер для управления ReplicaSet и обновлениями Pods', isCorrect: true },
        { id: 'k8s-3-c', text: 'Сетевой сервис', isCorrect: false },
        { id: 'k8s-3-d', text: 'Хранилище данных', isCorrect: false },
      ],
      explanation: 'Deployment управляет ReplicaSet, обеспечивая декларативные обновления и rollback.',
    },
    {
      id: 'k8s-4',
      difficulty: 'medium',
      question: 'Для чего нужен Service в Kubernetes?',
      options: [
        { id: 'k8s-4-a', text: 'Для хранения конфигурации', isCorrect: false },
        { id: 'k8s-4-b', text: 'Для предоставления стабильного сетевого endpoint для группы Pods', isCorrect: true },
        { id: 'k8s-4-c', text: 'Для мониторинга', isCorrect: false },
        { id: 'k8s-4-d', text: 'Для создания контейнеров', isCorrect: false },
      ],
      explanation: 'Service абстрагирует группу Pods за стабильным IP и DNS именем, балансируя трафик.',
    },
    {
      id: 'k8s-5',
      difficulty: 'medium',
      question: 'В чём разница между ConfigMap и Secret?',
      options: [
        { id: 'k8s-5-a', text: 'Нет разницы', isCorrect: false },
        { id: 'k8s-5-b', text: 'Secret хранит данные в base64 и предназначен для чувствительных данных', isCorrect: true },
        { id: 'k8s-5-c', text: 'ConfigMap быстрее', isCorrect: false },
        { id: 'k8s-5-d', text: 'Secret только для паролей', isCorrect: false },
      ],
      explanation: 'Secret base64-кодирует данные и может быть зашифрован at rest. ConfigMap для обычной конфигурации.',
    },
    {
      id: 'k8s-6',
      difficulty: 'medium',
      question: 'Что такое Namespace в Kubernetes?',
      options: [
        { id: 'k8s-6-a', text: 'Папка для файлов', isCorrect: false },
        { id: 'k8s-6-b', text: 'Виртуальный кластер внутри кластера для изоляции ресурсов', isCorrect: true },
        { id: 'k8s-6-c', text: 'Тип сервиса', isCorrect: false },
        { id: 'k8s-6-d', text: 'Имя контейнера', isCorrect: false },
      ],
      explanation: 'Namespace позволяет разделить ресурсы кластера между командами/проектами.',
    },
    {
      id: 'k8s-7',
      difficulty: 'medium',
      question: 'Какой тип Service открывает порт на всех нодах кластера?',
      options: [
        { id: 'k8s-7-a', text: 'ClusterIP', isCorrect: false },
        { id: 'k8s-7-b', text: 'NodePort', isCorrect: true },
        { id: 'k8s-7-c', text: 'LoadBalancer', isCorrect: false },
        { id: 'k8s-7-d', text: 'ExternalName', isCorrect: false },
      ],
      explanation: 'NodePort открывает статический порт (30000-32767) на каждой ноде кластера.',
    },
    {
      id: 'k8s-8',
      difficulty: 'hard',
      question: 'Что такое Liveness и Readiness Probes?',
      options: [
        { id: 'k8s-8-a', text: 'Метрики производительности', isCorrect: false },
        { id: 'k8s-8-b', text: 'Проверки здоровья: Liveness - перезапускает pod, Readiness - убирает из Service', isCorrect: true },
        { id: 'k8s-8-c', text: 'Типы логирования', isCorrect: false },
        { id: 'k8s-8-d', text: 'Сетевые политики', isCorrect: false },
      ],
      explanation: 'Liveness определяет нужно ли перезапустить контейнер. Readiness - готов ли pod принимать трафик.',
    },
    {
      id: 'k8s-9',
      difficulty: 'hard',
      question: 'Что делает HorizontalPodAutoscaler?',
      options: [
        { id: 'k8s-9-a', text: 'Увеличивает размер контейнера', isCorrect: false },
        { id: 'k8s-9-b', text: 'Автоматически масштабирует количество pod реплик по метрикам', isCorrect: true },
        { id: 'k8s-9-c', text: 'Распределяет pods по нодам', isCorrect: false },
        { id: 'k8s-9-d', text: 'Балансирует сетевой трафик', isCorrect: false },
      ],
      explanation: 'HPA автоматически изменяет количество реплик в Deployment на основе CPU, памяти или custom метрик.',
    },
    {
      id: 'k8s-10',
      difficulty: 'hard',
      question: 'Что такое Ingress?',
      options: [
        { id: 'k8s-10-a', text: 'Тип Pod', isCorrect: false },
        { id: 'k8s-10-b', text: 'API объект для управления внешним HTTP/HTTPS доступом к сервисам', isCorrect: true },
        { id: 'k8s-10-c', text: 'Внутренняя сеть кластера', isCorrect: false },
        { id: 'k8s-10-d', text: 'Система мониторинга', isCorrect: false },
      ],
      explanation: 'Ingress обеспечивает маршрутизацию HTTP трафика к сервисам по правилам (host, path).',
    },
  ],
};

// ============================================
// CI/CD TEST
// ============================================
export const cicdTest: SkillTest = {
  id: 'cicd-test',
  skillName: 'CI/CD',
  category: 'devops',
  description: 'Тест на знание CI/CD: GitHub Actions, GitLab CI, Jenkins, практики',
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
      id: 'cicd-1',
      difficulty: 'easy',
      question: 'Что означает CI в CI/CD?',
      options: [
        { id: 'cicd-1-a', text: 'Container Integration', isCorrect: false },
        { id: 'cicd-1-b', text: 'Continuous Integration - непрерывная интеграция', isCorrect: true },
        { id: 'cicd-1-c', text: 'Code Inspection', isCorrect: false },
        { id: 'cicd-1-d', text: 'Cloud Infrastructure', isCorrect: false },
      ],
      explanation: 'CI - практика частой интеграции кода в общую ветку с автоматическим тестированием.',
    },
    {
      id: 'cicd-2',
      difficulty: 'easy',
      question: 'Какой файл настраивает GitHub Actions?',
      options: [
        { id: 'cicd-2-a', text: 'Jenkinsfile', isCorrect: false },
        { id: 'cicd-2-b', text: '.github/workflows/*.yml', isCorrect: true },
        { id: 'cicd-2-c', text: '.gitlab-ci.yml', isCorrect: false },
        { id: 'cicd-2-d', text: 'pipeline.config', isCorrect: false },
      ],
      explanation: 'GitHub Actions workflows определяются в YAML файлах в директории .github/workflows/',
    },
    {
      id: 'cicd-3',
      difficulty: 'easy',
      question: 'Что такое pipeline?',
      options: [
        { id: 'cicd-3-a', text: 'Тип базы данных', isCorrect: false },
        { id: 'cicd-3-b', text: 'Последовательность автоматизированных шагов для сборки/тестирования/деплоя', isCorrect: true },
        { id: 'cicd-3-c', text: 'Сетевой протокол', isCorrect: false },
        { id: 'cicd-3-d', text: 'Система логирования', isCorrect: false },
      ],
      explanation: 'Pipeline - это набор stages/jobs, выполняющихся автоматически при определённых событиях.',
    },
    {
      id: 'cicd-4',
      difficulty: 'medium',
      question: 'Что делает этот GitHub Actions workflow?',
      code: `on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test`,
      options: [
        { id: 'cicd-4-a', text: 'Деплоит в production', isCorrect: false },
        { id: 'cicd-4-b', text: 'Запускает npm test при push в main', isCorrect: true },
        { id: 'cicd-4-c', text: 'Создаёт Docker образ', isCorrect: false },
        { id: 'cicd-4-d', text: 'Отправляет уведомления', isCorrect: false },
      ],
      explanation: 'Workflow запускается при push в main, чекаутит код и выполняет npm test.',
    },
    {
      id: 'cicd-5',
      difficulty: 'medium',
      question: 'В чём разница между CD как Continuous Delivery и Continuous Deployment?',
      options: [
        { id: 'cicd-5-a', text: 'Нет разницы', isCorrect: false },
        { id: 'cicd-5-b', text: 'Delivery требует ручного approve для prod, Deployment полностью автоматический', isCorrect: true },
        { id: 'cicd-5-c', text: 'Deployment медленнее', isCorrect: false },
        { id: 'cicd-5-d', text: 'Delivery только для Docker', isCorrect: false },
      ],
      explanation: 'Continuous Delivery - готовность к деплою в любой момент. Continuous Deployment - автодеплой каждого коммита.',
    },
    {
      id: 'cicd-6',
      difficulty: 'medium',
      question: 'Что такое artifact в контексте CI/CD?',
      options: [
        { id: 'cicd-6-a', text: 'Исходный код', isCorrect: false },
        { id: 'cicd-6-b', text: 'Результат сборки (бинарник, Docker образ, отчёты), сохраняемый между jobs', isCorrect: true },
        { id: 'cicd-6-c', text: 'Секретный ключ', isCorrect: false },
        { id: 'cicd-6-d', text: 'Конфигурационный файл', isCorrect: false },
      ],
      explanation: 'Artifacts - это файлы, созданные во время выполнения job, которые можно передать другим jobs или скачать.',
    },
    {
      id: 'cicd-7',
      difficulty: 'medium',
      question: 'Что такое GitLab Runner?',
      options: [
        { id: 'cicd-7-a', text: 'Плагин для VS Code', isCorrect: false },
        { id: 'cicd-7-b', text: 'Агент, выполняющий jobs из GitLab CI/CD pipeline', isCorrect: true },
        { id: 'cicd-7-c', text: 'Git команда', isCorrect: false },
        { id: 'cicd-7-d', text: 'Тип merge request', isCorrect: false },
      ],
      explanation: 'Runner - это приложение, которое получает и выполняет jobs из GitLab CI/CD.',
    },
    {
      id: 'cicd-8',
      difficulty: 'hard',
      question: 'Что такое Blue-Green Deployment?',
      options: [
        { id: 'cicd-8-a', text: 'Цветовая схема логов', isCorrect: false },
        { id: 'cicd-8-b', text: 'Стратегия с двумя идентичными средами для zero-downtime деплоя', isCorrect: true },
        { id: 'cicd-8-c', text: 'Тип тестирования', isCorrect: false },
        { id: 'cicd-8-d', text: 'Метод версионирования', isCorrect: false },
      ],
      explanation: 'Blue-Green: две среды, одна активная (blue), деплой в неактивную (green), переключение трафика.',
    },
    {
      id: 'cicd-9',
      difficulty: 'hard',
      question: 'Что такое Canary Deployment?',
      options: [
        { id: 'cicd-9-a', text: 'Деплой только для тестировщиков', isCorrect: false },
        { id: 'cicd-9-b', text: 'Постепенный rollout новой версии на часть пользователей', isCorrect: true },
        { id: 'cicd-9-c', text: 'Автоматический rollback', isCorrect: false },
        { id: 'cicd-9-d', text: 'Деплой в staging', isCorrect: false },
      ],
      explanation: 'Canary - постепенное увеличение трафика на новую версию (1% → 10% → 50% → 100%).',
    },
    {
      id: 'cicd-10',
      difficulty: 'hard',
      question: 'Как безопасно хранить секреты в CI/CD?',
      options: [
        { id: 'cicd-10-a', text: 'В коде репозитория', isCorrect: false },
        { id: 'cicd-10-b', text: 'В encrypted secrets платформы CI/CD или внешнем vault', isCorrect: true },
        { id: 'cicd-10-c', text: 'В комментариях к коммиту', isCorrect: false },
        { id: 'cicd-10-d', text: 'В названии branch', isCorrect: false },
      ],
      explanation: 'Используйте GitHub Secrets, GitLab CI Variables, HashiCorp Vault или аналогичные решения.',
    },
  ],
};

// ============================================
// LINUX TEST
// ============================================
export const linuxTest: SkillTest = {
  id: 'linux-test',
  skillName: 'Linux',
  category: 'devops',
  description: 'Тест на знание Linux: команды, файловая система, процессы, сети',
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
      id: 'linux-1',
      difficulty: 'easy',
      question: 'Какая команда показывает текущую директорию?',
      options: [
        { id: 'linux-1-a', text: 'cd', isCorrect: false },
        { id: 'linux-1-b', text: 'pwd', isCorrect: true },
        { id: 'linux-1-c', text: 'ls', isCorrect: false },
        { id: 'linux-1-d', text: 'dir', isCorrect: false },
      ],
      explanation: 'pwd (print working directory) выводит полный путь текущей директории.',
    },
    {
      id: 'linux-2',
      difficulty: 'easy',
      question: 'Что делает команда chmod 755 file.sh?',
      options: [
        { id: 'linux-2-a', text: 'Удаляет файл', isCorrect: false },
        { id: 'linux-2-b', text: 'Устанавливает права: rwx для владельца, rx для группы и остальных', isCorrect: true },
        { id: 'linux-2-c', text: 'Меняет владельца', isCorrect: false },
        { id: 'linux-2-d', text: 'Сжимает файл', isCorrect: false },
      ],
      explanation: '7=rwx, 5=r-x. Владелец может всё, остальные могут читать и выполнять.',
    },
    {
      id: 'linux-3',
      difficulty: 'easy',
      question: 'Какая команда ищет текст в файлах?',
      options: [
        { id: 'linux-3-a', text: 'find', isCorrect: false },
        { id: 'linux-3-b', text: 'grep', isCorrect: true },
        { id: 'linux-3-c', text: 'locate', isCorrect: false },
        { id: 'linux-3-d', text: 'search', isCorrect: false },
      ],
      explanation: 'grep ищет строки, соответствующие паттерну в файлах или потоке.',
    },
    {
      id: 'linux-4',
      difficulty: 'medium',
      question: 'Что делает команда?',
      code: `ps aux | grep nginx | awk '{print $2}'`,
      options: [
        { id: 'linux-4-a', text: 'Убивает nginx', isCorrect: false },
        { id: 'linux-4-b', text: 'Выводит PID процессов nginx', isCorrect: true },
        { id: 'linux-4-c', text: 'Запускает nginx', isCorrect: false },
        { id: 'linux-4-d', text: 'Показывает конфиг nginx', isCorrect: false },
      ],
      explanation: 'ps aux показывает процессы, grep фильтрует nginx, awk выводит второй столбец (PID).',
    },
    {
      id: 'linux-5',
      difficulty: 'medium',
      question: 'Что такое символическая ссылка (symlink)?',
      options: [
        { id: 'linux-5-a', text: 'Копия файла', isCorrect: false },
        { id: 'linux-5-b', text: 'Файл-указатель на другой файл или директорию', isCorrect: true },
        { id: 'linux-5-c', text: 'Сжатый архив', isCorrect: false },
        { id: 'linux-5-d', text: 'Скрытый файл', isCorrect: false },
      ],
      explanation: 'Symlink (ln -s) содержит путь к целевому файлу, при доступе перенаправляет к нему.',
    },
    {
      id: 'linux-6',
      difficulty: 'medium',
      question: 'Что делает оператор > и >> в bash?',
      options: [
        { id: 'linux-6-a', text: 'Сравнивают числа', isCorrect: false },
        { id: 'linux-6-b', text: '> перезаписывает файл, >> добавляет в конец', isCorrect: true },
        { id: 'linux-6-c', text: 'Оба добавляют в конец', isCorrect: false },
        { id: 'linux-6-d', text: 'Создают директорию', isCorrect: false },
      ],
      explanation: '> (redirect) перезаписывает файл, >> (append) добавляет в конец существующего.',
    },
    {
      id: 'linux-7',
      difficulty: 'medium',
      question: 'Какая команда показывает использование дискового пространства?',
      options: [
        { id: 'linux-7-a', text: 'free', isCorrect: false },
        { id: 'linux-7-b', text: 'df -h', isCorrect: true },
        { id: 'linux-7-c', text: 'top', isCorrect: false },
        { id: 'linux-7-d', text: 'ps', isCorrect: false },
      ],
      explanation: 'df (disk free) показывает использование файловых систем. -h для human-readable формата.',
    },
    {
      id: 'linux-8',
      difficulty: 'hard',
      question: 'Что делает команда?',
      code: `nohup ./script.sh > output.log 2>&1 &`,
      options: [
        { id: 'linux-8-a', text: 'Запускает скрипт в фоне с перенаправлением stdout и stderr в файл', isCorrect: true },
        { id: 'linux-8-b', text: 'Запускает скрипт с высоким приоритетом', isCorrect: false },
        { id: 'linux-8-c', text: 'Создаёт новый терминал', isCorrect: false },
        { id: 'linux-8-d', text: 'Отправляет скрипт на удалённый сервер', isCorrect: false },
      ],
      explanation: 'nohup игнорирует SIGHUP, 2>&1 направляет stderr в stdout, & запускает в фоне.',
    },
    {
      id: 'linux-9',
      difficulty: 'hard',
      question: 'Что такое inode в Linux?',
      options: [
        { id: 'linux-9-a', text: 'Сетевой интерфейс', isCorrect: false },
        { id: 'linux-9-b', text: 'Структура данных с метаинформацией о файле (права, размер, блоки)', isCorrect: true },
        { id: 'linux-9-c', text: 'Тип процесса', isCorrect: false },
        { id: 'linux-9-d', text: 'Виртуальная память', isCorrect: false },
      ],
      explanation: 'Inode хранит метаданные файла (кроме имени и содержимого): права, владельца, timestamps, указатели на блоки.',
    },
    {
      id: 'linux-10',
      difficulty: 'hard',
      question: 'Как работает команда ssh-keygen и для чего?',
      options: [
        { id: 'linux-10-a', text: 'Шифрует файлы', isCorrect: false },
        { id: 'linux-10-b', text: 'Генерирует пару SSH ключей для безпарольной аутентификации', isCorrect: true },
        { id: 'linux-10-c', text: 'Создаёт SSL сертификат', isCorrect: false },
        { id: 'linux-10-d', text: 'Хеширует пароли', isCorrect: false },
      ],
      explanation: 'ssh-keygen создаёт пару ключей (private/public) для SSH аутентификации без пароля.',
    },
  ],
};

// ============================================
// EXPORT ALL DEVOPS TESTS
// ============================================
export const devopsTests: SkillTest[] = [
  dockerTest,
  kubernetesTest,
  cicdTest,
  linuxTest,
];

export const getDevopsTestBySkill = (skillName: string): SkillTest | undefined => {
  return devopsTests.find(
    test => test.skillName.toLowerCase() === skillName.toLowerCase()
  );
};
