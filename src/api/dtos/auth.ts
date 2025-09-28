// src/api/dtos/auth.ts - Updated to match TimerSync API
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

// Updated to match TimerSync's exact requirements
export const RegisterRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(30, 'Name must be at most 30 characters'),
  username: z.string()
    .min(2, 'Username must be at least 2 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-z0-9]+$/, 'Username can only contain lowercase letters and numbers'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
});

// Response matches TimerSync UserRead schema
export const RegisterResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  profile_image_url: z.string(),
  plan: z.string(),
});
