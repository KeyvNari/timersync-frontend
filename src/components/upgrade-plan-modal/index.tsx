import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Stack,
  Group,
  Text,
  Card,
  Badge,
  ThemeIcon,
  Center,
  Loader,
  Table,
  Container,
} from '@mantine/core';
import { IconBolt, IconCheck, IconX } from '@tabler/icons-react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { useFeatureAccess } from '@/hooks';
import { createCheckoutSession, getSubscriptionStatus, SubscriptionStatus } from '@/api/resources/billing';
import { notifications } from '@mantine/notifications';
import classes from './upgrade-plan-modal.module.css';

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  description: string;
  features: string[];
}

// Example plan data - you can fetch this from your backend
const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    billing_period: 'monthly',
    description: 'Perfect for personal use',
    features: [
      'Up to 5 timers per room',
      'Up to 3 rooms',
      'Up to 2 connected devices',
      'Basic timer display',
    ],
  },
  {
    id: '2',
    name: 'Premium',
    price: 1200, // $12.00 in cents
    billing_period: 'monthly',
    description: 'Best for teams and power users',
    features: [
      'Unlimited timers per room',
      'Up to 10 rooms',
      'Up to 10 connected devices',
      'Advanced display customization',
      'Save custom displays',
      'Room messages',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    billing_period: 'monthly',
    description: 'Custom solution for enterprises',
    features: [
      'Everything in Premium',
      'Unlimited everything',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
];

interface UpgradePlanModalProps {
  opened: boolean;
  onClose: () => void;
}

export function UpgradePlanModal({ opened, onClose }: UpgradePlanModalProps) {
  const { userPlan, planFeatures } = useFeatureAccess();
  const { timers, messages, connections } = useWebSocketContext();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Load subscription status when modal opens
  useEffect(() => {
    if (opened) {
      console.log('[UPGRADE MODAL] Modal opened, loading subscription status');
      loadSubscription();
    }
  }, [opened]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      console.log('[UPGRADE MODAL] Loading subscription status...');
      const data = await getSubscriptionStatus();
      console.log('[UPGRADE MODAL] Subscription loaded:', data);
      setSubscription(data);
    } catch (error) {
      console.error('[UPGRADE MODAL] Failed to load subscription status:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load subscription status',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: Plan) => {
    // Don't allow changing to current plan
    if (subscription?.plan_id === plan.id) {
      console.log('[UPGRADE MODAL] Cannot upgrade to current plan:', plan.id);
      return;
    }

    if (plan.price === 0) {
      console.log('[UPGRADE MODAL] Enterprise plan selected, showing contact sales message');
      notifications.show({
        title: 'Enterprise Plan',
        message: 'Please contact sales for enterprise pricing',
        color: 'blue',
      });
      return;
    }

    try {
      setCheckoutLoading(plan.id);
      console.log('[UPGRADE MODAL] Initiating checkout for plan:', plan.id);
      const response = await createCheckoutSession({
        plan_id: plan.id,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`,
      });

      console.log('[UPGRADE MODAL] Redirecting to Stripe checkout:', response.checkout_url);
      // Redirect to Stripe checkout
      window.location.href = response.checkout_url;
    } catch (error) {
      console.error('[UPGRADE MODAL] Checkout failed:', error);
      notifications.show({
        title: 'Checkout Failed',
        message: 'Failed to initiate checkout. Please try again.',
        color: 'red',
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const currentPlan = PLANS.find(p => p.id === subscription?.plan_id) ||
    PLANS.find(p => p.id === userPlan?.toLowerCase());

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upgrade Your Plan"
      size="xl"
      centered
    >
      <Stack gap="lg">
        {/* Current Subscription Info */}
        {subscription && subscription.status === 'active' && (
          <Card p="md" radius="md" className={classes.currentPlan}>
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={600} size="lg">
                    Current Plan: {subscription.plan_name || 'Starter'}
                  </Text>
                  {subscription.next_billing_date && (
                    <Text size="sm" c="dimmed">
                      Next billing date: {new Date(subscription.next_billing_date).toLocaleDateString()}
                    </Text>
                  )}
                </div>
                {subscription.cancel_at_period_end && (
                  <Badge color="red" variant="light">
                    Cancelling at period end
                  </Badge>
                )}
              </Group>
            </Stack>
          </Card>
        )}

        {/* Usage Summary */}
        {planFeatures && (
          <Card p="md" radius="md">
            <Stack gap="md">
              <Text fw={600} size="md">
                Current Usage
              </Text>
              <Table striped highlightOnHover>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>Timers in Room</Table.Td>
                    <Table.Td>
                      <Badge>{timers.length}</Badge>
                      <Text size="xs" c="dimmed" style={{ marginLeft: '0.5rem', display: 'inline' }}>
                        / {planFeatures.max_timers_in_room}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Connected Devices</Table.Td>
                    <Table.Td>
                      <Badge>{connections.length}</Badge>
                      <Text size="xs" c="dimmed" style={{ marginLeft: '0.5rem', display: 'inline' }}>
                        / {planFeatures.max_connected_devices}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Messages</Table.Td>
                    <Table.Td>
                      <Badge>{messages.length}</Badge>
                      <Text size="xs" c="dimmed" style={{ marginLeft: '0.5rem', display: 'inline' }}>
                        / {planFeatures.max_messages_per_room}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        )}

        {/* Plans Grid */}
        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <Stack gap="md">
            <Text fw={600} size="md">
              Available Plans
            </Text>
            <div className={classes.plansGrid}>
              {PLANS.map((plan) => {
                const isCurrentPlan = subscription?.plan_id === plan.id;
                const canUpgrade = !isCurrentPlan && plan.price > 0;

                return (
                  <Card
                    key={plan.id}
                    padding="lg"
                    radius="md"
                    className={isCurrentPlan ? classes.currentPlanCard : classes.planCard}
                  >
                    <Stack gap="md" h="100%">
                      <div>
                        <Group justify="space-between" align="flex-start" mb="xs">
                          <div>
                            <Text fw={600} size="lg">
                              {plan.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {plan.description}
                            </Text>
                          </div>
                          {isCurrentPlan && (
                            <Badge color="blue" variant="light">
                              Current
                            </Badge>
                          )}
                        </Group>

                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                          <Text fw={700} size="xl">
                            {plan.price === 0 ? (
                              'Custom'
                            ) : (
                              <>
                                ${formatPrice(plan.price)}
                                <Text component="span" size="sm" c="dimmed" fw={400}>
                                  /month
                                </Text>
                              </>
                            )}
                          </Text>
                        </div>
                      </div>

                      <Stack gap="xs" style={{ flex: 1 }}>
                        {plan.features.map((feature, idx) => (
                          <Group key={idx} gap="xs">
                            <ThemeIcon
                              size="sm"
                              radius="xl"
                              variant="light"
                              color="green"
                            >
                              <IconCheck size={14} />
                            </ThemeIcon>
                            <Text size="sm">{feature}</Text>
                          </Group>
                        ))}
                      </Stack>

                      <Button
                        fullWidth
                        disabled={isCurrentPlan}
                        loading={checkoutLoading === plan.id}
                        onClick={() => handleUpgrade(plan)}
                        variant={isCurrentPlan ? 'light' : 'filled'}
                        color={isCurrentPlan ? 'gray' : 'blue'}
                      >
                        {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Contact Sales' : 'Upgrade Now'}
                      </Button>
                    </Stack>
                  </Card>
                );
              })}
            </div>
          </Stack>
        )}

        {/* Footer */}
        <Group justify="flex-end" pt="md">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
