import { NavLink, useNavigate } from 'react-router-dom';
import { Anchor, Button, Stack, StackProps } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { Checkbox } from '@/components/forms/checkbox';
import { FormProvider } from '@/components/forms/form-provider';
import { PasswordInput } from '@/components/forms/password-input';
import { TextInput } from '@/components/forms/text-input';
import { useAuth, useFirebaseLogin } from '@/hooks';
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

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
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
