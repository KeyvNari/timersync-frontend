import { useParams } from 'react-router-dom';
import { Container, Text, Center } from '@mantine/core';
import { Helmet } from 'react-helmet-async';
import { TimerPage } from '@/components/TimerPage';
import { getTimerPreset } from '@/config/timerPresets';

export default function TimersPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <>
        <Helmet>
          <title>Timer Not Found | VeroTime</title>
          <meta name="description" content="No timer specified. Browse available timers or create your own custom timer on VeroTime. Share timers instantly with others for real-time synchronization." />
        </Helmet>
        <Container py="xl">
          <Center>
            <Text>No timer specified</Text>
          </Center>
        </Container>
      </>
    );
  }

  const preset = getTimerPreset(slug);

  if (!preset) {
    return (
      <>
        <Helmet>
          <title>Timer Not Found | VeroTime</title>
          <meta name="description" content="The timer you're looking for was not found. Try creating a new timer or use one of our preset timers for Pomodoro, Workout, Cooking, and more." />
        </Helmet>
        <Container py="xl">
          <Center>
            <Text>Timer not found. Please check the URL and try again.</Text>
          </Center>
        </Container>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{preset.title}</title>
        <meta name="description" content={preset.description} />
        <meta name="keywords" content={preset.keywords.join(', ')} />
      </Helmet>
      <TimerPage slug={slug} />
    </>
  );
}
