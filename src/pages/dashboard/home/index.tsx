import { useState, useRef, useCallback, useEffect } from 'react';
import { Grid, Paper, Box, useMantineTheme } from '@mantine/core';
import { Page } from '@/components/page';
import {Timers} from '@/components/timer-panel'
import { ColorSchemeToggle } from './color-scheme-toggle';
import { Welcome } from './welcome';
import classes from './home.module.css';
import { Button, Group } from '@mantine/core';
import TimerDisplay from '@/components/timer-display';
export default function HomePage() {
  const [leftWidth, setLeftWidth] = useState(66); // Initial 8/12 ratio as percentage
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
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
  started_at?: Date | null;
  paused_at?: Date | null;
  completed_at?: Date | null;
  accumulated_seconds: number;
  warning_time?: number | null;
  critical_time?: number | null;
  is_overtime: boolean;
  overtime_seconds: number;
  last_calculated_at?: Date | null;
};
// Mock data for testing
const mockDisplay: Display = {
  name: 'Untitled Display',
  logo_image: null,
  logo_size_percent: 60,
  logo_position: 'top_left',
  timer_format: 'mm:ss',
  timer_font_family: 'Roboto Mono',
  timer_color: '#ffffffff',
  time_of_day_color: '#ffffffff',
  timer_text_style: 'default',
  timer_size_percent: 10,
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
  footer_color: '#ffffffff',
  theme_name: 'default',
  text_style: 'default',
  display_ratio: '16:9',
  background_type: 'color',
  background_color: '#00000058',
  background_image: null,
  background_preset: null,
  progress_style: 'bottom_bar',
  progress_color_main: 'green',
  progress_color_secondary: 'orange',
  progress_color_tertiary: 'red',
};

const mockTimer: Timer = {
  title: 'Sample Timer',
  speaker: 'Jane Doe',
  notes: 'This is a mock note',
  show_title: true,
  show_speaker: false,
  show_notes: false,
  timer_type: 'countdown',
  duration_seconds: 130,
  current_time_seconds: 130,
  is_active: true,
  is_paused: false,
  is_finished: false,
  is_stopped: false,
  accumulated_seconds: 0,
  warning_time: 120,
  critical_time: 60,
  is_overtime: false,
  overtime_seconds: 5,
  last_calculated_at: new Date(),
};
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain between 30% and 70%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 70);
    setLeftWidth(constrainedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Page title="Home">
      <Box 
        ref={containerRef}
        style={{ 
          display: 'flex', 
          height: 'calc(97vh - 7rem)', // Subtract padding/margins
          minHeight: '400px', // Ensure minimum usable height
          maxHeight: '100vh', // Prevent overflow
          padding: theme.spacing.md,
          gap: 0,
          overflow: 'hidden' // Prevent scrollbars
        }}
      >
          {/* Left Panel */}
        <Box 
          style={{ 
            width: `${leftWidth}%`,
            minWidth: '200px',
            maxWidth: '80%' // Prevent left panel from being too wide
          }}
        >
          <Paper 
            withBorder 
            p="xl" 
            h="100%" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'auto' // Allow content to scroll if needed
            }}
          >
            {/* Top buttons */}
            <Group justify="flex-start" mb="md">
              <Button variant="default" size="sm">
                + Add Timer
              </Button>
              <Button variant="default" size="sm">
                Create with AI
              </Button>
            </Group>
            
            {/* Timers container */}
            <Box style={{ flex: 1 }}>
              <Timers />
            </Box>
          </Paper>
        </Box>

        {/* Resizer */}
        <Box
          onMouseDown={handleMouseDown}
          style={{
            width: '1px',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            position: 'relative',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}
          sx={{
            '&:hover': {
              width: '2px',
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[4],
            },
            '&:active': {
              width: '3px',
              backgroundColor: theme.colors.blue[5],
            }
          }}
        >
          {/* Invisible hit area for easier interaction */}
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: '-4px',
              right: '-4px',
              bottom: 0,
              zIndex: 1
            }}
          />
          
          {/* Subtle visual indicator that appears on hover */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '24px',
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[3],
              borderRadius: theme.radius.xs,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none'
            }}
            sx={{
              [`${containerRef.current}:hover &`]: {
                opacity: 0.6
              }
            }}
          >
            <Box
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6px',
                color: theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[6],
                lineHeight: 1
              }}
            >
              ⋮
            </Box>
          </Box>
        </Box>
        
        {/* Right Panel */}
        <Box 
          style={{ 
            width: `${100 - leftWidth}%`,
            minWidth: '200px',
            maxWidth: '70%', // Prevent right panel from being too wide
            paddingLeft: theme.spacing.xs
          }}
        >
          <Box style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            gap: theme.spacing.xs 
          }}>
            {/* Top section */}
            <Paper
              withBorder
              p="md"
              style={{
                aspectRatio: '16 / 9',
                flex: 'none',
                overflow: 'auto' // Allow content to scroll if needed
              }}
            >
              <TimerDisplay display={mockDisplay} timer={mockTimer} />
              {/* <Box> */}
                {/* <h3>Top Section</h3>
                <p>This takes up 8/12 (66.67%) of the right column height</p>
                <p>Current left width: {leftWidth.toFixed(1)}%</p>
                <p>Responsive height that adapts to screen size</p>
              </Box> */}
            </Paper>
            
            {/* Bottom section - 33.33% height */}
            <Paper 
              withBorder 
              p="md" 
              style={{ 
                flex: '1 1 0', // Flexible with 1 part of 3
                minHeight: '100px',
                overflow: 'auto' // Allow content to scroll if needed
              }}
            >
              <Box>
                <h3>Bottom Section</h3>
                <p>This takes up 4/12 (33.33%) of the right column height</p>
                <p>Adapts to available space</p>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}
