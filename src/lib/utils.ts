import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }
  return `${mins}m`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'operational': 'bg-iaf-success',
    'maintenance': 'bg-iaf-warning',
    'faulty': 'bg-iaf-alert',
    'active': 'bg-iaf-success',
    'inactive': 'bg-gray-500',
    'on-leave': 'bg-iaf-warning',
    'completed': 'bg-iaf-success',
    'in-progress': 'bg-iaf-cyan',
    'not-started': 'bg-gray-500',
    'available': 'bg-iaf-success',
    'scheduled': 'bg-iaf-cyan',
    'info': 'bg-iaf-cyan',
    'warning': 'bg-iaf-warning',
    'critical': 'bg-iaf-alert',
  };
  
  return colors[status] || 'bg-gray-500';
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    'beginner': 'text-iaf-success',
    'intermediate': 'text-iaf-warning',
    'advanced': 'text-iaf-alert',
  };
  
  return colors[difficulty] || 'text-gray-400';
}

export function getDifficultyBadgeColor(difficulty: string): string {
  const colors: Record<string, string> = {
    'beginner': 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    'intermediate': 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    'advanced': 'bg-iaf-alert/20 text-iaf-alert border-iaf-alert/30',
  };
  
  return colors[difficulty] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
