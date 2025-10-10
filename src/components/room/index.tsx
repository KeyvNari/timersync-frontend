// src/components/room/index.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Group, Button, Box, Modal } from '@mantine/core';
import { IconShare, IconArrowLeft, IconPlus, IconSparkles, IconSettings } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { StickyHeader } from '@/components/sticky-header';
import { EditableRoomName } from '@/layouts/dashboard/header/editable-room-name';
import { CurrentUser } from '@/layouts/dashboard/header/current-user';
import { Timers } from '@/components/timer-panel';
import TimerDisplay from '@/components/timer-display';
import { ConnectedDevices } from '@/components/connected-devices';
import { ResizableDashboard } from '@/components/resizable-dashboard';
import TimerDisplayEditor from '@/components/timer-display-editor';
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
  onSaveDisplay?: (display: any) => void;
  onCreateDisplay?: (displayData: any) => void;
  onUpdateDisplay?: (displayId: number, updateData: any) => void;
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
  onSaveDisplay,
  onCreateDisplay,
  onUpdateDisplay,
  showBackButton = false,
  showShareButton = true,
  showActionButtons = true,
  showHeader = true,
}: RoomComponentProps) {
  const navigate = useNavigate();

  // Display Editor state
  const [editorOpened, { open: openEditor, close: closeEditor }] = useDisclosure(false);
  const [editingDisplay, setEditingDisplay] = useState<any>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  const handleLeftWidthChange = (width: number) => {
    console.log('Left panel width changed to:', width);
  };

  // Display Editor handlers
  const handleOpenDisplayEditor = () => {
    // Open without pre-selecting a display so user can choose from dropdown
    setEditingDisplay(null);
    openEditor();
  };

  const handleSaveDisplay = (displayData: any) => {
    console.log('Saving display:', displayData);

    // Clear any previous errors
    setDisplayNameError(null);

    // Determine if creating new or updating existing display
    const isNewDisplay = !displayData.id;

    // Validate display name for duplicates (case-insensitive)
    const displayName = displayData.name?.trim();
    if (!displayName) {
      setDisplayNameError('Display name cannot be empty');
      return;
    }

    // Check for duplicate names, excluding the current display when editing
    const isDuplicate = displays.some(d =>
      d.name?.trim().toLowerCase() === displayName.toLowerCase() &&
      (!displayData.id || d.id !== displayData.id)
    );

    if (isDuplicate) {
      setDisplayNameError('A display with this name already exists');
      return;
    }

    if (isNewDisplay) {
      // Create new display via prop callback
      if (onCreateDisplay) {
        onCreateDisplay(displayData);
      } else {
        // Fallback to legacy callback (legacy props pattern)
        if (onSaveDisplay) {
          onSaveDisplay(displayData);
        }
      }
    } else {
      // Update existing display via prop callback
      if (onUpdateDisplay) {
        onUpdateDisplay(displayData.id, displayData);
      } else {
        // Fallback to legacy callback (legacy props pattern)
        if (onSaveDisplay) {
          onSaveDisplay(displayData);
        }
      }
    }

    // Close editor and clear error on successful save
    setDisplayNameError(null);
    closeEditor();
  };

  // Get timer to display
  const selectedTimer = selectedTimerId ? timers?.find((timer) => timer.id === selectedTimerId) : undefined;
  const activeTimer = timers?.find((timer) => timer.is_active);
  const displayTimer = selectedTimer || activeTimer || timers?.[0];

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
        <Group justify="space-between" mb="md" wrap="wrap">
          <Group gap="xs">
            <Button variant="default" size="sm" leftSection={<IconPlus size={16} />} onClick={onAddTimer}>
              Add Timer
            </Button>
            <Button variant="default" size="sm" leftSection={<IconSparkles size={16} />} onClick={onCreateWithAI}>
              Create with AI
            </Button>
          </Group>
          <Button 
            variant="default" 
            size="sm" 
            leftSection={<IconSettings size={16} />}
            onClick={handleOpenDisplayEditor}
          >
            Display Settings
          </Button>
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
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Group gap="md" style={{ flexDirection: 'column', textAlign: 'center' }}>
            <span style={{ color: 'var(--mantine-color-dimmed)', fontSize: 'var(--mantine-font-size-sm)' }}>
              No timer selected
            </span>
            <span style={{ color: 'var(--mantine-color-dimmed)', fontSize: 'var(--mantine-font-size-xs)' }}>
              Create or select a timer to begin
            </span>
          </Group>
        </Box>
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

      {/* Display Editor Modal */}
      <Modal
        opened={editorOpened}
        onClose={closeEditor}
        size="100%"
        title={editingDisplay ? "Edit Display Configuration" : "Create New Display"}
        padding={0}
        styles={{
          body: { height: 'calc(100vh - 120px)' },
          content: { height: '100vh' }
        }}
      >
        <Box p="md" style={{ height: '100%', overflow: 'auto' }}>
          <TimerDisplayEditor
            initialDisplay={editingDisplay}
            displays={displays}
            onSave={handleSaveDisplay}
            onCancel={closeEditor}
            nameError={displayNameError}
          />
        </Box>
      </Modal>
    </Box>
  );
}
