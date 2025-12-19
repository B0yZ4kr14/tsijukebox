import { useState, useEffect, useRef } from 'react';
import { Archive, Download, Upload, Trash2, Clock, HardDrive, AlertCircle, Cloud, Settings, Check, Eye, EyeOff, FolderSync, Package, Lock, CloudCog, Satellite, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from './SettingsSection';
import { CloudProviderHelp } from './CloudProviderHelp';
import { useTranslation } from '@/hooks';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';

interface UnifiedBackupSectionProps {
  isDemoMode: boolean;
}

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
}

type CloudProvider = 'aws' | 'gdrive' | 'dropbox' | 'mega' | 'onedrive' | 'storj';

interface CloudConfig {
  provider: CloudProvider | '';
  awsBucket?: string;
  awsAccessKey?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  megaEmail?: string;
  megaPassword?: string;
  storjAccessGrant?: string;
  isOAuthConnected?: boolean;
}

interface BackupSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  retention: number;
}

const defaultSchedule: BackupSchedule = {
  enabled: false,
  frequency: 'daily',
  time: '03:00',
  retention: 7,
};

const cloudProviders: { id: CloudProvider; name: string; icon: React.ReactNode; needsOAuth: boolean }[] = [
  { id: 'aws', name: 'AWS S3', icon: <Cloud className="w-4 h-4 icon-neon-blue" />, needsOAuth: false },
  { id: 'gdrive', name: 'Google Drive', icon: <FolderSync className="w-4 h-4 icon-neon-blue" />, needsOAuth: true },
  { id: 'dropbox', name: 'Dropbox', icon: <Package className="w-4 h-4 icon-neon-blue" />, needsOAuth: true },
  { id: 'mega', name: 'MEGA', icon: <Lock className="w-4 h-4 icon-neon-blue" />, needsOAuth: false },
  { id: 'onedrive', name: 'OneDrive', icon: <CloudCog className="w-4 h-4 icon-neon-blue" />, needsOAuth: true },
  { id: 'storj', name: 'Storj', icon: <Satellite className="w-4 h-4 icon-neon-blue" />, needsOAuth: false },
];

