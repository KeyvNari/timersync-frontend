import { useQuery } from '@tanstack/react-query';
import { RoomsResponse } from '@/api/entities';
import { getRooms } from '@/api/resources';

const QUERY_KEY = 'rooms';

export function useGetRooms(page: number = 1, itemsPerPage: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEY, { page, itemsPerPage }],
    queryFn: async () => {
      const response = await getRooms(page, itemsPerPage);
      return RoomsResponse.parse(response);
    },
  });
}
