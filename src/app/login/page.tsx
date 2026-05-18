"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, GraduationCap, UserCog, ClipboardCheck, ShieldCheck } from 'lucide-react';

// ── Demo quick-access accounts ──────────────────────────────────────
// One click → fills these credentials and does a real backend login.
// Credentials are the IAF demo seed (backend: scripts/seed_full.py).
const DEMO_ACCOUNTS = [
  { label: 'Trainee', name: 'Flt Lt. Arjun', email: 'trainee1@aegis.internal', password: 'Aegis@Trainee2026!', icon: GraduationCap },
  { label: 'Instructor', name: 'Wing Cdr. Sharma', email: 'instructor@aegis.internal', password: 'Aegis@Inst2026!', icon: UserCog },
  { label: 'Evaluator', name: 'Sqn Ldr. Patel', email: 'evaluator@aegis.internal', password: 'Aegis@Eval2026!', icon: ClipboardCheck },
  { label: 'Admin', name: 'Platform Admin', email: 'admin@aegis.internal', password: 'Aegis@Admin2026!', icon: ShieldCheck },
];

const ROLE_REDIRECT: Record<string, string> = {
  trainee: '/trainee/dashboard',
  instructor: '/instructor/dashboard',
  admin: '/admin/dashboard',
  evaluator: '/instructor/dashboard',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  const doLogin = async (creds: { email: string; password: string }) => {
    const result = await login(creds);
    if (result.success && result.user) {
      router.push(ROLE_REDIRECT[result.user.role] ?? '/trainee/dashboard');
      return true;
    }
    setError(result.error || 'Login failed');
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await doLogin({ email, password });
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (acct: (typeof DEMO_ACCOUNTS)[number]) => {
    setError('');
    setEmail(acct.email);
    setPassword(acct.password);
    setDemoRole(acct.label);
    setIsLoading(true);
    try {
      await doLogin({ email: acct.email, password: acct.password });
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setDemoRole(null);
    }
  };


  return (
    <div className="min-h-screen bg-background iaf-grid-pattern flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-af-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-af-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center text-center space-y-6">
          <BrandLogo className="h-24 w-auto drop-shadow-sm" />

          <div>
            <h1 className="text-5xl font-bold text-af-navy mb-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              भारतीय वायु सेना
            </h1>
            <h2 className="text-2xl font-semibold text-af-blue iaf-text-glow tracking-wider">
              INDIAN AIR FORCE
            </h2>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-af-navy/90">
              Global Training Intelligence Platform
            </h3>
            <p className="text-sm text-af-midnight/60 max-w-md">
              Advanced AI-driven training system for aircraft systems, digital twins, 
              and mission simulations. Secure, scalable, and mission-ready.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-iaf-success/10 border border-iaf-success/30 rounded-lg">
              <Shield className="w-5 h-5 text-iaf-success" />
              <span className="text-sm text-iaf-success font-medium">Defense Grade Security</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-iaf-cyan/5 border border-af-blue/20 rounded-lg">
              <Lock className="w-5 h-5 text-af-blue" />
              <span className="text-sm text-af-blue font-medium">Encrypted</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="bg-white border-af-gray-light shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center lg:hidden mb-4">
              <BrandLogo className="h-12 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center text-af-navy">
              Secure Login
            </CardTitle>
            <CardDescription className="text-center text-af-midnight/60">
              Enter your credentials to access the training platform
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-iaf-alert/10 border-iaf-alert/50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-af-navy/80">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@iaf.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className="bg-white border-af-gray-light text-af-navy placeholder:text-af-midnight/40 focus:border-af-blue focus:ring-af-blue/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-af-navy/80">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="off"
                    className="bg-white border-af-gray-light text-af-navy placeholder:text-af-midnight/40 focus:border-af-blue focus:ring-af-blue/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-af-midnight/50 hover:text-af-navy"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-af-gray-light bg-white text-af-blue focus:ring-af-blue/20"
                  />
                  <span className="text-sm text-af-midnight/60">Remember me</span>
                </label>
                <a href="#" className="text-sm text-af-blue hover:text-af-midnight">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-af-blue hover:bg-af-midnight text-white font-semibold"
              >
                {isLoading && !demoRole ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            {/* ── One-click demo access ──────────────────────────── */}
            <div className="pt-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-af-gray-light" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-af-midnight/40">
                  Demo Quick Access
                </span>
                <div className="h-px flex-1 bg-af-gray-light" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DEMO_ACCOUNTS.map((acct) => {
                  const Icon = acct.icon;
                  const busy = isLoading && demoRole === acct.label;
                  return (
                    <button
                      key={acct.label}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDemoLogin(acct)}
                      title={`Sign in as ${acct.name} (${acct.label})`}
                      className="group flex flex-col items-center gap-1.5 rounded-xl border border-af-gray-light bg-white p-3 transition-all hover:border-af-blue/40 hover:bg-af-blue/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon className="h-5 w-5 text-af-blue" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-af-navy">
                        {busy ? '...' : acct.label}
                      </span>
                      <span className="text-[9px] font-medium leading-tight text-af-midnight/50">
                        {acct.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-center text-[10px] text-af-midnight/40">
                Instant role-based sign-in for demonstration
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-af-midnight/40">
          © 2024 Indian Air Force. All rights reserved. | Classified System - Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