export function UnifiedBackupSection({ isDemoMode }: UnifiedBackupSectionProps) {
  const { t } = useTranslation();
  
  // Local backup state
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [backups] = useState<BackupItem[]>([
    { id: '1', name: 'backup_2024-01-15_full.db', type: 'full', size: '2.4 MB', date: '2024-01-15T10:30:00Z' },
    { id: '2', name: 'backup_2024-01-14_inc.db', type: 'incremental', size: '128 KB', date: '2024-01-14T18:00:00Z' },
    { id: '3', name: 'backup_2024-01-13_full.db', type: 'full', size: '2.3 MB', date: '2024-01-13T10:30:00Z' },
  ]);

  // Cloud backup state
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>({ provider: '' });
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Schedule state
  const [schedule, setSchedule] = useState<BackupSchedule>(defaultSchedule);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = [
    { value: '0', label: t('backup.days.sunday') },
    { value: '1', label: t('backup.days.monday') },
    { value: '2', label: t('backup.days.tuesday') },
    { value: '3', label: t('backup.days.wednesday') },
    { value: '4', label: t('backup.days.thursday') },
    { value: '5', label: t('backup.days.friday') },
    { value: '6', label: t('backup.days.saturday') },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('backup_schedule');
    if (saved) {
      setSchedule(JSON.parse(saved));
    }
  }, []);

  // Local backup handlers
  const handleBackup = async (type: 'full' | 'incremental') => {
    if (isDemoMode) {
      toast.info(`Demo: ${type === 'full' ? t('backupLocal.fullBackup') : t('backupLocal.incrementalBackup')}`);
      return;
    }
    setIsLoading(type);
    try {
      const response = await fetch(`/api/backup/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (result.success) toast.success(type === 'full' ? t('backupLocal.fullSuccess') : t('backupLocal.incrementalSuccess'));
      else toast.error(`${t('backupLocal.error')}: ${result.message}`);
    } catch {
      toast.error(t('backupLocal.error'));
    } finally {
      setIsLoading(null);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (isDemoMode) { toast.info(`Demo: ${t('backupLocal.restore')}`); return; }
    setIsLoading(`restore-${backupId}`);
    try {
      const response = await fetch('/api/backup/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backupId }) });
      const result = await response.json();
      if (result.success) toast.success(t('backupLocal.restoreSuccess'));
      else toast.error(`${t('backupLocal.error')}: ${result.message}`);
    } catch { toast.error(t('backupLocal.error')); }
    finally { setIsLoading(null); }
  };

  const handleDelete = async (backupId: string) => {
    if (isDemoMode) { toast.info(`Demo: ${t('backupLocal.deleteBackup')}`); return; }
    setIsLoading(`delete-${backupId}`);
    try {
      const response = await fetch(`/api/backup/${backupId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) toast.success(t('backupLocal.deleteSuccess'));
      else toast.error(`${t('backupLocal.error')}: ${result.message}`);
    } catch { toast.error(t('backupLocal.error')); }
    finally { setIsLoading(null); }
  };

  // Cloud backup handlers
  const handleProviderChange = (provider: string) => {
    setCloudConfig({ provider: provider as CloudProvider });
  };

  const handleSaveCloudConfig = async () => {
    if (isDemoMode) { toast.info(`Demo: ${t('cloudBackup.configSaved')}`); return; }
    setIsLoading('cloud-save');
    try {
      const response = await fetch('/api/backup/cloud/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cloudConfig) });
      const result = await response.json();
      if (result.success) toast.success(t('cloudBackup.configSaved'));
      else toast.error(`${t('cloudBackup.syncError')}: ${result.message}`);
    } catch { toast.error(t('cloudBackup.syncError')); }
    finally { setIsLoading(null); }
  };

  const handleSync = async () => {
    if (isDemoMode) { toast.info(`Demo: ${t('cloudBackup.syncNow')}`); return; }
    setIsSyncing(true);
    try {
      const response = await fetch('/api/backup/cloud/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json();
      if (result.success) toast.success(t('cloudBackup.syncSuccess'));
      else toast.error(`${t('cloudBackup.syncError')}: ${result.message}`);
    } catch { toast.error(t('cloudBackup.syncError')); }
    finally { setIsSyncing(false); }
  };

  // Schedule handlers
  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('backup_schedule', JSON.stringify(schedule));
      await api.setBackupSchedule({ enabled: schedule.enabled, frequency: schedule.frequency, time: schedule.time, retention: schedule.retention });
      toast.success(t('backup.savedSuccess'));
    } catch {
      toast.success(t('backup.savedLocal'));
    } finally { setIsSaving(false); }
  };

  const handleResetSchedule = () => {
    setSchedule(defaultSchedule);
    localStorage.removeItem('backup_schedule');
    toast.info(t('backup.reset'));
  };

  const currentProvider = cloudProviders.find(p => p.id === cloudConfig.provider);

  return (
    <SettingsSection
      icon={<Archive className="w-5 h-5 icon-neon-blue" />}
      title="Backup"
      description="Gerencie backups locais, na nuvem e agendamentos automáticos"
    >
      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-kiosk-bg/50">
          <TabsTrigger value="local" data-tour="backup-local-tab">Local</TabsTrigger>
          <TabsTrigger value="cloud" data-tour="backup-cloud-tab">Nuvem</TabsTrigger>
          <TabsTrigger value="schedule" data-tour="backup-schedule-tab">Agendamento</TabsTrigger>
        </TabsList>

        {/* LOCAL BACKUP TAB */}
        <TabsContent value="local" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button onClick={() => handleBackup('full')} disabled={isDemoMode || isLoading === 'full'} className="flex-1 button-primary-glow-3d ripple-effect">
              {isLoading === 'full' ? <HardDrive className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {t('backupLocal.fullBackup')}
            </Button>
            <Button onClick={() => handleBackup('incremental')} disabled={isDemoMode || isLoading === 'incremental'} className="flex-1 button-outline-neon ripple-effect">
              {isLoading === 'incremental' ? <HardDrive className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {t('backupLocal.incrementalBackup')}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 icon-neon-blue" />
              <span className="text-sm font-medium text-label-yellow">{t('backupLocal.existingBackups')}</span>
            </div>
            <ScrollArea className="h-40 rounded-lg card-option-dark-3d">
              <div className="p-2 space-y-2">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Archive className="w-4 h-4 icon-neon-blue flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-kiosk-text font-medium truncate">{backup.name}</p>
                        <div className="flex items-center gap-2 text-xs text-kiosk-text/80">
                          <span>{backup.size}</span>
                          <span>•</span>
                          <span>{new Date(backup.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`ml-2 flex-shrink-0 ${backup.type === 'full' ? 'border-green-500/50 text-green-400' : 'border-blue-500/50 text-blue-400'}`}>
                        {backup.type === 'full' ? 'Full' : 'Inc'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button size="icon" onClick={() => handleRestore(backup.id)} disabled={isDemoMode || isLoading === `restore-${backup.id}`} className="w-8 h-8 button-action-neon" title={t('backupLocal.restore')} aria-label={`Restaurar backup ${backup.name}`}>
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button size="icon" onClick={() => handleDelete(backup.id)} disabled={isDemoMode || isLoading === `delete-${backup.id}`} className="w-8 h-8 button-destructive-neon" title={t('backupLocal.deleteBackup')} aria-label={`Excluir backup ${backup.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* CLOUD BACKUP TAB */}
        <TabsContent value="cloud" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-label-yellow">{t('cloudBackup.provider')}</Label>
              {cloudConfig.provider && <CloudProviderHelp provider={cloudConfig.provider as CloudProvider} />}
            </div>
            <Select value={cloudConfig.provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="input-3d bg-kiosk-bg border-kiosk-border text-white">
                <SelectValue placeholder={t('cloudBackup.selectProvider')} />
              </SelectTrigger>
              <SelectContent>
                {cloudProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <span className="flex items-center gap-2">{provider.icon}<span>{provider.name}</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cloudConfig.provider === 'aws' && (
            <div className="space-y-3 p-3 rounded-lg card-option-dark-3d">
              <div className="space-y-2">
                <Label className="text-label-yellow text-sm">{t('cloudBackup.bucketName')}</Label>
                <Input value={cloudConfig.awsBucket || ''} onChange={(e) => setCloudConfig({ ...cloudConfig, awsBucket: e.target.value })} placeholder="my-backup-bucket" className="input-3d bg-kiosk-bg" disabled={isDemoMode} />
              </div>
              <div className="space-y-2">
                <Label className="text-label-yellow text-sm">{t('cloudBackup.accessKey')}</Label>
                <Input value={cloudConfig.awsAccessKey || ''} onChange={(e) => setCloudConfig({ ...cloudConfig, awsAccessKey: e.target.value })} placeholder="AKIAIOSFODNN7EXAMPLE" className="input-3d bg-kiosk-bg font-mono" disabled={isDemoMode} />
              </div>
              <div className="space-y-2">
                <Label className="text-label-yellow text-sm">{t('cloudBackup.secretKey')}</Label>
                <div className="relative">
                  <Input type={showSecrets ? 'text' : 'password'} value={cloudConfig.awsSecretKey || ''} onChange={(e) => setCloudConfig({ ...cloudConfig, awsSecretKey: e.target.value })} placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" className="input-3d bg-kiosk-bg font-mono pr-10" disabled={isDemoMode} />
                  <Button type="button" size="icon" className="absolute right-0 top-0 h-full px-3 button-action-neon" onClick={() => setShowSecrets(!showSecrets)} aria-label={showSecrets ? 'Ocultar chave secreta' : 'Mostrar chave secreta'}>
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-label-yellow text-sm">{t('cloudBackup.region')}</Label>
                <Input value={cloudConfig.awsRegion || ''} onChange={(e) => setCloudConfig({ ...cloudConfig, awsRegion: e.target.value })} placeholder="us-east-1" className="input-3d bg-kiosk-bg" disabled={isDemoMode} />
              </div>
            </div>
          )}

          {cloudConfig.provider === 'mega' && (
            <div className="space-y-3 p-3 rounded-lg card-option-dark-3d">
              <div className="space-y-2">
                <Label className="text-label-yellow text-sm">{t('cloudBackup.email')}</Label>
                <Input type="email" value={cloudConfig.megaEmail || ''} onChange={(e) => setCloudConfig({ ...cloudConfig, megaEmail: e.target.value })} placeholder="seu@email.com" className="input-3d bg-kiosk-bg" disabled={isDemoMode} />
              </div>
              <div className="space-y-2">
                <Label className="text-label-yellow text-sm">{t('cloudBackup.password')}</Label>
                <div className="relative">
                  <Input type={showSecrets ? 'text' : 'password'} value={cloudConfig.megaPassword || ''} onChange={(e) => setCloudConfig({ ...cloudConfig, megaPassword: e.target.value })} placeholder="••••••••" className="input-3d bg-kiosk-bg pr-10" disabled={isDemoMode} />
                  <Button type="button" size="icon" className="absolute right-0 top-0 h-full px-3 button-action-neon" onClick={() => setShowSecrets(!showSecrets)} aria-label={showSecrets ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {cloudConfig.provider && (
            <div className="flex gap-2">
              <Button onClick={handleSaveCloudConfig} disabled={isDemoMode || isLoading === 'cloud-save'} className="flex-1 button-primary-glow-3d">
                <Settings className="w-4 h-4 mr-2" />
                {t('cloudBackup.saveConfig')}
              </Button>
              <Button onClick={handleSync} disabled={isDemoMode || isSyncing} className="button-outline-neon">
                <Cloud className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {t('cloudBackup.syncNow')}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d">
            <Label htmlFor="schedule-enabled" className="text-sm text-label-yellow">{t('backup.automatic')}</Label>
            <Switch id="schedule-enabled" checked={schedule.enabled} onCheckedChange={(enabled) => setSchedule({ ...schedule, enabled })} data-tour="backup-schedule-toggle" aria-label="Habilitar backup automático" />
          </div>

          {schedule.enabled && (
            <div className="space-y-4 p-3 rounded-lg card-option-dark-3d">
              <div className="space-y-2">
                <Label className="text-sm text-label-yellow">{t('backup.frequency')}</Label>
                <Select value={schedule.frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSchedule({ ...schedule, frequency: value })}>
                  <SelectTrigger className="input-3d bg-kiosk-bg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-kiosk-surface border-kiosk-border">
                    <SelectItem value="daily">{t('backup.daily')}</SelectItem>
                    <SelectItem value="weekly">{t('backup.weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('backup.monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {schedule.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label className="text-sm text-label-yellow">{t('backup.dayOfWeek')}</Label>
                  <Select value={String(schedule.dayOfWeek ?? 0)} onValueChange={(value) => setSchedule({ ...schedule, dayOfWeek: parseInt(value) })}>
                    <SelectTrigger className="input-3d bg-kiosk-bg"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-kiosk-surface border-kiosk-border">
                      {daysOfWeek.map((day) => (<SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm text-label-yellow flex items-center gap-2">
                  <Clock className="w-4 h-4 icon-neon-blue" />{t('backup.time')}
                </Label>
                <Input type="time" value={schedule.time} onChange={(e) => setSchedule({ ...schedule, time: e.target.value })} className="input-3d bg-kiosk-bg" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-label-yellow">{t('backup.retention')}</Label>
                <Select value={String(schedule.retention)} onValueChange={(value) => setSchedule({ ...schedule, retention: parseInt(value) })}>
                  <SelectTrigger className="input-3d bg-kiosk-bg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-kiosk-surface border-kiosk-border">
                    <SelectItem value="3">3 {t('backup.backups')}</SelectItem>
                    <SelectItem value="5">5 {t('backup.backups')}</SelectItem>
                    <SelectItem value="7">7 {t('backup.backups')}</SelectItem>
                    <SelectItem value="14">14 {t('backup.backups')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveSchedule} disabled={isSaving} className="flex-1 button-primary-glow-3d ripple-effect">
              <Save className="w-4 h-4 mr-2" />{isSaving ? t('common.saving') : t('common.save')}
            </Button>
            <Button onClick={handleResetSchedule} className="button-outline-neon ripple-effect"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </TabsContent>
      </Tabs>

      {isDemoMode && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mt-4">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-400">{t('backupLocal.demoWarning')}</p>
        </div>
      )}
    </SettingsSection>
  );
}
