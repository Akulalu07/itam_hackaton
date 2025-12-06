import { PlaceholderPage } from '../../components/common/PlaceholderPage';
import { HackathonManager, UserTable, AnalyticsDashboard } from '../../features/admin';

export function AdminDashboardPage() {
  return <AnalyticsDashboard />;
}

export function AdminHackathonsPage() {
  return <HackathonManager />;
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
  return <UserTable />;
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
  return <AnalyticsDashboard />;
}
