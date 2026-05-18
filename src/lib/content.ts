import { apiFetch } from './api';

export interface ContentSource {
  id: string;
  source_type: string;
  title: string;
  version: string;
  aircraft_id: string | null;
  effective_date: string | null;
  status: string;
}

export interface IngestionJob {
  source_id: string;
  status: string;
  job_id: string;
}

export interface ContentSection {
  id: string;
  section_number: string | null;
  title: string;
  citation_key: string | null;
  page_number: number | null;
  content_markdown: string;
  children?: ContentSection[];
}

export interface ContentSourceTree {
  source_id: string;
  source_type: string;
  version: string;
  sections: ContentSection[];
}

export interface ContentReference {
  citation_key: string;
  section: ContentSection;
  source: ContentSource;
}

export interface ContentSearchResult {
  section_id: string;
  title: string;
  citation_key: string | null;
  excerpt: string;
}

export async function listContentSources(params?: {
  source_type?: string;
  aircraft_id?: string;
  status?: string;
}): Promise<ContentSource[]> {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch<ContentSource[]>(`/content/sources${query ? `?${query}` : ''}`);
}

export async function uploadContentSource(
  file: File,
  meta: {
    source_type: string;
    title: string;
    version: string;
    aircraft_id?: string;
    effective_date?: string;
  },
): Promise<IngestionJob> {
  const form = new FormData();
  form.append('file', file);
  form.append('source_type', meta.source_type);
  form.append('title', meta.title);
  form.append('version', meta.version);
  if (meta.aircraft_id) form.append('aircraft_id', meta.aircraft_id);
  if (meta.effective_date) form.append('effective_date', meta.effective_date);

  return apiFetch<IngestionJob>('/content/sources', { method: 'POST', body: form });
}

export async function getContentSource(sourceId: string): Promise<ContentSource> {
  return apiFetch<ContentSource>(`/content/sources/${sourceId}`);
}

export async function getContentSourceTree(sourceId: string): Promise<ContentSourceTree> {
  return apiFetch<ContentSourceTree>(`/content/sources/${sourceId}/tree`);
}

export async function approveContentSource(sourceId: string): Promise<ContentSource> {
  return apiFetch<ContentSource>(`/content/sources/${sourceId}/approve`, { method: 'POST' });
}

export async function archiveContentSource(sourceId: string): Promise<ContentSource> {
  return apiFetch<ContentSource>(`/content/sources/${sourceId}/archive`, { method: 'POST' });
}

export async function getContentSection(sectionId: string): Promise<ContentSection> {
  return apiFetch<ContentSection>(`/content/sections/${sectionId}`);
}

export async function resolveCitation(citationKey: string): Promise<ContentReference> {
  return apiFetch<ContentReference>(`/content/references/${encodeURIComponent(citationKey)}`);
}

export async function searchContent(query: string): Promise<ContentSearchResult[]> {
  return apiFetch<ContentSearchResult[]>(`/content/search?q=${encodeURIComponent(query)}`);
}
