import { NavLink } from 'react-router-dom';
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
import { useRegister } from '@/hooks';
import { paths } from '@/routes';
import { handleFormErrors } from '@/utilities/form';

interface RegisterFormProps extends Omit<StackProps, 'children'> {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess, ...props }: RegisterFormProps) {
  const { mutate: register, isPending } = useRegister();

  const form = useForm({
    mode: 'uncontrolled',
    validate: zodResolver(RegisterRequestSchema),
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.onSubmit((variables) => {
    register({ variables }, {
      onSuccess: () => onSuccess?.(),
      onError: (error) => handleFormErrors(form, error),
    });
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
        <TextInput name="name" label="Full name" required />
        <TextInput name="username" label="Username" required />
        <TextInput name="email" label="Email" required />
        <PasswordInput name="password" label="Password" required />
        <Checkbox
          label={
            <Text fz="inherit" c="inherit" lh="inherit">
              By signing up you have agreed to our{' '}
              <Anchor fz="inherit" lh="inherit" component={NavLink} to={paths.auth.terms}>
                Terms
              </Anchor>{' '}
              &{' '}
              <Anchor fz="inherit" lh="inherit" component={NavLink} to={paths.auth.privacy}>
                Privacy Policy
              </Anchor>
            </Text>
          }
        />
        <Button type="submit" loading={isPending}>Register</Button>
      </Stack>
    </FormProvider>
  );
}
