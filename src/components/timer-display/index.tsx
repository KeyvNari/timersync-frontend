import { useState, useEffect } from 'react';
import { Text, Image, Flex, Stack, Progress, Box, RingProgress, ActionIcon } from '@mantine/core';
import { Maximize, Minimize } from 'lucide-react';

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



function TimerDisplay({ 
  display, 
  timer, 
  in_view_mode = false 
}: { 
  display?: Display; 
  timer?: Timer;
  in_view_mode?: boolean;
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
    background_type: 'color',
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

  useEffect(() => {
    console.log('⏱️ TimerDisplay received update:', {
      current_time: timer?.current_time_seconds,
      is_active: timer?.is_active
    });
  }, [timer?.current_time_seconds, timer?.is_active]);

  const safeDisplay = display ?? defaultDisplay;
  const safeTimer = timer ?? defaultTimer;

  const [displayState, setDisplayState] = useState(() => ({
    currentTime: safeTimer.current_time_seconds,
  }));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

const getMaxFontSize = () => {
  const format = safeDisplay.timer_format || 'mm:ss';
  // Adjust max width based on format complexity
  if (format.includes('h')) {
    return '18vw'; // hh:mm:ss needs more space
  }
  return '20vw'; // mm:ss can be larger
};
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
      setDisplayState({
        currentTime: timer?.current_time_seconds ?? 0,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.current_time_seconds]);

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
      await document.documentElement.requestFullscreen();
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

    let timeStr = '';
    if (formatStr.includes('h')) {
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

      if (displayState.currentTime < 0) {
        return safeDisplay.progress_color_tertiary || 'red';
      } else if (displayState.currentTime <= criticalTime) {
        return safeDisplay.progress_color_tertiary || 'red';
      } else if (displayState.currentTime <= warningTime) {
        return safeDisplay.progress_color_secondary || 'yellow';
      } else {
        return safeDisplay.progress_color_main || 'green';
      }
    } else if (safeTimer.timer_type === 'countup' && safeTimer.duration_seconds) {
      if (safeTimer.critical_time && displayState.currentTime >= safeTimer.critical_time) {
        return safeDisplay.progress_color_tertiary || 'red';
      } else if (safeTimer.warning_time && displayState.currentTime >= safeTimer.warning_time) {
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

  const timerText = formatTime(displayState.currentTime, safeDisplay.timer_format || 'mm:ss');
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
        backgroundStyle.backgroundImage = `url(data:image/png;base64,${safeDisplay.background_image})`;
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
      let remaining = displayState.currentTime;
      if (remaining < 0) {
        mainSection = 0;
      } else {
        mainSection = (remaining / safeTimer.duration_seconds) * 100;
      }
      progressColor = getCurrentProgressColor();
    } else {
      let progressValue = (displayState.currentTime / safeTimer.duration_seconds) * 100;
      if (progressValue > 100) progressValue = 100;
      mainSection = progressValue;
      progressColor = getCurrentProgressColor();
    }
  }

  const baseFontSize = (safeDisplay.timer_size_percent || 100) / 100;
  const timerStyle: React.CSSProperties = {
    fontFamily: safeDisplay.timer_font_family || 'Roboto Mono',
    color: getTimerColor(),
    fontSize: `${baseFontSize * 6 * 7}rem`,
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

  const logoSize = safeDisplay.logo_size_percent || 60;
  const logoStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${logoSize}px`,
    height: `${logoSize}px`,
    zIndex: 10,
  };

  switch (safeDisplay.logo_position || 'top_left') {
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
  const progressStyle = safeDisplay.progress_style || 'bottom_bar';

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

  const message = safeTimer.show_notes && safeTimer.notes ? safeTimer.notes : '';
  const messageComponent = message ? (
    <Text size="md" style={{ fontFamily: safeDisplay.message_font_family || 'Roboto Mono', color: safeDisplay.message_color || '#ffffff', textAlign: 'center' }}>
      {message}
    </Text>
  ) : null;

  const [ratioWidth, ratioHeight] = (safeDisplay.display_ratio || '16:9').split(':').map(Number);
  const aspectRatio = ratioWidth / ratioHeight;

  const borderColor = getCurrentProgressColor();

  return (
    <Box
      onMouseMove={handleMouseMove}
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

        <Stack align="center" justify="center" gap="md" style={{ flex: 1, minHeight: 0 }}>
          {showTimer && (
        <Box style={{
  maxWidth: '100%',
  maxHeight: '100%',
  overflow: 'visible', // Changed from 'hidden' to 'visible'
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <Text style={{
    ...timerStyle,
    fontSize: `min(${timerStyle.fontSize}, 18vw, 12vh)`, // Adjusted constraints
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
        </Stack>

        {footer && <Box style={{ flexShrink: 0 }}>{footer}</Box>}
      </Flex>

      {progressStyle === 'bottom_bar' && (
        <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
          {progressComponent}
        </Box>
      )}

      {safeDisplay.logo_image && (
        <Image src={`data:image/png;base64,${safeDisplay.logo_image}`} style={logoStyle} />
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
