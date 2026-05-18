'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountUp } from '@/components/ui/CountUp';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { ClipboardCheck, Clock, CheckCircle, User, Send, Star, BarChart3, FileText } from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface PendingAssessment {
  id: string;
  trainee: string;
  avatar: string;
  rank: string;
  title: string;
  submitted: string;
  questions: { id: string; question: string; answer: string; maxScore: number }[];
}

const pendingAssessments: PendingAssessment[] = [
  {
    id: 'pa1', trainee: 'Flt. Lt. Arjun Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun', rank: 'Flight Lieutenant',
    title: 'Engine Systems - Module 3 Assessment', submitted: '2025-01-15T09:30:00Z',
    questions: [
      { id: 'q1', question: 'Describe the AL-31FP turbofan engine start sequence.', answer: 'The start sequence begins with APU start, followed by engine crank at idle. Fuel is introduced at 15% N2 speed. EGT is monitored for exceedance. Once N2 reaches 58%, the starter disengages and the engine reaches idle thrust.', maxScore: 10 },
      { id: 'q2', question: 'What are the normal operating parameters for N1, N2, and EGT during cruise?', answer: 'N1: 85-95%, N2: 90-98%, EGT: 550-650°C during cruise conditions. Any deviation beyond these limits requires immediate crew action per QRH.', maxScore: 10 },
      { id: 'q3', question: 'Explain the procedure for an in-flight engine relight.', answer: 'Maintain airspeed above 250kts, throttle to idle, ensure fuel supply is on, press ignition button, monitor N2 for rotation. If relight fails after 30 seconds, secure engine and configure for single-engine ops.', maxScore: 10 },
    ],
  },
  {
    id: 'pa2', trainee: 'Fg. Off. Rahul Kumar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul', rank: 'Flying Officer',
    title: 'Hydraulic Systems Fundamentals Quiz', submitted: '2025-01-14T14:00:00Z',
    questions: [
      { id: 'q4', question: 'List the main components of the dual hydraulic system.', answer: 'Two engine-driven pumps, electric backup pump, reservoirs, accumulators, filters, and distribution manifolds. System 1 powers primary flight controls, System 2 powers secondary systems.', maxScore: 10 },
      { id: 'q5', question: 'What is the normal hydraulic pressure and what action is required if pressure drops below minimum?', answer: 'Normal is 3000 PSI. Below 2400 PSI requires system isolation and switching to backup. Below 1800 PSI requires emergency procedures.', maxScore: 10 },
    ],
  },
  {
    id: 'pa3', trainee: 'Flt. Lt. Neha Gupta', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha', rank: 'Flight Lieutenant',
    title: 'Emergency Procedures - Fire Drill Assessment', submitted: '2025-01-14T11:00:00Z',
    questions: [
      { id: 'q6', question: 'Outline the immediate actions for an engine fire in flight.', answer: 'Throttle idle, confirm fire, fuel cutoff OFF, fire extinguisher discharge, monitor for 30 seconds. If fire persists, declare MAYDAY and execute emergency landing.', maxScore: 10 },
      { id: 'q7', question: 'What are the differences between engine fire and APU fire procedures?', answer: 'Engine fire requires fuel cutoff and fire extinguisher. APU fire requires APU shutdown switch and dedicated APU fire bottle. APU fire is generally less critical as APU is not required for flight.', maxScore: 10 },
      { id: 'q8', question: 'Describe the post-landing actions after an engine fire event.', answer: 'Evacuate aircraft if fire persists. Notify ground crew. Shut down remaining engine. Complete fire checklist. Do not attempt restart without maintenance inspection.', maxScore: 10 },
    ],
  },
];

const gradedHistory = [
  { trainee: 'Flt. Lt. Arjun Singh', title: 'Avionics Overview Quiz', score: 82, date: '2025-01-13' },
  { trainee: 'Fg. Off. Rahul Kumar', title: 'Pre-flight Procedures', score: 68, date: '2025-01-12' },
  { trainee: 'Flt. Lt. Neha Gupta', title: 'Navigation Systems', score: 94, date: '2025-01-11' },
  { trainee: 'Flt. Lt. Arjun Singh', title: 'CRM Fundamentals', score: 76, date: '2025-01-10' },
];

