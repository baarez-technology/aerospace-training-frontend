import { apiFetch } from './api';
import type { User, TrainingSession, Scenario, AnalyticsData } from '@/types';

export interface TraineeOverview extends User {
  readinessScore: number;
  progress: number;
  simulationHours: number;
  status: string;
}

export async function getTraineesOverview(): Promise<TraineeOverview[]> {
  return apiFetch<TraineeOverview[]>('/instructor/trainees');
}

export async function getTrainingSessions(): Promise<TrainingSession[]> {
  return apiFetch<TrainingSession[]>('/instructor/sessions');
}

export async function createTrainingSession(data: Partial<TrainingSession>): Promise<TrainingSession> {
  return apiFetch<TrainingSession>('/instructor/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTrainingSession(id: string, data: Partial<TrainingSession>): Promise<TrainingSession> {
  return apiFetch<TrainingSession>(`/instructor/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTrainingSession(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/instructor/sessions/${id}`, { method: 'DELETE' });
}

export async function getScenarios(): Promise<Scenario[]> {
  return apiFetch<Scenario[]>('/instructor/scenarios');
}

export async function createScenario(data: Partial<Scenario>): Promise<Scenario> {
  return apiFetch<Scenario>('/instructor/scenarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getInstructorAnalytics(): Promise<{ summary: any, charts: AnalyticsData }> {
  return apiFetch<{ summary: any, charts: AnalyticsData }>('/instructor/analytics');
}
