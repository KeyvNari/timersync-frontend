import { useParams } from 'react-router-dom';
import { Container, Text, Center } from '@mantine/core';
import { TimerPage } from '@/components/TimerPage';
import { getTimerPreset } from '@/config/timerPresets';

export default function TimersPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <Container py="xl">
        <Center>
          <Text>No timer specified</Text>
        </Center>
      </Container>
    );
  }

  const preset = getTimerPreset(slug);

  if (!preset) {
    return (
      <Container py="xl">
        <Center>
          <Text>Timer not found. Please check the URL and try again.</Text>
        </Center>
      </Container>
    );
  }

  return <TimerPage slug={slug} />;
}
