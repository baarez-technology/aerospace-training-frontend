'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  listInstructorVideos,
  uploadInstructorVideo,
  assignVideoToTrainees,
  unassignTrainee,
  deleteInstructorVideo,
} from '@/lib/instructorVideos';
import { apiFetch } from '@/lib/api';
import type { InstructorVideo } from '@/types';
import { cn } from '@/lib/utils';

const mockVideos: InstructorVideo[] = [
  { id: 'iv1', instructorId: 'i1', title: 'AL-31FP Engine Start Procedure', description: 'Standard engine start sequence for the AL-31FP turbofan used in Su-30MKI.', videoUrl: 'https://www.youtube.com/embed/1dEoMGWjMU4', cloudinaryPublicId: '', duration: '12 min', category: 'Jet Engine Systems', difficulty: 'intermediate', tags: ['engine', 'startup', 'Su-30MKI'], assignedTo: [{ traineeId: 't1', traineeName: 'Flt Lt. Arjun Sharma', assignedAt: '2024-01-10T08:00:00Z' }, { traineeId: 't2', traineeName: 'Flt Lt. Priya Nair', assignedAt: '2024-01-11T09:00:00Z' }], createdAt: '2024-01-05T10:00:00Z', updatedAt: '2024-01-10T08:00:00Z' },
  { id: 'iv2', instructorId: 'i1', title: 'Hydraulic System - Fault Isolation', description: 'Identify and isolate hydraulic faults in dual-circuit fighter systems.', videoUrl: 'https://www.youtube.com/embed/KXoABKs1JfM', cloudinaryPublicId: '', duration: '22 min', category: 'Hydraulics', difficulty: 'advanced', tags: ['hydraulics', 'fault', 'isolation'], assignedTo: [{ traineeId: 't3', traineeName: 'Flt Lt. Ravi Kumar', assignedAt: '2024-01-12T10:00:00Z' }], createdAt: '2024-01-06T11:00:00Z', updatedAt: '2024-01-12T10:00:00Z' },
  { id: 'iv3', instructorId: 'i1', title: 'N011M BARS Radar - Mode Selection', description: 'Radar mode selection and target acquisition for the N011M BARS phased-array radar.', videoUrl: 'https://www.youtube.com/embed/hOqHOFRzPMI', cloudinaryPublicId: '', duration: '18 min', category: 'Avionics', difficulty: 'advanced', tags: ['radar', 'BARS', 'avionics', 'targeting'], assignedTo: [], createdAt: '2024-01-08T09:00:00Z', updatedAt: '2024-01-08T09:00:00Z' },
];

const mockTrainees: TraineeSummary[] = [
  { id: 't1', name: 'Flt Lt. Arjun Sharma', rank: 'Flight Lieutenant' },
  { id: 't2', name: 'Flt Lt. Priya Nair', rank: 'Flight Lieutenant' },
  { id: 't3', name: 'Flt Lt. Ravi Kumar', rank: 'Flight Lieutenant' },
];
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { CountUp } from '@/components/ui/CountUp';
import {
  Library,
  Upload,
  Loader2,
  Trash2,
  Users,
  Check,
  X,
  Play,
  Tag,
  UserCheck,
  UserMinus,
  AlertCircle,
  Search,
} from 'lucide-react';

interface TraineeSummary {
  id: string;
  name: string;
  rank?: string;
  avatar?: string;
}

