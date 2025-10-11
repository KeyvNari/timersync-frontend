import { z } from 'zod';
import { client } from '../axios';

// Request schema matching backend API
export const AskAIRequestSchema = z.object({
  question: z.string().min(1),
  current_room_id: z.number().int().positive(),
  session_id: z.string().uuid().nullable(),
});

// Response schema matching backend API
export const AskAIResponseSchema = z.object({
  answer: z.string(),
  session_id: z.string().uuid(),
});

export type AskAIRequest = z.infer<typeof AskAIRequestSchema>;
export type AskAIResponse = z.infer<typeof AskAIResponseSchema>;

// API function for asking AI
export async function askAI(request: AskAIRequest): Promise<AskAIResponse> {
  const response = await client.post('/api/v1/ask', request);
  return AskAIResponseSchema.parse(response.data);
}
