import { apiFetch } from './api';
import type { User, Role, AuditLog, SystemStatus, AnalyticsData } from '@/types';

export interface AdminDashboardData {
  totalUsers: number;
  totalTrainees: number;
  totalInstructors: number;
  recentAuditLogs: AuditLog[];
  systemStatus: SystemStatus[];
  charts: AnalyticsData;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return apiFetch<AdminDashboardData>('/admin/dashboard');
}

export async function getRoles(): Promise<Role[]> {
  return apiFetch<Role[]>('/admin/roles');
}

export async function createRole(data: { name: string; permissions?: any[] }): Promise<Role> {
  return apiFetch<Role>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


export async function getAuditLogs(params?: { module?: string; userId?: string; limit?: number; offset?: number }): Promise<{ total: number; logs: AuditLog[] }> {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch<{ total: number; logs: AuditLog[] }>(`/admin/audit-logs${query ? `?${query}` : ''}`);
}

export async function getSystemStatus(): Promise<SystemStatus[]> {
  return apiFetch<SystemStatus[]>('/admin/system-status');
}


export async function getAdminAnalytics(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>('/admin/analytics');
}

export async function getAdminUsers(): Promise<User[]> {
  return apiFetch<User[]>('/users');
}

export async function createAdminUser(data: any): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminUser(id: string, data: any): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminUser(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
}

export async function getSecuritySettings(): Promise<any> {
  return apiFetch<any>('/admin/security-settings');
}

export async function updateRole(id: string, data: any): Promise<Role> {
  return apiFetch<Role>(`/admin/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteRole(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/roles/${id}`, { method: 'DELETE' });
}

export async function updateSecuritySettings(data: any): Promise<any> {
  return apiFetch<any>('/admin/security-settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updateSystemStatus(data: any): Promise<any> {
  return apiFetch<any>('/admin/system-status', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

