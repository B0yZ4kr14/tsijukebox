import { Download, HardDrive } from 'lucide-react';
import { Button } from "@/components/ui/themed";
import type { BackupType } from './types';

interface BackupActionsProps {
  onBackup: (type: BackupType) => void;
  isLoading?: boolean;
  disabled?: boolean;
  showIncremental?: boolean;
}

export function BackupActions({ 
  onBackup, 
  isLoading = false, 
  disabled = false,
  showIncremental = true 
}: BackupActionsProps) {
  return (
    <div className="flex gap-2" data-testid="backup-actions">
      <Button
        onClick={() => onBackup('full')}
        disabled={disabled || isLoading}
        className="flex-1 button-primary-glow-3d ripple-effect"
        data-testid="backup-full-button"
      >
        {isLoading ? (
          <HardDrive className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download aria-hidden="true" className="w-4 h-4 mr-2" />
        )}
        Backup Completo
      </Button>
      
      {showIncremental && (
        <Button
          onClick={() => onBackup('incremental')}
          disabled={disabled || isLoading}
          className="flex-1 button-outline-neon ripple-effect"
          data-testid="backup-incremental-button"
        >
          {isLoading ? (
            <HardDrive className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download aria-hidden="true" className="w-4 h-4 mr-2" />
          )}
          Incremental
        </Button>
      )}
    </div>
  );
}
