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
import { IconPlayerPlay, IconPlayerPause, IconRestore, IconGripVertical, IconSettings, IconNotes } from '@tabler/icons-react';
import cx from 'clsx';
import { Text, Button, Group, Alert, useMantineColorScheme, useMantineTheme, HoverCard, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useListState } from '@mantine/hooks';
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { Tooltip } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Drawer, Textarea, NumberInput, Checkbox, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
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
  onScheduleConflict?: (conflicts: Array<{timer1: string, timer2: string, overlapMinutes: number}>) => void;
}

// Component props interface
interface TimersProps {
  timers?: Timer[];
  events?: TimerEvents;
  className?: string;
  showConflictAlerts?: boolean;
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
    last_calculated_at: "2025-09-19T14:00:00Z"
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
    last_calculated_at: null
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
    last_calculated_at: "2025-09-19T14:32:30Z"
  }
];

// Helper function to format seconds as MM:SS
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to parse MM:SS format to seconds
function parseDuration(timeString: string): number {
  const match = timeString.match(/^(\d+):(\d{1,2})$/);
  if (!match) return 0;
  const [, minutes, seconds] = match.map(num => parseInt(num, 10) || 0);
  return minutes * 60 + seconds;
}

// Helper function to get timer state
function getTimerState(timer: Timer): 'normal' | 'warning' | 'critical' {
  if (!timer.is_active || timer.timer_type !== 'countdown') {
    return 'normal';
  }
  const remainingSeconds = timer.current_time_seconds;
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

interface ItemProps {
  item: Timer;
  onUpdateTimer: (id: number, updates: Partial<Timer>) => void;
  onSelectTimer: (id: number) => void;
  onOpenSettings: (timer: Timer) => void;
  events?: TimerEvents;
}

function SortableItem({ item, onUpdateTimer, onSelectTimer, onOpenSettings, events }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.room_sequence_order,
  });

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const timerState = getTimerState(item);
  const borderColor = getBorderColor(item, theme);
  const backgroundColor = getBackgroundColor(item, theme, colorScheme);

  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editingTitle, setEditingTitle] = useState(item.title);
  const [editingDuration, setEditingDuration] = useState(formatDuration(item.duration_seconds));
  const [editingSchedule, setEditingSchedule] = useState<Date | null>(
    item.scheduled_start_date && item.scheduled_start_time 
      ? new Date(`${item.scheduled_start_date}T${item.scheduled_start_time}`)
      : null
  );

  // Refs for input fields
  const titleInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDuration && durationInputRef.current) {
      durationInputRef.current.focus();
      durationInputRef.current.select();
    }
  }, [isEditingDuration]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor,
    border: borderColor ? `2px solid ${borderColor}` : undefined,
    borderRadius: borderColor ? '8px' : undefined,
  };

  const handlePlay = () => {
    // Just emit the event - backend handles the actual timer start logic
    events?.onTimerStart?.(item);
  };

  const handlePause = () => {
    // Just emit the event - backend handles the actual timer pause logic
    events?.onTimerPause?.(item);
  };

  const handleStop = () => {
    // Just emit the event - backend handles the actual timer stop/reset logic
    events?.onTimerStop?.(item);
  };

  const handleDoubleClick = () => {
    onSelectTimer(item.id);
  };

  // Title editing handlers
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
    setEditingTitle(item.title);
  };

  const handleTitleSubmit = () => {
    if (editingTitle.trim() && editingTitle !== item.title) {
      onUpdateTimer(item.id, { title: editingTitle.trim() });
      events?.onTimerEdit?.(item, 'title', editingTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditingTitle(item.title);
      setIsEditingTitle(false);
    }
  };

  // Duration editing handlers
  const handleDurationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDuration(true);
    setEditingDuration(formatDuration(item.duration_seconds));
  };

  const handleDurationSubmit = () => {
    const newDurationSeconds = parseDuration(editingDuration);
    if (newDurationSeconds > 0 && newDurationSeconds !== item.duration_seconds) {
      const updates = {
        duration_seconds: newDurationSeconds,
        current_time_seconds: item.is_stopped ? newDurationSeconds : item.current_time_seconds,
      };
      onUpdateTimer(item.id, updates);
      events?.onTimerEdit?.(item, 'duration_seconds', newDurationSeconds);
    }
    setIsEditingDuration(false);
  };

  const handleDurationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDurationSubmit();
    } else if (e.key === 'Escape') {
      setEditingDuration(formatDuration(item.duration_seconds));
      setIsEditingDuration(false);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,2}:?\d{0,2}$/.test(value)) {
      setEditingDuration(value);
    }
  };

  // Schedule editing handlers
  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingSchedule(true);
    setEditingSchedule(
      item.scheduled_start_date && item.scheduled_start_time 
        ? new Date(`${item.scheduled_start_date}T${item.scheduled_start_time}`)
        : new Date()
    );
  };

  const handleScheduleSubmit = (date: Date | null) => {
    if (date) {
      const dateStr = dayjs(date).format('YYYY-MM-DD');
      const timeStr = dayjs(date).format('HH:mm:ss');
      const updates = { 
        scheduled_start_date: dateStr,
        scheduled_start_time: timeStr,
        is_manual_start: false,
      };
      onUpdateTimer(item.id, updates);
      events?.onTimerEdit?.(item, 'schedule', { date: dateStr, time: timeStr });
    } else {
      const updates = { 
        scheduled_start_date: null,
        scheduled_start_time: null,
        is_manual_start: true,
      };
      onUpdateTimer(item.id, updates);
      events?.onTimerEdit?.(item, 'schedule', null);
    }
    setIsEditingSchedule(false);
  };

  return (
    <Tooltip label="Double-click to select timer" position="top" withArrow>
      <div
        className={cx(classes.item, {
          [classes.itemDragging]: isDragging,
          [classes.itemSelected]: item.is_selected,
        })}
        ref={setNodeRef}
        style={style}
        onDoubleClick={handleDoubleClick}
        {...attributes}
      >
        <Tooltip label="Drag to reorder" position="top" withArrow>
          <div className={classes.dragHandle} {...listeners}>
            <IconGripVertical size={18} stroke={1.5} />
          </div>
        </Tooltip>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isEditingTitle ? (
              <TextInput
                ref={titleInputRef}
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                size="sm"
                style={{ minWidth: '150px', maxWidth: '300px' }}
                variant="unstyled"
              />
            ) : (
              <Tooltip label="Click to edit timer name • Double-click anywhere to select timer" position="top" withArrow>
                <Text
                  style={{ cursor: 'pointer' }}
                  onClick={handleTitleClick}
                >
                  {item.title}
                </Text>
              </Tooltip>
            )}
            {item.notes && (
              <HoverCard width={320} shadow="md" withArrow>
                <HoverCard.Target>
                  <Button variant="subtle" size="compact-xs" color="gray">
                    <IconNotes size="0.8rem" />
                  </Button>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="sm">{item.notes}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            )}
            {!item.is_manual_start && (
              <Text c="teal" size="xs">Autostart: ON</Text>
            )}
            {timerState !== 'normal' && (
              <Text c={timerState === 'critical' ? 'red' : 'orange'} size="xs" fw={600}>
                {timerState.toUpperCase()}
              </Text>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Text c="dimmed" size="sm">Duration:</Text>
              {isEditingDuration ? (
                <TextInput
                  ref={durationInputRef}
                  value={editingDuration}
                  onChange={handleDurationChange}
                  onBlur={handleDurationSubmit}
                  onKeyDown={handleDurationKeyDown}
                  size="sm"
                  style={{ width: '60px' }}
                  variant="unstyled"
                  placeholder="MM:SS"
                />
              ) : (
                <Tooltip label="Click to edit duration (MM:SS)" position="top" withArrow>
                  <Text c="dimmed" size="sm" style={{ cursor: 'pointer' }} onClick={handleDurationClick}>
                    {formatDuration(item.duration_seconds)}
                  </Text>
                </Tooltip>
              )}
            </div>
            {item.is_active && (
              <Text c={timerState === 'critical' ? 'red' : timerState === 'warning' ? 'orange' : 'blue'} size="sm" fw={600}>
                Remaining: {formatDuration(item.current_time_seconds)}
              </Text>
            )}
            {(item.scheduled_start_time || item.scheduled_start_date) && !isEditingSchedule && (
              <Tooltip label="Click to edit schedule" position="top" withArrow>
                <Text c="violet" size="xs" style={{ cursor: 'pointer' }} onClick={handleScheduleClick}>
                  Scheduled: {item.scheduled_start_date} {item.scheduled_start_time}
                </Text>
              </Tooltip>
            )}
            {!item.scheduled_start_time && !item.scheduled_start_date && !isEditingSchedule && (
              <Tooltip label="Click to set schedule" position="top" withArrow>
                <Text c="dimmed" size="xs" style={{ cursor: 'pointer' }} onClick={handleScheduleClick}>
                  Set schedule
                </Text>
              </Tooltip>
            )}
            {isEditingSchedule && (
              <DateTimePicker
                value={editingSchedule}
                onChange={handleScheduleSubmit}
                placeholder="Pick date and time"
                size="xs"
                clearable
                withSeconds={false}
              />
            )}
          </div>
        </div>
        <Group gap="xs">
          <Tooltip label="Start timer" position="top" withArrow>
            <Button size="xs" variant="light" color="teal" onClick={handlePlay} disabled={item.is_active && !item.is_paused}>
              <IconPlayerPlay size={14} />
            </Button>
          </Tooltip>
          <Tooltip label="Pause timer" position="top" withArrow>
            <Button size="xs" variant="light" color="yellow" onClick={handlePause} disabled={!item.is_active || item.is_paused}>
              <IconPlayerPause size={14} />
            </Button>
          </Tooltip>
          <Tooltip label="Stop/Reset timer" position="top" withArrow>
            <Button size="xs" variant="light" color="red" onClick={handleStop} disabled={item.is_stopped}>
              <IconRestore size={14} />
            </Button>
          </Tooltip>
          <Tooltip label="Advanced settings" position="top" withArrow>
            <Button size="xs" variant="light" color="gray" onClick={() => onOpenSettings(item)}>
              <IconSettings size={14} />
            </Button>
          </Tooltip>
        </Group>
      </div>
    </Tooltip>
  );
}

