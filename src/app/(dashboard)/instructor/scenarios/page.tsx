'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { scenarios as initialScenarios } from '@/data/mockData';
import type { Scenario } from '@/types';
import {
  Target,
  Plus,
  X,
  Pencil,
  Trash2,
  Plane,
  AlertTriangle,
  BookOpen,
  Zap,
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { CountUp } from '@/components/ui/CountUp';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-af-green/10 text-af-green border-af-green/20',
  intermediate: 'bg-af-blue/10 text-af-blue border-af-blue/20',
  advanced: 'bg-af-orange/10 text-af-orange border-af-orange/20',
};

const typeIcons: Record<string, React.ReactNode> = {
  'flight-readiness': <Plane className="w-5 h-5" />,
  maintenance: <AlertTriangle className="w-5 h-5" />,
  'mission-rehearsal': <Target className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  'flight-readiness': 'text-af-blue bg-af-blue/10',
  maintenance: 'text-af-orange bg-af-orange/10',
  'mission-rehearsal': 'text-af-green bg-af-green/10',
};

interface ScenarioFormData {
  title: string;
  description: string;
  type: 'flight-readiness' | 'maintenance' | 'mission-rehearsal';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const emptyForm: ScenarioFormData = {
  title: '',
  description: '',
  type: 'flight-readiness',
  difficulty: 'intermediate',
};

export default function InstructorScenariosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'flight-readiness' | 'maintenance' | 'mission-rehearsal'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [form, setForm] = useState<ScenarioFormData>(emptyForm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const filtered = scenarios.filter((s) => {
    const matchType = filterType === 'all' || s.type === filterType;
    const matchDiff = filterDifficulty === 'all' || s.difficulty === filterDifficulty;
    return matchType && matchDiff;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setForm({
      title: scenario.title,
      description: scenario.description,
      type: scenario.type as ScenarioFormData['type'],
      difficulty: scenario.difficulty as ScenarioFormData['difficulty'],
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    if (!form.title) return;
    if (editingId) {
      setScenarios(
        scenarios.map((s) =>
          s.id === editingId
            ? { ...s, ...form, updatedAt: new Date().toISOString().split('T')[0] }
            : s
        )
      );
    } else {
      const newScenario: Scenario = {
        id: `sc-${Date.now()}`,
        ...form,
        parameters: {},
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setScenarios([newScenario, ...scenarios]);
    }
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
      <PageHeader
        title="Scenario Builder"
        subtitle="Create and manage custom training scenarios for simulations"
        icon={Target}
        actions={
          <Button
            className="bg-af-orange text-white hover:bg-af-orange/90 shadow-sm"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Scenario
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(
          [
            { type: 'flight-readiness', label: 'Flight Readiness', icon: Plane },
            { type: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
            { type: 'mission-rehearsal', label: 'Mission Rehearsal', icon: Target },
          ] as const
        ).map(({ type, label, icon: Icon }) => {
          const count = scenarios.filter((s) => s.type === type).length;
          return (
            <Card key={type} className="bg-white border-slate-200 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', typeColors[type])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      <CountUp value={count} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1.5">
          {(['all', 'flight-readiness', 'maintenance', 'mission-rehearsal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
                filterType === t
                  ? 'bg-af-orange/10 border-af-orange/50 text-af-orange'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              )}
            >
              {t === 'all' ? 'All Types' : t.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
                filterDifficulty === d
                  ? 'bg-af-blue/10 border-af-blue/50 text-af-blue'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              )}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((scenario) => (
          <Card
            key={scenario.id}
            className="bg-white border-slate-200 shadow-sm hover:border-af-orange/40 transition-colors group"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    'p-2 rounded-lg flex-shrink-0',
                    typeColors[scenario.type]
                  )}
                >
                  {typeIcons[scenario.type]}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-af-blue"
                    onClick={() => openEdit(scenario)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-af-orange"
                    onClick={() => handleDelete(scenario.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 mt-2">
                {scenario.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">{scenario.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                    difficultyColors[scenario.difficulty]
                  )}
                >
                  <Zap className="w-3 h-3" />
                  {scenario.difficulty}
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  {scenario.type.replace('-', ' ')}
                </span>
              </div>

              {Object.keys(scenario.parameters).length > 0 && (
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Parameters</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(scenario.parameters).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600"
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Updated {new Date(scenario.updatedAt).toLocaleDateString('en-IN')}
              </p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            No scenarios match your filters.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <Card className="relative z-10 w-full max-w-md bg-white border-slate-200 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-slate-900">
                {editingId ? 'Edit Scenario' : 'Create Scenario'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dual Engine Failure at Low Altitude"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-af-orange/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the scenario objectives and setup..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-af-orange/30 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase">Type</label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: 'flight-readiness', label: 'Flight', icon: Plane },
                      { value: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
                      { value: 'mission-rehearsal', label: 'Mission', icon: Target },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setForm({ ...form, type: value })}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-colors',
                        form.type === value
                          ? cn(typeColors[value], 'border-current')
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase">Difficulty</label>
                <div className="flex gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-colors',
                        form.difficulty === d
                          ? difficultyColors[d]
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {d}
                    </button>
                  ))}
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
                  onClick={handleSubmit}
                  disabled={!form.title}
                >
                  {editingId ? 'Save Changes' : 'Create'}
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
