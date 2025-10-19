// src/pages/auth/login/index.tsx - Show success message from registration
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PiGoogleLogoDuotone as GoogleIcon, PiXLogoDuotone as XIcon } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import { Anchor, Button, Divider, Group, Stack, Text, Title, Alert } from '@mantine/core';
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
            By signing up, you will gain access to exclusive content, special offers, and be the
            first to hear about exciting news and updates.
          </Text>
        </Stack>

        {successMessage && (
          <Alert icon={<IconCheck size="1rem" />} color="green" title="Success">
            {successMessage}
          </Alert>
        )}

        <Group grow>
          <Button leftSection={<XIcon size="1rem" />} variant="outline" color="gray">
            Login with X
          </Button>
          <Button leftSection={<GoogleIcon size="1rem" />} variant="outline" color="gray">
            Login with Google
          </Button>
        </Group>

        <Divider label="OR" labelPosition="center" />

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