// src/components/room-controller/index.tsx
import { useEffect, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '@/components/page';
import { LoadingScreen } from '@/components/loading-screen';
import RoomComponent from '@/components/room';
import { useWebSocketContext, useTimerContext } from '@/providers/websocket-provider';
import { useAuth, useGetAccountInfo } from '@/hooks';
import { app } from '@/config';
import { useDisclosure } from '@mantine/hooks';
import { AITimerChat } from '@/components/ai-timer-chat';
import { Modal, Button, Text, Group, Stack, Box } from '@mantine/core';
import ShareRoomModal from '@/components/share-room-modal';

export interface RoomControllerProps {
  authMode: 'authGuard' | 'urlToken';
  // Only for urlToken mode:
  roomId?: number;
  roomToken?: string;
  tokenPassword?: string;
  requiresPassword?: boolean;
}

export default function RoomController({
  authMode,
  roomId: propRoomId,
  roomToken,
  tokenPassword,
  requiresPassword = false,
}: RoomControllerProps) {
  const [searchParams] = useSearchParams();

  // Get roomId based on authMode
  const roomIdFromParams = authMode === 'authGuard'
    ? (searchParams.get('roomId') ? parseInt(searchParams.get('roomId')!) : null)
    : propRoomId || null;

  const roomId = roomIdFromParams;

  // Track if we've ever been connected (to avoid showing notification on initial load)
  const [hasBeenConnected, setHasBeenConnected] = useState(false);

  const { isAuthenticated } = useAuth();
  const { data: user } = useGetAccountInfo();

  const {
    connected,
    connectionStatus,
    connectionMessage,
    disconnectedByHost,
    revokedToken,
    connect,
    disconnect,
    displays,
    connectionCount,
    connections,
    roomInfo,
    createTimer,
    createDisplay,
    updateDisplay,
    deleteDisplay,
    disconnectClient,
    revokeAccessToken,
    updateRoom,
  } = useWebSocketContext();

  const {
    timers,
    selectedTimerId,
    startTimer,
    pauseTimer,
    stopTimer,
    selectTimer,
    updateTimer,
    bulkUpdateTimers,
    deleteTimer,
  } = useTimerContext();

  // Event handlers for Timers component
  const handleTimerStart = useCallback((timer: any) => {
    console.log('Starting timer:', timer.id);
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      startTimer(timer.id);
    }
  }, [authMode, isAuthenticated, startTimer]);

  const handleTimerPause = useCallback((timer: any) => {
    console.log('Pausing timer:', timer.id);
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      pauseTimer(timer.id);
    }
  }, [authMode, isAuthenticated, pauseTimer]);

  const handleTimerStop = useCallback((timer: any) => {
    console.log('Stopping timer:', timer.id);
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      stopTimer(timer.id);
    }
  }, [authMode, isAuthenticated, stopTimer]);

  const handleTimerSelect = useCallback((timer: any) => {
    console.log('Selecting timer:', timer.id);
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      selectTimer(timer.id);
    }
  }, [authMode, isAuthenticated, selectTimer]);

  const handleTimerUpdate = useCallback((timer: any, field: string, value: any) => {
    console.log('Updating timer:', timer.id, field, value);
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      updateTimer(timer.id, { [field]: value });
    }
  }, [authMode, isAuthenticated, updateTimer]);

  const handleTimerDelete = useCallback((timer: any) => {
    console.log('Deleting timer:', timer.id);
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      deleteTimer(timer.id);
    }
  }, [authMode, isAuthenticated, deleteTimer]);

  const handleTimerReorder = useCallback((reorderedTimers: any[]) => {
    console.log('Reordering timers:', reorderedTimers.map(t => ({ id: t.id, order: t.room_sequence_order, link: t.linked_timer_id })));
    if (authMode === 'authGuard' ? isAuthenticated : true) {
      // Send bulk update with all timer order changes AND link updates
      const updates = reorderedTimers.map(timer => ({
        timer_id: timer.id,
        room_sequence_order: timer.room_sequence_order,
        linked_timer_id: timer.linked_timer_id
      }));
      bulkUpdateTimers(updates);
    }
  }, [authMode, isAuthenticated, bulkUpdateTimers]);

  const timerEvents = useMemo(() => ({
    onTimerStart: handleTimerStart,
    onTimerPause: handleTimerPause,
    onTimerStop: handleTimerStop,
    onTimerSelect: handleTimerSelect,
    onTimerEdit: handleTimerUpdate,
    onTimerDelete: handleTimerDelete,
    onTimerReorder: handleTimerReorder,
  }), [handleTimerStart, handleTimerPause, handleTimerStop, handleTimerSelect, handleTimerUpdate, handleTimerDelete, handleTimerReorder]);

  // Track connection state changes
  useEffect(() => {
    if (connected) {
      setHasBeenConnected(true);
    }
  }, [connected]);

  // Connect to WebSocket when roomId is present
  useEffect(() => {
    if (!roomId) {
      disconnect();
      return;
    }

    const connectToRoom = async () => {
      try {
        let connectOptions: any = {
          autoReconnect: true,
          reconnectInterval: 3000,
          maxReconnectAttempts: 5,
        };

        if (authMode === 'authGuard') {
          // Dashboard mode: use localStorage token
          const userToken = localStorage.getItem(app.accessTokenStoreKey);
          if (!userToken) {
            console.error('❌ No authentication token found!');
            return;
          }
          connectOptions.token = userToken;
        } else {
          // Controller mode: use roomToken and optional password
          connectOptions.roomToken = roomToken;
          if (requiresPassword && tokenPassword) {
            connectOptions.tokenPassword = tokenPassword;
          }
        }

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
    console.log('Saving room name:', newName);
    if ((authMode === 'authGuard' && !isAuthenticated) || !roomId) {
      console.warn('Cannot update room: not authenticated or no room ID');
      return;
    }

    updateRoom({
      name: newName
    });
  };

  const handleTimeZoneSave = (newTimeZone: string) => {
    console.log('Saving timezone:', newTimeZone);
    if ((authMode === 'authGuard' && !isAuthenticated) || !roomId) {
      console.warn('Cannot update room: not authenticated or no room ID');
      return;
    }

    updateRoom({
      time_zone: newTimeZone
    });
  };

  const [shareOpened, { open: openShare, close: closeShare }] = useDisclosure(false);

  const handleShare = () => {
    console.log('Share room:', roomId);
    openShare();
  };

  const handleAddTimer = useCallback(() => {
    if ((authMode === 'authGuard' && !isAuthenticated) || !roomId) {
      console.warn('Cannot create timer: not authenticated or no room ID');
      return;
    }

    // Generate next available "Timer X" name
    const unnamedTimers = timers.filter(t =>
      t.title.match(/^Timer \d+$/)
    );

    const existingNumbers = unnamedTimers.map(t => {
      const match = t.title.match(/^Timer (\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const nextNumber = existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;

    createTimer({
      room_id: roomId,
      title: `Timer ${nextNumber}`,
      timer_type: 'countdown',
      duration_seconds: 300,
      is_manual_start: true,
      show_title: true,
      show_speaker: false,
      show_notes: false,
    });

    console.log(`Creating timer: Timer ${nextNumber}`);
  }, [authMode, isAuthenticated, roomId, timers, createTimer]);

  const [aiChatOpened, { open: openAIChat, close: closeAIChat }] = useDisclosure(false);

  const handleCreateWithAI = () => {
    openAIChat();
  };

  // Handle retry connection after being disconnected by host
  const handleRetryConnection = useCallback(async () => {
    if (!roomId) return;

    try {
      let connectOptions: any = {
        autoReconnect: true,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
      };

      if (authMode === 'authGuard') {
        const userToken = localStorage.getItem(app.accessTokenStoreKey);
        if (!userToken) {
          console.error('❌ No authentication token found!');
          return;
        }
        connectOptions.token = userToken;
      } else {
        connectOptions.roomToken = roomToken;
        if (requiresPassword && tokenPassword) {
          connectOptions.tokenPassword = tokenPassword;
        }
      }

      await connect(roomId, connectOptions);
    } catch (error) {
      console.error('Failed to reconnect to room:', error);
    }
  }, [roomId, authMode, roomToken, tokenPassword, requiresPassword, connect]);

  // Show loading if roomId is present but roomInfo not loaded yet
  const isLoading = roomId && !roomInfo;

  // Only show reconnection notification if we've been connected before
  const showConnectionNotification = hasBeenConnected && connectionStatus !== 'connected' && connectionMessage;

  return (
    <Page title={roomInfo?.name || 'Loading Room...' || 'Home'}>
      {(roomId && showConnectionNotification) && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: connectionStatus === 'disconnected' ? '#ff6b6b' : '#ffa500',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: '300px',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {connectionStatus === 'disconnected' ? 'Connection Lost' : 'Reconnecting...'}
          </div>
          <div>{connectionMessage}</div>
        </div>
      )}
      {roomId ? (
        isLoading ? (
          <LoadingScreen message="Preparing your room..." />
        ) : (
          <RoomComponent
            roomId={roomId}
            roomName={roomInfo?.name || `Room ${roomId}`}
            roomDescription={roomInfo?.description}
            roomTimeZone={roomInfo?.time_zone}
            timers={timers || []}
            displays={displays || []}
            connections={connections || []}
            connectionCount={connectionCount || 0}
            selectedTimerId={selectedTimerId || undefined}
            isAuthenticated={authMode === 'authGuard' ? isAuthenticated : true}
            userAccessLevel="full"
            user={user}
            timerEvents={timerEvents}
            onRoomNameSave={handleRoomNameSave}
            onTimeZoneSave={handleTimeZoneSave}
            onShare={handleShare}
            onAddTimer={handleAddTimer}
            onCreateWithAI={handleCreateWithAI}
            onCreateDisplay={createDisplay}
            onUpdateDisplay={updateDisplay}
            onDeleteDisplay={deleteDisplay}
            onDisconnectDevice={disconnectClient}
            onRevokeAccessToken={revokeAccessToken}
            showBackButton={false}
            showShareButton={true}
            showActionButtons={true}
            showHeader={true}
            showCurrentUser={authMode === 'authGuard'}
          />
        )
      ) : (
        // TODO: Show home/dashboard when no roomId (rooms list, etc.)
        <div>Home/Dashboard content goes here</div>
      )}
      <AITimerChat
        opened={aiChatOpened}
        onClose={closeAIChat}
        onTimerCreate={handleCreateWithAI}
        roomId={roomId}
      />

      {/* Disconnection by Host Modal */}
      <Modal
        opened={!!disconnectedByHost && roomId !== null}
        onClose={() => {}} // Modal cannot be closed by user
        centered
        size="md"
        title="Disconnected from Room"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        styles={{
          header: { backgroundColor: '#ff6b6b', color: 'white', borderRadius: '8px 8px 0 0' },
          content: { borderRadius: '8px' },
          title: { fontWeight: 'bold' }
        }}
      >
        <Stack gap="md" align="center">
          <Text size="lg" ta="center">
            You have been disconnected from the room
          </Text>

          {disconnectedByHost?.disconnected_by?.connection_name && (
            <Text size="sm" c="dimmed" ta="center">
              Disconnected by: {disconnectedByHost.disconnected_by.connection_name}
            </Text>
          )}

          <Text size="sm" c="dimmed" ta="center">
            {disconnectedByHost?.message || 'You are being disconnected by the host'}
          </Text>

          <Group mt="lg">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go to TimerSync
            </Button>
            <Button color="blue" onClick={handleRetryConnection}>
              Try Again
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Token Revocation Modal */}
      <Modal
        opened={!!revokedToken && roomId !== null}
        onClose={() => {}} // Modal cannot be closed by user
        centered
        size="md"
        title="Access Revoked"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        styles={{
          header: { backgroundColor: '#f59f00', color: 'white', borderRadius: '8px 8px 0 0' },
          content: { borderRadius: '8px' },
          title: { fontWeight: 'bold' }
        }}
      >
        <Stack gap="md" align="center">
          <Text size="lg" ta="center">
            Your access has been revoked
          </Text>

          {revokedToken?.token_name && (
            <Text size="sm" c="dimmed" ta="center">
              Token: {revokedToken.token_name}
            </Text>
          )}

          <Text size="sm" c="dimmed" ta="center">
            {revokedToken?.message || 'Your access token has been revoked'}
          </Text>

          {revokedToken?.reason && (
            <Text size="xs" c="dimmed" ta="center" fs="italic">
              {revokedToken.reason}
            </Text>
          )}

          <Group mt="lg">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go to TimerSync
            </Button>
            <Button color="blue" onClick={handleRetryConnection}>
              Try Again
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Share Room Modal */}
      <ShareRoomModal
        opened={shareOpened}
        onClose={closeShare}
        roomId={roomId!}
        roomName={roomInfo?.name || `Room ${roomId}`}
      />
    </Page>
  );
}
