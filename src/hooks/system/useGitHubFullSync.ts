import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileToSync, 
  SyncResult, 
  SyncProgress, 
  UseGitHubFullSyncReturn,
  SAFE_SYNC_FILES,
  isGeneratedFile
} from './github/types';
import { generateFileContent } from './github/fileContentGenerator';

export * from './github/types';

interface ReadProjectFilesResult {
  files: Array<{ path: string; content: string }>;
  errors: string[];
  notFound: string[];
}

export function useGitHubFullSync(): UseGitHubFullSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);

  const syncFiles = useCallback(async (
    files: FileToSync[], 
    commitMessage?: string,
    syncType: 'manual' | 'auto' | 'webhook' = 'manual'
  ): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    setProgress({ phase: 'preparing', current: 0, total: files.length });

    const startTime = Date.now();

    try {
      const message = commitMessage || `[TSiJUKEBOX v4.1.0] Sync ${files.length} files - ${new Date().toISOString()}`;

      console.log(`[useGitHubFullSync] Syncing ${files.length} files...`);
      setProgress({ phase: 'uploading', current: 0, total: files.length });

      const { data, error: fnError } = await supabase.functions.invoke('full-repo-sync', {
        body: {
          files,
          commitMessage: message,
          branch: 'main',
          skipUnchanged: true,
          syncType
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to sync repository');
      }

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setProgress({ phase: 'done', current: files.length, total: files.length });

      const duration = Date.now() - startTime;
      const result: SyncResult = {
        success: true,
        commit: data.commit,
        skippedFiles: data.skippedFiles,
        syncedFiles: data.syncedFiles
      };

      setLastSync(result);
      
      if (data.commit) {
        toast.success('Repository synced!', {
          description: `${data.commit.filesChanged} files pushed to GitHub in ${(duration / 1000).toFixed(1)}s`,
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
    // Separate files into dynamic (read from repo) and generated (timestamps, etc.)
    const dynamicPaths = SAFE_SYNC_FILES.filter(path => !isGeneratedFile(path));
    const generatedPaths = SAFE_SYNC_FILES.filter(path => isGeneratedFile(path));

    console.log(`[syncFullRepository] Dynamic: ${dynamicPaths.length}, Generated: ${generatedPaths.length}`);

    const files: FileToSync[] = [];
    const skippedUnknown: string[] = [];

    // 1. Try to read dynamic files from repository
    if (dynamicPaths.length > 0) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke<ReadProjectFilesResult>('read-project-files', {
          body: { paths: dynamicPaths, branch: 'main' }
        });

        if (fnError) {
          console.warn('[syncFullRepository] Error reading dynamic files:', fnError.message);
          // Fall back to generated content for all
        } else if (data) {
          // Add successfully read files
          files.push(...data.files);
          
          // Log any errors or not found
          if (data.notFound.length > 0) {
            console.log(`[syncFullRepository] ${data.notFound.length} files not found in repo (will use generated content if available)`);
          }
          if (data.errors.length > 0) {
            console.warn('[syncFullRepository] Errors reading files:', data.errors);
          }

          // For files not found, try to generate content
          for (const path of data.notFound) {
            const content = generateFileContent(path);
            if (content !== null) {
              files.push({ path, content });
            } else {
              skippedUnknown.push(path);
            }
          }
        }
      } catch (err) {
        console.error('[syncFullRepository] Failed to read dynamic files:', err);
        // Fall through to generated content
      }
    }

    // 2. Generate content for files that need timestamps/version info
    for (const path of generatedPaths) {
      const content = generateFileContent(path);
      if (content !== null) {
        files.push({ path, content });
      } else {
        skippedUnknown.push(path);
      }
    }

    if (skippedUnknown.length > 0) {
      console.warn(`[syncFullRepository] Skipped ${skippedUnknown.length} unknown files to prevent overwrite`);
    }

    if (files.length === 0) {
      toast.error('No files to sync', { description: 'No valid files found for synchronization' });
      return { success: false, error: 'No files to sync' };
    }

    const message = commitMessage || `[TSiJUKEBOX v4.1.0] Full sync ${files.length} files (${dynamicPaths.length} dynamic + ${generatedPaths.length} generated) - ${new Date().toLocaleDateString('pt-BR')}`;
    
    return syncFiles(files, message, 'manual');
  }, [syncFiles]);

  const syncSelectedFiles = useCallback(async (
    selectedPaths: string[],
    commitMessage?: string
  ): Promise<SyncResult> => {
    // Separate selected files into dynamic and generated
    const dynamicPaths = selectedPaths.filter(path => !isGeneratedFile(path));
    const generatedPaths = selectedPaths.filter(path => isGeneratedFile(path));

    const files: FileToSync[] = [];
    const skippedUnknown: string[] = [];

    // 1. Read dynamic files from repository
    if (dynamicPaths.length > 0) {
      try {
        const { data, error: fnError } = await supabase.functions.invoke<ReadProjectFilesResult>('read-project-files', {
          body: { paths: dynamicPaths, branch: 'main' }
        });

        if (!fnError && data) {
          files.push(...data.files);
          
          // For files not found, try to generate content
          for (const path of data.notFound) {
            const content = generateFileContent(path);
            if (content !== null) {
              files.push({ path, content });
            } else {
              skippedUnknown.push(path);
            }
          }
        }
      } catch (err) {
        console.error('[syncSelectedFiles] Failed to read dynamic files:', err);
      }
    }

    // 2. Generate content for files that need timestamps
    for (const path of generatedPaths) {
      const content = generateFileContent(path);
      if (content !== null) {
        files.push({ path, content });
      } else {
        skippedUnknown.push(path);
      }
    }

    if (skippedUnknown.length > 0) {
      toast.warning('Some files skipped', {
        description: `${skippedUnknown.length} files were not recognized and skipped`
      });
    }

    if (files.length === 0) {
      toast.error('No files to sync', { description: 'No valid files selected' });
      return { success: false, error: 'No valid files selected' };
    }

    const message = commitMessage || `[TSiJUKEBOX v4.1.0] Sync ${files.length} selected files - ${new Date().toLocaleDateString('pt-BR')}`;
    
    return syncFiles(files, message, 'manual');
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
    syncSelectedFiles,
    clearError
  };
}
