import { Box, Container, Stack, Text, Button, Group, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface CTAProps {
  sectionRef?: React.RefObject<HTMLDivElement>;
  animationStyle?: React.CSSProperties;
}

export function CTA({ sectionRef, animationStyle }: CTAProps) {
  const navigate = useNavigate();

  return (
    <Box
      id="cta"
      ref={sectionRef}
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-8) 100%)',
        padding: '6rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Elements */}
      <Box
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(100px)',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" style={animationStyle || {}}>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: 'white',
              textAlign: 'center',
              letterSpacing: '-1px',
            }}
          >
            Ready to Transform Your Workflow?
          </Title>
          <Text
            size="xl"
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.7,
            }}
          >
            Join thousands of teams already using VeroTime to collaborate smarter and achieve
            more. Start your free 14-day trial today—no credit card required.
          </Text>
          <Group gap="md">
            <Button
              size="xl"
              radius="xl"
              rightSection={<IconArrowRight size={20} />}
              variant="white"
              onClick={() => navigate('/auth/register')}
            >
              Start Free Trial
            </Button>
          </Group>
          <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            ✓ No credit card required · ✓ 14-day free trial · ✓ Full access to all features
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
