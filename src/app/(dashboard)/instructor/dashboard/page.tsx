'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CountUp } from '@/components/ui/CountUp';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { traineeOverviews, trainingSessions, analyticsData } from '@/data/mockData';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Clock,
  BookOpen,
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const activeTrainees = traineeOverviews.filter(t => t.status === 'active');
  const avgReadiness = Math.round(
    traineeOverviews.reduce((acc, t) => acc + t.readinessScore, 0) / traineeOverviews.length
  );
  const avgProgress = Math.round(
    traineeOverviews.reduce((acc, t) => acc + t.progress, 0) / traineeOverviews.length
  );
  const upcomingSessions = trainingSessions.filter(s => s.status === 'scheduled');

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Instructor Dashboard"
          subtitle="Overview of trainee progress and training activities"
          icon={LayoutDashboard}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Trainees"
            value={traineeOverviews.length}
            subtitle={`${activeTrainees.length} currently active`}
            icon={Users}
          />
          <DashboardCard
            title="Avg. Readiness"
            value={avgReadiness}
            subtitle="Squadron readiness score"
            icon={Target}
            variant="glow"
          />
          <DashboardCard
            title="Avg. Progress"
            value={`${avgProgress}%`}
            subtitle="Training completion rate"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
          <DashboardCard
            title="Upcoming Sessions"
            value={upcomingSessions.length}
            subtitle="Scheduled training sessions"
            icon={Calendar}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trainee Performance */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-af-orange" />
                  Trainee Performance
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/instructor/trainees')}
                  className="text-af-orange hover:text-af-orange/80 hover:bg-af-orange/10"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {traineeOverviews.slice(0, 5).map((trainee) => (
                    <div
                      key={trainee.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => router.push('/instructor/trainees')}
                    >
                      <img
                        src={trainee.avatar}
                        alt={trainee.name}
                        className="w-10 h-10 rounded-full bg-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-900">{trainee.name}</h4>
                          <StatusBadge status={trainee.status} size="sm" showDot={false} />
                        </div>
                        <p className="text-xs text-slate-500">{trainee.rank}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-xs text-slate-500">Readiness</p>
                          <p className={cn(
                            'text-sm font-medium',
                            trainee.readinessScore >= 80 ? 'text-af-green' :
                            trainee.readinessScore >= 60 ? 'text-af-yellow' : 'text-af-orange'
                          )}>
                            <CountUp value={trainee.readinessScore} />
                          </p>
                        </div>
                        <div className="w-24">
                          <ProgressBar value={trainee.progress} size="sm" showLabel={false} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Training Analytics Chart */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-af-blue" />
                  Training Analytics
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/instructor/analytics')}
                  className="text-af-blue hover:text-af-blue hover:bg-af-blue/10"
                >
                  Detailed View <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-4 px-2">
                  {analyticsData.readinessTrend.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center gap-1">
                        <motion.div
                          className="w-4 bg-af-orange/60 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${data.value * 1.5}px` }}
                          transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                        />
                        <motion.div
                          className="w-4 bg-af-blue/60 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${(data.value - 10) * 1.5}px` }}
                          transition={{ duration: 0.8, delay: (index * 0.05) + 0.1, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{data.label}</span>
                    </div>
                  ))}
                </div>
                    <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-af-orange/60 rounded" />
                    <span className="text-xs text-slate-600">Readiness Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-af-blue/60 rounded" />
                    <span className="text-xs text-slate-600">Completion Rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-orange/10 hover:border-af-orange/50 hover:text-af-orange transition-all duration-200"
                  onClick={() => router.push('/instructor/sessions')}
                >
                  <Calendar className="w-4 h-4 text-af-orange" />
                  Schedule Session
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-blue/10 hover:border-af-blue/50 hover:text-af-blue transition-all duration-200"
                  onClick={() => router.push('/instructor/content')}
                >
                  <BookOpen className="w-4 h-4 text-af-blue" />
                  Manage Content
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-green/10 hover:border-af-green/50 hover:text-af-green transition-all duration-200"
                  onClick={() => router.push('/instructor/scenarios')}
                >
                  <Target className="w-4 h-4 text-af-green" />
                  Create Scenario
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-af-blue" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg bg-slate-50 border-l-2 border-af-blue"
                  >
                    <h4 className="text-sm font-medium text-slate-900">{session.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {new Date(session.date).toLocaleDateString()} • {session.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{session.participants.length} trainees</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-af-orange" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {traineeOverviews
                  .filter(t => t.readinessScore < 60)
                  .map((trainee) => (
                    <div
                      key={trainee.id}
                      className="p-3 rounded-lg bg-red-50 border border-red-100"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-af-orange" />
                        <span className="text-sm font-bold text-slate-900">{trainee.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Low readiness score: <CountUp value={trainee.readinessScore} />
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Skill Distribution */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900">Skill Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.skillDistribution.map((skill) => (
                  <div key={skill.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">{skill.label}</span>
                      <span className="text-xs text-slate-900 font-medium">{skill.value}%</span>
                    </div>
                    <ProgressBar value={skill.value} size="sm" showLabel={false} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
