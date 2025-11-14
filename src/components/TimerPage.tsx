import { useState, useEffect, memo, useMemo } from 'react';
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

function TimerPageComponent({ slug }: TimerPageProps) {
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

  // Generate structured data (memoized) - MUST be before early returns
  const structuredData = useMemo(() => {
    if (!preset) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Tool',
      name: preset.title,
      description: preset.description,
      applicationCategory: 'Productivity',
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/timers/${preset.slug}`,
    };
  }, [preset?.title, preset?.description, preset?.slug]);

  const breadcrumbData = useMemo(() => {
    if (!preset) return null;
    return {
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
  }, [preset?.title, preset?.slug]);

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
          <Box w="100%" mt="xl" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Main Content */}
            <div style={{ marginBottom: '3rem' }}>
              <Text size="lg" fw={500} mb="md">
                About This Timer
              </Text>
              <Text mb="lg" style={{ lineHeight: 1.8 }}>
                {preset.content}
              </Text>
            </div>

            {/* Why This Duration Section */}
            {preset.whySection && (
              <div style={{ marginBottom: '3rem' }}>
                <Title order={2} size="h3" mb="md" style={{ fontSize: '1.3rem', marginTop: '2rem' }}>
                  Why {preset.duration / 60} {preset.duration / 60 === 1 ? 'Minute' : 'Minutes'}?
                </Title>
                <Text style={{ lineHeight: 1.8, color: '#a6adba' }}>
                  {preset.whySection}
                </Text>
              </div>
            )}

            {/* How To Use Section */}
            {preset.howToSection && (
              <div style={{ marginBottom: '3rem' }}>
                <Title order={2} size="h3" mb="md" style={{ fontSize: '1.3rem', marginTop: '2rem' }}>
                  How to Use This Timer
                </Title>
                <Text style={{ lineHeight: 1.8, color: '#a6adba' }}>
                  {preset.howToSection}
                </Text>
              </div>
            )}

            {/* Use Cases Section */}
            {preset.uses.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <Title order={2} size="h3" mb="md" style={{ fontSize: '1.3rem', marginTop: '2rem' }}>
                  Perfect For:
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                  {preset.uses.map((use, idx) => (
                    <Text key={idx} c="blue" size="sm" style={{ lineHeight: 1.6 }}>
                      • {use}
                    </Text>
                  ))}
                </SimpleGrid>
              </div>
            )}

            {/* Tips Section */}
            {preset.tipsSection && preset.tipsSection.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <Title order={2} size="h3" mb="md" style={{ fontSize: '1.3rem', marginTop: '2rem' }}>
                  Tips for Success
                </Title>
                <Stack gap="sm">
                  {preset.tipsSection.map((tip, idx) => (
                    <Text key={idx} style={{ lineHeight: 1.6, color: '#a6adba' }}>
                      {idx + 1}. {tip}
                    </Text>
                  ))}
                </Stack>
              </div>
            )}

            {/* FAQ Section */}
            {preset.faqSection && preset.faqSection.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <Title order={2} size="h3" mb="md" style={{ fontSize: '1.3rem', marginTop: '2rem' }}>
                  Frequently Asked Questions
                </Title>
                <Stack gap="lg">
                  {preset.faqSection.map((faq, idx) => (
                    <div key={idx}>
                      <Text fw={500} mb="xs" style={{ color: '#fff' }}>
                        Q: {faq.question}
                      </Text>
                      <Text size="sm" style={{ lineHeight: 1.8, color: '#a6adba', marginLeft: '1rem' }}>
                        A: {faq.answer}
                      </Text>
                    </div>
                  ))}
                </Stack>
              </div>
            )}

            {/* Related Timers Section */}
            {preset.relatedTimers && preset.relatedTimers.length > 0 && (
              <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
                <Title order={2} size="h3" mb="md" style={{ fontSize: '1.3rem' }}>
                  Other Useful Timers
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {preset.relatedTimers.map((slug) => {
                    const relatedPreset = getTimerPreset(slug);
                    return relatedPreset ? (
                      <Anchor
                        key={slug}
                        href={`/timers/${slug}`}
                        style={{
                          padding: '1rem',
                          border: '1px solid #333',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10B981';
                          e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#333';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Text fw={500} size="sm">
                          {relatedPreset.title}
                        </Text>
                        <Text size="xs" c="dimmed" mt="xs">
                          {relatedPreset.duration / 60} min timer
                        </Text>
                      </Anchor>
                    ) : null;
                  })}
                </SimpleGrid>
              </div>
            )}
          </Box>
        </Stack>
      </Container>
    </>
  );
}

export const TimerPage = memo(TimerPageComponent);
