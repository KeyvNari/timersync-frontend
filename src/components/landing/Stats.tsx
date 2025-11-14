import { Box, Container, SimpleGrid, Center, Stack, Text } from '@mantine/core';
import {
  IconUsers,
  IconTrendingUp,
  IconShieldCheck,
  IconInfinity,
} from '@tabler/icons-react';
import { ComponentType } from 'react';

interface Stat {
  value: string;
  label: string;
  icon: ComponentType<{ size: number; color: string; opacity: number }>;
}

export function Stats() {
  const stats: Stat[] = [
    { value: '50K+', label: 'Active Users', icon: IconUsers },
    { value: '99.9%', label: 'Uptime', icon: IconTrendingUp },
    { value: '24/7', label: 'Support', icon: IconShieldCheck },
    { value: '150+', label: 'Countries', icon: IconInfinity },
  ];

  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-8) 100%)',
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
  );
}
