import { apiFetch } from './api';

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actor_user_id: string;
  actor_ip: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  outcome: string;
  row_hash?: string;
  prev_hash?: string;
}

export interface AuditLogListResponse {
  entries: AuditLogEntry[];
}

export interface AuditChainVerification {
  total_entries: number;
  integrity: 'ok' | 'compromised';
  broken_at_id: number | null;
}

export async function listAuditLogs(params?: {
  actor?: string;
  action?: string;
  resource_type?: string;
  from_time?: string;
  to_time?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<AuditLogEntry[]>(`/audit/logs${query ? `?${query}` : ''}`);
}

export async function getAuditLog(logId: number): Promise<AuditLogEntry> {
  return apiFetch<AuditLogEntry>(`/audit/logs/${logId}`);
}

export async function verifyAuditChain(): Promise<AuditChainVerification> {
  return apiFetch<AuditChainVerification>('/audit/logs/verify');
}
