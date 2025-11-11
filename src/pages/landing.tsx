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
  Center,
  Image,
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
  IconArrowRight,
  IconSparkles,
  IconTrendingUp,
  IconShieldCheck,
  IconBolt,
  IconInfinity,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

export default function LandingPage() {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const features = [
    {
      icon: IconClock,
      title: 'Real-Time Sync',
      description: 'Synchronize timers across all devices instantly with live updates and zero latency.',
      gradient: { from: 'violet', to: 'purple' },
    },
    {
      icon: IconUsers,
      title: 'Team Collaboration',
      description: 'Share timer sessions with unlimited team members and stay perfectly coordinated.',
      gradient: { from: 'blue', to: 'cyan' },
    },
    {
      icon: IconBell,
      title: 'Smart Notifications',
      description: 'AI-powered alerts that learn your patterns and notify you at the perfect moment.',
      gradient: { from: 'pink', to: 'red' },
    },
    {
      icon: IconTarget,
      title: 'Precision Control',
      description: 'Millisecond-accurate timing with intuitive controls and keyboard shortcuts.',
      gradient: { from: 'orange', to: 'yellow' },
    },
    {
      icon: IconFlare,
      title: 'Lightning Performance',
      description: 'Built with cutting-edge technology for unparalleled speed and responsiveness.',
      gradient: { from: 'teal', to: 'green' },
    },
    {
      icon: IconLock,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, SOC 2 compliant, and GDPR ready for peace of mind.',
      gradient: { from: 'indigo', to: 'blue' },
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: IconUsers },
    { value: '99.9%', label: 'Uptime', icon: IconTrendingUp },
    { value: '24/7', label: 'Support', icon: IconShieldCheck },
    { value: '150+', label: 'Countries', icon: IconInfinity },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager at TechCorp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content:
        'VeroTime has completely revolutionized how our distributed team coordinates. The real-time sync is absolutely flawless, and the UI is a joy to use every single day.',
      rating: 5,
      company: 'TechCorp',
    },
    {
      name: 'Michael Chen',
      role: 'Engineering Lead at StartupX',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      content:
        'We tried 5 different timer apps before finding VeroTime. The collaborative features and performance are in a league of their own. Absolutely essential for our workflow.',
      rating: 5,
      company: 'StartupX',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Creative Director at DesignHub',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      content:
        'Beautiful design meets powerful functionality. VeroTime helps our creative team stay on track without the bloat and complexity of traditional project management tools.',
      rating: 5,
      company: 'DesignHub',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals and small teams getting started',
      features: [
        'Up to 5 timers',
        'Basic synchronization',
        'Mobile & desktop apps',
        'Email notifications',
        'Community support',
        '7-day history',
      ],
      highlighted: false,
      cta: 'Start Free',
    },
    {
      name: 'Professional',
      price: '$12',
      period: 'per user/month',
      description: 'Best for growing teams and power users',
      features: [
        'Unlimited timers',
        'Advanced sync & automation',
        'Priority support 24/7',
        'Custom notifications',
        'Team collaboration',
        'Analytics & insights',
        'API access',
        'Unlimited history',
      ],
      highlighted: true,
      cta: 'Start 14-Day Trial',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        '99.99% SLA guarantee',
        'Advanced security & SSO',
        'White-label options',
        'Training & onboarding',
        'Custom contracts',
      ],
      highlighted: false,
      cta: 'Contact Sales',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

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

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const getAnimationStyle = (sectionId: string, delay = 0) => ({
    opacity: visibleSections[sectionId] ? 1 : 0,
    transform: visibleSections[sectionId] ? 'translateY(0)' : 'translateY(50px)',
    transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      close();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Animated Background Elements */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* Gradient Orbs */}
        <Box
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 25s ease-in-out infinite',
            animationDelay: '5s',
          }}
        />
      </Box>

      {/* Header Menu */}
      <Box
        component="header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'white',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.05)' : 'none',
        }}
      >
        <Container size="xl">
          <Group justify="space-between" align="center" py="md">
            <Group gap="xs">
              <Image
                src="/logo-light-full.png"
                alt="VeroTime Logo"
                height={60}
                width="auto"
                fit="contain"
              />
            </Group>

            {/* Desktop Navigation */}
            <Group gap="xl" visibleFrom="sm">
              <Anchor
                component="button"
                onClick={() => scrollToSection('features')}
                style={{
                  color: '#495057',
                  fontWeight: 600,
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#495057';
                }}
              >
                Features
              </Anchor>
              <Anchor
                component="button"
                onClick={() => scrollToSection('testimonials')}
                style={{
                  color: '#495057',
                  fontWeight: 600,
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#495057';
                }}
              >
                Testimonials
              </Anchor>
              <Anchor
                component="button"
                onClick={() => scrollToSection('pricing')}
                style={{
                  color: '#495057',
                  fontWeight: 600,
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#495057';
                }}
              >
                Pricing
              </Anchor>
              <Button
                variant="subtle"
                onClick={() => navigate('/auth/login')}
                style={{
                  fontWeight: 600,
                  color: '#495057',
                }}
              >
                Sign In
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: 'grape', to: 'violet' }}
                onClick={() => navigate('/auth/register')}
                rightSection={<IconArrowRight size={18} />}
                style={{
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
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
      <Drawer opened={opened} onClose={close} position="right" title="Menu" size="sm">
        <Stack gap="md">
          <Anchor
            component="button"
            onClick={() => scrollToSection('features')}
            style={{ color: '#495057', fontWeight: 600, fontSize: '16px' }}
          >
            Features
          </Anchor>
          <Anchor
            component="button"
            onClick={() => scrollToSection('testimonials')}
            style={{ color: '#495057', fontWeight: 600, fontSize: '16px' }}
          >
            Testimonials
          </Anchor>
          <Anchor
            component="button"
            onClick={() => scrollToSection('pricing')}
            style={{ color: '#495057', fontWeight: 600, fontSize: '16px' }}
          >
            Pricing
          </Anchor>
          <Button variant="subtle" onClick={() => navigate('/auth/login')} fullWidth size="md">
            Sign In
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'grape', to: 'violet' }}
            onClick={() => navigate('/auth/register')}
            fullWidth
            size="md"
            rightSection={<IconArrowRight size={18} />}
          >
            Get Started
          </Button>
        </Stack>
      </Drawer>

      <Stack gap={0} style={{ flex: 1, paddingTop: '70px', position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box
          id="hero"
          ref={(el) => {
            if (el) sectionRefs.current['hero'] = el;
          }}
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
                  onClick={() => scrollToSection('features')}
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

        {/* Stats Section */}
        <Box
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '4rem 1rem',
          }}
        >
          <Container size="xl">
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xl">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Center key={index}>
                    <Stack align="center" gap="xs">
                      <Icon size={32} color="white" opacity={0.9} />
                      <Text
                        size="2.5rem"
                        fw={900}
                        style={{ color: 'white', lineHeight: 1 }}
                      >
                        {stat.value}
                      </Text>
                      <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {stat.label}
                      </Text>
                    </Stack>
                  </Center>
                );
              })}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box
          id="features"
          ref={(el) => {
            if (el) sectionRefs.current['features'] = el;
          }}
          style={{
            backgroundColor: '#ffffff',
            padding: '8rem 1rem',
            position: 'relative',
          }}
        >
          <Container size="xl">
            <Stack align="center" gap="xl" mb="5rem" style={getAnimationStyle('features')}>
              <Badge
                size="lg"
                variant="light"
                color="grape"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                POWERFUL FEATURES
              </Badge>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 900,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #667eea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                }}
              >
                Everything You Need to Succeed
              </Title>
              <Text
                size="xl"
                style={{
                  color: '#666',
                  textAlign: 'center',
                  maxWidth: 700,
                  lineHeight: 1.7,
                }}
              >
                Built for modern teams who demand the best. Experience the perfect blend of
                simplicity and power.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    p="xl"
                    radius="xl"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #f1f3f5',
                      cursor: 'pointer',
                      ...getAnimationStyle('features', index * 0.1),
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#f1f3f5';
                    }}
                  >
                    <Stack gap="lg">
                      <Box
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${
                            feature.gradient.from === 'violet' ? '#667eea' : 
                            feature.gradient.from === 'blue' ? '#4dabf7' :
                            feature.gradient.from === 'pink' ? '#ff6b6b' :
                            feature.gradient.from === 'orange' ? '#ff922b' :
                            feature.gradient.from === 'teal' ? '#20c997' :
                            '#667eea'
                          } 0%, ${
                            feature.gradient.to === 'purple' ? '#764ba2' :
                            feature.gradient.to === 'cyan' ? '#22b8cf' :
                            feature.gradient.to === 'red' ? '#fa5252' :
                            feature.gradient.to === 'yellow' ? '#ffd43b' :
                            feature.gradient.to === 'green' ? '#51cf66' :
                            '#764ba2'
                          } 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 10px 30px ${
                            feature.gradient.from === 'violet' ? 'rgba(102, 126, 234, 0.3)' :
                            feature.gradient.from === 'blue' ? 'rgba(77, 171, 247, 0.3)' :
                            feature.gradient.from === 'pink' ? 'rgba(255, 107, 107, 0.3)' :
                            feature.gradient.from === 'orange' ? 'rgba(255, 146, 43, 0.3)' :
                            feature.gradient.from === 'teal' ? 'rgba(32, 201, 151, 0.3)' :
                            'rgba(102, 126, 234, 0.3)'
                          }`,
                        }}
                      >
                        <Icon size={30} color="white" />
                      </Box>
                      <div>
                        <Title order={3} mb="xs" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                          {feature.title}
                        </Title>
                        <Text size="md" color="dimmed" style={{ lineHeight: 1.6 }}>
                          {feature.description}
                        </Text>
                      </div>
                    </Stack>
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
            backgroundColor: '#f8f9ff',
            padding: '8rem 1rem',
          }}
        >
          <Container size="xl">
            <Stack align="center" gap="xl" mb="5rem" style={getAnimationStyle('testimonials')}>
              <Badge
                size="lg"
                variant="light"
                color="grape"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                TESTIMONIALS
              </Badge>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 900,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #667eea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                }}
              >
                Loved by Teams Worldwide
              </Title>
              <Text
                size="xl"
                style={{
                  color: '#666',
                  textAlign: 'center',
                  maxWidth: 700,
                  lineHeight: 1.7,
                }}
              >
                Join thousands of satisfied customers who transformed their workflow with VeroTime
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {testimonials.map((testimonial, index) => (
                <Paper
                  key={index}
                  p="xl"
                  radius="xl"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #f1f3f5',
                    ...getAnimationStyle('testimonials', index * 0.15),
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f1f3f5';
                  }}
                >
                  <Stack gap="lg">
                    <Group gap="xs">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <IconStar key={i} size={18} fill="#ffd700" color="#ffd700" />
                      ))}
                    </Group>
                    <Text size="md" style={{ color: '#495057', lineHeight: 1.7, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Text>
                    <Group gap="sm" mt="md">
                      <Avatar
                        src={testimonial.avatar}
                        radius="xl"
                        size="lg"
                        style={{
                          border: '2px solid #f1f3f5',
                        }}
                      />
                      <Stack gap={2}>
                        <Text size="sm" fw={700} style={{ color: '#212529' }}>
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
            backgroundColor: '#ffffff',
            padding: '8rem 1rem',
          }}
        >
          <Container size="xl">
            <Stack align="center" gap="xl" mb="5rem" style={getAnimationStyle('pricing')}>
              <Badge
                size="lg"
                variant="light"
                color="grape"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                PRICING
              </Badge>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 900,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #667eea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                }}
              >
                Simple, Transparent Pricing
              </Title>
              <Text
                size="xl"
                style={{
                  color: '#666',
                  textAlign: 'center',
                  maxWidth: 700,
                  lineHeight: 1.7,
                }}
              >
                Choose the perfect plan for your team. Always know what you'll pay.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  p="xl"
                  radius="xl"
                  style={{
                    backgroundColor: plan.highlighted ? '#667eea' : 'white',
                    border: plan.highlighted ? '2px solid #667eea' : '1px solid #f1f3f5',
                    position: 'relative',
                    ...getAnimationStyle('pricing', index * 0.15),
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = plan.highlighted ? 'scale(1.05)' : 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = plan.highlighted
                      ? '0 30px 80px rgba(102, 126, 234, 0.35)'
                      : '0 20px 60px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = plan.highlighted
                      ? '0 20px 60px rgba(102, 126, 234, 0.25)'
                      : 'none';
                  }}
                >
                  {plan.highlighted && (
                    <Badge
                      variant="light"
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'white',
                        color: '#667eea',
                        fontWeight: 700,
                        padding: '8px 16px',
                        fontSize: '12px',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      ⭐ MOST POPULAR
                    </Badge>
                  )}
                  <Stack gap="xl" style={{ height: '100%' }}>
                    <div>
                      <Text
                        size="xl"
                        fw={800}
                        mb="xs"
                        style={{
                          color: plan.highlighted ? 'white' : '#212529',
                          fontSize: '1.5rem',
                        }}
                      >
                        {plan.name}
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          color: plan.highlighted ? 'rgba(255,255,255,0.9)' : '#868e96',
                          lineHeight: 1.5,
                        }}
                      >
                        {plan.description}
                      </Text>
                    </div>

                    <div>
                      <Group gap={4} align="baseline">
                        <Text
                          style={{
                            fontSize: rem(48),
                            fontWeight: 900,
                            color: plan.highlighted ? 'white' : '#212529',
                            lineHeight: 1,
                          }}
                        >
                          {plan.price}
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: plan.highlighted ? 'rgba(255,255,255,0.8)' : '#868e96',
                          }}
                        >
                          {plan.period}
                        </Text>
                      </Group>
                    </div>

                    <Button
                      size="lg"
                      radius="xl"
                      fullWidth
                      variant={plan.highlighted ? 'white' : 'gradient'}
                      gradient={{ from: 'grape', to: 'violet' }}
                      rightSection={<IconArrowRight size={18} />}
                      style={{
                        fontWeight: 700,
                        ...(plan.highlighted
                          ? {
                              backgroundColor: 'white',
                              color: '#667eea',
                            }
                          : {}),
                      }}
                      onClick={() => navigate('/auth/register')}
                    >
                      {plan.cta}
                    </Button>

                    <Stack gap="md">
                      {plan.features.map((feature, idx) => (
                        <Group key={idx} gap="xs" wrap="nowrap">
                          <ThemeIcon
                            size={24}
                            radius="xl"
                            variant="light"
                            color={plan.highlighted ? 'white' : 'grape'}
                            style={{
                              flexShrink: 0,
                              ...(plan.highlighted
                                ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                                : {}),
                            }}
                          >
                            <IconCheck size={16} />
                          </ThemeIcon>
                          <Text
                            size="sm"
                            style={{
                              color: plan.highlighted ? 'rgba(255,255,255,0.95)' : '#495057',
                              lineHeight: 1.5,
                            }}
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '6rem 1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative Elements */}
          <Box
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(80px)',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '-150px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(100px)',
            }}
          />

          <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
            <Stack align="center" gap="xl" style={getAnimationStyle('cta')}>
              <Title
                order={2}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  textAlign: 'center',
                  letterSpacing: '-1px',
                }}
              >
                Ready to Transform Your Workflow?
              </Title>
              <Text
                size="xl"
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  textAlign: 'center',
                  maxWidth: 700,
                  lineHeight: 1.7,
                }}
              >
                Join thousands of teams already using VeroTime to collaborate smarter and achieve
                more. Start your free 14-day trial today—no credit card required.
              </Text>
              <Group gap="md">
                <Button
                  size="xl"
                  radius="xl"
                  rightSection={<IconArrowRight size={20} />}
                  style={{
                    backgroundColor: 'white',
                    color: '#667eea',
                    fontWeight: 700,
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => navigate('/auth/register')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  Start Free Trial
                </Button>
              </Group>
              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                ✓ No credit card required · ✓ 14-day free trial · ✓ Full access to all features
              </Text>
            </Stack>
          </Container>
        </Box>

        {/* Footer Section */}
        <Box
          id="footer"
          ref={(el) => {
            if (el) sectionRefs.current['footer'] = el;
          }}
          style={{
            backgroundColor: '#0a0a0a',
            padding: '4rem 1rem 2rem',
          }}
        >
          <Container size="xl">
            <Stack gap="3rem">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                <Stack gap="md">
                  <Group gap="xs">
                    
                    <Image
                src="/logo-dark-full.png"
                alt="VeroTime Logo"
                height={60}
                width="auto"
                fit="contain"
              />
                  </Group>
                  <Text size="sm" style={{ color: '#999', maxWidth: 280, lineHeight: 1.6 }}>
                    Modern time synchronization for teams. Collaborate effortlessly with real-time
                    timer management and precision controls.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>
                    Product
                  </Text>
                  <Anchor
                    component="button"
                    onClick={() => scrollToSection('features')}
                    size="sm"
                    style={{ color: '#999', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Features
                  </Anchor>
                  <Anchor
                    component="button"
                    onClick={() => scrollToSection('pricing')}
                    size="sm"
                    style={{ color: '#999', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Pricing
                  </Anchor>
                  <Anchor
                    component="button"
                    onClick={() => scrollToSection('testimonials')}
                    size="sm"
                    style={{ color: '#999', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Testimonials
                  </Anchor>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Updates
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>
                    Company
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    About Us
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Careers
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Contact
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Blog
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Legal</Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Privacy Policy
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Terms of Service
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Cookie Policy
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    Security
                  </Text>
                </Stack>
              </SimpleGrid>

              <Box
                style={{
                  borderTop: '1px solid #222',
                  paddingTop: '2rem',
                }}
              >
                <Group justify="space-between" wrap="wrap" gap="md">
                  <Text size="sm" style={{ color: '#666' }}>
                    © 2024 VeroTime. All rights reserved. Built with ❤️ for modern teams.
                  </Text>
                  <Group gap="xl">
                    <Text
                      size="sm"
                      style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#999';
                      }}
                    >
                      Twitter
                    </Text>
                    <Text
                      size="sm"
                      style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#999';
                      }}
                    >
                      LinkedIn
                    </Text>
                    <Text
                      size="sm"
                      style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#999';
                      }}
                    >
                      GitHub
                    </Text>
                  </Group>
                </Group>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Stack>

      {/* Add CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}