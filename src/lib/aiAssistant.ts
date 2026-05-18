import { apiFetch } from './api';
import type { ChatMessage } from '@/types';

export async function getChatHistory(): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>('/ai-assistant/history');
}

export async function sendMessage(content: string): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  return apiFetch<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>('/ai-assistant/message', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function clearChatHistory(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/ai-assistant/history', { method: 'DELETE' });
}
