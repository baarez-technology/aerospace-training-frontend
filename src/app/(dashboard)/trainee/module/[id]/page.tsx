'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { getCourseById } from '@/lib/courses';
import { listModules, getModuleById } from '@/lib/modules';
import type { Course, Module } from '@/types';
import { cn } from '@/lib/utils';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  ListOrdered,
  Image as ImageIcon,
  AlertTriangle,
  BookOpen,
  Clock,
  Loader2,
} from 'lucide-react';

export default function ModuleViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('video');
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCourseById(id), listModules({ courseId: id })])
      .then(([fetchedCourse, fetchedModules]) => {
        setCourse(fetchedCourse);
        setCourseModules(fetchedModules);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const currentModule = courseModules[currentModuleIndex] ?? null;

  useEffect(() => {
    if (!currentModule || currentModule.videoStatus !== 'processing') return;
    const interval = setInterval(async () => {
      try {
        const updated = await getModuleById(currentModule.id);
        if (updated.videoStatus !== 'processing') {
          setCourseModules(prev => prev.map(m => (m.id === updated.id ? updated : m)));
          clearInterval(interval);
        }
      } catch { /* silent */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentModule?.id, currentModule?.videoStatus]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <span className="text-slate-500">Loading...</span>
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <span className="text-slate-500">Course not found.</span>
      </div>
    );
  }

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(s => s !== stepId)
        : [...prev, stepId]
    );
  };

  const goToNextModule = () => {
    if (currentModuleIndex < courseModules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const goToPrevModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={course.title}
        subtitle={`Module ${currentModuleIndex + 1} of ${courseModules.length}: ${currentModule.title}`}
        icon={BookOpen}
        showBackButton
      />

      {/* Progress Bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">Course Progress</span>
          <span className="text-sm font-bold text-slate-900">{course.progress}%</span>
        </div>
        <ProgressBar value={course.progress} showLabel={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <TabsTrigger
                value="video"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold text-slate-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger
                value="documentation"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold text-slate-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </TabsTrigger>
              <TabsTrigger
                value="procedures"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold text-slate-600"
              >
                <ListOrdered className="w-4 h-4 mr-2" />
                Procedures
              </TabsTrigger>
              <TabsTrigger
                value="diagrams"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-af-blue font-semibold text-slate-600"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Diagrams
              </TabsTrigger>
            </TabsList>

            {/* Video Tab */}
            <TabsContent value="video" className="mt-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-slate-950 rounded-t-lg overflow-hidden">
                    {currentModule.videoStatus === 'ready' && currentModule.videoUrl ? (
                      <video
                        key={currentModule.videoUrl}
                        ref={videoRef}
                        src={currentModule.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        preload="auto"
                      />
                    ) : currentModule.videoStatus === 'processing' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900">
                        <Loader2 className="w-10 h-10 text-af-blue animate-spin" />
                        <p className="text-sm text-white/70">AI is generating your training video…</p>
                      </div>
                    ) : currentModule.videoStatus === 'error' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                        <p className="text-sm text-white/70">Video generation failed. Contact your instructor.</p>
                      </div>
                    ) : (
                      <>
                        <img
                          src={course.thumbnail}
                          alt={currentModule.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <p className="text-white/60 text-sm font-medium">No video available for this module.</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{currentModule.title}</h3>
                    <p className="text-sm text-slate-500">{currentModule.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="documentation" className="mt-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-af-blue" />
                    Module Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {currentModule.documentation}
                    </p>
                    <div className="mt-6 p-4 bg-af-blue/5 border border-af-blue/20 rounded-lg">
                      <h4 className="text-sm font-bold text-af-navy mb-2">Key Points</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>Always follow the checklist in sequence</li>
                        <li>Monitor EGT closely during startup</li>
                        <li>Abort start if EGT exceeds limits</li>
                        <li>Verify all parameters before flight</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Procedures Tab */}
            <TabsContent value="procedures" className="mt-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-af-orange" />
                    Step-by-Step Procedures
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(currentModule.procedures ?? []).map((procedure) => (
                    <div
                      key={procedure.id}
                      className={cn(
                        'p-4 rounded-lg border transition-all cursor-pointer',
                        completedSteps.includes(procedure.id)
                          ? 'bg-af-green/5 border-af-green/20'
                          : 'bg-slate-50 border-slate-200 hover:border-af-blue/30 hover:bg-slate-100'
                      )}
                      onClick={() => toggleStepComplete(procedure.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          completedSteps.includes(procedure.id)
                            ? 'bg-af-green text-white shadow-sm'
                            : 'bg-white text-slate-500 border border-slate-200 shadow-sm'
                        )}>
                          {completedSteps.includes(procedure.id) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-bold">{procedure.step}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900">{procedure.title}</h4>
                          <p className="text-sm text-slate-500 mt-1">{procedure.description}</p>
                          {procedure.caution && (
                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-yellow-800 font-medium">{procedure.caution}</span>
                            </div>
                          )}
                          {procedure.warning && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-red-800 font-medium">{procedure.warning}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Diagrams Tab */}
            <TabsContent value="diagrams" className="mt-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-af-blue" />
                    Technical Diagrams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(currentModule.diagrams ?? []).map((diagram) => (
                    <div key={diagram.id} className="space-y-3">
                      <img
                        src={diagram.imageUrl}
                        alt={diagram.title}
                        className="w-full rounded-lg border border-slate-200 shadow-sm"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{diagram.title}</h4>
                          <p className="text-xs text-slate-500">{diagram.description}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={goToPrevModule}
              disabled={currentModuleIndex === 0}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 font-bold"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Module
            </Button>
            <Button
              onClick={goToNextModule}
              disabled={currentModuleIndex === courseModules.length - 1}
              className="bg-af-blue hover:bg-af-navy text-white disabled:opacity-50 font-bold shadow-sm"
            >
              Next Module
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Sidebar - Module List */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50 pb-4 mb-4">
              <CardTitle className="text-lg text-slate-900 font-bold">Module List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {courseModules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => setCurrentModuleIndex(index)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 border group',
                    currentModuleIndex === index
                      ? 'bg-af-blue/5 border-af-blue/30 ring-1 ring-af-blue/20'
                      : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm hover:border-slate-300'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                    module.isCompleted
                      ? 'bg-af-green text-white shadow-sm'
                      : currentModuleIndex === index
                      ? 'bg-af-blue text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200'
                  )}>
                    {module.isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-bold truncate transition-colors',
                      currentModuleIndex === index ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                    )}>
                      {module.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">{module.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50 pb-4 mb-4">
              <CardTitle className="text-lg text-slate-900 font-bold">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Category</span>
                <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 font-bold">
                  {course.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Difficulty</span>
                <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 font-bold capitalize">
                  {course.difficulty}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Duration</span>
                <span className="text-sm font-bold text-slate-900">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Modules</span>
                <span className="text-sm font-bold text-slate-900">{course.moduleCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
