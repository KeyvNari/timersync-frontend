// src/pages/viewer/index.tsx
import { useEffect, useState } from 'react';
import { Box, Alert, Loader, Center, Text, Paper, PasswordInput, Button, Stack, Title } from '@mantine/core';
import { useParams, useLocation } from 'react-router-dom';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import TimerDisplay from '@/components/timer-display';
import { SimpleWebSocketService, createSimpleWebSocketService } from '@/services/websocket';

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

const defaultDisplay: Display = {
  name: 'Viewer Display',
  logo_image: null,
  logo_size_percent: 60,
  logo_position: 'top_left',
  timer_format: 'mm:ss',
  timer_font_family: 'Roboto Mono',
  timer_color: '#ffffff',
  time_of_day_color: '#ffffff',
  timer_text_style: 'default',
  timer_size_percent: 100,
  timer_position: 'center',
  auto_hide_completed: false,
  clock_format: 'browser_default',
  clock_font_family: 'Roboto Mono',
  clock_color: '#ffffff',
  clock_visible: false,
  message_font_family: 'Roboto Mono',
  message_color: '#ffffff',
  title_display_location: 'header',
  speaker_display_location: 'footer',
  header_font_family: 'Roboto Mono',
  header_color: '#ffffff',
  footer_font_family: 'Roboto Mono',
  footer_color: '#ffffff',
  theme_name: 'default',
  text_style: 'default',
  display_ratio: '16:9',
  background_type: 'color',
  background_color: '#000000',
  background_image: null,
  background_preset: null,
  progress_style: 'bottom_bar',
  progress_color_main: 'green',
  progress_color_secondary: 'orange',
  progress_color_tertiary: 'red',
};

