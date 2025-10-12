import { z } from 'zod';
import { client } from '../axios';
import { Room, RoomsResponse } from '../entities/rooms';

export async function getRooms(page: number = 1, itemsPerPage: number = 10) {
  const response = await client.get('/api/v1/rooms', {
    params: {
      page,
      items_per_page: itemsPerPage,
    },
  });
  return RoomsResponse.parse(response.data);
}

// Request schema for creating a room
export const CreateRoomRequestSchema = z.object({
  name: z.string().min(1),
  time_zone: z.string(),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

// Request schema for updating a room
export const UpdateRoomRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  time_zone: z.string(),
  is_active: z.boolean(),
});

export type UpdateRoomRequest = z.infer<typeof UpdateRoomRequestSchema>;

// API function for creating a room
export async function createRoom(request: CreateRoomRequest): Promise<Room> {
  const response = await client.post('/api/v1/room', request);
  return Room.parse(response.data);
}

// API function for updating a room
export async function updateRoom(roomId: number, request: UpdateRoomRequest): Promise<Room> {
  const response = await client.put(`/api/v1/room/${roomId}`, request);
  return Room.parse(response.data);
}

// API function for deleting a room
export async function deleteRoom(roomId: number): Promise<void> {
  await client.delete(`/api/v1/room/${roomId}`);
}
