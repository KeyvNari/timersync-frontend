import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconPlayerPlay, IconPlayerPause, IconRestore, IconGripVertical, IconSettings, IconNotes, IconTrash, IconClock, IconUser, IconCalendar, IconArrowDown, IconLink, IconPlayerStop, IconClockCheck, IconHandClick, IconLayoutDashboard, IconBell, IconCalendarTime, IconAdjustments } from '@tabler/icons-react';
import cx from 'clsx';
import { Text, Button, Group, Alert, useMantineColorScheme, useMantineTheme, HoverCard, TextInput, Modal, Popover, Switch, Paper, Stack, ActionIcon, RingProgress, Badge, ThemeIcon, Collapse, Box } from '@mantine/core';
import { Menu } from '@mantine/core';
import { DateTimePicker, DateInput, TimeInput } from '@mantine/dates';
import { useListState } from '@mantine/hooks';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import dayjs from 'dayjs';
import { Tooltip } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Drawer, Textarea, NumberInput, Checkbox, Title, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Select } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradeCta } from './upgrade-cta';
import { TimerSettingsForm } from './timer-settings-form';
import classes from './timers.module.css';

interface Timer {
  id: number;
  title: string;
  speaker: string | null;
  timer_type: 'countdown';
  duration_seconds: number;
  current_time_seconds: number;
  is_manual: boolean;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_stopped: boolean;
  room_sequence_order: number;
  linked_timer_id: number | null;
  display_id: number | null;
  notes: string | null;
  uuid: string;
  scheduled_start_time: string | null;
  scheduled_start_date: string | null;
  is_manual_start: boolean;
  warning_time: number;
  critical_time: number;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  is_overtime: boolean;
  overtime_seconds: number;
  accumulated_seconds: number;
  started_at: string | null;
  paused_at: string | null;
  completed_at: string | null;
  actual_start_time: string | null;
  last_calculated_at: string | null;
  is_selected: boolean | null;
  timer_format: string | null;
}

// Timer events interface
interface TimerEvents {
  onTimerUpdate?: (timer: Timer) => void;
  onTimerStart?: (timer: Timer) => void;
  onTimerPause?: (timer: Timer) => void;
  onTimerStop?: (timer: Timer) => void;
  onTimerComplete?: (timer: Timer) => void;
  onTimerSelect?: (timer: Timer) => void;
  onTimerReorder?: (timers: Timer[]) => void;
  onTimerEdit?: (timer: Timer, field: string, value: any) => void;
  onTimerDelete?: (timer: Timer) => void;
  onScheduleConflict?: (conflicts: Array<{ timer1: string, timer2: string, overlapMinutes: number }>) => void;
  onRequestLinkToggle?: (shouldLink: boolean, timersToReset: Timer[]) => void;
}

// Component props interface
interface DisplayConfig {
  id: number;
  name: string;
  timer_format: string;
  timer_font_family: string;
  timer_size_percent: number;
  timer_position: string;
  theme_name: string;
  [key: string]: any;
}

interface TimersProps {
  timers?: Timer[];
  events?: TimerEvents;
  className?: string;
  showConflictAlerts?: boolean;
  selectedTimerId?: number;
  displays?: DisplayConfig[];
  onToggleLink?: (timer: Timer) => void;
}

const mockTimers: Timer[] = [
  {
    id: 1,
    title: "Team Standup",
    speaker: "John Smith",
    timer_type: "countdown",
    duration_seconds: 900,
    current_time_seconds: 540,
    is_manual: false,
    is_active: false,
    is_paused: false,
    is_finished: false,
    is_stopped: true,
    room_sequence_order: 1,
    linked_timer_id: 2,
    display_id: 1,
    notes: "Daily standup meeting to discuss progress and blockers",
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    scheduled_start_time: "14:00:00",
    scheduled_start_date: "2025-09-19",
    is_manual_start: false,
    warning_time: 60,
    critical_time: 30,
    is_selected: false,
    show_title: true,
    show_speaker: true,
    show_notes: false,
    is_overtime: false,
    overtime_seconds: 0,
    accumulated_seconds: 360,
    started_at: "2025-09-19T13:54:00Z",
    paused_at: "2025-09-19T14:00:00Z",
    completed_at: null,
    actual_start_time: "2025-09-19T13:54:00Z",
    last_calculated_at: "2025-09-19T14:00:00Z",
    timer_format: null
  },
  {
    id: 2,
    title: "Code Review",
    speaker: "Jane Doe",
    timer_type: "countdown",
    duration_seconds: 1800,
    current_time_seconds: 0,
    is_manual: false,
    is_active: false,
    is_paused: false,
    is_finished: false,
    is_stopped: true,
    is_selected: false,
    room_sequence_order: 2,
    linked_timer_id: 3,
    display_id: null,
    notes: "Review pull requests and discuss implementation details",
    uuid: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    scheduled_start_time: null,
    scheduled_start_date: null,
    is_manual_start: true,
    warning_time: 300,
    critical_time: 120,
    show_title: true,
    show_speaker: true,
    show_notes: true,
    is_overtime: false,
    overtime_seconds: 0,
    accumulated_seconds: 0,
    started_at: null,
    paused_at: null,
    completed_at: null,
    actual_start_time: null,
    last_calculated_at: null,
    timer_format: null
  },
  {
    id: 3,
    title: "Break Time",
    speaker: null,
    timer_type: "countdown",
    duration_seconds: 600,
    current_time_seconds: 450,
    is_manual: false,
    is_active: true,
    is_paused: false,
    is_finished: false,
    is_stopped: false,
    is_selected: true,
    room_sequence_order: 3,
    linked_timer_id: null,
    display_id: 2,
    notes: null,
    uuid: "c3d4e5f6-g7h8-9012-cdef-345678901234",
    scheduled_start_time: null,
    scheduled_start_date: null,
    is_manual_start: true,
    warning_time: 200,
    critical_time: 100,
    show_title: true,
    show_speaker: false,
    show_notes: false,
    is_overtime: false,
    overtime_seconds: 0,
    accumulated_seconds: 150,
    started_at: "2025-09-19T14:30:00Z",
    paused_at: null,
    completed_at: null,
    actual_start_time: "2025-09-19T14:30:00Z",
    last_calculated_at: "2025-09-19T14:32:30Z",
    timer_format: null
  }
];

