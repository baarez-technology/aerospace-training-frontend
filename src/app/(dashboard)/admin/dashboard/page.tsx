'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { PageTransition } from '@/components/ui/PageTransition';
import { getAdminDashboard, getSystemStatus, type AdminDashboardData } from '@/lib/admin';
import { getRoles } from '@/lib/admin';
import { roles as mockRoles, systemStatus as mockSystemStatus, auditLogs as mockAuditLogs, analyticsData as mockAnalyticsData } from '@/data/mockData';
import { formatRelativeTime } from '@/lib/utils';
import { CountUp } from '@/components/ui/CountUp';
import type { Role, SystemStatus } from '@/types';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Activity,
  Server,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Terminal,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dash, rolesData, statusData] = await Promise.all([
          getAdminDashboard().catch(() => null),
          getRoles().catch(() => null),
          getSystemStatus().catch(() => null),
        ]);
        const resolvedDash = dash ?? {
          totalUsers: 188,
          totalTrainees: 156,
          totalInstructors: 24,
          recentAuditLogs: mockAuditLogs,
          systemStatus: mockSystemStatus,
          charts: mockAnalyticsData,
        };
        if (!resolvedDash.recentAuditLogs?.length) {
          resolvedDash.recentAuditLogs = mockAuditLogs;
        }
        setDashboardData(resolvedDash);
        // Augment backend roles with mock permissions/userCount for display
        const resolvedRoles = (rolesData?.length ? rolesData : mockRoles).map((r: any) => {
          const mock = mockRoles.find(m => m.name.toLowerCase() === r.name?.toLowerCase());
          return {
            ...r,
            permissions: r.permissions?.length ? r.permissions : (mock?.permissions ?? []),
            userCount: r.userCount ?? (mock?.userCount ?? 0),
          };
        });
        setRoles(resolvedRoles);
        setSystemStatus(statusData?.length ? statusData : mockSystemStatus);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setDashboardData({
          totalUsers: 188,
          totalTrainees: 156,
          totalInstructors: 24,
          recentAuditLogs: mockAuditLogs,
          systemStatus: mockSystemStatus,
          charts: mockAnalyticsData,
        });
        setRoles(mockRoles.map((r: any) => ({ ...r, userCount: r.userCount ?? 0 })));
        setSystemStatus(mockSystemStatus);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const activeServices = systemStatus.filter(s => s.status === 'operational').length;
  const degradedServices = systemStatus.filter(s => s.status === 'degraded').length;

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Admin Control Center"
          subtitle="System administration and security management"
          icon={LayoutDashboard}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Users"
            value={dashboardData?.totalUsers ?? 0}
            subtitle="Active platform users"
            icon={Users}
          />
          <DashboardCard
            title="Roles Configured"
            value={roles.length}
            subtitle="Access control roles"
            icon={Shield}
          />
          <DashboardCard
            title="System Status"
            value={`${activeServices}/${systemStatus.length}`}
            subtitle="Services operational"
            icon={Server}
            variant={degradedServices > 0 ? 'warning' : 'success'}
          />
          <DashboardCard
            title="Security Score"
            value="98%"
            subtitle="Platform security rating"
            icon={Lock}
            variant="glow"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Status */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2 font-bold uppercase tracking-tight">
                  <Server className="w-5 h-5 text-af-blue" />
                  System Services
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin/system')}
                  className="text-af-blue hover:text-af-blue/80 hover:bg-af-blue/10 font-bold uppercase tracking-widest text-[10px]"
                >
                  Manage <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {systemStatus.map((service) => (
                    <div
                      key={service.service}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full animate-pulse',
                          service.status === 'operational' && 'bg-af-green shadow-[0_0_8px_rgba(34,197,94,0.5)]',
                          service.status === 'degraded' && 'bg-af-yellow shadow-[0_0_8px_rgba(234,179,8,0.5)]',
                          service.status === 'down' && 'bg-af-orange shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                        )} />
                        <span className="text-sm font-bold text-slate-900 group-hover:text-af-blue transition-colors">{service.service}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-tighter">{service.uptime} uptime</span>
                        <StatusBadge status={service.status} size="sm" showDot={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Audit Logs */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2 font-bold uppercase tracking-tight">
                  <Terminal className="w-5 h-5 text-af-blue" />
                  Recent Activity Logs
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin/audit')}
                  className="text-af-blue hover:text-af-blue/80 hover:bg-af-blue/10 font-bold uppercase tracking-widest text-[10px]"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <div className="divide-y divide-slate-100">
                  {dashboardData?.recentAuditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-af-blue"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-af-blue/5 group-hover:border-af-blue/20 transition-all">
                        <Activity className="w-4 h-4 text-slate-400 group-hover:text-af-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-af-blue transition-colors truncate">{log.action}</span>
                          <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest">• {log.module}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate italic">{log.details}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-900 font-bold">{log.userName.split(' ').pop()}</p>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">{formatRelativeTime(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-af-navy uppercase tracking-widest">Command Center</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-af-blue/10 hover:border-af-blue/30 hover:text-af-blue transition-all duration-300 group h-12 rounded-xl"
                  onClick={() => router.push('/admin/users')}
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-af-blue/20">
                    <Users className="w-4 h-4 text-af-blue group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Personnel Registry</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-af-blue/10 hover:border-af-blue/30 hover:text-af-blue transition-all duration-300 group h-12 rounded-xl"
                  onClick={() => router.push('/admin/roles')}
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-af-blue/20">
                    <Shield className="w-4 h-4 text-af-blue group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Access Protocol</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-af-green/10 hover:border-af-green/30 hover:text-af-green transition-all duration-300 group h-12 rounded-xl"
                  onClick={() => router.push('/admin/security')}
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-af-green/20">
                    <Lock className="w-4 h-4 text-af-green group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Security Firewall</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-af-orange/10 hover:border-af-orange/30 hover:text-slate-900 transition-all duration-300 group h-12 rounded-xl"
                  onClick={() => router.push('/admin/system')}
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-af-orange/20">
                    <Settings className="w-4 h-4 text-slate-500 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">Infrastructure Hub</span>
                </Button>
              </CardContent>
            </Card>

            {/* Role Summary */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-af-navy uppercase tracking-widest">Role Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-af-blue/5 hover:border-af-blue/20 transition-all cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-af-blue transition-colors uppercase tracking-tight">{role.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{role.permissions?.length ?? 0} privilege nodes</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-slate-300 group-hover:text-af-blue transition-colors" />
                        <span className="text-sm font-black text-slate-900"><CountUp value={role.userCount} /></span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Personnel</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-af-navy uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-af-orange" />
                  Status Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-af-green/5 border border-af-green/20 shadow-sm shadow-af-green/5">
                  <CheckCircle className="w-5 h-5 text-af-green" />
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Secure Perimeter</p>
                    <p className="text-[10px] text-slate-500 font-medium">No intrusion attempts detected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-af-blue/5 border border-af-blue/20">
                  <Clock className="w-5 h-5 text-af-blue" />
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">System Pulse</p>
                    <p className="text-[10px] text-slate-500 font-medium">Next maintenance in 4d 12h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
