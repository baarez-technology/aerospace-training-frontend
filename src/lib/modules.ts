import { apiFetch } from './api';
import type { Module } from '@/types';

export async function listModules(params?: { courseId?: string }): Promise<Module[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch<Module[]>(`/modules${query ? `?${query}` : ''}`);
}

export async function getModuleById(id: string): Promise<Module> {
  return apiFetch<Module>(`/modules/${id}`);
}

export async function createModule(data: Partial<Module>): Promise<Module> {
  return apiFetch<Module>('/modules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateModule(id: string, data: Partial<Module>): Promise<Module> {
  return apiFetch<Module>(`/modules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function completeModule(id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/modules/${id}/complete`, { method: 'POST' });
}

export async function deleteModule(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/modules/${id}`, { method: 'DELETE' });
}

export async function uploadModuleVideo(
  id: string,
  file: File
): Promise<{ videoUrl: string; module: Module }> {
  const formData = new FormData();
  formData.append('video', file);

  return apiFetch<{ videoUrl: string; module: Module }>(`/modules/${id}/video/upload`, {
    method: 'POST',
    body: formData,
  });
}

export async function generateModuleVideo(
  id: string
): Promise<{ message: string; videoStatus: string; moduleId: string }> {
  return apiFetch(`/modules/${id}/video/generate`, { method: 'POST' });
}
