'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/PageTransition';
import { CountUp } from '@/components/ui/CountUp';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { traineeOverviews } from '@/data/mockData';
import type { TraineeOverview } from '@/types';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Mail,
  MoreVertical,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function InstructorTraineesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selected, setSelected] = useState<TraineeOverview | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (traineeOverviews.length > 0) setSelected(traineeOverviews[0]);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const filtered = traineeOverviews.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.rank.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const avgReadiness = Math.round(
    traineeOverviews.reduce((acc, t) => acc + t.readinessScore, 0) / traineeOverviews.length
  );

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Trainee Management"
          subtitle="Monitor performance, track progress, and manage squadron members"
          icon={Users}
        />

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            title="Total Squadron"
            value={traineeOverviews.length}
            subtitle="Personnel assigned"
            icon={Users}
          />
          <DashboardCard
            title="Squadron Readiness"
            value={avgReadiness}
            subtitle="Avg. performance score"
            icon={Target}
            variant="glow"
          />
          <DashboardCard
            title="Active Modules"
            value={14}
            subtitle="Currently in progress"
            icon={BookOpen}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Trainee List */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search trainees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-af-orange/20"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['all', 'active', 'on-leave', 'inactive'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors whitespace-nowrap',
                      selectedStatus === s
                        ? 'bg-af-orange/10 border-af-orange/50 text-af-orange'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Readiness</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((trainee) => (
                      <tr
                        key={trainee.id}
                        onClick={() => setSelected(trainee)}
                        className={cn(
                          'hover:bg-slate-50 transition-colors cursor-pointer',
                          selected?.id === trainee.id && 'bg-af-orange/5'
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-af-blue/10 border border-af-blue/20 flex items-center justify-center text-af-blue font-bold text-sm shadow-sm group-hover:bg-af-blue group-hover:text-white transition-all duration-300">
                              {trainee.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{trainee.name}</p>
                              <p className="text-xs text-slate-500">{trainee.rank}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={trainee.status} size="sm" showDot={false} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'text-sm font-black',
                            trainee.readinessScore >= 80 ? 'text-af-green' :
                            trainee.readinessScore >= 60 ? 'text-af-yellow' : 'text-af-orange'
                          )}>
                            <CountUp value={trainee.readinessScore} />
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-32">
                            <ProgressBar value={trainee.progress} size="sm" showLabel={false} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Details Sidebar */}
          {selected && (
            <div className="w-full lg:w-72 space-y-4">
              <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-af-blue to-af-midnight relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-full border-4 border-white bg-white flex items-center justify-center text-af-blue font-bold text-2xl shadow-md">
                      {selected.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-10 pb-6 px-6">
                  <h3 className="text-lg font-black text-slate-900">{selected.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase">{selected.rank}</p>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Completion</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{selected.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Sim Hours</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{selected.simulationHours}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Target className="w-3.5 h-3.5" />
                        <span>Readiness</span>
                      </div>
                      <span className="text-xs font-bold text-af-blue">{selected.readinessScore}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button className="w-full bg-af-orange text-white hover:bg-af-orange/90 h-9 text-xs font-bold">
                      <Mail className="w-3.5 h-3.5 mr-2" /> Message Trainee
                    </Button>
                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 h-9 text-xs font-bold">
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Warnings if any */}
              {selected.readinessScore < 70 && (
                <div className="p-4 bg-af-orange/5 border border-af-orange/20 rounded-xl">
                  <div className="flex items-center gap-2 text-af-orange mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Critical Readiness</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Readiness below threshold. Consider additional session assignment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
