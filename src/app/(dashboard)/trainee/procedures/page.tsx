'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  CheckCircle,
  Circle,
  ChevronRight,
  AlertTriangle,
  Flame,
  Zap,
  Droplets,
  Wind,
  Target,
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'decision';
  options?: { label: string; nextId: string; variant: 'normal' | 'abnormal' }[];
  caution?: string;
}

interface Procedure {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  steps: ProcedureStep[];
}

const procedures: Procedure[] = [
  {
    id: 'engine-fire',
    title: 'Engine Fire Emergency',
    icon: Flame,
    category: 'Emergency',
    steps: [
      { id: 'ef1', title: 'Throttle - IDLE', description: 'Reduce affected engine throttle to idle position immediately.', type: 'action' },
      { id: 'ef2', title: 'Fire Confirmed?', description: 'Check fire warning light and EGT indication.', type: 'decision', options: [{ label: 'Yes - Fire Confirmed', nextId: 'ef3', variant: 'abnormal' }, { label: 'No - False Alarm', nextId: 'ef6', variant: 'normal' }] },
      { id: 'ef3', title: 'Engine - SHUTDOWN', description: 'Move affected engine fuel cutoff lever to OFF.', type: 'action', caution: 'Verify correct engine before shutdown' },
      { id: 'ef4', title: 'Fire Extinguisher - DISCHARGE', description: 'Press fire extinguisher button for affected engine.', type: 'action' },
      { id: 'ef5', title: 'Fire Out?', description: 'Monitor fire warning for 30 seconds.', type: 'decision', options: [{ label: 'Yes - Fire Out', nextId: 'ef7', variant: 'normal' }, { label: 'No - Fire Persists', nextId: 'ef8', variant: 'abnormal' }] },
      { id: 'ef6', title: 'Resume Normal Operations', description: 'Monitor engine parameters. Log false alarm event.', type: 'action' },
      { id: 'ef7', title: 'Single Engine Ops', description: 'Configure for single engine operation. Plan diversion.', type: 'action' },
      { id: 'ef8', title: 'MAYDAY - Emergency Landing', description: 'Declare MAYDAY. Execute immediate landing at nearest suitable airfield.', type: 'action', caution: 'Priority landing clearance required' },
    ],
  },
  {
    id: 'hydraulic-failure',
    title: 'Hydraulic System Failure',
    icon: Droplets,
    category: 'Systems',
    steps: [
      { id: 'hf1', title: 'Identify Affected System', description: 'Check hydraulic pressure gauges for System 1 and System 2.', type: 'action' },
      { id: 'hf2', title: 'Dual System Failure?', description: 'Are both hydraulic systems showing low pressure?', type: 'decision', options: [{ label: 'Single System', nextId: 'hf3', variant: 'normal' }, { label: 'Dual Failure', nextId: 'hf5', variant: 'abnormal' }] },
      { id: 'hf3', title: 'Isolate Failed System', description: 'Close hydraulic isolation valve for the failed system.', type: 'action' },
      { id: 'hf4', title: 'Continue with Backup', description: 'Remaining system provides adequate control. Plan landing at nearest suitable airfield.', type: 'action' },
      { id: 'hf5', title: 'EMERGENCY - Manual Reversion', description: 'Switch to manual flight control mode. Reduce speed.', type: 'action', caution: 'Reduced control authority' },
      { id: 'hf6', title: 'Emergency Landing', description: 'Plan straight-in approach. Use emergency gear extension.', type: 'action' },
    ],
  },
  {
    id: 'electrical-emergency',
    title: 'Electrical Emergency',
    icon: Zap,
    category: 'Systems',
    steps: [
      { id: 'ee1', title: 'Assess Electrical Status', description: 'Check main generator, battery voltage, and bus status.', type: 'action' },
      { id: 'ee2', title: 'Generator Online?', description: 'Is the main generator producing power?', type: 'decision', options: [{ label: 'Generator OK', nextId: 'ee3', variant: 'normal' }, { label: 'Generator Failed', nextId: 'ee4', variant: 'abnormal' }] },
      { id: 'ee3', title: 'Reset Affected Bus', description: 'Cycle the affected bus switch. Check for restoration.', type: 'action' },
      { id: 'ee4', title: 'Battery Power Only', description: 'Shed non-essential loads. Battery provides ~30min power.', type: 'action', caution: 'Limited time on battery' },
      { id: 'ee5', title: 'Land ASAP', description: 'Divert to nearest airfield. Minimize electrical usage.', type: 'action' },
    ],
  },
  {
    id: 'bird-strike',
    title: 'Bird Strike',
    icon: Wind,
    category: 'Emergency',
    steps: [
      { id: 'bs1', title: 'Assess Damage', description: 'Check engine parameters, flight controls, and airframe.', type: 'action' },
      { id: 'bs2', title: 'Engine Affected?', description: 'Are engine parameters abnormal (surge, vibration, EGT)?', type: 'decision', options: [{ label: 'Engine Normal', nextId: 'bs3', variant: 'normal' }, { label: 'Engine Damaged', nextId: 'bs4', variant: 'abnormal' }] },
      { id: 'bs3', title: 'Continue Mission', description: 'Monitor parameters. Report bird strike for maintenance inspection.', type: 'action' },
      { id: 'bs4', title: 'Reduce Power', description: 'Throttle back affected engine. Avoid abrupt power changes.', type: 'action', caution: 'Risk of engine failure' },
      { id: 'bs5', title: 'Divert & Land', description: 'Plan immediate return or divert. Request priority handling.', type: 'action' },
    ],
  },
  {
    id: 'engine-flameout',
    title: 'Engine Flame Out',
    icon: Target,
    category: 'Emergency',
    steps: [
      { id: 'fo1', title: 'Maintain Aircraft Control', description: 'Maintain altitude and airspeed. Trim for single-engine flight.', type: 'action' },
      { id: 'fo2', title: 'Attempt Relight', description: 'Set throttle to idle, ensure fuel supply, press ignition.', type: 'action' },
      { id: 'fo3', title: 'Relight Successful?', description: 'Check for stable engine parameters.', type: 'decision', options: [{ label: 'Relight OK', nextId: 'fo4', variant: 'normal' }, { label: 'Relight Failed', nextId: 'fo5', variant: 'abnormal' }] },
      { id: 'fo4', title: 'Resume Operations', description: 'Slowly advance throttle. Monitor all parameters for 5 minutes.', type: 'action' },
      { id: 'fo5', title: 'Secure Engine', description: 'Fuel cutoff to OFF. Configure for single-engine ops.', type: 'action' },
      { id: 'fo6', title: 'Divert to Base', description: 'Plan single-engine approach. Request priority landing.', type: 'action' },
    ],
  },
];

