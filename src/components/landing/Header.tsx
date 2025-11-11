import { Container, Group, Image, Button, Anchor, Burger, Drawer, Stack, Box } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

interface HeaderProps {
  onScrollToSection: (sectionId: string) => void;
}

export function Header({ onScrollToSection }: HeaderProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [opened, { toggle, close }] = useDisclosure(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', id: 'features' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'Pricing', id: 'pricing' },
  ];

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId);
    close();
  };

  return (
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
            {navItems.map((item) => (
              <Anchor
                key={item.id}
                component="button"
                onClick={() => handleNavClick(item.id)}
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
                {item.label}
              </Anchor>
            ))}
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

      {/* Mobile Navigation Drawer */}
      <Drawer opened={opened} onClose={close} position="right" title="Menu" size="sm">
        <Stack gap="md">
          {navItems.map((item) => (
            <Anchor
              key={item.id}
              component="button"
              onClick={() => handleNavClick(item.id)}
              style={{ color: '#495057', fontWeight: 600, fontSize: '16px' }}
            >
              {item.label}
            </Anchor>
          ))}
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
    </Box>
  );
}
