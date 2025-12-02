// src/components/room/index.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Group, Button, Box, Modal, Tabs, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { IconShare, IconArrowLeft, IconPlus, IconSparkles, IconSettings, IconClock, IconMessage, IconMaximize } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { StickyHeader } from '@/components/sticky-header';
import { EditableRoomName } from '@/layouts/dashboard/header/editable-room-name';
import { CurrentUser } from '@/layouts/dashboard/header/current-user';
import { ColorSchemeToggle } from '@/pages/dashboard/home/color-scheme-toggle';
import { Timers } from '@/components/timer-panel';
import TimerDisplay from '@/components/timer-display';
import { ConnectedDevices } from '@/components/connected-devices';
import { ResizableDashboard } from '@/components/resizable-dashboard';
import TimerDisplayEditor from '@/components/timer-display-editor';
import { Messages, Message } from '@/components/messages';
import TimerAdjustmentControls from '@/components/timer-adjustment-controls';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useDisplayTimer } from '@/hooks/useDisplayTimer';
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
  const features = useFeatureAccess();

  // Get the currently showing message
  const showingMessage = wsMessages?.find(msg => msg.is_showing);

  // Debug logging for messages
  useEffect(() => {
    // Messages state tracked internally
  }, [wsMessages, showingMessage]);

  // Display Editor state
  const [editorOpened, { open: openEditor, close: closeEditor }] = useDisclosure(false);
  const [editingDisplay, setEditingDisplay] = useState<any>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  // Fullscreen preview state
  const [fullscreenOpened, { open: openFullscreen, close: closeFullscreen }] = useDisclosure(false);

  // Handle fullscreen toggle with requestAnimationFrame for proper timing
  const handleFullscreenToggle = useCallback(async () => {
    if (!document.fullscreenElement) {
      openFullscreen();
      // Request animation frame ensures modal is rendered before requesting fullscreen
      requestAnimationFrame(() => {
        const modalElement = document.querySelector('[data-fullscreen-modal]') as HTMLElement;
        if (modalElement?.requestFullscreen) {
          modalElement.requestFullscreen().catch(() => {
            // Fullscreen request failed, keep modal open
          });
        }
      });
    }
  }, [openFullscreen]);

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


  // Display Editor handlers
  const handleOpenDisplayEditor = () => {
    // Pre-select the default display if available, otherwise null
    const defaultDisplay = displays.find(d => d.id === defaultDisplayId) || null;
    setEditingDisplay(defaultDisplay);
    openEditor();
  };

  const handleSaveDisplay = (displayData: any) => {
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

  // Get timer to display with memoized selection and conversion
  const { displayTimer, convertedTimer } = useDisplayTimer(timers, selectedTimerId);

  // Get matching display config
  const matchedDisplay = useMemo(
    () => displayTimer ? displays.find((d) => d.id === displayTimer.display_id) : undefined,
    [displayTimer, displays]
  );

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
          <ColorSchemeToggle />
          {showCurrentUser && <CurrentUser size="md" />}
        </Group>
      </Group>
    </StickyHeader>
  ) : null;

  // Memoized callback for timer adjustment
  const handleAdjustTime = useCallback((timerId: number, newTimeSeconds: number) => {
    adjustTimer(timerId, newTimeSeconds);
  }, [adjustTimer]);

  // Left Panel: Timer List with Action Buttons and Messages Tab
  const leftPanel = useMemo(() => (
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
                <Tooltip label={!features.canCreateTimer().isAvailable ? features.canCreateTimer().reason : undefined} position="top" withArrow disabled={features.canCreateTimer().isAvailable}>
                  <div>
                    <Button
                      variant="default"
                      size="sm"
                      leftSection={<IconPlus size={16} />}
                      onClick={onAddTimer}
                      disabled={!features.canCreateTimer().isAvailable}
                    >
                      Add Timer
                    </Button>
                  </div>
                </Tooltip>
                <Tooltip label={!features.canCreateTimer().isAvailable ? features.canCreateTimer().reason : undefined} position="top" withArrow disabled={features.canCreateTimer().isAvailable}>
                  <div>
                    <Button
                      variant="default"
                      size="sm"
                      leftSection={<IconSparkles size={16} />}
                      onClick={onCreateWithAI}
                      disabled={!features.canCreateTimer().isAvailable}
                    >
                      Create with AI
                    </Button>
                  </div>
                </Tooltip>
              </Group>
            </Group>
          )}

          <Box style={{ flex: 1, overflow: 'auto', minHeight: 0, padding: '3px' }}>
            <Timers
              timers={timers}
              events={timerEvents}
              selectedTimerId={selectedTimerId}
              displays={displays}
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
  ), [timers, displays, selectedTimerId, timerEvents, messages, onMessagesChange, showActionButtons, features, onAddTimer, onCreateWithAI]);

  // Top Right Panel: Timer Display
  const topRightPanel = useMemo(() => (
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
              isActive={displayTimer.is_active || false}
              isPaused={displayTimer.is_paused || false}
              isFinished={displayTimer.is_finished || false}
              isStopped={displayTimer.is_stopped || false}
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
  ), [convertedTimer, matchedDisplay, displayTimer, showingMessage, handleAdjustTime, isOperationPending, handleFullscreenToggle, roomId]);

  // Bottom Right Panel: Connected Devices
  const bottomRightPanel = useMemo(() => (
    <Box h="100%">
      <ConnectedDevices
        connections={connections}
        currentUserAccess={userAccessLevel}
        compactMode={false}
        onRevokeAccessToken={onRevokeAccessToken}
      />
    </Box>
  ), [connections, userAccessLevel, onRevokeAccessToken]);

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
          topRightAspectRatio="16:9"
          mobileBreakpoint="md"
        />
      </Box>

      {/* Display Editor Modal */}
      <Modal
        opened={editorOpened}
        onClose={closeEditor}
        size="100%"
        padding={0}
        withCloseButton={false}
        styles={{
          root: { padding: 0 },
          inner: { padding: 'md' },
          overlay: { padding: 0 },
          content: { height: 'calc(100vh - 2 * var(--mantine-spacing-md))', border: 'none', borderRadius: 'var(--mantine-radius-md)', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' },
          header: { padding: '12px md', borderBottom: '1px solid var(--mantine-color-gray-2)', flexShrink: 0 },
          title: { marginLeft: 'lg', marginBottom: 'sm' },
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

    </Box>
  );
}
