'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  showBackButton = false,
  className,
}: PageHeaderProps) {
  const router = useRouter();
  
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-af-blue hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
                  <Icon className="w-5 h-5 text-af-blue" />
                </div>
              )}
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 truncate flex items-center gap-2">
                 <span className="w-4 h-[1px] bg-slate-200" />
                 {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