// ── Upload Modal ────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: (v: InstructorVideo) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Jet Engine Systems');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Jet Engine Systems',
    'Hydraulics',
    'Electrical Systems',
    'Avionics',
    'Flight Control',
    'Weapons Systems',
    'Landing Gear',
    'Fuel Systems',
    'General'
  ];

  const handleSubmit = async () => {
    if (!file || !title.trim()) { setError('Title and video file are required.'); return; }
    setUploading(true);
    setError('');
    try {
      const video = await uploadInstructorVideo(file, {
        title,
        description,
        category,
        difficulty,
        isPublic,
        tags
      });
      onUploaded(video);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upload Video to Library</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* File picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
            file ? 'border-af-green/50 bg-af-green/5' : 'border-slate-200 hover:border-af-blue/40 hover:bg-slate-50'
          )}
        >
          <input ref={fileRef} type="file" accept="video/mp4,video/webm" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
          {file ? (
            <p className="text-sm font-bold text-af-green">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Click to select MP4 or WebM (max 50 MB)</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. AL-31FP Engine Startup" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-af-blue/10 focus:bg-white transition-all"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-af-blue/10 focus:bg-white transition-all capitalize"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-900">Make Public</p>
              <p className="text-[10px] text-slate-500 font-medium">When enabled, this video appears in the trainee catalog for everyone.</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                isPublic ? "bg-af-blue shadow-sm shadow-af-blue/20" : "bg-slate-300"
              )}
            >
              <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                isPublic ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Tags (comma-separated)</label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="engine, startup, safety" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading} className="flex-1 bg-af-blue hover:bg-af-navy text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-af-blue/20">
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4 mr-2" />Upload Video</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Assign Modal ────────────────────────────────────────────────────────────
function AssignModal({
  video,
  trainees,
  onClose,
  onAssigned,
}: {
  video: InstructorVideo;
  trainees: TraineeSummary[];
  onClose: () => void;
  onAssigned: (updated: InstructorVideo) => void;
}) {
  const alreadyAssigned = new Set(video.assignedTo.map(a => a.traineeId));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const toggle = (id: string) => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const handleAssign = async () => {
    if (selected.size === 0) return;
    setAssigning(true);
    try {
      const result = await assignVideoToTrainees(video.id, [...selected]);
      onAssigned(result.video);
    } catch (err: any) {
      setError(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (traineeId: string) => {
    try {
      const result = await unassignTrainee(video.id, traineeId);
      onAssigned(result.video);
    } catch { /* silent */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Assign: <span className="text-af-blue">{video.title}</span></h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>}

        {/* Currently assigned */}
        {video.assignedTo.length > 0 && (
          <div className="shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Currently Assigned</p>
            <div className="flex flex-wrap gap-2">
              {video.assignedTo.map(a => (
                <div key={a.traineeId} className="flex items-center gap-1.5 px-2.5 py-1 bg-af-green/5 border border-af-green/20 rounded-full text-[10px] font-black text-af-green">
                  <UserCheck className="w-3 h-3" />
                  {a.traineeName || a.traineeId}
                  <button onClick={() => handleUnassign(a.traineeId)} className="ml-1 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Box */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search trainees by name or rank..."
            className="pl-9 bg-slate-50 border-slate-200 text-sm focus:bg-white focus:ring-af-blue/10 transition-all"
          />
        </div>

        {/* Trainee list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select trainees to assign</p>
          {trainees
            .filter(t => !alreadyAssigned.has(t.id))
            .filter(t => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return t.name.toLowerCase().includes(q) || (t.rank && t.rank.toLowerCase().includes(q));
            })
            .map(t => {
            const isSelected = selected.has(t.id);
            return (
              <div
                key={t.id}
                onClick={() => toggle(t.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all',
                  isSelected
                    ? 'bg-af-blue/5 border-af-blue/30 ring-1 ring-af-blue/20'
                    : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                  isSelected ? 'bg-af-blue border-af-blue shadow-sm' : 'bg-white border-slate-300'
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                    <Users className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{t.name}</p>
                  {t.rank && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.rank}</p>}
                </div>
              </div>
            );
          })}
          {(trainees.filter(t => !alreadyAssigned.has(t.id)).length === 0) ? (
            <div className="text-center py-10">
              <UserCheck className="w-12 h-12 text-slate-100 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">All trainees are already assigned.</p>
            </div>
          ) : trainees.filter(t => !alreadyAssigned.has(t.id)).filter(t => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return t.name.toLowerCase().includes(q) || (t.rank && t.rank.toLowerCase().includes(q));
            }).length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Search className="w-10 h-10 text-slate-100 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">No trainees match "{searchQuery}"</p>
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px]">Close</Button>
          <Button
            onClick={handleAssign}
            disabled={selected.size === 0 || assigning}
            className="flex-1 bg-af-blue hover:bg-af-navy text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-af-blue/20"
          >
            {assigning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
            Confirm {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function InstructorVideoLibraryPage() {
  const [videos, setVideos] = useState<InstructorVideo[]>([]);
  const [trainees, setTrainees] = useState<TraineeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [assignTarget, setAssignTarget] = useState<InstructorVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listInstructorVideos(),
      apiFetch<TraineeSummary[]>('/instructor/trainees'),
    ])
      .then(([vids, trs]) => {
        setVideos((vids as InstructorVideo[])?.length ? vids as InstructorVideo[] : mockVideos);
        setTrainees((trs as TraineeSummary[])?.length ? trs as TraineeSummary[] : mockTrainees);
      })
      .catch(() => { setVideos(mockVideos); setTrainees(mockTrainees); })
      .finally(() => {
        // Smooth skeleton transition
        setTimeout(() => setLoading(false), 800);
      });
  }, []);

  const handleUploaded = (v: InstructorVideo) => {
    setVideos(prev => [v, ...prev]);
    setShowUpload(false);
  };

  const handleAssigned = (updated: InstructorVideo) => {
    setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
    setAssignTarget(updated);
  };

  const handleDelete = async (v: InstructorVideo) => {
    if (!confirm(`Delete "${v.title}"? This cannot be undone.`)) return;
    setDeletingId(v.id);
    try {
      await deleteInstructorVideo(v.id);
      setVideos(prev => prev.filter(x => x.id !== v.id));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const traineesReachedCount = new Set(videos.flatMap(v => v.assignedTo.map(a => a.traineeId))).size;
  const assignmentsMadeCount = videos.reduce((n, v) => n + v.assignedTo.length, 0);

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="My Video Library"
          subtitle="Manage your training media library and assign content to specific personnel"
          icon={Library}
        />

        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group">
            <div className="h-1 bg-af-blue/50" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-af-blue"><CountUp value={videos.length} /></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Videos</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-af-blue/5 border border-af-blue/10 flex items-center justify-center group-hover:bg-af-blue/10 transition-colors">
                <Library className="w-6 h-6 text-af-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group">
            <div className="h-1 bg-af-green/50" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-af-green"><CountUp value={traineesReachedCount} /></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trainees Reached</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-af-green/5 border border-af-green/10 flex items-center justify-center group-hover:bg-af-green/10 transition-colors">
                <UserCheck className="w-6 h-6 text-af-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group">
            <div className="h-1 bg-af-orange/50" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-af-orange"><CountUp value={assignmentsMadeCount} /></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assignments Made</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-af-orange/5 border border-af-orange/10 flex items-center justify-center group-hover:bg-af-orange/10 transition-colors">
                <Users className="w-6 h-6 text-af-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload and Search bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search library..."
              className="pl-9 bg-white border-slate-200 focus:ring-af-blue/10 transition-all"
            />
          </div>
          <Button onClick={() => setShowUpload(true)} className="w-full sm:w-auto bg-af-blue hover:bg-af-navy text-white shadow-lg shadow-af-blue/20 font-bold uppercase tracking-widest text-[10px] h-10 px-6">
            <Upload className="w-4 h-4 mr-2" />
            Upload New Video
          </Button>
        </div>

        {/* Video grid */}
        {videos.length === 0 ? (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="py-24 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <Library className="w-10 h-10 text-slate-200" />
              </div>
              <div>
                <p className="text-slate-900 font-black uppercase tracking-tight text-lg">Your library is empty</p>
                <p className="text-sm text-slate-400 mt-1 font-medium max-w-xs mx-auto">Upload your first technical training video to begin assigning it to personnel.</p>
              </div>
              <Button onClick={() => setShowUpload(true)} className="bg-af-blue hover:bg-af-navy text-white font-bold uppercase tracking-widest text-[10px] h-11 px-8 mt-2 shadow-xl shadow-af-blue/10">
                <Upload className="w-4 h-4 mr-2" />Upload Video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map(v => (
              <Card key={v.id} className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:border-af-blue/30 transition-all duration-300">
                {/* Video thumbnail / preview */}
                <div
                  className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                  onClick={() => setPreviewUrl(v.videoUrl)}
                >
                  <video src={v.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" preload="metadata" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/40 backdrop-blur-[1px]">
                    <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-6 h-6 text-af-blue ml-1 fill-af-blue/20" />
                    </div>
                  </div>
                  {/* Category overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 shadow-lg">
                      {v.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Title + category */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-af-blue transition-colors uppercase tracking-tight">{v.title}</h3>
                    {v.description && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed italic">{v.description}</p>}
                  </div>

                  {/* Tags */}
                  {v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {v.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-bold uppercase tracking-tighter">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                    {/* Assigned trainees */}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                        v.assignedTo.length === 0 ? "bg-slate-50 border border-slate-100" : "bg-af-green/5 border border-af-green/20"
                      )}>
                        <Users className={cn("w-3.5 h-3.5", v.assignedTo.length === 0 ? "text-slate-300" : "text-af-green")} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel</span>
                        <span className={cn("text-xs font-black", v.assignedTo.length === 0 ? "text-slate-400" : "text-af-green")}>
                          {v.assignedTo.length} {v.assignedTo.length === 1 ? 'Trainee' : 'Trainees'}
                        </span>
                      </div>
                    </div>

                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase tracking-widest border-0",
                      v.difficulty === 'advanced' ? 'bg-red-50 text-red-600' :
                      v.difficulty === 'intermediate' ? 'bg-af-orange/5 text-af-orange' : 'bg-af-green/5 text-af-green'
                    )}>
                      {v.difficulty}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => setAssignTarget(v)}
                      className="flex-1 bg-af-blue hover:bg-af-navy text-white text-[10px] font-bold uppercase tracking-widest h-9 shadow-md shadow-af-blue/10"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-2" />
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(v)}
                      disabled={deletingId === v.id}
                      className="border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all w-10 px-0"
                    >
                      {deletingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}
        {assignTarget && (
          <AssignModal
            video={assignTarget}
            trainees={trainees}
            onClose={() => setAssignTarget(null)}
            onAssigned={handleAssigned}
          />
        )}

        {/* Video preview lightbox */}
        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md transition-all duration-300"
            onClick={() => setPreviewUrl(null)}
          >
            <div className="relative w-full max-w-4xl px-4 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute -top-12 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <video src={previewUrl} controls autoPlay className="w-full" />
              </div>
              <div className="mt-4 text-center">
                <p className="text-white font-bold uppercase tracking-widest text-sm">Now Playing: Library Asset</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
