import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GitHubFile {
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
}

export interface GitHubCommit {
  sha: string;
  url: string;
  message: string;
  filesChanged: number;
}

export interface GitHubSyncStatus {
  connected: boolean;
  repository?: {
    name: string;
    url: string;
    defaultBranch: string;
    private: boolean;
  };
  latestCommit?: {
    sha: string;
    message: string;
    date: string;
    author: string;
  };
}

export interface UseGitHubExportReturn {
  isExporting: boolean;
  isLoading: boolean;
  error: string | null;
  syncStatus: GitHubSyncStatus | null;
  lastExport: Date | null;
  exportToGitHub: (files: Array<{ path: string; content: string }>, commitMessage?: string) => Promise<GitHubCommit | null>;
  syncFullProject: (files: Array<{ path: string; content: string }>) => Promise<GitHubCommit | null>;
  checkSyncStatus: () => Promise<GitHubSyncStatus | null>;
  listRepositoryFiles: (path?: string) => Promise<GitHubFile[]>;
  getFileContent: (path: string) => Promise<string | null>;
  clearError: () => void;
}

export function useGitHubExport(): UseGitHubExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<GitHubSyncStatus | null>(null);
  const [lastExport, setLastExport] = useState<Date | null>(null);

  const callGitHubSync = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const { data, error: fnError } = await supabase.functions.invoke('github-sync-export', {
      body: { action, ...params },
    });

    if (fnError) {
      throw new Error(fnError.message || 'Failed to call GitHub sync function');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }, []);

  const checkSyncStatus = useCallback(async (): Promise<GitHubSyncStatus | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await callGitHubSync('sync-status');
      
      const status: GitHubSyncStatus = {
        connected: data.status === 'connected',
        repository: data.repository,
        latestCommit: data.latestCommit,
      };
      
      setSyncStatus(status);
      return status;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check sync status';
      setError(message);
      setSyncStatus({ connected: false });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [callGitHubSync]);

  const listRepositoryFiles = useCallback(async (path?: string): Promise<GitHubFile[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await callGitHubSync('list-files', { filePath: path });
      return data.files || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list repository files';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callGitHubSync]);

  const getFileContent = useCallback(async (path: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await callGitHubSync('get-file', { filePath: path });
      return data.file?.content || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get file content';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [callGitHubSync]);

  const exportToGitHub = useCallback(async (
    files: Array<{ path: string; content: string }>,
    commitMessage?: string
  ): Promise<GitHubCommit | null> => {
    if (files.length === 0) {
      setError('No files to export');
      return null;
    }

    setIsExporting(true);
    setError(null);

    try {
      const data = await callGitHubSync('export-files', {
        files,
        commitMessage: commitMessage || `[TSiJUKEBOX] Export ${files.length} files`,
      });

      const commit: GitHubCommit = data.commit || {
        sha: 'batch-update',
        url: `https://github.com/B0yZ4kr14/TSiJUKEBOX`,
        message: commitMessage || 'Batch update',
        filesChanged: files.length,
      };

      setLastExport(new Date());
      toast.success(`Exportado ${files.length} arquivos para GitHub`);
      
      return commit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export to GitHub';
      setError(message);
      toast.error(`Erro ao exportar: ${message}`);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [callGitHubSync]);

  const syncFullProject = useCallback(async (
    files: Array<{ path: string; content: string }>
  ): Promise<GitHubCommit | null> => {
    if (files.length === 0) {
      setError('No files to sync');
      return null;
    }

    setIsExporting(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const commitMessage = `[TSiJUKEBOX] Full project sync - ${timestamp} (${files.length} files)`;
      
      const data = await callGitHubSync('create-commit', {
        files,
        commitMessage,
      });

      const commit = data.commit as GitHubCommit;
      setLastExport(new Date());
      
      toast.success(`Projeto sincronizado: ${commit.filesChanged} arquivos`);
      
      return commit;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync project';
      setError(message);
      toast.error(`Erro na sincronização: ${message}`);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [callGitHubSync]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExporting,
    isLoading,
    error,
    syncStatus,
    lastExport,
    exportToGitHub,
    syncFullProject,
    checkSyncStatus,
    listRepositoryFiles,
    getFileContent,
    clearError,
  };
}
