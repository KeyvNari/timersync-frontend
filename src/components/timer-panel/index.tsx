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
import { IconPlayerPlay, IconPlayerPause, IconRestore, IconGripVertical, IconSettings, IconNotes, IconTrash, IconClock, IconUser, IconCalendar, IconArrowDown, IconLink } from '@tabler/icons-react';
import cx from 'clsx';
import { Text, Button, Group, Alert, useMantineColorScheme, useMantineTheme, HoverCard, TextInput, Modal, Popover, Switch } from '@mantine/core';
import { Menu } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useListState } from '@mantine/hooks';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import dayjs from 'dayjs';
import { Tooltip } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Drawer, Textarea, NumberInput, Checkbox, Stack, Paper, Title, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Select } from '@mantine/core';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradeCta } from './upgrade-cta';
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
  onScheduleConflict?: (conflicts: Array<{timer1: string, timer2: string, overlapMinutes: number}>) => void;
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
  onLinkStateChange?: (isLinked: boolean) => void;
  onToggleLink?: (callback: () => void) => void;
  forceExecuteLinkRef?: React.MutableRefObject<(() => void) | null>;
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
  isAllTimersLinked?: boolean;
  itemIndex?: number;
}

// Custom comparison for React.memo to prevent unnecessary re-renders
const areItemsEqual = (prev: ItemProps, next: ItemProps): boolean => {
  // Re-render if the specific item changed
  if (prev.item !== next.item) return false;
  // Re-render if linked timer relationship changed
  if (prev.item.linked_timer_id !== next.item.linked_timer_id) return false;
  // Re-render if all-timers-linked status changed
  if (prev.isAllTimersLinked !== next.isAllTimersLinked) return false;
  // Re-render if item index changed (for connector display)
  if (prev.itemIndex !== next.itemIndex) return false;
  // Don't re-render for allTimers reference changes if the linked timer ID is the same
  // (we'll memoize the lookup inside)
  return true;
};

