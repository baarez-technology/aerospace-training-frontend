import { apiFetch } from './api';

export interface StartVRSessionData {
  training_session_id: string;
  device_id: string;
  device_type: string;
  runtime?: 'webxr' | 'unity';
  app_version?: string;
}

export interface VREvent {
  id?: string;
  event_type: string;
  timestamp: string;
  head_pose?: { position: [number, number, number]; rotation: [number, number, number, number] };
  controller_left?: Record<string, any>;
  controller_right?: Record<string, any>;
  interaction_target?: string;
  payload?: Record<string, any>;
}

export interface VRSession {
  id: string;
  device_id: string;
  device_type: string;
  runtime: string;
  started_at: string;
  ended_at: string | null;
  frame_rate_avg: number | null;
  event_count: number;
}

export async function startVRSession(data: StartVRSessionData): Promise<{ vr_session_id: string }> {
  return apiFetch('/vr/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function ingestVREvents(
  vrSessionId: string,
  events: VREvent[],
): Promise<{ accepted: number; duplicates: number }> {
  return apiFetch(`/vr/sessions/${vrSessionId}/events`, {
    method: 'POST',
    body: JSON.stringify({ events }),
  });
}

export async function endVRSession(
  vrSessionId: string,
  frameRateAvg?: number,
): Promise<{ vr_session_id: string; status: string }> {
  return apiFetch(`/vr/sessions/${vrSessionId}/end`, {
    method: 'POST',
    body: JSON.stringify({ frame_rate_avg: frameRateAvg ?? null }),
  });
}

export async function getVRSession(vrSessionId: string): Promise<VRSession> {
  return apiFetch<VRSession>(`/vr/sessions/${vrSessionId}`);
}
