import { NavLink } from 'react-router-dom';
import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Page } from '@/components/page';
import { UnderlineShape } from '@/components/_stubs';
import { paths } from '@/routes';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <Page title="Create Account - Synchronized Team Timers">
      <Stack gap="xl">
        <Stack>
          <Title order={2}>
            Synchronize timers with your team.{' '}
            <Text fz="inherit" fw="inherit" component="span" pos="relative">
              Get Started
              <UnderlineShape
                c="blue"
                left="0"
                pos="absolute"
                h="0.625rem"
                bottom="-1rem"
                w="7rem"
              />
            </Text>
          </Title>
          <Text fz="sm" c="dimmed">
            Create collaborative timer rooms, manage real-time synchronization across devices, and
            share custom-styled timers with your audience. Perfect for presentations, events, and
            team coordination.
          </Text>
        </Stack>

        <RegisterForm />

        <Text fz="sm" c="dimmed">
          Already have an account?{' '}
          <Anchor fz="inherit" component={NavLink} to={paths.auth.login}>
            Login
          </Anchor>
        </Text>
      </Stack>
    </Page>
  );
}
