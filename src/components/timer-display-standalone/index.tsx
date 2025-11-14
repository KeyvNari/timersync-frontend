import { useState, useEffect, useRef } from 'react';
import { Text, Image, Flex, Stack, Progress, Box, RingProgress, ActionIcon } from '@mantine/core';
import { Maximize, Minimize } from 'lucide-react';

// CSS for flashing animation and fullscreen styling
const messageStyles = `
  @keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Remove black backdrop in fullscreen mode */
  *:fullscreen::backdrop {
    background-color: transparent !important;
  }

  /* Also handle webkit variant */
  *:-webkit-full-screen::backdrop {
    background-color: transparent !important;
  }
`;

type Display = {
  name: string;
  logo_image?: string | null;
  logo_size_percent?: number | null;
  logo_position?: string | null;
  timer_format?: string | null;
  timer_font_family?: string | null;
  timer_color?: string | null;
  time_of_day_color?: string | null;
  timer_text_style?: string | null;
  timer_size_percent?: number | null;
  timer_position?: 'center' | 'top' | 'bottom' | null;
  auto_hide_completed?: boolean;
  clock_format?: string | null;
  clock_font_family?: string | null;
  clock_color?: string | null;
  clock_visible?: boolean;
  message_font_family?: string | null;
  message_color?: string | null;
  title_display_location?: string | null;
  speaker_display_location?: string | null;
  next_cue_display_location?: string | null;
  header_font_family?: string | null;
  header_color?: string | null;
  footer_font_family?: string | null;
  footer_color?: string | null;
  theme_name?: string | null;
  text_style?: string | null;
  display_ratio?: string | null;
  background_type?: string | null;
  background_color?: string | null;
  background_image?: string | null;
  background_preset?: string | null;
  progress_style?: string | null;
  progress_color_main?: string | null;
  progress_color_secondary?: string | null;
  progress_color_tertiary?: string | null;
};

type Timer = {
  title: string;
  speaker?: string | null;
  notes?: string | null;
  display_id?: number | null;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  timer_type: 'countdown' | 'countup';
  duration_seconds?: number | null;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_stopped: boolean;
  current_time_seconds: number;
  warning_time?: number | null;
  critical_time?: number | null;
  timer_format?: string | null;
  // Fields needed for client-side calculation
  started_at?: string | null;
  actual_start_time?: string | null;
  paused_at?: string | null;
  accumulated_seconds?: number;
};

type Message = {
  id: string;
  date: string;
  content: string;
  color?: string | null;
  is_focused?: boolean;
  is_flashing?: boolean;
  is_showing: boolean;
};

