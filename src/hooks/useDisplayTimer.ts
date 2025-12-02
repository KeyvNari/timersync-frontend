import { useMemo } from 'react';

interface Timer {
  id: number;
  is_active: boolean;
  is_paused?: boolean;
  display_id?: number;
  title: string;
  speaker?: string;
  notes?: string;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  timer_type?: string;
  duration_seconds: number;
  current_time_seconds: number;
  is_finished?: boolean;
  is_stopped?: boolean;
  warning_time: number;
  critical_time: number;
  timer_format?: string;
}

interface DisplayTimer {
  title: string;
  speaker?: string;
  notes?: string;
  display_id?: number;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  timer_type: 'countdown' | 'countup';
  duration_seconds: number;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_stopped: boolean;
  current_time_seconds: number;
  warning_time: number;
  critical_time: number;
  timer_format?: string | null;
}

/**
 * Hook to select and convert the appropriate timer for display
 * Memoizes both selection and conversion logic
 */
export function useDisplayTimer(
  timers: Timer[],
  selectedTimerId?: number
): {
  selectedTimer: Timer | undefined;
  activeTimer: Timer | undefined;
  displayTimer: Timer | undefined;
  convertedTimer: DisplayTimer | undefined;
  isAnyTimerRunning: boolean;
} {
  return useMemo(() => {
    const selected = selectedTimerId ? timers?.find(t => t.id === selectedTimerId) : undefined;
    const active = timers?.find(t => t.is_active);
    const display = selected || active || timers?.[0];
    const running = timers?.some(t => t.is_active && !t.is_paused) || false;

    const converted: DisplayTimer | undefined = display
      ? {
          title: display.title,
          speaker: display.speaker,
          notes: display.notes,
          display_id: display.display_id,
          show_title: display.show_title,
          show_speaker: display.show_speaker,
          show_notes: display.show_notes,
          timer_type: (display.timer_type || 'countdown') as 'countdown' | 'countup',
          duration_seconds: display.duration_seconds,
          is_active: display.is_active || false,
          is_paused: display.is_paused || false,
          is_finished: display.is_finished || false,
          is_stopped: display.is_stopped || false,
          current_time_seconds: display.current_time_seconds,
          warning_time: display.warning_time,
          critical_time: display.critical_time,
          timer_format: display.timer_format,
        }
      : undefined;

    return {
      selectedTimer: selected,
      activeTimer: active,
      displayTimer: display,
      convertedTimer: converted,
      isAnyTimerRunning: running,
    };
  }, [timers, selectedTimerId]);
}
