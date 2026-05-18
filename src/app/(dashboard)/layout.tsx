'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Auth check
    const auth = isAuthenticated();
    const user = getCurrentUser();

    if (!auth || !user) {
      router.replace('/');
      return;
    }

    // Role-based access check
    const isTraineeRoute = pathname.startsWith('/trainee');
    const isInstructorRoute = pathname.startsWith('/instructor');
    const isAdminRoute = pathname.startsWith('/admin');

    const traineeRoles = ['trainee', 'instructor', 'admin'];
    const instructorRoles = ['instructor', 'admin'];
    const adminRoles = ['admin'];

    if (isTraineeRoute && !traineeRoles.includes(user.role)) {
      router.replace('/unauthorized');
      return;
    }
    if (isInstructorRoute && !instructorRoles.includes(user.role)) {
      router.replace('/unauthorized');
      return;
    }
    if (isAdminRoute && !adminRoles.includes(user.role)) {
      router.replace('/unauthorized');
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [pathname, router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-af-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-af-navy">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background iaf-grid-pattern">
      {/* Sidebar - hidden on mobile */}
      {!isMobile && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64')
      )}>
        {/* Navbar */}
        <Navbar
          showMenuButton={isMobile}
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && !sidebarCollapsed && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarCollapsed(true)}
          />
          <div className="fixed left-0 top-0 z-50">
            <Sidebar isCollapsed={false} onToggle={() => setSidebarCollapsed(true)} />
          </div>
        </>
      )}
    </div>
  );
}
