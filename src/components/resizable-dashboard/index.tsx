// src/components/resizable-dashboard/index.tsx
import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { Box, useMantineTheme } from '@mantine/core';

export interface ResizableDashboardProps {
  /** Content for the left panel */
  leftPanel: ReactNode;
  /** Content for the top-right panel */
  topRightPanel: ReactNode;
  /** Content for the bottom-right panel */
  bottomRightPanel: ReactNode;
  /** Initial width percentage for left panel (default: 66) */
  initialLeftWidth?: number;
  /** Minimum width percentage for left panel (default: 30) */
  minLeftWidth?: number;
  /** Maximum width percentage for left panel (default: 70) */
  maxLeftWidth?: number;
  /** Callback when left panel width changes */
  onLeftWidthChange?: (width: number) => void;
  /** Top right panel aspect ratio (default: '16:9') */
  topRightAspectRatio?: string;
}

export function ResizableDashboard({
  leftPanel,
  topRightPanel,
  bottomRightPanel,
  initialLeftWidth = 66,
  minLeftWidth = 30,
  maxLeftWidth = 70,
  onLeftWidthChange,
  topRightAspectRatio = '16:9',
}: ResizableDashboardProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
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

    const constrainedWidth = Math.min(Math.max(newLeftWidth, minLeftWidth), maxLeftWidth);
    setLeftWidth(constrainedWidth);
    onLeftWidthChange?.(constrainedWidth);
  }, [minLeftWidth, maxLeftWidth, onLeftWidthChange]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Box
      ref={containerRef}
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '400px',
        maxHeight: '100%',
        padding: theme.spacing.md,
        gap: 0,
        overflow: 'hidden',
      }}
    >
      {/* Left Panel */}
      <Box
        style={{
          width: `${leftWidth}%`,
          minWidth: '200px',
          maxWidth: '80%',
        }}
      >
        {leftPanel}
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
          transition: 'all 0.2s ease',
        }}
        sx={{
          '&:hover': {
            width: '2px',
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[4],
          },
          '&:active': {
            width: '3px',
            backgroundColor: theme.colors.blue[5],
          },
        }}
      >
        {/* Invisible hit area */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: '-4px',
            right: '-4px',
            bottom: 0,
            zIndex: 1,
          }}
        />

        {/* Visual indicator */}
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '24px',
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.gray[7] : theme.colors.gray[3],
            borderRadius: theme.radius.xs,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
          sx={{
            [`${containerRef.current}:hover &`]: {
              opacity: 0.6,
            },
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
              lineHeight: 1,
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
          maxWidth: '70%',
          paddingLeft: theme.spacing.xs,
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: theme.spacing.xs,
          }}
        >
          {/* Top section with aspect ratio */}
          <Box
            style={{
              aspectRatio: topRightAspectRatio,
              flex: 'none',
              overflow: 'auto',
            }}
          >
            {topRightPanel}
          </Box>

          {/* Bottom section - flexible height */}
          <Box
            style={{
              flex: '1 1 0',
              minHeight: '100px',
              overflow: 'auto',
            }}
          >
            {bottomRightPanel}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}