'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trainingVideos, traineeOverviews } from '@/data/mockData';
import { listModules, generateModuleVideo, getModuleById, createModule } from '@/lib/modules';
import { getCourses } from '@/lib/courses';
import { cn } from '@/lib/utils';
import type { ExtractedTopic, TrainingVideo, Module, Course, Procedure, Diagram } from '@/types';
import {
  Upload,
  FileText,
  Sparkles,
  Video,
  Database,
  BookOpen,
  ListOrdered,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  Send,
  Loader2,
  X,
  Brain,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Search,
  Clapperboard,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';

// Groq config (reuse from AI assistant)
// ─── AI API Config ──────────────────────────────────────────────────────────
const AI_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const IS_OPENROUTER = AI_API_KEY?.startsWith('sk-or-');

const AI_API_URL = IS_OPENROUTER
  ? 'https://openrouter.ai/api/v1/chat/completions'
  : 'https://api.groq.com/openai/v1/chat/completions';

const AI_MODEL = IS_OPENROUTER
  ? 'meta-llama/llama-3.1-8b-instruct'
  : 'llama-3.1-8b-instant';

type Step = 'upload' | 'extracting' | 'topics' | 'generate' | 'videos' | 'assign' | 'done';

const STEPS: { key: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'upload', label: 'Upload Document', icon: Upload },
  { key: 'topics', label: 'AI Topic Extraction', icon: Brain },
  { key: 'generate', label: 'Generate Videos', icon: Clapperboard },
  { key: 'videos', label: 'Select Videos', icon: Video },
  { key: 'assign', label: 'Assign Trainees', icon: Users },
  { key: 'done', label: 'Complete', icon: CheckCircle2 },
];

function getStepIndex(step: Step): number {
  if (step === 'extracting') return 1;
  return STEPS.findIndex((s) => s.key === step);
}

function topicMatchesModule(topic: ExtractedTopic, mod: Module): boolean {
  const keywords = topic.keywords.map(k => k.toLowerCase());
  const haystack = `${mod.title} ${mod.description}`.toLowerCase();
  return keywords.some(kw => haystack.includes(kw));
}