export default function ProceduresPage() {
  const [selectedProcedure, setSelectedProcedure] = useState(procedures[0]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedPaths, setSelectedPaths] = useState<Record<string, string>>({});

  const currentStep = selectedProcedure.steps[currentStepIndex];
  const totalSteps = selectedProcedure.steps.length;
  const completionPct = Math.round((completedSteps.size / totalSteps) * 100);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleDecision = (stepId: string, optionLabel: string, nextId: string) => {
    setSelectedPaths((prev) => ({ ...prev, [stepId]: optionLabel }));
    setCompletedSteps((prev) => new Set([...prev, stepId]));
    const nextIndex = selectedProcedure.steps.findIndex((s) => s.id === nextId);
    if (nextIndex >= 0) setCurrentStepIndex(nextIndex);
  };

  const handleReset = () => {
    setCompletedSteps(new Set());
    setCurrentStepIndex(0);
    setSelectedPaths({});
  };

  const handleProcedureChange = (proc: Procedure) => {
    setSelectedProcedure(proc);
    handleReset();
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Procedure Pathways"
        subtitle="Interactive decision-tree walkthrough for emergency and system procedures"
        icon={GitBranch}
      />

      {/* Procedure Selector */}
      <div className="flex flex-wrap gap-2">
        {procedures.map((proc) => {
          const Icon = proc.icon;
          return (
            <button
              key={proc.id}
              onClick={() => handleProcedureChange(proc)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                selectedProcedure.id === proc.id
                  ? 'bg-af-blue/10 border-af-blue/50 text-af-blue shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {proc.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Decision Tree */}
        <div className="lg:col-span-3 space-y-4">
          {selectedProcedure.steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStepIndex;
            const isReachable = index <= currentStepIndex || isCompleted;

            return (
              <div key={step.id} className={cn(!isReachable && 'opacity-40')}>
                {/* Connector Line */}
                {index > 0 && (
                  <div className="flex justify-start ml-8 -my-1">
                    <div className={cn('w-0.5 h-6', isCompleted || isCurrent ? 'bg-af-blue' : 'bg-slate-200')} />
                  </div>
                )}

                <Card className={cn(
                  'border transition-all',
                  isCurrent && !isCompleted && 'border-af-blue ring-2 ring-af-blue/20 shadow-md',
                  isCompleted && 'border-af-green/30 bg-af-green/5',
                  !isCurrent && !isCompleted && 'border-slate-200'
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Step Indicator */}
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        isCompleted ? 'bg-af-green/10' : isCurrent ? 'bg-af-blue/10 animate-pulse' : 'bg-slate-100'
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-af-green" />
                        ) : step.type === 'decision' ? (
                          <GitBranch className={cn('w-5 h-5', isCurrent ? 'text-af-blue' : 'text-slate-400')} />
                        ) : (
                          <Circle className={cn('w-5 h-5', isCurrent ? 'text-af-blue' : 'text-slate-400')} />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                          {step.type === 'decision' && (
                            <Badge variant="outline" className="text-[10px] bg-af-orange/10 text-af-orange border-af-orange/20">DECISION</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{step.description}</p>

                        {step.caution && (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-af-orange/10 border border-af-orange/20 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-af-orange flex-shrink-0" />
                            <span className="text-xs font-medium text-af-orange">{step.caution}</span>
                          </div>
                        )}

                        {/* Decision Options */}
                        {step.type === 'decision' && step.options && isCurrent && !isCompleted && (
                          <div className="flex gap-3 mt-3">
                            {step.options.map((opt) => (
                              <Button
                                key={opt.label}
                                size="sm"
                                className={cn(
                                  'text-xs',
                                  opt.variant === 'normal'
                                    ? 'bg-af-green text-white hover:bg-af-green/90'
                                    : 'bg-af-orange text-white hover:bg-af-orange/90'
                                )}
                                onClick={() => handleDecision(step.id, opt.label, opt.nextId)}
                              >
                                {opt.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Selected Path */}
                        {selectedPaths[step.id] && (
                          <div className="mt-2 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-af-blue" />
                            <span className="text-xs font-bold text-af-blue">{selectedPaths[step.id]}</span>
                          </div>
                        )}

                        {/* Action Complete Button */}
                        {step.type === 'action' && isCurrent && !isCompleted && (
                          <Button
                            size="sm"
                            className="mt-3 bg-af-blue text-white hover:bg-af-blue/90 text-xs"
                            onClick={() => handleStepComplete(step.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Procedure Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <selectedProcedure.icon className="w-8 h-8 text-af-blue" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedProcedure.title}</p>
                  <p className="text-xs text-slate-400">{selectedProcedure.category}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Completion</span>
                  <span className="font-bold text-af-blue">{completionPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-af-blue rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p><span className="font-bold text-slate-900">{completedSteps.size}</span> / {totalSteps} steps completed</p>
                <p>Current: <span className="font-bold text-af-blue">{currentStep?.title || 'Done'}</span></p>
              </div>

              <Button variant="outline" size="sm" className="w-full border-slate-200 text-xs" onClick={handleReset}>
                Reset Procedure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
