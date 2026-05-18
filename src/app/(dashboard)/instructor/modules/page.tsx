'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listModules, uploadModuleVideo, generateModuleVideo } from '@/lib/modules';
import { getCourses } from '@/lib/courses';
import { modules as mockModules, courses as mockCourses } from '@/data/mockData';
import type { Module, Course } from '@/types';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { Upload, Sparkles, Video, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

function VideoStatusBadge({ status }: { status?: string }) {
  if (status === 'ready')
    return <Badge className="bg-af-green/10 text-af-green border-af-green/20 gap-1 font-bold uppercase tracking-widest text-[9px]"><CheckCircle2 className="w-3 h-3" />Ready</Badge>;
  if (status === 'processing')
    return <Badge className="bg-af-blue/10 text-af-blue border-af-blue/20 gap-1 font-bold uppercase tracking-widest text-[9px]"><Loader2 className="w-3 h-3 animate-spin" />Generating</Badge>;
  if (status === 'error')
    return <Badge className="bg-red-50 text-red-600 border-red-100 gap-1 font-bold uppercase tracking-widest text-[9px]"><AlertTriangle className="w-3 h-3" />Error</Badge>;
  return <Badge className="bg-slate-100 text-slate-400 border-slate-200 font-bold uppercase tracking-widest text-[9px]">No Video</Badge>;
}

export default function InstructorModuleVideosPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const refreshModules = useCallback(() => {
    return listModules().then(mods => {
      setModules(mods);
      return mods;
    });
  }, []);

  useEffect(() => {
    Promise.all([listModules(), getCourses()])
      .then(([mods, crses]) => {
        setModules((mods as Module[])?.length ? mods as Module[] : mockModules);
        setCourses((crses as Course[])?.length ? crses as Course[] : mockCourses);
      })
      .catch(() => { setModules(mockModules); setCourses(mockCourses); })
      .finally(() => {
        setTimeout(() => setLoading(false), 800);
      });
  }, []);

  // Poll every 5s while any module is processing
  useEffect(() => {
    const hasProcessing = modules.some(m => m.videoStatus === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      refreshModules().then(mods => {
        // Clear generatingIds for any module that has left processing
        setGeneratingIds(prev => {
          if (prev.size === 0) return prev;
          const next = new Set(prev);
          mods.forEach(m => {
            if (m.videoStatus !== 'processing') next.delete(m.id);
          });
          return next.size === prev.size ? prev : next;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [modules, refreshModules]);

  const courseTitle = (courseId: string) =>
    courses.find(c => c.id === courseId)?.title ?? courseId;

  const handleFileSelect = async (mod: Module, file: File) => {
    setUploadStates(p => ({ ...p, [mod.id]: 'uploading' }));
    try {
      const result = await uploadModuleVideo(mod.id, file);
      setModules(prev => prev.map(m => (m.id === mod.id ? result.module : m)));
      setUploadStates(p => ({ ...p, [mod.id]: 'done' }));
    } catch {
      setUploadStates(p => ({ ...p, [mod.id]: 'error' }));
    }
  };

  const handleGenerate = async (mod: Module) => {
    setGeneratingIds(prev => new Set(prev).add(mod.id));
    try {
      await generateModuleVideo(mod.id);
      setModules(prev => prev.map(m => (m.id === mod.id ? { ...m, videoStatus: 'processing' as const } : m)));
      // generatingIds cleared by polling once status leaves 'processing'
    } catch {
      setGeneratingIds(prev => { const s = new Set(prev); s.delete(mod.id); return s; });
      setModules(prev => prev.map(m => (m.id === mod.id ? { ...m, videoStatus: 'error' as const } : m)));
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Module Video Hub"
          subtitle="Upload or AI-generate technical training videos for every module in the curriculum"
          icon={Video}
        />

        <div className="space-y-4">
          {modules.length === 0 && (
            <Card className="bg-white border-slate-200 border-dashed">
              <CardContent className="py-20 flex flex-col items-center gap-3 text-center">
                <Video className="w-12 h-12 text-slate-100" />
                <div>
                  <p className="text-slate-900 font-black uppercase tracking-tight">No active modules</p>
                  <p className="text-sm text-slate-400 font-medium">Create modules in the Course Manager to see them here.</p>
                </div>
              </CardContent>
            </Card>
          )}
          {modules.map(mod => (
            <Card key={mod.id} className="bg-white border-slate-200 shadow-sm group hover:border-af-blue/30 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-slate-300 group-hover:text-af-blue transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-af-blue font-black uppercase tracking-[0.2em] mb-0.5">{courseTitle(mod.courseId)}</p>
                        <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-af-blue transition-colors">{mod.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed font-medium pl-[52px]">{mod.description}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-auto pl-[52px] md:pl-0">
                    <VideoStatusBadge status={mod.videoStatus} />

                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      ref={el => { fileInputRefs.current[mod.id] = el; }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(mod, file);
                        e.target.value = '';
                      }}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadStates[mod.id] === 'uploading'}
                        onClick={() => fileInputRefs.current[mod.id]?.click()}
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold uppercase tracking-widest text-[9px] h-9"
                      >
                        {uploadStates[mod.id] === 'uploading' ? (
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-1.5" />
                        )}
                        {uploadStates[mod.id] === 'uploading' ? 'Uploading…' : 'Upload Video'}
                      </Button>

                      <Button
                        size="sm"
                        disabled={mod.videoStatus === 'processing' || generatingIds.has(mod.id)}
                        onClick={() => handleGenerate(mod)}
                        className="bg-af-blue hover:bg-af-navy text-white shadow-lg shadow-af-blue/20 font-bold uppercase tracking-widest text-[9px] h-9"
                      >
                        {mod.videoStatus === 'processing' || generatingIds.has(mod.id) ? (
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-1.5" />
                        )}
                        {mod.videoStatus === 'processing' || generatingIds.has(mod.id) ? 'Generating…' : 'AI Generate'}
                      </Button>
                    </div>
                  </div>
                </div>

                {mod.videoStatus === 'ready' && mod.videoUrl && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-af-green" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video Asset Locked & Ready</span>
                    </div>
                    <a
                      href={mod.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-af-blue hover:text-af-navy font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      Stream Asset <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
