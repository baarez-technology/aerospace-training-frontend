'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { PageTransition } from '@/components/ui/PageTransition';
import { getProgress } from '@/lib/progress';
import { getCourses } from '@/lib/courses';
import { getSimulations } from '@/lib/simulations';
import { getAlerts } from '@/lib/alerts';
import { formatRelativeTime } from '@/lib/utils';
import { getMyAssignedVideos } from '@/lib/instructorVideos';
import {
  courses as mockCourses,
  simulations as mockSimulations,
  alerts as mockAlerts,
  traineeProgress as mockProgress,
} from '@/data/mockData';
import type { Course, Simulation, Alert, TraineeProgress, InstructorVideo } from '@/types';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  Play,
  ChevronRight,
  Plane,
  Cpu,
  Bot,
  ClipboardList,
  Video,
} from 'lucide-react';

export default function TraineeDashboardPage() {
  const router = useRouter();
  const user = requireAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [progress, setProgress] = useState<TraineeProgress | null>(null);
  const [assignedVideos, setAssignedVideos] = useState<InstructorVideo[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [coursesData, simulationsData, alertsData, progressData, assignedData] = await Promise.all([
          getCourses(),
          getSimulations(),
          getAlerts({ unread: true }),
          getProgress(),
          getMyAssignedVideos(),
        ]);

        // Fall back to rich mock data when backend has no seeded content yet —
        // keeps every demo account visually populated out of the box.
        setCourses(coursesData?.length ? coursesData : mockCourses);
        setSimulations(simulationsData?.length ? simulationsData : mockSimulations);
        setAlerts(alertsData?.length ? alertsData : mockAlerts);
        setAssignedVideos(assignedData ?? []);
        setProgress((progressData as TraineeProgress) ?? mockProgress);
      } catch (error) {
        console.error('Failed to fetch dashboard data, using demo data:', error);
        setCourses(mockCourses);
        setSimulations(mockSimulations);
        setAlerts(mockAlerts);
        setProgress(mockProgress);
      } finally {
        // Add a small artificial delay for smoother skeleton transition
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    fetchData();
  }, [user?.id]);

  if (!user) return null;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const inProgressCourses = (courses || []).filter(c => c.status === 'in-progress').slice(0, 3);
  const availableSimulations = (simulations || []).filter(s => s.status === 'available').slice(0, 3);
  const unreadAlerts = (alerts || []).filter(a => !a.isRead);

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Mission Dashboard"
          subtitle={`Welcome back, ${user.rank} ${user.name.split(' ').pop()}`}
          icon={LayoutDashboard}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Overall Progress"
            value={`${progress?.overallProgress ?? 0}%`}
            subtitle={`${progress?.completedModules ?? 0} of ${progress?.totalModules ?? 0} modules`}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Readiness Score"
            value={progress?.readinessScore ?? 0}
            subtitle="Based on assessments & simulations"
            icon={Target}
            variant="glow"
          />
          <DashboardCard
            title="Simulation Hours"
            value={progress?.simulationHours ?? 0}
            subtitle="Total training time"
            icon={Clock}
          />
          <DashboardCard
            title="Courses Completed"
            value={`${progress?.completedCourses ?? 0}/${progress?.totalCourses ?? 0}`}
            subtitle="Active learning path"
            icon={BookOpen}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            {/* In Progress Courses */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-af-orange" />
                  Continue Learning
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/trainee/catalog')}
                  className="text-af-orange hover:text-af-orange/80 hover:bg-af-orange/10"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {inProgressCourses.length > 0 ? (
                  inProgressCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/trainee/module/${course.id}`)}
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-20 h-14 object-cover rounded-md shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 truncate">{course.title}</h4>
                        <p className="text-xs text-slate-500">{course.category}</p>
                        <div className="mt-2">
                          <ProgressBar value={course.progress} size="sm" showLabel={false} />
                        </div>
                      </div>
                      <Button size="sm" className="bg-af-orange hover:bg-af-orange/80 text-white">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No courses currently in progress.</p>
                )}
              </CardContent>
            </Card>

            {/* Assigned Videos */}
            {assignedVideos.length > 0 && (
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-af-orange" />
                    Assigned Training Videos
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/trainee/assignments')}
                    className="text-af-orange hover:text-af-orange/80 hover:bg-af-orange/10"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignedVideos.slice(0, 3).map((video) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                      onClick={() => router.push('/trainee/assignments')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-af-orange/10 flex items-center justify-center">
                            <Video className="w-5 h-5 text-af-orange" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-af-orange transition-colors">{video.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {video.category} &bull; {video.duration}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status="active" size="sm" showDot={false} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{video.description}</p>
                      <div className="flex gap-2">
                        {video.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Available Simulations */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-af-blue" />
                  Mission Simulations
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/trainee/simulation')}
                  className="text-af-blue hover:text-af-blue/80 hover:bg-af-blue/10"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableSimulations.length > 0 ? (
                  availableSimulations.map((sim) => (
                    <div
                      key={sim.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                      onClick={() => router.push('/trainee/simulation')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-af-blue/10 flex items-center justify-center group-hover:bg-af-blue/20 transition-colors">
                          <Plane className="w-5 h-5 text-af-blue" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{sim.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge status={sim.difficulty} size="sm" showDot={false} />
                            <span className="text-xs text-slate-500">{sim.duration}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-af-blue/50 text-af-blue hover:bg-af-blue/10"
                      >
                        Launch
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No simulations currently available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900">Quick Launch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-orange/10 hover:border-af-orange/50 hover:text-af-orange transition-all duration-200 group"
                  onClick={() => router.push('/trainee/digital-twin')}
                >
                  <Cpu className="w-4 h-4 text-af-orange group-hover:text-af-orange" />
                  Digital Twin Explorer
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-blue/10 hover:border-af-blue/50 hover:text-af-blue transition-all duration-200 group"
                  onClick={() => router.push('/trainee/ai-assistant')}
                >
                  <Bot className="w-4 h-4 text-af-blue group-hover:text-af-blue" />
                  AI Training Assistant
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-green/10 hover:border-af-green/50 hover:text-af-green transition-all duration-200 group"
                  onClick={() => router.push('/trainee/catalog')}
                >
                  <BookOpen className="w-4 h-4 text-af-green group-hover:text-af-green" />
                  Browse Course Catalog
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-af-orange/10 hover:border-af-orange/50 hover:text-af-orange transition-all duration-200 group"
                  onClick={() => router.push('/trainee/assignments')}
                >
                  <ClipboardList className="w-4 h-4 text-af-orange group-hover:text-af-orange" />
                  My Assignments
                </Button>
              </CardContent>
            </Card>

            {/* Skills Overview */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900">Skill Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progress?.skills.slice(0, 4).map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">{skill.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{skill.level}/{skill.maxLevel}</span>
                    </div>
                    <ProgressBar
                      value={skill.level}
                      max={skill.maxLevel}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-af-orange" />
                  Alerts
                </CardTitle>
                {unreadAlerts.length > 0 && (
                  <span className="px-2 py-0.5 bg-af-orange/10 text-af-orange text-xs rounded-full animate-pulse">
                    {unreadAlerts.length}
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-slate-50 border-l-2 border-af-orange hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <StatusBadge status={alert.type} size="sm" showDot={false} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatRelativeTime(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No active alerts.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progress?.recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 group">
                    <div className="w-2 h-2 rounded-full bg-af-orange mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate group-hover:text-af-orange transition-colors">{activity.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {!progress?.recentActivity.length && (
                  <p className="text-xs text-slate-400 text-center py-2">No recent activity.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
