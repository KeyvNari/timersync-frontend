// src/components/room/index.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Group, Button, Box, Modal, Tabs, Text, Stack, ActionIcon, Tooltip, Alert } from '@mantine/core';
import { IconShare, IconArrowLeft, IconPlus, IconSparkles, IconSettings, IconClock, IconMessage, IconMaximize, IconLink, IconAlertTriangle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { StickyHeader } from '@/components/sticky-header';
import { EditableRoomName } from '@/layouts/dashboard/header/editable-room-name';
import { CurrentUser } from '@/layouts/dashboard/header/current-user';
import { Timers } from '@/components/timer-panel';
import TimerDisplay from '@/components/timer-display';
import { ConnectedDevices } from '@/components/connected-devices';
import { ResizableDashboard } from '@/components/resizable-dashboard';
import TimerDisplayEditor from '@/components/timer-display-editor';
import { Messages, Message } from '@/components/messages';
import TimerAdjustmentControls from '@/components/timer-adjustment-controls';
import { useWebSocketContext } from '@/providers/websocket-provider';
import classes from './room.module.css';

export interface RoomComponentProps {
  roomId: number;
  roomName: string;
  roomDescription?: string;
  roomTimeZone?: string;
  timers: any[];
  displays: any[];
  connections: any[];
  connectionCount: number;
  selectedTimerId?: number;
  isAuthenticated: boolean;
  userAccessLevel?: "full" | "viewer";
  user: any;
  timerEvents?: any;
  messages?: Message[];
  onRoomNameSave: (name: string) => void;
  onTimeZoneSave?: (timeZone: string) => void;
  onShare: () => void;
  onAddTimer: () => void;
  onCreateWithAI: () => void;
  onSaveDisplay?: (display: any) => void;
  onCreateDisplay?: (displayData: any) => void;
  onUpdateDisplay?: (displayId: number, updateData: any) => void;
  onDeleteDisplay?: (displayId: number) => void;
  onDisconnectDevice?: (connectionId: string) => void;
  onRevokeAccessToken?: (tokenId: number) => void;
  onMessagesChange?: (messages: Message[]) => void;
  showBackButton?: boolean;
  showShareButton?: boolean;
  showActionButtons?: boolean;
  showHeader?: boolean;
  showCurrentUser?: boolean;
}

export default function RoomComponent({
  roomId,
  roomName,
  roomDescription,
  roomTimeZone,
  timers,
  displays,
  connections,
  connectionCount,
  selectedTimerId,
  isAuthenticated,
  userAccessLevel = 'full',
  user,
  timerEvents,
  messages,
  onRoomNameSave,
  onTimeZoneSave,
  onShare,
  onAddTimer,
  onCreateWithAI,
  onSaveDisplay,
  onCreateDisplay,
  onUpdateDisplay,
  onDeleteDisplay,
  onDisconnectDevice,
  onRevokeAccessToken,
  onMessagesChange,
  showBackButton = false,
  showShareButton = true,
  showActionButtons = true,
  showHeader = true,
  showCurrentUser = true,
}: RoomComponentProps) {
  const navigate = useNavigate();
  const { defaultDisplayId, adjustTimer, isOperationPending, messages: wsMessages } = useWebSocketContext();

  // Get the currently showing message
  const showingMessage = wsMessages?.find(msg => msg.is_showing);

  // Debug logging for messages
  useEffect(() => {
    console.log('🏠 Room - Messages state:', {
      allMessages: wsMessages,
      messageCount: wsMessages?.length,
      showingMessage,
      hasShowingMessage: !!showingMessage
    });
  }, [wsMessages, showingMessage]);

  // Display Editor state
  const [editorOpened, { open: openEditor, close: closeEditor }] = useDisclosure(false);
  const [editingDisplay, setEditingDisplay] = useState<any>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  // Fullscreen preview state
  const [fullscreenOpened, { open: openFullscreen, close: closeFullscreen }] = useDisclosure(false);

  // Link/Unlink timers state
  const [allTimersLinked, setAllTimersLinked] = useState(false);
  const [linkConfirmModalOpened, setLinkConfirmModalOpened] = useState(false);
  const toggleLinkCallbackRef = useRef<(() => void) | null>(null);
  const forceExecuteLinkRef = useRef<(() => void) | null>(null);
  const pendingLinkActionRef = useRef<(() => void) | null>(null);

  // Handle fullscreen toggle
  const handleFullscreenToggle = async () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      openFullscreen();
      // Wait for modal to render, then request fullscreen
      setTimeout(async () => {
        const modalElement = document.querySelector('[data-fullscreen-modal]') as HTMLElement;
        if (modalElement) {
          await modalElement.requestFullscreen();
        }
      }, 100);
    }
  };

  // Listen for fullscreen changes to close modal when exiting fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenOpened) {
        closeFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fullscreenOpened, closeFullscreen]);

  const handleLeftWidthChange = (width: number) => {
    console.log('Left panel width changed to:', width);
  };

  // Handle link state changes from Timers component
  const handleLinkStateChange = (isLinked: boolean) => {
    setAllTimersLinked(isLinked);
  };

  // Handle toggle link callback registration
  const handleToggleLinkRegistration = (callback: () => void) => {
    toggleLinkCallbackRef.current = callback;
  };

  // Handle link button click
  const handleLinkButtonClick = () => {
    if (toggleLinkCallbackRef.current) {
      // Call the Timers component's toggle function which will handle confirmation if needed
      toggleLinkCallbackRef.current();
    }
  };

  // Handle request to link timers with running/paused state warning
  const handleRequestLinkToggle = (shouldLink: boolean, timersToReset: any[]) => {
    if (shouldLink && timersToReset.length > 0) {
      // Show confirmation dialog
      pendingLinkActionRef.current = () => {
        // After confirmation, directly execute the link via the exposed function
        if (forceExecuteLinkRef.current) {
          forceExecuteLinkRef.current();
        }
      };
      setLinkConfirmModalOpened(true);
    }
  };

  // Display Editor handlers
  const handleOpenDisplayEditor = () => {
    // Pre-select the default display if available, otherwise null
    const defaultDisplay = displays.find(d => d.id === defaultDisplayId) || null;
    setEditingDisplay(defaultDisplay);
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
          timer_format: displayTimer.timer_format,
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
            initialTimeZone={roomTimeZone}
            onSave={onRoomNameSave}
            onTimeZoneSave={onTimeZoneSave}
          />
        </Group>

        <Group gap="sm">
          {showActionButtons && (
            <Button
              variant="default"
              size="sm"
              leftSection={<IconSettings size={16} />}
              onClick={handleOpenDisplayEditor}
            >
              Display Settings
            </Button>
          )}
          {showShareButton && (
            <Button
              leftSection={<IconShare size={16} />}
              variant="default"
              onClick={onShare}
            >
              Share Room
            </Button>
          )}
          {showCurrentUser && <CurrentUser size="md" />}
        </Group>
      </Group>
    </StickyHeader>
  ) : null;

  // Left Panel: Timer List with Action Buttons and Messages Tab
  const leftPanel = (
    <Paper
      withBorder
      p="md"
      h="100%"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Tabs defaultValue="timers" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs.List style={{ flexShrink: 0 }}>
          <Tabs.Tab value="timers" leftSection={<IconClock size={16} />}>
            Timers
          </Tabs.Tab>
          <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>
            Messages
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="timers" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {showActionButtons && (
            <Group justify="space-between" wrap="wrap" className={classes.actionButtons}>
              <Group gap="xs">
                <Button variant="default" size="sm" leftSection={<IconPlus size={16} />} onClick={onAddTimer}>
                  Add Timer
                </Button>
                <Button variant="default" size="sm" leftSection={<IconSparkles size={16} />} onClick={onCreateWithAI}>
                  Create with AI
                </Button>
              </Group>
              {timers && timers.length > 1 && (
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<IconLink size={16} />}
                  onClick={handleLinkButtonClick}
                >
                  {allTimersLinked ? "Unlink All Timers" : "Link All Timers"}
                </Button>
              )}
            </Group>
          )}

          <Box style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Timers
              timers={timers}
              events={{
                ...timerEvents,
                onRequestLinkToggle: handleRequestLinkToggle
              }}
              selectedTimerId={selectedTimerId}
              displays={displays}
              onLinkStateChange={handleLinkStateChange}
              onToggleLink={handleToggleLinkRegistration}
              forceExecuteLinkRef={forceExecuteLinkRef}
            />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="messages" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} pt="md">
          <Box style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Messages messages={messages} onMessagesChange={onMessagesChange} />
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );

  // Handler for timer adjustment
  const handleAdjustTime = (timerId: number, newTimeSeconds: number) => {
    adjustTimer(timerId, newTimeSeconds);
  };

  // Top Right Panel: Timer Display
  const topRightPanel = (
    <Paper withBorder p="md" h="100%" style={{ position: 'relative' }}>
      {convertedTimer && matchedDisplay ? (
        <Stack gap="md" style={{ height: '100%' }}>
          <Box style={{ flex: 1, position: 'relative' }}>
            <Tooltip label="Fullscreen Preview">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={handleFullscreenToggle}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <IconMaximize size={20} />
              </ActionIcon>
            </Tooltip>
            <TimerDisplay
              key={`${displayTimer?.id}`}
              display={matchedDisplay}
              timer={convertedTimer}
              message={showingMessage}
            />
          </Box>
          {displayTimer && (
            <TimerAdjustmentControls
              timerId={displayTimer.id}
              currentTimeSeconds={displayTimer.current_time_seconds}
              isActive={displayTimer.is_active}
              isPaused={displayTimer.is_paused}
              isFinished={displayTimer.is_finished}
              isStopped={displayTimer.is_stopped}
              onAdjustTime={handleAdjustTime}
              isAdjusting={isOperationPending(`timer_adjust_${displayTimer.id}`)}
            />
          )}
        </Stack>
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
        <TimerDisplay display={matchedDisplay} timer={convertedTimer} message={showingMessage} />
      )}
    </Paper>
  );

  // Bottom Right Panel: Connected Devices
  const bottomRightPanel = (
    <Box h="100%">
      <ConnectedDevices
        connections={connections}
        currentUserAccess={userAccessLevel}
        compactMode={false}
        onDisconnectDevice={onDisconnectDevice}
        onRevokeAccessToken={onRevokeAccessToken}
      />
    </Box>
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
          root: { padding: 0 },
          inner: { padding: 0 },
          overlay: { padding: 0 },
          content: { height: '100vh', border: 'none', borderRadius: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' },
          header: { padding: 'md', borderBottom: '1px solid var(--mantine-color-gray-2)', flexShrink: 0 },
          body: { flex: 1, padding: 0, overflow: 'auto', minHeight: 0 }
        }}
      >
        <TimerDisplayEditor
          initialDisplay={editingDisplay}
          displays={displays}
          onSave={handleSaveDisplay}
          onCancel={closeEditor}
          onDelete={onDeleteDisplay}
          nameError={displayNameError}
          defaultDisplayId={defaultDisplayId}
        />
      </Modal>

      {/* Fullscreen Timer Preview Modal */}
      <Modal
        opened={fullscreenOpened}
        onClose={closeFullscreen}
        fullScreen
        padding={0}
        withCloseButton={false}
        styles={{
          body: {
            padding: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
          },
          content: {
            backgroundColor: '#000',
          }
        }}
      >
        {convertedTimer && matchedDisplay && (
          <Box
            data-fullscreen-modal
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TimerDisplay
              display={matchedDisplay}
              timer={convertedTimer}
              message={showingMessage}
            />
          </Box>
        )}
      </Modal>

      {/* Link confirmation modal */}
      <Modal
        opened={linkConfirmModalOpened}
        onClose={() => setLinkConfirmModalOpened(false)}
        title="Link Timers - Confirm Reset"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle />} color="orange" title="Running or Paused Timers Detected">
            <Text size="sm">
              The following timers are currently running or paused and will be reset when linked:
            </Text>
          </Alert>

          <Stack gap="xs">
            {/* Get running/paused timers from current timers */}
            {timers?.filter(timer => timer.is_active || timer.is_paused).map((timer) => (
              <Text key={timer.id} size="sm" style={{ marginLeft: '1rem' }}>
                • {timer.title || `Timer ${timer.id}`} {timer.is_active && '(Running)'} {timer.is_paused && '(Paused)'}
              </Text>
            ))}
          </Stack>

          <Text size="sm">
            Linking timers will automatically reset them to their full duration. Do you want to proceed?
          </Text>

          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={() => setLinkConfirmModalOpened(false)}>
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={() => {
                pendingLinkActionRef.current?.();
                setLinkConfirmModalOpened(false);
              }}
            >
              Link and Reset
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
