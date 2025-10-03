import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '@/components/page';
import { LoadingScreen } from '@/components/loading-screen';
import RoomComponent from '@/components/room';
import { useWebSocketContext, useTimerContext } from '@/providers/websocket-provider';
import { useAuth, useGetAccountInfo } from '@/hooks';
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

  const { isAuthenticated } = useAuth();
  const { data: user } = useGetAccountInfo();

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

  const {
    timers,
    selectedTimerId,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    selectTimer,
    refreshTimers
  } = useTimerContext();
  console.log('timers:', timers);

  // Event handlers for Timers component
  const handleTimerStart = useCallback((timer: any) => {
    console.log('Starting timer:', timer.id);
    if (isAuthenticated) {
      startTimer(timer.id);
    }
  }, [isAuthenticated, startTimer]);

  const handleTimerPause = useCallback((timer: any) => {
    console.log('Pausing timer:', timer.id);
    if (isAuthenticated) {
      pauseTimer(timer.id);
    }
  }, [isAuthenticated, pauseTimer]);

  const handleTimerStop = useCallback((timer: any) => {
    console.log('Stopping timer:', timer.id);
    if (isAuthenticated) {
      stopTimer(timer.id);
    }
  }, [isAuthenticated, stopTimer]);

  const handleTimerSelect = useCallback((timer: any) => {
    console.log('Selecting timer:', timer.id);
    if (isAuthenticated) {
      selectTimer(timer.id);
    }
  }, [isAuthenticated, selectTimer]);

  const timerEvents = useMemo(() => ({
    onTimerStart: handleTimerStart,
    onTimerPause: handleTimerPause,
    onTimerStop: handleTimerStop,
    onTimerSelect: handleTimerSelect,
  }), [handleTimerStart, handleTimerPause, handleTimerStop, handleTimerSelect]);



  
  // Connect to WebSocket when roomId is present and stays connected
  useEffect(() => {
    if (!roomId) {
      disconnect();
      return;
    }

    const connectToRoom = async () => {
      try {
        const userToken = localStorage.getItem(app.accessTokenStoreKey);

        if (!userToken) {
          console.error('❌ No authentication token found!');
          return;
        }

        const connectOptions = {
          token: userToken,
          autoReconnect: true,
          reconnectInterval: 3000,
          maxReconnectAttempts: 5,
        };

        await connect(roomId, connectOptions);
      } catch (error) {
        console.error('Failed to connect to room:', error);
      }
    };

    if (!connected) {
      connectToRoom();
    }

    return () => {
      disconnect();
    };
  }, [roomId]);

  const handleRoomNameSave = (newName: string) => {
    // TODO: Implement API call to update room name
    console.log('Saving room name:', newName);
  };

  const handleShare = () => {
    console.log('Share room:', roomId);
  };

  const handleAddTimer = () => {
    console.log('Add timer to room:', roomId);
  };

  const handleCreateWithAI = () => {
    console.log('Create timer with AI for room:', roomId);
  };



  // Show loading if roomId is present but roomInfo not loaded yet
  const isLoading = roomId && !roomInfo;

  return (
    <Page title={roomInfo?.name || 'Loading Room...' || 'Home'}>
      {roomId ? (
        isLoading ? (
          <LoadingScreen />
        ) : (
          <RoomComponent
            roomId={roomId}
            roomName={roomInfo?.name || `Room ${roomId}`}
            roomDescription={roomInfo?.description}
            timers={timers || []}
            displays={displays || []}
            connections={connections || []}
            connectionCount={connectionCount || 0}
            selectedTimerId={selectedTimerId || undefined}
            isAuthenticated={isAuthenticated}
            userAccessLevel="full"
            user={user}
            timerEvents={timerEvents}
            onRoomNameSave={handleRoomNameSave}
            onShare={handleShare}
            onAddTimer={handleAddTimer}
            onCreateWithAI={handleCreateWithAI}
            showBackButton={false}
            showShareButton={true}
            showActionButtons={true}
            showHeader={true}
          />
        )
      ) : (
        // TODO: Show home/dashboard when no roomId (rooms list, etc.)
        <div>Home/Dashboard content goes here</div>
      )}
    </Page>
  );
}
