'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Filter, ChevronRight, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const feedbackEntries = [
  {
    id: 'f1', instructor: 'Wing Cdr. Vikram Rao', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    date: '2025-01-15', category: 'Technical', rating: 4,
    feedback: 'Good understanding of engine start procedures. Demonstrated proper checklist discipline during the simulation. Minor delay in identifying EGT exceedance during startup sequence.',
    improvements: ['Practice identifying abnormal EGT readings faster', 'Review QRH Section 2.4 for engine parameter limits', 'Complete additional simulator session for engine starts'],
  },
  {
    id: 'f2', instructor: 'Wing Cdr. Vikram Rao', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    date: '2025-01-12', category: 'Practical', rating: 5,
    feedback: 'Excellent performance on hydraulic system pre-flight inspection. All checkpoints completed in sequence with proper documentation. Outstanding attention to detail on fluid level checks.',
    improvements: ['Continue maintaining this standard', 'Consider mentoring junior trainees on inspection procedures'],
  },
  {
    id: 'f3', instructor: 'Lead Instructor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor',
    date: '2025-01-10', category: 'CRM', rating: 3,
    feedback: 'Communication during multi-crew exercise needs improvement. Tendency to execute actions without verbal confirmation to crew. Situational awareness was adequate but callouts were inconsistent.',
    improvements: ['Practice standard phraseology from FCOM Vol.4', 'Complete CRM refresher module', 'Focus on challenge-response protocol in next simulation', 'Review crew coordination case studies'],
  },
  {
    id: 'f4', instructor: 'Wing Cdr. Vikram Rao', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    date: '2025-01-08', category: 'Emergency', rating: 4,
    feedback: 'Handled engine fire scenario with composure. Correct procedure execution with only minor sequence deviation. Good decision-making under pressure.',
    improvements: ['Memorize fire drill sequence to reduce checklist dependency', 'Practice single-engine approach procedures'],
  },
  {
    id: 'f5', instructor: 'Lead Instructor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor',
    date: '2025-01-05', category: 'Technical', rating: 3,
    feedback: 'Avionics systems knowledge assessment showed gaps in radar modes and EW suite operation. Theory understanding is developing but needs more study time on advanced systems.',
    improvements: ['Complete Avionics Module 7-9 (Radar Operations)', 'Study N011M BARS radar modes from technical manual', 'Schedule digital twin session for avionics exploration'],
  },
];

const strengths = ['Hydraulic Systems', 'Checklist Discipline', 'Emergency Procedures', 'Pre-flight Inspection'];
const weaknesses = ['CRM Communication', 'Avionics Theory', 'Radar Operations', 'Verbal Callouts'];

const categories = ['All', 'Technical', 'Practical', 'CRM', 'Emergency'];

export default function FeedbackPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All'
    ? feedbackEntries
    : feedbackEntries.filter(f => f.category === selectedCategory);

  const avgRating = (feedbackEntries.reduce((a, f) => a + f.rating, 0) / feedbackEntries.length).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Performance Feedback" subtitle="Review instructor feedback, ratings, and improvement suggestions" icon={MessageSquare} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-af-orange/10 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-black text-af-orange">{avgRating}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Avg Rating</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={cn('w-3.5 h-3.5', s <= Math.round(Number(avgRating)) ? 'text-af-orange fill-af-orange' : 'text-slate-200')} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-af-blue/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-af-blue" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{feedbackEntries.length}</p>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-af-green/10 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-af-green" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{strengths.length}</p>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Strengths</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <Target className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{weaknesses.length}</p>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Areas to Improve</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Feedback List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-colors', selectedCategory === cat ? 'bg-af-blue/10 border-af-blue/50 text-af-blue' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')}>
                {cat}
              </button>
            ))}
          </div>

          {filtered.map(entry => (
            <Card key={entry.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <img src={entry.avatar} alt={entry.instructor} className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{entry.instructor}</span>
                        <Badge variant="outline" className="ml-2 text-[10px]">{entry.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={cn('w-3.5 h-3.5', s <= entry.rating ? 'text-af-orange fill-af-orange' : 'text-slate-200')} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{entry.feedback}</p>
                    {entry.improvements.length > 0 && (
                      <div className="mt-3 p-3 bg-af-blue/5 border border-af-blue/10 rounded-lg">
                        <p className="text-xs font-bold text-af-blue mb-2">Improvement Suggestions</p>
                        <ul className="space-y-1">
                          {entry.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <ChevronRight className="w-3 h-3 text-af-blue mt-0.5 flex-shrink-0" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-af-green" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {strengths.map(s => (
                <div key={s} className="flex items-center gap-2 p-2 bg-af-green/5 rounded-lg border border-af-green/10">
                  <div className="w-2 h-2 rounded-full bg-af-green" />
                  <span className="text-xs font-medium text-slate-700">{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weaknesses.map(w => (
                <div key={w} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs font-medium text-slate-700">{w}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
