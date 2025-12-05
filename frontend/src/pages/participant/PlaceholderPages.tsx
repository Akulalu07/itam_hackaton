import { PlaceholderPage } from '../../components/common/PlaceholderPage';
import { SwipeDeck } from '../../features/swipe';
import { InvitesList } from '../../features/invites';

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
  return (
    <PlaceholderPage 
      title="Мой профиль"
      description="Ваши навыки, опыт и достижения"
      icon="👤"
    />
  );
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
  return (
    <PlaceholderPage 
      title="Моя команда"
      description="Состав вашей команды"
      icon="👥"
    />
  );
}

export function TeamManagePage() {
  return (
    <PlaceholderPage 
      title="Управление командой"
      description="Настройки команды для капитана"
      icon="⚙️"
    />
  );
}

export function InvitesPage() {
  return <InvitesList />;
}