function TimerDisplayStandalone({
  display,
  timer,
  in_view_mode = false,
  message
}: {
  display?: Display;
  timer?: Timer;
  in_view_mode?: boolean;
  message?: Message;
}) {
  const defaultDisplay: Display = {
    name: 'Timer Display',
    logo_image: null,
    logo_size_percent: 60,
    logo_position: 'top_left',
    timer_format: 'mm:ss',
    timer_font_family: 'Roboto Mono',
    timer_color: '#ffffff',
    time_of_day_color: '#ffffff',
    timer_text_style: 'default',
    timer_size_percent: 100,
    timer_position: 'center',
    auto_hide_completed: false,
    clock_format: 'browser_default',
    clock_font_family: 'Roboto Mono',
    clock_color: '#ffffff',
    clock_visible: false,
    message_font_family: 'Roboto Mono',
    message_color: '#ffffff',
    title_display_location: 'header',
    speaker_display_location: 'footer',
    header_font_family: 'Roboto Mono',
    header_color: '#ffffff',
    footer_font_family: 'Roboto Mono',
    footer_color: '#ffffff',
    theme_name: 'default',
    text_style: 'default',
    display_ratio: '16:9',
    background_type: 'transparent',
    background_color: '#000000',
    background_image: null,
    background_preset: null,
    progress_style: 'bottom_bar',
    progress_color_main: 'green',
    progress_color_secondary: 'orange',
    progress_color_tertiary: 'red',
  };

  const defaultTimer: Timer = {
    title: 'Default Timer',
    speaker: null,
    notes: null,
    show_title: true,
    show_speaker: false,
    show_notes: false,
    timer_type: 'countdown',
    duration_seconds: 600,
    is_active: false,
    is_paused: false,
    is_finished: false,
    is_stopped: false,
    current_time_seconds: 0,
  };

  // Local state for client-side timer calculation
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [calculationBase, setCalculationBase] = useState<{
    actual_start_time: Date | null;
    accumulated_seconds: number;
    paused_at: Date | null;
  } | null>(null);

  useEffect(() => {
    console.log('⏱️ TimerDisplayStandalone received update:', {
      current_time: timer?.current_time_seconds,
      is_active: timer?.is_active
    });
  }, [timer?.current_time_seconds, timer?.is_active]);

  const safeDisplay = display ?? defaultDisplay;
  const safeTimer = timer ?? defaultTimer;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with backend ONLY on state changes (not on current_time updates)
  useEffect(() => {
    if (!timer) return;

    // Update calculation base for running timer
    if (timer.is_active && !timer.is_paused) {
      const newBase = {
        actual_start_time: timer.actual_start_time
          ? new Date(timer.actual_start_time)
          : null,
        accumulated_seconds: timer.accumulated_seconds || 0,
        paused_at: null
      };

      // Always update calculation base when timer is running - no need for baseChanged check
      // This ensures the interval effect always has the correct base
      setCalculationBase(newBase);
      // Force immediate sync to backend value after adjustment
      setLocalCurrentTime(timer.current_time_seconds);
      console.log('🔄 Timer running, updating calculation base:', {
        actual_start_time: newBase.actual_start_time?.toISOString(),
        accumulated_seconds: newBase.accumulated_seconds,
        current_time: timer.current_time_seconds
      });
    } else if (timer.is_paused && timer.paused_at) {
      setCalculationBase({
        actual_start_time: timer.actual_start_time
          ? new Date(timer.actual_start_time)
          : null,
        accumulated_seconds: timer.accumulated_seconds || 0,
        paused_at: new Date(timer.paused_at)
      });
      // Use backend value for paused timer
      setLocalCurrentTime(timer.current_time_seconds);
    } else {
      // Stopped/inactive - use backend value directly
      setLocalCurrentTime(timer.current_time_seconds);
      setCalculationBase(null);
    }
  }, [timer?.is_active, timer?.is_paused, timer?.actual_start_time, timer?.accumulated_seconds, timer?.paused_at, timer?.current_time_seconds];

  // Client-side calculation (runs every 100ms for smooth display)
  // MODIFIED: Removed drift detection to prevent resets
  useEffect(() => {
    // Only calculate if timer is active and not paused
    if (!timer?.is_active || timer.is_paused || !calculationBase?.actual_start_time) {
      // Use backend value for stopped/paused timers
      setLocalCurrentTime(timer?.current_time_seconds || 0);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();

      // Calculate session seconds since actual_start_time
      const sessionSeconds = Math.floor(
        (now.getTime() - calculationBase.actual_start_time!.getTime()) / 1000
      );

      // Total elapsed = accumulated + current session
      const totalElapsed = calculationBase.accumulated_seconds + sessionSeconds;

      // Calculate current_time based on timer_type
      let calculatedTime: number;
      if (timer.timer_type === 'countdown') {
        // countdown: current_time = duration - total_elapsed
        calculatedTime = (timer.duration_seconds || 0) - totalElapsed;
      } else {
        // countup: current_time = total_elapsed
        calculatedTime = totalElapsed;
      }

      // MODIFICATION: No drift detection - just use the calculated time
      // This prevents the component from resetting when props update
      setLocalCurrentTime(calculatedTime);
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(intervalId);
  }, [
    timer?.is_active,
    timer?.is_paused,
    timer?.timer_type,
    timer?.duration_seconds,
    calculationBase?.actual_start_time?.toISOString(),
    calculationBase?.accumulated_seconds,
    calculationBase?.paused_at?.toISOString()
  ]);

  // Separate interval only for date/clock updates
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

 const handleMouseMove = (e: React.MouseEvent) => {
    if (!in_view_mode) return;

    // Check if mouse is over the controls area
    const controlsElement = e.currentTarget.querySelector('[data-controls]');
    if (controlsElement && controlsElement.contains(e.target as Node)) {
      return; // Don't set hide timeout if hovering over controls
    }

    setShowControls(true);

    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 4000);

    setHideTimeout(timeout);
  };

  const handleControlsMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handleControlsMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 1000);

    setHideTimeout(timeout);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      await document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number, formatStr: string) => {
    const isOvertime = seconds < 0;
    const absSeconds = Math.floor(Math.abs(seconds));
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;

    // Auto-switch to hh:mm:ss format if time exceeds 60 minutes
    const totalMinutes = Math.floor(absSeconds / 60);
    const shouldUseHourFormat = totalMinutes >= 60;

    let timeStr = '';
    if (shouldUseHourFormat || formatStr.includes('h')) {
      timeStr = [h, m, s].map(n => n.toString().padStart(2, '0')).join(':');
    } else {
      timeStr = [m, s].map(n => n.toString().padStart(2, '0')).join(':');
    }

    return isOvertime ? `+${timeStr}` : timeStr;
  };

  const formatClock = () => {
    if (safeDisplay.clock_format === 'browser_default' || !safeDisplay.clock_format) {
      return currentDate.toLocaleTimeString();
    }
    return currentDate.toLocaleTimeString();
  };

  const getCurrentProgressColor = () => {
    if (safeTimer.timer_type === 'countdown' && safeTimer.duration_seconds) {
      const warningTime = safeTimer.warning_time || safeTimer.duration_seconds * 0.3;
      const criticalTime = safeTimer.critical_time || safeTimer.duration_seconds * 0.1;

      if (currentTimeSeconds < 0) {
        return safeDisplay.progress_color_tertiary || 'red';
      } else if (currentTimeSeconds <= criticalTime) {
        return safeDisplay.progress_color_tertiary || 'red';
      } else if (currentTimeSeconds <= warningTime) {
        return safeDisplay.progress_color_secondary || 'yellow';
      } else {
        return safeDisplay.progress_color_main || 'green';
      }
    } else if (safeTimer.timer_type === 'countup' && safeTimer.duration_seconds) {
      if (safeTimer.critical_time && currentTimeSeconds >= safeTimer.critical_time) {
        return safeDisplay.progress_color_tertiary || 'red';
      } else if (safeTimer.warning_time && currentTimeSeconds >= safeTimer.warning_time) {
        return safeDisplay.progress_color_secondary || 'yellow';
      } else {
        return safeDisplay.progress_color_main || 'green';
      }
    }
    return safeDisplay.progress_color_main || 'green';
  };

  const getTimerColor = () => {
    const progressColor = getCurrentProgressColor();

    if (progressColor === (safeDisplay.progress_color_main || 'green')) {
      return safeDisplay.timer_color || '#ffffff';
    }

    return progressColor;
  };

  // Use localCurrentTime for display instead of backend current_time_seconds
  const currentTimeSeconds = localCurrentTime;

  const timerText = formatTime(currentTimeSeconds, safeTimer.timer_format || safeDisplay.timer_format || 'mm:ss');
  const clockText = formatClock();
  const showTimer = !(safeDisplay.auto_hide_completed && safeTimer.is_finished);
  const showOnlyClock = !showTimer && safeDisplay.clock_visible;

