# API Layer Documentation

## Обзор

API слой обеспечивает связь между React фронтендом и Go бэкендом. 

## Структура

```
src/api/
├── index.ts          # Центральный экспорт
├── axiosClient.ts    # Настроенный axios с interceptors
├── authService.ts    # Авторизация + Telegram WebApp helpers
└── services.ts       # API сервисы (user, team, swipe, etc.)
```

## Конфигурация

### Переменные окружения

```env
# .env
VITE_API_URL=http://localhost:8080/api
```

### axiosClient

- **baseURL**: из `VITE_API_URL`
- **Token injection**: автоматически добавляет `Authorization: Bearer <token>`
- **Error handling**: 401 → редирект на `/login`

## Сервисы

### authService

```typescript
import { authService, isTelegramWebApp, getTelegramInitData } from '../api';

// Проверка Telegram WebApp
if (isTelegramWebApp()) {
  const initData = getTelegramInitData();
  const { token, user } = await authService.loginWithTelegram(initData);
}

// Админ логин
const { token, user } = await authService.loginAdmin(email, password);

// Выход
await authService.logout();
```

### userService

```typescript
import { userService } from '../api';

// Получить профиль
const user = await userService.getProfile();

// Обновить профиль
const updated = await userService.updateProfile({ name: 'New Name', skills: [...] });

// Загрузить аватар
const { url } = await userService.uploadAvatar(file);
```

### swipeService

```typescript
import { swipeService } from '../api';

// Получить колоду для свайпа
const deck = await swipeService.getDeck(hackathonId);

// Свайпнуть
const { match, invite } = await swipeService.swipe(userId, 'like');
```

### teamService

```typescript
import { teamService } from '../api';

// Создать команду
const team = await teamService.create({ name: 'Dream Team', hackathonId: '...' });

// Моя команда
const myTeam = await teamService.getMyTeam();

// Invite ссылка
const { link, code } = await teamService.generateInviteLink(teamId);

// Присоединиться по коду
const team = await teamService.joinByCode('ABC123');
```

### inviteService

```typescript
import { inviteService } from '../api';

// Входящие приглашения
const incoming = await inviteService.getIncoming();

// Принять
const team = await inviteService.accept(inviteId);

// Отклонить
await inviteService.decline(inviteId);
```

## Zustand API Hooks

Для удобной интеграции с состоянием используйте хуки из `store/apiHooks.ts`:

```typescript
import { useInitTelegramAuth, useSwipeAPI, useTeamAPI, useInviteAPI } from '../store';

// Автологин Telegram
const { initAuth } = useInitTelegramAuth();
useEffect(() => { initAuth(); }, []);

// Свайпы с автообновлением store
const { deck, fetchDeck, sendSwipe } = useSwipeAPI();
await fetchDeck(hackathonId);
const { match } = await sendSwipe(userId, 'like');

// Команды
const { createTeam, kickMember, generateInviteLink } = useTeamAPI();
const team = await createTeam('Team Name', hackathonId);

// Приглашения
const { invites, acceptInvite, declineInvite } = useInviteAPI();
await acceptInvite(inviteId);
```

## Telegram WebApp Helpers

```typescript
import { 
  isTelegramWebApp,
  getTelegramInitData,
  getTelegramUser,
  initTelegramWebApp,
  showTelegramMainButton,
  hideTelegramMainButton,
  telegramHapticFeedback 
} from '../api';

// Инициализация
initTelegramWebApp();

// Хаптик
telegramHapticFeedback('success');  // notification
telegramHapticFeedback('error');    // notification
telegramHapticFeedback('light');    // impact
telegramHapticFeedback('medium');   // impact

// Main Button
showTelegramMainButton('Продолжить', () => { ... });
hideTelegramMainButton();
```

## Endpoints Backend (Go)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/telegram` | Авторизация через Telegram |
| POST | `/auth/admin` | Админ логин |
| POST | `/auth/logout` | Выход |
| GET | `/user/me` | Текущий профиль |
| PUT | `/user/me` | Обновить профиль |
| GET | `/hackathons` | Все хакатоны |
| GET | `/hackathons/active` | Активные хакатоны |
| GET | `/recommendations` | Колода для свайпа |
| POST | `/swipe` | Свайп |
| GET | `/teams` | Все команды |
| GET | `/teams/my` | Моя команда |
| POST | `/teams` | Создать команду |
| POST | `/teams/:id/leave` | Покинуть команду |
| POST | `/teams/:id/kick` | Исключить участника |
| POST | `/teams/:id/invite-link` | Сгенерировать invite |
| POST | `/teams/join` | Присоединиться по коду |
| GET | `/invites/incoming` | Входящие приглашения |
| POST | `/invites/:id/accept` | Принять |
| POST | `/invites/:id/decline` | Отклонить |
