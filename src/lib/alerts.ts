import { apiFetch } from './api';
import type { Alert } from '@/types';

export async function getAlerts(params?: { type?: string; unread?: boolean }): Promise<Alert[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch<Alert[]>(`/alerts${query ? `?${query}` : ''}`);
}

export async function markAlertAsRead(id: string): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${id}/read`, { method: 'PATCH' });
}

export async function markAllAlertsAsRead(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/alerts/read-all', { method: 'PATCH' });
}

export async function clearAlerts(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/alerts', { method: 'DELETE' });
}
