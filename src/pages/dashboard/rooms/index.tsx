import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, TextInput, Stack, Group, Button, Select, Text, Textarea, Switch } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Page } from '@/components/page';
import { RoomsComponent } from '@/components/rooms';
import { paths } from '@/routes/paths';
import { useGetRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks';
import { Room } from '@/api/entities/rooms';

export default function RoomsPage() {
  const navigate = useNavigate();
  const { data: roomsResponse, isLoading, error } = useGetRooms();
  const { mutate: createRoom, isPending: isCreating } = useCreateRoom();
  const { mutate: updateRoom, isPending: isUpdating } = useUpdateRoom();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const [roomName, setRoomName] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTimeZone, setEditTimeZone] = useState('UTC');
  const [editIsActive, setEditIsActive] = useState(true);

  const handleRoomSelect = (roomId: number) => {
    navigate(`${paths.dashboard.home}?roomId=${roomId}`);
  };

  const handleCreateRoom = () => {
    openCreate();
  };

  const handleSubmitCreateRoom = () => {
    if (!roomName.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Room name is required',
        color: 'red',
      });
      return;
    }

    createRoom(
      {
        name: roomName.trim(),
        time_zone: timeZone,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Room created successfully!',
            color: 'green',
          });
          setRoomName('');
          setTimeZone('UTC');
          closeCreate();
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to create room',
            color: 'red',
          });
        },
      }
    );
  };

  const handleCloseModal = () => {
    setRoomName('');
    setTimeZone('UTC');
    closeCreate();
  };

  const handleEditRoom = (roomId: number) => {
    const room = roomsResponse?.data?.find((r) => r.id === roomId);
    if (!room) return;

    setEditingRoom(room);
    setEditName(room.name);
    setEditDescription(room.description || '');
    setEditTimeZone(room.time_zone || 'UTC');
    setEditIsActive(room.is_active);
    openEdit();
  };

  const handleSubmitEditRoom = () => {
    if (!editingRoom) return;

    if (!editName.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Room name is required',
        color: 'red',
      });
      return;
    }

    updateRoom(
      {
        roomId: editingRoom.id,
        data: {
          name: editName.trim(),
          description: editDescription.trim() || null,
          time_zone: editTimeZone,
          is_active: editIsActive,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Room updated successfully!',
            color: 'green',
          });
          closeEdit();
          setEditingRoom(null);
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to update room',
            color: 'red',
          });
        },
      }
    );
  };

  const handleCloseEditModal = () => {
    setEditingRoom(null);
    setEditName('');
    setEditDescription('');
    setEditTimeZone('UTC');
    setEditIsActive(true);
    closeEdit();
  };

  const handleDeleteRoom = (roomId: number) => {
    const room = roomsResponse?.data?.find((r) => r.id === roomId);
    if (!room) return;

    modals.openConfirmModal({
      title: 'Delete Room',
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{room.name}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteRoom(roomId, {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Room deleted successfully!',
              color: 'green',
            });
          },
          onError: (error) => {
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to delete room',
              color: 'red',
            });
          },
        });
      },
    });
  };

  // Debug logging
  console.log('Rooms Page - Data:', {
    rooms: roomsResponse?.data,
    isLoading,
    error,
    hasRooms: !!roomsResponse?.data?.length
  });

  // Common time zones
  const timeZones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  ];

  return (
    <Page title="Rooms">
      <RoomsComponent
        rooms={roomsResponse?.data} // Pass the rooms data
        isLoading={isLoading}
        error={error}
        onRoomSelect={handleRoomSelect}
        showCreateButton={true}
        onCreateRoom={handleCreateRoom}
        onEditRoom={handleEditRoom}
        onDeleteRoom={handleDeleteRoom}
        hideHeader={true}
      />

      {/* Create Room Modal */}
      <Modal opened={createOpened} onClose={handleCloseModal} title="Create New Room">
        <Stack>
          <TextInput
            label="Room Name"
            placeholder="Enter room name"
            required
            value={roomName}
            onChange={(e) => setRoomName(e.currentTarget.value)}
            disabled={isCreating}
          />
          <Select
            label="Time Zone"
            placeholder="Select time zone"
            required
            value={timeZone}
            onChange={(value) => setTimeZone(value || 'UTC')}
            data={timeZones}
            searchable
            disabled={isCreating}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={handleCloseModal} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreateRoom} loading={isCreating}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Room Modal */}
      <Modal opened={editOpened} onClose={handleCloseEditModal} title="Edit Room">
        <Stack>
          <TextInput
            label="Room Name"
            placeholder="Enter room name"
            required
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
            disabled={isUpdating}
          />
          <Textarea
            label="Description"
            placeholder="Optional description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.currentTarget.value)}
            disabled={isUpdating}
            minRows={3}
          />
          <Select
            label="Time Zone"
            placeholder="Select time zone"
            required
            value={editTimeZone}
            onChange={(value) => setEditTimeZone(value || 'UTC')}
            data={timeZones}
            searchable
            disabled={isUpdating}
          />
          <Switch
            label="Active"
            description="Enable or disable this room"
            checked={editIsActive}
            onChange={(event) => setEditIsActive(event.currentTarget.checked)}
            disabled={isUpdating}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={handleCloseEditModal} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEditRoom} loading={isUpdating}>
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Page>
  );
}