const backgroundStyle: React.CSSProperties = {};
switch (safeDisplay.background_type || 'color') {
  case 'color':
    backgroundStyle.backgroundColor = safeDisplay.background_color || '#000000';
    break;
  case 'image':
    if (safeDisplay.background_image) {
      backgroundStyle.backgroundImage = `url(${safeDisplay.background_image})`;
      backgroundStyle.backgroundSize = 'cover';
      backgroundStyle.backgroundPosition = 'center';
    }
    break;
  case 'transparent':
    backgroundStyle.backgroundColor = 'transparent';
    break;
  case 'preset':
    backgroundStyle.backgroundColor = '#1a1b1e';
    break;
}


  let mainSection = 0;
  let progressColor = safeDisplay.progress_color_main || 'green';

  if (safeTimer.duration_seconds && safeTimer.duration_seconds > 0) {
    if (safeTimer.timer_type === 'countdown') {
      let remaining = currentTimeSeconds;
      if (remaining < 0) {
        mainSection = 0;
      } else {
        mainSection = (remaining / safeTimer.duration_seconds) * 100;
      }
      progressColor = getCurrentProgressColor();
    } else {
      let progressValue = (currentTimeSeconds / safeTimer.duration_seconds) * 100;
      if (progressValue > 100) progressValue = 100;
      mainSection = progressValue;
      progressColor = getCurrentProgressColor();
    }
  }

  const baseFontSize = (safeDisplay.timer_size_percent || 100) / 100;
  const timerStyle: React.CSSProperties = {
    fontFamily: safeDisplay.timer_font_family || 'Roboto Mono',
    color: getTimerColor(),
    fontSize: `${baseFontSize * 42}rem`,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  switch (safeDisplay.timer_text_style || 'default') {
    case 'outline':
      timerStyle.WebkitTextStroke = '2px black';
      timerStyle.color = 'transparent';
      break;
    case 'shadow':
      timerStyle.textShadow = '4px 4px 8px rgba(0,0,0,0.7)';
      break;
  }

  const clockStyle: React.CSSProperties = {
    fontFamily: safeDisplay.clock_font_family || 'Roboto Mono',
    color: safeDisplay.clock_color || safeDisplay.time_of_day_color || '#ffffff',
    fontSize: showOnlyClock ? `${baseFontSize * 4}rem` : '2rem',
    textAlign: 'center',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  // Apply size limits in small view mode
  let logoSize = safeDisplay.logo_size_percent || 60;
  // In small view (not in view_mode and not fullscreen), cap logo size at 100px maximum
  if (!in_view_mode && !isFullscreen) {
    logoSize = Math.min(logoSize, 100);
  }

  const logoStyle: React.CSSProperties = {
    position: 'absolute',
    maxWidth: `${logoSize}px`,
    maxHeight: `${logoSize}px`,
    objectFit: 'contain',
    zIndex: 10,
  };

  switch (safeDisplay.logo_position || 'top_left') {
    case 'top_left':
      logoStyle.top = 5;
      logoStyle.left = 20;
      break;
    case 'top_right':
      logoStyle.top = 5;
      logoStyle.right = 20;
      break;
    case 'bottom_left':
      logoStyle.bottom = 20;
      logoStyle.left = 20;
      break;
    case 'bottom_right':
      logoStyle.bottom = 20;
      logoStyle.right = 20;
      break;
  }

  let progressComponent = null;
  const progressStyle = safeDisplay.progress_style || 'bottom_bar';

  if (progressStyle !== 'hidden') {
    if (progressStyle === 'bottom_bar' || progressStyle === 'top_bar') {
      let sections = [];

      if (safeTimer.duration_seconds && safeTimer.duration_seconds > 0) {
        const warningTime = safeTimer.warning_time || safeTimer.duration_seconds * 0.3;
        const criticalTime = safeTimer.critical_time || safeTimer.duration_seconds * 0.1;

        if (safeTimer.timer_type === 'countdown') {
          const redPercent = (criticalTime / safeTimer.duration_seconds) * 100;
          const yellowPercent = ((warningTime - criticalTime) / safeTimer.duration_seconds) * 100;
          const greenPercent = ((safeTimer.duration_seconds - warningTime) / safeTimer.duration_seconds) * 100;

          const currentPercent = mainSection;
          let redFilled = 0;
          let yellowFilled = 0;
          let greenFilled = 0;

          if (currentPercent > (redPercent + yellowPercent)) {
            greenFilled = currentPercent - (redPercent + yellowPercent);
            yellowFilled = yellowPercent;
            redFilled = redPercent;
          } else if (currentPercent > redPercent) {
            yellowFilled = currentPercent - redPercent;
            redFilled = redPercent;
            greenFilled = 0;
          } else {
            redFilled = currentPercent;
            yellowFilled = 0;
            greenFilled = 0;
          }

          sections = [
            { value: redFilled, color: safeDisplay.progress_color_tertiary || 'red' },
            { value: redPercent - redFilled, color: 'gray' },
            { value: yellowFilled, color: safeDisplay.progress_color_secondary || 'yellow' },
            { value: yellowPercent - yellowFilled, color: 'gray' },
            { value: greenFilled, color: safeDisplay.progress_color_main || 'green' },
            { value: greenPercent - greenFilled, color: 'gray' },
          ].filter(s => s.value > 0);
        } else {
          const greenPercent = (warningTime / safeTimer.duration_seconds) * 100;
          const yellowPercent = ((criticalTime - warningTime) / safeTimer.duration_seconds) * 100;
          const redPercent = ((safeTimer.duration_seconds - criticalTime) / safeTimer.duration_seconds) * 100;

          const currentPercent = mainSection;
          let greenFilled = 0;
          let yellowFilled = 0;
          let redFilled = 0;

          if (currentPercent > (greenPercent + yellowPercent)) {
            greenFilled = greenPercent;
            yellowFilled = yellowPercent;
            redFilled = currentPercent - (greenPercent + yellowPercent);
          } else if (currentPercent > greenPercent) {
            greenFilled = greenPercent;
            yellowFilled = currentPercent - greenPercent;
            redFilled = 0;
          } else {
            greenFilled = currentPercent;
            yellowFilled = 0;
            redFilled = 0;
          }

          sections = [
            { value: greenFilled, color: safeDisplay.progress_color_main || 'green' },
            { value: greenPercent - greenFilled, color: 'gray' },
            { value: yellowFilled, color: safeDisplay.progress_color_secondary || 'yellow' },
            { value: yellowPercent - yellowFilled, color: 'gray' },
            { value: redFilled, color: safeDisplay.progress_color_tertiary || 'red' },
            { value: redPercent - redFilled, color: 'gray' },
          ].filter(s => s.value > 0);
        }
      } else {
        sections = [{ value: 100, color: safeDisplay.progress_color_main || 'green' }];
      }

      progressComponent = (
        <Box style={{ position: 'relative' }}>
          <Progress.Root size="xl" radius="xs">
            {sections.map((section, index) => (
              <Progress.Section
                key={index}
                value={section.value}
                color={section.color}
              />
            ))}
          </Progress.Root>
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: `${Math.max(0, Math.min(100, mainSection))}%`,
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '24px',
              backgroundColor: 'white',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        </Box>
      );
    } else if (progressStyle === 'ring') {
      let ringSections = [];

      if (safeTimer.duration_seconds && safeTimer.duration_seconds > 0) {
        const warningTime = safeTimer.warning_time || safeTimer.duration_seconds * 0.3;
        const criticalTime = safeTimer.critical_time || safeTimer.duration_seconds * 0.1;

        if (safeTimer.timer_type === 'countdown') {
          const redPercent = (criticalTime / safeTimer.duration_seconds) * 100;
          const yellowPercent = ((warningTime - criticalTime) / safeTimer.duration_seconds) * 100;
          const greenPercent = ((safeTimer.duration_seconds - warningTime) / safeTimer.duration_seconds) * 100;

          const currentPercent = mainSection;
          let redFilled = 0;
          let yellowFilled = 0;
          let greenFilled = 0;

          if (currentPercent > (redPercent + yellowPercent)) {
            greenFilled = currentPercent - (redPercent + yellowPercent);
            yellowFilled = yellowPercent;
            redFilled = redPercent;
          } else if (currentPercent > redPercent) {
            yellowFilled = currentPercent - redPercent;
            redFilled = redPercent;
            greenFilled = 0;
          } else {
            redFilled = currentPercent;
            yellowFilled = 0;
            greenFilled = 0;
          }

          ringSections = [
            { value: redFilled, color: safeDisplay.progress_color_tertiary || 'red' },
            { value: redPercent - redFilled, color: 'gray' },
            { value: yellowFilled, color: safeDisplay.progress_color_secondary || 'yellow' },
            { value: yellowPercent - yellowFilled, color: 'gray' },
            { value: greenFilled, color: safeDisplay.progress_color_main || 'green' },
            { value: greenPercent - greenFilled, color: 'gray' },
          ].filter(s => s.value > 0);
        } else {
          const greenPercent = (warningTime / safeTimer.duration_seconds) * 100;
          const yellowPercent = ((criticalTime - warningTime) / safeTimer.duration_seconds) * 100;
          const redPercent = ((safeTimer.duration_seconds - criticalTime) / safeTimer.duration_seconds) * 100;

          const currentPercent = mainSection;
          let greenFilled = 0;
          let yellowFilled = 0;
          let redFilled = 0;

          if (currentPercent > (greenPercent + yellowPercent)) {
            greenFilled = greenPercent;
            yellowFilled = yellowPercent;
            redFilled = currentPercent - (greenPercent + yellowPercent);
          } else if (currentPercent > greenPercent) {
            greenFilled = greenPercent;
            yellowFilled = currentPercent - greenPercent;
            redFilled = 0;
          } else {
            greenFilled = currentPercent;
            yellowFilled = 0;
            redFilled = 0;
          }

          ringSections = [
            { value: greenFilled, color: safeDisplay.progress_color_main || 'green' },
            { value: greenPercent - greenFilled, color: 'gray' },
            { value: yellowFilled, color: safeDisplay.progress_color_secondary || 'yellow' },
            { value: yellowPercent - yellowFilled, color: 'gray' },
            { value: redFilled, color: safeDisplay.progress_color_tertiary || 'red' },
            { value: redPercent - redFilled, color: 'gray' },
          ].filter(s => s.value > 0);
        }
      } else {
        ringSections = [{ value: 100, color: safeDisplay.progress_color_main || 'green' }];
      }

      // Calculate handle position on the ring
      // RingProgress starts at top (0deg) and goes clockwise
      const ringSize = 120;
      const ringThickness = 12;
      const angle = (mainSection / 100) * 360 - 90; // Convert to degrees, starting from top

      // Mantine's RingProgress has internal padding/spacing
      // The actual visual radius is smaller than ringSize/2
      // Position at the center of the ring stroke
      const strokeRadius = ringSize * 0.35; // Adjusted for Mantine's internal layout
      const handleX = strokeRadius * Math.cos((angle * Math.PI) / 180);
      const handleY = strokeRadius * Math.sin((angle * Math.PI) / 180);

      progressComponent = (
        <Box style={{ position: 'relative', display: 'inline-block' }}>
          <RingProgress
            sections={ringSections}
            size={ringSize}
            thickness={ringThickness}
            label={<Text size="sm" ta="center" c={getCurrentProgressColor()}>{Math.round(mainSection)}%</Text>}
          />
          {/* Handle indicator - vertical bar */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${handleX}px), calc(-50% + ${handleY}px)) rotate(${angle + 90}deg)`,
              width: '3px',
              height: `${ringThickness}px`,
              backgroundColor: 'white',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        </Box>
      );
    }
  }

  const headerItems: string[] = [];
  if (safeDisplay.title_display_location === 'header' && safeTimer.show_title) headerItems.push(safeTimer.title);
  if (safeDisplay.speaker_display_location === 'header' && safeTimer.show_speaker && safeTimer.speaker) headerItems.push(safeTimer.speaker);

  const footerItems: string[] = [];
  if (safeDisplay.title_display_location === 'footer' && safeTimer.show_title) footerItems.push(safeTimer.title);
  if (safeDisplay.speaker_display_location === 'footer' && safeTimer.show_speaker && safeTimer.speaker) footerItems.push(safeTimer.speaker);

  const header = headerItems.length > 0 ? (
    <Text size="lg" style={{ fontFamily: safeDisplay.header_font_family || 'Roboto Mono', color: safeDisplay.header_color || '#ffffff', textAlign: 'center' }}>
      {headerItems.join(' | ')}
    </Text>
  ) : null;

  const footer = footerItems.length > 0 ? (
    <Text size="lg" style={{ fontFamily: safeDisplay.footer_font_family || 'Roboto Mono', color: safeDisplay.footer_color || '#ffffff', textAlign: 'center' }}>
      {footerItems.join(' | ')}
    </Text>
  ) : null;

  // Use the message prop if provided, otherwise fall back to timer notes
  const timerNotesMessage = safeTimer.show_notes && safeTimer.notes ? safeTimer.notes : '';
  const displayMessage = message?.content || timerNotesMessage;

  // Debug logging
  useEffect(() => {
    console.log('📨 TimerDisplayStandalone - Message prop:', {
      message,
      displayMessage,
      timerNotesMessage,
      hasMessage: !!message,
      messageContent: message?.content,
      isShowing: message?.is_showing
    });
  }, [message, displayMessage]);

  // Determine message styling - use message properties if available, otherwise use display defaults
  const messageColor = message?.color || safeDisplay.message_color || '#ffffff';
  const messageFontFamily = safeDisplay.message_font_family || 'Roboto Mono';

  // Calculate font size based on message length with auto-adjustment
  const getMessageFontSize = (text: string, isFocused: boolean) => {
    const length = text.length;

    // In view mode (full screen or dedicated viewer), use larger fonts
    const isLargeView = in_view_mode || isFullscreen;

    if (isLargeView) {
      if (isFocused) {
        // Focused mode: much larger font that adjusts as text gets longer
        if (length < 30) return 'clamp(3rem, 8vw, 8rem)';
        if (length < 60) return 'clamp(2.5rem, 6vw, 6rem)';
        if (length < 100) return 'clamp(2rem, 5vw, 5rem)';
        if (length < 150) return 'clamp(1.5rem, 4vw, 4rem)';
        return 'clamp(1.2rem, 3vw, 3rem)';
      } else {
        // Normal mode: much larger than before, with auto-adjustment
        if (length < 30) return 'clamp(2rem, 5vw, 5rem)';
        if (length < 60) return 'clamp(1.5rem, 4vw, 4rem)';
        if (length < 100) return 'clamp(1.2rem, 3vw, 3rem)';
        if (length < 150) return 'clamp(1rem, 2.5vw, 2.5rem)';
        return 'clamp(0.9rem, 2vw, 2rem)';
      }
    } else {
      // Small preview mode (room controller, etc): use smaller fixed sizes
      if (isFocused) {
        if (length < 30) return '0.9rem';
        if (length < 60) return '0.75rem';
        if (length < 100) return '0.65rem';
        if (length < 150) return '0.55rem';
        return '0.5rem';
      } else {
        if (length < 30) return '0.75rem';
        if (length < 60) return '0.65rem';
        if (length < 100) return '0.55rem';
        if (length < 150) return '0.5rem';
        return '0.45rem';
      }
    }
  };

  const isLargeView = in_view_mode || isFullscreen;

  const messageComponent = displayMessage ? (
    <Box
      style={{
        width: '100%',
        padding: isLargeView ? '2rem' : '0.5rem',
        animation: message?.is_flashing ? 'flash 1s infinite' : undefined,
      }}
    >
      {/* Message content */}
      <Text
        fw={message?.is_focused ? 700 : 500}
        style={{
          fontFamily: messageFontFamily,
          color: messageColor,
          textAlign: 'center',
          textDecoration: message?.is_focused ? 'underline' : undefined,
          lineHeight: message?.is_focused ? 1.3 : 1.4,
          fontSize: getMessageFontSize(displayMessage, !!message?.is_focused),
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {displayMessage}
      </Text>
    </Box>
  ) : null;

  const [ratioWidth, ratioHeight] = (safeDisplay.display_ratio || '16:9').split(':').map(Number);
  const aspectRatio = ratioWidth / ratioHeight;
  const is16by9 = safeDisplay.display_ratio === '16:9';

  const borderColor = getCurrentProgressColor();

  // Determine the justify property based on timer_position
  const timerPosition = safeDisplay.timer_position || 'center';
  let stackJustify: 'center' | 'flex-start' | 'flex-end' = 'center';

  switch (timerPosition) {
    case 'top':
      stackJustify = 'flex-start';
      break;
    case 'bottom':
      stackJustify = 'flex-end';
      break;
    case 'center':
    default:
      stackJustify = 'center';
      break;
  }

  // Special case: 16:9 in viewer normal mode should fill viewport
  const shouldFillViewport = in_view_mode && !isFullscreen && is16by9;

  return (
    <>
      {/* Inject CSS for animations */}
      <style>{messageStyles}</style>

      <Box
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
        // Always maintain aspect ratio (except for 16:9 in viewer normal mode)
        aspectRatio: shouldFillViewport ? undefined : aspectRatio.toString(),
        // Determine sizing based on mode
        width: shouldFillViewport ? '100vw' :
               isFullscreen ? '100vw' :
               in_view_mode ? `min(100vw, calc(100vh * ${aspectRatio}))` :
               '100%',
        height: shouldFillViewport ? '100vh' :
                isFullscreen ? '100vh' :
                in_view_mode ? `min(100vh, calc(100vw / ${aspectRatio}))` :
                '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...backgroundStyle,
        borderRadius: '0px',
        border: `1px solid ${borderColor}`,
        transition: "border-color 0.1s ease",
        boxSizing: 'border-box',
      }}
    >
      {progressStyle === 'top_bar' && (
        <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
          {progressComponent}
        </Box>
      )}

      {/* Fullscreen button - always visible, not just in view_mode */}
      <Box
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 20,
        }}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </ActionIcon>
      </Box>

      {in_view_mode && (
        <Box
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '0.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            borderBottomLeftRadius: '8px',
            zIndex: 20,
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: showControls ? 'auto' : 'none',
          }}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </ActionIcon>
        </Box>
      )}

      <Flex
        direction="column"
        justify="space-between"
        style={{
          height: '100%',
          width: '100%',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {header && <Box style={{ flexShrink: 0 }}>{header}</Box>}

        <Stack align="center" justify={stackJustify} gap="md" style={{ flex: 1, minHeight: 0 }}>
          {/* In focus mode, only show the message */}
          {message?.is_focused ? (
            messageComponent && (
              <Box style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                {messageComponent}
              </Box>
            )
          ) : (
            <>
              {showTimer && (
                <Box style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  overflow: 'visible',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    ...timerStyle,
                    fontSize: isFullscreen
                      ? `min(${baseFontSize * 42}rem, ${baseFontSize * 18}vw, ${baseFontSize * 12}vh)`
                      : `min(${baseFontSize * 42}rem, ${baseFontSize * 12}vw, ${baseFontSize * 8}vh)`,
                    whiteSpace: 'nowrap',
                  }}>
                    {timerText}
                  </Text>
                </Box>
              )}

              {safeDisplay.clock_visible && !showOnlyClock && (
                <Box style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <Text style={{
                    ...clockStyle,
                    fontSize: `min(${clockStyle.fontSize}, 8vw, 8vh)`,
                  }}>{clockText}</Text>
                </Box>
              )}

              {showOnlyClock && (
                <Box style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <Text style={{
                    ...clockStyle,
                    fontSize: `min(${clockStyle.fontSize}, 12vw, 12vh)`,
                  }}>{clockText}</Text>
                </Box>
              )}

              {messageComponent && (
                <Box style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  {messageComponent}
                </Box>
              )}
            </>
          )}
        </Stack>

        {footer && <Box style={{ flexShrink: 0 }}>{footer}</Box>}
      </Flex>

      {progressStyle === 'bottom_bar' && (
        <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
          {progressComponent}
        </Box>
      )}

      {safeDisplay.logo_image && (
        <Image
          src={safeDisplay.logo_image}
          style={logoStyle}
          alt="Logo"
        />
      )}

      {progressStyle === 'ring' && progressComponent && (
        <Box style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
          {progressComponent}
        </Box>
      )}
    </Box>
    </>
  );
}

export default TimerDisplayStandalone;
