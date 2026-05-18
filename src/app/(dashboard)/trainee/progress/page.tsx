'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime, cn } from '@/lib/utils';
import { getProgress } from '@/lib/progress';
import { getCourses } from '@/lib/courses';
import { traineeProgress as mockProgress, courses as mockCourses } from '@/data/mockData';
import type { TraineeProgress, Course } from '@/types';
import {
  GraduationCap,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Award,
  Activity,
  CheckCircle,
  BarChart3,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState('week');
  const [traineeProgress, setTraineeProgress] = useState<TraineeProgress | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProgress(),
      getCourses()
    ]).then(([progressData, coursesData]) => {
      setTraineeProgress((progressData as TraineeProgress) ?? mockProgress);
      const list = Array.isArray(coursesData) && coursesData.length > 0 ? coursesData : mockCourses;
      setCourses(list);
    }).catch(() => {
      setTraineeProgress(mockProgress);
      setCourses(mockCourses);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
     return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-af-blue" /></div>;
  }

  if (!traineeProgress) {
     return <div className="p-6 font-bold text-center text-slate-500 mt-20">No progress data available.</div>;
  }

  const completedCourses = courses.filter(c => c.status === 'completed');
  const inProgressCourses = courses.filter(c => c.status === 'in-progress');

  return (
    <div className="p-6 space-y-6 text-slate-900">
      <PageHeader
        title="Training Progress"
        subtitle="Track your learning journey and achievements"
        icon={GraduationCap}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Overall Progress"
          value={`${traineeProgress.overallProgress}%`}
          subtitle="Across all courses"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Readiness Score"
          value={traineeProgress.readinessScore}
          subtitle="Mission readiness rating"
          icon={Target}
          variant="glow"
        />
        <DashboardCard
          title="Simulation Hours"
          value={traineeProgress.simulationHours}
          subtitle="Total training time"
          icon={Clock}
        />
        <DashboardCard
          title="Courses Completed"
          value={`${traineeProgress.completedCourses}/${traineeProgress.totalCourses}`}
          subtitle="Certification progress"
          icon={Award}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold"
          >
            <Target className="w-4 h-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Chart Placeholder */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-af-blue" />
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-slate-900 font-bold">Progress Trend</CardTitle>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-af-blue/10"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-3 px-2">
                  {[65, 68, 72, 70, 75, 78, 82].map((staticValue, index) => {
                    const value = traineeProgress.overallProgress === 0 ? 0 : staticValue;
                    return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                      <div
                        className="w-full bg-af-blue/20 group-hover:bg-af-blue/40 rounded-t-lg transition-all duration-300 relative"
                        style={{ height: `${value * 2}px` }}
                      >
                         <div className="absolute top-0 left-0 w-full h-1 bg-af-blue rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-af-blue transition-colors">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </span>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>

            {/* Readiness Breakdown */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-af-orange" />
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 font-bold">Readiness Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {traineeProgress.skills.map((skill) => {
                  const item = {
                    label: skill.name,
                    value: Math.round((skill.level / skill.maxLevel) * 100),
                    color: skill.category === 'Critical' ? 'bg-af-orange' : 'bg-af-blue'
                  };
                  return (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                      <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                    </div>
                    <ProgressBar value={item.value} size="sm" showLabel={false} className={cn("[&>div]:"+item.color)} />
                  </div>
                )})}
              </CardContent>
            </Card>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Modules Completed', value: traineeProgress.completedModules || 0, icon: CheckCircle, color: 'text-af-green', bg: 'bg-af-green/10' },
              { label: 'Assessments Passed', value: traineeProgress.completedCourses || 0, icon: Award, color: 'text-af-orange', bg: 'bg-af-orange/10' },
              { label: 'Simulations Run', value: Math.floor(traineeProgress.simulationHours || 0), icon: Activity, color: 'text-af-blue', bg: 'bg-af-blue/10' },
              { label: 'Study Hours', value: traineeProgress.simulationHours || 0, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' },
            ].map((stat) => (
              <Card key={stat.label} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6 space-y-6">
          {/* In Progress */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg text-slate-900 font-bold">In Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {inProgressCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-6 p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{course.title}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{course.category}</p>
                    </div>
                    <div className="w-48 hidden md:block">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={course.progress} size="sm" className="[&>div]:bg-af-blue" />
                        <span className="text-xs font-bold text-af-blue min-w-[32px]">{course.progress}%</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-af-blue hover:bg-af-blue/5 font-bold">
                       Continue
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg text-slate-900 font-bold">Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {completedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-6 p-5"
                  >
                    <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-100 opacity-80">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover grayscale-[0.2]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{course.title}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{course.category}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-af-green/10 rounded-full border border-af-green/5">
                      <CheckCircle className="w-4 h-4 text-af-green" />
                      <span className="text-xs font-bold text-af-green uppercase tracking-wider">Certified</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900 font-bold">Skill Proficiency Registry</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {traineeProgress.skills.map((skill) => (
                  <div key={skill.name} className="space-y-3 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{skill.name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{skill.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-af-orange">
                          {Math.round((skill.level / skill.maxLevel) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-af-orange/80 to-af-orange rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <span>Tier L{skill.level} Proficiency</span>
                      <span>Target L{skill.maxLevel} Mastery</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg text-slate-900 font-bold">Recent Intelligence Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {traineeProgress.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-5 p-5 hover:bg-slate-50/80 rounded-xl transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                      <Activity className="w-5 h-5 text-af-blue" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{activity.title}</h4>
                      {activity.details && (
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{activity.details}</p>
                      )}
                      <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-af-orange mt-2 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-6 space-y-6">
          {(() => {
            const complianceItems = [
              { name: 'Emergency Procedures Certification', status: 'compliant' as const, expiry: '2025-06-15' },
              { name: 'Flight Safety Training', status: 'compliant' as const, expiry: '2025-03-20' },
              { name: 'CRM Recurrent Training', status: 'pending' as const, expiry: '2025-02-28' },
              { name: 'Medical Certificate', status: 'compliant' as const, expiry: '2025-12-01' },
              { name: 'Security Clearance', status: 'compliant' as const, expiry: '2026-01-15' },
              { name: 'Simulator Proficiency Check', status: 'non-compliant' as const, expiry: '2024-12-31' },
              { name: 'Type Rating Currency', status: 'compliant' as const, expiry: '2025-09-30' },
            ];
            const compliantCount = complianceItems.filter(i => i.status === 'compliant').length;
            const compliancePct = Math.round((compliantCount / complianceItems.length) * 100);
            const statusConfig = {
              'compliant': { label: 'Compliant', bg: 'bg-af-green/10', text: 'text-af-green', border: 'border-af-green/20', icon: CheckCircle },
              'non-compliant': { label: 'Non-Compliant', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', icon: AlertTriangle },
              'pending': { label: 'Pending', bg: 'bg-af-orange/10', text: 'text-af-orange', border: 'border-af-orange/20', icon: Clock },
            };
            const getDaysRemaining = (expiry: string) => {
              const diff = new Date(expiry).getTime() - Date.now();
              return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            };

            return (
              <>
                {/* Compliance Summary */}
                <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                  <div className={cn('h-1', compliancePct >= 80 ? 'bg-af-green' : compliancePct >= 50 ? 'bg-af-orange' : 'bg-red-500')} />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center', compliancePct >= 80 ? 'bg-af-green/10' : 'bg-af-orange/10')}>
                        <ShieldCheck className={cn('w-10 h-10', compliancePct >= 80 ? 'text-af-green' : 'text-af-orange')} />
                      </div>
                      <div>
                        <p className="text-4xl font-black text-slate-900">{compliancePct}%</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Overall Compliance</p>
                        <p className="text-sm text-slate-500 mt-1">{compliantCount} of {complianceItems.length} requirements met</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Items */}
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg text-slate-900 font-bold">Compliance Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {complianceItems.map((item) => {
                        const config = statusConfig[item.status];
                        const StatusIcon = config.icon;
                        const days = getDaysRemaining(item.expiry);
                        const maxDays = 365;
                        const pct = Math.min(100, Math.round((days / maxDays) * 100));
                        return (
                          <div key={item.name} className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
                              <StatusIcon className={cn('w-5 h-5', config.text)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {item.status === 'non-compliant' ? 'Expired' : item.status === 'pending' ? 'Due' : 'Expires'}: {new Date(item.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="w-32 hidden md:block">
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all', item.status === 'compliant' ? 'bg-af-green' : item.status === 'pending' ? 'bg-af-orange' : 'bg-red-400')} style={{ width: `${pct}%` }} />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 text-right">{days > 0 ? `${days}d remaining` : 'Expired'}</p>
                            </div>
                            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border', config.bg, config.text, config.border)}>
                              {config.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
