'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { CountUp } from '@/components/ui/CountUp';
import { Coins, Zap, TrendingUp, AlertTriangle, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const dailyCosts = [
  { day: 'Mon', cost: 5.20, tokens: 420000 },
  { day: 'Tue', cost: 6.10, tokens: 492000 },
  { day: 'Wed', cost: 4.80, tokens: 387000 },
  { day: 'Thu', cost: 5.50, tokens: 445000 },
  { day: 'Fri', cost: 4.30, tokens: 347000 },
  { day: 'Sat', cost: 2.10, tokens: 170000 },
  { day: 'Sun', cost: 1.50, tokens: 121000 },
];

const modelBreakdown = [
  { model: 'GPT-4 / OpenRouter', pct: 60, tokens: '1.44M', cost: '$85.50' },
  { model: 'GPT-3.5 Turbo', pct: 30, tokens: '720K', cost: '$42.75' },
  { model: 'Embeddings', pct: 10, tokens: '240K', cost: '$14.25' },
];

const featureBreakdown = [
  { feature: 'AI Assistant', pct: 45, color: 'bg-af-blue' },
  { feature: 'Content Generation', pct: 25, color: 'bg-af-orange' },
  { feature: 'Assessment Gen', pct: 20, color: 'bg-af-green' },
  { feature: 'Other', pct: 10, color: 'bg-slate-400' },
];

const recentCalls = [
  { time: '14:32', user: 'Flt. Lt. Arjun Singh', model: 'GPT-4', tokens: 1250, cost: 0.038 },
  { time: '14:28', user: 'Wing Cdr. Vikram Rao', model: 'GPT-4', tokens: 2340, cost: 0.070 },
  { time: '14:15', user: 'Fg. Off. Rahul Kumar', model: 'GPT-3.5', tokens: 890, cost: 0.002 },
  { time: '14:02', user: 'Flt. Lt. Neha Gupta', model: 'GPT-4', tokens: 1560, cost: 0.047 },
  { time: '13:45', user: 'System', model: 'Embeddings', tokens: 4200, cost: 0.001 },
  { time: '13:30', user: 'Flt. Lt. Arjun Singh', model: 'GPT-3.5', tokens: 650, cost: 0.001 },
];

export default function TokenUsagePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const maxCost = Math.max(...dailyCosts.map(d => d.cost));
  const budgetUsed = 142.50;
  const budgetTotal = 500;
  const budgetPct = Math.round((budgetUsed / budgetTotal) * 100);

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader title="Token Usage & Cost Monitor" subtitle="Track API consumption, costs, and budget utilization" icon={Coins} />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Total Tokens" value="2.4M" subtitle="This billing period" icon={Zap} trend={{ value: 8, isPositive: true }} />
          <DashboardCard title="Monthly Cost" value="$142.50" subtitle="Current month spend" icon={DollarSign} />
          <DashboardCard title="Daily Average" value="$4.75" subtitle="Per day average" icon={TrendingUp} variant="glow" />
          <DashboardCard title="Budget Left" value="$357.50" subtitle={`$${budgetTotal} monthly budget`} icon={Coins} trend={{ value: budgetPct, isPositive: budgetPct < 80 }} />
        </div>

        {/* Budget Alert */}
        {budgetPct > 25 && (
          <Card className={cn('border shadow-sm', budgetPct >= 80 ? 'bg-red-50 border-red-200' : budgetPct >= 50 ? 'bg-af-orange/5 border-af-orange/20' : 'bg-af-green/5 border-af-green/20')}>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className={cn('w-5 h-5', budgetPct >= 80 ? 'text-red-500' : 'text-af-orange')} />
              <div>
                <p className={cn('text-sm font-bold', budgetPct >= 80 ? 'text-red-700' : 'text-af-orange')}>{budgetPct}% of monthly budget used</p>
                <p className="text-xs text-slate-500">{budgetPct >= 80 ? 'Critical: Consider reducing usage or increasing budget' : 'On track for current billing period'}</p>
              </div>
              <div className="ml-auto w-48">
                <ProgressBar value={budgetPct} size="sm" showLabel={false} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Cost Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-af-blue" />
                  Daily Cost (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-4">
                  {dailyCosts.map((d, index) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">${d.cost.toFixed(2)}</span>
                      <motion.div
                        className="w-full bg-af-blue/20 group-hover:bg-af-blue/40 rounded-t transition-all"
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.cost / maxCost) * 140}px` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                      <span className="text-xs font-bold text-slate-400">{d.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model & Feature Breakdown */}
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">By Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modelBreakdown.map((m) => (
                  <div key={m.model} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.model}</p>
                      <p className="text-[10px] text-slate-400">{m.tokens} tokens</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">{m.cost}</p>
                      <p className="text-[10px] text-slate-400">{m.pct}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">By Feature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featureBreakdown.map((f) => (
                  <div key={f.feature}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{f.feature}</span>
                      <span className="font-bold text-slate-900"><CountUp value={f.pct} suffix="%" /></span>
                    </div>
                    <ProgressBar value={f.pct} size="sm" showLabel={false} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent API Calls */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-af-orange" />
              Recent API Calls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase">Time</th>
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase">User</th>
                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase">Model</th>
                    <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase">Tokens</th>
                    <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-5 font-mono text-xs text-slate-400">{call.time}</td>
                      <td className="py-3 px-5 font-bold text-slate-900">{call.user}</td>
                      <td className="py-3 px-5"><Badge variant="outline" className="text-[10px]">{call.model}</Badge></td>
                      <td className="py-3 px-5 text-right text-slate-600">{call.tokens.toLocaleString()}</td>
                      <td className="py-3 px-5 text-right font-bold text-slate-900">${call.cost.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