function SortableItem({ item, allTimers, onUpdateTimer, onSelectTimer, onOpenSettings, events, isAllTimersLinked = false, itemIndex = -1 }: ItemProps) {
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
  const [scheduleDateTime, setScheduleDateTime] = useState<Date | null>(null);
  const [pendingAutoStart, setPendingAutoStart] = useState(false);

  // Track bulk update operations to disable hover animations during linking
  const [isBulkUpdatePending, setIsBulkUpdatePending] = useState(false);
  const wsContext = useWebSocketContext();
  useEffect(() => {
    const isUpdating = wsContext.isOperationPending(`timer_bulk_update_${item.id}`);
    setIsBulkUpdatePending(isUpdating);
  }, [wsContext.pendingOperations, item.id, wsContext]);

  // Reset dismissal when schedule changes
  useEffect(() => {
    setScheduleWarningDismissed(false);
  }, [item.scheduled_start_date, item.scheduled_start_time]);

  // Check if this item should show the connector (not the last item when all linked)
  const shouldShowConnector = isAllTimersLinked && itemIndex < allTimers.length - 1;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    marginBottom: shouldShowConnector ? '20px' : undefined,
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
    // Don't allow editing if timer is running
    if (item.is_active && !item.is_paused) {
      return;
    }

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
          wsUpdateTimer(item.id, updates as any);
        }
      } else if (editValue !== '') {
        const updates = { [editingField]: editValue };
        onUpdateTimer(item.id, updates);
        events?.onTimerEdit?.(item, editingField, editValue);
        wsUpdateTimer(item.id, updates as any);
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
      setPendingAutoStart(true);
      handleScheduleClick();
      return;
    }

    const updates = { is_manual_start: newValue };
    onUpdateTimer(item.id, updates);
    events?.onTimerEdit?.(item, 'is_manual_start', newValue);
    wsUpdateTimer(item.id, updates as any);
  };

  // Handle schedule save
  const handleScheduleSave = (newDateTime: Date | null) => {
    const updates: any = {
      scheduled_start_date: newDateTime ? dayjs(newDateTime).format('YYYY-MM-DD') : null,
      scheduled_start_time: newDateTime ? dayjs(newDateTime).format('HH:mm:ss') : null,
    };

    // If there was a pending auto start request and a valid schedule is being set
    if (pendingAutoStart && newDateTime) {
      updates.is_manual_start = false; // Enable auto start
      setPendingAutoStart(false);
    }

    // If clearing the schedule and auto start is currently enabled, disable auto start
    if (!newDateTime && !item.is_manual_start) {
      updates.is_manual_start = true; // Disable auto start since schedule is being removed
    }

    onUpdateTimer(item.id, updates);
    events?.onTimerEdit?.(item, 'scheduled_start_time', updates);
    wsUpdateTimer(item.id, updates as any);
    setSchedulePopoverOpened(false);
  };

  // Open schedule popover with current value
  const handleScheduleClick = () => {
    // Don't allow editing if timer is running
    if (item.is_active && !item.is_paused) {
      return;
    }

    if (item.scheduled_start_date && item.scheduled_start_time) {
      setScheduleDateTime(new Date(`${item.scheduled_start_date}T${item.scheduled_start_time}`));
    } else {
      setScheduleDateTime(null);
    }
    setSchedulePopoverOpened(true);
  };

  return (
    <div
      className={cx(classes.item, {
        [classes.itemDragging]: isDragging,
        [classes.itemSelected]: item.is_selected,
      })}
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleDoubleClick}
      data-status={getItemStatus()}
      title="Double-click to select timer"
      {...attributes}
    >
      <div className={classes.dragHandle} {...listeners}>
        <IconGripVertical size={18} />
      </div>
      <div className={classes.timerContent}>
        <div className={classes.timerHeader}>
          {editingField === 'title' ? (
            <TextInput
              value={editValue}
              onChange={(e) => setEditValue(e.currentTarget.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyPress}
              size="xs"
              style={{ minWidth: '150px' }}
              autoFocus
            />
          ) : (
            <div
              className={classes.timerTitle}
              onClick={() => startEditing('title', item.title)}
              style={{
                cursor: (item.is_active && !item.is_paused) ? 'not-allowed' : 'pointer',
                opacity: (item.is_active && !item.is_paused) ? 0.7 : 1
              }}
              title={(item.is_active && !item.is_paused) ? 'Cannot edit while timer is running' : 'Click to edit'}
            >
              {item.title}
            </div>
          )}


          {/* Notes indicator */}
          {item.notes && (
            <HoverCard width={320} shadow="md" withArrow>
              <HoverCard.Target>
                <div className={classes.notesIndicator}>
                  <IconNotes size="10" />
                </div>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">{item.notes}</Text>
              </HoverCard.Dropdown>
            </HoverCard>
          )}

          {/* Link indicator - shown on hover only (hidden when all timers are linked since visual connector is shown) */}
          {linkedTimer && !isAllTimersLinked && (
            <Tooltip
              label={`Linked to: ${linkedTimer.title}`}
              position="top"
              withArrow
            >
              <div
                className={cx(classes.hoverOnly, isBulkUpdatePending && classes.noTransition)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--mantine-color-green-1)',
                  border: '1px solid var(--mantine-color-green-4)',
                  cursor: 'help'
                }}
              >
                <IconArrowDown size={10} color="var(--mantine-color-green-7)" />
                <Text size="xs" c="green.7" fw={500}>
                  {linkedTimer.title}
                </Text>
              </div>
            </Tooltip>
          )}

          {/* Auto Start Toggle - shown on hover only */}
          <Tooltip
            label={
              item.is_manual_start
                ? "Click to enable auto start (schedule required)"
                : "Click to disable auto start"
            }
            position="top"
            withArrow
          >
            <div
              className={cx(classes.autoStartBadge, classes.hoverOnly, isBulkUpdatePending && classes.noTransition)}
              onClick={(e) => {
                e.stopPropagation();
                handleAutoStartToggle();
              }}
              data-enabled={!item.is_manual_start}
            >
              <Text size="xs" fw={500}>
                Auto Start {item.is_manual_start ? 'OFF' : 'ON'}
              </Text>
            </div>
          </Tooltip>
        </div>

        <div className={classes.timerMeta}>
          <span className={classes.editableField}>
            <IconClock size={14} style={{ flexShrink: 0 }} />
            {editingField === 'duration_seconds' ? (
              <div
                style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                onBlur={(e) => {
                  // Only save if focus is leaving the entire duration editing area
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    saveEdit();
                  }
                }}
              >
                <span style={{ fontSize: '10px', marginRight: '2px' }}>Min:</span>
                <NumberInput
                  value={editMinutes}
                  onChange={(value) => setEditMinutes(typeof value === 'number' ? value : Number(value) || 0)}
                  onKeyDown={handleKeyPress}
                  size="xs"
                  min={0}
                  max={59}
                  style={{ width: '50px' }}
                  autoFocus
                />
                <span style={{ fontSize: '10px', margin: '0 2px' }}>Sec:</span>
                <NumberInput
                  value={editSeconds}
                  onChange={(value) => setEditSeconds(typeof value === 'number' ? value : Number(value) || 0)}
                  onKeyDown={handleKeyPress}
                  size="xs"
                  min={0}
                  max={59}
                  style={{ width: '50px' }}
                />
              </div>
            ) : (
              <>
                <span className={classes.metaLabel}>Duration</span>
                <span
                  className={classes.metaValue}
                  onClick={() => startEditing('duration_seconds', formatDuration(item.duration_seconds))}
                  style={{
                    cursor: (item.is_active && !item.is_paused) ? 'not-allowed' : 'pointer',
                    opacity: (item.is_active && !item.is_paused) ? 0.7 : 1
                  }}
                  title={(item.is_active && !item.is_paused) ? 'Cannot edit while timer is running' : 'Click to edit'}
                >
                  {formatDuration(item.duration_seconds)}
                </span>
              </>
            )}
          </span>

          {item.is_active && (
            <span className={cx(classes.remainingTime, {
              [classes.warning]: timerState === 'warning',
              [classes.critical]: timerState === 'critical',
            })}>
              {item.current_time_seconds < 0 ? 'Overtime:' : 'Remaining:'} {item.current_time_seconds < 0 ? '+' : ''}{formatDuration(item.current_time_seconds)}
            </span>
          )}

          {item.speaker && (
            <span className={cx(classes.editableField, classes.hoverOnly, isBulkUpdatePending && classes.noTransition)}>
              <IconUser size={14} style={{ flexShrink: 0 }} />
              {editingField === 'speaker' ? (
                <TextInput
                  value={editValue}
                  onChange={(e) => setEditValue(e.currentTarget.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  size="xs"
                  style={{ minWidth: '100px', display: 'inline-block' }}
                  autoFocus
                />
              ) : (
                <>
                  <span className={classes.metaLabel}>Speaker</span>
                  <span
                    className={classes.metaSpeaker}
                    onClick={() => startEditing('speaker', item.speaker || '')}
                    style={{
                      cursor: (item.is_active && !item.is_paused) ? 'not-allowed' : 'pointer',
                      opacity: (item.is_active && !item.is_paused) ? 0.7 : 1
                    }}
                    title={(item.is_active && !item.is_paused) ? 'Cannot edit while timer is running' : 'Click to edit'}
                  >
                    {item.speaker}
                  </span>
                </>
              )}
            </span>
          )}

          {/* Schedule Editing - Inline with Popover - shown on hover only */}
          <Popover
            width={300}
            position="bottom"
            withArrow
            shadow="md"
            opened={schedulePopoverOpened}
            onChange={setSchedulePopoverOpened}
            closeOnClickOutside={false}
            closeOnEscape={true}
            trapFocus
          >
            <Popover.Target>
              <span
                className={cx(classes.editableField, classes.hoverOnly, isBulkUpdatePending && classes.noTransition)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleScheduleClick();
                }}
                style={{
                  cursor: (item.is_active && !item.is_paused) ? 'not-allowed' : 'pointer',
                  opacity: (item.is_active && !item.is_paused) ? 0.7 : 1
                }}
                title={(item.is_active && !item.is_paused) ? 'Cannot edit while timer is running' : undefined}
              >
                <IconCalendar size={14} style={{ flexShrink: 0 }} />
                {item.scheduled_start_time && item.scheduled_start_date ? (
                  <>
                    <span className={classes.metaLabel}>Scheduled</span>
                    <span className={classes.metaValue}>
                      {dayjs(`${item.scheduled_start_date}T${item.scheduled_start_time}`).format('MMM D, YYYY HH:mm')}
                    </span>
                    {showScheduleWarning && (
                      <Tooltip label="Scheduled time is in the past" position="top" withArrow>
                        <IconAlertTriangle
                          size={12}
                          color="orange"
                          style={{ marginLeft: '4px', verticalAlign: 'middle' }}
                        />
                      </Tooltip>
                    )}
                  </>
                ) : (
                  <span className={classes.metaPlaceholder}>
                    Click to set schedule
                  </span>
                )}
              </span>
            </Popover.Target>
            <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
              <Stack gap="sm">
                <Text size="sm" fw={500}>Set Schedule</Text>
                {pendingAutoStart && (
                  <Alert color="blue" variant="light" p="xs">
                    <Text size="xs">Schedule is required to enable Auto Start</Text>
                  </Alert>
                )}
                <DateTimePicker
                  value={scheduleDateTime}
                  onChange={setScheduleDateTime}
                  placeholder="Pick date and time"
                  clearable
                  withSeconds={false}
                  popoverProps={{ withinPortal: true }}
                />
                <Group justify="flex-end" gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => {
                      setSchedulePopoverOpened(false);
                      setPendingAutoStart(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => handleScheduleSave(scheduleDateTime)}
                    disabled={pendingAutoStart && !scheduleDateTime}
                  >
                    Save
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>

        <div className={classes.controls}>
          <Tooltip label={item.is_paused || !item.is_active ? "Start timer" : "Pause timer"} position="top" withArrow>
            <button
              className={cx(classes.controlButton, item.is_paused || !item.is_active ? classes.play : classes.pause)}
              onClick={item.is_paused || !item.is_active ? handlePlay : handlePause}
              disabled={item.is_stopped}
            >
              {item.is_paused || !item.is_active ? <IconPlayerPlay size={14} /> : <IconPlayerPause size={14} />}
            </button>
          </Tooltip>

          <Tooltip label="Stop/Reset timer" position="top" withArrow>
            <button
              className={cx(classes.controlButton, classes.stop)}
              onClick={handleStop}
              disabled={item.is_stopped}
            >
              <IconRestore size={14} />
            </button>
          </Tooltip>

          <Menu position="bottom-end" shadow="md" closeOnClickOutside>
            <Menu.Target>
              <Tooltip label="More options" position="top" withArrow>
                <button
                  className={classes.controlButton}
                  style={{ fontSize: '16px' }}
                >
                  ⋯
                </button>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => onOpenSettings(item)}
                disabled={item.is_active && !item.is_paused}
              >
                Timer Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                onClick={handleDelete}
                color="red"
              >
                Delete timer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={handleCancelDelete}
        title={`Delete Timer "${item.title}"`}
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete the timer "{item.title}"? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="md">
          <Button variant="light" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            Delete Timer
          </Button>
        </Group>
      </Modal>

      {/* Connection indicator when all timers are linked */}

      {shouldShowConnector && (
          <Tooltip
              label={`Linked to the next timer`}
              position="top"
              withArrow
            >
        <div className={classes.linkedConnector}>
          {/* <div className={classes.connectorDot}></div> */}
          <div className={classes.connectorLine}></div>
          {/* <div className={classes.connectorDot}></div> */}
        </div>
        </Tooltip>
      )}
    </div>
  );
}

