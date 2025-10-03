// src/pages/dashboard/home/index.tsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Center, Alert, Stack, Text, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Page } from '@/components/page';
import RoomComponent from '@/components/room';
import { useWebSocketContext, useTimerContext } from '@/providers/websocket-provider';
import { useAuth, useGetAccountInfo } from '@/hooks'; // Import useGetAccountInfo
import { app } from '@/config';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId') ? parseInt(searchParams.get('roomId')!) : null;

  const { isAuthenticated } = useAuth();
  const { data: user } = useGetAccountInfo(); // Get user data
  
  const wsContext = useWebSocketContext();
  const timerContext = useTimerContext();
  
  const {
    connected,
    connect,
    disconnect,
    lastError,
    displays,
    connectionCount,
    connections,
    roomInfo,
  } = wsContext;

  const { timers, selectedTimerId } = timerContext;

  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const connectionAttemptedRef = useRef<number | null>(null);

  // ... rest of connection logic remains the same ...

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

  // ... loading and error states remain the same ...

  return (
    <Page title={roomInfo?.name || `Room ${roomId}`}>
      <RoomComponent
        roomId={roomId!}
        roomName={roomInfo?.name || `Room ${roomId}`}
        roomDescription={roomInfo?.description}
        timers={timers}
        displays={displays}
        connections={connections}
        connectionCount={connectionCount}
        selectedTimerId={selectedTimerId}
        isAuthenticated={isAuthenticated}
        userAccessLevel="full"
        user={user} // Pass user data
        onRoomNameSave={handleRoomNameSave}
        onShare={handleShare}
        onAddTimer={handleAddTimer}
        onCreateWithAI={handleCreateWithAI}
        showBackButton={false}
        showShareButton={true}
        showActionButtons={true}
        showHeader={true} // Explicitly show header
      />
    </Page>
  );
}