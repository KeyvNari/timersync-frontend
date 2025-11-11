import { Box, Container, Stack, Text, Badge, Title, SimpleGrid, Card } from '@mantine/core';
import {
  IconClock,
  IconUsers,
  IconBell,
  IconTarget,
  IconFlare,
  IconLock,
  TablerIconsProps,
} from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface Feature {
  icon: ForwardRefExoticComponent<TablerIconsProps & RefAttributes<SVGSVGElement>>;
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
    violet: { from: '#667eea', to: '#764ba2' },
    blue: { from: '#4dabf7', to: '#22b8cf' },
    pink: { from: '#ff6b6b', to: '#fa5252' },
    orange: { from: '#ff922b', to: '#ffd43b' },
    teal: { from: '#20c997', to: '#51cf66' },
  };

  const colors = colorMap[colorName] || colorMap.violet;
  return colors[type];
};

export function Features({ sectionRef, animationStyle, onAnimationStyleChange }: FeaturesProps) {
  const features: Feature[] = [
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
            const animStyle = onAnimationStyleChange ? onAnimationStyleChange(index * 0.1) : {};
            const fromColor = getGradientColor(feature.gradient.from, 'from');
            const toColor = getGradientColor(feature.gradient.to, 'to');

            return (
              <Card
                key={index}
                p="xl"
                radius="xl"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #f1f3f5',
                  cursor: 'pointer',
                  ...animStyle,
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
                      background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 10px 30px rgba(102, 126, 234, 0.3)`,
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
  );
}
