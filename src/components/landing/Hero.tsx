import {
  Container,
  Stack,
  Text,
  Button,
  Group,
  Badge,
  Box,
  Title,
  Grid,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowRight, IconSparkles, IconBolt, IconPlayerPlay } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
  animationStyle?: React.CSSProperties;
}

export function Hero({ onScrollToSection, animationStyle }: HeroProps) {
  const navigate = useNavigate();

  return (
    <Box
      id="hero"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f4ff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: '6rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(66, 99, 235, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(66, 99, 235, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.6,
          animation: 'panGrid 60s linear infinite',
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Grid gutter={60} align="center">
          {/* Left Column - Text Content */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xl" align="flex-start">
              {/* Animated Badge */}
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                leftSection={<IconSparkles size={14} />}
                style={{
                  padding: '16px 20px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  animation: 'slideDown 0.8s ease-out',
                  boxShadow: '0 4px 20px rgba(34, 184, 207, 0.2)',
                }}
              >
                New: Create Timers with AI Magic ✨
              </Badge>

              {/* Main Heading */}
              <Box style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
                <Title
                  order={1}
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    fontWeight: 900,
                    textAlign: 'start',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    letterSpacing: '-2px',
                    marginBottom: '0.5rem',
                  }}
                >
                  Perfect Timing,
                </Title>
                <Title
                  order={1}
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    fontWeight: 900,
                    textAlign: 'start',
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #228be6 0%, #15aabf 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px',
                  }}
                >
                  Powered by AI.
                </Title>
              </Box>

              {/* Subtitle */}
              <Text
                size="xl"
                c="dimmed"
                style={{
                  textAlign: 'start',
                  lineHeight: 1.6,
                  fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)',
                  maxWidth: '90%',
                  animation: 'fadeInUp 1s ease-out 0.4s both',
                }}
              >
                Create complex timers instantly by describing them or uploading a file.
                Sync in real-time across all devices for meetings, events, and workshops.
              </Text>

              {/* CTA Buttons */}
              <Group gap="md" style={{ animation: 'fadeInUp 1s ease-out 0.6s both' }}>
                <Button
                  size="xl"
                  radius="xl"
                  color="blue"
                  rightSection={<IconArrowRight size={20} />}
                  onClick={() => navigate('/auth/register')}
                  style={{
                    boxShadow: '0 10px 30px rgba(34, 139, 230, 0.3)',
                    transition: 'transform 0.2s',
                    animation: 'pulse 3s infinite',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Create Room for Free
                </Button>
                <Button
                  size="xl"
                  radius="xl"
                  variant="default"
                  leftSection={<IconPlayerPlay size={20} />}
                  onClick={() => onScrollToSection('features')}
                  style={{
                    border: '1px solid #dee2e6',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  See How It Works
                </Button>
              </Group>

              {/* Trust Indicators */}
              <Group gap="xl" mt="md" style={{ animation: 'fadeInUp 1s ease-out 0.8s both', opacity: 0.7 }}>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
                    <IconBolt size={12} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Instant Setup</Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
                    <IconSparkles size={12} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>AI Powered</Text>
                </Group>
              </Group>
            </Stack>
          </Grid.Col>

          {/* Right Column - 3D Art Placeholder */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box
              style={{
                position: 'relative',
                height: '500px',
                width: '100%',
                animation: 'fadeInUp 1s ease-out 0.6s both',
              }}
            >
              {/* Main Floating Element (Placeholder for 3D Clock) */}
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  height: '80%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '40px',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 6s ease-in-out infinite',
                  zIndex: 2,
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon
                    size={120}
                    radius="100%"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    style={{ boxShadow: '0 20px 60px rgba(34, 139, 230, 0.4)' }}
                  >
                    <IconSparkles size={60} color="white" />
                  </ThemeIcon>
                  <Text fw={700} size="xl" style={{ color: '#333' }}>
                    AI Timer Generation
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: '200px' }}>
                    "Create a 15 minute standup timer with 3 speakers"
                  </Text>
                </Stack>
              </Box>

              {/* Floating Elements (Decorations) */}
              <Box
                style={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)',
                  borderRadius: '30px',
                  transform: 'rotate(15deg)',
                  animation: 'float 8s ease-in-out infinite reverse',
                  boxShadow: '0 20px 40px rgba(255, 107, 107, 0.3)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                10:00
              </Box>

              <Box
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '5%',
                  width: '140px',
                  height: '80px',
                  background: 'white',
                  borderRadius: '20px',
                  animation: 'float 7s ease-in-out infinite 1s',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <Box w={10} h={10} bg="green" style={{ borderRadius: '50%' }} />
                <Text size="sm" fw={600}>Synced</Text>
              </Box>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 139, 230, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(34, 139, 230, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 139, 230, 0); }
        }

        @keyframes panGrid {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
    </Box>
  );
}
