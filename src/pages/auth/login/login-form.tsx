import { NavLink, useNavigate } from 'react-router-dom';
import { Anchor, Button, Stack, StackProps } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { LoginRequestSchema } from '@/api/dtos';
import { Checkbox } from '@/components/forms/checkbox';
import { FormProvider } from '@/components/forms/form-provider';
import { PasswordInput } from '@/components/forms/password-input';
import { TextInput } from '@/components/forms/text-input';
import { useAuth, useLogin } from '@/hooks';
import { paths } from '@/routes';
import { handleFormErrors } from '@/utilities/form';

interface LoginFormProps extends Omit<StackProps, 'children'> {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { mutate: login, isPending } = useLogin();

  const form = useForm({
    mode: 'uncontrolled',
    validate: zodResolver(LoginRequestSchema),
    initialValues: {
      username: '',
      password: '',
      grant_type: 'password' as const,
      scope: '',
      client_id: '',
      client_secret: '',
    },
  });

  const handleSubmit = form.onSubmit((variables) => {
    login(
      { variables },
      {
        onSuccess: () => {
          setIsAuthenticated(true);
          onSuccess?.();
          navigate(paths.dashboard.home, { replace: true });
        },
        onError: (error) => handleFormErrors(form, error),
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
        <TextInput name="username" label="Email" type="email" required />
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