import { Box, Container, SimpleGrid, Title, Text, Card, Stack, ThemeIcon, Badge, Image } from '@mantine/core';
import { IconMicrophone, IconSchool, IconPresentation, IconVideo } from '@tabler/icons-react';

export function UseCases() {
    const cases = [
        {
            title: 'Event Organizers',
            icon: IconPresentation,
            color: 'blue',
            description: 'Keep your speakers on track and your agenda running smoothly. Manage multiple stages from a single dashboard.',
            image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600'
        },
        {
            title: 'Podcasters & Media',
            icon: IconMicrophone,
            color: 'violet',
            description: 'Sync hosts and guests remotely. Ensure segments hit their time marks perfectly, even when recording from different continents.',
            image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600'
        },
        {
            title: 'Education & Exams',
            icon: IconSchool,
            color: 'teal',
            description: 'Display clear, synchronized countdowns for exams or student presentations. Control multiple classrooms from one device.',
            image: 'https://images.unsplash.com/photo-1427504746696-ea5abd7dfe5b?auto=format&fit=crop&q=80&w=600'
        },
        {
            title: 'Remote Meetings',
            icon: IconVideo,
            color: 'orange',
            description: 'Keep Zoom and Teams meetings efficient. Share a visible timer that everyone can see to prevent overruns.',
            image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=600'
        }
    ];

    return (
        <Box py={100} style={{ background: '#fff' }} id="use-cases">
            <Container size="xl">
                <Stack align="center" mb={60}>
                    <Badge variant="light" size="lg" color="gray">BUILT FOR EVERYONE</Badge>
                    <Title order={2} style={{ fontSize: '2.5rem', textAlign: 'center' }}>
                        Perfect for Any Scenario
                    </Title>
                    <Text c="dimmed" size="lg" ta="center" maw={700}>
                        Whether you're running a global conference or a local workshop, VeroTime adapts to your needs.
                    </Text>
                </Stack>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40}>
                    {cases.map((item, index) => (
                        <Card
                            key={index}
                            padding="xl"
                            radius="lg"
                            withBorder
                            style={{
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Card.Section>
                                <Image
                                    src={item.image}
                                    height={200}
                                    alt={item.title}
                                    style={{ objectFit: 'cover' }}
                                />
                            </Card.Section>

                            <Stack mt="md" gap="sm">
                                <ThemeIcon size={40} radius="md" color={item.color} variant="light">
                                    <item.icon size={24} />
                                </ThemeIcon>
                                <Title order={3} size="h3">{item.title}</Title>
                                <Text c="dimmed" size="md" style={{ lineHeight: 1.6 }}>
                                    {item.description}
                                </Text>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
