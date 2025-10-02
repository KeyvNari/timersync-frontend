import { z } from 'zod';

export const Room = z.object({
  id: z.number(),
  created_by_user_id: z.number(),
  time_zone: z.string(),
  name: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
  is_deleted: z.boolean(),
  connection_count: z.number(),
  timer_count: z.number(),
  messages: z.array(z.any()), // Assuming messages can be any for now
});

export type Room = z.infer<typeof Room>;

export const RoomsResponse = z.object({
  data: z.array(Room),
});

export type RoomsResponse = z.infer<typeof RoomsResponse>;
