// src/pages/dashboard/rooms/index.tsx
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/page';
import { RoomsComponent } from '@/components/rooms';
import { paths } from '@/routes/paths';

export default function RoomsPage() {
  const navigate = useNavigate();

  const handleRoomSelect = (roomId: number) => {
    navigate(`${paths.dashboard.home}?roomId=${roomId}`);
  };

  const handleCreateRoom = () => {
    // TODO: Implement create room functionality
    console.log('Create new room');
  };

  return (
    <Page title="Rooms">
      <RoomsComponent
        onRoomSelect={handleRoomSelect}
        showCreateButton={true}
        onCreateRoom={handleCreateRoom}
      />
    </Page>
  );
}
