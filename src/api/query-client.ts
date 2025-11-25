import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic refetch on window focus to prevent random re-verification
      // This was causing auth to be re-checked every time user switched tabs,
      // which combined with network timeouts would cause random signouts
      refetchOnWindowFocus: false,

      // Set a stale time of 5 minutes for queries
      // This prevents unnecessary refetches for frequently accessed data
      staleTime: 5 * 60 * 1000,

      // Disable automatic retries - handled at axios interceptor level
      retry: false,

      // Keep previous data while refetching to prevent UI flashing
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: false,
    },
  },
});
