import { Archive, Cloud, HardDrive, Download, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BackupItem, BackupProvider } from './types';
import { Badge, Button } from "@/components/ui/themed"

interface BackupCardProps {
  backup: BackupItem;
  onRestore: (backupId: string) => void;
  onDelete: (backupId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const providerIcons: Record<BackupProvider, React.ReactNode> = {
  local: <HardDrive className="w-4 h-4 text-accent-cyan" />,
  cloud: <Cloud className="w-4 h-4 text-accent-cyan" />,
  distributed: <Archive className="w-4 h-4 text-accent-cyan" />,
};

/**
 * BackupCard Component
 * 
 * Card de exibição de um backup individual com ações de restaurar e excluir.
 * 
 * @component
 * @example
 * ```tsx
 * <BackupCard
 *   backup={backupItem}
 *   onRestore={handleRestore}
 *   onDelete={handleDelete}
 * />
 * ```
 */
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
      className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/60 backdrop-blur-sm border border-border-primary hover:border-accent-cyan/50 transition-all duration-normal"
      data-testid={`backup-card-${backup.id}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Provider Icon */}
        <div 
          className="p-2 rounded-lg bg-bg-tertiary/50 border border-border-primary" 
          data-testid="backup-provider-icon"
        >
          {providerIcons[backup.provider]}
        </div>
        
        {/* Backup Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-primary font-medium truncate" data-testid="backup-name">
            {backup.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span data-testid="backup-size">{backup.size}</span>
            <span>•</span>
            <span data-testid="backup-date">{formattedDate}</span>
          </div>
        </div>
        
        {/* Type Badge */}
        <Badge
          variant={backup.type === 'full' ? 'success' : 'info'}
          size="sm"
          className="ml-2 flex-shrink-0"
          data-testid="backup-type-badge"
        >
          {backup.type === 'full' ? 'Full' : 'Inc'}
        </Badge>
        
        {/* Status Badge */}
        {backup.status !== 'completed' && (
          <Badge
            variant={
              backup.status === 'failed' ? 'error' :
              backup.status === 'pending' ? 'warning' :
              backup.status === 'syncing' ? 'info' : 'default'
            }
            size="sm"
            className="flex-shrink-0"
            data-testid="backup-status-badge"
          >
            {backup.status}
          </Badge>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <Button
          size="xs"
          variant="ghost"
          onClick={() => onRestore(backup.id)}
          disabled={disabled || isLoading}
          className="w-8 h-8 text-text-secondary hover:bg-state-success/20 hover:text-state-success transition-all duration-normal"
          title="Restaurar"
          data-testid={`backup-restore-${backup.id}`}
        >
          <Upload aria-hidden="true" className="w-4 h-4" />
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => onDelete(backup.id)}
          disabled={disabled || isLoading}
          className="w-8 h-8 text-text-secondary hover:bg-state-error/20 hover:text-state-error transition-all duration-normal"
          title="Excluir"
          data-testid={`backup-delete-${backup.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
