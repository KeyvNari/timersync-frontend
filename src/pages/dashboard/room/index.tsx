// src/pages/dashboard/room/index.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Group, Button, Box, Loader, Center, Alert, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { Page } from '@/components/page';
import { Timers } from '@/components/timer-panel';
import TimerDisplay from '@/components/timer-display';
import { ConnectedDevices } from '@/components/connected-devices';
import { ResizableDashboard } from '@/components/resizable-dashboard';
import { useWebSocketContext, useTimerContext } from '@/providers/websocket-provider';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const parsedRoomId = roomId ? parseInt(roomId, 10) : null;

  const {
    connected,
    connect,
    disconnect,
    lastError,
    displays,
    connectionCount,
    connections,
    roomInfo,
  } = useWebSocketContext();

  const { timers, selectedTimerId, getSelectedTimer } = useTimerContext();

  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle');

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!parsedRoomId || parsedRoomId <= 0) {
      setConnectionState('error');
      return;
    }

    const connectToRoom = async () => {
      try {
        setConnectionState('connecting');
        await connect(parsedRoomId, {
          autoReconnect: true,
          reconnectInterval: 3000,
          maxReconnectAttempts: 5,
        });
        setConnectionState('connected');
      } catch (error) {
        console.error('Failed to connect to room:', error);
        setConnectionState('error');
      }
    };

    if (!connected) {
      connectToRoom();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [parsedRoomId]);

  // Update connection state based on WebSocket status
  useEffect(() => {
    if (connected) {
      setConnectionState('connected');
    } else if (lastError) {
      setConnectionState('error');
    }
  }, [connected, lastError]);

  const handleBackToRooms = () => {
    disconnect();
    navigate('/dashboard/rooms');
  };

  const handleLeftWidthChange = (width: number) => {
    // Save preference to localStorage
    localStorage.setItem(`room-${parsedRoomId}-left-width`, width.toString());
  };

  // Get saved width preference
  const initialLeftWidth = parsedRoomId
    ? parseInt(localStorage.getItem(`room-${parsedRoomId}-left-width`) || '66', 10)
    : 66;

  // Get timer to display
  const selectedTimer = getSelectedTimer();
  const activeTimer = timers?.find((timer) => timer.is_active);
  const displayTimer = selectedTimer || activeTimer || timers?.[0];

  // Get matching display config
  const matchedDisplay = displayTimer
    ? displays.find((d) => d.id === displayTimer.display_id)
    : undefined;

  // Convert timer data for TimerDisplay component
  const convertedTimer = displayTimer
    ? {
        title: displayTimer.title,
        speaker: displayTimer.speaker,
        notes: displayTimer.notes,
        display_id: displayTimer.display_id,
        show_title: displayTimer.show_title,
        show_speaker: displayTimer.show_speaker,
        show_notes: displayTimer.show_notes,
        timer_type: displayTimer.timer_type || 'countdown',
        duration_seconds: displayTimer.duration_seconds,
        is_active: displayTimer.is_active || false,
        is_paused: displayTimer.is_paused || false,
        is_finished: displayTimer.is_finished || false,
        is_stopped: displayTimer.is_stopped || false,
        current_time_seconds: displayTimer.current_time_seconds,
        warning_time: displayTimer.warning_time,
        critical_time: displayTimer.critical_time,
      }
    : undefined;

  // Loading state
  if (connectionState === 'connecting') {
    return (
      <Page title="Loading Room">
        <Center h="calc(100vh - 10rem)">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Connecting to room...</Text>
          </Stack>
        </Center>
      </Page>
    );
  }

  // Error state
  if (connectionState === 'error' || !parsedRoomId) {
    return (
      <Page title="Room Error">
        <Center h="calc(100vh - 10rem)">
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Connection Error"
            color="red"
            maw={500}
          >
            <Stack gap="md">
              <Text size="sm">
                {lastError ||
                  'Unable to connect to the room. Please check your connection and try again.'}
              </Text>
              <Group>
                <Button
                  variant="light"
                  leftSection={<IconArrowLeft size="1rem" />}
                  onClick={handleBackToRooms}
                >
                  Back to Rooms
                </Button>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </Group>
            </Stack>
          </Alert>
        </Center>
      </Page>
    );
  }

  // Left Panel: Timer List with Action Buttons
  const leftPanel = (
    <Paper
      withBorder
      p="xl"
      h="100%"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}
    >
      <Group justify="space-between" mb="md">
        <Button
          variant="subtle"
          size="sm"
          leftSection={<IconArrowLeft size="1rem" />}
          onClick={handleBackToRooms}
        >
          Back
        </Button>
        <Group gap="xs">
          <Button variant="default" size="sm">
            + Add Timer
          </Button>
          <Button variant="default" size="sm">
            Create with AI
          </Button>
        </Group>
      </Group>

      {roomInfo && (
        <Box mb="md">
          <Text size="lg" fw={600}>
            {roomInfo.name || `Room ${parsedRoomId}`}
          </Text>
          {roomInfo.description && (
            <Text size="sm" c="dimmed">
              {roomInfo.description}
            </Text>
          )}
        </Box>
      )}

      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Timers />
      </Box>
    </Paper>
  );

  // Top Right Panel: Timer Display
  const topRightPanel = (
    <Paper withBorder p="md" h="100%">
      {convertedTimer && matchedDisplay ? (
        <TimerDisplay
          key={`${displayTimer?.id}-${displayTimer?.current_time_seconds}`}
          display={matchedDisplay}
          timer={convertedTimer}
        />
      ) : (
        <Center h="100%">
          <Stack align="center" gap="md">
            <Text c="dimmed" size="sm">
              No timer selected
            </Text>
            <Text c="dimmed" size="xs">
              Create or select a timer to begin
            </Text>
          </Stack>
        </Center>
      )}
    </Paper>
  );

  // Bottom Right Panel: Connected Devices
  const bottomRightPanel = (
    <Paper withBorder p="md" h="100%">
      <ConnectedDevices
        connections={connections}
        currentUserAccess="full"
        compactMode={connectionCount === 0}
      />
    </Paper>
  );

  return (
    <Page title={roomInfo?.name || `Room ${parsedRoomId}`}>
      <ResizableDashboard
        leftPanel={leftPanel}
        topRightPanel={topRightPanel}
        bottomRightPanel={bottomRightPanel}
        initialLeftWidth={initialLeftWidth}
        minLeftWidth={30}
        maxLeftWidth={70}
        onLeftWidthChange={handleLeftWidthChange}
        topRightAspectRatio="16:9"
      />
    </Page>
  );
}
