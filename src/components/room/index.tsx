// src/components/room/index.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Group, Button, Box, Loader, Center, Alert, Stack, Text } from '@mantine/core';
import { IconShare, IconArrowLeft, IconPlus, IconSparkles } from '@tabler/icons-react';
import { StickyHeader } from '@/components/sticky-header';
import { EditableRoomName } from '@/layouts/dashboard/header/editable-room-name';
import { CurrentUser } from '@/layouts/dashboard/header/current-user';
import { Timers } from '@/components/timer-panel';
import TimerDisplay from '@/components/timer-display';
import { ConnectedDevices } from '@/components/connected-devices';
import { ResizableDashboard } from '@/components/resizable-dashboard';
import classes from './room.module.css';

export interface RoomComponentProps {
  roomId: number;
  roomName: string;
  roomDescription?: string;
  timers: any[];
  displays: any[];
  connections: any[];
  connectionCount: number;
  selectedTimerId?: number;
  isAuthenticated: boolean;
  userAccessLevel?: "full" | "viewer";
  user: any;
  timerEvents?: any;
  onRoomNameSave: (name: string) => void;
  onShare: () => void;
  onAddTimer: () => void;
  onCreateWithAI: () => void;
  showBackButton?: boolean;
  showShareButton?: boolean;
  showActionButtons?: boolean;
  showHeader?: boolean;
}

export default function RoomComponent({
  roomId,
  roomName,
  roomDescription,
  timers,
  displays,
  connections,
  connectionCount,
  selectedTimerId,
  isAuthenticated,
  userAccessLevel = 'full',
  user,
  timerEvents,
  onRoomNameSave,
  onShare,
  onAddTimer,
  onCreateWithAI,
  showBackButton = false,
  showShareButton = true,
  showActionButtons = true,
  showHeader = true,
}: RoomComponentProps) {
  const navigate = useNavigate();

  const handleLeftWidthChange = (width: number) => {
    // Optional: Save to localStorage or state management
    console.log('Left panel width changed to:', width);
  };

  // Get timer to display
  const selectedTimer = selectedTimerId ? timers?.find((timer) => timer.id === selectedTimerId) : undefined;
  console.log('selected timer from websocket - selectedTimerId:', selectedTimerId, 'timers ids:', timers?.map(t => t.id), 'selectedTimer:', selectedTimer);
  const activeTimer = timers?.find((timer) => timer.is_active);
  const displayTimer = selectedTimer || activeTimer || timers?.[0];
  console.log('RoomComponent display timer selection - selectedTimerId:', selectedTimerId, 'selectedTimer duration:', selectedTimer?.duration_seconds, 'activeTimer duration:', activeTimer?.duration_seconds, 'displayTimer duration:', displayTimer?.duration_seconds);

  // Get matching display config
  const matchedDisplay = displayTimer
    ? displays.find((d) => d.id === displayTimer.display_id)
    : undefined;

  // Convert timer data for TimerDisplay component
  const convertedTimer = useMemo(() => {
    return displayTimer
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
  }, [displayTimer]);

  // Header component
  const header = showHeader ? (
    <StickyHeader className={classes.header}>
      <Group justify="space-between" w="100%">
        <Group gap="md">
          {showBackButton && (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          )}
          <EditableRoomName
            initialName={roomName}
            onSave={onRoomNameSave}
          />
        </Group>

        <Group gap="sm">
          {showShareButton && (
            <Button
              leftSection={<IconShare size={16} />}
              variant="default"
              onClick={onShare}
            >
              Share Room
            </Button>
          )}
          <CurrentUser size="md" />
        </Group>
      </Group>
    </StickyHeader>
  ) : null;

  // Left Panel: Timer List with Action Buttons
  const leftPanel = (
    <Paper
      withBorder
      p="xl"
      h="100%"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}
    >
      {showActionButtons && (
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <Button variant="default" size="sm" leftSection={<IconPlus size={16} />} onClick={onAddTimer}>
              Add Timer
            </Button>
            <Button variant="default" size="sm" leftSection={<IconSparkles size={16} />} onClick={onCreateWithAI}>
              Create with AI
            </Button>
          </Group>
        </Group>
      )}

      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Timers timers={timers} events={timerEvents} selectedTimerId={selectedTimerId} displays={displays} />
      </Box>
    </Paper>
  );

  // Top Right Panel: Timer Display
  const topRightPanel = (
    <Paper withBorder p="md" h="100%">
      {convertedTimer && matchedDisplay ? (
        <TimerDisplay
          key={`${displayTimer?.id}`}
          display={matchedDisplay}
          timer={convertedTimer}
        />
      ) : roomId ? (
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
      ) : (
        <TimerDisplay display={matchedDisplay} timer={convertedTimer} />
      )}
    </Paper>
  );

  // Bottom Right Panel: Connected Devices
  const bottomRightPanel = (
    <Paper withBorder p="md" h="100%">
      <ConnectedDevices
        connections={connections}
        currentUserAccess={userAccessLevel}
        compactMode={false}
      />
    </Paper>
  );

  return (
    <Box className={classes.root}>
      {header}
      <Box className={classes.content}>
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
      </Box>
    </Box>
  );
}