// Helper function to format seconds as MM:SS or HH:MM:SS
function formatDuration(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const remainingSeconds = absSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Helper function to parse MM:SS format to seconds
function parseDuration(timeString: string): number {
  const match = timeString.match(/^(\d+):(\d{1,2})$/);
  if (!match) return 0;
  const [, minutes, seconds] = match.map(num => parseInt(num, 10) || 0);
  return minutes * 60 + seconds;
}

// Helper function to convert seconds to minutes and seconds
function secondsToMinutesAndSeconds(seconds: number): { minutes: number; seconds: number } {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return { minutes, seconds: remainingSeconds };
}

// Helper function to get timer state
function getTimerState(timer: Timer): 'normal' | 'warning' | 'critical' {
  if (!timer.is_active || timer.timer_type !== 'countdown') {
    return 'normal';
  }
  const remainingSeconds = timer.current_time_seconds;
  if (remainingSeconds < 0) {
    return 'critical';
  }
  if (timer.critical_time && remainingSeconds <= timer.critical_time) {
    return 'critical';
  }
  if (timer.warning_time && remainingSeconds <= timer.warning_time) {
    return 'warning';
  }
  return 'normal';
}

// Helper function to get border color
function getBorderColor(timer: Timer, theme: any): string | undefined {
  const timerState = getTimerState(timer);
  if (timerState === 'critical') return theme.colors.red[6];
  if (timerState === 'warning') return theme.colors.orange[6];
  if (timer.is_selected) return theme.colors.blue[6];
  return undefined;
}

// Helper function to get background color
function getBackgroundColor(timer: Timer, theme: any, colorScheme: string): string | undefined {
  if (timer.is_selected) {
    return colorScheme === 'dark' ? theme.colors.blue[9] : theme.colors.blue[0];
  }
  return undefined;
}

// Helper function to check for overlapping scheduled times
function checkForOverlaps(timers: Timer[]) {
  const scheduledTimers = timers.filter(timer =>
    !timer.is_manual_start &&
    timer.scheduled_start_date &&
    timer.scheduled_start_time &&
    timer.duration_seconds
  );

  const overlaps = [];

  for (let i = 0; i < scheduledTimers.length; i++) {
    for (let j = i + 1; j < scheduledTimers.length; j++) {
      const timer1 = scheduledTimers[i];
      const timer2 = scheduledTimers[j];

      const start1 = new Date(`${timer1.scheduled_start_date}T${timer1.scheduled_start_time}`);
      const end1 = new Date(start1.getTime() + timer1.duration_seconds * 1000);
      const start2 = new Date(`${timer2.scheduled_start_date}T${timer2.scheduled_start_time}`);
      const end2 = new Date(start2.getTime() + timer2.duration_seconds * 1000);

      if (start1 < end2 && start2 < end1) {
        const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
        const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
        const overlapMinutes = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));
        overlaps.push({
          timer1: timer1.title,
          timer2: timer2.title,
          overlapMinutes
        });
      }
    }
  }

  return overlaps;
}

// Helper function to check if scheduled time is in the past
function isScheduledTimeInPast(scheduledDate: string | null, scheduledTime: string | null): boolean {
  if (!scheduledDate || !scheduledTime) return false;
  const scheduled = new Date(`${scheduledDate}T${scheduledTime}`);
  return scheduled.getTime() < Date.now();
}

interface ItemProps {
  item: Timer;
  allTimers: Timer[];
  onUpdateTimer: (id: number, updates: Partial<Timer>) => void;
  onSelectTimer: (id: number) => void;
  onOpenSettings: (timer: Timer) => void;
  events?: TimerEvents;
  onToggleLink: (timer: Timer) => void;
  itemIndex?: number;
}

// Custom comparison for React.memo to prevent unnecessary re-renders
const areItemsEqual = (prev: ItemProps, next: ItemProps): boolean => {
  // Re-render if the specific item changed
  if (prev.item !== next.item) return false;
  // Re-render if linked timer relationship changed
  if (prev.item.linked_timer_id !== next.item.linked_timer_id) return false;

  // Re-render if item index changed (for connector display)
  if (prev.itemIndex !== next.itemIndex) return false;
  // Don't re-render for allTimers reference changes if the linked timer ID is the same
  // (we'll memoize the lookup inside)
  return true;
};

