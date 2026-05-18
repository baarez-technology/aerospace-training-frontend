'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { trainingSessions, traineeOverviews } from '@/data/mockData';
import type { TrainingSession } from '@/types';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  X,
  Monitor,
  Wrench,
  BookOpen,
  CheckCircle,
  CalendarClock,
  Play,
  Pause,
  RotateCcw,
  Square,
  RefreshCw,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { CountUp } from '@/components/ui/CountUp';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const sessionTypeIcons: Record<string, React.ReactNode> = {
  classroom: <BookOpen className="w-4 h-4" />,
  simulation: <Monitor className="w-4 h-4" />,
  practical: <Wrench className="w-4 h-4" />,
};

const sessionTypeColors: Record<string, string> = {
  classroom: 'bg-af-blue/10 text-af-blue border-af-blue/20',
  simulation: 'bg-af-orange/10 text-af-orange border-af-orange/20',
  practical: 'bg-af-green/10 text-af-green border-af-green/20',
};

interface SessionFormData {
  title: string;
  type: 'classroom' | 'simulation' | 'practical';
  date: string;
  duration: string;
  instructor: string;
}

const emptyForm: SessionFormData = {
  title: '',
  type: 'classroom',
  date: '',
  duration: '1h 30m',
  instructor: 'Cmdr. James Wilson',
};

export default function InstructorSessionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<TrainingSession[]>(trainingSessions);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SessionFormData>(emptyForm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleCreate = () => {
    if (!form.title || !form.date) return;
    const newSession: TrainingSession = {
      id: `ts-${Date.now()}`,
      instructorId: 'instructor-1',
      title: form.title,
      type: form.type,
      date: form.date,
      duration: form.duration,
      participants: [],
      status: 'scheduled',
    };
    setSessions([newSession, ...sessions]);
    setShowModal(false);
    setForm(emptyForm);
  };

  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;
  const inProgressCount = sessions.filter(s => s.status === 'in-progress').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
      <PageHeader
        title="Training Sessions"
        subtitle="Schedule and manage upcoming training classes and simulations"
        icon={Calendar}
        actions={
          <Button
            className="bg-af-orange text-white hover:bg-af-orange/90 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Session
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-af-blue/10 group-hover:bg-af-blue/20 transition-colors text-af-blue">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Scheduled</p>
                <p className="text-2xl font-bold text-slate-900">
                  <CountUp value={scheduledCount} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-af-orange/10 group-hover:bg-af-orange/20 transition-colors text-af-orange">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  <CountUp value={inProgressCount} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-af-green/10 group-hover:bg-af-green/20 transition-colors text-af-green">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  <CountUp value={completedCount} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session List */}
      <div className="flex gap-2">
        {(['all', 'scheduled', 'in-progress', 'completed'] as const).map((s) => (
          <button
            key={s}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-medium border transition-colors capitalize',
              s === 'all'
                ? 'bg-af-orange/10 border-af-orange/50 text-af-orange'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="bg-white border-slate-200 shadow-sm hover:border-af-orange/40 transition-colors"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'p-2 rounded-lg flex-shrink-0 border',
                    sessionTypeColors[session.type]
                  )}
                >
                  {sessionTypeIcons[session.type]}
                </div>
                <StatusBadge status={session.status} size="sm" showDot={false} />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 mt-3">
                {session.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(session.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {session.duration}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  {session.participants.length} Trainees
                </div>
              </div>

              {/* Trainee Avatars */}
              <div className="flex -space-x-2">
                {traineeOverviews.slice(0, 4).map((t, i) => (
                  <img
                    key={i}
                    src={t.avatar}
                    alt={t.name}
                    className="w-7 h-7 rounded-full border-2 border-white bg-slate-100"
                    title={t.name}
                  />
                ))}
                {session.participants.length > 4 && (
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{session.participants.length - 4}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-slate-200 h-8"
                >
                  Edit
                </Button>
                {session.status === 'scheduled' ? (
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-af-blue text-white hover:bg-af-blue/90 h-8"
                  >
                    Start Session
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-slate-900 text-white hover:bg-slate-800 h-8"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <Card className="relative z-10 w-full max-w-md bg-white border-slate-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-slate-900">Schedule Session</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Engine Systems Practical"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-af-orange/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-af-orange/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-af-orange/30"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="simulation">Simulation</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-200"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-af-orange text-white hover:bg-af-orange/90"
                  onClick={handleCreate}
                  disabled={!form.title || !form.date}
                >
                  Create Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </PageTransition>
  );
}
