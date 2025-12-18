import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SettingsSection } from './SettingsSection';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppUser, UserRole } from '@/types/user';
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

interface UserFormData {
  username: string;
  password: string;
  role: UserRole;
}

export function UserManagementSection() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'user',
  });

  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    newbie: { 
      label: t('users.roles.newbie'), 
      icon: <Shield className="w-3 h-3" />, 
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
    },
    user: { 
      label: t('users.roles.user'), 
      icon: <ShieldCheck className="w-3 h-3" />, 
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
    },
    admin: { 
      label: t('users.roles.admin'), 
      icon: <ShieldAlert className="w-3 h-3" />, 
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
    },
  };

  const roleDescriptions: Record<UserRole, string> = {
    newbie: t('users.roleDescriptions.newbie'),
    user: t('users.roleDescriptions.user'),
    admin: t('users.roleDescriptions.admin'),
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
    };

    saveUsers([...users, newUser]);
    setShowAddDialog(false);
    setFormData({ username: '', password: '', role: 'user' });
    toast.success(t('users.userCreated'));
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    const updated = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, role: formData.role }
        : u
    );

    saveUsers(updated);
    setEditingUser(null);
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
    setFormData({ username: user.username, password: '', role: user.role });
  };

  const openDeleteDialog = (user: AppUser) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  return (
    <SettingsSection
      title={t('users.title')}
      description={t('users.description')}
      icon={<Users className="w-5 h-5 icon-neon-blue" />}
    >
      <div className="space-y-4">
        {/* User List */}
        <div className="space-y-2" data-tour="user-management-list">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full avatar-neon-glow flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-kiosk-text">{user.username}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${roleConfig[user.role].color}`}
                  >
                    {roleConfig[user.role].icon}
                    <span className="ml-1">{roleConfig[user.role].label}</span>
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  className="h-8 w-8 button-action-neon"
                  onClick={() => openEditDialog(user)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8 button-destructive-neon"
                  onClick={() => openDeleteDialog(user)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add User Button */}
        <Button
          className="w-full button-primary-glow-3d"
          data-tour="add-user-button"
          onClick={() => {
            setFormData({ username: '', password: '', role: 'user' });
            setShowAddDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('users.addUser')}
        </Button>

        {/* Role Legend */}
        <div className="p-3 rounded-lg card-option-dark-3d space-y-2">
          <p className="text-xs font-medium text-label-yellow">{t('users.permissionLevels')}:</p>
          {Object.entries(roleDescriptions).map(([role, desc]) => (
            <div key={role} className="flex items-start gap-2">
              <Badge 
                variant="outline" 
                className={`text-[10px] ${roleConfig[role as UserRole].color} shrink-0`}
              >
                {roleConfig[role as UserRole].icon}
                <span className="ml-1">{roleConfig[role as UserRole].label}</span>
              </Badge>
              <span className="text-xs text-kiosk-text/80">{desc}</span>
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
              <Label className="text-label-yellow">{t('users.username')}</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow">{t('users.password')}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-label-yellow">{t('users.accessLevel')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
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
          </div>
          <DialogFooter>
            <Button variant="kiosk-outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddUser}>{t('users.createUser')}</Button>
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
              <Label className="text-label-yellow">{t('users.accessLevel')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
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
          </div>
          <DialogFooter>
            <Button variant="kiosk-outline" onClick={() => setEditingUser(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditUser}>{t('common.save')}</Button>
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}