function SortableItem({ item, allTimers, onUpdateTimer, onSelectTimer, onOpenSettings, events, onToggleLink, itemIndex = -1 }: ItemProps) {
  // Memoize the linked timer lookup to prevent unnecessary recalculations
  const linkedTimer = useMemo(() => {
    return item.linked_timer_id
      ? allTimers.find(t => t.id === item.linked_timer_id)
      : null;
  }, [item.linked_timer_id, allTimers]);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const timerState = getTimerState(item);

  // State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editSeconds, setEditSeconds] = useState<number>(0);

  // State for delete confirmation modal
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  // State for dismissed schedule warnings
  const [scheduleWarningDismissed, setScheduleWarningDismissed] = useState(false);

  // State for schedule popover
  const [schedulePopoverOpened, setSchedulePopoverOpened] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(!item.is_manual_start);

  // State for start mode selection
  const [startMode, setStartMode] = useState<'manual' | 'scheduled' | 'linked'>('manual');
  const [linkedScheduleEnabled, setLinkedScheduleEnabled] = useState(false);

  // Helper function to determine current start mode
  const deriveStartMode = (): 'manual' | 'scheduled' | 'linked' => {
    if (item.linked_timer_id && allTimers[itemIndex - 1]?.id === item.linked_timer_id) {
      return 'linked';
    }
    if (item.scheduled_start_date && item.scheduled_start_time && !item.is_manual_start) {
      return 'scheduled';
    }
    return 'manual';
  };

  // Track bulk update operations to disable hover animations during linking
  const [isBulkUpdatePending, setIsBulkUpdatePending] = useState(false);
  const wsContext = useWebSocketContext();
  useEffect(() => {
    const isUpdating = wsContext.isOperationPending(`timer_bulk_update_${item.id}`);
    setIsBulkUpdatePending(isUpdating);
  }, [wsContext.pendingOperations, item.id, wsContext]);

  // Reset dismissal and sync popover state when schedule changes
  useEffect(() => {
    setScheduleWarningDismissed(false);
    // Also sync the popover state if it's open to reflect current item values
    if (schedulePopoverOpened) {
      if (item.scheduled_start_date && item.scheduled_start_time) {
        const dateObj = new Date(`${item.scheduled_start_date}T${item.scheduled_start_time}`);
        setScheduleDate(dateObj);
        setScheduleTime(dayjs(dateObj).format('HH:mm'));
      } else {
        setScheduleDate(null);
        setScheduleTime('09:00');
      }
      setIsAutoStartEnabled(!item.is_manual_start);
    }
  }, [item.scheduled_start_date, item.scheduled_start_time, schedulePopoverOpened]);

  // Update auto-start state when item changes
  useEffect(() => {
    setIsAutoStartEnabled(!item.is_manual_start);
  }, [item.is_manual_start]);

  // Check if this item is linked to the next item (for connector display)
  const shouldShowConnector = itemIndex < allTimers.length - 1 && item.linked_timer_id === allTimers[itemIndex + 1]?.id;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    position: 'relative',
    marginBottom: '16px',
    zIndex: isDragging ? 100 : 1,
  };

  const handlePlay = () => {
    events?.onTimerStart?.(item);
  };

  const handlePause = () => {
    events?.onTimerPause?.(item);
  };

  const handleStop = () => {
    events?.onTimerStop?.(item);
  };

  const handleDelete = () => {
    setDeleteModalOpened(true);
  };

  const handleConfirmDelete = () => {
    setDeleteModalOpened(false);
    events?.onTimerDelete?.(item);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpened(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't navigate - just select the timer
    onSelectTimer(item.id);
  };

  const { updateTimer: wsUpdateTimer } = useWebSocketContext();

  // Inline editing functions
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    if (field === 'duration_seconds') {
      const { minutes, seconds } = secondsToMinutesAndSeconds(item.duration_seconds);
      setEditMinutes(minutes);
      setEditSeconds(seconds);
    } else {
      setEditValue(currentValue);
    }
  };

  const saveEdit = () => {
    if (editingField) {
      if (editingField === 'duration_seconds') {
        const totalSeconds = editMinutes * 60 + editSeconds;
        if (totalSeconds > 0) {
          const updates = { [editingField]: totalSeconds };
          onUpdateTimer(item.id, updates);
          events?.onTimerEdit?.(item, editingField, totalSeconds);
        }
      } else if (editValue !== '') {
        const updates = { [editingField]: editValue };
        onUpdateTimer(item.id, updates);
        events?.onTimerEdit?.(item, editingField, editValue);
      }
    }
    setEditingField(null);
    setEditValue('');
    setEditMinutes(0);
    setEditSeconds(0);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setEditMinutes(0);
    setEditSeconds(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Get status for styling
  const getItemStatus = () => {
    if (item.is_active && !item.is_paused) {
      if (timerState === 'critical') return 'critical';
      if (timerState === 'warning') return 'warning';
      return 'active';
    }
    return null;
  };

  // Check if schedule warning should be shown
  const showScheduleWarning = !scheduleWarningDismissed && isScheduledTimeInPast(item.scheduled_start_date, item.scheduled_start_time);

  const handleDismissScheduleWarning = () => {
    setScheduleWarningDismissed(true);
  };

  // Handle auto start toggle
  const handleAutoStartToggle = () => {
    const newValue = !item.is_manual_start;

    // If trying to enable auto start (is_manual_start = false), check if schedule exists
    if (!newValue && (!item.scheduled_start_date || !item.scheduled_start_time)) {
      // Auto start requires a schedule - open the schedule popover
      handleScheduleClick();
      return;
    }

    const updates = { is_manual_start: newValue };
    onUpdateTimer(item.id, updates);
    events?.onTimerEdit?.(item, 'is_manual_start', newValue);
  };

  // Open schedule popover with current value
  const handleScheduleClick = () => {
    // Determine current mode and sync state
    const currentMode = deriveStartMode();
    setStartMode(currentMode);
    setLinkedScheduleEnabled(false);

    if (currentMode === 'linked') {
      // Don't show date/time for linked mode
      setScheduleDate(null);
      setScheduleTime('09:00');
    } else if (currentMode === 'scheduled') {
      // Show existing date/time
      const dateObj = new Date(`${item.scheduled_start_date}T${item.scheduled_start_time}`);
      setScheduleDate(dateObj);
      setScheduleTime(dayjs(dateObj).format('HH:mm'));
    } else {
      // Manual mode - default values
      setScheduleDate(null);
      setScheduleTime('09:00');
    }

    setSchedulePopoverOpened(true);
  };

  // Calculate progress for ring
  const progress = useMemo(() => {
    if (item.duration_seconds <= 0) return 0;
    const remaining = Math.max(0, item.current_time_seconds);
    return ((item.duration_seconds - remaining) / item.duration_seconds) * 100;
  }, [item.duration_seconds, item.current_time_seconds]);

  const isCritical = timerState === 'critical';
  const isWarning = timerState === 'warning';
  const isActive = item.is_active && !item.is_paused;

  // Check if this item is linked to the previous item (for button state)
  const isLinkedToPrevious = itemIndex > 0 && allTimers[itemIndex - 1]?.linked_timer_id === item.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.15 },
        y: { duration: 0.15 }
      }}
      className={cx(classes.item, {
        [classes.itemDragging]: isDragging,
      })}
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleDoubleClick}
      data-status={getItemStatus()}
      {...attributes}
    >
      {/* Connector Line */}
      {shouldShowConnector && (
        <>
          <div className={classes.connectorLine} title="Timers are linked - they will start/stop together" />
          <div className={classes.connectorDot} title="Timers are linked - they will start/stop together" />
        </>
      )}

      <Paper
        className={cx(classes.card, {
          [classes.cardSelected]: item.is_selected,
          [classes.cardActive]: isActive,
          [classes.cardWarning]: isWarning,
          [classes.cardCritical]: isCritical,
        })}
        p="sm"
        radius="md"
        withBorder
      >
        <Group gap="xs" align="center" wrap="nowrap" style={{ width: '100%' }}>
          {/* Drag Handle */}
          <div className={classes.dragHandle} {...listeners}>
            <IconGripVertical size={16} />
          </div>

          {/* Progress Ring & Status */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RingProgress
              size={42}
              thickness={3}
              roundCaps
              sections={[{ value: progress, color: isCritical ? 'red' : isWarning ? 'orange' : 'blue' }]}
              label={
                isActive && (
                  <div className={classes.pulse} style={{ width: 6, height: 6, background: 'var(--mantine-color-blue-5)', margin: '0 auto' }} />
                )
              }
            />
          </div>

          {/* Main Content */}
          <Group gap="md" style={{ flex: 1, minWidth: 0 }} align="center" wrap="nowrap">
            {/* Duration/Time Display - Compact */}
            <Group gap={4} className={classes.editableField}>
              <IconClock size={14} style={{ opacity: 0.5 }} />
              {editingField === 'duration_seconds' ? (
                <div
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      saveEdit();
                    }
                  }}
                >
                  <NumberInput
                    value={editMinutes}
                    onChange={(value) => setEditMinutes(typeof value === 'number' ? value : Number(value) || 0)}
                    onKeyDown={handleKeyPress}
                    size="xs"
                    min={0}
                    max={59}
                    w={36}
                    styles={{ input: { padding: '0 2px', height: '20px', minHeight: '20px', fontSize: '11px', textAlign: 'center' } }}
                    autoFocus
                  />
                  <Text size="xs" span>:</Text>
                  <NumberInput
                    value={editSeconds}
                    onChange={(value) => setEditSeconds(typeof value === 'number' ? value : Number(value) || 0)}
                    onKeyDown={handleKeyPress}
                    size="xs"
                    min={0}
                    max={59}
                    w={36}
                    styles={{ input: { padding: '0 2px', height: '20px', minHeight: '20px', fontSize: '11px', textAlign: 'center' } }}
                  />
                </div>
              ) : (
                <Tooltip label="Click to edit duration" openDelay={500}>
                  <Text
                    size="sm"
                    fw={500}
                    onClick={() => startEditing('duration_seconds', formatDuration(item.duration_seconds))}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatDuration(item.duration_seconds)}
                  </Text>
                </Tooltip>
              )}
            </Group>

            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                {editingField === 'title' ? (
                  <TextInput
                    value={editValue}
                    onChange={(e) => setEditValue(e.currentTarget.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyPress}
                    size="xs"
                    classNames={{ input: classes.titleInput }}
                    autoFocus
                  />
                ) : (
                  <Tooltip label="Click to edit title" openDelay={500}>
                    <Text
                      className={classes.timerTitle}
                      onClick={() => startEditing('title', item.title)}
                      truncate
                    >
                      {item.title}
                    </Text>
                  </Tooltip>
                )}

                {item.notes && (
                  <HoverCard width={320} shadow="md" withArrow>
                    <HoverCard.Target>
                      <div className={classes.notesIndicator}>
                        <IconNotes size={10} />
                      </div>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Text size="sm">{item.notes}</Text>
                    </HoverCard.Dropdown>
                  </HoverCard>
                )}
              </Group>

              {/* Speaker - Inline below title */}
              {(item.speaker || editingField === 'speaker') && (
                <Group gap={4} className={classes.editableField}>
                  <IconUser size={10} style={{ opacity: 0.7 }} />
                  {editingField === 'speaker' ? (
                    <TextInput
                      value={editValue}
                      onChange={(e) => setEditValue(e.currentTarget.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyPress}
                      size="xs"
                      styles={{ input: { height: '18px', minHeight: '18px', padding: '0 4px', fontSize: '10px' } }}
                      autoFocus
                    />
                  ) : (
                    <Tooltip label="Click to edit speaker" openDelay={500}>
                      <Text
                        size="xs"
                        fs="italic"
                        c="dimmed"
                        style={{ fontSize: '11px' }}
                        onClick={() => startEditing('speaker', item.speaker || '')}
                      >
                        {item.speaker || 'No Speaker'}
                      </Text>
                    </Tooltip>
                  )}
                </Group>
              )}
            </Stack>

            {/* Large Time Display */}
            <div style={{ textAlign: 'right', minWidth: '60px', flexShrink: 0 }}>
              <Text
                className={cx(classes.timeDisplay, {
                  [classes.timeDisplayActive]: isActive,
                  [classes.timeDisplayWarning]: isWarning,
                  [classes.timeDisplayCritical]: isCritical,
                })}
                size="lg"
                style={{ whiteSpace: 'nowrap' }}
              >
                {item.current_time_seconds < 0 ? '+' : ''}{formatDuration(item.current_time_seconds)}
              </Text>
              {item.current_time_seconds < 0 && (
                <Text size="xs" c="red" fw={700} ta="right" style={{ fontSize: '9px', lineHeight: 1 }}>OVERTIME</Text>
              )}
            </div>

            {/* Start Mode Display - Minimal Text */}
            <Tooltip
              label="Click to edit start mode"
              openDelay={500}
            >
              <Text
                size="sm"
                c="var(--mantine-color-gray-7)"
                style={{
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onClick={handleScheduleClick}
              >
                {deriveStartMode() === 'linked'
                  ? 'Linked to previous'
                  : (item.scheduled_start_date && item.scheduled_start_time && !item.is_manual_start
                    ? `${dayjs(`${item.scheduled_start_date}T${item.scheduled_start_time}`).format('MMM D, HH:mm')} • Auto-start`
                    : 'Set schedule...'
                  )
                }
              </Text>
            </Tooltip>

            {/* Spacer to push controls to the right */}
            <div style={{ flex: 1 }} />

            {/* Controls */}
            <Group gap="sm" justify="flex-end" className={classes.controls}>
              {/* Select Button */}
              {!item.is_selected && (
                <Tooltip label="Select Timer" openDelay={500}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    onClick={(e) => { e.stopPropagation(); onSelectTimer(item.id); }}
                  >
                    <IconHandClick size={18} />
                  </ActionIcon>
                </Tooltip>
              )}

              {/* Play/Pause Button */}
              {!item.is_active || item.is_paused ? (
                <Tooltip label="Play Timer" openDelay={500}>
                  <ActionIcon
                    variant="light"
                    color="teal"
                    size="lg"
                    onClick={(e) => { e.stopPropagation(); handlePlay(); }}
                    disabled={item.is_finished}
                  >
                    <IconPlayerPlay size={18} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <Tooltip label="Pause Timer" openDelay={500}>
                  <ActionIcon
                    variant="light"
                    color="orange"
                    size="lg"
                    onClick={(e) => { e.stopPropagation(); handlePause(); }}
                  >
                    <IconPlayerPause size={18} />
                  </ActionIcon>
                </Tooltip>
              )}

              {/* Stop/Reset Button */}
              <Tooltip label="Stop Timer" openDelay={500}>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  onClick={(e) => { e.stopPropagation(); handleStop(); }}
                  disabled={item.is_stopped}
                >
                  <IconPlayerStop size={18} />
                </ActionIcon>
              </Tooltip>

              {/* Settings Menu */}
              <Menu position="bottom-end" withArrow>
                <Menu.Target>
                  <Tooltip label="Timer Settings" openDelay={500}>
                    <ActionIcon variant="subtle" color="gray" size="lg">
                      <IconSettings size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Timer Settings</Menu.Label>
                  <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => onOpenSettings(item)}>
                    Configure
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={handleDelete}
                  >
                    Delete Timer
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Group>
      </Paper>

      {/* Start Mode Popover */}
      <Popover
        width={340}
        position="bottom"
        withArrow
        shadow="md"
        opened={schedulePopoverOpened}
        onChange={(opened) => {
          setSchedulePopoverOpened(opened);
          // Reset popover state when closing
          if (!opened) {
            setScheduleDate(null);
            setScheduleTime('09:00');
            setLinkedScheduleEnabled(false);
          }
        }}
        closeOnClickOutside={false}
        closeOnEscape={true}
        trapFocus
      >
        <Popover.Target>
          <div style={{ position: 'absolute', bottom: 0, left: '50%' }} />
        </Popover.Target>
        <Popover.Dropdown p={0} style={{ overflow: 'hidden' }}>
          <Paper p="sm" style={{ width: '100%' }}>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={600} c="gray.9" mb="xs">Start Mode</Text>
                <Select
                  data={[
                    { value: 'manual', label: 'Manual Start' },
                    { value: 'scheduled', label: 'Scheduled Auto-Start' },
                    ...(itemIndex > 0 ? [{ value: 'linked', label: 'Linked to Previous' }] : []),
                  ]}
                  value={startMode}
                  onChange={(value) => {
                    setStartMode(value as 'manual' | 'scheduled' | 'linked');
                    // Reset fields when switching modes
                    setScheduleDate(null);
                    setScheduleTime('09:00');
                    setLinkedScheduleEnabled(false);
                  }}
                  size="sm"
                  placeholder="Select mode"
                />
              </div>

              {/* Manual Start - No additional fields */}
              {startMode === 'manual' && (
                <Text size="sm" c="dimmed">Timer waits for manual start button</Text>
              )}

              {/* Scheduled Auto-Start - Date and Time fields */}
              {startMode === 'scheduled' && (
                <Stack gap="sm">
                  <DateInput
                    label="Date"
                    placeholder="Pick a date"
                    value={scheduleDate}
                    onChange={setScheduleDate}
                    minDate={new Date()}
                    size="sm"
                    leftSection={<IconCalendar size={16} />}
                  />
                  <TimeInput
                    label="Time"
                    placeholder="Pick a time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.currentTarget.value)}
                    size="sm"
                  />
                </Stack>
              )}

              {/* Linked to Previous - Optional schedule */}
              {startMode === 'linked' && (
                <Stack gap="sm">
                  <Text size="sm" c="dimmed">Timer starts when previous timer completes</Text>
                  <Checkbox
                    label="Also set a schedule (optional)"
                    checked={linkedScheduleEnabled}
                    onChange={(e) => setLinkedScheduleEnabled(e.currentTarget.checked)}
                    size="sm"
                  />
                  {linkedScheduleEnabled && (
                    <Stack gap="sm">
                      <DateInput
                        label="Date"
                        placeholder="Pick a date"
                        value={scheduleDate}
                        onChange={setScheduleDate}
                        minDate={new Date()}
                        size="sm"
                        leftSection={<IconCalendar size={16} />}
                      />
                      <TimeInput
                        label="Time"
                        placeholder="Pick a time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.currentTarget.value)}
                        size="sm"
                      />
                    </Stack>
                  )}
                </Stack>
              )}

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" size="xs" color="gray" onClick={() => setSchedulePopoverOpened(false)}>Cancel</Button>
                <Button
                  size="xs"
                  onClick={() => {
                    let updates: any = {};

                    if (startMode === 'manual') {
                      // Clear schedule, set manual start
                      updates = {
                        scheduled_start_date: null,
                        scheduled_start_time: null,
                        is_manual_start: true,
                      };
                    } else if (startMode === 'scheduled') {
                      // Require date and time for scheduled mode
                      if (!scheduleDate || !scheduleTime) return;

                      const [hours, minutes] = scheduleTime.split(':');
                      const combinedDate = new Date(scheduleDate);
                      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0);

                      updates = {
                        scheduled_start_date: dayjs(combinedDate).format('YYYY-MM-DD'),
                        scheduled_start_time: dayjs(combinedDate).format('HH:mm:ss'),
                        is_manual_start: false,
                      };
                    } else if (startMode === 'linked') {
                      // Link to previous timer, clear schedule (unless user opted to add one)
                      const isCurrentlyLinked = itemIndex > 0 && allTimers[itemIndex - 1]?.linked_timer_id === item.id;

                      if (!isCurrentlyLinked) {
                        // Need to call onToggleLink to establish link
                        onToggleLink(item);
                      }

                      if (linkedScheduleEnabled && scheduleDate && scheduleTime) {
                        const [hours, minutes] = scheduleTime.split(':');
                        const combinedDate = new Date(scheduleDate);
                        combinedDate.setHours(parseInt(hours), parseInt(minutes), 0);

                        updates = {
                          scheduled_start_date: dayjs(combinedDate).format('YYYY-MM-DD'),
                          scheduled_start_time: dayjs(combinedDate).format('HH:mm:ss'),
                          is_manual_start: true, // Linked mode uses link, not auto-start
                        };
                      } else {
                        // Linked mode without schedule
                        updates = {
                          scheduled_start_date: null,
                          scheduled_start_time: null,
                          is_manual_start: true,
                        };
                      }
                    }

                    onUpdateTimer(item.id, updates);
                    // Call parent with flattened updates - multiple fields are being updated
                    if (events?.onTimerEdit) {
                      Object.entries(updates).forEach(([field, value]) => {
                        events.onTimerEdit?.(item, field, value);
                      });
                    }
                    setSchedulePopoverOpened(false);
                  }}
                  disabled={startMode === 'scheduled' && (!scheduleDate || !scheduleTime)}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Popover.Dropdown>
      </Popover>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={handleCancelDelete} title="Delete Timer" size="sm">
        <Text size="sm" mb="lg">Are you sure you want to delete "{item.title}"? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={handleCancelDelete}>Cancel</Button>
          <Button color="red" onClick={handleConfirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </motion.div >
  );
}
const MemoizedSortableItem = memo(SortableItem, areItemsEqual);

export function Timers({
  timers,
  events,
  className,
  showConflictAlerts = true,
  selectedTimerId,
  displays = [],
  onToggleLink
}: TimersProps) {
  const { updateTimer: wsUpdateTimer } = useWebSocketContext();
  const features = useFeatureAccess();

  // Use provided timers or fall back to mock data
  const initialTimers = timers || [...mockTimers].sort((a, b) => a.room_sequence_order - b.room_sequence_order);
  const [state, handlers] = useListState<Timer>(initialTimers);
  const reorderLockRef = useRef<boolean>(false);
  const reorderLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Update state when props change (but not during reorder operations)
  useEffect(() => {
    if (timers && !reorderLockRef.current) {
      const sortedTimers = [...timers]
        .sort((a, b) => a.room_sequence_order - b.room_sequence_order)
        .map(timer => ({
          ...timer,
          is_selected: timer.id === selectedTimerId,
        }));

      // Check if a new timer was added while all existing timers are linked
      const previousCount = state.length;
      const newCount = sortedTimers.length;

      if (newCount > previousCount && previousCount > 0) {
        // New timer was added - check if we need to link it into the chain
        const existingLinked = sortedTimers.slice(0, previousCount);
        const allExistingLinked = existingLinked.length > 1 &&
          existingLinked.every((timer, index) => {
            if (index === existingLinked.length - 1) return true; // last timer can have null
            return timer.linked_timer_id === existingLinked[index + 1].id;
          });

        if (allExistingLinked && newCount > 1) {
          // All existing timers are linked, so link the new timer into the chain
          const updatedTimers = sortedTimers.map((timer, index) => {
            if (index === newCount - 2) {
              // Second to last timer should link to the new timer (which is now last)
              return {
                ...timer,
                linked_timer_id: sortedTimers[index + 1].id,
              };
            }
            return timer;
          });

          handlers.setState(updatedTimers);
          events?.onTimerReorder?.(updatedTimers);
          return;
        }
      }

      handlers.setState(sortedTimers);
    }
  }, [timers, selectedTimerId]);

  const overlaps = checkForOverlaps(state);
  // Configure sensors with activation constraint for smoother drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag - prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Emit schedule conflicts
  useEffect(() => {
    if (overlaps.length > 0) {
      events?.onScheduleConflict?.(overlaps);
    }
  }, [overlaps, events]);

  // Note: All timer logic (countdown, state transitions, auto-start) is handled by backend
  // This component only displays current state and handles user interactions

  // Handle individual timer link toggle
  const handleToggleLink = (timer: Timer) => {
    const index = state.findIndex(t => t.id === timer.id);
    if (index <= 0) return; // Cannot link first timer

    const previousTimer = state[index - 1];
    const isCurrentlyLinked = previousTimer.linked_timer_id === timer.id;

    const updates: Timer[] = [...state];

    if (isCurrentlyLinked) {
      // Unlink
      updates[index - 1] = { ...previousTimer, linked_timer_id: null };
    } else {
      // Link
      updates[index - 1] = { ...previousTimer, linked_timer_id: timer.id };
    }

    handlers.setState(updates);
    events?.onTimerReorder?.(updates);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.findIndex((item) => item.id === active.id);
    const newIndex = state.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Lock state updates to prevent flickering from incoming WebSocket messages
      reorderLockRef.current = true;

      // Reorder and update room_sequence_order
      let newState = arrayMove(state, oldIndex, newIndex).map((item, index) => ({
        ...item,
        room_sequence_order: index + 1,
      }));

      // Maintain linking state during reordering
      // Logic: If a timer is moved, we need to ensure links make sense.
      // Requirement: "When timers are moved, if a linked timer goes before its source, the link should break"
      // Interpretation with `linked_timer_id` (points to next):
      // If A -> B (A points to B).
      // If B moves above A (B, A). A's link to B is now invalid because B is not next.
      // So A's `linked_timer_id` should be null.

      // General Rule: After reorder, for each timer, check if its `linked_timer_id` points to the timer IMMEDIATELY following it.
      // If not, clear the link.

      const cleanedState = newState.map((timer, index) => {
        if (timer.linked_timer_id) {
          const nextTimer = newState[index + 1];
          // If there is no next timer, or the next timer is NOT the one we are linked to
          if (!nextTimer || nextTimer.id !== timer.linked_timer_id) {
            return { ...timer, linked_timer_id: null };
          }
        }
        return timer;
      });

      newState = cleanedState;

      handlers.setState(newState);
      events?.onTimerReorder?.(newState);

      // Clear any existing timeout
      if (reorderLockTimeoutRef.current) {
        clearTimeout(reorderLockTimeoutRef.current);
      }

      // Release lock after backend has had time to process and broadcast the bulk update
      // Extended timeout for production latency (was 1000ms, now 3000ms)
      reorderLockTimeoutRef.current = setTimeout(() => {
        reorderLockRef.current = false;
        reorderLockTimeoutRef.current = null;
      }, 3000);
    }
  };

  const handleUpdateTimer = (id: number, updates: Partial<Timer>) => {
    // Only update local state for UI responsiveness
    // Backend changes will come through props and override this
    const index = state.findIndex(timer => timer.id === id);
    if (index !== -1) {
      const updatedTimer = { ...state[index], ...updates };
      handlers.setItem(index, updatedTimer);
      // Don't emit onTimerUpdate here - that's for backend-driven updates
    }
  };

  // New function to handle single timer selection
  const handleSelectTimer = (id: number) => {
    const selectedTimer = state.find(timer => timer.id === id);
    if (selectedTimer) {
      events?.onTimerSelect?.(selectedTimer);
    }
  };

  const [editingTimer, setEditingTimer] = useState<Timer | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleOpenSettings = (timer: Timer) => {
    setEditingTimer(timer);
    open();
  };

  const form = useForm({
    initialValues: {
      title: '',
      speaker: '',
      duration_seconds: 0,
      timer_format: 'mm:ss',
      scheduled_start_time: null as Date | null,
      is_manual_start: false,
      display_id: null as string | null,
      notes: '',
      warning_time: 60,
      critical_time: 30,
      overtime_seconds: 0,
      show_title: true,
      show_speaker: true,
      show_notes: false,
    },
    validate: {
      title: (value) => value.trim().length === 0 ? 'Title is required' : null,
      duration_seconds: (value) => value <= 0 ? 'Duration must be positive' : null,
      warning_time: (value) => (value <= 0 ? 'Warning time must be positive' : null),
      critical_time: (value, values) =>
        value <= 0 ? 'Critical time must be positive' :
          value >= values.warning_time ? 'Critical time must be less than warning time' : null,
    },
  });

  useEffect(() => {
    if (editingTimer) {
      form.setValues({
        title: editingTimer.title,
        speaker: editingTimer.speaker || '',
        duration_seconds: editingTimer.duration_seconds || 0,
        timer_format: editingTimer.timer_format || 'mm:ss',
        scheduled_start_time: editingTimer.scheduled_start_date && editingTimer.scheduled_start_time
          ? new Date(`${editingTimer.scheduled_start_date}T${editingTimer.scheduled_start_time}`)
          : null,
        is_manual_start: !editingTimer.is_manual_start,
        display_id: editingTimer.display_id ? editingTimer.display_id.toString() : null,
        notes: editingTimer.notes || '',
        warning_time: editingTimer.warning_time || 60,
        critical_time: editingTimer.critical_time || 30,
        overtime_seconds: editingTimer.overtime_seconds || 0,
        show_title: editingTimer.show_title ?? true,
        show_speaker: editingTimer.show_speaker ?? true,
        show_notes: editingTimer.show_notes ?? false,
      });
    }
  }, [editingTimer, state]);

  const handleAdvancedSubmit = (values: typeof form.values) => {
    if (editingTimer) {
      // Transform the Date to proper string format for scheduled_start_time
      const transformedValues = {
        ...values,
        scheduled_start_date: values.scheduled_start_time
          ? dayjs(values.scheduled_start_time).format('YYYY-MM-DD')
          : null,
        scheduled_start_time: values.scheduled_start_time
          ? dayjs(values.scheduled_start_time).format('HH:mm:ss')
          : null,
        // Invert the checkbox logic: checked means auto start (is_manual_start = false)
        is_manual_start: !values.is_manual_start,
        display_id: values.display_id ? parseInt(values.display_id, 10) : null,
      };

      handleUpdateTimer(editingTimer.id, transformedValues as Partial<Timer>);
      // Call parent with flattened updates - multiple fields are being updated
      if (events?.onTimerEdit) {
        Object.entries(transformedValues).forEach(([field, value]) => {
          events.onTimerEdit?.(editingTimer, field, value);
        });
      }
    }
    close();
  };

  return (
    <div className={cx(classes.container, className)}>
      {showConflictAlerts && overlaps.length > 0 && (
        <Alert icon={<IconAlertTriangle size={14} />} color="orange" title="Schedule Conflicts">
          {overlaps.map((overlap, index) => (
            <Text key={index} size="sm">
              {overlap.timer1} & {overlap.timer2} ({overlap.overlapMinutes}min overlap)
            </Text>
          ))}
        </Alert>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={state.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {state.map((item, index) => (
              <MemoizedSortableItem
                key={item.id}
                item={item}
                allTimers={state}
                onUpdateTimer={handleUpdateTimer}
                onSelectTimer={handleSelectTimer}
                onOpenSettings={handleOpenSettings}
                events={events}
                onToggleLink={handleToggleLink}
                itemIndex={index}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {/* Show upgrade CTA if timer limit is reached */}
      {!features.canCreateTimer().isAvailable && state.length > 0 && (
        <UpgradeCta
          current={state.length}
          limit={features.planFeatures?.max_timers_in_room || 0}
          featureLabel="timers"
        />
      )}

      {/* Updated Drawer with compact layout */}
      {/* Updated Modal with "Wow" Design */}
      <Modal
        opened={opened}
        onClose={close}
        title="Timer Settings"
        size="xl"
        centered
        padding={0}
        classNames={{
          content: classes.modalContent,
          header: classes.modalHeader,
          body: classes.modalBody,
        }}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        {editingTimer && (
          <TimerSettingsForm
            form={form}
            onSubmit={handleAdvancedSubmit}
            onClose={close}
            displays={displays}
          />
        )}
      </Modal>

    </div>
  );
}
