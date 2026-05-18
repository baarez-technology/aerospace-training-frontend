import { apiFetch } from './api';

export interface ChecklistItem {
  id: string;
  ordinal: number;
  challenge: string;
  expected_response: string | null;
  mode: string;
  target_time_seconds: number | null;
  is_critical: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  phase: string;
  items: ChecklistItem[];
}

export interface ChecklistSession {
  session_id: string;
  checklist_id: string;
  items: Omit<ChecklistItem, 'mode' | 'is_critical'>[];
  started_at: string;
}

export interface ChecklistSessionState {
  session_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
}

export async function listChecklists(params?: { aircraft_id?: string; phase?: string }): Promise<Checklist[]> {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<Checklist[]>(`/checklists${query ? `?${query}` : ''}`);
}

export async function getChecklist(id: string): Promise<Checklist> {
  return apiFetch<Checklist>(`/checklists/${id}`);
}

export async function startChecklistSession(
  checklistId: string,
  params?: { mode?: string; trainee_id?: string },
): Promise<ChecklistSession> {
  return apiFetch<ChecklistSession>(`/checklists/${checklistId}/sessions`, {
    method: 'POST',
    body: JSON.stringify({ mode: 'challenge_response', ...params }),
  });
}

export async function callChecklistItem(sessionId: string, itemId: string): Promise<{ status: string }> {
  return apiFetch(`/checklists/sessions/${sessionId}/items/${itemId}/call`, { method: 'POST' });
}

export async function respondChecklistItem(
  sessionId: string,
  itemId: string,
  response: string,
): Promise<{ status: string; response: string }> {
  return apiFetch(`/checklists/sessions/${sessionId}/items/${itemId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ response }),
  });
}

export async function completeChecklistSession(sessionId: string): Promise<{ status: string }> {
  return apiFetch(`/checklists/sessions/${sessionId}/complete`, { method: 'POST' });
}

export async function getChecklistSession(sessionId: string): Promise<ChecklistSessionState> {
  return apiFetch<ChecklistSessionState>(`/checklists/sessions/${sessionId}`);
}
