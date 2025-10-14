import { Center, Loader, Stack, Text, Box } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <Center
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--mantine-color-body)',
        zIndex: 100
      }}
    >
      <Stack align="center" gap="xl">
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer rotating circle */}
          <Box
            style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              border: '3px solid var(--mantine-color-blue-1)',
              borderTop: '3px solid var(--mantine-color-blue-6)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />

          {/* Inner icon */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              backgroundColor: 'var(--mantine-color-blue-0)',
              borderRadius: '50%',
              zIndex: 1,
            }}
          >
            <IconClock size={32} color="var(--mantine-color-blue-6)" />
          </Box>
        </Box>

        <Stack align="center" gap="xs">
          <Text size="lg" fw={500} c="dimmed">
            {message}
          </Text>
          <Text size="sm" c="dimmed">
            Connecting to room...
          </Text>
        </Stack>

        {/* CSS animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Stack>
    </Center>
  );
}
