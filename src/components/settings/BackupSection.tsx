import { useState } from 'react';
import { Archive, Download, Upload, Trash2, Clock, HardDrive, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsSection } from './SettingsSection';
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
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [backups] = useState<BackupItem[]>([
    { id: '1', name: 'backup_2024-01-15_full.db', type: 'full', size: '2.4 MB', date: '2024-01-15T10:30:00Z' },
    { id: '2', name: 'backup_2024-01-14_inc.db', type: 'incremental', size: '128 KB', date: '2024-01-14T18:00:00Z' },
    { id: '3', name: 'backup_2024-01-13_full.db', type: 'full', size: '2.3 MB', date: '2024-01-13T10:30:00Z' },
  ]);

  const handleBackup = async (type: 'full' | 'incremental') => {
    if (isDemoMode) {
      toast.info(`Demo: Backup ${type} simulado`);
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
        toast.success(`Backup ${type === 'full' ? 'completo' : 'incremental'} criado`);
      } else {
        toast.error(`Falha no backup: ${result.message}`);
      }
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (isDemoMode) {
      toast.info('Demo: Restauração simulada');
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
        toast.success('Backup restaurado com sucesso');
      } else {
        toast.error(`Falha na restauração: ${result.message}`);
      }
    } catch (error) {
      toast.error('Erro ao restaurar backup');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (isDemoMode) {
      toast.info('Demo: Exclusão simulada');
      return;
    }

    setIsLoading(`delete-${backupId}`);
    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success('Backup excluído');
      } else {
        toast.error(`Falha ao excluir: ${result.message}`);
      }
    } catch (error) {
      toast.error('Erro ao excluir backup');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <SettingsSection
      icon={<Archive className="w-5 h-5 text-kiosk-primary" />}
      title="Backup Local"
      description="Criar e restaurar backups do banco de dados"
      delay={0.2}
    >
      <div className="space-y-4">
        {/* Backup Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleBackup('full')}
            disabled={isDemoMode || isLoading === 'full'}
            className="flex-1 bg-kiosk-primary hover:bg-kiosk-primary/90"
          >
            {isLoading === 'full' ? (
              <HardDrive className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Backup Completo
          </Button>
          <Button
            onClick={() => handleBackup('incremental')}
            disabled={isDemoMode || isLoading === 'incremental'}
            variant="outline"
            className="flex-1 border-kiosk-border hover:bg-kiosk-surface/80"
          >
            {isLoading === 'incremental' ? (
              <HardDrive className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Backup Incremental
          </Button>
        </div>

        {/* Backup List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-kiosk-text/80" />
            <span className="text-sm font-medium text-kiosk-text">Backups Existentes</span>
          </div>
          
          <ScrollArea className="h-48 rounded-lg border border-kiosk-border bg-kiosk-background/50">
            <div className="p-2 space-y-2">
              {backups.length === 0 ? (
                <p className="text-sm text-kiosk-text/70 text-center py-4">
                  Nenhum backup encontrado
                </p>
              ) : (
                backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 hover:bg-kiosk-surface transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Archive className="w-4 h-4 text-kiosk-text/80 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-kiosk-text truncate">{backup.name}</p>
                        <div className="flex items-center gap-2 text-xs text-kiosk-text/70">
                          <span>{backup.size}</span>
                          <span>•</span>
                          <span>{new Date(backup.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-2 flex-shrink-0 ${
                          backup.type === 'full'
                            ? 'border-green-500/50 text-green-500'
                            : 'border-blue-500/50 text-blue-500'
                        }`}
                      >
                        {backup.type === 'full' ? 'Full' : 'Inc'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRestore(backup.id)}
                        disabled={isDemoMode || isLoading === `restore-${backup.id}`}
                        className="w-8 h-8 text-kiosk-text/70 hover:text-kiosk-primary"
                        title="Restaurar"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(backup.id)}
                        disabled={isDemoMode || isLoading === `delete-${backup.id}`}
                        className="w-8 h-8 text-kiosk-text/70 hover:text-red-500"
                        title="Excluir"
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
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-500">
              Operações de backup indisponíveis no modo demo
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
