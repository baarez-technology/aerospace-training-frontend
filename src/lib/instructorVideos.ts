import { apiFetch } from './api';
import type { InstructorVideo } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  const session = localStorage.getItem('iaf_training_session');
  return session ? JSON.parse(session).token : null;
}

export async function listInstructorVideos(): Promise<InstructorVideo[]> {
  return apiFetch<InstructorVideo[]>('/instructor-videos');
}

export async function getMyAssignedVideos(): Promise<InstructorVideo[]> {
  return apiFetch<InstructorVideo[]>('/instructor-videos/my-assignments');
}

export async function uploadInstructorVideo(
  file: File,
  meta: { 
    title: string; 
    description?: string; 
    category?: string; 
    difficulty?: string;
    isPublic?: boolean;
    tags?: string 
  }
): Promise<InstructorVideo> {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', meta.title);
  if (meta.description) formData.append('description', meta.description);
  if (meta.category) formData.append('category', meta.category);
  if (meta.difficulty) formData.append('difficulty', meta.difficulty);
  if (meta.isPublic !== undefined) formData.append('isPublic', String(meta.isPublic));
  if (meta.tags) formData.append('tags', meta.tags);

  return apiFetch<InstructorVideo>('/instructor-videos/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function assignVideoToTrainees(
  videoId: string,
  traineeIds: string[]
): Promise<{ message: string; video: InstructorVideo }> {
  return apiFetch(`/instructor-videos/${videoId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ traineeIds }),
  });
}

export async function unassignTrainee(videoId: string, traineeId: string): Promise<{ message: string; video: InstructorVideo }> {
  return apiFetch(`/instructor-videos/${videoId}/assign/${traineeId}`, { method: 'DELETE' });
}

export async function deleteInstructorVideo(videoId: string): Promise<{ message: string }> {
  return apiFetch(`/instructor-videos/${videoId}`, { method: 'DELETE' });
}
