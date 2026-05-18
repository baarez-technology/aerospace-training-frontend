import { apiFetch } from './api';
import type { User } from '@/types';

export async function listUsers(params?: { role?: string }): Promise<User[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch<User[]>(`/users${query ? `?${query}` : ''}`);
}

export async function getUserById(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

export async function createUser(data: Partial<User>): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
}

export async function assignRole(userId: string, role: string): Promise<void> {
  await apiFetch(`/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function revokeRole(userId: string, role: string): Promise<void> {
  await apiFetch(`/users/${userId}/roles/${encodeURIComponent(role)}`, { method: 'DELETE' });
}

export interface RoleDefinition {
  id: string;
  name: string;
  permissions: string[];
}

export async function listRoles(): Promise<RoleDefinition[]> {
  return apiFetch<RoleDefinition[]>('/roles');
}

export interface PermissionDefinition {
  id: string;
  name: string;
}

export async function listPermissions(): Promise<PermissionDefinition[]> {
  return apiFetch<PermissionDefinition[]>('/permissions');
}
