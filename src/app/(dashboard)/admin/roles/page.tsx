'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRoles, createRole, updateRole, deleteRole } from '@/lib/admin';
import { roles as mockRoles } from '@/data/mockData';
import {
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTransition } from '@/components/ui/PageTransition';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import type { Role, Permission } from '@/types';

// Mock available permissions based on system modules
const ALL_AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'p1', name: 'view_courses', description: 'View training courses', module: 'Training' },
  { id: 'p2', name: 'take_modules', description: 'Access training modules', module: 'Training' },
  { id: 'p3', name: 'view_progress', description: 'View own progress', module: 'Analytics' },
  { id: 'p4', name: 'run_simulations', description: 'Run simulations', module: 'Simulation' },
  { id: 'p5', name: 'manage_trainees', description: 'Manage trainee progress', module: 'Training' },
  { id: 'p6', name: 'create_content', description: 'Create training content', module: 'Content' },
  { id: 'p7', name: 'view_analytics', description: 'View training analytics', module: 'Analytics' },
  { id: 'p8', name: 'manage_sessions', description: 'Schedule training sessions', module: 'Training' },
  { id: 'p9', name: 'manage_users', description: 'Manage system users', module: 'Admin' },
  { id: 'p10', name: 'manage_roles', description: 'Configure roles', module: 'Admin' },
  { id: 'p11', name: 'view_audit_logs', description: 'View audit logs', module: 'Security' },
  { id: 'p12', name: 'system_config', description: 'Configure system settings', module: 'System' },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    selectedPermissionIds: [] as string[]
  });

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await getRoles();
      setRoles(data?.length ? data : mockRoles);
      await new Promise(r => setTimeout(r, 600));
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setRoles(mockRoles);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role: Role | null = null) => {
    setSelectedRole(role);
    if (role) {
      setFormData({
        name: role.name,
        selectedPermissionIds: role.permissions.map(p => p.id)
      });
    } else {
      setFormData({
        name: '',
        selectedPermissionIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissionIds: prev.selectedPermissionIds.includes(permId)
        ? prev.selectedPermissionIds.filter(id => id !== permId)
        : [...prev.selectedPermissionIds, permId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role Identification Name is required.');
      return;
    }

    setIsSubmitting(true);
    const permissions = ALL_AVAILABLE_PERMISSIONS.filter(p => formData.selectedPermissionIds.includes(p.id));

    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, { name: formData.name, permissions });
        toast.success('Access Authorization Revised.');
      } else {
        await createRole({ name: formData.name, permissions });
        toast.success('New Authorization Role Deployed.');
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Operation synchronization failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await deleteRole(selectedRole.id);
      toast.success('Authorization Role Nullified.');
      setIsDeleteModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to purge role record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group permissions by module for the UI
  const groupedPermissions = ALL_AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Access Control Matrix"
          subtitle="Define tactical authorization levels and module-specific operational permissions"
          icon={Shield}
          actions={
            <Button
              className="bg-af-blue text-white hover:bg-af-midnight"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Initialize Role
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="bg-white border-slate-200 hover:shadow-lg hover:shadow-af-blue/10 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-af-blue hover:bg-af-blue/10"
                  onClick={() => handleOpenModal(role)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-af-orange hover:bg-af-orange/10"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                  role.name === 'Administrator' ? 'bg-iaf-gold/10 border-iaf-gold/30 text-iaf-gold' :
                  role.name === 'Instructor' ? 'bg-iaf-cyan/10 border-iaf-cyan/30 text-iaf-cyan' :
                  'bg-af-green/10 border-af-green/30 text-af-green'
                }`}>
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 font-bold tracking-tight">{role.name}</CardTitle>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-mono uppercase tracking-widest">
                    <Users className="w-3 h-3 text-af-blue" />
                    {role.userCount} Assigned
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Privilege Matrix</p>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                      {role.permissions.length} Enabled
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {role.permissions.map((perm: any) => (
                      <span key={perm.id} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:border-af-blue/40 transition-colors">
                        {perm.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-af-blue/20 to-transparent" />
            </Card>
          ))}
        </div>

        {/* Initialize/Modify Role Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="p-6 border-b border-slate-100">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-af-blue">
                {selectedRole ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6 text-iaf-gold" />}
                {selectedRole ? 'Modify Authorization Level' : 'Initialize Command Role'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 italic font-mono text-[10px] uppercase tracking-[0.1em]">
                Establishing security protocols for system operational access
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <Label htmlFor="roleName" className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Role Intelligence ID (Name)</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iaf-gold/50" />
                  <Input
                    id="roleName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-white border-slate-200 pl-10 focus:border-af-blue/50 transition-all font-bold tracking-wide"
                    placeholder="e.g. MISSION_CONTROL_DIRECTOR"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-af-orange flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Privilege Allocation
                  </h4>
                  <p className="text-[10px] text-slate-400 italic">Select individual module authorizations</p>
                </div>

                <div className="space-y-8">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-af-blue" />
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{module} Module</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-af-blue/30 ${
                              formData.selectedPermissionIds.includes(perm.id)
                                ? 'bg-af-blue/5 border-af-blue/40 shadow-[inset_0_0_10px_rgba(0,48,143,0.05)]'
                                : 'bg-white border-slate-200'
                            }`}
                            onClick={() => handleTogglePermission(perm.id)}
                          >
                            <Checkbox
                              id={perm.id}
                              checked={formData.selectedPermissionIds.includes(perm.id)}
                              className="border-slate-300 data-[state=checked]:bg-af-blue data-[state=checked]:border-af-blue"
                              onCheckedChange={() => handleTogglePermission(perm.id)}
                            />
                            <div className="flex flex-col">
                              <Label
                                htmlFor={perm.id}
                                className="text-[11px] font-bold cursor-pointer text-slate-900 leading-none"
                              >
                                {perm.name}
                              </Label>
                              <span className="text-[9px] text-slate-500 mt-1 leading-tight">{perm.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              >
                Abort Mission
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-af-blue text-white hover:bg-af-navy font-bold px-8 shadow-[0_0_20px_rgba(0,48,143,0.1)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                Deploy Protocol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Nullification Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="bg-white border-red-200 text-slate-900 max-w-md p-6 shadow-2xl">
            <DialogHeader className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-2 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-center text-red-600">
                TERMINAL ACTION: Nullify Role
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-center leading-relaxed">
                Are you certain you wish to purge authorization role <span className="text-af-orange font-black uppercase">{selectedRole?.name}</span>?
                This will immediately revoke access for all <span className="text-af-blue font-bold">{selectedRole?.userCount}</span> assigned personnel.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                Cancel Operation
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.3)] font-bold tracking-wider"
                disabled={isSubmitting}
                onClick={handleDelete}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Confirm Purge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
