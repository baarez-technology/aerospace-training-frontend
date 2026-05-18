import { apiFetch } from './api';
import type { Simulation } from '@/types';

export async function getSimulations(): Promise<Simulation[]> {
  return apiFetch<Simulation[]>('/simulations');
}

export async function getSimulationById(id: string): Promise<Simulation> {
  return apiFetch<Simulation>(`/simulations/${id}`);
}

export async function startSimulation(id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/simulations/${id}/start`, { method: 'POST' });
}

export async function completeSimulation(id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/simulations/${id}/complete`, { method: 'POST' });
}

export interface ScenarioSession {
  session_id: string;
  scenario_id: string;
  status: string;
  started_at: string;
}

export async function startScenarioSession(scenarioId: string): Promise<ScenarioSession> {
  return apiFetch<ScenarioSession>(`/scenarios/${scenarioId}/sessions`, { method: 'POST' });
}

export async function triggerScenarioEvent(
  sessionId: string,
  event: string,
  payload: Record<string, any> = {},
): Promise<{ session_id: string; trigger: string; fired_at: string | null }> {
  return apiFetch(`/scenarios/sessions/${sessionId}/trigger`, {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  });
}

export async function recordScenarioAction(
  sessionId: string,
  action: string,
  payload: Record<string, any> = {},
): Promise<{ session_id: string; action: string; recorded: boolean }> {
  return apiFetch(`/scenarios/sessions/${sessionId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, payload }),
  });
}

export async function getScenarioResult(sessionId: string): Promise<{
  session_id: string;
  result: Record<string, any> | null;
  status: string;
}> {
  return apiFetch(`/scenarios/sessions/${sessionId}/result`);
}
