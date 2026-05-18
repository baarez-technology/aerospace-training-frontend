'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '@/lib/admin';
import { users as mockUsers } from '@/data/mockData';
import {
  Users,
  Mail,
  UserPlus,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data?.length ? data : mockUsers);
      await new Promise(r => setTimeout(r, 600));
    } catch (error) {
      console.error('Failed to fetch users, using demo data:', error);
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    try {
      if (selectedUser) {
        await updateAdminUser(selectedUser.id, data);
        toast.success('Personnel file updated successfully.');
      } else {
        await createAdminUser(data);
        toast.success('New personnel registered in the system.');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync with personnel records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteAdminUser(selectedUser.id);
      toast.success('Personnel record purged from the system.');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete personnel record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.rank || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Personnel Management"
          subtitle="Operational control over platform users, ranks, and access authorizations"
          icon={Users}
          actions={
            <Button
              className="bg-af-blue text-white hover:bg-af-blue/90 shadow-md transition-all duration-300"
              onClick={() => {
                setSelectedUser(null);
                setIsModalOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Enlist Personnel
            </Button>
          }
        />

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-af-blue transition-colors" />
            <Input
              placeholder="Search by name, email, or rank..."
              className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-af-blue/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-900">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="all">All Personnel</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="trainee">Trainee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                    <th className="py-4 px-6">Personnel Info</th>
                    <th className="py-4 px-6">Service Record</th>
                    <th className="py-4 px-6">Authorized Role</th>
                    <th className="py-4 px-6">Last Active</th>
                    <th className="py-4 px-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 px-6 text-center text-slate-500 italic">
                        No personnel matching current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-af-blue/5 transition-all group relative border-l-2 border-transparent hover:border-af-blue">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-af-blue/10 border-2 border-af-blue/20 flex items-center justify-center text-af-blue font-bold text-lg shadow-sm group-hover:bg-af-blue group-hover:text-white transition-all duration-300">
                                {user.email?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-af-green border-2 border-white shadow-sm" title="Synchronized" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-af-blue transition-colors">{user.name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-slate-900 font-semibold">{user.rank || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{user.squadron || 'UNASSIGNED'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-4 h-4 ${
                              user.role === 'admin' ? 'text-iaf-gold' :
                              user.role === 'instructor' ? 'text-iaf-cyan' :
                              'text-af-green'
                            }`} />
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              user.role === 'admin' ? 'bg-iaf-gold/10 border-iaf-gold/20 text-iaf-gold shadow-[0_0_5px_rgba(234,179,8,0.2)]' :
                              user.role === 'instructor' ? 'bg-iaf-cyan/10 border-iaf-cyan/20 text-iaf-cyan' :
                              'bg-af-green/10 border-af-green/20 text-af-green'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatRelativeTime(user.lastActive)}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-af-blue hover:bg-af-blue/10"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-af-orange hover:bg-af-orange/10"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-af-orange">
                {selectedUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {selectedUser ? 'Modify Personnel Record' : 'Enlist New Personnel'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 italic font-mono text-[10px] uppercase">
                Authenticated Access Authorization Required
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateOrUpdate} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-slate-500 font-bold">Full Identification</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedUser?.name}
                    required
                    className="bg-white border-slate-200"
                    placeholder="e.g. Flight Lt. Arjun Singh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-iaf-sky/70">Secure Email (SIPR)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser?.email}
                    required
                    className="bg-white border-slate-200 font-mono"
                    placeholder="name@iaf.gov.in"
                  />
                </div>
              </div>

              {!selectedUser && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-iaf-sky/70">Encryption Key (Password)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="bg-white border-slate-200 font-mono"
                    placeholder="Minimum 12 characters"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs uppercase tracking-widest text-slate-500 font-bold">Authorization Level</Label>
                  <Select name="role" defaultValue={selectedUser?.role || 'trainee'}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="trainee">Trainee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank" className="text-xs uppercase tracking-widest text-slate-500 font-bold">Current Rank</Label>
                  <Input
                    id="rank"
                    name="rank"
                    defaultValue={selectedUser?.rank}
                    className="bg-white border-slate-200"
                    placeholder="e.g. Flight Lieutenant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="squadron" className="text-xs uppercase tracking-widest text-slate-500 font-bold">Squadron Assignment</Label>
                  <Input
                    id="squadron"
                    name="squadron"
                    defaultValue={selectedUser?.squadron}
                    className="bg-white border-slate-200"
                    placeholder="e.g. No. 1 Squadron"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base" className="text-xs uppercase tracking-widest text-slate-500 font-bold">Home Base Station</Label>
                  <Input
                    id="base"
                    name="base"
                    defaultValue={selectedUser?.base}
                    className="bg-white border-slate-200"
                    placeholder="e.g. Ambala AFS"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:bg-slate-50"
                >
                  Aborted Action
                </Button>
                <Button
                  type="submit"
                  className="bg-af-blue text-white hover:bg-af-blue/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Confirm Authorization
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="bg-white border-red-200 text-slate-900 max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-red-600">
                <AlertTriangle className="w-6 h-6" />
                CRITICAL: Purge Personnel Record
              </DialogTitle>
              <DialogDescription className="text-slate-600 pt-4 leading-relaxed">
                Are you certain you wish to purge the personnel records for <span className="text-af-orange font-bold font-mono">{selectedUser?.name}</span>?
                This action is permanent and will revoke all system authorizations.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-6">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-500 hover:bg-slate-50"
              >
                Cancel Purge
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                disabled={isSubmitting}
                onClick={handleDelete}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Confirm Purge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
