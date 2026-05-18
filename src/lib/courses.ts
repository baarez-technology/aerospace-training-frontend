import { apiFetch } from './api';
import type { Course } from '@/types';

export async function getCourses(): Promise<Course[]> {
  return apiFetch<Course[]>('/courses');
}

export async function getCourseById(id: string): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`);
}
