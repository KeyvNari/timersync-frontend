import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/page';
import { RoomsComponent } from '@/components/rooms';
import { paths } from '@/routes/paths';
import { useGetRooms } from '@/hooks';

export default function RoomsPage() {
  const navigate = useNavigate();
  const { data: roomsResponse, isLoading, error } = useGetRooms();

  const handleRoomSelect = (roomId: number) => {
    navigate(`${paths.dashboard.home}?roomId=${roomId}`);
  };

  const handleCreateRoom = () => {
    // TODO: Implement create room functionality
    console.log('Create new room');
  };

  // Debug logging
  console.log('Rooms Page - Data:', {
    rooms: roomsResponse?.data,
    isLoading,
    error,
    hasRooms: !!roomsResponse?.data?.length
  });

  return (
    <Page title="Rooms">
      <RoomsComponent
        rooms={roomsResponse?.data} // Pass the rooms data
        isLoading={isLoading}
        error={error}
        onRoomSelect={handleRoomSelect}
        showCreateButton={true}
        onCreateRoom={handleCreateRoom}
      />
    </Page>
  );
}