'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, CheckCircle, Circle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import {
  listChecklists,
  getChecklist,
  startChecklistSession,
  callChecklistItem,
  respondChecklistItem,
  completeChecklistSession,
  type Checklist,
  type ChecklistItem,
  type ChecklistSession,
} from '@/lib/checklist';

type ItemState = 'pending' | 'called' | 'responded' | 'skipped';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selected, setSelected] = useState<Checklist | null>(null);
  const [session, setSession] = useState<ChecklistSession | null>(null);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [activeItem, setActiveItem] = useState<ChecklistItem | null>(null);
  const [responseInput, setResponseInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listChecklists()
      .then(setChecklists)
      .catch(() => setError('Failed to load checklists'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectChecklist = async (cl: Checklist) => {
    setLoading(true);
    try {
      const full = await getChecklist(cl.id);
      setSelected(full);
      setSession(null);
      setItemStates({});
      setActiveItem(null);
      setCompleted(false);
    } catch {
      setError('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selected) return;
    setSessionLoading(true);
    try {
      const s = await startChecklistSession(selected.id);
      setSession(s);
      const states: Record<string, ItemState> = {};
      s.items.forEach((item) => { states[item.id] = 'pending'; });
      setItemStates(states);
      setActiveItem(selected.items[0] ?? null);
    } catch {
      setError('Failed to start session');
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCall = async (item: ChecklistItem) => {
    if (!session) return;
    await callChecklistItem(session.session_id, item.id);
    setItemStates((prev) => ({ ...prev, [item.id]: 'called' }));
    setActiveItem(item);
    setResponseInput('');
  };

  const handleRespond = async (item: ChecklistItem) => {
    if (!session) return;
    await respondChecklistItem(session.session_id, item.id, responseInput || item.expected_response || '');
    setItemStates((prev) => ({ ...prev, [item.id]: 'responded' }));

    // Advance to next pending item
    const items = selected?.items ?? [];
    const idx = items.findIndex((i) => i.id === item.id);
    const next = items.slice(idx + 1).find((i) => itemStates[i.id] === 'pending' || !itemStates[i.id]);
    setActiveItem(next ?? null);
    setResponseInput('');
  };

  const handleComplete = async () => {
    if (!session) return;
    setSessionLoading(true);
    try {
      await completeChecklistSession(session.session_id);
      setCompleted(true);
    } catch {
      setError('Failed to complete session');
    } finally {
      setSessionLoading(false);
    }
  };

  const responded = Object.values(itemStates).filter((s) => s === 'responded').length;
  const total = selected?.items.length ?? 0;
  const pct = total > 0 ? Math.round((responded / total) * 100) : 0;
  const allDone = total > 0 && responded === total;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Checklists"
        subtitle="Challenge-response procedure checklists"
        icon={CheckSquare}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Checklist selector */}
      {!session && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900">Select Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : checklists.length === 0 ? (
              <p className="text-sm text-slate-400">No checklists available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {checklists.map((cl) => (
                  <button
                    key={cl.id}
                    onClick={() => handleSelectChecklist(cl)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all',
                      selected?.id === cl.id
                        ? 'border-af-blue bg-af-blue/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white',
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900">{cl.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{cl.phase}</p>
                  </button>
                ))}
              </div>
            )}

            {selected && !session && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selected.name}</p>
                  <p className="text-xs text-slate-400">{selected.items.length} items</p>
                </div>
                <Button
                  className="bg-af-blue text-white hover:bg-af-blue/90 text-sm"
                  onClick={handleStartSession}
                  disabled={sessionLoading}
                >
                  {sessionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Session'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active session */}
      {session && selected && !completed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {selected.items.map((item) => {
              const state = itemStates[item.id] ?? 'pending';
              const isActive = activeItem?.id === item.id;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    'border transition-all',
                    isActive && state !== 'responded' && 'border-af-blue ring-2 ring-af-blue/20',
                    state === 'responded' && 'border-af-green/30 bg-af-green/5',
                    !isActive && state === 'pending' && 'border-slate-200 opacity-60',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {state === 'responded' ? (
                          <CheckCircle className="w-5 h-5 text-af-green" />
                        ) : (
                          <Circle className={cn('w-5 h-5', isActive ? 'text-af-blue' : 'text-slate-300')} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{item.challenge}</span>
                          {item.is_critical && (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">
                              CRITICAL
                            </Badge>
                          )}
                          {item.target_time_seconds && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {item.target_time_seconds}s
                            </span>
                          )}
                        </div>

                        {item.expected_response && (
                          <p className="text-xs text-slate-500 mt-0.5">Expected: {item.expected_response}</p>
                        )}

                        {isActive && state === 'pending' && (
                          <Button
                            size="sm"
                            className="mt-2 bg-af-blue text-white hover:bg-af-blue/90 text-xs"
                            onClick={() => handleCall(item)}
                          >
                            Call Item
                          </Button>
                        )}

                        {isActive && state === 'called' && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={item.expected_response ?? 'Enter response…'}
                              value={responseInput}
                              onChange={(e) => setResponseInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleRespond(item)}
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-af-blue/30"
                            />
                            <Button
                              size="sm"
                              className="bg-af-green text-white hover:bg-af-green/90 text-xs"
                              onClick={() => handleRespond(item)}
                            >
                              Respond
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Session summary */}
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">Session Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Completion</span>
                    <span className="font-bold text-af-blue">{pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-af-blue rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  <span className="font-bold text-slate-900">{responded}</span> / {total} items responded
                </p>

                {allDone && (
                  <Button
                    className="w-full bg-af-green text-white hover:bg-af-green/90 text-sm"
                    onClick={handleComplete}
                    disabled={sessionLoading}
                  >
                    {sessionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Checklist'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Completed state */}
      {completed && (
        <Card className="border-af-green/30 bg-af-green/5">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <CheckCircle className="w-12 h-12 text-af-green" />
            <p className="text-lg font-bold text-slate-900">Checklist Complete</p>
            <p className="text-sm text-slate-500">
              {responded} of {total} items responded
            </p>
            <Button
              variant="outline"
              className="mt-2 border-slate-200 text-sm"
              onClick={() => {
                setSession(null);
                setSelected(null);
                setCompleted(false);
                setItemStates({});
              }}
            >
              Start Another Checklist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
