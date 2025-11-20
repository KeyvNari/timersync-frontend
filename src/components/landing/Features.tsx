import { Box, Container, Stack, Text, Badge, Title, SimpleGrid, Card, ThemeIcon } from '@mantine/core';
import {
  IconClock,
  IconUsers,
  IconBell,
  IconDeviceMobile,
  IconPalette,
  IconLink,
} from '@tabler/icons-react';
import { ComponentType } from 'react';

interface Feature {
  icon: ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
  gradient: { from: string; to: string };
}

interface FeaturesProps {
  sectionRef?: React.RefObject<HTMLDivElement>;
  animationStyle?: React.CSSProperties;
  onAnimationStyleChange?: (delay: number) => React.CSSProperties;
}

const getGradientColor = (
  colorName: string,
  type: 'from' | 'to'
): string => {
  const colorMap: Record<string, Record<string, string>> = {
    violet: { from: '#7950f2', to: '#be4bdb' },
    blue: { from: '#228be6', to: '#15aabf' },
    pink: { from: '#e64980', to: '#ff8787' },
    orange: { from: '#fd7e14', to: '#ffa94d' },
    teal: { from: '#12b886', to: '#38d9a9' },
    green: { from: '#40c057', to: '#8ce99a' },
  };

  const colors = colorMap[colorName] || colorMap.violet;
  return colors[type];
};

export function Features({ sectionRef, animationStyle, onAnimationStyleChange }: FeaturesProps) {
  const features: Feature[] = [
    {
      icon: IconLink,
      title: 'Linked Timers',
      description: 'Create sequences of timers that automatically start one after another. Perfect for structured workshops and agendas.',
      gradient: { from: 'violet', to: 'blue' },
    },
    {
      icon: IconPalette,
      title: 'Custom Displays',
      description: 'Customize every aspect of your timer display. Fullscreen mode, colors, fonts, and layouts to match your brand.',
      gradient: { from: 'blue', to: 'cyan' },
    },
    {
      icon: IconDeviceMobile,
      title: 'Device Connection',
      description: 'Connect any device by scanning a QR code. Turn phones and tablets into synchronized timer displays instantly.',
      gradient: { from: 'pink', to: 'orange' },
    },
    {
      icon: IconUsers,
      title: 'Team Collaboration',
      description: 'Share control with your team. Multiple admins can manage timers while unlimited viewers watch in real-time.',
      gradient: { from: 'orange', to: 'yellow' },
    },
    {
      icon: IconBell,
      title: 'Smart Notifications',
      description: 'Audio and visual alerts ensure no one misses a beat. Configurable warning and critical time thresholds.',
      gradient: { from: 'teal', to: 'green' },
    },
    {
      icon: IconClock,
      title: 'Precision Control',
      description: 'Adjust time on the fly without disrupting the flow. Add or remove minutes seamlessly during live sessions.',
      gradient: { from: 'green', to: 'teal' },
    },
  ];

  return (
    <Box
      id="features"
      ref={sectionRef}
      style={{
        backgroundColor: '#ffffff',
        padding: '8rem 1rem',
        position: 'relative',
      }}
    >
      <Container size="xl">
        <Stack
          align="center"
          gap="xl"
          mb="5rem"
          style={animationStyle || {}}
        >
          <Badge
            size="lg"
            variant="light"
            color="gray"
            style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}
          >
            POWERFUL FEATURES
          </Badge>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              textAlign: 'center',
              color: '#1a1a1a',
              letterSpacing: '-1px',
              lineHeight: 1.2,
            }}
          >
            Everything You Need to <br />
            <span style={{ color: '#228be6' }}>Run Perfect Events</span>
          </Title>
          <Text
            size="xl"
            c="dimmed"
            style={{
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.7,
            }}
          >
            Built for professionals who demand reliability and flexibility.
            Experience the perfect blend of simplicity and power.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={30}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const animStyle = onAnimationStyleChange ? onAnimationStyleChange(index * 0.1) : {};
            const fromColor = getGradientColor(feature.gradient.from, 'from');
            const toColor = getGradientColor(feature.gradient.to, 'to');

            return (
              <Card
                key={index}
                p="xl"
                radius="lg"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  cursor: 'default',
                  ...animStyle,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = fromColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e9ecef';
                }}
              >
                <Stack gap="lg">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    variant="gradient"
                    gradient={{ from: fromColor, to: toColor, deg: 135 }}
                    style={{
                      boxShadow: `0 10px 20px ${fromColor}40`,
                    }}
                  >
                    <Icon size={30} color="white" />
                  </ThemeIcon>

                  <div>
                    <Title order={3} mb="xs" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {feature.title}
                    </Title>
                    <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
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
  );
}
