import { useState } from 'react';
import { Archive, Download, Upload, Trash2, Clock, HardDrive, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/hooks';
import { toast } from 'sonner';

interface BackupSectionProps {
  isDemoMode: boolean;
}

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
}

export function BackupSection({ isDemoMode }: BackupSectionProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [backups] = useState<BackupItem[]>([
    { id: '1', name: 'backup_2024-01-15_full.db', type: 'full', size: '2.4 MB', date: '2024-01-15T10:30:00Z' },
    { id: '2', name: 'backup_2024-01-14_inc.db', type: 'incremental', size: '128 KB', date: '2024-01-14T18:00:00Z' },
    { id: '3', name: 'backup_2024-01-13_full.db', type: 'full', size: '2.3 MB', date: '2024-01-13T10:30:00Z' },
  ]);

  const handleBackup = async (type: 'full' | 'incremental') => {
    if (isDemoMode) {
      toast.info(`Demo: ${type === 'full' ? t('backupLocal.fullBackup') : t('backupLocal.incrementalBackup')}`);
      return;
    }

    setIsLoading(type);
    try {
      const response = await fetch(`/api/backup/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(type === 'full' ? t('backupLocal.fullSuccess') : t('backupLocal.incrementalSuccess'));
      } else {
        toast.error(`${t('backupLocal.error')}: ${result.message}`);
      }
    } catch (error) {
      toast.error(t('backupLocal.error'));
    } finally {
      setIsLoading(null);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (isDemoMode) {
      toast.info(`Demo: ${t('backupLocal.restore')}`);
      return;
    }

    setIsLoading(`restore-${backupId}`);
    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId }),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(t('backupLocal.restoreSuccess'));
      } else {
        toast.error(`${t('backupLocal.error')}: ${result.message}`);
      }
    } catch (error) {
      toast.error(t('backupLocal.error'));
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (isDemoMode) {
      toast.info(`Demo: ${t('backupLocal.deleteBackup')}`);
      return;
    }

    setIsLoading(`delete-${backupId}`);
    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(t('backupLocal.deleteSuccess'));
      } else {
        toast.error(`${t('backupLocal.error')}: ${result.message}`);
      }
    } catch (error) {
      toast.error(t('backupLocal.error'));
    } finally {
      setIsLoading(null);
    }
  };

  const instructions = {
    title: "💾 O que são Backups?",
    steps: [
      "Backup é uma 'cópia de segurança' dos seus dados - como tirar uma foto do sistema.",
      "Se algo der errado (computador quebrar, vírus, etc.), você pode restaurar tudo usando essa cópia.",
      "BACKUP COMPLETO: Copia TUDO. Leva mais tempo, mas é a forma mais segura.",
      "BACKUP INCREMENTAL: Copia apenas o que mudou desde o último backup. É mais rápido!"
    ],
    tips: [
      "💡 Faça backup completo toda semana",
      "💡 Faça backup incremental todo dia",
      "💡 Guarde cópias em lugares diferentes (pen drive, nuvem)"
    ],
    warning: "⚠️ Sem backup, se o computador quebrar, você perde TUDO! Não arrisque."
  };

  return (
    <SettingsSection
      icon={<Archive className="w-5 h-5 icon-neon-blue" />}
      title={t('backupLocal.title')}
      description={t('backupLocal.description')}
      instructions={instructions}
      delay={0.2}
    >
      <div className="space-y-4">
        {/* Backup Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleBackup('full')}
            disabled={isDemoMode || isLoading === 'full'}
            className="flex-1 button-primary-glow-3d ripple-effect"
          >
            {isLoading === 'full' ? (
              <HardDrive className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {t('backupLocal.fullBackup')}
          </Button>
          <Button
            onClick={() => handleBackup('incremental')}
            disabled={isDemoMode || isLoading === 'incremental'}
            className="flex-1 button-outline-neon ripple-effect"
          >
            {isLoading === 'incremental' ? (
              <HardDrive className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {t('backupLocal.incrementalBackup')}
          </Button>
        </div>

        {/* Backup List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 icon-neon-blue" />
            <span className="text-sm font-medium text-label-yellow">{t('backupLocal.existingBackups')}</span>
          </div>
          
          <ScrollArea className="h-48 rounded-lg card-option-dark-3d">
            <div className="p-2 space-y-2">
              {backups.length === 0 ? (
                <p className="text-sm text-kiosk-text/80 text-center py-4">
                  {t('backupLocal.noBackups')}
                </p>
              ) : (
                backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d"
                  >
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
                      <Badge
                        variant="outline"
                        className={`ml-2 flex-shrink-0 ${
                          backup.type === 'full'
                            ? 'border-green-500/50 text-green-400'
                            : 'border-blue-500/50 text-blue-400'
                        }`}
                      >
                        {backup.type === 'full' ? 'Full' : 'Inc'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        size="icon"
                        onClick={() => handleRestore(backup.id)}
                        disabled={isDemoMode || isLoading === `restore-${backup.id}`}
                        className="w-8 h-8 button-action-neon"
                        title={t('backupLocal.restore')}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleDelete(backup.id)}
                        disabled={isDemoMode || isLoading === `delete-${backup.id}`}
                        className="w-8 h-8 button-destructive-neon"
                        title={t('backupLocal.deleteBackup')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {isDemoMode && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-400">
              {t('backupLocal.demoWarning')}
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}