"use client"

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'alert' | 'cyan';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  labelPosition = 'outside',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  const variantClasses = {
    default: 'bg-af-blue',
    success: 'bg-iaf-success',
    warning: 'bg-iaf-warning',
    alert: 'bg-iaf-alert',
    cyan: 'bg-iaf-cyan',
  };
  
  // Determine variant based on percentage if default
  const getVariant = () => {
    if (variant !== 'default') return variant;
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'default';
    if (percentage >= 25) return 'warning';
    return 'alert';
  };
  
  const finalVariant = getVariant();

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-af-midnight/60">Progress</span>
          <span className="text-xs font-medium text-af-navy">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-af-gray-light rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            variantClasses[finalVariant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {showLabel && labelPosition === 'inside' && size === 'lg' && (
            <motion.span 
              className="text-xs font-medium text-white px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
