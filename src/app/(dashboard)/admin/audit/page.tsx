'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuditLogs } from '@/lib/admin';
import { auditLogs as mockAuditLogs } from '@/data/mockData';
import { ClipboardList, Filter, Download, Terminal, User, Clock, Shield, Database } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import type { AuditLog } from '@/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { logs: logData } = await getAuditLogs({ limit: 100 });
        setLogs(logData?.length ? logData : mockAuditLogs);
        await new Promise(r => setTimeout(r, 600));
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        setLogs(mockAuditLogs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Tactical Audit Trail"
          subtitle="Chronological record of system-wide security and administrative operations"
          icon={ClipboardList}
          actions={
            <div className="flex gap-3">
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Filter className="w-4 h-4 mr-2 text-af-blue" />
                Filter Intelligence
              </Button>
              <Button className="bg-af-blue text-white hover:bg-af-navy shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          }
        />

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-af-blue" />
                  <CardTitle className="text-sm font-mono text-af-blue uppercase tracking-tighter">System Terminal Output</CardTitle>
              </div>
              <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-af-green/10 border border-af-green/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-af-green animate-pulse" />
                    <span className="text-[10px] text-af-green font-mono uppercase font-bold tracking-widest">Live Monitoring Active</span>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="py-4 px-6 font-bold uppercase tracking-widest">Protocol Index</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest text-af-blue">Time Sequence</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest">Authorized Personnel</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest">Security Module</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-widest">Operation Detail</th>
                    <th className="py-4 px-2 font-bold uppercase tracking-widest">Uplink IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-af-blue/5 transition-all group border-l-2 border-transparent hover:border-af-blue">
                      <td className="py-4 px-6">
                        <span className="text-slate-400">LOG-SEQ-</span>
                        <span className="text-slate-900 font-bold font-mono tracking-tighter">{log.id.substring(0, 8)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-af-blue opacity-50" />
                            <span className="text-af-blue">{formatRelativeTime(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center p-1 border border-slate-200">
                              <User className="w-3 h-3 text-af-blue" />
                           </div>
                           <span className="text-slate-700 uppercase font-bold tracking-tight">{log.userName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                         <div className="flex items-center gap-2">
                            {log.module === 'Admin' ? <Shield className="w-3.5 h-3.5 text-af-blue" /> : <Database className="w-3.5 h-3.5 text-slate-400" />}
                            <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-widest ${
                                log.module === 'Admin' ? 'bg-af-blue/10 border-af-blue/20 text-af-blue' : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>{log.module}</span>
                         </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900 group-hover:text-af-blue transition-colors">{log.action}</p>
                        <p className="text-slate-400 text-[10px] mt-1 font-mono italic">{log.details}</p>
                      </td>
                      <td className="py-4 px-2">
                         <span className="text-slate-400 font-mono italic select-all cursor-copy">{log.ipAddress}</span>
                      </td>
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
