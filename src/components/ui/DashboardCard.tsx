"use client"

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountUp } from './CountUp';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'glow' | 'alert' | 'success' | 'warning';
  onClick?: () => void;
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = 'default',
  onClick,
}: DashboardCardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200',
    glow: 'bg-white border-af-blue/20 shadow-sm shadow-af-blue/5',
    alert: 'bg-white border-af-orange/20',
    success: 'bg-white border-af-green/20',
    warning: 'bg-white border-af-yellow/20',
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn(
            'p-2 rounded-md',
            variant === 'glow' && 'bg-af-blue/15',
            variant === 'alert' && 'bg-af-orange/15',
            variant === 'success' && 'bg-af-green/15',
            variant === 'warning' && 'bg-af-yellow/15',
            variant === 'default' && 'bg-slate-100'
          )}>
            <Icon className={cn(
              'w-4 h-4',
              variant === 'glow' && 'text-af-blue',
              variant === 'alert' && 'text-af-orange',
              variant === 'success' && 'text-af-green',
              variant === 'warning' && 'text-af-yellow',
              variant === 'default' && 'text-slate-600'
            )} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-3xl font-bold',
            variant === 'glow' && 'text-af-blue iaf-text-glow',
            variant === 'alert' && 'text-af-orange',
            variant === 'success' && 'text-af-green',
            variant === 'warning' && 'text-af-yellow',
            variant === 'default' && 'text-slate-900'
          )}>
            {(() => {
              if (typeof value === 'number') return <CountUp value={value} />;
              if (typeof value === 'string') {
                const numericValue = parseFloat(value);
                if (!isNaN(numericValue)) {
                  const suffix = value.includes('%') ? '%' : '';
                  const prefix = value.startsWith('$') ? '$' : '';
                  // Only animate if it looks like a simple number or percentage
                  if (value.replace(/[0-9.%$]/g, '').length === 0 || (suffix && value.endsWith('%')) || (prefix && value.startsWith('$'))) {
                    return <CountUp value={numericValue} prefix={prefix} suffix={suffix} />;
                  }
                }
              }
              return value;
            })()}
          </span>
          {trend && (
            <span className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-iaf-success' : 'text-iaf-alert'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
