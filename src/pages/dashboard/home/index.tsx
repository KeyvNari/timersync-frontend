// src/pages/dashboard/home/index.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Paper, Group, Button, Box, Loader, Center, Alert, Stack, Text } from '@mantine/core';
import { Page } from '@/components/page';
import { Timers } from '@/components/timer-panel';
import TimerDisplay from '@/components/timer-display';
import { ConnectedDevices } from '@/components/connected-devices';
import { ResizableDashboard } from '@/components/resizable-dashboard';
import { useWebSocketContext, useTimerContext } from '@/providers/websocket-provider';
import { app } from '@/config';

// Mock data types
type Display = {
  name: string;
  logo_image?: string | null;
  logo_size_percent?: number | null;
  logo_position?: string | null;
  timer_format?: string | null;
  timer_font_family?: string | null;
  timer_color?: string | null;
  time_of_day_color?: string | null;
  timer_text_style?: string | null;
  timer_size_percent?: number | null;
  timer_position?: string | null;
  auto_hide_completed?: boolean;
  clock_format?: string | null;
  clock_font_family?: string | null;
  clock_color?: string | null;
  clock_visible?: boolean;
  message_font_family?: string | null;
  message_color?: string | null;
  title_display_location?: string | null;
  speaker_display_location?: string | null;
  next_cue_display_location?: string | null;
  header_font_family?: string | null;
  header_color?: string | null;
  footer_font_family?: string | null;
  footer_color?: string | null;
  theme_name?: string | null;
  text_style?: string | null;
  display_ratio?: string | null;
  background_type?: string | null;
  background_color?: string | null;
  background_image?: string | null;
  background_preset?: string | null;
  progress_style?: string | null;
  progress_color_main?: string | null;
  progress_color_secondary?: string | null;
  progress_color_tertiary?: string | null;
};

type Timer = {
  title: string;
  speaker?: string | null;
  notes?: string | null;
  display_id?: number | null;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  timer_type: 'countdown' | 'countup';
  duration_seconds?: number | null;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_stopped: boolean;
  current_time_seconds: number;
  started_at?: Date | null;
  paused_at?: Date | null;
  completed_at?: Date | null;
  accumulated_seconds: number;
  warning_time?: number | null;
  critical_time?: number | null;
  is_overtime: boolean;
  overtime_seconds: number;
  last_calculated_at?: Date | null;
  accumulated_pause_time?: number | null;
  server_time?: Date | null;
};

// Mock data (fallback when not connected)
const mockDisplay: Display = {
  name: 'Untitled Display',
  logo_image: null,
  logo_size_percent: 60,
  logo_position: 'top_left',
  timer_format: 'hh:mm:ss',
  timer_font_family: 'Roboto Mono',
  timer_color: '#ffffffff',
  time_of_day_color: '#ffffffff',
  timer_text_style: 'default',
  timer_size_percent: 10,
  timer_position: 'center',
  auto_hide_completed: false,
  clock_format: 'browser_default',
  clock_font_family: 'Roboto Mono',
  clock_color: '#ffffff',
  clock_visible: true,
  message_font_family: 'Roboto Mono',
  message_color: '#ffffff',
  title_display_location: 'header',
  speaker_display_location: 'footer',
  header_font_family: 'Roboto Mono',
  header_color: '#ffffff',
  footer_font_family: 'Roboto Mono',
  footer_color: '#ffffffff',
  theme_name: 'default',
  text_style: 'default',
  display_ratio: '16:9',
  background_type: 'color',
  background_color: '#00000058',
  background_image: null,
  background_preset: null,
  progress_style: 'bottom_bar',
  progress_color_main: 'green',
  progress_color_secondary: 'orange',
  progress_color_tertiary: 'red',
};

const mockTimer: Timer = {
  title: 'Sample Timer',
  speaker: 'Jane Doe',
  notes: 'This is a mock note',
  show_title: true,
  show_speaker: true,
  show_notes: true,
  timer_type: 'countdown',
  duration_seconds: 250,
  current_time_seconds: -10,
  is_active: true,
  is_paused: false,
  is_finished: false,
  is_stopped: false,
  accumulated_seconds: 0,
  warning_time: 120,
  critical_time: 60,
  started_at: new Date(),
  paused_at: null,
  accumulated_pause_time: 0,
  is_overtime: true,
  overtime_seconds: 5,
  last_calculated_at: new Date(),
  server_time: new Date(),
};

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') ? parseInt(searchParams.get('roomId')!) : null;

  console.log('Room ID:', roomId);

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

  // Connect to WebSocket when roomId is present
