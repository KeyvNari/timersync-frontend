import { useNavigate } from 'react-router-dom';
import { Container, Stack, Center, Text, Button, Group, Card, ThemeIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

export default function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <Container size="sm" py="xl">
      <Center py="xl">
        <Card p="lg" radius="md" withBorder w="100%">
          <Stack gap="md" align="center">
            <ThemeIcon size={80} radius="xl" color="red" variant="light">
              <IconX size={40} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700}>
                Payment Cancelled
              </Text>
              <Text c="dimmed" ta="center">
                Your payment was cancelled. You can try again anytime or contact support if you need assistance.
              </Text>
            </Stack>
            <Group grow>
              <Button variant="default" onClick={() => navigate('/dashboard/rooms')}>
                Back to Dashboard
              </Button>
              <Button color="blue" onClick={() => navigate('/checkout/upgrade')}>
                Try Again
              </Button>
            </Group>
          </Stack>
        </Card>
      </Center>
    </Container>
  );
}
