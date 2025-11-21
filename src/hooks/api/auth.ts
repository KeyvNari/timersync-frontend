// src/hooks/api/auth.ts - Updated registration hook
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { removeClientAccessToken, setClientAccessToken } from '@/api/axios';
import { LoginRequestSchema, LoginResponseSchema } from '@/api/dtos';
import { createPostMutationHook } from '@/api/helpers';
import { auth } from '@/services/firebase';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/api/query-client';

// Keep existing login schemas
export const useLogin = createPostMutationHook({
  endpoint: '/api/v1/login',
  bodySchema: LoginRequestSchema,
  responseSchema: LoginResponseSchema,
  options: { isFormEncoded: true },
  rMutationParams: {
    onSuccess: (data) => {
      setClientAccessToken(data.access_token);
    },
    onError: (error) => {
      notifications.show({ 
        title: 'Login Failed',
        message: error?.message || 'Invalid credentials', 
        color: 'red' 
      });
    },
  },
});

// Updated registration schemas to match TimerSync API
const RegisterRequestSchema = z.object({
  name: z.string().min(2).max(30),
  username: z.string().min(2).max(20).regex(/^[a-z0-9]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

const RegisterResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  profile_image_url: z.string(),
  plan: z.string(),
});

export const useRegister = createPostMutationHook({
  endpoint: '/api/v1/user',
  bodySchema: RegisterRequestSchema,
  responseSchema: RegisterResponseSchema,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Account Created!',
        message: 'Logging you in...',
        color: 'green'
      });
    },
    onError: (error: any) => {
      // Handle validation errors from backend
      if (error?.detail && Array.isArray(error.detail)) {
        const errorMessages = error.detail.map((err: any) => err.msg).join(', ');
        notifications.show({
          title: 'Registration Failed',
          message: errorMessages,
          color: 'red'
        });
      } else if (error?.message) {
        notifications.show({
          title: 'Registration Failed',
          message: error.message,
          color: 'red'
        });
      } else {
        notifications.show({
          title: 'Registration Failed',
          message: 'Registration failed. Please try again.',
          color: 'red'
        });
      }
    },
  },
});

export const useLogout = () => {
  const { setIsAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async () => {
      try {
        // Sign out from Firebase
        await auth.signOut();
      } catch (error) {
        console.error('Firebase signOut error:', error);
        // Continue with cleanup even if Firebase signOut fails
      }

      // Clear access token from localStorage and axios
      removeClientAccessToken();

      // Clear auth state in provider - this triggers AuthGuard redirect
      setIsAuthenticated(false);

      // Invalidate all queries to clear cached data
      await queryClient.clear();
    },
    onSuccess: () => {
      notifications.show({
        title: 'Logged Out',
        message: 'You have been successfully logged out',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Logout error:', error);

      // Even on error, ensure we're logged out locally
      removeClientAccessToken();
      setIsAuthenticated(false);
      queryClient.clear();

      // Show notification
      notifications.show({
        title: 'Session Ended',
        message: 'You have been logged out',
        color: 'blue'
      });
    },
  });
};