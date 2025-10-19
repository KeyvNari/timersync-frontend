import { useQuery, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { client } from '@/api/axios';
import { Room } from '@/api/entities/rooms';
import { CreateRoomRequest, createRoom, UpdateRoomRequest, updateRoom, deleteRoom } from '@/api/resources/rooms';

const QUERY_KEY = 'rooms';

// Match your backend's response structure
const RoomsResponseSchema = z.object({
  data: z.array(Room),
  total_count: z.number(),
  has_more: z.boolean(),
  page: z.number(),
  items_per_page: z.number(),
});

export type RoomsResponse = z.infer<typeof RoomsResponseSchema>;

export function useGetRooms(page: number = 1, itemsPerPage: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, { page, itemsPerPage }],
    queryFn: async () => {
      console.log('[useGetRooms] Fetching rooms with params:', { page, items_per_page: itemsPerPage });
      // Use the correct parameter names that match your backend
      const response = await client.get('/api/v1/rooms', {
        params: {
          page,
          items_per_page: itemsPerPage, // Backend expects items_per_page, not itemsPerPage
        },
      });
      console.log('[useGetRooms] Raw API response:', response.data);
      const parsed = RoomsResponseSchema.parse(response.data);
      console.log('[useGetRooms] Parsed rooms data:', parsed);
      console.log('[useGetRooms] Number of rooms:', parsed.data.length);
      return parsed;
    },
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}

export function useCreateRoom(options?: UseMutationOptions<Room, Error, CreateRoomRequest>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createRoom,
    onSuccess: async (data, variables, context) => {
      console.log('[useCreateRoom] Starting refetch...');
      console.log('[useCreateRoom] Query cache:', queryClient.getQueryCache().getAll());
      // Refetch ALL queries that start with the rooms query key (partial matching)
      const result = await queryClient.refetchQueries({
        predicate: (query) => {
          const matches = query.queryKey[0] === QUERY_KEY;
          console.log('[useCreateRoom] Query key check:', query.queryKey, 'matches:', matches);
          return matches;
        }
      });
      console.log('[useCreateRoom] Refetch completed:', result);
      // Call the custom onSuccess if provided
      if (options?.onSuccess) {
        await (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

export function useUpdateRoom(options?: UseMutationOptions<Room, Error, { roomId: number; data: UpdateRoomRequest }>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ roomId, data }) => updateRoom(roomId, data),
    onSuccess: async (data, variables, context) => {
      // Refetch all active queries with the rooms query key
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEY],
        type: 'active'
      });
      // Call the custom onSuccess if provided
      if (options?.onSuccess) {
        await (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

export function useDeleteRoom(options?: UseMutationOptions<void, Error, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteRoom,
    onSuccess: async (data, variables, context) => {
      // Refetch all active queries with the rooms query key
      await queryClient.refetchQueries({
        queryKey: [QUERY_KEY],
        type: 'active'
      });
      // Call the custom onSuccess if provided
      if (options?.onSuccess) {
        await (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}