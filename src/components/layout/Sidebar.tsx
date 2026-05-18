'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { BrandLogo } from '@/components/layout/BrandLogo';
import type { User } from '@/types';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Cpu,
  Plane,
  Bot,
  Users,
  Calendar,
  Target,
  BarChart3,
  Shield,
  Settings,
  Lock,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Upload,
  Library,
  Brain,
  FileQuestion,
  Video,
  GitBranch,
  MessageSquare,
  Coins,
  ClipboardCheck,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: User['role'][];
}

const navItems: NavItem[] = [
  // Trainee Navigation
  { label: 'Dashboard', href: '/trainee/dashboard', icon: LayoutDashboard, roles: ['trainee'] },
  { label: 'Course Catalog', href: '/trainee/catalog', icon: BookOpen, roles: ['trainee'] },
  { label: 'My Progress', href: '/trainee/progress', icon: GraduationCap, roles: ['trainee'] },
  { label: 'Digital Twin', href: '/trainee/digital-twin', icon: Cpu, roles: ['trainee'] },
  { label: 'Simulation', href: '/trainee/simulation', icon: Plane, roles: ['trainee'] },
  { label: 'Text-to-Video', href: '/trainee/text-to-video', icon: Video, roles: ['trainee'] },
  { label: 'Procedures', href: '/trainee/procedures', icon: GitBranch, roles: ['trainee'] },
  { label: 'Document Library', href: '/trainee/documents', icon: Library, roles: ['trainee'] },
  { label: 'Knowledge Base', href: '/trainee/knowledge', icon: Brain, roles: ['trainee'] },
  { label: 'Assessment Center', href: '/trainee/quiz', icon: FileQuestion, roles: ['trainee'] },
  { label: 'AI Assistant', href: '/trainee/ai-assistant', icon: Bot, roles: ['trainee'] },
  { label: 'Assignments', href: '/trainee/assignments', icon: ClipboardList, roles: ['trainee'] },
  { label: 'Feedback', href: '/trainee/feedback', icon: MessageSquare, roles: ['trainee'] },

  // Instructor Navigation
  { label: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard, roles: ['instructor'] },
  { label: 'Trainees', href: '/instructor/trainees', icon: Users, roles: ['instructor'] },
  { label: 'Upload & Assign', href: '/instructor/content', icon: Upload, roles: ['instructor'] },
  { label: 'Sessions', href: '/instructor/sessions', icon: Calendar, roles: ['instructor'] },
  { label: 'Scenarios', href: '/instructor/scenarios', icon: Target, roles: ['instructor'] },
  { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3, roles: ['instructor'] },
  { label: 'AI Chat', href: '/instructor/ai-chat', icon: Bot, roles: ['instructor'] },
  { label: 'Grading', href: '/instructor/grading', icon: ClipboardCheck, roles: ['instructor'] },
  { label: 'Module Videos', href: '/instructor/modules', icon: Video, roles: ['instructor', 'admin'] },
  { label: 'Video Library', href: '/instructor/video-library', icon: Library, roles: ['instructor', 'admin'] },

  // Admin Navigation
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'Roles', href: '/admin/roles', icon: Shield, roles: ['admin'] },
  { label: 'Security', href: '/admin/security', icon: Lock, roles: ['admin'] },
  { label: 'System', href: '/admin/system', icon: Settings, roles: ['admin'] },
  { label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList, roles: ['admin'] },
  { label: 'AI Analytics', href: '/admin/ai-analytics', icon: Brain, roles: ['admin'] },
  { label: 'Token Usage', href: '/admin/token-usage', icon: Coins, roles: ['admin'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

type RoleAccent = {
  label: string;
  badge: string;
  active: string;
  activeIcon: string;
  activeBorder: string;
  dot: string;
};

const roleConfig: Record<string, RoleAccent> = {
  admin: {
    label: 'Admin Control',
    badge: 'bg-af-blue/10 text-af-blue border border-af-blue/20',
    active: 'bg-af-blue/10 text-af-blue',
    activeIcon: 'text-af-blue',
    activeBorder: 'border-af-blue',
    dot: 'bg-af-blue',
  },
  instructor: {
    label: 'Instructor Console',
    badge: 'bg-af-orange/10 text-af-orange border border-af-orange/20',
    active: 'bg-af-orange/10 text-af-orange',
    activeIcon: 'text-af-orange',
    activeBorder: 'border-af-orange',
    dot: 'bg-af-orange',
  },
  trainee: {
    label: 'Trainee Portal',
    badge: 'bg-af-green/10 text-af-green border border-af-green/20',
    active: 'bg-af-green/10 text-af-green',
    activeIcon: 'text-af-green',
    activeBorder: 'border-af-green',
    dot: 'bg-af-green',
  },
};

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const accent = user ? (roleConfig[user.role] ?? roleConfig.trainee) : roleConfig.trainee;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col',
        'bg-white border-r border-slate-200 shadow-sm',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center h-16 px-5 border-b border-slate-100 flex-shrink-0',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo className="h-9 w-auto flex-shrink-0" />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <p className="text-[10px] font-black text-slate-900 tracking-widest uppercase">IAF Training</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{accent.label}</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="relative">
            <BrandLogo variant="mark" className="h-10 w-10 rounded-xl" />
            <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', accent.dot)} />
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-af-blue transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-af-blue hover:bg-af-blue/5 transition-colors shadow-sm"
          title="Expand sidebar"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {!isCollapsed && (
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-80">
            Registry Control
          </p>
        )}

        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isCollapsed && 'justify-center',
                isActive
                  ? cn(accent.active, 'shadow-sm font-bold ring-1 ring-slate-100')
                  : 'text-slate-500 hover:text-af-blue hover:bg-slate-50 font-medium'
              )}
            >
              <item.icon className={cn(
                'flex-shrink-0 transition-transform duration-200',
                isCollapsed ? 'w-6 h-6' : 'w-5 h-5',
                isActive ? accent.activeIcon : 'text-slate-400 group-hover:scale-110 group-hover:text-af-blue'
              )} />
              {!isCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 shadow-xl z-50">
                  {item.label}
                  <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-100 p-4 space-y-3">
        {user && !isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50/50 border border-slate-100/50 transition-colors">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-af-blue/10 border-2 border-af-blue/20 flex items-center justify-center text-af-blue font-bold text-sm shadow-sm">
                {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-af-green rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{user.rank}</p>
            </div>
            <span className={cn(
              'text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider flex-shrink-0',
              accent.badge
            )}>
              {user.role}
            </span>
          </div>
        )}

        {user && isCollapsed && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-af-blue/10 border-2 border-af-blue/20 flex items-center justify-center text-af-blue font-bold text-base shadow-sm" title={user.name}>
                {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-af-green rounded-full border-2 border-white" />
            </div>
          </div>
        )}

        <button
          onClick={() => {
            import('@/lib/auth').then(({ logout }) => {
              logout();
              window.location.href = '/';
            });
          }}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 group',
            'text-slate-400 hover:text-af-orange hover:bg-af-orange/5 text-sm font-bold',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!isCollapsed && <span>Logout Terminal</span>}
        </button>
      </div>
    </aside>
  );
}
