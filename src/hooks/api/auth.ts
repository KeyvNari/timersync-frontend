import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { removeClientAccessToken, setClientAccessToken } from '@/api/axios';
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from '@/api/dtos';
import { createPostMutationHook } from '@/api/helpers';

export const useLogin = createPostMutationHook({
  endpoint: '/api/v1/login',
  bodySchema: LoginRequestSchema,
  responseSchema: LoginResponseSchema,
  options: { isFormEncoded: true },
  rMutationParams: {
    onSuccess: (data) => {
      setClientAccessToken(data.access_token);
      // Refresh token is automatically set as httpOnly cookie by backend
    },
    onError: (error) => {
      console.error('Login error:', error);
      notifications.show({ 
        title: 'Login Failed',
        message: error?.message || 'Invalid credentials', 
        color: 'red' 
      });
    },
  },
});

export const useLogout = createPostMutationHook({
  endpoint: '/api/v1/logout',
  bodySchema: z.object({}),
  responseSchema: z.object({}),
  rMutationParams: {
    onSuccess: () => {
      removeClientAccessToken();
      // Backend will clear the refresh token cookie
      notifications.show({ 
        title: 'Logged Out',
        message: 'You have been successfully logged out', 
        color: 'green' 
      });
    },
    onError: () => {
      // Even if logout API fails, still remove local token
      removeClientAccessToken();
      notifications.show({ 
        title: 'Logged Out',
        message: 'Session ended', 
        color: 'blue' 
      });
    },
  },
});

export const useRegister = createPostMutationHook({
  endpoint: '/api/v1/user',
  bodySchema: RegisterRequestSchema,
  responseSchema: RegisterResponseSchema,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({ 
        title: 'Account Created!', 
        message: 'Registration successful. Please log in with your credentials.', 
        color: 'green' 
      });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      notifications.show({ 
        title: 'Registration Failed',
        message: error?.message || 'Registration failed. Please try again.', 
        color: 'red' 
      });
    },
  },
});