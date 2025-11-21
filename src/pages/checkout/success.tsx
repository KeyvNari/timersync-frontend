import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Stack, Center, Loader, Text, Button, Group, Card, ThemeIcon } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { getSubscriptionStatus } from '@/api/resources/billing';
import { notifications } from '@mantine/notifications';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'timeout'>('loading');
  const [planName, setPlanName] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Get the return URL from query params, default to dashboard
  const returnUrl = searchParams.get('return_url') || '/dashboard/rooms';

  useEffect(() => {
    console.log('[CHECKOUT SUCCESS] Page loaded');
    const sessionId = searchParams.get('session_id');
    console.log('[CHECKOUT SUCCESS] Session ID from URL:', sessionId);

    const checkSubscription = async () => {
      try {
        console.log('[CHECKOUT SUCCESS] Checking subscription status (attempt', attempts + 1, ')');
        const data = await getSubscriptionStatus(sessionId || undefined);

        if (data.status === 'active' && data.subscription_id) {
          console.log('[CHECKOUT SUCCESS] Subscription confirmed:', data);
          setStatus('success');
          setPlanName(data.plan_name || 'Premium');
          notifications.show({
            title: 'Success!',
            message: `Successfully upgraded to ${data.plan_name || 'Premium'}!`,
            color: 'green',
            autoClose: 3000,
          });
          // Redirect to original location after 2 seconds
          setTimeout(() => {
            console.log('[CHECKOUT SUCCESS] Redirecting to', returnUrl);
            navigate(returnUrl, { replace: true });
          }, 2000);
        } else {
          // Not ready yet, retry
          console.log('[CHECKOUT SUCCESS] Subscription not ready yet, retrying...');
          setAttempts(prev => prev + 1);
          if (attempts < 14) { // Try for ~30 seconds (15 attempts × 2 seconds)
            setTimeout(() => checkSubscription(), 2000);
          } else {
            console.log('[CHECKOUT SUCCESS] Max attempts reached, showing timeout');
            setStatus('timeout');
          }
        }
      } catch (error) {
        console.error('[CHECKOUT SUCCESS] Failed to check subscription:', error);
        setAttempts(prev => prev + 1);
        if (attempts < 14) {
          setTimeout(() => checkSubscription(), 2000);
        } else {
          console.log('[CHECKOUT SUCCESS] Max error attempts reached, showing error');
          setStatus('error');
        }
      }
    };

    checkSubscription();
  }, []);

  if (status === 'loading') {
    return (
      <Container size="sm" py="xl">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="lg" fw={500}>
              Processing your payment...
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Please wait while we confirm your subscription. This may take a few moments.
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (status === 'success') {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} radius="xl" color="green" variant="light">
            <IconCheck size={40} />
          </ThemeIcon>
          <Stack gap="xs" align="center">
            <Text size="xl" fw={700}>
              Payment Successful!
            </Text>
            <Text c="dimmed" ta="center">
              You have successfully upgraded to <strong>{planName}</strong> plan.
            </Text>
          </Stack>
          <Text size="sm" c="dimmed" ta="center">
            Redirecting to dashboard in a moment...
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Card p="lg" radius="md" withBorder>
          <Stack gap="md" align="center">
            <ThemeIcon size={60} radius="xl" color="yellow" variant="light">
              <IconAlertCircle size={30} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Text size="lg" fw={700}>
                {status === 'timeout' ? 'Subscription Pending' : 'Unable to Verify'}
              </Text>
              <Text c="dimmed" ta="center">
                {status === 'timeout'
                  ? "Your payment was processed, but we couldn't verify your subscription immediately. Please check your email for confirmation."
                  : 'An error occurred while processing your subscription.'}
              </Text>
            </Stack>
            <Group grow>
              <Button variant="default" onClick={() => navigate(returnUrl)}>
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Group>
          </Stack>
        </Card>
        <Text size="xs" c="dimmed" ta="center">
          If you have questions, please contact support at support@timersync.com
        </Text>
      </Stack>
    </Container>
  );
}
