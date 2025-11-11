import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Stack, Box, Button, Group, Text, Breadcrumbs, Anchor, Title, SimpleGrid } from '@mantine/core';
import TimerDisplayStandalone from '@/components/timer-display-standalone';
import { getDefaultDisplay } from '@/config/defaultDisplay';
import { getTimerPreset } from '@/config/timerPresets';

interface TimerPageProps {
  slug: string;
}

interface TimerState {
  title: string;
  speaker: null;
  notes: null;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  timer_type: 'countdown';
  duration_seconds: number;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_stopped: boolean;
  current_time_seconds: number;
  warning_time: number | null;
  critical_time: number | null;
  timer_format: string | null;
  started_at: string | null;
  actual_start_time: string | null;
  paused_at: string | null;
  accumulated_seconds: number;
}

export function TimerPage({ slug }: TimerPageProps) {
  const preset = getTimerPreset(slug);
  const displayConfig = getDefaultDisplay();
  const [timerState, setTimerState] = useState<TimerState | null>(null);

  // Initialize timer from preset
  useEffect(() => {
    if (!preset) return;

    setTimerState({
      title: preset.slug.replace(/-/g, ' ').toUpperCase(),
      speaker: null,
      notes: null,
      show_title: true,
      show_speaker: false,
      show_notes: false,
      timer_type: 'countdown',
      duration_seconds: preset.duration,
      is_active: false,
      is_paused: false,
      is_finished: false,
      is_stopped: false,
      current_time_seconds: preset.duration,
      warning_time: Math.ceil(preset.duration * 0.3),
      critical_time: Math.ceil(preset.duration * 0.1),
      timer_format: 'mm:ss',
      started_at: null,
      actual_start_time: null,
      paused_at: null,
      accumulated_seconds: 0,
    });
  }, [preset]);

  // Handle start button
  const handleStart = () => {
    if (!timerState) return;

    if (timerState.is_finished) {
      // Reset and start again
      setTimerState((prev) =>
        prev
          ? {
              ...prev,
              is_active: true,
              is_paused: false,
              is_finished: false,
              current_time_seconds: prev.duration_seconds,
              accumulated_seconds: 0,
              actual_start_time: new Date().toISOString(),
            }
          : null
      );
    } else if (timerState.is_paused) {
      // Resume
      setTimerState((prev) =>
        prev ? { ...prev, is_paused: false } : null
      );
    } else {
      // Start fresh
      setTimerState((prev) =>
        prev
          ? {
              ...prev,
              is_active: true,
              is_paused: false,
              actual_start_time: new Date().toISOString(),
              accumulated_seconds: 0,
            }
          : null
      );
    }
  };

  // Handle reset button
  const handleReset = () => {
    if (!timerState || !preset) return;

    setTimerState((prev) =>
      prev
        ? {
            ...prev,
            is_active: false,
            is_paused: false,
            is_finished: false,
            current_time_seconds: preset.duration,
            accumulated_seconds: 0,
            actual_start_time: null,
          }
        : null
    );
  };

  // Handle pause button
  const handlePause = () => {
    setTimerState((prev) =>
      prev
        ? {
            ...prev,
            is_paused: !prev.is_paused,
            paused_at: !prev.is_paused ? new Date().toISOString() : null,
          }
        : null
    );
  };

  if (!preset || !timerState) {
    return (
      <Container>
        <Text>Timer not found</Text>
      </Container>
    );
  }

  const isRunning = timerState.is_active && !timerState.is_paused;
  const getButtonLabel = () => {
    if (timerState.is_finished) return 'Start Again';
    if (isRunning) return 'Running...';
    if (timerState.is_paused) return 'Resume';
    return 'Start';
  };

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Tool',
    name: preset.title,
    description: preset.description,
    applicationCategory: 'Productivity',
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/timers/${preset.slug}`,
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: typeof window !== 'undefined' ? window.location.origin : '',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Timers',
        item: `${typeof window !== 'undefined' ? window.location.origin : ''}/timers`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: preset.title,
        item: `${typeof window !== 'undefined' ? window.location.origin : ''}/timers/${preset.slug}`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{preset.title} | VeroTime</title>
        <meta name="description" content={preset.description} />
        <meta name="keywords" content={preset.keywords.join(', ')} />

        {/* Open Graph */}
        <meta property="og:title" content={preset.title} />
        <meta property="og:description" content={preset.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
        <meta property="og:image" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/og-timer.png`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={preset.title} />
        <meta name="twitter:description" content={preset.description} />
        <meta name="twitter:image" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/og-timer.png`} />

        {/* Canonical URL */}
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.href : ''}`} />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <Container size="md" py="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs mb="xl">
          <Anchor href="/">Home</Anchor>
          <Anchor href="/timers">Timers</Anchor>
          <Text>{preset.title}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Stack gap="lg" align="center">
          <div style={{ textAlign: 'center' }}>
            <Title order={1} mb="sm">
              {preset.title}
            </Title>
            <Text c="dimmed" size="sm" style={{ textAlign: 'center' }}>
              {preset.description}
            </Text>
          </div>

          {/* Timer Display */}
          <Box
            w="100%"
            style={{
              borderRadius: '0.5rem',
              overflow: 'hidden',
              minHeight: '500px',
            }}
          >
            <TimerDisplayStandalone
              display={displayConfig}
              timer={timerState}
            />
          </Box>

          {/* Controls */}
          <Group>
            <Button size="lg" onClick={handleStart} variant={isRunning ? 'light' : 'filled'}>
              {getButtonLabel()}
            </Button>
            {timerState.is_active && (
              <Button size="lg" onClick={handlePause} variant="default">
                {timerState.is_paused ? 'Resume' : 'Pause'}
              </Button>
            )}
            <Button size="lg" onClick={handleReset} variant="default">
              Reset
            </Button>
          </Group>

          {/* Content Section */}
          <Box w="100%" mt="xl">
            <Text size="lg" fw={500} mb="md">
              {preset.slug.replace(/-/g, ' ').charAt(0).toUpperCase() + preset.slug.replace(/-/g, ' ').slice(1)} Timer
            </Text>
            <Text mb="lg" c="dimmed">
              {preset.content}
            </Text>

            {/* Use Cases */}
            {preset.uses.length > 0 && (
              <div>
                <Text fw={500} mb="md">
                  Perfect For:
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                  {preset.uses.map((use, idx) => (
                    <Text key={idx} c="blue" size="sm">
                      • {use}
                    </Text>
                  ))}
                </SimpleGrid>
              </div>
            )}
          </Box>
        </Stack>
      </Container>
    </>
  );
}
