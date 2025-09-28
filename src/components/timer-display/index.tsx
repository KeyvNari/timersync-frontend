import { useState, useEffect } from 'react';
import { Text, Image, Flex, Stack, Progress, Box, RingProgress } from '@mantine/core';

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
  timer_position?: string | null;
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
};

function TimerDisplay({ display, timer }: { display: Display; timer?: Timer }) {
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

  const safeTimer = timer ?? defaultTimer;

  const [displayState, setDisplayState] = useState(() => ({
    currentTime: safeTimer.current_time_seconds,
  }));

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
      setDisplayState({
        currentTime: safeTimer.current_time_seconds,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [safeTimer]);

  const formatTime = (seconds: number, formatStr: string) => {
    const absSeconds = Math.max(0, Math.floor(seconds));
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;

    if (formatStr.includes('h')) {
      return [h, m, s].map(n => n.toString().padStart(2, '0')).join(':');
    }
    return [m, s].map(n => n.toString().padStart(2, '0')).join(':');
  };

  const formatClock = () => {
    if (display.clock_format === 'browser_default' || !display.clock_format) {
      return currentDate.toLocaleTimeString();
    }
    return currentDate.toLocaleTimeString();
  };

  const getCurrentProgressColor = () => {
    if (safeTimer.timer_type === 'countdown' && safeTimer.duration_seconds) {
      const warningTime = safeTimer.warning_time || safeTimer.duration_seconds * 0.3;
      const criticalTime = safeTimer.critical_time || safeTimer.duration_seconds * 0.1;

      if (displayState.currentTime <= criticalTime) {
        return display.progress_color_tertiary || 'red';
      } else if (displayState.currentTime <= warningTime) {
        return display.progress_color_secondary || 'yellow';
      } else {
        return display.progress_color_main || 'green';
      }
    } else if (safeTimer.timer_type === 'countup' && safeTimer.duration_seconds) {
      if (safeTimer.critical_time && displayState.currentTime >= safeTimer.critical_time) {
        return display.progress_color_tertiary || 'red';
      } else if (safeTimer.warning_time && displayState.currentTime >= safeTimer.warning_time) {
        return display.progress_color_secondary || 'yellow';
      } else {
        return display.progress_color_main || 'green';
      }
    }
    return display.progress_color_main || 'green';
  };

  const getTimerColor = () => {
    return display.timer_color || '#ffffff';
  };

  const timerText = formatTime(displayState.currentTime, display.timer_format || 'mm:ss');
  const clockText = formatClock();
  const showTimer = !(display.auto_hide_completed && safeTimer.is_finished);
  const showOnlyClock = !showTimer && display.clock_visible;

  const backgroundStyle: React.CSSProperties = {};
  switch (display.background_type || 'color') {
    case 'color':
      backgroundStyle.backgroundColor = display.background_color || '#000000';
      break;
    case 'image':
      if (display.background_image) {
        backgroundStyle.backgroundImage = `url(data:image/png;base64,${display.background_image})`;
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
  let progressColor = display.progress_color_main || 'green';

  if (safeTimer.duration_seconds && safeTimer.duration_seconds > 0) {
    if (safeTimer.timer_type === 'countdown') {
      let remaining = displayState.currentTime;
      if (remaining < 0) remaining = 0;
      mainSection = (remaining / safeTimer.duration_seconds) * 100;
      progressColor = getCurrentProgressColor();
    } else {
      let progressValue = (displayState.currentTime / safeTimer.duration_seconds) * 100;
      if (progressValue > 100) progressValue = 100;
      mainSection = progressValue;
      progressColor = getCurrentProgressColor();
    }
  }

  const baseFontSize = (display.timer_size_percent || 100) / 100;
  const timerStyle: React.CSSProperties = {
    fontFamily: display.timer_font_family || 'Roboto Mono',
    color: getTimerColor(),
    fontSize: `${baseFontSize * 6 * 7}rem`,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  switch (display.timer_text_style || 'default') {
    case 'outline':
      timerStyle.WebkitTextStroke = '2px black';
      timerStyle.color = 'transparent';
      break;
    case 'shadow':
      timerStyle.textShadow = '4px 4px 8px rgba(0,0,0,0.7)';
      break;
  }

  const clockStyle: React.CSSProperties = {
    fontFamily: display.clock_font_family || 'Roboto Mono',
    color: display.clock_color || display.time_of_day_color || '#ffffff',
    fontSize: showOnlyClock ? `${baseFontSize * 4}rem` : '2rem',
    textAlign: 'center',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  const logoSize = display.logo_size_percent || 60;
  const logoStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${logoSize}px`,
    height: `${logoSize}px`,
    zIndex: 10,
  };

  switch (display.logo_position || 'top_left') {
    case 'top_left':
      logoStyle.top = 20;
      logoStyle.left = 20;
      break;
    case 'top_right':
      logoStyle.top = 20;
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
  const progressStyle = display.progress_style || 'bottom_bar';

  if (progressStyle !== 'hidden') {
    if (progressStyle === 'bottom_bar' || progressStyle === 'top_bar') {
      progressComponent = (
        <Box style={{ position: 'relative' }}>
          <Progress.Root size="xl" radius="xs">
            <Progress.Section
              value={mainSection}
              color={progressColor}
              striped
              animated={safeTimer.is_active && !safeTimer.is_paused}
            />
          </Progress.Root>
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: `${mainSection}%`,
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              zIndex: 2,
            }}
          />
        </Box>
      );
    } else if (progressStyle === 'ring') {
      const ringValue = mainSection;
      progressComponent = (
        <RingProgress
          sections={[{ value: ringValue, color: progressColor }]}
          size={120}
          thickness={12}
          label={<Text size="sm" ta="center" c={progressColor}>{Math.round(ringValue)}%</Text>}
        />
      );
    }
  }

  const headerItems: string[] = [];
  if (display.title_display_location === 'header' && safeTimer.show_title) headerItems.push(safeTimer.title);
  if (display.speaker_display_location === 'header' && safeTimer.show_speaker && safeTimer.speaker) headerItems.push(safeTimer.speaker);

  const footerItems: string[] = [];
  if (display.title_display_location === 'footer' && safeTimer.show_title) footerItems.push(safeTimer.title);
  if (display.speaker_display_location === 'footer' && safeTimer.show_speaker && safeTimer.speaker) footerItems.push(safeTimer.speaker);

  const header = headerItems.length > 0 ? (
    <Text size="lg" style={{ fontFamily: display.header_font_family || 'Roboto Mono', color: display.header_color || '#ffffff', textAlign: 'center' }}>
      {headerItems.join(' | ')}
    </Text>
  ) : null;

  const footer = footerItems.length > 0 ? (
    <Text size="lg" style={{ fontFamily: display.footer_font_family || 'Roboto Mono', color: display.footer_color || '#ffffff', textAlign: 'center' }}>
      {footerItems.join(' | ')}
    </Text>
  ) : null;

  const message = safeTimer.show_notes && safeTimer.notes ? safeTimer.notes : '';
  const messageComponent = message ? (
    <Text size="md" style={{ fontFamily: display.message_font_family || 'Roboto Mono', color: display.message_color || '#ffffff', textAlign: 'center' }}>
      {message}
    </Text>
  ) : null;

  const [ratioWidth, ratioHeight] = (display.display_ratio || '16:9').split(':').map(Number);
  const aspectRatio = ratioWidth / ratioHeight;

  const borderColor = getCurrentProgressColor();

  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: aspectRatio.toString(),
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

        <Stack align="center" justify="center" gap="md" style={{ flex: 1, minHeight: 0 }}>
          {showTimer && (
            <Box style={{
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                ...timerStyle,
                fontSize: `min(${timerStyle.fontSize}, 15vw, 15vh)`,
              }}>
                {timerText}
              </Text>
            </Box>
          )}

          {display.clock_visible && !showOnlyClock && (
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
        </Stack>

        {footer && <Box style={{ flexShrink: 0 }}>{footer}</Box>}
      </Flex>

      {progressStyle === 'bottom_bar' && (
        <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
          {progressComponent}
        </Box>
      )}

      {display.logo_image && (
        <Image src={`data:image/png;base64,${display.logo_image}`} style={logoStyle} />
      )}

      {progressStyle === 'ring' && progressComponent && (
        <Box style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
          {progressComponent}
        </Box>
      )}
    </Box>
  );
}

export default TimerDisplay;

