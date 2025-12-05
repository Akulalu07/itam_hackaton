import { PlaceholderPage } from '../../components/common/PlaceholderPage';

export function AdminDashboardPage() {
  return (
    <PlaceholderPage 
      title="Админ дашборд"
      description="Общая статистика и управление"
      icon="📊"
    />
  );
}

export function AdminHackathonsPage() {
  return (
    <PlaceholderPage 
      title="Управление хакатонами"
      description="Создание и редактирование хакатонов"
      icon="📅"
    />
  );
}

export function AdminHackathonCreatePage() {
  return (
    <PlaceholderPage 
      title="Создание хакатона"
      description="Новый хакатон"
      icon="➕"
    />
  );
}

export function AdminHackathonEditPage() {
  return (
    <PlaceholderPage 
      title="Редактирование хакатона"
      description="Изменение параметров хакатона"
      icon="✏️"
    />
  );
}

export function AdminParticipantsPage() {
  return (
    <PlaceholderPage 
      title="Участники"
      description="Список всех зарегистрированных участников"
      icon="👥"
    />
  );
}

export function AdminTeamsPage() {
  return (
    <PlaceholderPage 
      title="Команды"
      description="Все сформированные команды"
      icon="🏆"
    />
  );
}

export function AdminAnalyticsPage() {
  return (
    <PlaceholderPage 
      title="Аналитика"
      description="Графики и статистика"
      icon="📈"
    />
  );
}
