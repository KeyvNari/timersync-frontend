import { z } from 'zod';

export const User = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  profile_image_url: z.string().url(),
  plan: z.string(),
});

export type User = z.infer<typeof User>;