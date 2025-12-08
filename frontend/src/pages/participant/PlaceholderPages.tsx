import { PlaceholderPage } from '../../components/common/PlaceholderPage';
import { SwipeDeck } from '../../features/swipe';
import { InvitesList } from '../../features/invites';
import { TeamHub, CreateTeam } from '../../features/team';
import { UserProfile } from '../../features/profile';
import { ProfilePage as ProfileEditPageComponent } from './ProfilePage';

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
  return <ProfileEditPageComponent />;
}

export function CreateTeamPage() {
  return <CreateTeam />;
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
