import { apiFetch } from './api';

export interface ProcedureStep {
  id: string;
  ordinal: number;
  action_text: string;
  expected_response: string | null;
  mode: string;
  is_critical: boolean;
  target_time_seconds: number | null;
  branches?: { condition: string; next_step_id: string }[];
}

export interface Procedure {
  id: string;
  name: string;
  procedure_type: 'normal' | 'abnormal' | 'emergency';
  phase: string;
  citation_key: string | null;
  steps: ProcedureStep[];
}

export interface ProcedureFlow {
  procedure_id: string;
  name: string;
  root_step_id: string | null;
  steps: Record<string, ProcedureStep>;
  citation_key: string | null;
}

export interface ProcedureSession {
  session_id: string;
  status: string;
  started_at: string;
}

export interface Deviation {
  id: string;
  step_id: string;
  deviation_type: string;
  severity: string;
  detected_at: string;
}

export async function listProcedures(params?: {
  aircraft_id?: string;
  procedure_type?: string;
  phase?: string;
}): Promise<Procedure[]> {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<Procedure[]>(`/procedures${query ? `?${query}` : ''}`);
}

export async function getProcedure(id: string): Promise<Procedure> {
  return apiFetch<Procedure>(`/procedures/${id}`);
}

export async function getProcedureFlow(id: string): Promise<ProcedureFlow> {
  return apiFetch<ProcedureFlow>(`/procedures/${id}/flow`);
}

export async function startProcedureSession(procedureId: string): Promise<ProcedureSession> {
  return apiFetch<ProcedureSession>(`/procedures/${procedureId}/sessions`, { method: 'POST' });
}

export async function completeStep(
  sessionId: string,
  stepId: string,
  params?: { elapsed_ms?: number; notes?: string },
): Promise<{ status: string }> {
  return apiFetch(`/procedures/sessions/${sessionId}/steps/${stepId}/complete`, {
    method: 'POST',
    body: JSON.stringify(params ?? {}),
  });
}

export async function completeProcedureSession(sessionId: string): Promise<{ status: string }> {
  return apiFetch(`/procedures/sessions/${sessionId}/complete`, { method: 'POST' });
}

export async function getSessionDeviations(sessionId: string): Promise<Deviation[]> {
  return apiFetch<Deviation[]>(`/procedures/sessions/${sessionId}/deviations`);
}