// Connect to WebSocket when roomId is present
// In src/pages/dashboard/home/index.tsx
useEffect(() => {
  if (!roomId) {
    setConnectionState('idle');
    disconnect();
    return;
  }

  const connectToRoom = async () => {
    try {
      setConnectionState('connecting');
      const userToken = localStorage.getItem(app.accessTokenStoreKey);

      console.log('🔑 Step 1 - Token from localStorage:', {
        exists: !!userToken,
        length: userToken?.length,
        preview: userToken ? `${userToken.substring(0, 20)}...` : 'NULL'
      });

      if (!userToken) {
        console.error('❌ No authentication token found!');
        setConnectionState('error');
        return;
      }

      const connectOptions = {
        token: userToken,
        autoReconnect: true,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
      };

      console.log('🔑 Step 2 - Options object before connect:', {
        hasToken: !!connectOptions.token,
        tokenPreview: connectOptions.token ? `${connectOptions.token.substring(0, 20)}...` : 'MISSING',
        allKeys: Object.keys(connectOptions)
      });

      await connect(roomId, connectOptions);
      setConnectionState('connected');
    } catch (error) {
      console.error('Failed to connect to room:', error);
      setConnectionState('error');
    }
  };

  if (!connected) {
    connectToRoom();
  }

  return () => {
    disconnect();
  };
}, [roomId, connected]);

  // Update connection state based on WebSocket status
  useEffect(() => {
    if (connected) {
      setConnectionState('connected');
    } else if (lastError) {
      setConnectionState('error');
    }
  }, [connected, lastError]);

  const handleLeftWidthChange = (width: number) => {
    // Optional: Save to localStorage or state management
    console.log('Left panel width changed to:', width);
  };

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
  if (connectionState === 'error' && roomId) {
    return (
      <Page title="Connection Error">
        <Center h="calc(100vh - 10rem)">
          <Alert color="red" maw={500}>
            <Stack gap="md">
              <Text size="sm">
                Failed to connect to room. {lastError}
              </Text>
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
        <Text size="lg" fw={600}>
          {roomInfo?.name || `Room ${roomId}`}
        </Text>
        <Group gap="xs">
          <Button variant="default" size="sm">
            + Add Timer
          </Button>
          <Button variant="default" size="sm">
            Create with AI
          </Button>
        </Group>
      </Group>

      {roomInfo?.description && (
        <Box mb="md">
          <Text size="sm" c="dimmed">
            {roomInfo.description}
          </Text>
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
      ) : roomId ? (
        <Center h="100%">
          <Stack align="center" gap="md">
            <Text c="dimmed" size="sm">
              {connected ? 'No timer selected' : 'Connecting to room...'}
            </Text>
            <Text c="dimmed" size="xs">
              {connected ? 'Create or select a timer to begin' : 'Please wait'}
            </Text>
          </Stack>
        </Center>
      ) : (
        <TimerDisplay display={mockDisplay} timer={mockTimer} />
      )}
    </Paper>
  );

  // Bottom Right Panel: Connected Devices
  const bottomRightPanel = (
    <Paper withBorder p="md" h="100%">
      <ConnectedDevices
        connections={[]} // TODO: Update when WebSocket connection provides full connection data
        currentUserAccess="full"
        compactMode={false}
      />
    </Paper>
  );

  return (
    <Page title={roomInfo?.name || `Room ${roomId}` || 'Home'}>
      <ResizableDashboard
        leftPanel={leftPanel}
        topRightPanel={topRightPanel}
        bottomRightPanel={bottomRightPanel}
        initialLeftWidth={66}
        minLeftWidth={30}
        maxLeftWidth={70}
        onLeftWidthChange={handleLeftWidthChange}
        topRightAspectRatio="16:9"
      />
    </Page>
  );
}
