import { apiFetch } from './api';
import type { AircraftSystem, Component } from '@/types';

export async function getAircraftSystems(params?: { category?: string; status?: string }): Promise<AircraftSystem[]> {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch<AircraftSystem[]>(`/digital-twin${query ? `?${query}` : ''}`);
}

export async function getSystemById(id: string): Promise<AircraftSystem> {
  return apiFetch<AircraftSystem>(`/digital-twin/${id}`);
}

export async function getSystemComponents(id: string): Promise<Component[]> {
  return apiFetch<Component[]>(`/digital-twin/${id}/components`);
}

export async function updateComponentStatus(
  systemId: string,
  componentId: string,
  data: Partial<Component>
): Promise<{ system: AircraftSystem; component: Component }> {
  return apiFetch<{ system: AircraftSystem; component: Component }>(
    `/digital-twin/${systemId}/components/${componentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}
