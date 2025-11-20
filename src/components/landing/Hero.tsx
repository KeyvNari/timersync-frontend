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
  Paper,
  RingProgress,
  ActionIcon,
  Progress,
} from '@mantine/core';
import { IconArrowRight, IconSparkles, IconPlayerPlay, IconGripVertical, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../logo';

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
          <Grid.Col span={{ base: 12, md: 5 }}>
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
                Works on any device size
              </Badge>

              {/* Main Heading */}
              <Box style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
                <Title
                  order={1}
                  style={{
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    fontWeight: 900,
                    textAlign: 'start',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    letterSpacing: '-1px',
                    marginBottom: '0.5rem',
                  }}
                >
                  Create remote-controlled countdown timers
                </Title>
                <Title
                  order={1}
                  style={{
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    fontWeight: 900,
                    textAlign: 'start',
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #228be6 0%, #15aabf 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px',
                  }}
                >
                  share easily with others.
                </Title>
              </Box>

              {/* Subtitle */}
              <Text
                size="xl"
                c="dimmed"
                style={{
                  textAlign: 'start',
                  lineHeight: 1.6,
                  fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
                  maxWidth: '90%',
                  animation: 'fadeInUp 1s ease-out 0.4s both',
                }}
              >
                Show a fullscreen timer to your presenter while you control it from another device.
              </Text>

              {/* CTA Buttons */}
              <Group gap="md" style={{ animation: 'fadeInUp 1s ease-out 0.6s both' }}>
                <Button
                  size="lg"
                  radius="xl"
                  color="blue"
                  rightSection={<IconArrowRight size={20} />}
                  onClick={() => navigate('/auth/register')}
                  style={{
                    boxShadow: '0 10px 30px rgba(34, 139, 230, 0.3)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Create Room for Free
                </Button>
                <Button
                  size="lg"
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
            </Stack>
          </Grid.Col>

          {/* Right Column - Interactive Flow Animation */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <HeroAnimation />
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

        @keyframes panGrid {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
    </Box>
  );
}

function HeroAnimation() {
  const [step, setStep] = useState<'prompt' | 'timers' | 'display'>('prompt');
  const [typedText, setTypedText] = useState('');
  const fullText = "According to the uploaded file, create a timer for each event.";
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(600);

  const getProgressColor = (time: number) => {
    const duration = 600;
    const warningTime = duration * 0.3; // 30% = 180 seconds
    const criticalTime = duration * 0.1; // 10% = 60 seconds

    if (time <= criticalTime) {
      return 'red';
    } else if (time <= warningTime) {
      return 'orange';
    } else {
      return 'green';
    }
  };

  const getProgressSections = (time: number) => {
    const duration = 600;
    const warningTime = duration * 0.3; // 180 seconds (30%)
    const criticalTime = duration * 0.1; // 60 seconds (10%)

    const redPercent = (criticalTime / duration) * 100; // 10%
    const yellowPercent = ((warningTime - criticalTime) / duration) * 100; // 20%
    const greenPercent = ((duration - warningTime) / duration) * 100; // 70%

    const currentPercent = (time / duration) * 100;
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

    return [
      <Progress.Section
        key="red"
        value={redFilled}
        color="red"
        style={{ transition: 'width 100ms linear' }}
      />,
      <Progress.Section
        key="red-empty"
        value={redPercent - redFilled}
        color="gray"
        style={{ transition: 'width 100ms linear' }}
      />,
      <Progress.Section
        key="yellow"
        value={yellowFilled}
        color="orange"
        style={{ transition: 'width 100ms linear' }}
      />,
      <Progress.Section
        key="yellow-empty"
        value={yellowPercent - yellowFilled}
        color="gray"
        style={{ transition: 'width 100ms linear' }}
      />,
      <Progress.Section
        key="green"
        value={greenFilled}
        color="green"
        style={{ transition: 'width 100ms linear' }}
      />,
      <Progress.Section
        key="green-empty"
        value={greenPercent - greenFilled}
        color="gray"
        style={{ transition: 'width 100ms linear' }}
      />,
    ];
  };

  // Animation Sequence
  useEffect(() => {
    let mounted = true;

    const runSequence = async () => {
      while (mounted) {
        // Reset
        setStep('prompt');
        setTypedText('');
        setCursorVisible(false);
        setActiveTimerId(null);
        setCountdown(600);

        // Step 1: Typing
        await new Promise(r => setTimeout(r, 500));
        for (let i = 0; i <= fullText.length; i++) {
          if (!mounted) return;
          setTypedText(fullText.slice(0, i));
          await new Promise(r => setTimeout(r, 25));
        }

        // Step 2: Show Timers
        await new Promise(r => setTimeout(r, 400));
        if (!mounted) return;
        setStep('timers');

        // Step 3: Move Cursor and Click
        await new Promise(r => setTimeout(r, 600));
        if (!mounted) return;
        setCursorVisible(true);
        // Start position (bottom rightish)
        setCursorPosition({ x: 400, y: 400 });

        // Animate to play button (approximate coordinates relative to container)
        // We'll use CSS transition for smooth movement
        await new Promise(r => setTimeout(r, 50));
        if (!mounted) return;
        setCursorPosition({ x: 280, y: 160 }); // Target the first timer's play button

        await new Promise(r => setTimeout(r, 500)); // Wait for cursor to arrive
        if (!mounted) return;

        // Click effect
        setActiveTimerId(1);

        // Step 4: Show Display
        await new Promise(r => setTimeout(r, 300));
        if (!mounted) return;
        setStep('display');
        setCursorVisible(false);

        // Countdown
        const startTime = Date.now();
        while (Date.now() - startTime < 5000) { // Run for 5 seconds
          if (!mounted) return;
          setCountdown(600 - Math.floor((Date.now() - startTime) / 1000));
          await new Promise(r => setTimeout(r, 100));
        }

        await new Promise(r => setTimeout(r, 2000));
      }
    };

    runSequence();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box
      style={{
        position: 'relative',
        height: '500px',
        width: '100%',
        perspective: '1000px',
      }}
    >
      <AnimatePresence mode="wait">
        {step === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '30%',
              left: '10%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <Paper
              radius="xl"
              p="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              <Stack gap="md">
                <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                  Ask AI to create your timer
                </Text>
                <Box
                  p="md"
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'monospace', color: '#333' }}>
                    {typedText}
                    <span style={{ animation: 'blink 1s infinite' }}>|</span>
                  </Text>
                </Box>
              </Stack>
            </Paper>
          </motion.div>
        )}

        {step === 'timers' && (
          <motion.div
            key="timers"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)', // This is overridden by motion, need to handle centering differently or use x/y
              width: '100%',
              maxWidth: '450px',
              x: '-50%',
              y: '-50%',
            }}
          >
            <Stack gap="md">
              {[1, 2, 3].map((id) => (
                <MockTimerCard key={id} id={id} isActive={activeTimerId === id} />
              ))}
            </Stack>

            {/* Cursor */}
            {cursorVisible && (
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <Box
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`,
                    transition: 'transform 1s ease-in-out',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                    <path d="M5 5L12 25L16 17L24 16L5 5Z" fill="black" stroke="white" strokeWidth="2" />
                  </svg>
                </Box>
              </Box>
            )}
          </motion.div>
        )}

        {step === 'display' && (
          <motion.div
            key="display"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              maxWidth: '600px',
              x: '-50%',
              y: '-50%',
            }}
          >
            <Paper
              radius="lg"
              style={{
                background: '#000',
                aspectRatio: '16/9',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                border: `4px solid ${getProgressColor(countdown)}`,
                transition: 'border-color 0.1s ease',
                position: 'relative',
              }}
            >
              {/* Logo */}
              <Box
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 10,
                  width: 50,
                  height: 50,
                }}
              >
                <Logo size={50} />
              </Box>

              {/* Main Timer - centered, takes up most of space */}
              <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Text
                  c="white"
                  style={{
                    fontSize: '5rem',
                    fontFamily: 'Roboto Mono',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                </Text>
                <Box style={{ marginTop: '1rem' }}>
                  <Text c="white" ta="center" size="lg" style={{ fontFamily: 'Roboto Mono' }}>
                    Speaker 1: Introduction
                  </Text>
                </Box>
              </Box>

              {/* Three-color Progress Bar at Bottom */}
              <Box style={{ position: 'relative', height: '8px', width: '100%' }}>
                <Progress.Root size="8" radius="0" style={{ width: '100%' }}>
                  {getProgressSections(countdown)}
                </Progress.Root>
                <Box
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${Math.max(0, Math.min(100, (countdown / 600) * 100))}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '4px',
                    height: '16px',
                    backgroundColor: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    transition: 'left 100ms linear',
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
}

function MockTimerCard({ id, isActive }: { id: number; isActive: boolean }) {
  const titles = ['Brainstorming', 'Discussion', 'Wrap-up'];
  const durations = ['10:00', '15:00', '05:00'];
  const speakers = ['Speaker 1', 'Speaker 2', 'Speaker 3'];

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={{
        borderColor: isActive ? 'var(--mantine-color-blue-4)' : undefined,
        backgroundColor: isActive ? 'var(--mantine-color-blue-0)' : 'white',
        transition: 'all 0.2s',
      }}
    >
      <Group justify="space-between">
        <Group gap="sm">
          <IconGripVertical size={16} color="gray" />
          <RingProgress
            size={32}
            thickness={3}
            roundCaps
            sections={[{ value: 100, color: 'blue' }]}
          />
          <Stack gap={0}>
            <Text size="sm" fw={600}>{titles[id - 1]}</Text>
            <Text size="xs" c="dimmed">{speakers[id - 1]}</Text>
          </Stack>
        </Group>

        <Group gap="xs">
          <Group gap={4} style={{ background: '#f1f3f5', padding: '4px 8px', borderRadius: '4px' }}>
            <IconClock size={12} />
            <Text size="xs" fw={500}>{durations[id - 1]}</Text>
          </Group>
          <ActionIcon variant="light" color="blue" radius="xl" size="sm">
            <IconPlayerPlay size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
