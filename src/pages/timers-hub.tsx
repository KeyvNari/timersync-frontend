import { Helmet } from 'react-helmet-async';
import { Container, Stack, Box, Text, Title, SimpleGrid, Anchor, Badge, Group, Input } from '@mantine/core';
import { useState, useMemo } from 'react';
import { timerPresets } from '@/config/timerPresets';
import { IconSearch } from '@tabler/icons-react';

export default function TimersHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Group timers by category
  const timersByCategory = useMemo(() => {
    const grouped = timerPresets.reduce(
      (acc, timer) => {
        if (!acc[timer.category]) {
          acc[timer.category] = [];
        }
        acc[timer.category].push(timer);
        return acc;
      },
      {} as Record<string, typeof timerPresets>
    );
    return grouped;
  }, []);

  // Filter timers based on search
  const filteredTimers = useMemo(() => {
    if (!searchQuery) return timersByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof timerPresets> = {};

    Object.entries(timersByCategory).forEach(([category, timers]) => {
      const categoryMatches = category.toLowerCase().includes(query);
      const matchedTimers = timers.filter(
        (timer) =>
          timer.title.toLowerCase().includes(query) ||
          timer.description.toLowerCase().includes(query) ||
          timer.keywords.some((kw) => kw.toLowerCase().includes(query))
      );

      if (categoryMatches || matchedTimers.length > 0) {
        filtered[category] = categoryMatches ? timers : matchedTimers;
      }
    });

    return filtered;
  }, [searchQuery, timersByCategory]);

  const categoryLabels: Record<string, { label: string; color: string; description: string }> = {
    productivity: {
      label: 'Productivity & Focus',
      color: 'blue',
      description: 'Timers for focused work, Pomodoro technique, and productivity methods',
    },
    fitness: {
      label: 'Health & Fitness',
      color: 'grape',
      description: 'Workout timers, HIIT training, and exercise routines',
    },
    learning: {
      label: 'Learning & Study',
      color: 'cyan',
      description: 'Study timers, reading sessions, and educational tools',
    },
    wellness: {
      label: 'Wellness & Mindfulness',
      color: 'teal',
      description: 'Meditation, yoga, stress relief, and mental health',
    },
    lifestyle: {
      label: 'Lifestyle & Daily',
      color: 'orange',
      description: 'Cooking, daily activities, and general time management',
    },
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'VeroTime - Complete Timer Collection',
    description: 'Browse all 20+ timer types for productivity, fitness, learning, wellness, and lifestyle activities',
    url: typeof window !== 'undefined' ? window.location.href : '',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: timerPresets.map((timer, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Tool',
          name: timer.title,
          description: timer.description,
          url: `${typeof window !== 'undefined' ? window.location.origin : ''}/timers/${timer.slug}`,
          applicationCategory: 'Productivity',
        },
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>All Timers - VeroTime Timer Collection | 20+ Timer Types</title>
        <meta
          name="description"
          content="Browse VeroTime's complete collection of 20+ specialized timers for productivity, fitness, learning, wellness, and lifestyle. Find the perfect timer for any activity."
        />
        <meta
          name="keywords"
          content="timer collection, all timers, productivity timers, fitness timers, study timers, meditation timers, timer types"
        />
        <meta property="og:title" content="All Timers - VeroTime Timer Collection" />
        <meta property="og:description" content="Browse 20+ specialized timers for every need" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Container size="lg" py="xl">
        {/* Header */}
        <Stack gap="lg" align="center" mb="3rem">
          <div style={{ textAlign: 'center' }}>
            <Title order={1} mb="md">
              All Timer Types
            </Title>
            <Text c="dimmed" size="lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Explore our complete collection of {timerPresets.length}+ specialized timers designed for productivity,
              fitness, learning, wellness, and daily activities.
            </Text>
          </div>

          {/* Search Bar */}
          <Input
            placeholder="Search timers..."
            leftSection={<IconSearch size={18} />}
            size="md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ maxWidth: '500px', width: '100%' }}
          />
        </Stack>

        {/* Timers by Category */}
        <Stack gap="3rem">
          {Object.entries(filteredTimers).map(([category, timers]) => {
            const categoryInfo = categoryLabels[category];
            return (
              <div key={category}>
                {/* Category Header */}
                <Group mb="lg" align="center" gap="md">
                  <div>
                    <Title order={2} size="h3">
                      {categoryInfo.label}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {categoryInfo.description}
                    </Text>
                  </div>
                  <Badge size="xl" color={categoryInfo.color} variant="light">
                    {timers.length}
                  </Badge>
                </Group>

                {/* Timer Grid */}
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing="md"
                  mb="xl"
                >
                  {timers.map((timer) => (
                    <Anchor
                      key={timer.slug}
                      href={`/timers/${timer.slug}`}
                      style={{
                        textDecoration: 'none',
                        padding: '1.25rem',
                        border: '1px solid #333',
                        borderRadius: '0.5rem',
                        backgroundColor: '#1a1a1a',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        target.style.borderColor = '#10B981';
                        target.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                        target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        target.style.borderColor = '#333';
                        target.style.backgroundColor = '#1a1a1a';
                        target.style.transform = 'translateY(0)';
                      }}
                    >
                      <Text fw={600} size="sm" mb="xs" style={{ color: '#fff' }}>
                        {timer.title}
                      </Text>
                      <Text size="xs" c="dimmed" mb="sm" style={{ lineHeight: 1.5 }}>
                        {timer.description}
                      </Text>
                      <Group gap="xs" mt="md">
                        <Badge size="sm" variant="dot" color={categoryInfo.color}>
                          {Math.floor(timer.duration / 60)} min
                        </Badge>
                      </Group>
                    </Anchor>
                  ))}
                </SimpleGrid>
              </div>
            );
          })}

          {Object.keys(filteredTimers).length === 0 && (
            <Box style={{ textAlign: 'center', padding: '2rem' }}>
              <Text c="dimmed">No timers found matching your search. Try different keywords.</Text>
            </Box>
          )}
        </Stack>

        {/* CTA Section */}
        <Box
          mt="4rem"
          p="2rem"
          style={{
            border: '1px solid #333',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            textAlign: 'center',
          }}
        >
          <Title order={3} mb="md">
            Create Custom Timers
          </Title>
          <Text c="dimmed" mb="lg">
            VeroTime allows you to create unlimited custom timers with any duration you need. Sign up to unlock
            advanced features, team collaboration, and synchronized timers.
          </Text>
          <Group justify="center" gap="md">
            <Anchor href="/auth/register" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10B981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#10B981';
                }}
              >
                Get Started Free
              </button>
            </Anchor>
          </Group>
        </Box>

        {/* FAQ Section */}
        <Box mt="4rem">
          <Title order={2} size="h3" mb="lg">
            About These Timers
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Box>
              <Title order={4} mb="md">
                How to Use
              </Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                Simply click on any timer above to access it immediately. Each timer is optimized for its specific use
                case with detailed instructions, tips, and FAQs on the timer page.
              </Text>
            </Box>
            <Box>
              <Title order={4} mb="md">
                No Sign-Up Required
              </Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                All timers are completely free and require no account creation. Sign up to unlock team features,
                custom timer creation, and synchronization across devices.
              </Text>
            </Box>
            <Box>
              <Title order={4} mb="md">
                Custom Timers
              </Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                Don't see your exact duration? Create custom timers with any duration you need. VeroTime supports
                unlimited timer creation for registered users.
              </Text>
            </Box>
            <Box>
              <Title order={4} mb="md">
                Team Synchronization
              </Title>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                Share timers with your team and keep everyone synchronized. Perfect for standups, training sessions,
                and group activities.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </>
  );
}
