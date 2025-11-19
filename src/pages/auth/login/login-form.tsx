import { NavLink, useNavigate } from 'react-router-dom';
import { Anchor, Button, Divider, Stack, StackProps, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Checkbox } from '@/components/forms/checkbox';
import { FormProvider } from '@/components/forms/form-provider';
import { PasswordInput } from '@/components/forms/password-input';
import { TextInput } from '@/components/forms/text-input';
import { useAuth, useFirebaseLogin, useFirebaseGoogleLogin } from '@/hooks';
import { paths } from '@/routes';

interface LoginFormProps extends Omit<StackProps, 'children'> {
  onSuccess?: () => void;
}

// Firebase login schema
const FirebaseLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm({ onSuccess, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { mutate: firebaseLogin, isPending } = useFirebaseLogin();
  const { mutate: googleLogin, isPending: isGooglePending } = useFirebaseGoogleLogin();

  const form = useForm({
    mode: 'uncontrolled',
    validate: zodResolver(FirebaseLoginSchema),
    initialValues: {
      email: '',
      password: '',
    },
  });

const handleSubmit = form.onSubmit((variables) => {
  firebaseLogin(
    { email: variables.email, password: variables.password },
    {
      onSuccess: () => {
        setIsAuthenticated(true);
        onSuccess?.();
        // Always navigate to dashboard/rooms after login
        navigate(paths.dashboard.rooms, { replace: true });
      },
      onError: (error) => {
        // Firebase errors are handled in the hook
        console.error('Login error:', error);
      },
    }
  );
});

const handleGoogleLogin = () => {
  googleLogin(undefined, {
    onSuccess: () => {
      setIsAuthenticated(true);
      onSuccess?.();
      // Always navigate to dashboard/rooms after login
      navigate(paths.dashboard.rooms, { replace: true });
    },
    onError: (error) => {
      // Google auth errors are handled in the hook
      console.error('Google login error:', error);
    },
  });
};

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
        <Button
          onClick={handleGoogleLogin}
          loading={isGooglePending}
          leftSection={<IconBrandGoogle size={16} style={{ color: '#DB4437' }} />}
          fullWidth
          style={{
            backgroundColor: '#fff',
            color: '#3c4043',
            border: '1px solid #dadce0',
          }}
        >
          Sign in with Google
        </Button>

        <Divider label="Or" labelPosition="center" />

        <TextInput name="email" label="Email" type="email" required />
        <PasswordInput name="password" label="Password" required />

        <Anchor size="sm" component={NavLink} to={paths.auth.forgotPassword}>
          Forgot your password?
        </Anchor>

        <Button type="submit" loading={isPending}>
          Login
        </Button>
      </Stack>
    </FormProvider>
  );
}
