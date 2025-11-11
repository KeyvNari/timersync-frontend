// src/pages/landing.tsx
import {
  Container,
  Stack,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Box,
  ThemeIcon,
  Title,
  SimpleGrid,
  Avatar,
  Paper,
  Anchor,
  Burger,
  Drawer,
  rem,
} from '@mantine/core';
import {
  IconClock,
  IconUsers,
  IconBell,
  IconTarget,
  IconFlare,
  IconLock,
  IconCheck,
  IconStar,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

export default function LandingPage() {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [opened, { toggle, close }] = useDisclosure(false);

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

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager at TechCorp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content:
        'VeroTime has transformed how our team coordinates meetings and deadlines. The real-time sync is flawless!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Team Lead at StartupX',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      content:
        'Best timer app we have used. The collaborative features make it perfect for distributed teams.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Project Coordinator at DesignHub',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      content:
        'Simple, elegant, and powerful. VeroTime helps us stay on track without the complexity of other tools.',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals and small teams',
      features: [
        'Up to 3 timers',
        'Basic synchronization',
        'Mobile & desktop apps',
        'Email notifications',
        'Community support',
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'per month',
      description: 'Best for growing teams and professionals',
      features: [
        'Unlimited timers',
        'Advanced sync features',
        'Priority support',
        'Custom notifications',
        'Team collaboration',
        'Analytics & reports',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations with special needs',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
        'Training & onboarding',
      ],
      highlighted: false,
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

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      close();
    }
  };

  return (
    <Stack gap={0}>
      {/* Header Menu */}
      <Box
        component="header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e9ecef',
        }}
      >
        <Container size="lg">
          <Group justify="space-between" h={60}>
            <Group>
              <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'grape', to: 'violet' }}>
                <IconClock size={20} />
              </ThemeIcon>
              <Text size="xl" fw={700} style={{ color: '#667eea' }}>
                VeroTime
              </Text>
            </Group>

            {/* Desktop Navigation */}
            <Group gap="xl" visibleFrom="sm">
              <Anchor
                component="button"
                onClick={() => scrollToSection('features')}
                style={{ color: '#495057', fontWeight: 500 }}
              >
                Features
              </Anchor>
              <Anchor
                component="button"
                onClick={() => scrollToSection('testimonials')}
                style={{ color: '#495057', fontWeight: 500 }}
              >
                Testimonials
              </Anchor>
              <Anchor
                component="button"
                onClick={() => scrollToSection('pricing')}
                style={{ color: '#495057', fontWeight: 500 }}
              >
                Pricing
              </Anchor>
              <Button variant="subtle" onClick={() => navigate('/auth/login')}>
                Sign In
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: 'grape', to: 'violet' }}
                onClick={() => navigate('/auth/register')}
              >
                Get Started
              </Button>
            </Group>

            {/* Mobile Menu Toggle */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          </Group>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer opened={opened} onClose={close} position="right" title="Menu">
        <Stack gap="md">
          <Anchor
            component="button"
            onClick={() => scrollToSection('features')}
            style={{ color: '#495057', fontWeight: 500 }}
          >
            Features
          </Anchor>
          <Anchor
            component="button"
            onClick={() => scrollToSection('testimonials')}
            style={{ color: '#495057', fontWeight: 500 }}
          >
            Testimonials
          </Anchor>
          <Anchor
            component="button"
            onClick={() => scrollToSection('pricing')}
            style={{ color: '#495057', fontWeight: 500 }}
          >
            Pricing
          </Anchor>
          <Button variant="subtle" onClick={() => navigate('/auth/login')} fullWidth>
            Sign In
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'grape', to: 'violet' }}
            onClick={() => navigate('/auth/register')}
            fullWidth
          >
            Get Started
          </Button>
        </Stack>
      </Drawer>

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
          paddingTop: '5rem',
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
              VeroTime - Modern Timer Synchronization
            </Badge>

            <Title
              order={1}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
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
              Sync timers across your team in real-time. Collaborate effortlessly with precision
              controls, instant notifications, and enterprise-grade security.
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
                onClick={() => navigate('/auth/register')}
              >
                Get Started Free
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
                onClick={() => scrollToSection('features')}
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
        style={{ backgroundColor: '#f8f9fa', padding: '6rem 1rem', ...getAnimationStyle('features') }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" mb="4rem">
            <Title order={2} style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center' }}>
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
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <ThemeIcon size="lg" radius="md" variant="light" color="grape" mb="md">
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

      {/* Testimonials Section */}
      <Box
        id="testimonials"
        ref={(el) => {
          if (el) sectionRefs.current['testimonials'] = el;
        }}
        style={{
          backgroundColor: 'white',
          padding: '6rem 1rem',
          ...getAnimationStyle('testimonials'),
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" mb="4rem">
            <Title order={2} style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center' }}>
              Loved by Teams Worldwide
            </Title>
            <Text
              size="lg"
              style={{
                color: '#666',
                textAlign: 'center',
                maxWidth: 600,
              }}
            >
              See what our customers have to say about VeroTime
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {testimonials.map((testimonial, index) => (
              <Paper
                key={index}
                p="xl"
                radius="md"
                withBorder
                style={{
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
              >
                <Stack gap="md">
                  <Group gap="xs">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <IconStar key={i} size={16} fill="#ffd700" color="#ffd700" />
                    ))}
                  </Group>
                  <Text size="sm" style={{ color: '#495057', lineHeight: 1.6 }}>
                    {testimonial.content}
                  </Text>
                  <Group gap="sm" mt="md">
                    <Avatar src={testimonial.avatar} radius="xl" size="md" />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>
                        {testimonial.name}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {testimonial.role}
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box
        id="pricing"
        ref={(el) => {
          if (el) sectionRefs.current['pricing'] = el;
        }}
        style={{
          backgroundColor: '#f8f9fa',
          padding: '6rem 1rem',
          ...getAnimationStyle('pricing'),
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="xl" mb="4rem">
            <Title order={2} style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center' }}>
              Simple, Transparent Pricing
            </Title>
            <Text
              size="lg"
              style={{
                color: '#666',
                textAlign: 'center',
                maxWidth: 600,
              }}
            >
              Choose the perfect plan for your team
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                p="xl"
                radius="md"
                withBorder
                style={{
                  backgroundColor: plan.highlighted ? '#667eea' : 'white',
                  borderColor: plan.highlighted ? '#667eea' : '#dee2e6',
                  borderWidth: plan.highlighted ? 2 : 1,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                {plan.highlighted && (
                  <Badge
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'white',
                      color: '#667eea',
                    }}
                  >
                    Most Popular
                  </Badge>
                )}
                <Stack gap="lg">
                  <div>
                    <Text
                      size="xl"
                      fw={700}
                      style={{ color: plan.highlighted ? 'white' : '#212529' }}
                    >
                      {plan.name}
                    </Text>
                    <Text
                      size="sm"
                      style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : '#868e96' }}
                    >
                      {plan.description}
                    </Text>
                  </div>

                  <div>
                    <Group gap={4} align="baseline">
                      <Text
                        size={rem(40)}
                        fw={900}
                        style={{ color: plan.highlighted ? 'white' : '#212529' }}
                      >
                        {plan.price}
                      </Text>
                      <Text
                        size="sm"
                        style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : '#868e96' }}
                      >
                        {plan.period}
                      </Text>
                    </Group>
                  </div>

                  <Button
                    size="md"
                    radius="md"
                    fullWidth
                    variant={plan.highlighted ? 'white' : 'gradient'}
                    gradient={{ from: 'grape', to: 'violet' }}
                    style={
                      plan.highlighted
                        ? {
                            backgroundColor: 'white',
                            color: '#667eea',
                            fontWeight: 600,
                          }
                        : {}
                    }
                    onClick={() => navigate('/auth/register')}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>

                  <Stack gap="sm">
                    {plan.features.map((feature, idx) => (
                      <Group key={idx} gap="xs">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant="light"
                          color={plan.highlighted ? 'white' : 'grape'}
                          style={
                            plan.highlighted
                              ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                              : {}
                          }
                        >
                          <IconCheck size={14} />
                        </ThemeIcon>
                        <Text
                          size="sm"
                          style={{ color: plan.highlighted ? 'rgba(255,255,255,0.95)' : '#495057' }}
                        >
                          {feature}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
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
              Join thousands of teams already using VeroTime to collaborate and manage their
              schedules more effectively.
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
                onClick={() => navigate('/auth/register')}
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
        style={{ backgroundColor: '#1a1a1a', padding: '3rem 1rem', ...getAnimationStyle('footer') }}
      >
        <Container size="lg">
          <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
              <Stack gap="xs">
                <Group>
                  <ThemeIcon
                    size="md"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'grape', to: 'violet' }}
                  >
                    <IconClock size={18} />
                  </ThemeIcon>
                  <Text style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                    VeroTime
                  </Text>
                </Group>
                <Text size="sm" style={{ color: '#999', maxWidth: 250 }}>
                  Modern time synchronization for teams. Collaborate effortlessly with real-time
                  timer management.
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text style={{ color: 'white', fontWeight: 700 }}>Product</Text>
                <Anchor
                  component="button"
                  onClick={() => scrollToSection('features')}
                  size="sm"
                  style={{ color: '#999' }}
                >
                  Features
                </Anchor>
                <Anchor
                  component="button"
                  onClick={() => scrollToSection('pricing')}
                  size="sm"
                  style={{ color: '#999' }}
                >
                  Pricing
                </Anchor>
                <Anchor
                  component="button"
                  onClick={() => scrollToSection('testimonials')}
                  size="sm"
                  style={{ color: '#999' }}
                >
                  Testimonials
                </Anchor>
              </Stack>

              <Stack gap="xs">
                <Text style={{ color: 'white', fontWeight: 700 }}>Company</Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  About Us
                </Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Careers
                </Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Contact
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text style={{ color: 'white', fontWeight: 700 }}>Legal</Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Privacy Policy
                </Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Terms of Service
                </Text>
                <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                  Cookie Policy
                </Text>
              </Stack>
            </SimpleGrid>

            <Box style={{ borderTop: '1px solid #333', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <Group justify="space-between">
                <Text size="sm" style={{ color: '#666' }}>
                  © 2024 VeroTime. All rights reserved.
                </Text>
                <Group gap="xl">
                  <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                    Twitter
                  </Text>
                  <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                    LinkedIn
                  </Text>
                  <Text size="sm" style={{ color: '#999', cursor: 'pointer' }}>
                    GitHub
                  </Text>
                </Group>
              </Group>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}
