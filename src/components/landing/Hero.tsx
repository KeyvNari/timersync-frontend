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
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowRight, IconSparkles, IconPlayerPlay } from '@tabler/icons-react';
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
        paddingTop: '4rem',
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

      <Container size="xl" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Grid gutter={60} align="center">
          {/* Left Column - Text Content (Compact) */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg" align="flex-start">
              {/* Animated Badge */}
              <Badge
                size="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                leftSection={<IconSparkles size={12} />}
                style={{
                  textTransform: 'none',
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
                    fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                    fontWeight: 800,
                    textAlign: 'start',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    letterSpacing: '-0.5px',
                    marginBottom: '0.25rem',
                  }}
                >
                  Create remote-controlled countdown timers
                </Title>
                <Title
                  order={1}
                  style={{
                    fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                    fontWeight: 800,
                    textAlign: 'start',
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #228be6 0%, #15aabf 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}
                >
                  share easily with others.
                </Title>
              </Box>

              {/* Subtitle */}
              <Text
                size="lg"
                c="dimmed"
                style={{
                  textAlign: 'start',
                  lineHeight: 1.5,
                  fontSize: '1rem',
                  maxWidth: '90%',
                  animation: 'fadeInUp 1s ease-out 0.4s both',
                }}
              >
                Show a fullscreen timer to your presenter while you control it from another device.
              </Text>

              {/* CTA Buttons */}
              <Group gap="md" style={{ animation: 'fadeInUp 1s ease-out 0.6s both' }}>
                <Button
                  size="md"
                  radius="xl"
                  color="blue"
                  rightSection={<IconArrowRight size={18} />}
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
                  size="md"
                  radius="xl"
                  variant="default"
                  leftSection={<IconPlayerPlay size={18} />}
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

          {/* Right Column - Diagonal Interactive Flow Animation */}
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
  const fullText = "Create timers based on the uploaded file";
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(600);
  const [showCursor, setShowCursor] = useState(false);

  // Animation Sequence
  useEffect(() => {
    let mounted = true;

    const runSequence = async () => {
      while (mounted) {
        // Reset
        setStep('prompt');
        setTypedText('');
        setActiveTimerId(null);
        setCountdown(600);
        setShowCursor(false);

        // Step 1: Typing in Prompt
        await new Promise(r => setTimeout(r, 500));
        for (let i = 0; i <= fullText.length; i++) {
          if (!mounted) return;
          setTypedText(fullText.slice(0, i));
          await new Promise(r => setTimeout(r, 50));
        }
        await new Promise(r => setTimeout(r, 500));

        // Step 2: Transition to Timers
        if (!mounted) return;
        setStep('timers');

        // Cursor Animation
        await new Promise(r => setTimeout(r, 500));
        if (!mounted) return;
        setShowCursor(true);
        // Start cursor at bottom right of timers
        setCursorPosition({ x: 100, y: 100 });

        // Move to play button
        await new Promise(r => setTimeout(r, 100));
        if (!mounted) return;

        await new Promise(r => setTimeout(r, 800)); // Wait for move
        if (!mounted) return;
        setActiveTimerId(1); // Click effect

        // Step 3: Transition to Display
        await new Promise(r => setTimeout(r, 600));
        if (!mounted) return;
        setStep('display');
        setShowCursor(false);

        // Countdown
        const startTime = Date.now();
        while (Date.now() - startTime < 4000) { // Run for 4 seconds
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
        width: '100%',
        maxWidth: '550px',
        height: '450px',
        margin: '0 auto',
      }}
    >
      {/* 1. Prompt Component - Top Left */}
      <Box style={{ position: 'absolute', top: 0, left: 0, zIndex: step === 'prompt' ? 20 : 10 }}>
        <AnimatedComponent
          isActive={step === 'prompt'}
          label="1. Create"
        >
          <Paper
            radius="md"
            p="md"
            withBorder
            style={{
              width: '260px',
              height: '130px',
              background: '#25262b',
              borderColor: '#373A40',
              overflow: 'hidden',
              position: 'relative',
              color: '#C1C2C5'
            }}
          >
            <Text size="sm" c="dimmed" mb={8} fw={700}>Instruction</Text>
            <Box
              p="xs"
              style={{
                background: '#1A1B1E',
                borderRadius: '6px',
                height: '70px',
                border: '1px solid #373A40',
              }}
            >
              <Text size="sm" style={{ fontFamily: 'monospace', lineHeight: 1.4, color: '#E0E0E0' }}>
                {typedText}
                {step === 'prompt' && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
              </Text>
            </Box>
          </Paper>
        </AnimatedComponent>
      </Box>

      {/* Connector 1 */}
      <Box style={{ position: 'absolute', top: 115, left: 120, zIndex: 5 }}>
        <Connector active={step === 'timers' || step === 'display'} />
      </Box>

      {/* 2. Timers Component - Middle */}
      <Box style={{ position: 'absolute', top: 90, left: 100, zIndex: step === 'timers' ? 20 : 11 }}>
        <AnimatedComponent
          isActive={step === 'timers'}
          label="2. Control"
        >
          <Paper
            radius="md"
            p="md"
            withBorder
            style={{
              width: '260px',
              height: '160px',
              background: '#25262b',
              borderColor: '#373A40',
              overflow: 'hidden',
              position: 'relative',
              color: '#C1C2C5'
            }}
          >
            <Stack gap={8}>
              {[1, 2, 3].map((id) => (
                <Box
                  key={id}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: activeTimerId === id ? 'var(--mantine-color-blue-8)' : '#373A40',
                    backgroundColor: activeTimerId === id ? 'rgba(34, 139, 230, 0.15)' : '#1A1B1E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Box style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #5c5f66' }} />
                  <Box style={{ flex: 1 }}>
                    <Box style={{ width: '60%', height: 6, background: '#5c5f66', borderRadius: 3, marginBottom: 4 }} />
                    <Box style={{ width: '40%', height: 4, background: '#373A40', borderRadius: 2 }} />
                  </Box>
                  <IconPlayerPlay size={12} color="#909296" />
                </Box>
              ))}
            </Stack>

            {/* Cursor Overlay */}
            {showCursor && (
              <motion.div
                initial={{ x: 180, y: 120, opacity: 0 }}
                animate={{ x: 200, y: 40, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <path d="M5 5L12 25L16 17L24 16L5 5Z" fill="white" stroke="black" strokeWidth="2" />
                </svg>
              </motion.div>
            )}
          </Paper>
        </AnimatedComponent>
      </Box>

      {/* Connector 2 */}
      <Box style={{ position: 'absolute', top: 235, left: 220, zIndex: 5 }}>
        <Connector active={step === 'display'} />
      </Box>

      {/* 3. Display Component - Bottom Right */}
      <Box style={{ position: 'absolute', top: 200, left: 200, zIndex: step === 'display' ? 20 : 12 }}>
        <AnimatedComponent
          isActive={step === 'display'}
          label="3. View"
        >
          <Paper
            radius="md"
            withBorder
            style={{
              width: '280px',
              height: '160px',
              background: '#000',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: step === 'display' ? '2px solid #40c057' : '1px solid #333',
              boxShadow: step === 'display' ? '0 0 20px rgba(64, 192, 87, 0.3)' : 'none'
            }}
          >
            <Text c="white" fw={700} style={{ fontSize: '42px', fontFamily: 'monospace', letterSpacing: '2px' }}>
              {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
            </Text>
            <Box style={{ width: '80%', height: 6, background: '#333', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
              <Box
                style={{
                  width: `${(countdown / 600) * 100}%`,
                  height: '100%',
                  background: countdown < 60 ? 'red' : countdown < 180 ? 'orange' : 'green',
                  transition: 'width 0.1s linear'
                }}
              />
            </Box>
          </Paper>
        </AnimatedComponent>
      </Box>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <Box style={{ display: 'flex', gap: '6px', opacity: active ? 1 : 0.3, transition: 'opacity 0.5s', transform: 'rotate(45deg)' }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: active ? 'var(--mantine-color-blue-5)' : '#dee2e6',
          }}
        />
      ))}
    </Box>
  );
}

function AnimatedComponent({
  isActive,
  children,
  label,
}: {
  isActive: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Box style={{ position: 'relative' }}>
      {/* Label Badge */}
      <Box
        style={{
          position: 'absolute',
          top: -12,
          left: 10,
          zIndex: 10,
          background: isActive ? 'var(--mantine-color-blue-6)' : '#373A40',
          padding: '4px 12px',
          borderRadius: '12px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 700,
          transition: 'background-color 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {label}
      </Box>

      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
          opacity: isActive ? 1 : 0.85, // High opacity for readability
          filter: isActive ? 'brightness(1.1)' : 'brightness(0.9)',
        }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          transformOrigin: 'center center'
        }}
      >
        {children}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '18px',
              border: '2px solid var(--mantine-color-blue-4)',
              zIndex: -1,
            }}
          />
        )}
      </motion.div>
    </Box>
  );
}
