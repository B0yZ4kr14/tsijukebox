import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, ShieldAlert, ShieldCheck, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from './SettingsSection';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks';
import type { AppUser, UserRole, UserPermissions, rolePermissions } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface UserFormData {
  username: string;
  password: string;
  role: UserRole;
  customPermissions?: Partial<UserPermissions>;
}

const defaultPermissions: UserPermissions = {
  canAddToQueue: false,
  canRemoveFromQueue: false,
  canModifyPlaylists: false,
  canControlPlayback: true,
  canAccessSettings: false,
  canManageUsers: false,
  canAccessSystemControls: false,
};

/**
 * UserManagementSection Component
 * 
 * User management panel with CRUD operations, role-based permissions, and granular access control.
 * Integrated with TSiJUKEBOX Design System tokens.
 * 
 * @example
 * ```tsx
 * <UserManagementSection />
 * ```
 */
export function UserManagementSection() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'user',
    customPermissions: undefined,
  });

  // Role configuration with design tokens
  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; badgeVariant: 'info' | 'primary' | 'warning' }> = {
    newbie: { 
      label: t('users.roles.newbie'), 
      icon: <Shield className="w-3 h-3" />, 
      badgeVariant: 'info'
    },
    user: { 
      label: t('users.roles.user'), 
      icon: <ShieldCheck className="w-3 h-3" />, 
      badgeVariant: 'primary'
    },
    admin: { 
      label: t('users.roles.admin'), 
      icon: <ShieldAlert className="w-3 h-3" />, 
      badgeVariant: 'warning'
    },
  };

  const roleDescriptions: Record<UserRole, string> = {
    newbie: t('users.roleDescriptions.newbie'),
    user: t('users.roleDescriptions.user'),
    admin: t('users.roleDescriptions.admin'),
  };

  const permissionLabels: Record<keyof UserPermissions, string> = {
    canAddToQueue: 'Adicionar à fila',
    canRemoveFromQueue: 'Remover da fila',
    canModifyPlaylists: 'Modificar playlists',
    canControlPlayback: 'Controlar reprodução',
    canAccessSettings: 'Acessar configurações',
    canManageUsers: 'Gerenciar usuários',
    canAccessSystemControls: 'Controles do sistema',
  };

  useEffect(() => {
    const saved = localStorage.getItem('app_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const defaultUsers: AppUser[] = [
        { id: 'local_tsi', username: 'tsi', role: 'admin', createdAt: new Date().toISOString() },
        { id: 'local_user', username: 'user', role: 'user', createdAt: new Date().toISOString() },
        { id: 'local_guest', username: 'guest', role: 'newbie', createdAt: new Date().toISOString() },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('app_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const saveUsers = (newUsers: AppUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('app_users', JSON.stringify(newUsers));
  };

  const getBasePermissions = (role: UserRole): UserPermissions => {
    const base: Record<UserRole, UserPermissions> = {
      newbie: {
        canAddToQueue: false,
        canRemoveFromQueue: false,
        canModifyPlaylists: false,
        canControlPlayback: true,
        canAccessSettings: false,
        canManageUsers: false,
        canAccessSystemControls: false,
      },
      user: {
        canAddToQueue: true,
        canRemoveFromQueue: true,
        canModifyPlaylists: true,
        canControlPlayback: true,
        canAccessSettings: false,
        canManageUsers: false,
        canAccessSystemControls: false,
      },
      admin: {
        canAddToQueue: true,
        canRemoveFromQueue: true,
        canModifyPlaylists: true,
        canControlPlayback: true,
        canAccessSettings: true,
        canManageUsers: true,
        canAccessSystemControls: true,
      },
    };
    return base[role];
  };

  const handleAddUser = () => {
    if (!formData.username || !formData.password) {
      toast.error(t('users.fillAllFields'));
      return;
    }

    if (users.some(u => u.username === formData.username)) {
      toast.error(t('users.userExists'));
      return;
    }

    const newUser: AppUser = {
      id: `local_${formData.username}_${Date.now()}`,
      username: formData.username,
      role: formData.role,
      createdAt: new Date().toISOString(),
      customPermissions: formData.customPermissions,
    };

    saveUsers([...users, newUser]);
    setShowAddDialog(false);
    setFormData({ username: '', password: '', role: 'user', customPermissions: undefined });
    setPermissionsOpen(false);
    toast.success(t('users.userCreated'));
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    const updated = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, role: formData.role, customPermissions: formData.customPermissions }
        : u
    );

    saveUsers(updated);
    setEditingUser(null);
    setPermissionsOpen(false);
    toast.success(t('users.userUpdated'));
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;

    const admins = users.filter(u => u.role === 'admin');
    if (userToDelete.role === 'admin' && admins.length <= 1) {
      toast.error(t('users.cannotRemoveLastAdmin'));
      setShowDeleteDialog(false);
      setUserToDelete(null);
      return;
    }

    saveUsers(users.filter(u => u.id !== userToDelete.id));
    setShowDeleteDialog(false);
    setUserToDelete(null);
    toast.success(t('users.userRemoved'));
  };

  const openEditDialog = (user: AppUser) => {
    setEditingUser(user);
    setFormData({ 
      username: user.username, 
      password: '', 
      role: user.role,
      customPermissions: user.customPermissions,
    });
    setPermissionsOpen(false);
  };

  const openDeleteDialog = (user: AppUser) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handlePermissionChange = (permission: keyof UserPermissions, value: boolean) => {
    const currentCustom = formData.customPermissions || {};
    setFormData({
      ...formData,
      customPermissions: {
        ...currentCustom,
        [permission]: value,
      },
    });
  };

  const getCurrentPermissionValue = (permission: keyof UserPermissions): boolean => {
    if (formData.customPermissions?.[permission] !== undefined) {
      return formData.customPermissions[permission];
    }
    return getBasePermissions(formData.role)[permission];
  };

  const renderPermissionsSection = () => (
    <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
      <CollapsibleTrigger className={cn(
        "flex items-center justify-between w-full p-3 rounded-lg",
        "bg-bg-tertiary/50 border border-[#333333]",
        "hover:bg-bg-tertiary hover:border-accent-cyan/30",
        "transition-all duration-normal"
      )}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
          <span className="text-brand-gold text-sm font-medium">Permissões Avançadas</span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-text-secondary transition-transform duration-normal",
          permissionsOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn(
        "mt-3 space-y-2 p-3 rounded-lg",
        "bg-bg-tertiary/50 border border-[#333333]"
      )}>
        <p className="text-xs text-text-tertiary mb-3">
          Personalize as permissões ou use os padrões do nível de acesso selecionado.
        </p>
        {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((permission) => (
          <div key={permission} className="flex items-center justify-between py-2">
            <Label className="text-sm text-text-primary">{permissionLabels[permission]}</Label>
            <Switch
              checked={getCurrentPermissionValue(permission)}
              onCheckedChange={(value) => handlePermissionChange(permission, value)}
              aria-label={`Permitir ${permissionLabels[permission].toLowerCase()}`}
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <SettingsSection
      title={t('users.title')}
      description={t('users.description')}
      icon={<Users className="w-5 h-5 text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />}
    >
      <div className="space-y-4">
        {/* User List */}
        <div className="space-y-2" data-tour="user-management-list">
          {users.map((user) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                "bg-bg-tertiary/50 backdrop-blur-sm border border-[#333333]",
                "hover:bg-bg-tertiary hover:border-accent-cyan/30",
                "transition-all duration-normal"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-accent-cyan/20 border border-accent-cyan/50",
                  "shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                )}>
                  <span className="text-sm font-medium text-accent-cyan">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-text-primary">{user.username}</p>
                  <Badge 
                    variant={roleConfig[user.role].badgeVariant}
                    size="sm"
                    icon={roleConfig[user.role].icon}
                  >
                    {roleConfig[user.role].label}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    "text-accent-cyan hover:bg-accent-cyan/10",
                    "hover:shadow-glow-cyan"
                  )}
                  onClick={() => openEditDialog(user)}
                  aria-label={`Editar usuário ${user.username}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    "text-state-error hover:bg-state-error/10",
                    "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  )}
                  onClick={() => openDeleteDialog(user)}
                  aria-label={`Remover usuário ${user.username}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add User Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          data-tour="add-user-button"
          onClick={() => {
            setFormData({ username: '', password: '', role: 'user', customPermissions: undefined });
            setPermissionsOpen(false);
            setShowAddDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('users.addUser')}
        </Button>

        {/* Role Legend */}
        <div className={cn(
          "p-3 rounded-lg space-y-2",
          "bg-bg-tertiary/50 backdrop-blur-sm border border-[#333333]"
        )}>
          <p className="text-xs font-medium text-brand-gold">{t('users.permissionLevels')}:</p>
          {Object.entries(roleDescriptions).map(([role, desc]) => (
            <div key={role} className="flex items-start gap-2">
              <Badge 
                variant={roleConfig[role as UserRole].badgeVariant}
                size="sm"
                icon={roleConfig[role as UserRole].icon}
                className="shrink-0"
              >
                {roleConfig[role as UserRole].label}
              </Badge>
              <span className="text-xs text-text-tertiary">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.addDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.addDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-brand-gold">{t('users.username')}</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario"
                variant="default"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-brand-gold">{t('users.password')}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                variant="default"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-brand-gold">{t('users.accessLevel')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value, customPermissions: undefined })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newbie">{t('users.roleOptions.newbie')}</SelectItem>
                  <SelectItem value="user">{t('users.roleOptions.user')}</SelectItem>
                  <SelectItem value="admin">{t('users.roleOptions.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Advanced Permissions */}
            {renderPermissionsSection()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleAddUser}>{t('users.createUser')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.editDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.editDialogDescription').replace('{username}', editingUser?.username || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-brand-gold">{t('users.accessLevel')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value, customPermissions: undefined })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newbie">{t('users.roleOptions.newbie')}</SelectItem>
                  <SelectItem value="user">{t('users.roleOptions.user')}</SelectItem>
                  <SelectItem value="admin">{t('users.roleOptions.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Advanced Permissions */}
            {renderPermissionsSection()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleEditUser}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.confirmDeleteDescription').replace('{username}', userToDelete?.username || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className={cn(
                "bg-state-error hover:bg-state-error/90",
                "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
                "hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              )}
            >
              {t('common.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}