export default function ViewerPage() {
  const { roomId: roomIdParam, token } = useParams<{ roomId: string; token: string }>();
  const location = useLocation();
  
  // Check if password is required (URL ends with /psw)
  const requiresPassword = location.pathname.endsWith('/pwd');
  
  // State management
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'disconnected' | 'password_required'>('password_required');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wsService, setWsService] = useState<SimpleWebSocketService | null>(null);
  const [display, setDisplay] = useState<Display>(defaultDisplay);
  const [selectedTimer, setSelectedTimer] = useState<any>(null);
  const [timers, setTimers] = useState<any[]>([]);
  const [roomPassword, setRoomPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(!requiresPassword);

  // Password form
  const passwordForm = useForm({
    initialValues: {
      password: '',
    },
    validate: {
      password: (value) => (value.length === 0 ? 'Password is required' : null),
    },
  });

  // Handle password submission
  const handlePasswordSubmit = (values: { password: string }) => {
    setRoomPassword(values.password);
    setIsAuthenticated(true);
    setConnectionState('connecting');
  };

  // WebSocket connection effect
  useEffect(() => {
    // Don't connect if password is required but not provided
    if (requiresPassword && !isAuthenticated) {
      return;
    }

    if (!roomIdParam || !token) {
      setConnectionState('error');
      setErrorMessage('Missing room ID or token');
      return;
    }

    const roomId = parseInt(roomIdParam, 10);
    if (isNaN(roomId) || roomId <= 0) {
      setConnectionState('error');
      setErrorMessage('Invalid room ID');
      return;
    }

    setConnectionState('connecting');

    // Create WebSocket service with password if required
    const wsOptions: any = {
      roomId,
      roomToken: token,
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
    };

    // Add room password if required
    if (requiresPassword && roomPassword) {
      wsOptions.tokenPassword = roomPassword;
    }

    const ws = createSimpleWebSocketService(wsOptions);

    // Set up event handlers
    ws.on('success', (message) => {
      console.log('Connection successful:', message);
      setConnectionState('connected');
      setErrorMessage(null);
      
      // Request room timers after connection
      setTimeout(() => {
        ws.requestRoomTimers();
      }, 500);
    });

    ws.on('error', (message) => {
      console.error('WebSocket error:', message);
      
      // Handle password-related errors
      if (message.message && (
        message.message.includes('Invalid password') ||
        message.message.includes('Password required') ||
        message.message.includes('Unauthorized')
      )) {
        setConnectionState('password_required');
        setIsAuthenticated(false);
        setErrorMessage('Invalid password. Please try again.');
        passwordForm.setFieldError('password', 'Invalid password');
      } else {
        setConnectionState('error');
        setErrorMessage(message.message || 'Connection error occurred');
      }
    });

    ws.on('timer_update', (message) => {
      console.log('Timer update:', message);
      setTimers(prev => prev.map(timer => 
        timer.id === message.timer_id 
          ? { ...timer, ...message }
          : timer
      ));
    });

    ws.on('timer_selected', (message) => {
      console.log('Timer selected:', message);
      const timer = timers.find(t => t.id === message.timer_id);
      if (timer) {
        setSelectedTimer(timer);
      }
    });

    ws.on('ROOM_TIMERS_STATUS', (message) => {
      console.log('Room timers status:', message);
      setTimers(message.timers || []);
      if (message.selected_timer_id) {
        const timer = message.timers?.find((t: any) => t.id === message.selected_timer_id);
        setSelectedTimer(timer || null);
      }
    });

    ws.on('INITIAL_ROOM_TIMERS', (message) => {
      console.log('Initial room timers:', message);
      setTimers(message.timers || []);
      if (message.selected_timer_id) {
        const timer = message.timers?.find((t: any) => t.id === message.selected_timer_id);
        setSelectedTimer(timer || null);
      }
    });

    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        await ws.connect();
        console.log('WebSocket connected successfully');
        setWsService(ws);
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnectionState('error');
        setErrorMessage('Failed to connect to room... Check your link.');
      }
    };

    connectWebSocket();

    // Cleanup
    return () => {
      ws.disconnect();
    };
  }, [roomIdParam, token, requiresPassword, isAuthenticated, roomPassword]);

  // Get the timer to display
  const displayTimer = selectedTimer || timers.find(t => t.is_active) || timers[0];

  // Convert timer data to the format expected by TimerDisplay
  const convertedTimer = displayTimer ? {
    title: displayTimer.title,
    speaker: displayTimer.speaker,
    notes: displayTimer.notes,
    display_id: null,
    show_title: true,
    show_speaker: true,
    show_notes: false,
    timer_type: displayTimer.timer_type || 'countdown',
    duration_seconds: displayTimer.duration_seconds,
    is_active: displayTimer.is_active || false,
    is_paused: displayTimer.is_paused || false,
    is_finished: displayTimer.is_finished || false,
    is_stopped: !displayTimer.is_active && !displayTimer.is_finished,
    started_at: displayTimer.started_at,
    paused_at: displayTimer.paused_at,
    accumulated_pause_time: displayTimer.accumulated_pause_time || 0,
    warning_time: displayTimer.warning_time,
    critical_time: displayTimer.critical_time,
    server_time: new Date(),
  } : null;

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
                    error={errorMessage && passwordForm.errors.password ? errorMessage : passwordForm.errors.password}
                  />
                  
                  <Button type="submit" fullWidth size="md">
                    Connect to Room
                  </Button>
                </Stack>
              </form>

              <Text size="xs" c="dimmed" ta="center">
              </Text>
            </Stack>
          </Paper>
        </Center>
      </Box>
    );
  }

  // Show loading state while connecting
  if (connectionState === 'connecting') {
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
          <Box ta="center">
            <Loader size="xl" color="blue" mb="md" />
            <Text c="white" size="lg">Connecting to room...</Text>
            {/* <Text c="gray" size="sm" mt="xs">Room: {roomIdParam}</Text> */}
            {requiresPassword && <Text c="gray" size="xs" mt="xs">Password protected</Text>}
          </Box>
        </Center>
      </Box>
    );
  }

  // Show error state
  if (connectionState === 'error') {
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
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Connection Error" 
            color="red"
            maw={400}
          >
            {errorMessage || 'Unable to connect to the timer room'}
            {/* <Text size="sm" mt="xs">Room: {roomIdParam}</Text> */}
            {requiresPassword && (
              <Button 
                variant="light" 
                size="xs" 
                mt="md"
                onClick={() => {
                  setConnectionState('password_required');
                  setIsAuthenticated(false);
                  setErrorMessage(null);
                  passwordForm.reset();
                }}
              >
                Try Different Password
              </Button>
            )}
          </Alert>
        </Center>
      </Box>
    );
  }

  // Show timer display when connected
  return (
    <Box
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <TimerDisplay display={display} timer={convertedTimer || undefined} />
    </Box>
  );
}