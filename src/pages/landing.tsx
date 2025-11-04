// src/pages/landing.tsx
import { Container, Stack, Text, Button, Group, Card, Badge, Box, ThemeIcon, Title, SimpleGrid } from '@mantine/core';
import { IconClock, IconUsers, IconBell, IconTarget, IconFlare, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const features = [
    {
      icon: IconClock,
      title: 'Real-Time Sync',
      description: 'Synchronize timers across all devices instantly with live updates.',
    },
    {
      icon: IconUsers,
      title: 'Collaborative',
      description: 'Share timer sessions with your team and stay coordinated together.',
    },
    {
      icon: IconBell,
      title: 'Smart Notifications',
      description: 'Get instant alerts and reminders for important timer milestones.',
    },
    {
      icon: IconTarget,
      title: 'Precision Control',
      description: 'Fine-tune every second with our intuitive timer controls.',
    },
    {
      icon: IconFlare,
      title: 'Lightning Fast',
      description: 'Optimized performance for smooth, responsive timer management.',
    },
    {
      icon: IconLock,
      title: 'Secure & Private',
      description: 'Your data is encrypted and your privacy is always protected.',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const getAnimationStyle = (sectionId: string) => ({
    opacity: visibleSections[sectionId] ? 1 : 0,
    transform: visibleSections[sectionId] ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
  });

  return (
    <Stack gap={0}>
      {/* Hero Section */}
      <Box
        id="hero"
        ref={(el) => {
          if (el) sectionRefs.current['hero'] = el;
        }}
        style={{
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          ...getAnimationStyle('hero'),
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" py={{ base: 40, sm: 80 }}>
            <Badge
              size="lg"
              variant="light"
              color="white"
              style={{ color: '#667eea', fontWeight: 600 }}
            >
              ⚡ VeroTime - Modern Timer Synchronization
            </Badge>

            <Title
              order={1}
              style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
              }}
              mb={0}
            >
              Time Management{' '}
              <Box component="span" style={{ color: '#a78bfa' }}>
                Reimagined
              </Box>
            </Title>

            <Text
              size="xl"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                maxWidth: 600,
              }}
            >
              Sync timers across your team in real-time. Collaborate effortlessly with precision controls, instant notifications, and enterprise-grade security.
            </Text>

            <Group gap="lg">
              <Button
                size="lg"
                radius="md"
                style={{
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  paddingLeft: '2rem',
                  paddingRight: '2rem',
                }}
                onClick={() => navigate('/timer')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                radius="md"
                variant="outline"
                color="white"
                style={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 700,
                  paddingLeft: '2rem',
                  paddingRight: '2rem',
                }}
              >
                Learn More
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        ref={(el) => {
          if (el) sectionRefs.current['features'] = el;
        }}
        style={{ backgroundColor: '#f8f9fa', padding: '6rem 1rem', ...getAnimationStyle('features') }}>
        <Container size="lg">
          <Stack align="center" gap="xl" mb="4rem">
            <Title order={2} style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              Powerful Features for Modern Teams
            </Title>
            <Text
              size="lg"
              style={{
                color: '#666',
                textAlign: 'center',
                maxWidth: 600,
              }}
            >
              Everything you need to manage time effectively and collaborate seamlessly
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  p="lg"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  className="hover-lift"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow =
                      '0 10px 25px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <ThemeIcon
                    size="lg"
                    radius="md"
                    variant="light"
                    color="grape"
                    mb="md"
                  >
                    <Icon size={24} />
                  </ThemeIcon>
                  <Title order={4} mb="xs">
                    {feature.title}
                  </Title>
                  <Text size="sm" color="dimmed">
                    {feature.description}
                  </Text>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        id="cta"
        ref={(el) => {
          if (el) sectionRefs.current['cta'] = el;
        }}
        style={{
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '4rem 1rem',
          ...getAnimationStyle('cta'),
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="lg">
            <Title
              order={2}
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
              }}
            >
              Ready to Transform Your Time Management?
            </Title>
            <Text
              size="lg"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                maxWidth: 600,
              }}
            >
              Join thousands of teams already using VeroTime to collaborate and manage their schedules more effectively.
            </Text>
            <Group gap="md">
              <Button
                size="lg"
                radius="md"
                style={{
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  paddingLeft: '2rem',
                  paddingRight: '2rem',
                }}
                onClick={() => navigate('/timer')}
              >
                Start Free Trial
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box
        id="footer"
        ref={(el) => {
          if (el) sectionRefs.current['footer'] = el;
        }}
        style={{ backgroundColor: '#1a1a1a', padding: '3rem 1rem', ...getAnimationStyle('footer') }}>
        <Container size="lg">
          <Stack gap="xl">
            <Group justify="space-between" grow>
              <Stack gap="xs">
                <Text style={{ color: 'white', fontWeight: 700 }}>VeroTime</Text>
                <Text size="sm" style={{ color: '#999' }}>
                  Modern time synchronization for teams
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text style={{ color: 'white', fontWeight: 700 }}>Product</Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Features
                </Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Pricing
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text style={{ color: 'white', fontWeight: 700 }}>Company</Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  About
                </Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Contact
                </Text>
              </Stack>
            </Group>
            <Box style={{ borderTop: '1px solid #333', paddingTop: '1rem' }}>
              <Text size="sm" style={{ color: '#666', textAlign: 'center' }}>
                © 2024 VeroTime. All rights reserved.
              </Text>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}
