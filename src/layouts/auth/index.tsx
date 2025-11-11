import { PiArrowLeft as GoBackIcon } from 'react-icons/pi';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Button, Center, Flex, Image, SimpleGrid, Text, Title } from '@mantine/core';
import demosaas from '@/assets/image_saas.png';
import { Logo } from '@/components/logo';

export function AuthLayout() {
  const navigate = useNavigate();

  return (
    <Box style={{ height: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: 'var(--mantine-spacing-md)', padding: 'var(--mantine-spacing-md)', overflow: 'hidden' }}>
      <Flex direction="column" align="flex-start" style={{ overflowY: 'auto' }}>
        <Button
          c="inherit"
          variant="subtle"
          leftSection={<GoBackIcon size="1rem" />}
          onClick={() => navigate('/')}
        >
          Go back
        </Button>

        <Center flex={1} w="100%">
          <Box maw="25rem">
            <Logo size="200px" display="block" c="var(--mantine-primary-color-filled)" mb="xl" />
            <Outlet />
          </Box>
        </Center>
      </Flex>

      <Center
        ta="center"
        p="4rem"
        bg="var(--mantine-color-default-hover)"
        display={{ base: 'none', lg: 'flex' }}
        style={{ borderRadius: 'var(--mantine-radius-md)', overflowY: 'auto' }}
      >
        <Box maw="40rem">
          <Title order={2}>Real-time timer synchronization for teams.</Title>
          <Text my="lg" c="dimmed">
            Create collaborative timer rooms, coordinate across devices, and share synchronized timers
            with your team. Perfect for presentations, events, training sessions, and any scenario
            where precision timing matters.
          </Text>

          <Image src={demosaas} alt="Demo" />
        </Box>
      </Center>
    </Box>
  );
}
