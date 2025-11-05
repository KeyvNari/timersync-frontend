// src/pages/auth/login/index.tsx - Show success message from registration
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Anchor, Stack, Text, Title, Alert } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { Page } from '@/components/page';
import { UnderlineShape } from '@/components/_stubs';
import { paths } from '@/routes';
import { LoginForm } from './login-form';

export default function LoginPage() {
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <Page title="Login">
      <Stack gap="xl">
        <Stack>
          <Title order={2}>
            Welcome back! Please{' '}
            <Text fz="inherit" fw="inherit" component="span" pos="relative">
              Sign in
              <UnderlineShape
                c="blue"
                left="0"
                pos="absolute"
                h="0.625rem"
                bottom="-1rem"
                w="7rem"
              />
            </Text>{' '}
            to continue.
          </Title>
          <Text fz="sm" c="dimmed">
            Access your synchronized timer rooms and manage real-time collaborations with your
            team. Create, control, and share timers across all devices instantly.
          </Text>
        </Stack>

        {successMessage && (
          <Alert icon={<IconCheck size="1rem" />} color="green" title="Success">
            {successMessage}
          </Alert>
        )}

        <LoginForm />

        <Text fz="sm" c="dimmed">
          Don&apos;t have an account?{' '}
          <Anchor fz="inherit" component={NavLink} to={paths.auth.register}>
            Register
          </Anchor>
        </Text>
      </Stack>
    </Page>
  );
}