import { client } from '../axios';
import { RoomsResponse } from '../entities/rooms';

export async function getRooms(page: number = 1, itemsPerPage: number = 10) {
  const response = await client.get('/api/v1/rooms', {
    params: {
      page,
      items_per_page: itemsPerPage,
    },
  });
  return RoomsResponse.parse(response.data);
}
