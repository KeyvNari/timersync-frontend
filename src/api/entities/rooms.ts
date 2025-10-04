import { z } from 'zod';

export const Room = z.object({
  id: z.number(),
  created_by_user_id: z.number(),
  time_zone: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
  is_deleted: z.boolean(),
  connection_count: z.number(),
  timer_count: z.number(),
  messages: z.array(z.any()),
});

export type Room = z.infer<typeof Room>;

// Keep the response schema but make it match the backend
export const RoomsResponse = z.object({
  data: z.array(Room),
  total_count: z.number(),
  has_more: z.boolean(),
  page: z.number(),
  items_per_page: z.number(),
});

export type RoomsResponse = z.infer<typeof RoomsResponse>;
