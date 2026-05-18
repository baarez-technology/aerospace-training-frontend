'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { BrandLogo } from '@/components/layout/BrandLogo';
import type { User, Alert } from '@/types';
import { getAlerts, markAlertAsRead, clearAlerts } from '@/lib/alerts';
import {
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Plane,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function Navbar({ onMenuToggle, showMenuButton = false }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleClear = async () => {
    try {
      await clearAlerts();
      setAlerts([]);
    } catch (err) {
      console.error('Failed to clear alerts:', err);
    }
  };

  useEffect(() => {
    setUser(getCurrentUser());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    getAlerts().then(data => setAlerts(Array.isArray(data) ? data : [])).catch(console.error);
    const alertTimer = setInterval(() => {
      getAlerts().then(data => setAlerts(Array.isArray(data) ? data : [])).catch(console.error);
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(alertTimer);
    };
  }, []);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'trainee':
        return { label: 'TRAINEE', color: 'bg-af-green/10 text-af-green border-af-green/20' };
      case 'instructor':
        return { label: 'INSTRUCTOR', color: 'bg-af-orange/10 text-af-orange border-af-orange/20' };
      case 'admin':
        return { label: 'ADMIN', color: 'bg-af-blue/10 text-af-blue border-af-blue/20' };
      default:
        return { label: 'USER', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-af-blue transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo - visible on mobile */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <BrandLogo className="h-8 w-auto" />
          </Link>

          {/* Desktop Search Bar */}
          <div className={cn(
            'hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 transition-all hover:bg-white hover:border-af-blue/30 hover:shadow-sm focus-within:bg-white focus-within:border-af-blue/50 focus-within:shadow-md group ml-4',
            showSearch && 'flex absolute left-4 right-4 z-50 bg-white ring-1 ring-slate-200'
          )}>
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-af-blue" />
            <input
              type="text"
              placeholder="Search registries, modules, manuals..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-64 lg:w-96 font-medium"
            />
            {showSearch && (
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-400"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>


        {/* Right Section */}
        <div className="flex items-center justify-end gap-3 lg:gap-6 flex-1">
          {/* Date/Time */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {currentTime.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              {currentTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </span>
          </div>

          {/* Security Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-af-green/10 border border-af-green/10 rounded-full shadow-sm">
            <Shield className="w-3.5 h-3.5 text-af-green" />
            <span className="text-[10px] font-black text-af-green tracking-widest">SECURE</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-af-blue transition-all border border-transparent hover:border-slate-100">
                <Bell className="w-5 h-5" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-af-orange border-2 border-white rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 shadow-2xl rounded-2xl p-2 mt-2">
              <div className="flex items-center justify-between px-3 py-3 border-b border-slate-50 mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Intelligence Feed</span>
                <div className="flex items-center gap-2">
                  {alerts.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="text-[10px] font-bold text-af-blue hover:text-af-blue/80 transition-colors px-2 py-1 rounded hover:bg-af-blue/5"
                    >
                      CLEAR ALL
                    </button>
                  )}
                  <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-100 text-slate-400">{unreadAlerts.length} NEW</Badge>
                </div>
              </div>
              <div className="max-h-[320px] overflow-y-auto space-y-1">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <DropdownMenuItem
                      key={alert.id}
                      onClick={() => {
                        markAlertAsRead(alert.id);
                        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a));
                      }}
                      className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-sm',
                          alert.type === 'critical' ? 'bg-af-orange' : 'bg-af-blue',
                          alert.isRead && 'opacity-0'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate leading-tight">{alert.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{alert.message}</p>
                          <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-tighter flex items-center gap-1">
                             TIMESTAMP: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                       <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">No Intelligence</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Your tactical feed is currently clear.</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-af-blue/10 border-2 border-af-blue/20 flex items-center justify-center text-af-blue font-bold text-xs shadow-sm group-hover:bg-af-blue group-hover:text-white transition-all duration-300">
                      {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-af-green rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-af-blue transition-colors">{user.name}</p>
                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">{user.rank}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-slate-200 shadow-2xl rounded-2xl p-2 mt-2">
                <div className="px-4 py-4 border-b border-slate-50 mb-2">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-12 h-12 rounded-xl bg-af-blue/10 border-2 border-af-blue/20 flex items-center justify-center text-af-blue font-bold text-lg shadow-md">
                        {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || '?'}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{user.email}</p>
                     </div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px] font-black w-full justify-center py-1 tracking-widest', getRoleBadge(user.role).color)}>
                    {getRoleBadge(user.role).label}
                  </Badge>
                </div>
                <DropdownMenuItem className="p-3 text-slate-700 hover:text-af-blue hover:bg-slate-50 rounded-xl cursor-pointer font-bold text-xs gap-3">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Personal Dossier
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 text-slate-700 hover:text-af-blue hover:bg-slate-50 rounded-xl cursor-pointer font-bold text-xs gap-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  Terminal Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 my-1 mx-2" />
                <DropdownMenuItem
                  onClick={() => {
                    import('@/lib/auth').then(({ logout }) => {
                      logout();
                      window.location.href = '/';
                    });
                  }}
                  className="p-3 text-af-orange hover:text-white hover:bg-af-orange rounded-xl cursor-pointer font-black text-xs gap-3 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  SIGN OUT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
