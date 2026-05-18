import { apiFetch } from './api';

export interface Competency {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface CompetencyEvidence {
  competency_id: string;
  score: number;
  recorded_at: string;
}

export interface Rubric {
  id: string;
  name: string;
  max_score: number;
  criteria?: Record<string, { weight: number; max: number }>;
}

export interface CreateRubricData {
  name: string;
  procedure_id?: string;
  scenario_id?: string;
  criteria?: Record<string, { weight: number; max: number }>;
  max_score?: number;
}

export interface Evaluation {
  id: string;
  rubric_id: string;
  scores: Record<string, number>;
  total_score: number | null;
  grade: string;
  comments: string | null;
  evaluated_at: string;
}

export interface CreateEvaluationData {
  rubric_id: string;
  scores: Record<string, number>;
  grade: 'excellent' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  comments?: string;
}

export async function listCompetencies(): Promise<Competency[]> {
  return apiFetch<Competency[]>('/competencies');
}

export async function getTraineeCompetencies(traineeId: string): Promise<CompetencyEvidence[]> {
  return apiFetch<CompetencyEvidence[]>(`/trainees/${traineeId}/competencies`);
}

export async function listRubrics(): Promise<Rubric[]> {
  return apiFetch<Rubric[]>('/rubrics');
}

export async function createRubric(data: CreateRubricData): Promise<{ id: string; name: string }> {
  return apiFetch('/rubrics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRubric(rubricId: string): Promise<Rubric> {
  return apiFetch<Rubric>(`/rubrics/${rubricId}`);
}

export async function createEvaluation(
  sessionId: string,
  data: CreateEvaluationData,
): Promise<{ id: string; session_id: string; grade: string; total_score: number }> {
  return apiFetch(`/sessions/${sessionId}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEvaluation(evaluationId: string): Promise<Evaluation> {
  return apiFetch<Evaluation>(`/evaluations/${evaluationId}`);
}

export async function updateEvaluation(
  evaluationId: string,
  data: { grade?: string; comments?: string },
): Promise<{ id: string; updated: boolean }> {
  return apiFetch(`/evaluations/${evaluationId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