export function Timers({
  timers,
  events,
  className,
  showConflictAlerts = true
}: TimersProps) {
  // Use provided timers or fall back to mock data
  const initialTimers = timers || [...mockTimers].sort((a, b) => a.room_sequence_order - b.room_sequence_order);
  const [state, handlers] = useListState<Timer>(initialTimers);
  
  // Update state when props change
  useEffect(() => {
    if (timers) {
      handlers.setState([...timers].sort((a, b) => a.room_sequence_order - b.room_sequence_order));
    }
  }, [timers, handlers]);

  const overlaps = checkForOverlaps(state);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Emit schedule conflicts
  useEffect(() => {
    if (overlaps.length > 0) {
      events?.onScheduleConflict?.(overlaps);
    }
  }, [overlaps, events]);

  // Note: All timer logic (countdown, state transitions, auto-start) is handled by backend
  // This component only displays current state and handles user interactions

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.findIndex((item) => item.room_sequence_order === active.id);
    const newIndex = state.findIndex((item) => item.room_sequence_order === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newState = arrayMove(state, oldIndex, newIndex).map((item, index) => ({
        ...item,
        room_sequence_order: index + 1,
      }));
      handlers.setState(newState);
      events?.onTimerReorder?.(newState);
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
    const updatedState = state.map(timer => ({
      ...timer,
      is_selected: timer.id === id ? !timer.is_selected : false
    }));
    handlers.setState(updatedState);
    
    const selectedTimer = updatedState.find(timer => timer.id === id);
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
      speaker: '',
      notes: '',
      warning_time: 60,
      critical_time: 30,
      show_title: true,
      show_speaker: true,
      show_notes: false,
    },
    validate: {
      warning_time: (value) => (value <= 0 ? 'Warning time must be positive' : null),
      critical_time: (value, values) => 
        value <= 0 ? 'Critical time must be positive' : 
        value >= values.warning_time ? 'Critical time must be less than warning time' : null,
    },
  });

  useEffect(() => {
    if (editingTimer) {
      form.setValues({
        speaker: editingTimer.speaker || '',
        notes: editingTimer.notes || '',
        warning_time: editingTimer.warning_time || 60,
        critical_time: editingTimer.critical_time || 30,
        show_title: editingTimer.show_title ?? true,
        show_speaker: editingTimer.show_speaker ?? true,
        show_notes: editingTimer.show_notes ?? false,
      });
    }
  }, [editingTimer, form]);

  const handleAdvancedSubmit = (values: typeof form.values) => {
    if (editingTimer) {
      handleUpdateTimer(editingTimer.id, values);
      events?.onTimerEdit?.(editingTimer, 'advanced_settings', values);
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
        <SortableContext items={state.map((i) => i.room_sequence_order)} strategy={verticalListSortingStrategy}>
          {state.map((item) => (
            <SortableItem 
              key={item.id} 
              item={item} 
              onUpdateTimer={handleUpdateTimer} 
              onSelectTimer={handleSelectTimer}
              onOpenSettings={handleOpenSettings}
              events={events}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Drawer opened={opened} onClose={close} title="Advanced Settings">
        {editingTimer && (
          <form onSubmit={form.onSubmit(handleAdvancedSubmit)}>
            <Stack>
              <TextInput label="Speaker" {...form.getInputProps('speaker')} />
              <Textarea label="Notes" {...form.getInputProps('notes')} />
              <NumberInput label="Warning Time (seconds)" min={0} {...form.getInputProps('warning_time')} />
              <NumberInput label="Critical Time (seconds)" min={0} {...form.getInputProps('critical_time')} />
              <Checkbox label="Show Title" {...form.getInputProps('show_title', { type: 'checkbox' })} />
              <Checkbox label="Show Speaker" {...form.getInputProps('show_speaker', { type: 'checkbox' })} />
              <Checkbox label="Show Notes" {...form.getInputProps('show_notes', { type: 'checkbox' })} />
              <Button type="submit">Save Changes</Button>
            </Stack>
          </form>
        )}
      </Drawer>
    </div>
  );
}