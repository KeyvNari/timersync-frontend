import { Box, Container, Stack, Title, Text, Button, Group } from '@mantine/core';
import { IconArrowRight, IconRocket } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface CTAProps {
  animationStyle?: React.CSSProperties;
}

export function CTA({ animationStyle }: CTAProps) {
  const navigate = useNavigate();

  return (
    <Box
      id="cta"
      py={120}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        color: 'white',
      }}
    >
      {/* Animated Background */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.6,
          background: `
            radial-gradient(circle at 20% 50%, #228be6 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, #7950f2 0%, transparent 50%)
          `,
          filter: 'blur(60px)',
          animation: 'pulseGradient 10s ease-in-out infinite alternate',
        }}
      />

      <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" style={animationStyle}>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Ready to Sync Your Team?
          </Title>

          <Text
            size="xl"
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 600,
            }}
          >
            Join thousands of teams using VeroTime to run perfect meetings,
            workshops, and events. No credit card required.
          </Text>

          <Group mt="xl">
            <Button
              size="xl"
              radius="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              rightSection={<IconArrowRight size={20} />}
              onClick={() => navigate('/auth/register')}
              style={{
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Get Started for Free
            </Button>
            <Button
              size="xl"
              radius="xl"
              variant="white"
              color="dark"
              leftSection={<IconRocket size={20} />}
              onClick={() => navigate('/auth/register')}
            >
              Try Demo Room
            </Button>
          </Group>
        </Stack>
      </Container>

      <style>{`
        @keyframes pulseGradient {
          0% { opacity: 0.4; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </Box>
  );
}
