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
import { Drawer, Textarea, NumberInput, Checkbox, Stack, Paper, Title, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Select } from '@mantine/core';
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

  // State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  // Inline editing functions
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField && editValue !== '') {
      if (editingField === 'duration_seconds') {
        const seconds = parseDuration(editValue);
        if (seconds > 0) {
          onUpdateTimer(item.id, { [editingField]: seconds });
          events?.onTimerEdit?.(item, editingField, seconds);
        }
      } else {
        onUpdateTimer(item.id, { [editingField]: editValue });
        events?.onTimerEdit?.(item, editingField, editValue);
      }
    }
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
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
              <Text style={{ cursor: 'pointer' }} onClick={() => startEditing('title', item.title)}>
                {item.title}
              </Text>
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
            {item.speaker && (
              <Text c="dimmed" size="xs">
                Speaker: {editingField === 'speaker' ? (
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
                  <span style={{ cursor: 'pointer' }} onClick={() => startEditing('speaker', item.speaker || '')}>
                    {item.speaker}
                  </span>
                )}
              </Text>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Text c="dimmed" size="sm">
              Duration: {editingField === 'duration_seconds' ? (
                <TextInput
                  value={editValue}
                  onChange={(e) => setEditValue(e.currentTarget.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  size="xs"
                  placeholder="MM:SS"
                  style={{ minWidth: '80px', display: 'inline-block' }}
                  autoFocus
                />
              ) : (
                <span style={{ cursor: 'pointer' }} onClick={() => startEditing('duration_seconds', formatDuration(item.duration_seconds))}>
                  {formatDuration(item.duration_seconds)}
                </span>
              )}
            </Text>
            {item.is_active && (
              <Text c={timerState === 'critical' ? 'red' : timerState === 'warning' ? 'orange' : 'blue'} size="sm" fw={600}>
                Remaining: {formatDuration(item.current_time_seconds)}
              </Text>
            )}
            {item.scheduled_start_time && item.scheduled_start_date && (
              <Text c="violet" size="xs">
                Scheduled: {item.scheduled_start_date} {item.scheduled_start_time}
              </Text>
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
      title: '',
      speaker: '',
      duration_seconds: 0,
      scheduled_start_time: null as Date | null,
      is_manual_start: true,
      linked_timer_id: null as string | null,
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
        duration_seconds: editingTimer.duration_seconds,
        scheduled_start_time: editingTimer.scheduled_start_date && editingTimer.scheduled_start_time
          ? new Date(`${editingTimer.scheduled_start_date}T${editingTimer.scheduled_start_time}`)
          : null,
        is_manual_start: editingTimer.is_manual_start,
        linked_timer_id: editingTimer.linked_timer_id ? editingTimer.linked_timer_id.toString() : null,
        notes: editingTimer.notes || '',
        warning_time: editingTimer.warning_time || 60,
        critical_time: editingTimer.critical_time || 30,
        overtime_seconds: editingTimer.overtime_seconds || 0,
        show_title: editingTimer.show_title ?? true,
        show_speaker: editingTimer.show_speaker ?? true,
        show_notes: editingTimer.show_notes ?? false,
      });
    }
  }, [editingTimer]);

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
        linked_timer_id: values.linked_timer_id ? parseInt(values.linked_timer_id, 10) : null,
      };
      // Remove the Date field and add the string fields
      const { scheduled_start_time: dateValue, ...finalValues } = transformedValues;

      handleUpdateTimer(editingTimer.id, finalValues as Partial<Timer>);
      events?.onTimerEdit?.(editingTimer, 'advanced_settings', finalValues);
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

      {/* Updated Drawer with wider size and organized categories */}
      <Drawer 
        opened={opened} 
        onClose={close} 
        title="Timer Settings"
        size="lg" 
        position="right"
      >
        {editingTimer && (
          <form onSubmit={form.onSubmit(handleAdvancedSubmit)}>
            <Stack gap="lg">
              {/* Basic Information Category */}
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Basic Information</Title>
                <Stack gap="md">
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
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Timer Configuration</Title>
                <Stack gap="md">
                  <NumberInput 
                    label="Duration (seconds)" 
                    placeholder="Enter duration in seconds"
                    min={1} 
                    {...form.getInputProps('duration_seconds')} 
                  />
                 
                  <Select
                    label="Linked Timer"
                    placeholder="Select a timer to link"
                    clearable
                    data={state
                      .filter(timer => timer.id !== editingTimer.id)
                      .map(timer => ({
                        value: timer.id.toString(),
                        label: timer.title
                      }))}
                    {...form.getInputProps('linked_timer_id')}
                  />
                </Stack>
              </Paper>

              {/* Scheduling Category */}
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Scheduling</Title>
                <Stack gap="md">
                  <DateTimePicker
                    label="Scheduled Start Time"
                    placeholder="Pick date and time"
                    clearable
                    withSeconds={false}
                    {...form.getInputProps('scheduled_start_time')}
                  />
                  <Checkbox 
                    label="Manual Start" 
                    description="Require manual start instead of automatic scheduling"
                    {...form.getInputProps('is_manual_start', { type: 'checkbox' })} 
                  />
                </Stack>
              </Paper>

              {/* Alerts & Warnings Category */}
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Alerts & Warnings</Title>
                <Stack gap="md">
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
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Display Options</Title>
                <Stack gap="md">
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
    </div>
  );
}