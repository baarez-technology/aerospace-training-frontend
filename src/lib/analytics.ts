import { apiFetch } from './api';
import type { AnalyticsData, TraineeProgress } from '@/types';

export interface AnalyticsSummary {
  totalTrainees: number;
  avgReadiness: number;
  totalSimHours: number;
  completedSims: number;
  activeSessions: number;
  simulationsToday: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  charts: AnalyticsData;
}

export interface TraineeAnalytics {
  readinessScore: number;
  overallProgress: number;
  simulationHours: number;
  skills: TraineeProgress['skills'];
  recentActivity: TraineeProgress['recentActivity'];
}

export async function getFullAnalytics(): Promise<AnalyticsResponse> {
  return apiFetch<AnalyticsResponse>('/analytics');
}

export async function getTraineeAnalytics(): Promise<TraineeAnalytics> {
  return apiFetch<TraineeAnalytics>('/analytics/trainee');
}

export interface DeviationRecord {
  id: string;
  step_id: string;
  deviation_type: string;
  severity: string;
  expected: string | null;
  actual: string | null;
  detected_at: string;
}

export interface SessionDeviationsResponse {
  session_id: string;
  deviations: DeviationRecord[];
  summary: {
    total_deviations: number;
    critical_misses: number;
    timing_violations: number;
  };
}

export async function getSessionDeviations(sessionId: string): Promise<SessionDeviationsResponse> {
  return apiFetch<SessionDeviationsResponse>(`/analytics/sessions/${sessionId}/deviations`);
}

export async function getTraineeProgression(traineeId: string): Promise<{ trainee_id: string; progression: any[] }> {
  return apiFetch(`/analytics/trainees/${traineeId}/progression`);
}

export async function getTraineeSummary(traineeId: string): Promise<{
  trainee_id: string;
  total_sessions: number;
  completed_sessions: number;
}> {
  return apiFetch(`/analytics/trainees/${traineeId}/summary`);
}

export async function getCohortSummary(cohortId: string): Promise<{ cohort_id: string; summary: Record<string, any> }> {
  return apiFetch(`/analytics/cohorts/${cohortId}/summary`);
}

export async function getComplianceReport(): Promise<Record<string, any>> {
  return apiFetch('/analytics/compliance/report');
}
