import { apiFetch } from './api';
import type { TraineeProgress } from '@/types';

export async function getProgress(): Promise<TraineeProgress | TraineeProgress[]> {
  return apiFetch<TraineeProgress | TraineeProgress[]>('/progress');
}

export async function getTraineeProgress(traineeId: string): Promise<TraineeProgress> {
  return apiFetch<TraineeProgress>(`/progress/${traineeId}`);
}

export async function updateTraineeProgress(traineeId: string, data: Partial<TraineeProgress>): Promise<TraineeProgress> {
  return apiFetch<TraineeProgress>(`/progress/${traineeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
