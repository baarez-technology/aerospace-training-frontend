'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { TraineeAssignment, TrainingVideo } from '@/types';
import { getMyAssignedVideos } from '@/lib/instructorVideos';
import { getCurrentUser } from '@/lib/auth';
import { traineeAssignments as mockAssignments } from '@/data/mockData';
import {
  ClipboardList,
  Video,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  User,
  FileText,
  StickyNote,
  Save,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  X,
  Download,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { CountUp } from '@/components/ui/CountUp';

export default function TraineeAssignmentsPage() {
  const [assignments, setAssignments] = useState<TraineeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const videos = await getMyAssignedVideos();
        if (!videos || videos.length === 0) {
          setAssignments(mockAssignments);
          setExpandedAssignment('asgn1');
          return;
        }

        const user = getCurrentUser();
        const mappedVideos: TrainingVideo[] = videos.map(v => ({
          id: v.id,
          title: v.title,
          description: v.description,
          url: v.videoUrl,
          thumbnail: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&auto=format&fit=crop&q=60',
          duration: v.duration || 'N/A',
          category: v.category || 'General',
          tags: v.tags || [],
          source: 'Instructor Assign',
          difficulty: 'intermediate'
        }));

        const unifiedAssignment: TraineeAssignment = {
          id: 'instructor_assigned_group',
          title: 'Instructor Assigned Content',
          description: 'Videos explicitly assigned to you by your instructors.',
          instructorId: 'multiple',
          instructorName: 'Assigned Instructors',
          assignedAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          topics: [],
          videos: mappedVideos,
          sourceDocument: 'N/A',
          trainees: user ? [user.id] : [],
          status: 'active',
          progress: 0,
          completedVideos: [],
          notes: ''
        };

        setAssignments([unifiedAssignment]);
        setExpandedAssignment('instructor_assigned_group');
      } catch (err) {
        console.error('Failed to group videos into assignments', err);
        setAssignments(mockAssignments);
        setExpandedAssignment('asgn1');
      } finally {
        // Smooth skeleton transition
        setTimeout(() => setLoading(false), 800);
      }
    }
    load();
  }, []);

  const toggleComplete = (videoId: string) => {
    setCompletedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const saveNotes = (assignmentId: string) => {
    setSavedNote(assignmentId);
    setTimeout(() => setSavedNote(null), 2000);
  };

  const getProgress = (assignment: TraineeAssignment) => {
    const total = assignment.videos.length;
    if (total === 0) return 0;
    const completed = assignment.videos.filter((v) => completedVideos.has(v.id)).length;
    return Math.round((completed / total) * 100);
  };

  const getDueStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: 'Overdue', color: 'text-iaf-alert', bg: 'bg-iaf-alert/10 border-iaf-alert/30' };
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: 'text-iaf-warning', bg: 'bg-iaf-warning/10 border-iaf-warning/30' };
    return { label: `${daysLeft}d left`, color: 'text-iaf-success', bg: 'bg-iaf-success/10 border-iaf-success/30' };
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="My Assignments"
          subtitle="View assigned training materials, watch videos, and track your progress"
          icon={ClipboardList}
        />

        {/* ── Video Player Modal ────────────────────────────────────── */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-af-navy">{activeVideo.title}</h3>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-1 bg-slate-50">
                <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden">
                  <iframe
                    src={activeVideo.url}
                    title={activeVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                <p className="text-sm text-slate-500 max-w-2xl">{activeVideo.description}</p>
                <Button
                  onClick={() => {
                    toggleComplete(activeVideo.id);
                    setActiveVideo(null);
                  }}
                  className={cn(
                    'gap-2 shrink-0 self-end font-medium',
                    completedVideos.has(activeVideo.id)
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-af-green hover:bg-af-green/90 text-white'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedVideos.has(activeVideo.id) ? 'Mark Incomplete' : 'Mark as Completed'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats Bar ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-af-orange/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-af-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900"><CountUp value={assignments.length} /></p>
                <p className="text-xs text-slate-500 font-medium">Active Assignments</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-af-blue/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-af-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  <CountUp value={assignments.reduce((sum, a) => sum + a.videos.length, 0)} />
                </p>
                <p className="text-xs text-slate-500 font-medium">Total Videos</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-af-green/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-af-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900"><CountUp value={completedVideos.size} /></p>
                <p className="text-xs text-slate-500 font-medium">Videos Completed</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-af-yellow/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-af-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  <CountUp value={assignments.length > 0 ? getProgress(assignments[0]) : 0} />%
                </p>
                <p className="text-xs text-slate-500 font-medium">Overall Progress</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Assignment Cards ──────────────────────────────────────── */}
        {assignments.length === 0 ? (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="py-16 text-center">
              <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No Assignments Yet</h3>
              <p className="text-sm text-slate-500 mt-2">
                Your instructor will assign training materials here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const isExpanded = expandedAssignment === assignment.id;
              const progress = getProgress(assignment);
              const dueStatus = getDueStatus(assignment.dueDate);

              return (
                <Card
                  key={assignment.id}
                  className="bg-white border-slate-200 shadow-sm overflow-hidden group"
                >
                  {/* Assignment Header */}
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-af-orange/10 flex items-center justify-center shrink-0 border border-af-orange/20">
                      <BookOpen className="w-6 h-6 text-af-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-af-navy group-hover:text-af-blue transition-colors truncate">
                          {assignment.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] uppercase font-bold tracking-wider shrink-0 border', dueStatus.bg, dueStatus.color)}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {dueStatus.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5" />
                          {assignment.instructorName}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Video className="w-3.5 h-3.5" />
                          {assignment.videos.length} Videos
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={progress} size="sm" showLabel />
                      </div>
                    </div>
                    <div className="shrink-0 p-2 rounded-full hover:bg-slate-100 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        {/* Video List */}
                        <div className="lg:col-span-2 p-5 border-r border-slate-100 bg-white">
                          <h4 className="text-sm font-bold text-af-navy mb-4 flex items-center gap-2">
                            <Video className="w-4 h-4 text-af-blue" />
                            Assigned Videos
                          </h4>
                          <div className="space-y-4">
                            {assignment.videos.map((video, idx) => {
                              const isCompleted = completedVideos.has(video.id);
                              return (
                                <div
                                  key={video.id}
                                  className={cn(
                                    'flex items-center gap-4 p-4 rounded-xl transition-all border',
                                    isCompleted
                                      ? 'bg-af-green/5 border-af-green/20'
                                      : 'bg-slate-50 border-slate-100 hover:border-af-blue/30 hover:bg-af-blue/5'
                                  )}
                                >
                                  {/* Completion Toggle */}
                                  <button
                                    onClick={() => toggleComplete(video.id)}
                                    className="shrink-0 group/check"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-6 h-6 text-af-green" />
                                    ) : (
                                      <Circle className="w-6 h-6 text-slate-300 group-hover/check:text-af-blue transition-colors" />
                                    )}
                                  </button>

                                  {/* Video Thumbnail */}
                                  <div className="relative shrink-0 cursor-pointer shadow-sm" onClick={() => setActiveVideo(video)}>
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-32 h-20 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 scale-95 hover:scale-100 backdrop-blur-[1px]">
                                      <Play className="w-8 h-8 text-white fill-white" />
                                    </div>
                                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/70 rounded-md text-[10px] font-bold text-white backdrop-blur-md">
                                      {video.duration}
                                    </div>
                                  </div>

                                  {/* Video Info */}
                                  <div className="flex-1 min-w-0">
                                    <h5
                                      className={cn(
                                        'text-sm font-bold leading-tight',
                                        isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                                      )}
                                    >
                                      {idx + 1}. {video.title}
                                    </h5>
                                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 italic">
                                      {video.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-[10px] font-bold tracking-tight px-1.5',
                                          video.difficulty === 'advanced'
                                            ? 'border-red-200 bg-red-50 text-red-600'
                                            : video.difficulty === 'intermediate'
                                              ? 'border-af-orange/20 bg-af-orange/5 text-af-orange'
                                              : 'border-af-green/20 bg-af-green/5 text-af-green'
                                        )}
                                      >
                                        {video.difficulty}
                                      </Badge>
                                      <span className="text-[10px] text-slate-400 font-medium">{video.source}</span>
                                    </div>
                                  </div>

                                  {/* Watch Button */}
                                  <Button
                                    size="sm"
                                    onClick={() => setActiveVideo(video)}
                                    className={cn(
                                      'gap-1.5 shrink-0 font-bold text-xs px-4',
                                      isCompleted
                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        : 'bg-af-blue hover:bg-af-navy text-white shadow-sm'
                                    )}
                                  >
                                    {isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    {isCompleted ? 'Rewatch' : 'Watch'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="p-5 space-y-6 bg-slate-50/50">
                          {/* Topics */}
                          <div>
                            <h4 className="text-sm font-bold text-af-navy mb-3 flex items-center gap-2">
                              <Brain className="w-4 h-4 text-af-orange" />
                              Topics Covered
                            </h4>
                            <div className="space-y-2">
                              {assignment.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
                                >
                                  <p className="text-xs font-bold text-af-navy">{topic.name}</p>
                                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                    {topic.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Source Document */}
                          <div>
                            <h4 className="text-sm font-bold text-af-navy mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-af-blue" />
                              Source Document
                            </h4>
                            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm group/doc cursor-pointer hover:border-af-blue/30 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-xs text-slate-600 font-medium truncate">
                                  {assignment.sourceDocument}
                                </span>
                              </div>
                              <Download className="w-3.5 h-3.5 text-af-blue shrink-0 group-hover/doc:translate-y-0.5 transition-transform" />
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h4 className="text-sm font-bold text-af-navy mb-3 flex items-center gap-2">
                              <StickyNote className="w-4 h-4 text-af-yellow" />
                              My Study Notes
                            </h4>
                            <Textarea
                              value={notes[assignment.id] || ''}
                              onChange={(e) =>
                                setNotes((prev) => ({ ...prev, [assignment.id]: e.target.value }))
                              }
                              placeholder="Add your study notes here..."
                              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm min-h-[120px] rounded-xl focus:ring-af-orange/20 focus:border-af-orange"
                            />
                            <Button
                              size="sm"
                              onClick={() => saveNotes(assignment.id)}
                              className="mt-3 w-full bg-slate-900 hover:bg-af-navy text-white font-bold gap-2 shadow-md shadow-slate-200"
                            >
                              {savedNote === assignment.id ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-af-green" />
                                  Notes Saved!
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  Save Activity Notes
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

// Re-export Brain icon used in the component
function Brain(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}
