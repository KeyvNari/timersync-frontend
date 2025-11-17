import { z } from 'zod';
import { createGetQueryHook } from '@/api/helpers';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  profile_image_url: z.string().url().optional(),
  plan: z.string(),
});

export const useGetAccountInfo = createGetQueryHook({
  endpoint: '/api/v1/user/me/',
  responseSchema: UserSchema,
  rQueryParams: { queryKey: ['account'] },
});