// Memoize the component with custom comparison to prevent unnecessary re-renders
// This is critical for preventing the link indicator from flickering during bulk updates
const MemoizedSortableItem = memo(SortableItem, areItemsEqual);

export function Timers({
  timers,
  events,
  className,
  showConflictAlerts = true,
  selectedTimerId,
  displays = [],
  onLinkStateChange,
  onToggleLink,
  forceExecuteLinkRef
}: TimersProps) {
  const { updateTimer: wsUpdateTimer } = useWebSocketContext();
  const features = useFeatureAccess();

  // Use provided timers or fall back to mock data
  const initialTimers = timers || [...mockTimers].sort((a, b) => a.room_sequence_order - b.room_sequence_order);
  const [state, handlers] = useListState<Timer>(initialTimers);
  const reorderLockRef = useRef<boolean>(false);
  const reorderLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for link confirmation dialog
  const [linkConfirmModalOpened, setLinkConfirmModalOpened] = useState(false);
  const pendingLinkActionRef = useRef<(() => void) | null>(null);

  // Helper function to check if all timers are linked in sequence
  const areAllTimersLinked = (): boolean => {
    if (state.length <= 1) return false;

    for (let i = 0; i < state.length - 1; i++) {
      const currentTimer = state[i];
      const nextTimer = state[i + 1];
      if (currentTimer.linked_timer_id !== nextTimer.id) {
        return false;
      }
    }
    return true;
  };

  // Helper function to link all timers in sequence
  const linkAllTimers = (): Timer[] => {
    return state.map((timer, index) => ({
      ...timer,
      linked_timer_id: index < state.length - 1 ? state[index + 1].id : null,
    }));
  };

  // Helper function to unlink all timers
  const unlinkAllTimers = (): Timer[] => {
    return state.map(timer => ({
      ...timer,
      linked_timer_id: null,
    }));
  };

  // Helper function to check if any timer is running or paused
  const getRunningOrPausedTimers = (): Timer[] => {
    return state.filter(timer => timer.is_active || timer.is_paused);
  };

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
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Memoize the linked state check to prevent unnecessary re-renders
  const allTimersLinked = useMemo(() => areAllTimersLinked(), [state]);

  // Notify parent of link state changes
  useEffect(() => {
    onLinkStateChange?.(allTimersLinked);
  }, [allTimersLinked, onLinkStateChange]);

  // Register the toggle link callback with parent
  useEffect(() => {
    onToggleLink?.(() => handleToggleLinkAll());
  }, [onToggleLink]);

  // Emit schedule conflicts
  useEffect(() => {
    if (overlaps.length > 0) {
      events?.onScheduleConflict?.(overlaps);
    }
  }, [overlaps, events]);

  // Note: All timer logic (countdown, state transitions, auto-start) is handled by backend
  // This component only displays current state and handles user interactions

  // Execute the link action and reset timers
  const executeLink = () => {
    const newState = linkAllTimers();
    handlers.setState(newState);

    // Emit the reorder event which will trigger room-controller's handleTimerReorder
    // which sends the bulkUpdateTimers call with all linking info
    events?.onTimerReorder?.(newState);

    // Reset all timers
    state.forEach((timer) => {
      events?.onTimerStop?.(timer);
    });
    console.log('Linking all timers and resetting them');
  };

  // Handle link/unlink all timers
  const handleToggleLinkAll = () => {
    const shouldLink = !areAllTimersLinked();

    if (shouldLink) {
      // Check if any timers are running or paused
      const runningOrPausedTimers = getRunningOrPausedTimers();

      if (runningOrPausedTimers.length > 0) {
        // Request parent to handle the confirmation and execute the link
        events?.onRequestLinkToggle?.(shouldLink, runningOrPausedTimers);
      } else {
        // No running or paused timers, proceed immediately
        executeLink();
      }
    } else {
      // Unlinking - no confirmation needed
      const newState = unlinkAllTimers();
      handlers.setState(newState);
      events?.onTimerReorder?.(newState);
      console.log('Unlinking all timers');
    }
  };

  // Expose executeLink function for parent to call after confirmation
  useEffect(() => {
    if (forceExecuteLinkRef) {
      forceExecuteLinkRef.current = executeLink;
    }
  }, [forceExecuteLinkRef, executeLink, state, handlers, events]);

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
      // If all timers were linked, keep them linked in the new order
      if (areAllTimersLinked()) {
        newState = newState.map((timer, index) => ({
          ...timer,
          linked_timer_id: index < newState.length - 1 ? newState[index + 1].id : null,
        }));
      } else {
        // If not all linked, break any invalid links
        const timersToUpdate: Timer[] = [];
        newState.forEach((timer, index) => {
          if (timer.linked_timer_id) {
            const nextTimer = newState[index + 1];
            // If the linked timer is not the next one in the sequence, break the link
            if (!nextTimer || nextTimer.id !== timer.linked_timer_id) {
              timersToUpdate.push({
                ...timer,
                linked_timer_id: null
              });
            }
          }
        });

        // Apply link breaks to the new state
        if (timersToUpdate.length > 0) {
          newState = newState.map(timer => {
            const updated = timersToUpdate.find(t => t.id === timer.id);
            return updated || timer;
          });
          console.log(`Breaking ${timersToUpdate.length} timer link(s) due to reordering`);
        }
      }

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
      events?.onTimerEdit?.(editingTimer, 'advanced_settings', transformedValues);
      wsUpdateTimer(editingTimer.id, transformedValues as any);
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
          {state.map((item, index) => (
            <MemoizedSortableItem
              key={item.id}
              item={item}
              allTimers={state}
              onUpdateTimer={handleUpdateTimer}
              onSelectTimer={handleSelectTimer}
              onOpenSettings={handleOpenSettings}
              events={events}
              isAllTimersLinked={allTimersLinked}
              itemIndex={index}
            />
          ))}
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
      <Drawer
        opened={opened}
        onClose={close}
        title="Timer Settings"
        size="lg"
        position="right"
      >
        {editingTimer && (
          <form onSubmit={form.onSubmit(handleAdvancedSubmit)}>
            <Stack gap="sm">
              {/* Basic Information Category */}
              <Paper p="sm" withBorder>
                <Title order={4} mb="sm">Basic Information</Title>
                <Stack gap="sm">
                  <TextInput
                    label="Title"
                    placeholder="Enter timer title"
                    {...form.getInputProps('title')}
                  />
                  <TextInput
                    label="Speaker"
                    placeholder="Enter speaker name (optional)"
                    {...form.getInputProps('speaker')}
                  />
                  <Textarea
                    label="Notes"
                    placeholder="Add any additional notes"
                    rows={3}
                    {...form.getInputProps('notes')}
                  />
                </Stack>
              </Paper>

              {/* Timer Configuration Category */}
              <Paper p="sm" withBorder>
                <Title order={4} mb="sm">Timer Configuration</Title>
                <Stack gap="sm">
                  <NumberInput
                    label="Duration (seconds)"
                    placeholder="Enter duration in seconds"
                    min={1}
                    {...form.getInputProps('duration_seconds')}
                  />

                  <Select
                    label="Timer Format"
                    placeholder="Select timer display format"
                    data={[
                      { value: 'mm:ss', label: 'MM:SS (minutes:seconds)' },
                      { value: 'h:mm:ss', label: 'H:MM:SS (hours:minutes:seconds)' },
                      { value: 'hh:mm:ss', label: 'HH:MM:SS (zero-padded hours)' },
                    ]}
                    {...form.getInputProps('timer_format')}
                  />

                  <Select
                    label="Display Configuration"
                    placeholder="Select display configuration for this timer"
                    clearable
                    data={displays.map(display => ({
                      value: display.id.toString(),
                      label: display.name
                    }))}
                    {...form.getInputProps('display_id')}
                  />
                </Stack>
              </Paper>

              {/* Scheduling Category */}
              <Paper p="sm" withBorder>
                <Title order={4} mb="sm">Scheduling</Title>
                <Stack gap="sm">
                  <DateTimePicker
                    label="Scheduled Start Time"
                    placeholder="Pick date and time"
                    clearable
                    withSeconds={false}
                    {...form.getInputProps('scheduled_start_time')}
                  />
                  <Checkbox
                    label="Auto Start"
                    description="Enable automatic start at scheduled time"
                    {...form.getInputProps('is_manual_start', { type: 'checkbox' })}
                  />
                </Stack>
              </Paper>

              {/* Alerts & Warnings Category */}
              <Paper p="sm" withBorder>
                <Title order={4} mb="sm">Alerts & Warnings</Title>
                <Stack gap="sm">
                  <NumberInput
                    label="Warning Time (seconds)"
                    placeholder="Time before warning appears"
                    min={0}
                    {...form.getInputProps('warning_time')}
                  />
                  <NumberInput
                    label="Critical Time (seconds)"
                    placeholder="Time before critical warning appears"
                    min={0}
                    {...form.getInputProps('critical_time')}
                  />
                </Stack>
              </Paper>

              {/* Display Options Category */}
              <Paper p="sm" withBorder>
                <Title order={4} mb="sm">Display Options</Title>
                <Stack gap="sm">
                  <Checkbox
                    label="Show Title"
                    description="Display timer title on screen"
                    {...form.getInputProps('show_title', { type: 'checkbox' })}
                  />
                  <Checkbox
                    label="Show Speaker"
                    description="Display speaker name on screen"
                    {...form.getInputProps('show_speaker', { type: 'checkbox' })}
                  />
                  <Checkbox
                    label="Show Notes"
                    description="Display notes on screen"
                    {...form.getInputProps('show_notes', { type: 'checkbox' })}
                  />
                </Stack>
              </Paper>

              <Divider />

              {/* Action Buttons */}
              <Group justify="flex-end" gap="md">
                <Button variant="light" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Drawer>

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
            {getRunningOrPausedTimers().map((timer) => (
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
    </div>
  );
}
