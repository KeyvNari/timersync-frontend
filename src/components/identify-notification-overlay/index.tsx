import { useState, useEffect } from 'react';
import { Box, Text, Group, Transition, Center } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

interface IdentifyNotificationOverlayProps {
  /** Connection name to display */
  connectionName: string;
  /** Whether the notification is visible */
  isVisible: boolean;
  /** Duration in milliseconds before auto-dismiss (default: 3000) */
  duration?: number;
  /** Callback when notification is dismissed */
  onDismiss?: () => void;
}

export function IdentifyNotificationOverlay({
  connectionName,
  isVisible,
  duration = 3000,
  onDismiss
}: IdentifyNotificationOverlayProps) {
  const [mounted, setMounted] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      const timer = setTimeout(() => {
        setMounted(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isVisible, duration, onDismiss]);

  return (
    <Transition
      mounted={mounted}
      transition="fade"
      duration={300}
      exitDuration={300}
    >
      {(styles) => (
        <Box
          style={{
            ...styles,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: mounted ? 'auto' : 'none'
          }}
        >
          {/* Semi-transparent background */}
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Centered notification content */}
          <Center style={{ position: 'relative', height: '100%' }}>
            <Box
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                maxWidth: '400px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                animation: mounted ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              <Group justify="center" mb="lg">
                <Box
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#e7f5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconInfoCircle size={48} color="#1c7ed6" />
                </Box>
              </Group>

              <Text
                size="xl"
                fw={600}
                mb="sm"
                style={{ color: '#1c7ed6' }}
              >
                Device Identified
              </Text>

              <Text
                size="lg"
                fw={500}
                mb="xs"
              >
                {connectionName}
              </Text>

              <Text
                size="sm"
                c="dimmed"
              >
                This device has been identified
              </Text>

              <style>{`
                @keyframes pulse {
                  0% {
                    transform: scale(1);
                  }
                  50% {
                    transform: scale(1.02);
                  }
                  100% {
                    transform: scale(1);
                  }
                }
              `}</style>
            </Box>
          </Center>
        </Box>
      )}
    </Transition>
  );
}