export default function ContentUploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
  const [suggestedVideos, setSuggestedVideos] = useState<TrainingVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [selectedTrainees, setSelectedTrainees] = useState<Set<string>>(new Set());
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [matchedModules, setMatchedModules] = useState<Module[]>([]);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  // Generate + Store Module
  const [courses, setCourses] = useState<Course[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState('');
  const [generatedProcedures, setGeneratedProcedures] = useState<Procedure[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [savedModuleId, setSavedModuleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ModuleContent = { documentation: string; procedures: Procedure[]; diagrams: Omit<Diagram, 'imageUrl'>[] };
  const [moduleContents, setModuleContents] = useState<Record<string, ModuleContent>>({});
  const [generatingContentIds, setGeneratingContentIds] = useState<Set<string>>(new Set());
  const [activeModuleTabs, setActiveModuleTabs] = useState<Record<string, string>>({});

  // Poll processing modules every 5s while on the generate step
  useEffect(() => {
    if (currentStep !== 'generate') return;
    const processing = matchedModules.filter(m => m.videoStatus === 'processing');
    if (processing.length === 0) return;
    const interval = setInterval(async () => {
      const updates = await Promise.all(processing.map(m => getModuleById(m.id).catch(() => m)));
      setMatchedModules(prev => prev.map(m => updates.find(u => u.id === m.id) ?? m));
      // Clear spinner flags for modules no longer in processing state
      const doneIds = updates.filter(u => u.videoStatus !== 'processing').map(u => u.id);
      if (doneIds.length > 0) {
        setGeneratingIds(prev => { const s = new Set(prev); doneIds.forEach(id => s.delete(id)); return s; });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentStep, matchedModules]);

  // ── File Upload Handler ──────────────────────────────────────────────
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !['pdf', 'docx', 'txt'].includes(ext || '')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setError(null);
    setFileName(file.name);

    // Read file as text (for txt/docx text extraction, PDF will use placeholder)
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // For real PDFs/DOCX, you'd use a proper parser. Here we use the raw text or a description.
      const content = text && text.length > 100
        ? text.substring(0, 3000)
        : `Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB). This is a training document about IAF aircraft systems and procedures.`;
      setFileContent(content);
    };

    if (file.type === 'text/plain' || ext === 'txt') {
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, we'll send the filename + metadata to AI for topic inference
      setFileContent(
        `Training document: "${file.name}" (${(file.size / 1024).toFixed(1)} KB, type: ${ext?.toUpperCase()}). ` +
        `This is an Indian Air Force training document. Analyze the filename and infer what technical topics it likely covers about military aircraft systems, procedures, and maintenance.`
      );
    }
  }, []);

  // ── AI Topic Extraction ──────────────────────────────────────────────
  const extractTopics = async () => {
    if (!fileContent) return;

    setCurrentStep('extracting');

    setError(null);

    try {
      console.log('Fetching AI extraction:', { url: AI_API_URL, model: AI_MODEL, isOpenRouter: IS_OPENROUTER });
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
          ...(IS_OPENROUTER && {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'IAF Training Platform',
          }),
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are an AI that extracts training topics from Indian Air Force (IAF) technical documents.
Given a document or document description, extract 3-6 specific training topics.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation.

JSON format:
[
  {
    "id": "t1",
    "name": "Topic Name",
    "description": "Brief description of the topic",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "confidence": 0.95
  }
]

Topics should relate to: engine systems, hydraulics, avionics, radar, flight controls, weapons, fuel systems, electrical systems, landing gear, emergency procedures, pre-flight checks, navigation, cockpit instruments, maintenance procedures, or safety protocols.
Keywords should be specific technical terms that can match training video tags.`,
            },
            {
              role: 'user',
              content: `Extract training topics from this document:\n\n${fileContent}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI extraction failed (${response.status})`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content ?? '';

      // Parse JSON from response (handle potential markdown wrapping)
      const jsonStr = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      let rawTopics = JSON.parse(jsonStr);

      // Safety: If AI returned an object with a key instead of an array
      const toTopicArray = (obj: Record<string, any>) =>
        Object.entries(obj).map(([key, value], idx) => {
          if (typeof value === 'object' && value !== null) {
            return { id: `t${idx}`, name: key.replace(/_/g, ' '), ...value };
          }
          return { id: `t${idx}`, name: key.replace(/_/g, ' '), description: String(value), keywords: [], confidence: 0.8 };
        });

      if (!Array.isArray(rawTopics)) {
        if (rawTopics.topics && Array.isArray(rawTopics.topics)) {
          rawTopics = rawTopics.topics;
        } else if (rawTopics.topics && typeof rawTopics.topics === 'object') {
          // AI returned { topics: { "Topic Name": {...}, ... } }
          rawTopics = toTopicArray(rawTopics.topics);
        } else {
          rawTopics = toTopicArray(rawTopics);
        }
      }

      // Final sanitization to ensure React doesn't crash on objects-as-children
      const topics: ExtractedTopic[] = rawTopics.map((t: any, idx: number) => ({
        id: t.id || `t${idx}`,
        name: typeof t.name === 'object' ? JSON.stringify(t.name) : String(t.name || 'Untitled Topic'),
        description: typeof t.description === 'object' ? JSON.stringify(t.description) : String(t.description || ''),
        keywords: Array.isArray(t.keywords) ? t.keywords.map((k: any) => String(k)) : [],
        confidence: typeof t.confidence === 'number' ? t.confidence : 0.8
      }));

      setExtractedTopics(topics);

      // Match videos based on extracted keywords
      const allKeywords = topics.flatMap((t) => t.keywords.map((k) => k.toLowerCase()));
      const scored = trainingVideos.map((video) => {
        const matchScore = video.tags.reduce((score, tag) => {
          const tagLower = tag.toLowerCase();
          const matches = allKeywords.filter(
            (kw) => tagLower.includes(kw) || kw.includes(tagLower)
          ).length;
          return score + matches;
        }, 0);
        // Also check title and category
        const titleMatches = allKeywords.filter(
          (kw) => video.title.toLowerCase().includes(kw) || video.category.toLowerCase().includes(kw)
        ).length;
        return { video, score: matchScore + titleMatches };
      });

      const matched = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((s) => s.video);

      setSuggestedVideos(matched.length > 0 ? matched : trainingVideos.slice(0, 5));
      // Auto-select top 3
      const autoSelect = new Set(matched.slice(0, 3).map((v) => v.id));
      setSelectedVideos(autoSelect);

      // Generate assignment title from filename
      const baseName = fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      setAssignmentTitle(`Training: ${baseName}`);

      // Load modules and courses
      const [mods, crses] = await Promise.all([listModules(), getCourses()]);
      setAllModules(mods);
      setCourses(crses);
      const defaultCourseId = crses[0]?.id ?? '';
      if (defaultCourseId) setSelectedCourseId(defaultCourseId);
      setModuleTitle(baseName);

      // Match existing modules to extracted topics
      const existingMatched = mods.filter(m => topics.some(t => topicMatchesModule(t, m)));

      // For topics without a matching module, create new persistent modules
      const unmatchedTopics = topics.filter(t => !mods.some(m => topicMatchesModule(t, m)));
      let newModules: Module[] = [];
      if (defaultCourseId && unmatchedTopics.length > 0) {
        newModules = await Promise.all(
          unmatchedTopics.map(t =>
            createModule({
              courseId: defaultCourseId,
              title: t.name,
              description: t.description,
              documentation: t.keywords.join(', '),
              procedures: [],
              diagrams: [],
              duration: '30 min',
            })
          )
        );
      }

      const allMatched = [...existingMatched, ...newModules];
      setMatchedModules(allMatched.length > 0 ? allMatched : mods.slice(0, 4));

      setCurrentStep('topics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract topics');
      setCurrentStep('upload');
    } finally {

    }
  };

  // ── Video Selection ──────────────────────────────────────────────────
  const toggleVideo = (videoId: string) => {
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  // ── Video Generation ─────────────────────────────────────────────────
  const handleGenerateVideo = async (mod: Module) => {
    setGeneratingIds(prev => new Set(prev).add(mod.id));
    generateModuleContent(mod);
    try {
      await generateModuleVideo(mod.id);
      setMatchedModules(prev => prev.map(m => m.id === mod.id ? { ...m, videoStatus: 'processing' as const } : m));
      setGeneratingIds(prev => { const s = new Set(prev); s.delete(mod.id); return s; });
    } catch {
      setGeneratingIds(prev => { const s = new Set(prev); s.delete(mod.id); return s; });
    }
  };

  const handleGenerateAll = () => {
    const pending = matchedModules.filter(
      m => !m.videoStatus || m.videoStatus === 'none' || m.videoStatus === 'error'
    );
    pending.forEach(mod => handleGenerateVideo(mod));
  };

  // ── Generate Documentation + Procedures + Diagrams per Module ────────
  const generateModuleContent = async (mod: Module) => {
    setGeneratingContentIds(prev => new Set(prev).add(mod.id));
    try {
      const relevantTopicNames = extractedTopics
        .filter(t => topicMatchesModule(t, mod))
        .map(t => t.name);
      const topicNames = relevantTopicNames.length > 0 ? relevantTopicNames.join(', ') : mod.title;

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
          ...(IS_OPENROUTER && { 'HTTP-Referer': window.location.origin, 'X-Title': 'IAF Training Platform' }),
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are an IAF technical training content author. Generate training module content.
IMPORTANT: Respond ONLY with valid JSON, no markdown.
Format:
{
  "documentation": "Detailed technical documentation (3-5 paragraphs)",
  "procedures": [
    { "id": "p1", "step": 1, "title": "Step title", "description": "Description", "caution": "Optional caution", "warning": "Optional warning" }
  ],
  "diagrams": [
    { "id": "d1", "title": "Diagram title", "description": "What this diagram illustrates" }
  ]
}
Generate 4-6 procedures and 2-3 diagrams. caution and warning are optional.`,
            },
            {
              role: 'user',
              content: `Module: ${mod.title}\nTopics: ${topicNames}\n\nDocument:\n${fileContent.slice(0, 1500)}`,
            },
          ],
          temperature: 0.4,
          max_tokens: 2000,
        }),
      });
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '{}';
      const json = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      setModuleContents(prev => ({
        ...prev,
        [mod.id]: {
          documentation: String(json.documentation ?? ''),
          procedures: Array.isArray(json.procedures) ? json.procedures : [],
          diagrams: Array.isArray(json.diagrams) ? json.diagrams : [],
        },
      }));
      setActiveModuleTabs(prev => ({ ...prev, [mod.id]: 'documentation' }));
    } catch {
      // Best-effort
    } finally {
      setGeneratingContentIds(prev => { const s = new Set(prev); s.delete(mod.id); return s; });
    }
  };

  // Auto-generate all when entering the generate step
  useEffect(() => {
    if (currentStep !== 'generate' || matchedModules.length === 0) return;
    const pending = matchedModules.filter(
      m => !m.videoStatus || m.videoStatus === 'none' || m.videoStatus === 'error'
    );
    if (pending.length > 0) {
      pending.forEach(mod => handleGenerateVideo(mod));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ── Generate Documentation + Procedures via AI ───────────────────────
  const handleGenerateContent = async () => {
    if (!fileContent || extractedTopics.length === 0) return;
    setIsGeneratingContent(true);
    try {
      const topicNames = extractedTopics.map(t => t.name).join(', ');
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
          ...(IS_OPENROUTER && { 'HTTP-Referer': window.location.origin, 'X-Title': 'IAF Training Platform' }),
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are an IAF technical training content author. Given topics and a document excerpt, generate a training module.
IMPORTANT: Respond ONLY with valid JSON, no markdown.
Format:
{
  "documentation": "Detailed technical documentation text (3-5 paragraphs)",
  "procedures": [
    { "id": "p1", "step": 1, "title": "Step title", "description": "What to do", "caution": "Optional caution", "warning": "Optional warning" }
  ]
}
Generate 4-6 procedures. caution and warning are optional — only include if genuinely applicable.`,
            },
            {
              role: 'user',
              content: `Topics: ${topicNames}\n\nDocument excerpt:\n${fileContent.slice(0, 1500)}`,
            },
          ],
          temperature: 0.4,
          max_tokens: 2000,
        }),
      });
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '{}';
      const json = JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      setGeneratedDocs(json.documentation ?? '');
      setGeneratedProcedures(json.procedures ?? []);
    } catch (e) {
      setError('Failed to generate module content');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // ── Store as Module ───────────────────────────────────────────────────
  const handleStoreModule = async () => {
    if (!selectedCourseId || !moduleTitle.trim()) return;
    setIsSavingModule(true);
    try {
      const mod = await createModule({
        courseId: selectedCourseId,
        title: moduleTitle,
        description: extractedTopics[0]?.description ?? '',
        documentation: generatedDocs,
        procedures: generatedProcedures,
        diagrams: [],
        duration: '30 min',
      });
      setSavedModuleId(mod.id);
      // Add to matched modules so it appears in the generate step
      setMatchedModules(prev => {
        if (prev.some(m => m.id === mod.id)) return prev;
        return [...prev, mod];
      });
      // Kick off video generation
      await generateModuleVideo(mod.id);
      setMatchedModules(prev => prev.map(m => m.id === mod.id ? { ...m, videoStatus: 'processing' as const } : m));
    } catch (e) {
      setError('Failed to store module');
    } finally {
      setIsSavingModule(false);
    }
  };

  // ── Trainee Selection ────────────────────────────────────────────────
  const toggleTrainee = (traineeId: string) => {
    setSelectedTrainees((prev) => {
      const next = new Set(prev);
      if (next.has(traineeId)) next.delete(traineeId);
      else next.add(traineeId);
      return next;
    });
  };

  const selectAllTrainees = () => {
    if (selectedTrainees.size === traineeOverviews.length) {
      setSelectedTrainees(new Set());
    } else {
      setSelectedTrainees(new Set(traineeOverviews.map((t) => t.id)));
    }
  };

  // ── Assign ───────────────────────────────────────────────────────────
  const handleAssign = () => {
    // In production, this would POST to the backend API
    setCurrentStep('done');
  };

  // ── Reset ────────────────────────────────────────────────────────────
  const resetFlow = () => {
    setCurrentStep('upload');
    setFileName('');
    setFileContent('');
    setExtractedTopics([]);
    setSuggestedVideos([]);
    setSelectedVideos(new Set());
    setSelectedTrainees(new Set());
    setAssignmentTitle('');
    setDueDate('');
    setError(null);
    setMatchedModules([]);
    setGeneratingIds(new Set());
    setModuleContents({});
    setGeneratingContentIds(new Set());
    setActiveModuleTabs({});
    setGeneratedDocs('');
    setGeneratedProcedures([]);
    setIsGeneratingContent(false);
    setSavedModuleId(null);
    setModuleTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stepIdx = getStepIndex(currentStep);

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
      <PageHeader
        title="Content Upload & Assign"
        subtitle="Upload training documents, extract topics with AI, and assign video content to trainees"
        icon={Upload}
      />

      {/* ── Stepper ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        {STEPS.map((step, i) => {
          const isActive = i === stepIdx;
          const isCompleted = i < stepIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted
                      ? 'bg-af-green border-af-green text-white'
                      : isActive
                        ? 'bg-af-orange/20 border-af-orange text-af-orange'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold text-center',
                    isActive ? 'text-af-orange' : isCompleted ? 'text-af-green' : 'text-slate-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3 mt-[-20px]',
                    i < stepIdx ? 'bg-af-green' : 'bg-slate-100'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Error Banner ────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 1: Upload Document
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-af-orange" />
                  Upload Training Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
                    fileName
                      ? 'border-af-green/50 bg-af-green/5'
                      : 'border-slate-200 bg-slate-50/50 hover:border-af-orange/50 hover:bg-af-orange/5'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {fileName ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-af-green/20 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-af-green" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{fileName}</p>
                        <p className="text-sm text-slate-500 mt-1">File ready for AI analysis</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-slate-500 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFlow();
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          Drop your training document here
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Supports PDF, DOCX, and TXT files
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-af-orange/50 text-af-orange hover:bg-af-orange/10"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>

                {fileName && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={extractTopics}
                      className="bg-af-orange hover:bg-af-orange/90 text-white gap-2 shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      Extract Topics with AI
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side info */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-af-blue" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: '1', title: 'Upload Document', desc: 'Upload any training PDF, DOCX, or TXT document' },
                { step: '2', title: 'AI Extracts Topics', desc: 'AI analyzes the document and identifies key training topics' },
                { step: '3', title: 'Video Matching', desc: 'System suggests relevant training videos based on topics' },
                { step: '4', title: 'Assign to Trainees', desc: 'Select videos and assign them to your trainees' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-af-orange/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-af-orange">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP: Extracting (Loading State)
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'extracting' && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-af-orange/10 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-af-orange" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-af-blue animate-spin" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">AI is Analyzing Your Document</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Extracting training topics from <span className="text-af-orange font-bold font-mono">{fileName}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Powered by Llama 3.1 via Groq</p>
              </div>
              <div className="flex gap-1 mt-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-af-orange animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 2: Extracted Topics
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'topics' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-af-orange" />
                Extracted Topics from <span className="text-af-orange ml-1 font-mono">{fileName}</span>
              </CardTitle>
              <Badge variant="outline" className="border-af-green/50 text-af-green bg-af-green/5">
                {extractedTopics.length} Topics Found
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extractedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-af-orange/30 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900">{topic.name}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] shrink-0',
                          topic.confidence >= 0.9
                            ? 'border-iaf-success/50 text-iaf-success'
                            : topic.confidence >= 0.7
                              ? 'border-iaf-warning/50 text-iaf-warning'
                              : 'border-iaf-sky/30 text-iaf-sky/50'
                        )}
                      >
                        {Math.round(topic.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{String(topic.description ?? '')}</p>
                    <div className="flex flex-wrap gap-1">
                      {topic.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] bg-af-blue/10 text-af-blue border border-af-blue/20 rounded-full font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep('generate')}
                  className="bg-af-orange hover:bg-af-orange/90 text-white gap-2 shadow-md"
                >
                  Generate Videos
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 3: Generate Videos
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'generate' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-af-blue" />
                AI Video Generation
              </CardTitle>
              <Badge variant="outline" className="border-af-blue/50 text-af-blue bg-af-blue/5">
                {matchedModules.filter(m => m.videoStatus === 'ready').length} / {matchedModules.length} Ready
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Videos are generated automatically and stored to your library when ready.
                </p>
                <Button
                  size="sm"
                  onClick={handleGenerateAll}
                  disabled={matchedModules.every(m => m.videoStatus === 'processing' || generatingIds.has(m.id))}
                  className="bg-af-blue hover:bg-af-navy text-white gap-1.5 shrink-0 ml-4 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate All
                </Button>
              </div>

              {matchedModules.map(mod => {
                const content = moduleContents[mod.id];
                const isGeneratingContent = generatingContentIds.has(mod.id);
                const isGeneratingVideo = mod.videoStatus === 'processing' || generatingIds.has(mod.id);
                const hasContent = !!content || isGeneratingContent;
                const activeTab = activeModuleTabs[mod.id] ?? 'video';

                return (
                  <div key={mod.id} className="rounded-lg border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{String(mod.title ?? '')}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{String(mod.description ?? '')}</p>
                      </div>

                      {mod.videoStatus === 'ready' && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </Badge>
                      )}
                      {mod.videoStatus === 'processing' && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1 shrink-0">
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating…
                        </Badge>
                      )}
                      {mod.videoStatus === 'error' && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 shrink-0">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </Badge>
                      )}
                      {(!mod.videoStatus || mod.videoStatus === 'none') && !isGeneratingContent && !content && (
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200 shrink-0">No Content</Badge>
                      )}
                      {isGeneratingContent && !isGeneratingVideo && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1 shrink-0">
                          <Loader2 className="w-3 h-3 animate-spin" /> Creating…
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        disabled={isGeneratingVideo}
                        onClick={() => handleGenerateVideo(mod)}
                        className={cn(
                          'shrink-0 gap-1.5',
                          mod.videoStatus === 'ready'
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            : 'bg-af-blue hover:bg-af-navy text-white shadow-sm'
                        )}
                        variant={mod.videoStatus === 'ready' ? 'outline' : 'default'}
                      >
                        {isGeneratingVideo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : mod.videoStatus === 'ready' ? (
                          <RefreshCw className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {isGeneratingVideo ? 'Generating…' : mod.videoStatus === 'ready' ? 'Regenerate' : 'AI Generate'}
                      </Button>
                    </div>

                    {/* Tabs — appear once generation starts */}
                    {hasContent && (
                      <div className="border-t border-slate-200">
                        {/* Tab bar */}
                        <div className="flex bg-white border-b border-slate-200">
                          {([
                            { key: 'video', label: 'Video', Icon: Video },
                            { key: 'documentation', label: 'Documentation', Icon: BookOpen },
                            { key: 'procedures', label: 'Procedures', Icon: ListOrdered },
                            { key: 'diagrams', label: 'Diagrams', Icon: ImageIcon },
                          ] as const).map(({ key, label, Icon }) => (
                            <button
                              key={key}
                              onClick={() => setActiveModuleTabs(prev => ({ ...prev, [mod.id]: key }))}
                              className={cn(
                                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px',
                                activeTab === key
                                  ? 'border-af-orange text-af-orange bg-af-orange/5'
                                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* Tab content */}
                        <div className="p-4">
                          {/* Video Tab */}
                          {activeTab === 'video' && (
                            <div>
                              {mod.videoStatus === 'ready' && mod.videoUrl ? (
                                <video src={mod.videoUrl} controls className="w-full rounded-lg border border-slate-200" style={{ maxHeight: 200 }} />
                              ) : isGeneratingVideo ? (
                                <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                                  <Loader2 className="w-8 h-8 animate-spin text-af-blue" />
                                  <p className="text-sm">Video is being generated…</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                                  <Clapperboard className="w-8 h-8" />
                                  <p className="text-sm">Video generation in progress</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Documentation Tab */}
                          {activeTab === 'documentation' && (
                            <div>
                              {isGeneratingContent && !content?.documentation ? (
                                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Generating documentation…
                                </div>
                              ) : content?.documentation ? (
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content.documentation}</p>
                              ) : (
                                <p className="text-sm text-slate-400 text-center py-4">No documentation yet</p>
                              )}
                            </div>
                          )}

                          {/* Procedures Tab */}
                          {activeTab === 'procedures' && (
                            <div className="space-y-2">
                              {isGeneratingContent && (!content?.procedures?.length) ? (
                                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Generating procedures…
                                </div>
                              ) : content?.procedures?.length ? (
                                content.procedures.map(p => (
                                  <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-white border border-slate-200">
                                    <span className="w-6 h-6 rounded-full bg-af-orange/10 text-af-orange text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{p.step}</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                                      {p.caution && <p className="text-xs text-amber-600 mt-1">⚠ {p.caution}</p>}
                                      {p.warning && <p className="text-xs text-red-600 mt-1">⛔ {p.warning}</p>}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-slate-400 text-center py-4">No procedures yet</p>
                              )}
                            </div>
                          )}

                          {/* Diagrams Tab */}
                          {activeTab === 'diagrams' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {isGeneratingContent && (!content?.diagrams?.length) ? (
                                <div className="col-span-2 flex items-center gap-2 text-slate-400 text-sm py-4">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Generating diagrams…
                                </div>
                              ) : content?.diagrams?.length ? (
                                content.diagrams.map(d => (
                                  <div key={d.id} className="flex gap-3 p-3 rounded-lg bg-white border border-slate-200">
                                    <div className="w-12 h-12 rounded-lg bg-af-blue/10 flex items-center justify-center shrink-0">
                                      <ImageIcon className="w-6 h-6 text-af-blue" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-800">{d.title}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-2 flex flex-col items-center gap-2 py-6 text-slate-400">
                                  <ImageIcon className="w-8 h-8" />
                                  <p className="text-sm">No diagrams yet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {matchedModules.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">
                  No modules matched the extracted topics. You can still proceed to select videos.
                </p>
              )}

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('topics')}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep('videos')}
                  className="bg-af-orange hover:bg-af-orange/90 text-white gap-2 shadow-md"
                >
                  Select Videos
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 4: Video Selection
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'videos' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-af-blue" />
                Suggested Training Videos
              </CardTitle>
              <Badge variant="outline" className="border-af-orange/50 text-af-orange bg-af-orange/5">
                {selectedVideos.size} Selected
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                AI has matched these videos to the extracted topics. Select the ones you want to assign.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedVideos.map((video) => {
                  const isSelected = selectedVideos.has(video.id);
                  return (
                    <div
                      key={video.id}
                      className={cn(
                        'flex gap-4 p-4 rounded-lg border cursor-pointer transition-all shadow-sm',
                        isSelected
                          ? 'bg-af-orange/5 border-af-orange/50 ring-1 ring-af-orange/20'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      )}
                      onClick={() => toggleVideo(video.id)}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-md"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                              isSelected
                                ? 'bg-af-orange border-af-orange'
                                : 'bg-white border-slate-300'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">
                              {video.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {video.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px]',
                                  video.difficulty === 'advanced'
                                    ? 'border-af-orange/40 text-af-orange bg-af-orange/5'
                                    : video.difficulty === 'intermediate'
                                      ? 'border-af-yellow/40 text-af-yellow bg-af-yellow/5'
                                      : 'border-af-green/40 text-af-green bg-af-green/5'
                                )}
                              >
                                {video.difficulty}
                              </Badge>
                              <span className="text-[10px] text-slate-400 font-medium">{video.source}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Browse all videos */}
              {suggestedVideos.length < trainingVideos.length && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSuggestedVideos(trainingVideos)}
                    className="flex items-center gap-2 text-sm text-af-blue hover:text-af-blue/80 transition-colors font-bold"
                  >
                    <Search className="w-4 h-4" />
                    Browse all {trainingVideos.length} videos in library
                  </button>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('generate')}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep('assign')}
                  disabled={selectedVideos.size === 0}
                  className="bg-af-orange hover:bg-af-orange/90 text-white gap-2 disabled:opacity-50 shadow-md"
                >
                  Assign to Trainees ({selectedVideos.size} videos)
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 4: Assign to Trainees
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'assign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Generate + Store + Assignment Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Generate Module Content ── */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-af-blue" />
                  Generate Module Content
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleGenerateContent}
                  disabled={isGeneratingContent}
                  className="bg-af-blue hover:bg-af-navy text-white gap-1.5"
                >
                  {isGeneratingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGeneratingContent ? 'Generating…' : 'Generate'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">AI will generate the Documentation, Procedures tabs shown in the module viewer.</p>

                {generatedDocs && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-af-blue" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Documentation</span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-4">{generatedDocs}</p>
                    </div>

                    {generatedProcedures.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ListOrdered className="w-4 h-4 text-af-orange" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Procedures ({generatedProcedures.length} steps)</span>
                        </div>
                        <div className="space-y-1.5">
                          {generatedProcedures.map(p => (
                            <div key={p.id} className="flex gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-af-orange/10 text-af-orange text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{p.step}</span>
                              <div>
                                <span className="font-semibold text-slate-800">{p.title}</span>
                                <span className="text-slate-500 ml-1">— {p.description}</span>
                                {p.caution && <p className="text-xs text-amber-600 mt-0.5">⚠ {p.caution}</p>}
                                {p.warning && <p className="text-xs text-red-600 mt-0.5">⛔ {p.warning}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Store as Module ── */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-af-green" />
                  Store as Module
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">Save this content as a new training module with auto-generated video.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Module Title</label>
                    <Input
                      value={moduleTitle}
                      onChange={e => setModuleTitle(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900"
                      placeholder="Module title..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={e => setSelectedCourseId(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-af-blue/20 focus:border-af-blue"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {savedModuleId ? (
                  <div className="flex items-center gap-2 text-sm text-af-green font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Module stored! Video generation started.
                  </div>
                ) : (
                  <Button
                    onClick={handleStoreModule}
                    disabled={isSavingModule || !selectedCourseId || !moduleTitle.trim()}
                    className="bg-af-green hover:bg-af-green/90 text-white gap-2 disabled:opacity-40"
                  >
                    {isSavingModule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    {isSavingModule ? 'Storing…' : 'Store as Module'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ── Assignment Details ── */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-af-orange" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Assignment Title</label>
                  <Input
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 focus:border-af-blue focus:ring-af-blue/10"
                    placeholder="Enter assignment title..."
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 focus:border-af-blue focus:ring-af-blue/10"
                  />
                </div>

                {/* Selected Videos Summary */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Selected Videos ({selectedVideos.size})
                  </label>
                  <div className="space-y-2">
                    {trainingVideos
                      .filter((v) => selectedVideos.has(v.id))
                      .map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100 shadow-sm"
                        >
                          <Video className="w-4 h-4 text-af-blue shrink-0" />
                          <span className="text-sm font-medium text-slate-900 flex-1 truncate">{video.title}</span>
                          <span className="text-xs text-slate-500">{video.duration}</span>
                          <button
                            onClick={() => toggleVideo(video.id)}
                            className="text-slate-400 hover:text-af-orange transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Topics Summary */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Covered Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {extractedTopics.map((topic) => (
                      <Badge
                        key={topic.id}
                        variant="outline"
                        className="border-af-blue/30 text-af-blue bg-af-blue/5"
                      >
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Trainee Selection */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-af-orange" />
                  Select Trainees
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllTrainees}
                  className="text-xs text-af-orange font-bold hover:text-af-orange/80 hover:bg-af-orange/10"
                >
                  {selectedTrainees.size === traineeOverviews.length ? 'Deselect All' : 'Select All'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {traineeOverviews.map((trainee) => {
                  const isSelected = selectedTrainees.has(trainee.id);
                  return (
                    <div
                      key={trainee.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border',
                        isSelected
                          ? 'bg-af-orange/5 border-af-orange/30 ring-1 ring-af-orange/10'
                          : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-200'
                      )}
                      onClick={() => toggleTrainee(trainee.id)}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          isSelected ? 'bg-af-orange border-af-orange' : 'bg-white border-slate-300'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <img
                        src={trainee.avatar}
                        alt={trainee.name}
                        className="w-8 h-8 rounded-full bg-iaf-navy-light"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{trainee.name}</p>
                        <p className="text-xs text-slate-500">{trainee.rank}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleAssign}
                disabled={selectedTrainees.size === 0 || !assignmentTitle.trim()}
                className="w-full bg-af-orange hover:bg-af-orange/90 text-white gap-2 disabled:opacity-50 shadow-md"
              >
                <Send className="w-4 h-4" />
                Assign to {selectedTrainees.size} Trainee{selectedTrainees.size !== 1 ? 's' : ''}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep('videos')}
                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Videos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 5: Done
          ═══════════════════════════════════════════════════════════════ */}
      {currentStep === 'done' && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-af-green/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-af-green" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Assignment Created Successfully!</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  <span className="text-af-orange font-bold font-mono">{selectedVideos.size} videos</span> have been assigned
                  to <span className="text-af-orange font-bold font-mono">{selectedTrainees.size} trainees</span> from the
                  document <span className="text-af-blue font-bold font-mono">{fileName}</span>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-af-orange">{extractedTopics.length}</p>
                  <p className="text-xs text-slate-500 font-medium">Topics Extracted</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-af-blue">{selectedVideos.size}</p>
                  <p className="text-xs text-slate-500 font-medium">Videos Assigned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-af-green">{selectedTrainees.size}</p>
                  <p className="text-xs text-slate-500 font-medium">Trainees Notified</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={resetFlow}
                  className="bg-af-orange hover:bg-af-orange/90 text-white gap-2 shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Upload Another Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/instructor/dashboard'}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </PageTransition>
  );
}
