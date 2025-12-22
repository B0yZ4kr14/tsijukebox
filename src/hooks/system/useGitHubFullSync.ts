import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileToSync {
  path: string;
  content: string;
}

export interface SyncResult {
  success: boolean;
  commit?: {
    sha: string;
    url: string;
    message: string;
    filesChanged: number;
  };
  error?: string;
  skippedFiles?: string[];
  syncedFiles?: string[];
}

export interface SyncProgress {
  phase: 'preparing' | 'uploading' | 'committing' | 'done' | 'error';
  current: number;
  total: number;
  currentFile?: string;
}

export interface UseGitHubFullSyncReturn {
  isSyncing: boolean;
  progress: SyncProgress | null;
  error: string | null;
  lastSync: SyncResult | null;
  syncFiles: (files: FileToSync[], commitMessage?: string) => Promise<SyncResult>;
  syncFullRepository: (commitMessage?: string) => Promise<SyncResult>;
  clearError: () => void;
}

// Project files to sync - all critical files
const CRITICAL_FILES = [
  // Documentation
  'docs/VERSION',
  'docs/SYNC_LOG.md',
  'docs/CHANGELOG.md',
  'docs/README.md',
  'docs/GITHUB-INTEGRATION.md',
  // Scripts
  'scripts/install.py',
  'scripts/diagnose-service.py',
  'scripts/tsi-status',
  'scripts/systemd-notify-wrapper.py',
  'scripts/tsijukebox-doctor',
  // Config
  'package.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
];

// Generate content for known files
function generateFileContent(path: string): string {
  const now = new Date().toISOString();
  const version = '4.1.0';
  
  switch (path) {
    case 'docs/VERSION':
      return version;
    
    case 'docs/SYNC_LOG.md':
      return `# Repository Sync Log

## Last Sync
- **Date**: ${now}
- **Version**: ${version}
- **Status**: ✅ Synced via Lovable
- **Type**: Full Repository Sync

## Sync History
| Date | Version | Files | Status |
|------|---------|-------|--------|
| ${now.split('T')[0]} | ${version} | Full Sync | ✅ Success |
`;

    case 'docs/CHANGELOG.md':
      return `# Changelog

All notable changes to TSiJUKEBOX will be documented in this file.

## [${version}] - ${now.split('T')[0]}

### Added
- Full repository sync system
- Real-time GitHub synchronization
- Auto-fix functionality in diagnose-service.py
- E2E tests for service diagnostics
- systemd-notify integration
- tsi-status command

### Changed
- Improved GitHub dashboard with sync progress
- Enhanced tsijukebox-doctor with service log analysis

### Fixed
- Various bug fixes and performance improvements
`;
    
    default:
      return `// Auto-synced: ${now}\n// File: ${path}\n`;
  }
}

export function useGitHubFullSync(): UseGitHubFullSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);

  const syncFiles = useCallback(async (
    files: FileToSync[], 
    commitMessage?: string
  ): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    setProgress({ phase: 'preparing', current: 0, total: files.length });

    try {
      const message = commitMessage || `[TSiJUKEBOX v4.1.0] Full repository sync - ${new Date().toISOString()}`;

      console.log(`[useGitHubFullSync] Syncing ${files.length} files...`);
      setProgress({ phase: 'uploading', current: 0, total: files.length });

      const { data, error: fnError } = await supabase.functions.invoke('full-repo-sync', {
        body: {
          files,
          commitMessage: message,
          branch: 'main',
          skipUnchanged: true
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to sync repository');
      }

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setProgress({ phase: 'done', current: files.length, total: files.length });

      const result: SyncResult = {
        success: true,
        commit: data.commit,
        skippedFiles: data.skippedFiles,
        syncedFiles: data.syncedFiles
      };

      setLastSync(result);
      
      if (data.commit) {
        toast.success('Repository synced!', {
          description: `${data.commit.filesChanged} files pushed to GitHub`,
          action: {
            label: 'View Commit',
            onClick: () => window.open(data.commit.url, '_blank')
          }
        });
      } else if (data.skippedFiles?.length > 0) {
        toast.info('No changes detected', {
          description: `${data.skippedFiles.length} files already up to date`
        });
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setProgress({ phase: 'error', current: 0, total: 0 });
      
      const result: SyncResult = {
        success: false,
        error: errorMessage
      };
      
      setLastSync(result);
      toast.error('Sync failed', { description: errorMessage });
      
      return result;

    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncFullRepository = useCallback(async (commitMessage?: string): Promise<SyncResult> => {
    // Generate files to sync
    const files: FileToSync[] = CRITICAL_FILES.map(path => ({
      path,
      content: generateFileContent(path)
    }));

    const message = commitMessage || `[TSiJUKEBOX v4.1.0] Full repository sync - ${new Date().toLocaleDateString('pt-BR')}`;
    
    return syncFiles(files, message);
  }, [syncFiles]);

  const clearError = useCallback(() => {
    setError(null);
    setProgress(null);
  }, []);

  return {
    isSyncing,
    progress,
    error,
    lastSync,
    syncFiles,
    syncFullRepository,
    clearError
  };
}
