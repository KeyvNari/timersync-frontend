// src/pages/auth/register/register-form.tsx - Updated with better error handling
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Anchor,
  Button,
  Checkbox,
  PasswordInput,
  Stack,
  StackProps,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { FormProvider } from '@/components/forms/form-provider';
import { RegisterRequestSchema } from '@/api/dtos';
import { useRegister, useLogin } from '@/hooks';
import { useAuth } from '@/hooks/use-auth';
import { paths } from '@/routes';

interface RegisterFormProps extends Omit<StackProps, 'children'> {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess, ...props }: RegisterFormProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const { mutate: login, isPending: isLoginPending } = useLogin();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(RegisterRequestSchema),
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      agreeToTerms: false,
    },
    validateInputOnChange: true,
  });

  const handleSubmit = form.onSubmit((values) => {
    // Remove agreeToTerms from the data sent to API
    const { agreeToTerms, ...registrationData } = values;

    if (!agreeToTerms) {
      form.setFieldError('agreeToTerms', 'You must agree to the terms and privacy policy');
      return;
    }

    register(
      { variables: registrationData },
      {
        onSuccess: () => {
          onSuccess?.();
          // Automatically log in the user with their credentials
          login(
            {
              variables: {
                username: registrationData.email,
                password: registrationData.password,
                grant_type: 'password',
                scope: 'read write',
                client_id: 'frontend',
                client_secret: 'frontend-secret',
              },
            },
            {
              onSuccess: () => {
                // Update auth state and redirect to dashboard
                setIsAuthenticated(true);
                navigate(paths.dashboard.root, { replace: true });
              },
              onError: (error: any) => {
                console.error('Auto-login failed:', error);
                // Fall back to login page if auto-login fails
                navigate(paths.auth.login, {
                  replace: true,
                  state: {
                    message: 'Registration successful! Please log in with your credentials.'
                  }
                });
              },
            }
          );
        },
        onError: (error: any) => {
          // Handle field-specific validation errors
          if (error?.detail && Array.isArray(error.detail)) {
            error.detail.forEach((err: any) => {
              if (err.loc && err.loc.length > 1) {
                const fieldName = err.loc[err.loc.length - 1];
                form.setFieldError(fieldName, err.msg);
              }
            });
          }
        },
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
        <TextInput
          label="Full name"
          placeholder="Enter your full name"
          required
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Username"
          placeholder="Choose a username (lowercase letters and numbers only)"
          description="Can only contain lowercase letters and numbers"
          required
          {...form.getInputProps('username')}
        />
        <TextInput
          label="Email"
          placeholder="Enter your email address"
          type="email"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a secure password"
          description="Must be at least 8 characters long"
          required
          {...form.getInputProps('password')}
        />
        
      <Checkbox
      name="agreeToTerms"
      label={
        <Text fz="inherit" c="inherit" lh="inherit">
          I agree to the{' '}
          <Anchor fz="inherit" lh="inherit" component={NavLink} to="/terms">
            Terms of Service
          </Anchor>{' '}
          and{' '}
          <Anchor fz="inherit" lh="inherit" component={NavLink} to="/privacy">
            Privacy Policy
          </Anchor>
        </Text>
      }
      {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
    />
        
        <Button
          type="submit"
          loading={isRegisterPending || isLoginPending}
          disabled={!form.values.agreeToTerms || !form.isValid()}
        >
          Create Account
        </Button>
      </Stack>
    </FormProvider>
  );
}
