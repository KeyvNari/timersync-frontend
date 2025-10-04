// src/components/rooms/index.tsx
import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Button,
  ActionIcon,
  Menu,
  Loader,
  Center,
  Stack,
  TextInput,
  Modal,
  Avatar,
  Box,
} from '@mantine/core';
import {
  IconDoorEnter,
  IconDots,
  IconEdit,
  IconTrash,
  IconSettings,
  IconUsers,
  IconClock,
  IconPlus,
  IconSearch,
  IconUser,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth, useGetAccountInfo, useLogout, useGetRooms } from '@/hooks';
import { paths } from '@/routes/paths';
import { Room } from '@/api/entities/rooms';

export interface RoomsComponentProps {
  /** Array of rooms to display */
  rooms?: Room[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: any;
  /** Callback when a room is selected */
  onRoomSelect: (roomId: number) => void;
  /** Optional: Custom fetch function for rooms */
  fetchRooms?: () => Promise<Room[]>;
  /** Optional: Show create room button */
  showCreateButton?: boolean;
  /** Optional: Callback for create room */
  onCreateRoom?: () => void;
  /** Optional: Hide header (default: false) */
  hideHeader?: boolean;
}

export function RoomsComponent({
  rooms = [], // Use passed rooms instead of fetching internally
  isLoading = false,
  error = null,
  onRoomSelect,
  fetchRooms,
  showCreateButton = true,
  onCreateRoom,
  hideHeader = false,
}: RoomsComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { setIsAuthenticated } = useAuth();
  const { data: user } = useGetAccountInfo();

  // Use API data if available, otherwise fall back to custom fetch or mock

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoomClick = (roomId: number) => {
    onRoomSelect(roomId);
  };

  const handleDeleteRoom = (roomId: number) => {
    // TODO: Implement delete functionality
    console.log('Delete room:', roomId);
  };

  const handleEditRoom = (roomId: number) => {
    // TODO: Implement edit functionality
    console.log('Edit room:', roomId);
  };

  const handleLogout = () => {
    logout(
      { variables: {} },
      {
        onSettled: () => {
          setIsAuthenticated(false);
          navigate(paths.auth.login, { replace: true });
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Center h="calc(100vh - 10rem)">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading your rooms...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      {!hideHeader && (
        <Paper
          withBorder
          p="md"
          mb="lg"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Group justify="space-between">
            <Group gap="md">
              <Title order={2}>Your Rooms</Title>
              <Badge size="lg" variant="light" color="blue">
                {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
              </Badge>
            </Group>

            {/* User Menu */}
            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <Button variant="subtle" color="gray" rightSection={<IconChevronDown size="1rem" />}>
                  <Group gap="sm">
                    <Avatar src={user?.profile_image_url} size="sm" radius="xl">
                      <IconUser size="1rem" />
                    </Avatar>
                    <Text size="sm" fw={500}>
                      {user?.name || user?.username || 'User'}
                    </Text>
                  </Group>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item>
                  <Text size="sm" fw={500}>
                    {user?.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {user?.email}
                  </Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconSettings size="0.9rem" />}>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size="0.9rem" />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Paper>
      )}

      <Stack gap="lg" p="md">
        {/* Action Bar */}
        <Group justify="space-between" wrap="wrap">
          <TextInput
            placeholder="Search rooms..."
            leftSection={<IconSearch size="1rem" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flexGrow: 1, maxWidth: '400px' }}
          />
          {showCreateButton && (
            <Button leftSection={<IconPlus size="1rem" />} onClick={onCreateRoom || openCreate}>
              Create Room
            </Button>
          )}
        </Group>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <Center h="400px">
            <Stack align="center" gap="md">
              <IconDoorEnter size={48} opacity={0.3} />
              <Text c="dimmed">
                {searchQuery
                  ? 'No rooms found matching your search'
                  : 'No rooms yet. Create one to get started!'}
              </Text>
              {showCreateButton && !searchQuery && (
                <Button
                  leftSection={<IconPlus size="1rem" />}
                  onClick={onCreateRoom || openCreate}
                >
                  Create Your First Room
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Grid>
            {filteredRooms.map((room) => (
              <Grid.Col key={room.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card withBorder shadow="sm" padding="lg" radius="md">
                  <Card.Section inheritPadding py="xs" withBorder>
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Title order={4}>{room.name}</Title>
                        {room.is_active && (
                          <Badge size="sm" color="green" variant="dot">
                            Active
                          </Badge>
                        )}
                      </Group>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots size="1rem" />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size="0.9rem" />}
                            onClick={() => handleEditRoom(room.id)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item leftSection={<IconSettings size="0.9rem" />}>
                            Settings
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size="0.9rem" />}
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Card.Section>

                  <Stack gap="md" mt="md" mb="md">
                    {room.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {room.description}
                      </Text>
                    )}

                    <Group gap="xl">
                      <Group gap="xs">
                        <IconUsers size="1rem" opacity={0.6} />
                        <Text size="sm" c="dimmed">
                          {room.connection_count} connected
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <IconClock size="1rem" opacity={0.6} />
                        <Text size="sm" c="dimmed">
                          {room.timer_count} timers
                        </Text>
                      </Group>
                    </Group>

              
                  </Stack>

                  <Button
                    fullWidth
                    variant="light"
                    leftSection={<IconDoorEnter size="1rem" />}
                    onClick={() => handleRoomClick(room.id)}
                  >
                    Enter Room
                  </Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Create Room Modal */}
        <Modal opened={createOpened} onClose={closeCreate} title="Create New Room">
          <Stack>
            <TextInput label="Room Name" placeholder="Enter room name" required />
            <TextInput label="Description" placeholder="Optional description" />
            <Group justify="flex-end">
              <Button variant="light" onClick={closeCreate}>
                Cancel
              </Button>
              <Button onClick={closeCreate}>Create</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
}
