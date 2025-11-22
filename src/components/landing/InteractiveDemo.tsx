import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Stack,
    Group,
    Button,
    Text,
    Title,
    Tabs,
    TextInput,
    ActionIcon,
    Badge,
    Transition,
    ThemeIcon
} from '@mantine/core';
import {
    IconPlayerPlay,
    IconPlayerPause,
    IconPlayerStop,
    IconPlus,
    IconMinus,
    IconWand,
    IconSend,
    IconFileUpload,
    IconDeviceDesktop,
    IconDeviceMobile,
    IconRefresh
} from '@tabler/icons-react';

export function InteractiveDemo() {
    const [activeTab, setActiveTab] = useState<string | null>('manual');
    const [timerState, setTimerState] = useState<'running' | 'paused' | 'stopped'>('stopped');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
    const [totalTime, setTotalTime] = useState(300);
    const [timerTitle, setTimerTitle] = useState('Keynote Speech');

    // AI Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hi! I can create timers for you. Try "Create a 10 min Q&A timer" or upload a schedule.' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerState === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => Math.max(0, prev - 1));
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerState('stopped');
        }
        return () => clearInterval(interval);
    }, [timerState, timeLeft]);

    // Auto-scroll chat
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleManualControl = (action: 'start' | 'pause' | 'stop' | 'add' | 'subtract') => {
        switch (action) {
            case 'start': setTimerState('running'); break;
            case 'pause': setTimerState('paused'); break;
            case 'stop':
                setTimerState('stopped');
                setTimeLeft(totalTime);
                break;
            case 'add': setTimeLeft(prev => prev + 60); setTotalTime(prev => prev + 60); break;
            case 'subtract': setTimeLeft(prev => Math.max(0, prev - 60)); setTotalTime(prev => Math.max(0, prev - 60)); break;
        }
    };

    const handleAISubmit = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            setIsTyping(false);
            let aiResponse = '';

            if (userMsg.toLowerCase().includes('upload') || userMsg.toLowerCase().includes('file')) {
                aiResponse = "I've analyzed the schedule. Creating 3 timers for the session.";
                setTimerTitle('Morning Session');
                setTotalTime(900); // 15 mins
                setTimeLeft(900);
            } else if (userMsg.match(/(\d+)\s*min/i)) {
                const mins = parseInt(userMsg.match(/(\d+)\s*min/i)![1]);
                aiResponse = `Sure, I've set a timer for ${mins} minutes.`;
                setTimerTitle('Custom Timer');
                setTotalTime(mins * 60);
                setTimeLeft(mins * 60);
            } else {
                aiResponse = "I've updated the timer based on your request.";
                setTimerTitle('AI Generated Timer');
                setTotalTime(600);
                setTimeLeft(600);
            }

            setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
            setTimerState('stopped');
        }, 1500);
    };

    return (
        <Box py={80} style={{ background: '#f8f9fa' }} id="interactive-demo">
            <Container size="xl">
                <Stack align="center" mb={50}>
                    <Badge variant="filled" color="blue" size="lg">TRY IT YOURSELF</Badge>
                    <Title order={2} style={{ fontSize: '2.5rem', textAlign: 'center' }}>
                        Control Room & Viewer
                    </Title>
                    <Text c="dimmed" size="lg" ta="center" maw={600}>
                        Experience the real-time synchronization. Control the timer on the left and watch it update instantly on the right.
                    </Text>
                </Stack>

                <Grid gutter={40}>
                    {/* Controller Panel (Left) */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Paper
                            radius="lg"
                            p="md"
                            withBorder
                            style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}
                        >
                            <Group justify="space-between" mb="md">
                                <Text fw={700} size="lg">Controller</Text>
                                <Badge color="green" variant="light">Connected</Badge>
                            </Group>

                            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md" mb="md">
                                <Tabs.List grow>
                                    <Tabs.Tab value="manual" leftSection={<IconDeviceDesktop size={16} />}>
                                        Manual Control
                                    </Tabs.Tab>
                                    <Tabs.Tab value="ai" leftSection={<IconWand size={16} />}>
                                        AI Assistant
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="manual" pt="xl">
                                    <Stack gap="xl">
                                        <Box>
                                            <Text size="sm" fw={500} mb="xs">Current Timer</Text>
                                            <Paper withBorder p="md" radius="md" bg="gray.0">
                                                <Group justify="space-between">
                                                    <Text fw={600}>{timerTitle}</Text>
                                                    <Text fw={700} c="blue">{formatTime(timeLeft)}</Text>
                                                </Group>
                                            </Paper>
                                        </Box>

                                        <Box>
                                            <Text size="sm" fw={500} mb="xs">Controls</Text>
                                            <Group grow>
                                                {timerState === 'running' ? (
                                                    <Button
                                                        color="yellow"
                                                        leftSection={<IconPlayerPause size={18} />}
                                                        onClick={() => handleManualControl('pause')}
                                                    >
                                                        Pause
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        color="green"
                                                        leftSection={<IconPlayerPlay size={18} />}
                                                        onClick={() => handleManualControl('start')}
                                                    >
                                                        Start
                                                    </Button>
                                                )}
                                                <Button
                                                    color="red"
                                                    variant="light"
                                                    leftSection={<IconPlayerStop size={18} />}
                                                    onClick={() => handleManualControl('stop')}
                                                >
                                                    Reset
                                                </Button>
                                            </Group>
                                        </Box>

                                        <Box>
                                            <Text size="sm" fw={500} mb="xs">Quick Adjust</Text>
                                            <Group grow>
                                                <Button
                                                    variant="default"
                                                    leftSection={<IconPlus size={16} />}
                                                    onClick={() => handleManualControl('add')}
                                                >
                                                    +1 Min
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    leftSection={<IconMinus size={16} />}
                                                    onClick={() => handleManualControl('subtract')}
                                                >
                                                    -1 Min
                                                </Button>
                                            </Group>
                                        </Box>
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="ai" pt="md">
                                    <Stack style={{ height: '350px' }}>
                                        <Paper
                                            withBorder
                                            p="sm"
                                            radius="md"
                                            bg="gray.0"
                                            style={{ flex: 1, overflowY: 'auto' }}
                                            ref={chatScrollRef}
                                        >
                                            <Stack gap="sm">
                                                {chatHistory.map((msg, i) => (
                                                    <Group key={i} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'} align="flex-start">
                                                        {msg.role === 'ai' && (
                                                            <ThemeIcon size="sm" radius="xl" color="violet" variant="light">
                                                                <IconWand size={12} />
                                                            </ThemeIcon>
                                                        )}
                                                        <Paper
                                                            p="xs"
                                                            radius="md"
                                                            bg={msg.role === 'user' ? 'blue.6' : 'white'}
                                                            c={msg.role === 'user' ? 'white' : 'dark'}
                                                            maw="80%"
                                                            style={{ border: msg.role === 'ai' ? '1px solid #dee2e6' : 'none' }}
                                                        >
                                                            <Text size="sm">{msg.content}</Text>
                                                        </Paper>
                                                    </Group>
                                                ))}
                                                {isTyping && (
                                                    <Group align="center" gap="xs">
                                                        <ThemeIcon size="sm" radius="xl" color="violet" variant="light">
                                                            <IconWand size={12} />
                                                        </ThemeIcon>
                                                        <Text size="xs" c="dimmed" fs="italic">AI is thinking...</Text>
                                                    </Group>
                                                )}
                                            </Stack>
                                        </Paper>

                                        <Group gap="xs">
                                            <TextInput
                                                placeholder="Type instruction..."
                                                style={{ flex: 1 }}
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.currentTarget.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAISubmit()}
                                            />
                                            <ActionIcon
                                                variant="filled"
                                                color="blue"
                                                size="lg"
                                                radius="md"
                                                onClick={handleAISubmit}
                                            >
                                                <IconSend size={18} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="light"
                                                color="gray"
                                                size="lg"
                                                radius="md"
                                                title="Simulate Upload"
                                                onClick={() => {
                                                    setChatInput("Upload schedule.pdf");
                                                    setTimeout(handleAISubmit, 100);
                                                }}
                                            >
                                                <IconFileUpload size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Stack>
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    </Grid.Col>

                    {/* Viewer Panel (Right) */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Paper
                            radius="lg"
                            style={{
                                height: '100%',
                                minHeight: '500px',
                                background: '#000',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                border: '8px solid #333',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Viewer UI Elements */}
                            <Box style={{ position: 'absolute', top: 20, left: 20 }}>
                                <Badge color="red" variant="dot" size="lg" style={{ color: 'white' }}>LIVE VIEW</Badge>
                            </Box>

                            <Stack align="center" gap="xl" style={{ width: '100%' }}>
                                <Text c="white" size="xl" fw={500} style={{ letterSpacing: '1px', opacity: 0.8 }}>
                                    {timerTitle.toUpperCase()}
                                </Text>

                                <Text
                                    c="white"
                                    fw={700}
                                    style={{
                                        fontSize: 'clamp(4rem, 10vw, 8rem)',
                                        lineHeight: 1,
                                        fontFamily: 'monospace',
                                        fontVariantNumeric: 'tabular-nums'
                                    }}
                                >
                                    {formatTime(timeLeft)}
                                </Text>

                                {/* Progress Bar */}
                                <Box w="80%" h={8} bg="gray.8" style={{ borderRadius: 4, overflow: 'hidden' }}>
                                    <Box
                                        h="100%"
                                        bg={timeLeft < 60 ? 'red' : timeLeft < 180 ? 'orange' : 'green'}
                                        w={`${(timeLeft / totalTime) * 100}%`}
                                        style={{ transition: 'width 1s linear, background-color 0.3s' }}
                                    />
                                </Box>
                            </Stack>

                            {/* Next Timer Preview (Simulated) */}
                            <Box
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '15px 20px',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                <Group justify="space-between">
                                    <Text c="dimmed" size="sm">NEXT UP:</Text>
                                    <Text c="white" size="sm" fw={600}>Q&A Session (10:00)</Text>
                                </Group>
                            </Box>
                        </Paper>
                    </Grid.Col>
                </Grid>

                <Stack align="center" mt={50}>
                    <Button
                        size="xl"
                        radius="xl"
                        color="blue"
                        rightSection={<IconPlayerPlay size={20} />}
                        onClick={() => window.location.href = '/auth/register'}
                        style={{
                            boxShadow: '0 10px 20px rgba(34, 139, 230, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        Create Your Real Room Now
                    </Button>
                    <Text size="sm" c="dimmed">No credit card required • Free plan available</Text>
                </Stack>
            </Container>
        </Box>
    );
}
