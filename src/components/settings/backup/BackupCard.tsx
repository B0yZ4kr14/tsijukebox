import { Archive, Cloud, HardDrive, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BackupItem, BackupProvider } from './types';

interface BackupCardProps {
  backup: BackupItem;
  onRestore: (backupId: string) => void;
  onDelete: (backupId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const providerIcons: Record<BackupProvider, React.ReactNode> = {
  local: <HardDrive className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
  distributed: <Archive className="w-4 h-4" />,
};

export function BackupCard({ 
  backup, 
  onRestore, 
  onDelete, 
  isLoading = false,
  disabled = false 
}: BackupCardProps) {
  const formattedDate = new Date(backup.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg card-option-dark-3d"
      data-testid={`backup-card-${backup.id}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-kiosk-surface/50" data-testid="backup-provider-icon">
          {providerIcons[backup.provider]}
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-sm text-kiosk-text font-medium truncate" data-testid="backup-name">
            {backup.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-kiosk-text/70">
            <span data-testid="backup-size">{backup.size}</span>
            <span>•</span>
            <span data-testid="backup-date">{formattedDate}</span>
          </div>
        </div>
        
        <Badge
          variant="outline"
          className={cn(
            "ml-2 flex-shrink-0",
            backup.type === 'full'
              ? 'border-green-500/50 text-green-400'
              : 'border-blue-500/50 text-blue-400'
          )}
          data-testid="backup-type-badge"
        >
          {backup.type === 'full' ? 'Full' : 'Inc'}
        </Badge>
        
        {backup.status !== 'completed' && (
          <Badge
            variant="outline"
            className={cn(
              backup.status === 'failed' && 'border-red-500/50 text-red-400',
              backup.status === 'pending' && 'border-yellow-500/50 text-yellow-400',
              backup.status === 'syncing' && 'border-cyan-500/50 text-cyan-400'
            )}
            data-testid="backup-status-badge"
          >
            {backup.status}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRestore(backup.id)}
          disabled={disabled || isLoading}
          className="w-8 h-8 hover:bg-green-500/20 hover:text-green-400"
          title="Restaurar"
          data-testid={`backup-restore-${backup.id}`}
        >
          <Upload className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(backup.id)}
          disabled={disabled || isLoading}
          className="w-8 h-8 hover:bg-red-500/20 hover:text-red-400"
          title="Excluir"
          data-testid={`backup-delete-${backup.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
