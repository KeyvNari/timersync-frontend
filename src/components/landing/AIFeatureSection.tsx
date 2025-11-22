import { Box, Container, Grid, Stack, Title, Text, Badge, Button, ThemeIcon, Paper, Group, List } from '@mantine/core';
import { IconSparkles, IconWand, IconFileUpload, IconMessageCircle, IconCheck } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

export function AIFeatureSection() {
    const [typedText, setTypedText] = useState('');
    const fullText = "Create a 10-minute brainstorming timer with 3 speakers...";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setTypedText((prev) => {
                if (index >= fullText.length) {
                    clearInterval(interval);
                    return fullText;
                }
                index++;
                return fullText.slice(0, index);
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            py={120}
            style={{
                background: '#0a0a0a',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Glow */}
            <Box
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0%',
                    transform: 'translate(30%, -50%)',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(121, 80, 242, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                }}
            />

            <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                <Grid gutter={80} align="center">
                    {/* Left Column - Text */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="xl">
                            <Badge
                                variant="gradient"
                                gradient={{ from: 'violet', to: 'cyan' }}
                                size="lg"
                                leftSection={<IconSparkles size={14} />}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                AI POWERED MAGIC
                            </Badge>

                            <Title
                                order={2}
                                style={{
                                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                }}
                            >
                                Build Timers with <br />
                                <span style={{
                                    background: 'linear-gradient(to right, #7950f2, #4dabf7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    Natural Language
                                </span>
                            </Title>

                            <Text size="xl" c="dimmed" style={{ lineHeight: 1.6 }}>
                                Don't waste time setting up complex schedules manually. Just tell our AI what you need, or upload your agenda file.
                            </Text>

                            <List
                                spacing="md"
                                size="lg"
                                center
                                icon={
                                    <ThemeIcon color="violet" size={24} radius="xl">
                                        <IconCheck size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <List.Item>
                                    <Text span fw={500} c="white">Type instructions</Text> like "5 min intro, 10 min Q&A"
                                </List.Item>
                                <List.Item>
                                    <Text span fw={500} c="white">Upload files</Text> (PDF, Word) to auto-generate timers
                                </List.Item>
                                <List.Item>
                                    <Text span fw={500} c="white">Smart context</Text> understanding for complex events
                                </List.Item>
                            </List>

                            <Button
                                size="lg"
                                variant="gradient"
                                gradient={{ from: 'violet', to: 'blue' }}
                                rightSection={<IconWand size={18} />}
                                mt="md"
                                style={{ alignSelf: 'flex-start' }}
                                onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Try AI Generator
                            </Button>
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - Visual Demo */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box style={{ position: 'relative' }}>
                            {/* Chat Interface Mockup */}
                            <Paper
                                radius="xl"
                                p="xl"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                }}
                            >
                                <Stack gap="lg">
                                    {/* Input Area */}
                                    <Box>
                                        <Group justify="space-between" mb={8}>
                                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                                Input
                                            </Text>
                                            <Group gap={5}>
                                                <IconMessageCircle size={14} color="#868e96" />
                                                <Text size="xs" c="dimmed">Text</Text>
                                                <Text size="xs" c="dimmed" mx={2}>|</Text>
                                                <IconFileUpload size={14} color="#868e96" />
                                                <Text size="xs" c="dimmed">File</Text>
                                            </Group>
                                        </Group>
                                        <Box
                                            p="md"
                                            style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                minHeight: '80px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ fontFamily: 'monospace', color: '#e0e0e0', lineHeight: 1.5 }}>
                                                {typedText}
                                                <span style={{ animation: 'blink 1s infinite' }}>|</span>
                                            </Text>
                                        </Box>
                                    </Box>

                                    {/* Result Preview */}
                                    <Box
                                        style={{
                                            opacity: typedText.length === fullText.length ? 1 : 0.3,
                                            transform: typedText.length === fullText.length ? 'translateY(0)' : 'translateY(10px)',
                                            transition: 'all 0.5s ease-out',
                                            filter: typedText.length === fullText.length ? 'none' : 'blur(2px)',
                                        }}
                                    >
                                        <Text size="xs" c="dimmed" mb={8} fw={700} tt="uppercase">
                                            Generated Timers
                                        </Text>
                                        <Paper
                                            p="md"
                                            radius="md"
                                            style={{
                                                background: 'linear-gradient(135deg, #25262b 0%, #1A1B1E 100%)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            <Group justify="space-between" mb="md">
                                                <Text fw={700} size="sm" c="white">Brainstorming Session</Text>
                                                <Badge color="green" variant="filled">Ready to Start</Badge>
                                            </Group>
                                            <Stack gap="sm">
                                                <Paper p="xs" bg="rgba(255,255,255,0.05)" radius="sm">
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="gray.3">1. Intro & Context</Text>
                                                        <Text size="sm" fw={700} c="white">02:00</Text>
                                                    </Group>
                                                </Paper>
                                                <Paper p="xs" bg="rgba(255,255,255,0.05)" radius="sm">
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="gray.3">2. Idea Generation</Text>
                                                        <Text size="sm" fw={700} c="white">05:00</Text>
                                                    </Group>
                                                </Paper>
                                                <Paper p="xs" bg="rgba(255,255,255,0.05)" radius="sm">
                                                    <Group justify="space-between">
                                                        <Text size="sm" c="gray.3">3. Voting & Wrap-up</Text>
                                                        <Text size="sm" fw={700} c="white">03:00</Text>
                                                    </Group>
                                                </Paper>
                                            </Stack>
                                        </Paper>
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* Floating Elements */}
                            <ThemeIcon
                                size={60}
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: 'orange', to: 'red' }}
                                style={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
                                    animation: 'float 6s ease-in-out infinite',
                                }}
                            >
                                <IconSparkles size={30} />
                            </ThemeIcon>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Container>

            <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
        </Box>
    );
}
