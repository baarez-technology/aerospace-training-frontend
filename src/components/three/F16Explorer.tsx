'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Crosshair,
  Eye,
  Layers,
  Maximize2,
  Maximize,
  RotateCcw,
  RotateCw,
  Tag,
  Plane,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CATEGORY_LABELS,
  F16_PARTS,
  type F16Part,
  type PartCategory,
} from '@/data/f16Parts';
import type { ViewMode } from './F16Model';

const F16Scene = dynamic(() => import('./F16Scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b1220]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-af-blue/20 border-t-af-blue" />
    </div>
  ),
});

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'xray', label: 'X-Ray' },
  { id: 'wireframe', label: 'Wire' },
];

export function F16Explorer() {
  const [selectedId, setSelectedId] = useState<string | null>('airframe');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isolate, setIsolate] = useState(false);
  const [explode, setExplode] = useState(0);
  const [gearDown, setGearDown] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('solid');
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [fitKey, setFitKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => F16_PARTS.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  const grouped = useMemo(() => {
    const m = new Map<PartCategory, F16Part[]>();
    for (const p of F16_PARTS) {
      // Hide whichever landing-gear state is not active from the list.
      if (p.id === 'gear-up' && gearDown) continue;
      if ((p.id === 'gear-down' || p.id === 'lights') && !gearDown) continue;
      const arr = m.get(p.category) ?? [];
      arr.push(p);
      m.set(p.category, arr);
    }
    return m;
  }, [gearDown]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div ref={containerRef} className="space-y-4 bg-white">
      {/* ── Control bar ───────────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <div className="mr-auto flex items-center gap-2">
            <Plane className="h-5 w-5 text-af-blue" />
            <span className="text-sm font-black uppercase tracking-tight text-slate-900">
              F-16 Fighting Falcon
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Interactive Twin
            </span>
          </div>

          {/* View mode */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {VIEW_MODES.map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={cn(
                  'rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all',
                  viewMode === v.id
                    ? 'bg-af-blue text-white shadow-sm'
                    : 'text-slate-500 hover:text-af-blue'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <ToolbarToggle
            active={gearDown}
            onClick={() => setGearDown((v) => !v)}
            icon={<Box className="h-3.5 w-3.5" />}
            label={gearDown ? 'Gear Down' : 'Gear Up'}
          />
          <ToolbarToggle
            active={isolate}
            onClick={() => setIsolate((v) => !v)}
            icon={<Crosshair className="h-3.5 w-3.5" />}
            label="Isolate"
          />
          <ToolbarToggle
            active={showLabels}
            onClick={() => setShowLabels((v) => !v)}
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Labels"
          />
          <ToolbarToggle
            active={autoRotate}
            onClick={() => setAutoRotate((v) => !v)}
            icon={<RotateCw className="h-3.5 w-3.5" />}
            label="Spin"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExplode(0);
              setSelectedId('airframe');
              setIsolate(false);
              setResetKey((k) => k + 1);
              setFitKey((k) => k + 1);
            }}
            className="h-8 border-slate-200 px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-af-orange/40 hover:text-af-orange"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 border-slate-200 px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-af-blue/40 hover:text-af-blue"
          >
            <Maximize className="mr-1.5 h-3.5 w-3.5" />
            Full
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* ── Parts list ─────────────────────────────────────────── */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-af-navy">
              Part Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[560px] space-y-4 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-200">
            {[...grouped.entries()].map(([cat, parts]) => (
              <div key={cat}>
                <p className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="space-y-1.5">
                  {parts.map((p) => {
                    const active = selectedId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        onPointerOver={() => setHoveredId(p.id)}
                        onPointerOut={() => setHoveredId(null)}
                        className={cn(
                          'w-full rounded-xl border p-3 text-left transition-all',
                          active
                            ? 'border-af-blue/40 bg-af-blue/5 shadow-[inset_0_0_10px_rgba(0,48,143,0.05)]'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: p.accent }}
                          />
                          <span className="text-xs font-black uppercase tracking-tight text-slate-900">
                            {p.label}
                          </span>
                        </div>
                        <p className="mt-1 pl-4 text-[10px] font-medium leading-snug text-slate-500">
                          {p.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── 3D viewport ────────────────────────────────────────── */}
        <Card className="overflow-hidden border-slate-200 shadow-sm lg:col-span-2">
          <div className="h-1.5 bg-gradient-to-r from-af-blue via-iaf-cyan to-af-blue" />
          <CardContent className="relative h-[560px] p-0">
            <F16Scene
              selectedId={selectedId}
              hoveredId={hoveredId}
              isolate={isolate}
              explode={explode}
              gearDown={gearDown}
              viewMode={viewMode}
              showLabels={showLabels}
              autoRotate={autoRotate}
              resetKey={resetKey}
              fitKey={fitKey}
              onSelect={setSelectedId}
              onHover={setHoveredId}
            />

            {/* Explode slider */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-md">
              <Layers className="h-4 w-4 shrink-0 text-iaf-cyan" />
              <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-white/70">
                Exploded
              </span>
              <input
                type="range"
                min={0}
                max={3}
                step={0.01}
                value={explode}
                onChange={(e) => setExplode(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-iaf-cyan"
              />
              <span className="w-9 shrink-0 text-right font-mono text-[10px] font-bold text-iaf-cyan">
                {Math.round((explode / 3) * 100)}%
              </span>
            </div>

            {/* HUD telemetry */}
            <div className="pointer-events-none absolute left-4 top-4 space-y-0.5 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[10px] backdrop-blur-md">
              <p className="font-bold text-iaf-cyan">F-16C BLOCK 50</p>
              <p className="text-white/60">PARTS: {F16_PARTS.length}</p>
              <p className="text-white/60">
                MODE: {viewMode.toUpperCase()}
              </p>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-right font-mono text-[10px] backdrop-blur-md">
              <p className="font-bold text-af-orange">
                {gearDown ? 'GND CONFIG' : 'CLEAN CONFIG'}
              </p>
              <p className="text-white/60">
                {selected ? selected.label.toUpperCase() : 'NO SELECTION'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Info panel ─────────────────────────────────────────── */}
        <Card className="flex h-full flex-col overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-af-navy">
              Component Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[560px] flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
            {selected ? (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: selected.accent }}
                    />
                    <h4 className="text-lg font-black leading-tight tracking-tight text-slate-900">
                      {selected.label}
                    </h4>
                  </div>
                  <p className="mt-1 pl-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {CATEGORY_LABELS[selected.category]}
                  </p>
                </div>

                <Section title="Overview">
                  <p className="text-xs font-medium leading-relaxed text-slate-600">
                    {selected.overview}
                  </p>
                </Section>

                <Section title="Why It Matters">
                  <p className="text-xs font-medium italic leading-relaxed text-slate-600">
                    {selected.role}
                  </p>
                </Section>

                <Section title="Key Facts">
                  <ul className="space-y-1.5">
                    {selected.keyFacts.map((f, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-xs leading-snug text-slate-600"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-af-blue" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Specifications">
                  <div className="space-y-1.5">
                    {Object.entries(selected.specs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-3 rounded-lg border border-slate-100/60 bg-slate-50 p-2 text-[11px]"
                      >
                        <span className="font-medium uppercase tracking-tighter text-slate-500">
                          {k}
                        </span>
                        <span className="text-right font-mono font-bold text-slate-900">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            ) : (
              <div className="py-20 text-center">
                <Info className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Click any part to study it
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToolbarToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-black uppercase tracking-widest transition-all',
        active
          ? 'border-af-blue/40 bg-af-blue/10 text-af-blue'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Eye className="h-3 w-3" />
        {title}
      </p>
      {children}
    </div>
  );
}
