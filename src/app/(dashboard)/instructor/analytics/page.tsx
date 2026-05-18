'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CountUp } from '@/components/ui/CountUp';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { traineeOverviews, analyticsData, trainingSessions } from '@/data/mockData';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Activity,
  BookOpen,
  Award,
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function InstructorAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const avgReadiness = Math.round(
    traineeOverviews.reduce((acc, t) => acc + t.readinessScore, 0) / traineeOverviews.length
  );
  const avgProgress = Math.round(
    traineeOverviews.reduce((acc, t) => acc + t.progress, 0) / traineeOverviews.length
  );
  const totalSimHours = traineeOverviews.reduce((acc, t) => acc + t.simulationHours, 0);
  const completedSessions = trainingSessions.filter((s) => s.status === 'completed').length;

  const maxReadiness = Math.max(...analyticsData.readinessTrend.map((d) => d.value));
  const maxCompletion = Math.max(...analyticsData.trainingCompletion.map((d) => d.value));

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Training Analytics"
          subtitle="Squadron performance metrics, readiness trends, and skill assessment"
          icon={BarChart3}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-af-orange/10 group-hover:bg-af-orange/20 transition-colors">
                  <Target className="w-5 h-5 text-af-orange" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Avg. Readiness</p>
                  <p className="text-2xl font-bold text-slate-900">
                    <CountUp value={avgReadiness} />
                  </p>
                  <p className="text-xs text-af-green mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +5 this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-af-blue/10 group-hover:bg-af-blue/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-af-blue" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Avg. Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    <CountUp value={avgProgress} suffix="%" />
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Course completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-af-green/10 group-hover:bg-af-green/20 transition-colors">
                  <Activity className="w-5 h-5 text-af-green" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sim Hours</p>
                  <p className="text-2xl font-bold text-slate-900">
                    <CountUp value={totalSimHours} suffix="h" />
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Total squadron</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-af-yellow/10 group-hover:bg-af-yellow/20 transition-colors">
                  <Award className="w-5 h-5 text-af-yellow" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sessions Done</p>
                  <p className="text-2xl font-bold text-slate-900">
                    <CountUp value={completedSessions} />
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Of {trainingSessions.length} total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readiness Trend */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-af-orange" />
                Readiness Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end gap-3">
                {analyticsData.readinessTrend.map((data, i) => {
                  const height = Math.round((data.value / maxReadiness) * 140);
                  const isLast = i === analyticsData.readinessTrend.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-slate-600 font-medium">
                        <CountUp value={data.value} duration={1} />
                      </span>
                      <motion.div
                        className={cn(
                          'w-full rounded-t-sm',
                          isLast ? 'bg-af-orange' : 'bg-af-orange/30'
                        )}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}px` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                      <span className="text-[10px] text-slate-400">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Training Completion */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-af-blue" />
                Weekly Training Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end gap-3">
                {analyticsData.trainingCompletion.map((data, i) => {
                  const height = Math.round((data.value / maxCompletion) * 140);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-slate-600 font-medium">
                        <CountUp value={data.value} duration={1} />
                      </span>
                      <motion.div
                        className="w-full rounded-t-sm bg-af-blue/60"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}px` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                      <span className="text-[10px] text-slate-400">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Usage */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-af-green" />
                Simulation Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.simulationUsage.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium text-slate-900">
                      <CountUp value={item.value} /> sessions
                    </span>
                  </div>
                  <ProgressBar
                    value={Math.round((item.value / Math.max(...analyticsData.simulationUsage.map((s) => s.value))) * 100)}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skill Distribution */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-af-orange" />
                Skill Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.skillDistribution.map((skill) => (
                <div key={skill.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">{skill.label}</span>
                    <span className="text-xs font-medium text-slate-900">
                      <CountUp value={skill.value} suffix="%" />
                    </span>
                  </div>
                  <ProgressBar value={skill.value} size="sm" showLabel={false} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Per-Trainee Breakdown */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-af-blue" />
                Trainee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {traineeOverviews.map((trainee) => (
                <div key={trainee.id} className="flex items-center gap-3">
                  <img
                    src={trainee.avatar}
                    alt={trainee.name}
                    className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-medium text-slate-900 truncate">{trainee.name}</p>
                      <span
                        className={cn(
                          'text-xs font-bold ml-2 flex-shrink-0',
                          trainee.readinessScore >= 80
                            ? 'text-af-green'
                            : trainee.readinessScore >= 60
                            ? 'text-af-yellow'
                            : 'text-af-orange'
                        )}
                      >
                        <CountUp value={trainee.readinessScore} />
                      </span>
                    </div>
                    <ProgressBar value={trainee.progress} size="sm" showLabel={false} />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      <CountUp value={trainee.simulationHours} suffix="h" /> simulation
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
