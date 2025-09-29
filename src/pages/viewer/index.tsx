// src/pages/viewer/index.tsx
import { useEffect, useState } from 'react';
import { Box, Alert, Loader, Center, Text, Paper, PasswordInput, Button, Stack, Title } from '@mantine/core';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import TimerDisplay from '@/components/timer-display';
import { useWebSocketContext, useTimerContext } from '@/providers/websocket-provider';

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
  const navigate = useNavigate();

  // Use WebSocket context instead of direct service
  const {
    connected,
    connect,
    disconnect,
    lastError,
    lastSuccess,
    refreshTimers,
    requestConnections,
    displays
  } = useWebSocketContext();

  const {
    getSelectedTimer,
    selectedTimerId,
    timers,
    roomInfo
  } = useTimerContext();

  // Check if password is required (URL ends with /psw)
  const requiresPassword = location.pathname.endsWith('/pwd');

  // Local state for UI
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'disconnected' | 'password_required'>('password_required');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(!requiresPassword);
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

  // Handle WebSocket connection state changes
  useEffect(() => {
    if (connected) {
      setConnectionState('connected');
      setErrorMessage(null);
    } else if (!connected && isAuthenticated && roomId) {
      setConnectionState('connecting');
    } else {
      setConnectionState('disconnected');
    }
  }, [connected, isAuthenticated, roomId]);


  useEffect(() => {
  if (connected) {
    // Add wildcard listener to see ALL messages
    const wildcardHandler = (message: any) => {
      console.log('🌟 Wildcard caught message:', message);
    };
    
    addEventListener('*', wildcardHandler);
    
    return () => {
      removeEventListener('*', wildcardHandler);
    };
  }
}, [connected, addEventListener, removeEventListener]);
  // Request initial data after successful connection
useEffect(() => {
  if (connected && lastSuccess) {
    // Brief delay to ensure WebSocket is fully ready
    setTimeout(() => {
      refreshTimers();
      // Don't request connections for viewers - they don't have permission
      // Only request if we have permission (which viewers typically don't)
      // requestConnections(); // Remove this line or make it conditional
    }, 500);
  }
}, [connected, lastSuccess, refreshTimers]); 

  // Handle connection errors
  useEffect(() => {
    if (lastError) {
      // Handle password-related errors
      if (lastError.includes('Invalid password') ||
          lastError.includes('Password required') ||
          lastError.includes('Unauthorized')) {
        setConnectionState('password_required');
        setIsAuthenticated(false);
        setErrorMessage('Invalid password. Please try again.');
        passwordForm.setFieldError('password', 'Invalid password');
      } else {
        setConnectionState('error');
        setErrorMessage(lastError);
      }
    }
  }, [lastError]);

  // Connect to WebSocket when authenticated and room ID is valid
useEffect(() => {
  // Only connect once when conditions are met
  if (isAuthenticated && roomId && token && !connected) {
    const connectToRoom = async () => {
      try {
        setConnectionState('connecting');
        await connect(roomId, {
          roomToken: token,
          tokenPassword: requiresPassword ? roomPassword : undefined,
          autoReconnect: true,
          reconnectInterval: 3000,
          maxReconnectAttempts: 5,
        });
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnectionState('error');
        setErrorMessage('Failed to connect to room... Check your link.');
      }
    };

    connectToRoom();
  }
  
  // Cleanup on unmount
  return () => {
    if (connected) {
      disconnect();
    }
  };
}, [isAuthenticated, roomId, token]);

  // Handle password submission
  const handlePasswordSubmit = (values: { password: string }) => {
    setRoomPassword(values.password);
    setIsAuthenticated(true);
    setConnectionState('connecting');
  };

  // Get the timer to display (selected timer or active timer or first timer)
  const selectedTimer = getSelectedTimer();
  const activeTimer = timers?.find(timer => timer.is_active);
  const displayTimer = selectedTimer || activeTimer || timers?.[0];



  // Convert timer data to the format expected by TimerDisplay
  // Use the real-time data from websocket updates including server-time calculated values
  const convertedTimer = displayTimer ? {
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
  } : undefined;
  // Handle going back or disconnecting
  const handleGoBack = () => {
    disconnect(); // Clean up WebSocket connection
    navigate(-1); // Go back to previous page
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
                    error={errorMessage && passwordForm.errors.password ? errorMessage : passwordForm.errors.password}
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
            {roomId && <Text c="gray" size="sm" mt="xs">Room: {roomId}</Text>}
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
            {roomId && <Text size="sm" mt="xs">Room: {roomId}</Text>}
            <Button
              variant="light"
              size="xs"
              mt="md"
              onClick={() => {
                if (requiresPassword) {
                  // Auto-reset auth for password-protected rooms
                  setConnectionState('password_required');
                  setIsAuthenticated(false);
                  setErrorMessage(null);
                  passwordForm.reset();
                } else {
                  // Try reconnecting for non-password rooms
                  disconnect();
                  setConnectionState('connecting');
                  setErrorMessage(null);
                }
              }}
            >
              {requiresPassword ? 'Try Different Password' : 'Try Again'}
            </Button>
            <Button
              variant="subtle"
              size="xs"
              mt="xs"
              color="gray"
              onClick={handleGoBack}
            >
              Go Back
            </Button>
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
    {/* Debug info in development */}
    {process.env.NODE_ENV === 'development' && (
      <Box
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      >
        Room: {roomId} | Connected: {connected ? 'Yes' : 'No'} |
        Timers: {timers?.length || 0} | Selected: {selectedTimerId} |
        Current: {displayTimer?.current_time_seconds}
      </Box>
    )}

    <TimerDisplay 
      key={`${displayTimer?.id}-${displayTimer?.current_time_seconds}`}
      display={displays[0]} 
      timer={convertedTimer} 
    />
  </Box>
);
}
