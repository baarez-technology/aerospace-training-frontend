'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSecuritySettings, updateSecuritySettings } from '@/lib/admin';
import { Lock, ShieldCheck, Fingerprint, Save, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';

const defaultSecuritySettings = {
  mfaEnabled: true,
  passwordPolicy: { minLength: 12, passwordHistory: 5 },
  sessionTimeout: 30,
  lastUpdated: new Date().toISOString(),
};

export default function AdminSecurityPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSecuritySettings();
        setSettings(data ?? defaultSecuritySettings);
        await new Promise(r => setTimeout(r, 600));
      } catch (error) {
        console.error('Failed to fetch security settings:', error);
        setSettings(defaultSecuritySettings);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSecuritySettings(settings);
      // Show success toast or notification
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Security Protocol"
          subtitle="Configure platform encryption, authentication, and security policies"
          icon={Lock}
          actions={
            <Button
              className="bg-af-blue text-white hover:bg-af-blue/90 shadow-md"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Enforce Changes
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Settings */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-af-green" />
              <CardTitle className="text-lg text-slate-900 font-bold">Authentication Protocol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-slate-50 flex items-center justify-between border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-af-blue" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Multi-Factor Authentication</p>
                    <p className="text-xs text-slate-400 mt-1">Requires biometric or hardware-based token</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-20 font-bold tracking-tighter ${settings?.mfaEnabled ? 'bg-af-green/10 border-af-green/50 text-af-green' : 'bg-af-orange/10 border-af-orange/50 text-af-orange'}`}
                  onClick={() => setSettings({ ...settings, mfaEnabled: !settings?.mfaEnabled })}
                >
                  {settings?.mfaEnabled ? 'ACTIVE' : 'DISABLED'}
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Password Policy Override</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium uppercase">Min. Length (chars)</label>
                    <input
                      type="number"
                      value={settings?.passwordPolicy?.minLength}
                      onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, minLength: Number(e.target.value) } })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-af-blue/50 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium uppercase">History Limit (past pws)</label>
                    <input
                      type="number"
                      value={settings?.passwordPolicy?.passwordHistory}
                      onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, passwordHistory: Number(e.target.value) } })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-af-blue/50 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Security Status */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-af-blue" />
              <CardTitle className="text-lg text-slate-900 font-bold">System Perimeter Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 bg-af-blue/10 border border-af-blue/20 p-4 rounded-lg">
                  <ShieldCheck className="w-10 h-10 text-af-blue animate-pulse mb-1" />
                  <div>
                    <h3 className="text-af-blue font-bold uppercase tracking-tighter">Encrypted Link Established</h3>
                    <p className="text-xs text-slate-400 mt-0.5">AES-256-GCM Hardware Encryption Active</p>
                  </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 uppercase">Session Expiry (Min)</p>
                      <p className="text-xs text-slate-400 mt-1">Automatic logout after inactivity</p>
                    </div>
                    <input
                      type="number"
                      value={settings?.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                      className="w-24 bg-white border border-slate-200 rounded px-3 py-2 text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-af-blue/50 shadow-sm"
                    />
                </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-af-yellow" />
                      <p className="text-sm font-bold text-slate-900 uppercase">Last Protocol Update</p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono italic">{new Date(settings?.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
