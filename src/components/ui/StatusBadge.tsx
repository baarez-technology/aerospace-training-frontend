"use client"

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatusType = 
  | 'operational' 
  | 'maintenance' 
  | 'faulty' 
  | 'active' 
  | 'inactive' 
  | 'on-leave'
  | 'completed'
  | 'in-progress'
  | 'not-started'
  | 'available'
  | 'scheduled'
  | 'info'
  | 'warning'
  | 'critical'
  | 'success'
  | 'pending'
  | 'degraded'
  | 'down'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'overdue';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { label: string; className: string; dotColor: string }> = {
  operational: {
    label: 'Operational',
    className: 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    dotColor: 'bg-iaf-success',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    dotColor: 'bg-iaf-warning',
  },
  faulty: {
    label: 'Faulty',
    className: 'bg-iaf-alert/20 text-iaf-alert border-iaf-alert/30',
    dotColor: 'bg-iaf-alert',
  },
  active: {
    label: 'Active',
    className: 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    dotColor: 'bg-iaf-success',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dotColor: 'bg-gray-500',
  },
  'on-leave': {
    label: 'On Leave',
    className: 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    dotColor: 'bg-iaf-warning',
  },
  completed: {
    label: 'Completed',
    className: 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    dotColor: 'bg-iaf-success',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-iaf-cyan/20 text-iaf-cyan border-iaf-cyan/30',
    dotColor: 'bg-iaf-cyan',
  },
  'not-started': {
    label: 'Not Started',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dotColor: 'bg-gray-500',
  },
  available: {
    label: 'Available',
    className: 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    dotColor: 'bg-iaf-success',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-iaf-cyan/20 text-iaf-cyan border-iaf-cyan/30',
    dotColor: 'bg-iaf-cyan',
  },
  info: {
    label: 'Info',
    className: 'bg-iaf-cyan/20 text-iaf-cyan border-iaf-cyan/30',
    dotColor: 'bg-iaf-cyan',
  },
  warning: {
    label: 'Warning',
    className: 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    dotColor: 'bg-iaf-warning',
  },
  critical: {
    label: 'Critical',
    className: 'bg-iaf-alert/20 text-iaf-alert border-iaf-alert/30',
    dotColor: 'bg-iaf-alert',
  },
  success: {
    label: 'Success',
    className: 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    dotColor: 'bg-iaf-success',
  },
  pending: {
    label: 'Pending',
    className: 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    dotColor: 'bg-iaf-warning',
  },
  degraded: {
    label: 'Degraded',
    className: 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    dotColor: 'bg-iaf-warning',
  },
  down: {
    label: 'Down',
    className: 'bg-iaf-alert/20 text-iaf-alert border-iaf-alert/30',
    dotColor: 'bg-iaf-alert',
  },
  beginner: {
    label: 'Beginner',
    className: 'bg-iaf-success/20 text-iaf-success border-iaf-success/30',
    dotColor: 'bg-iaf-success',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-iaf-warning/20 text-iaf-warning border-iaf-warning/30',
    dotColor: 'bg-iaf-warning',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-iaf-alert/20 text-iaf-alert border-iaf-alert/30',
    dotColor: 'bg-iaf-alert',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-iaf-alert/20 text-iaf-alert border-iaf-alert/30',
    dotColor: 'bg-iaf-alert',
  },
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
  size = 'md',
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium flex items-center gap-1.5',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      )}
      {label || config.label}
    </Badge>
  );
}
