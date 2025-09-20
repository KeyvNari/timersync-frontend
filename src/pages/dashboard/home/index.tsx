import { useState, useRef, useCallback, useEffect } from 'react';
import { Grid, Paper, Box, useMantineTheme } from '@mantine/core';
import { Page } from '@/components/page';
import {Timers} from '@/components/timer-panel'
import { ColorSchemeToggle } from './color-scheme-toggle';
import { Welcome } from './welcome';
import classes from './home.module.css';
import { Button, Group } from '@mantine/core';

export default function HomePage() {
  const [leftWidth, setLeftWidth] = useState(66); // Initial 8/12 ratio as percentage
  const theme = useMantineTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

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
    
    // Constrain between 30% and 80%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 80);
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
            {/* Top section - 66.67% height */}
            <Paper 
              withBorder 
              p="md" 
              style={{ 
                flex: '2 1 0', // Flexible with 2:1 ratio
                minHeight: '200px',
                overflow: 'auto' // Allow content to scroll if needed
              }}
            >
              <Box>
                <h3>Top Section</h3>
                <p>This takes up 8/12 (66.67%) of the right column height</p>
                <p>Current left width: {leftWidth.toFixed(1)}%</p>
                <p>Responsive height that adapts to screen size</p>
              </Box>
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