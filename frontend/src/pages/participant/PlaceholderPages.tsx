import { PlaceholderPage } from '../../components/common/PlaceholderPage';
import { SwipeDeck } from '../../features/swipe';
import { InvitesList } from '../../features/invites';
import { TeamHub } from '../../features/team';
import { UserProfile } from '../../features/profile';

export function SelectHackathonPage() {
  return (
    <PlaceholderPage 
      title="Выбор хакатона"
      description="Выберите хакатон, в котором хотите участвовать"
      icon="🎯"
    />
  );
}

export function ProfilePage() {
  return <UserProfile />;
}

export function ProfileEditPage() {
  return (
    <PlaceholderPage 
      title="Редактирование профиля"
      description="Обновите информацию о себе"
      icon="✏️"
    />
  );
}

export function CreateTeamPage() {
  return (
    <PlaceholderPage 
      title="Создание команды"
      description="Придумайте название и начните набор"
      icon="🚀"
    />
  );
}

export function SwipePage() {
  return <SwipeDeck />;
}

export function TeamPage() {
  return <TeamHub />;
}

export function TeamManagePage() {
  return <TeamHub />;
}

export function InvitesPage() {
  return <InvitesList />;
}
