'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Lock, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background iaf-grid-pattern flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-iaf-alert/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-iaf-warning/5 rounded-full blur-3xl" />
      </div>

      <Card className="max-w-lg w-full bg-white border-iaf-alert/30 shadow-2xl relative z-10">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-iaf-alert/20 flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-iaf-alert/30 flex items-center justify-center">
                  <ShieldAlert className="w-10 h-10 text-iaf-alert" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-iaf-alert flex items-center justify-center">
                <Lock className="w-4 h-4 text-iaf-alert" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-iaf-alert mb-2">
            Access Denied
          </h1>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Unauthorized Access Attempt
          </h2>

          {/* Message */}
          <p className="text-slate-600 mb-2">
            You do not have the required permissions to access this resource.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            This incident has been logged and reported to the system administrator.
          </p>

          {/* Security Notice */}
          <div className="bg-red-50 border border-iaf-alert/30 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-iaf-alert" />
              <span className="text-sm font-semibold text-iaf-alert">Security Notice</span>
            </div>
            <p className="text-xs text-slate-500">
              Session ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}<br />
              Timestamp: {new Date().toISOString()}<br />
              Classification: RESTRICTED
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push('/trainee/dashboard')}
              className="bg-af-orange hover:bg-af-orange/80 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-slate-400">
          © 2024 Indian Air Force. All rights reserved. | Unauthorized access is a punishable offense
        </p>
      </div>
    </div>
  );
}
