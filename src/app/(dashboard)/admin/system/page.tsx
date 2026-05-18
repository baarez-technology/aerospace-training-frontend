'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSystemStatus, updateSystemStatus } from '@/lib/admin';
import { systemStatus as mockSystemStatus } from '@/data/mockData';
import { Settings, Server, Activity, RefreshCw, Cpu, Database, HardDrive, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import type { SystemStatus } from '@/types';

export default function AdminSystemPage() {
  const [services, setServices] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSystemStatus();
        setServices(data?.length ? data : mockSystemStatus);
        await new Promise(r => setTimeout(r, 600));
      } catch (error) {
        console.error('Failed to fetch system status:', error);
        setServices(mockSystemStatus);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleStatusChange = async (service: string, status: 'operational' | 'degraded' | 'down') => {
    try {
      const updated = await updateSystemStatus({ service, status });
      setServices(services.map(s => s.service === service ? updated : s));
    } catch (error) {
      console.error('Failed to update system status:', error);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="System Configuration"
          subtitle="Monitor system health, service availability, and hardware status"
          icon={Settings}
          actions={
            <Button className="bg-af-blue text-white hover:bg-af-blue/90 shadow-md">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Services
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
             <Card key={service.service} className="bg-white border-slate-200 hover:border-af-blue transition-colors shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        service.status === 'operational' ? 'bg-iaf-success/10 text-iaf-success' :
                        service.status === 'degraded' ? 'bg-iaf-warning/10 text-iaf-warning' :
                        'bg-iaf-alert/10 text-iaf-alert'
                      }`}>
                         <Server className="w-5 h-5" />
                      </div>
                      <div>
                         <CardTitle className="text-sm font-bold text-slate-900">{service.service}</CardTitle>
                         <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">Uptime: {service.uptime}</p>
                      </div>
                   </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${service.status === 'operational' ? 'text-af-green' : 'text-slate-500'}`}
                        onClick={() => handleStatusChange(service.service, 'operational')}
                      >
                         <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${service.status === 'degraded' ? 'text-af-yellow' : 'text-slate-500'}`}
                         onClick={() => handleStatusChange(service.service, 'degraded')}
                      >
                         <AlertTriangle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${service.status === 'down' ? 'text-af-orange' : 'text-slate-500'}`}
                         onClick={() => handleStatusChange(service.service, 'down')}
                      >
                         <XCircle className="w-4 h-4" />
                      </Button>
                   </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between bg-slate-50 py-3 px-4 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-mono">SIGNAL STRENGTH</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-af-blue' : 'bg-af-blue/20'}`} />
                          ))}
                        </div>
                    </div>
                </CardContent>
             </Card>
          ))}
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2">
                  <Cpu className="w-5 h-5 text-af-blue" />
                  <CardTitle className="text-lg text-slate-900 uppercase tracking-widest font-bold">Hardware Load</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-700 uppercase font-bold tracking-tighter">
                          <span>CPU Core Optimization</span>
                          <span className="text-af-blue font-bold">42.8%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-af-blue" style={{ width: '42.8%' }} />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-700 uppercase font-bold tracking-tighter">
                          <span>RAM Memory Allocation</span>
                          <span className="text-slate-600 font-bold">68.2%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-slate-400" style={{ width: '68.2%' }} />
                      </div>
                  </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2">
                  <Database className="w-5 h-5 text-af-green" />
                  <CardTitle className="text-lg text-slate-900 uppercase tracking-widest font-bold">Infrastructure Hub</CardTitle>
              </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-2 text-center">
                          <HardDrive className="w-6 h-6 text-slate-400" />
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Storage Status</p>
                          <p className="text-sm font-bold text-slate-900">8.2 TB / 12 TB</p>
                      </div>
                       <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-2 text-center">
                          <Activity className="w-6 h-6 text-af-green" />
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Network Latency</p>
                          <p className="text-sm font-bold text-slate-900">12ms (HQ Link)</p>
                      </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </PageTransition>
  );
}
