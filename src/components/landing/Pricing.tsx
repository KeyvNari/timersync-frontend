import { Box, Container, Stack, Text, Badge, Title, SimpleGrid, Card, Button, Group, ThemeIcon, rem } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

interface PricingProps {
  sectionRef?: React.RefObject<HTMLDivElement>;
  animationStyle?: React.CSSProperties;
  onAnimationStyleChange?: (delay: number) => React.CSSProperties;
}

export function Pricing({ sectionRef, animationStyle, onAnimationStyleChange }: PricingProps) {
  const navigate = useNavigate();

  const pricingPlans: PricingPlan[] = [
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

  return (
    <Box
      id="pricing"
      ref={sectionRef}
      style={{
        backgroundColor: '#ffffff',
        padding: '8rem 1rem',
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
          {pricingPlans.map((plan, index) => {
            const animStyle = onAnimationStyleChange ? onAnimationStyleChange(index * 0.15) : {};

            return (
              <Card
                key={index}
                p="xl"
                radius="xl"
                style={{
                  backgroundColor: plan.highlighted ? '#667eea' : 'white',
                  border: plan.highlighted ? '2px solid #667eea' : '1px solid #f1f3f5',
                  position: 'relative',
                  ...animStyle,
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
            );
          })}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
