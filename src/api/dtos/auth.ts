import { z } from 'zod';

export const LoginRequestSchema = z.object({
  grant_type: z.literal('password').optional(),
  username: z.string().email(),
  password: z.string(),
  scope: z.string().optional().default(''),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export const RegisterRequestSchema = z.object({
  name: z.string().min(2).max(30),
  username: z.string().min(2).max(20).regex(/^[a-z0-9]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  profile_image_url: z.string().url(),
  plan: z.string(),
});