import { Box, Container, Grid, Stack, Title, Text, Badge, Button, ThemeIcon, Paper, Group } from '@mantine/core';
import { IconSparkles, IconWand, IconPlayerPlay, IconFileUpload } from '@tabler/icons-react';
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
            py={100}
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
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(66, 99, 235, 0.15) 0%, transparent 70%)',
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
                                Just Describe It. <br />
                                <span style={{
                                    background: 'linear-gradient(to right, #7950f2, #4dabf7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    We Build It.
                                </span>
                            </Title>

                            <Text size="xl" c="dimmed" style={{ lineHeight: 1.6 }}>
                                Forget manual setup. Simply type what you need or upload a schedule file.
                                Our AI understands context and creates complex, multi-step timers instantly.
                            </Text>

                            <Stack gap="md">
                                <Group>
                                    <ThemeIcon color="violet" variant="light" size="lg" radius="md">
                                        <IconWand size={20} />
                                    </ThemeIcon>
                                    <Text fw={500}>Natural Language Processing</Text>
                                </Group>
                                <Group>
                                    <ThemeIcon color="cyan" variant="light" size="lg" radius="md">
                                        <IconFileUpload size={20} />
                                    </ThemeIcon>
                                    <Text fw={500}>File Upload Support (PDF, Docx)</Text>
                                </Group>
                            </Stack>

                            <Button
                                size="lg"
                                variant="white"
                                color="dark"
                                rightSection={<IconSparkles size={18} />}
                                mt="md"
                                style={{ alignSelf: 'flex-start' }}
                            >
                                Try AI Generation
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
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                }}
                            >
                                <Stack gap="lg">
                                    {/* Input Area */}
                                    <Box>
                                        <Text size="xs" c="dimmed" mb={8} fw={700} tt="uppercase">
                                            Your Prompt
                                        </Text>
                                        <Box
                                            p="md"
                                            style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                minHeight: '60px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ fontFamily: 'monospace', color: '#e0e0e0' }}>
                                                {typedText}
                                                <span style={{ animation: 'blink 1s infinite' }}>|</span>
                                            </Text>
                                        </Box>
                                    </Box>

                                    {/* Result Preview */}
                                    <Box
                                        style={{
                                            opacity: typedText.length === fullText.length ? 1 : 0,
                                            transform: typedText.length === fullText.length ? 'translateY(0)' : 'translateY(10px)',
                                            transition: 'all 0.5s ease-out',
                                        }}
                                    >
                                        <Text size="xs" c="dimmed" mb={8} fw={700} tt="uppercase">
                                            Generated Result
                                        </Text>
                                        <Paper
                                            p="md"
                                            radius="md"
                                            style={{
                                                background: 'linear-gradient(135deg, #25262b 0%, #1A1B1E 100%)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            <Group justify="space-between" mb="xs">
                                                <Text fw={700} size="sm">Brainstorming Session</Text>
                                                <Badge color="green" variant="light">Ready</Badge>
                                            </Group>
                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">Speaker 1 (Intro)</Text>
                                                    <Text size="xs" fw={600}>2:00</Text>
                                                </Group>
                                                <Box w="100%" h={4} bg="rgba(255,255,255,0.1)" style={{ borderRadius: 2 }}>
                                                    <Box w="100%" h="100%" bg="blue" style={{ borderRadius: 2 }} />
                                                </Box>
                                                <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">Speaker 2 (Ideas)</Text>
                                                    <Text size="xs" fw={600}>5:00</Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="xs" c="dimmed">Speaker 3 (Wrap-up)</Text>
                                                    <Text size="xs" fw={600}>3:00</Text>
                                                </Group>
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
