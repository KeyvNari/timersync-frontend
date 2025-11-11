import {
  Container,
  Stack,
  Text,
  Button,
  Group,
  Badge,
  Box,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconClock, IconArrowRight, IconSparkles, IconBolt } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
  animationStyle?: React.CSSProperties;
}

export function Hero({ onScrollToSection, animationStyle }: HeroProps) {
  const navigate = useNavigate();

  const getAnimationStyle = (delay = 0): React.CSSProperties => ({
    opacity: animationStyle?.opacity ?? 0,
    transform: animationStyle?.transform ?? 'translateY(50px)',
    transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  return (
    <Box
      id="hero"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: '5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Grid Background */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }}
      />

      <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" py={{ base: 60, sm: 80 }}>
          {/* Animated Badge */}
          <Badge
            size="xl"
            variant="light"
            leftSection={<IconSparkles size={16} />}
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
              color: '#667eea',
              fontWeight: 600,
              padding: '12px 24px',
              fontSize: '14px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              animation: 'slideDown 0.8s ease-out',
            }}
          >
            🎉 Trusted by 50,000+ teams worldwide
          </Badge>

          {/* Main Heading */}
          <Box style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
            <Title
              order={1}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                textAlign: 'center',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-2px',
                marginBottom: '0.5rem',
              }}
            >
              Time Management
            </Title>
            <Title
              order={1}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                textAlign: 'center',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-2px',
              }}
            >
              Reimagined for Modern Teams
            </Title>
          </Box>

          {/* Subtitle */}
          <Text
            size="xl"
            style={{
              color: '#495057',
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.7,
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              animation: 'fadeInUp 1s ease-out 0.4s both',
            }}
          >
            Sync timers across your entire team in real-time. Collaborate effortlessly with
            precision controls, intelligent notifications, and enterprise-grade security.
          </Text>

          {/* CTA Buttons */}
          <Group gap="lg" style={{ animation: 'fadeInUp 1s ease-out 0.6s both' }}>
            <Button
              size="xl"
              radius="xl"
              variant="gradient"
              gradient={{ from: 'grape', to: 'violet' }}
              rightSection={<IconArrowRight size={20} />}
              style={{
                fontWeight: 700,
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/auth/register')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.4)';
              }}
            >
              Start Free Trial
            </Button>
            <Button
              size="xl"
              radius="xl"
              variant="light"
              color="grape"
              rightSection={<IconBolt size={20} />}
              style={{
                fontWeight: 700,
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s ease',
              }}
              onClick={() => onScrollToSection('features')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
              }}
            >
              Watch Demo
            </Button>
          </Group>

          {/* Trust Indicators */}
          <Text
            size="sm"
            style={{
              color: '#868e96',
              animation: 'fadeInUp 1s ease-out 0.8s both',
            }}
          >
            ✓ No credit card required · ✓ 14-day free trial · ✓ Cancel anytime
          </Text>

          {/* Hero Image/Mockup Placeholder */}
          <Box
            style={{
              width: '100%',
              maxWidth: '1100px',
              marginTop: '3rem',
              animation: 'fadeInUp 1s ease-out 1s both',
            }}
          >
            <Box
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 30px 90px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2px',
              }}
            >
              <Box
                style={{
                  background: 'white',
                  borderRadius: '22px',
                  padding: '3rem',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon
                    size={100}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: 'grape', to: 'violet' }}
                    style={{ boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)' }}
                  >
                    <IconClock size={60} />
                  </ThemeIcon>
                  <Text size="xl" fw={600} c="dimmed">
                    Dashboard Preview
                  </Text>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
