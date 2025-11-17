// src/pages/auth/register/register-form.tsx - Updated with better error handling
import { useState } from 'react';
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
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { FormProvider } from '@/components/forms/form-provider';
import { RegisterRequestSchema } from '@/api/dtos';
import { useRegister, useLogin } from '@/hooks';
import { useAuth } from '@/hooks/use-auth';
import { paths } from '@/routes';

// Local schema for form validation (username is auto-generated, so optional for form)
const FormValidationSchema = RegisterRequestSchema.pick({
  name: true,
  email: true,
  password: true,
});

// Helper to generate username from email (remove @ and domain, keep only lowercase letters and numbers)
const generateUsernameFromEmail = (email: string): string => {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  // Ensure minimum 2 characters, pad with numbers if needed
  if (baseUsername.length < 2) {
    return (baseUsername + '1').substring(0, 20);
  }
  return baseUsername.substring(0, 20);
};

interface RegisterFormProps extends Omit<StackProps, 'children'> {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess, ...props }: RegisterFormProps) {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const [errorSuggestion, setErrorSuggestion] = useState<{
    message: string;
    field?: string;
  } | null>(null);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(FormValidationSchema),
    initialValues: {
      name: '',
      email: '',
      password: '',
      username: '',
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

    // Auto-generate username from email if empty
    if (!registrationData.username) {
      registrationData.username = generateUsernameFromEmail(registrationData.email);
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
                // Give the token time to be stored and the auth context to update
                setTimeout(() => {
                  navigate(paths.dashboard.root, { replace: true });
                }, 500);
              },
              onError: (error: any) => {
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
          // Clear previous suggestions
          setErrorSuggestion(null);

          // Handle 409 Conflict (duplicate user) with new error structure
          if (error?.status === 409 || error?.response?.status === 409) {
            const errorData = error?.response?.data || error;
            const { detail, extra } = errorData;

            // Set field-specific error
            if (extra?.field) {
              form.setFieldError(extra.field, detail);
              // Show suggestion if available
              if (extra?.suggestion) {
                setErrorSuggestion({
                  message: extra.suggestion,
                  field: extra.field,
                });
              }
            } else {
              // Generic 409 error
              form.setFieldError('email', detail || 'Registration failed');
            }
            return;
          }

          // Handle old-style validation errors (pydantic validation errors)
          if (error?.detail && Array.isArray(error.detail)) {
            error.detail.forEach((err: any) => {
              if (err.loc && err.loc.length > 1) {
                const fieldName = err.loc[err.loc.length - 1];
                form.setFieldError(fieldName, err.msg);
              }
            });
            return;
          }

          // Handle generic error responses
          if (error?.detail && typeof error.detail === 'string') {
            form.setFieldError('email', error.detail);
            return;
          }

          // Fallback error
          form.setFieldError('email', 'Registration failed. Please try again.');
        },
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
        {errorSuggestion && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Helpful Suggestion"
            color="blue"
            variant="light"
            onClose={() => setErrorSuggestion(null)}
            withCloseButton
          >
            {errorSuggestion.message}
          </Alert>
        )}
        <TextInput
          label="Name"
          placeholder="Enter your full name"
          required
          {...form.getInputProps('name')}
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
          <Anchor fz="inherit" lh="inherit" component={NavLink} to={paths.auth.terms}>
            Terms of Service
          </Anchor>{' '}
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
