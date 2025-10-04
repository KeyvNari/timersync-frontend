import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { client } from '@/api/axios';  
import { Room } from '@/api/entities/rooms';  

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
      // Use the correct parameter names that match your backend
      const response = await client.get('/api/v1/rooms', {
        params: {
          page,
          items_per_page: itemsPerPage, // Backend expects items_per_page, not itemsPerPage
        },
      });
      return RoomsResponseSchema.parse(response.data);
    },
  });
}