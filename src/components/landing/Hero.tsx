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
} from '@mantine/core';
import { IconArrowRight, IconSparkles, IconBolt } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import dashboardImage from '../../assets/image_saas.png';

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

          {/* Main Content - Text and Image Side by Side */}
          <Grid gutter="xl" align="center" style={{ width: '100%', margin: 0 }}>
            {/* Left Column - Text Content */}
            <Grid.Col span={{ base: 12, sm: 12, md: 6 }}>
              <Stack gap="lg" align="flex-start">
                {/* Main Heading */}
                <Box style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
                  <Title
                    order={1}
                    style={{
                      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                      fontWeight: 900,
                      textAlign: 'start',
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
                      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                      fontWeight: 900,
                      textAlign: 'start',
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
                  size="lg"
                  style={{
                    color: '#495057',
                    textAlign: 'start',
                    lineHeight: 1.7,
                    fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
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
              </Stack>
            </Grid.Col>

            {/* Right Column - Dashboard Image */}
            <Grid.Col span={{ base: 12, sm: 12, md: 6 }}>
              <img
                src={dashboardImage}
                alt="Dashboard Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '24px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: '0 30px 90px rgba(0, 0, 0, 0.15)',
                  animation: 'fadeInUp 1s ease-out 1s both',
                }}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
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
      `}</style>
    </Box>
  );
}
