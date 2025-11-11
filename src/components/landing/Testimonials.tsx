import { Box, Container, Stack, Text, Badge, Title, SimpleGrid, Paper, Group, Avatar } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  company: string;
}

interface TestimonialsProps {
  sectionRef?: React.RefObject<HTMLDivElement>;
  animationStyle?: React.CSSProperties;
  onAnimationStyleChange?: (delay: number) => React.CSSProperties;
}

export function Testimonials({ sectionRef, animationStyle, onAnimationStyleChange }: TestimonialsProps) {
  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager at TechCorp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content:
        'VeroTime has completely revolutionized how our distributed team coordinates. The real-time sync is absolutely flawless, and the UI is a joy to use every single day.',
      rating: 5,
      company: 'TechCorp',
    },
    {
      name: 'Michael Chen',
      role: 'Engineering Lead at StartupX',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      content:
        'We tried 5 different timer apps before finding VeroTime. The collaborative features and performance are in a league of their own. Absolutely essential for our workflow.',
      rating: 5,
      company: 'StartupX',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Creative Director at DesignHub',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      content:
        'Beautiful design meets powerful functionality. VeroTime helps our creative team stay on track without the bloat and complexity of traditional project management tools.',
      rating: 5,
      company: 'DesignHub',
    },
  ];

  return (
    <Box
      id="testimonials"
      ref={sectionRef}
      style={{
        backgroundColor: '#f8f9ff',
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
            TESTIMONIALS
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
            Loved by Teams Worldwide
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
            Join thousands of satisfied customers who transformed their workflow with VeroTime
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {testimonials.map((testimonial, index) => {
            const animStyle = onAnimationStyleChange ? onAnimationStyleChange(index * 0.15) : {};

            return (
              <Paper
                key={index}
                p="xl"
                radius="xl"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #f1f3f5',
                  ...animStyle,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#f1f3f5';
                }}
              >
                <Stack gap="lg">
                  <Group gap="xs">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <IconStar key={i} size={18} fill="#ffd700" color="#ffd700" />
                    ))}
                  </Group>
                  <Text
                    size="md"
                    style={{
                      color: '#495057',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                    }}
                  >
                    "{testimonial.content}"
                  </Text>
                  <Group gap="sm" mt="md">
                    <Avatar
                      src={testimonial.avatar}
                      radius="xl"
                      size="lg"
                      style={{
                        border: '2px solid #f1f3f5',
                      }}
                    />
                    <Stack gap={2}>
                      <Text size="sm" fw={700} style={{ color: '#212529' }}>
                        {testimonial.name}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {testimonial.role}
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
