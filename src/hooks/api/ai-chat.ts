import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AskAIRequest, AskAIResponse, askAI } from '@/api/resources/ai-chat';

export function useAskAI(options?: UseMutationOptions<AskAIResponse, Error, AskAIRequest>) {
  return useMutation({
    mutationFn: askAI,
    ...options,
  });
}