export default function InstructorGradingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<PendingAssessment | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleScoreChange = (qId: string, score: number) => {
    setScores(prev => ({ ...prev, [qId]: score }));
  };

  const handleSubmitGrade = () => {
    if (!selected) return;
    setSubmitted(prev => new Set([...prev, selected.id]));
    setSelected(null);
    setScores({});
    setComments('');
  };

  const getTotalScore = () => {
    if (!selected) return 0;
    return selected.questions.reduce((sum, q) => sum + (scores[q.id] || 0), 0);
  };

  const getMaxScore = () => {
    if (!selected) return 0;
    return selected.questions.reduce((sum, q) => sum + q.maxScore, 0);
  };

  const pending = pendingAssessments.filter(a => !submitted.has(a.id));

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader title="Assessment Grading" subtitle="Review and grade trainee assessment submissions" icon={ClipboardCheck} />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-af-orange/10 group-hover:bg-af-orange/20 transition-colors">
                <Clock className="w-5 h-5 text-af-orange" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pending</p>
                <p className="text-2xl font-black text-slate-900">
                  <CountUp value={pending.length} />
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-af-green/10 group-hover:bg-af-green/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-af-green" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Graded Today</p>
                <p className="text-2xl font-black text-slate-900">
                  <CountUp value={submitted.size + 5} />
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-af-blue/10 group-hover:bg-af-blue/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-af-blue" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Avg Score</p>
                <p className="text-2xl font-black text-slate-900">
                  <CountUp value={76} suffix="%" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Assessments List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pending Assessments</h3>
            {pending.map(assessment => (
              <Card
                key={assessment.id}
                onClick={() => { setSelected(assessment); setScores({}); setComments(''); }}
                className={cn('bg-white border-slate-200 shadow-sm cursor-pointer hover:border-af-orange/40 hover:shadow-md transition-all', selected?.id === assessment.id && 'border-af-orange ring-2 ring-af-orange/20')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={assessment.avatar} alt={assessment.trainee} className="w-9 h-9 rounded-full bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{assessment.trainee}</p>
                      <p className="text-[10px] text-slate-400">{assessment.rank}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-2">{assessment.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(assessment.submitted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Graded History */}
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-6">Recently Graded</h3>
            {gradedHistory.map((g, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-900">{g.trainee}</p>
                  <p className="text-[10px] text-slate-400">{g.title}</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-sm font-black', g.score >= 80 ? 'text-af-green' : g.score >= 60 ? 'text-af-orange' : 'text-red-500')}>
                    <CountUp value={g.score} suffix="%" />
                  </span>
                  <p className="text-[10px] text-slate-400">{new Date(g.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Grading Panel */}
          <div className="lg:col-span-2">
            {selected ? (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={selected.avatar} alt={selected.trainee} className="w-10 h-10 rounded-full bg-slate-100" />
                      <div>
                        <CardTitle className="text-lg text-slate-900">{selected.title}</CardTitle>
                        <p className="text-xs text-slate-400">{selected.trainee} - {selected.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-af-blue">{getTotalScore()}/{getMaxScore()}</p>
                      <p className="text-[10px] text-slate-400 uppercase">Total Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {selected.questions.map((q, i) => (
                    <div key={q.id} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-af-blue uppercase">Question {i + 1}</p>
                          <p className="text-sm font-medium text-slate-900 mt-1">{q.question}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">Max: {q.maxScore}</Badge>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Trainee Answer</p>
                        <p className="text-sm text-slate-700">{q.answer}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">Score:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: q.maxScore + 1 }, (_, s) => (
                            <button
                              key={s}
                              onClick={() => handleScoreChange(q.id, s)}
                              className={cn(
                                'w-8 h-8 rounded-lg text-xs font-bold border transition-all',
                                scores[q.id] === s
                                  ? 'bg-af-blue text-white border-af-blue shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-af-blue/50'
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Comments */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Overall Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide feedback to the trainee..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-af-blue/20 resize-none h-24"
                    />
                  </div>

                  <Button className="w-full bg-af-orange text-white hover:bg-af-orange/90 font-bold" onClick={handleSubmitGrade}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Grade ({getTotalScore()}/{getMaxScore()} - {getMaxScore() > 0 ? Math.round((getTotalScore() / getMaxScore()) * 100) : 0}%)
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-slate-200 shadow-sm h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Select an Assessment</p>
                  <p className="text-xs text-slate-400 mt-1">Choose a pending assessment from the left to begin grading</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
