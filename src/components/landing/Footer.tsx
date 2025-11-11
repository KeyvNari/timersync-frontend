import { Box, Container, SimpleGrid, Stack, Group, Text, Image, Anchor } from '@mantine/core';

interface FooterProps {
  sectionRef?: React.RefObject<HTMLDivElement>;
  onScrollToSection: (sectionId: string) => void;
}

export function Footer({ sectionRef, onScrollToSection }: FooterProps) {
  const footerLinks = [
    {
      title: 'Product',
      items: [
        { label: 'Features', id: 'features' },
        { label: 'Pricing', id: 'pricing' },
        { label: 'Testimonials', id: 'testimonials' },
        { label: 'Updates', id: null },
      ],
    },
    {
      title: 'Quick Timers',
      items: [
        { label: '5 Min Timer', href: '/timers/5-minute-timer' },
        { label: '10 Min Timer', href: '/timers/10-minute-timer' },
        { label: '15 Min Timer', href: '/timers/15-minute-timer' },
        { label: '20 Min Timer', href: '/timers/20-minute-timer' },
        { label: '25 Min Timer', href: '/timers/25-minute-timer' },
        { label: '30 Min Timer', href: '/timers/30-minute-timer' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About Us', id: null },
        { label: 'Careers', id: null },
        { label: 'Contact', id: null },
        { label: 'Blog', id: null },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', id: null },
        { label: 'Terms of Service', id: null },
        { label: 'Cookie Policy', id: null },
        { label: 'Security', id: null },
      ],
    },
  ];

  const socialLinks = [
    { label: 'Twitter', url: '#' },
    { label: 'LinkedIn', url: '#' },
    { label: 'GitHub', url: '#' },
  ];

  const handleLinkClick = (id: string | null) => {
    if (id) {
      onScrollToSection(id);
    }
  };

  const LinkComponent = ({ item }: { item: any }) => {
    if (item.href) {
      return (
        <Anchor
          href={item.href}
          size="sm"
          style={{ color: '#999', transition: 'color 0.2s', textDecoration: 'none' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#999';
          }}
        >
          {item.label}
        </Anchor>
      );
    }

    if (item.id) {
      return (
        <Anchor
          component="button"
          onClick={() => handleLinkClick(item.id)}
          size="sm"
          style={{ color: '#999', transition: 'color 0.2s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#999';
          }}
        >
          {item.label}
        </Anchor>
      );
    }

    return (
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
        {item.label}
      </Text>
    );
  };

  return (
    <Box
      id="footer"
      ref={sectionRef}
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

            {footerLinks.map((section) => (
              <Stack key={section.title} gap="sm">
                <Text style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>
                  {section.title}
                </Text>
                {section.items.map((item) => (
                  <LinkComponent key={item.label} item={item} />
                ))}
              </Stack>
            ))}
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
                {socialLinks.map((link) => (
                  <Text
                    key={link.label}
                    size="sm"
                    style={{ color: '#999', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                    }}
                  >
                    {link.label}
                  </Text>
                ))}
              </Group>
            </Group>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
