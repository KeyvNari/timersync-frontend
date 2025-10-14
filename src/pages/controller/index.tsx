// src/pages/controller/index.tsx
import { useEffect, useState } from 'react';
import { Box, Center, Paper, PasswordInput, Button, Stack, Title, Text } from '@mantine/core';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { IconLock } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import RoomController from '@/components/room-controller';

export default function ControllerPage() {
  const { roomId: roomIdParam, token } = useParams<{ roomId: string; token: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if password is required (URL ends with /pwd)
  const requiresPassword = location.pathname.endsWith('/pwd');

  // Local state
  const [isAuthenticated, setIsAuthenticated] = useState(!requiresPassword);
  const [password, setPassword] = useState('');
  const [roomId, setRoomId] = useState<number | null>(null);

  // Password form
  const passwordForm = useForm({
    initialValues: {
      password: '',
    },
    validate: {
      password: (value) => (value.length === 0 ? 'Password is required' : null),
    },
  });

  // Parse room ID
  useEffect(() => {
    if (roomIdParam) {
      const parsed = parseInt(roomIdParam, 10);
      setRoomId(isNaN(parsed) || parsed <= 0 ? null : parsed);
    }
  }, [roomIdParam]);

  // Handle password submission
  const handlePasswordSubmit = (values: { password: string }) => {
    setPassword(values.password);
    setIsAuthenticated(true);
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Show password form if required and not authenticated
  if (requiresPassword && !isAuthenticated) {
    return (
      <Box
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <Center h="100%">
          <Paper shadow="xl" p="xl" radius="md" maw={400} w="90%">
            <Stack gap="lg">
              <Center>
                <IconLock size={48} color="var(--mantine-color-blue-6)" />
              </Center>

              <div>
                <Title order={2} ta="center" mb="xs">
                  Room Password Required
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  This room is password protected. Please enter the password to continue.
                </Text>
              </div>

              <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
                <Stack gap="md">
                  <PasswordInput
                    label="Password"
                    placeholder="Enter room password"
                    required
                    {...passwordForm.getInputProps('password')}
                  />

                  <Button type="submit" fullWidth size="md">
                    Connect to Room
                  </Button>

                  <Button variant="light" onClick={handleGoBack}>
                    Go Back
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Center>
      </Box>
    );
  }

  // Show RoomController once authenticated (or if no password required)
  if (!roomId || !token) {
    return (
      <Box
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <Center h="100%">
          <Text c="red">Invalid room link</Text>
        </Center>
      </Box>
    );
  }

  return (
    <RoomController
      authMode="urlToken"
      roomId={roomId}
      roomToken={token}
      tokenPassword={password}
      requiresPassword={requiresPassword}
    />
  );
}
