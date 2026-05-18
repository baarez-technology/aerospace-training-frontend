'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { CountUp } from '@/components/ui/CountUp';
import {
  Brain,
  Users,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Wrench,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const topUsers = [
  { name: 'Flt. Lt. Arjun Singh', role: 'Trainee', queries: 342, tokens: '285K', lastActive: '2 min ago' },
  { name: 'Wing Cdr. Vikram Rao', role: 'Instructor', queries: 218, tokens: '195K', lastActive: '15 min ago' },
  { name: 'Fg. Off. Rahul Kumar', role: 'Trainee', queries: 189, tokens: '156K', lastActive: '1 hour ago' },
  { name: 'Flt. Lt. Neha Gupta', role: 'Trainee', queries: 156, tokens: '132K', lastActive: '3 hours ago' },
  { name: 'Gp. Capt. Priya Sharma', role: 'Admin', queries: 87, tokens: '72K', lastActive: '1 day ago' },
];

const dailyUsage = [
  { day: 'Mon', queries: 1842, tokens: 348 },
  { day: 'Tue', queries: 2156, tokens: 412 },
  { day: 'Wed', queries: 1923, tokens: 367 },
  { day: 'Thu', queries: 2341, tokens: 445 },
  { day: 'Fri', queries: 1756, tokens: 334 },
  { day: 'Sat', queries: 892, tokens: 170 },
  { day: 'Sun', queries: 637, tokens: 121 },
];

const categories = [
  { label: 'Technical Queries', value: 45, icon: Wrench, color: 'bg-af-blue' },
  { label: 'Procedures', value: 30, icon: BookOpen, color: 'bg-af-orange' },
  { label: 'Emergency', value: 15, icon: AlertTriangle, color: 'bg-red-500' },
  { label: 'General', value: 10, icon: MessageSquare, color: 'bg-slate-400' },
];

export default function AIAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const maxQueries = Math.max(...dailyUsage.map(d => d.queries));

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Usage Analytics"
          subtitle="Monitor AI assistant usage, token consumption, and query patterns"
          icon={Brain}
          actions={
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
            </select>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Total Queries" value={12847} subtitle="Across all users" icon={MessageSquare} trend={{ value: 12, isPositive: true }} />
          <DashboardCard title="Active Users" value={156} subtitle="Using AI assistant" icon={Users} />
          <DashboardCard title="Avg Response Time" value="1.2s" subtitle="P95 latency" icon={Clock} variant="glow" />
          <DashboardCard title="Token Usage" value="2.4M" subtitle="of 5M monthly quota" icon={Zap} trend={{ value: 8, isPositive: false }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage Trend Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-af-blue" />
                  Daily Usage Trend
                </CardTitle>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-af-blue/60 rounded" /><span className="text-slate-500">Queries</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-af-orange/60 rounded" /><span className="text-slate-500">Tokens (K)</span></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-end justify-between gap-4">
                  {dailyUsage.map((d, index) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center gap-1">
                        <motion.div
                          className="w-5 bg-af-blue/60 rounded-t transition-all hover:bg-af-blue"
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.queries / maxQueries) * 180}px` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                        <motion.div
                          className="w-5 bg-af-orange/60 rounded-t transition-all hover:bg-af-orange"
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.tokens / maxQueries) * 180}px` }}
                          transition={{ duration: 1, delay: (index * 0.1) + 0.1 }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{d.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Query Categories */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 font-bold">Query Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900"><CountUp value={cat.value} suffix="%" /></span>
                    </div>
                    <ProgressBar value={cat.value} size="sm" showLabel={false} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Cost Tracking + Top Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cost Tracking */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-af-green" />
                Cost Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Monthly Cost</span>
                  <span className="text-lg font-black text-slate-900">$142.50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Daily Average</span>
                  <span className="text-lg font-black text-slate-900">$4.75</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-af-green/5 rounded-lg border border-af-green/20">
                  <span className="text-sm text-slate-500">Budget Remaining</span>
                  <span className="text-lg font-black text-af-green">$357.50</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Budget Usage</span>
                  <span className="font-bold text-slate-600">$142.50 / $500</span>
                </div>
                <ProgressBar value={28} size="sm" showLabel={false} />
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-af-orange" />
                  Top Users
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="text-left py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Queries</th>
                        <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tokens</th>
                        <th className="text-right py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsers.map((user) => (
                        <tr key={user.name} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-900">{user.name}</td>
                          <td className="py-3 px-5">
                            <span className={cn(
                              'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                              user.role === 'Trainee' ? 'bg-af-green/10 text-af-green border-af-green/20' :
                              user.role === 'Instructor' ? 'bg-af-orange/10 text-af-orange border-af-orange/20' :
                              'bg-af-blue/10 text-af-blue border-af-blue/20'
                            )}>{user.role}</span>
                          </td>
                          <td className="py-3 px-5 text-right font-bold text-slate-700">{user.queries}</td>
                          <td className="py-3 px-5 text-right text-slate-500">{user.tokens}</td>
                          <td className="py-3 px-5 text-right text-xs text-slate-400">{user.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
