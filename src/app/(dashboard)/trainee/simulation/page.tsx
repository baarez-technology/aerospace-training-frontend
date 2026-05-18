'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSimulations } from '@/lib/simulations';
import { simulations as mockSimulations } from '@/data/mockData';
import type { Simulation } from '@/types';
import { cn, getDifficultyBadgeColor } from '@/lib/utils';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import {
  Plane,
  Play,
  Clock,
  Target,
  CheckCircle,
  RotateCcw,
  Settings,
  BarChart3,
  Activity,
} from 'lucide-react';

const simulationTypes = [
  { id: 'all', label: 'All Simulations' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'flight-readiness', label: 'Flight Readiness' },
  { id: 'mission-rehearsal', label: 'Mission Rehearsal' },
];

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    getSimulations().then(data => {
      const list = Array.isArray(data) && data.length > 0 ? data : mockSimulations;
      setSimulations(list);
      setTimeout(() => setIsLoading(false), 800);
    }).catch(err => {
      console.error(err);
      setSimulations(mockSimulations);
      setIsLoading(false);
    });
  }, []);

  const filteredSimulations = selectedType === 'all'
    ? simulations
    : simulations.filter(s => s.type === selectedType);

  const handleLaunch = () => {
    if (!selectedSimulation) return;
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      // In a real app, this would launch the simulation
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Settings className="w-5 h-5" />;
      case 'flight-readiness':
        return <Plane className="w-5 h-5" />;
      case 'mission-rehearsal':
        return <Target className="w-5 h-5" />;
      default:
        return <Plane className="w-5 h-5" />;
    }
  };

  const getStatusButton = (simulation: Simulation) => {
    switch (simulation.status) {
      case 'completed':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSimulation(simulation);
            }}
            className="border-af-green/50 text-af-green hover:bg-af-green/10"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Results
          </Button>
        );
      case 'in-progress':
        return (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSimulation(simulation);
            }}
            className="bg-af-blue hover:bg-af-navy text-white"
          >
            <Play className="w-4 h-4 mr-1" />
            Resume
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSimulation(simulation);
            }}
            className="bg-af-orange hover:bg-af-orange/80 text-white"
          >
            <Play className="w-4 h-4 mr-1" />
            Launch
          </Button>
        );
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6 text-slate-900">
        <PageHeader
          title="Mission Simulation"
          subtitle="Launch training simulations and mission rehearsals"
          icon={Plane}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {simulationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg border transition-all duration-200',
                    selectedType === type.id
                      ? 'bg-af-blue border-af-blue text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Simulations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSimulations.map((simulation) => (
                <Card
                  key={simulation.id}
                  className={cn(
                    'bg-white border-slate-200 cursor-pointer transition-all hover:shadow-md group',
                    selectedSimulation?.id === simulation.id && 'border-af-blue ring-1 ring-af-blue/20 bg-af-blue/5'
                  )}
                  onClick={() => setSelectedSimulation(simulation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                        simulation.type === 'maintenance' && 'bg-af-orange/10 text-af-orange',
                        simulation.type === 'flight-readiness' && 'bg-af-blue/10 text-af-blue',
                        simulation.type === 'mission-rehearsal' && 'bg-af-blue/10 text-af-blue'
                      )}>
                        {getTypeIcon(simulation.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-af-blue transition-colors">
                            {simulation.title}
                          </h3>
                          <StatusBadge status={simulation.status} size="sm" showDot={false} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{simulation.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="outline" className={cn('capitalize border-0 bg-slate-100/80 font-bold', getDifficultyBadgeColor(simulation.difficulty))}>
                            {simulation.difficulty}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {simulation.duration}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{simulation.aircraft}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      {getStatusButton(simulation)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission Briefing Panel */}
          <div>
            <Card className="bg-white border-slate-200 shadow-sm sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
              <div className="h-1.5 bg-af-blue" />
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-af-orange" />
                  Mission Briefing
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                {selectedSimulation ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedSimulation.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={selectedSimulation.status} size="sm" />
                        <Badge variant="outline" className={cn('capitalize border-0 bg-slate-100 font-bold', getDifficultyBadgeColor(selectedSimulation.difficulty))}>
                          {selectedSimulation.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed italic">{selectedSimulation.briefing}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-af-navy mb-3 flex items-center gap-2 uppercase tracking-widest">
                         <Activity className="w-4 h-4 text-af-blue" />
                         Mission Objectives
                      </h4>
                      <ul className="space-y-2.5">
                        {(selectedSimulation.objectives || []).map((objective, index) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <CheckCircle className="w-4 h-4 text-af-green mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-600 font-medium">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aircraft</p>
                        <p className="text-sm font-bold text-slate-700">{selectedSimulation.aircraft}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                        <p className="text-sm font-bold text-slate-700">{selectedSimulation.duration}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                        <p className="text-sm font-bold text-slate-700 capitalize">{selectedSimulation.type.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Difficulty</p>
                        <p className="text-sm font-bold text-slate-700 capitalize">{selectedSimulation.difficulty}</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleLaunch}
                      disabled={isLaunching || selectedSimulation.status === 'completed'}
                      className="w-full bg-af-orange hover:bg-af-orange/90 text-white font-bold h-11 shadow-md mt-4"
                    >
                      {isLaunching ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          Launching Engine...
                        </>
                      ) : selectedSimulation.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : selectedSimulation.status === 'in-progress' ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume Mission
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Execute Mission
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Plane className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400 mb-2">Select a Mission</h3>
                    <p className="text-sm text-slate-400 max-w-[200px] mx-auto">
                      Choose a simulation from the registry to view mission intelligence
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
