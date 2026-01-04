// Hook Templates - 10 arquivos
// Generates React hooks for system functionality

const VERSION = '4.1.0';

export function generateHookContent(path: string): string | null {
  const now = new Date().toISOString();
  
  const hookMap: Record<string, () => string> = {
    'src/hooks/system/useGitHubFullSync.ts': () => `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// TSiJUKEBOX Hook - GitHub Full Sync
// Version: ${VERSION} | Generated: ${now}

export interface FileToSync {
  path: string;
  content: string;
}

export interface SyncResult {
  success: boolean;
  commit?: { sha: string; url: string; message: string; filesChanged: number };
  error?: string;
  syncedFiles?: string[];
  skippedFiles?: string[];
}

export interface SyncProgress {
  phase: 'preparing' | 'uploading' | 'committing' | 'done' | 'error';
  current: number;
  total: number;
  currentFile?: string;
}

export function useGitHubFullSync() {
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
      const { data, error: fnError } = await supabase.functions.invoke('full-repo-sync', {
        body: { files, commitMessage: commitMessage || 'Sync from TSiJUKEBOX' }
      });

      if (fnError) throw fnError;

      const result: SyncResult = {
        success: true,
        commit: data?.commit,
        syncedFiles: files.map(f => f.path)
      };

      setLastSync(result);
      setProgress({ phase: 'done', current: files.length, total: files.length });
      toast.success(\`Synced \${files.length} files!\`);
      return result;
    } catch (err: any) {
      const errorResult: SyncResult = { success: false, error: err.message };
      setError(err.message);
      setLastSync(errorResult);
      setProgress({ phase: 'error', current: 0, total: files.length });
      toast.error('Sync failed: ' + err.message);
      return errorResult;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncFullRepository = useCallback(async (commitMessage?: string) => {
    // Implementation for full repository sync
    return syncFiles([], commitMessage);
  }, [syncFiles]);

  const syncSelectedFiles = useCallback(async (
    selectedPaths: string[],
    commitMessage?: string
  ) => {
    // Implementation for selected files sync
    return syncFiles([], commitMessage);
  }, [syncFiles]);

  const clearError = useCallback(() => {
    setError(null);
    setProgress(null);
  }, []);

  return { isSyncing, progress, error, lastSync, syncFiles, syncFullRepository, syncSelectedFiles, clearError };
}
`,

    'src/hooks/system/useGitHubSync.ts': () => `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// TSiJUKEBOX Hook - GitHub Sync (Simple)
// Version: ${VERSION} | Generated: ${now}

export function useGitHubSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncFile = useCallback(async (path: string, content: string) => {
    setIsSyncing(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('github-sync', {
        body: { path, content }
      });
      if (fnError) throw fnError;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isSyncing, error, syncFile };
}
`,

    'src/hooks/system/useAutoSync.ts': () => `import { useState, useEffect, useCallback, useRef } from 'react';
import { useGitHubFullSync } from './useGitHubFullSync';
// TSiJUKEBOX Hook - Auto Sync
// Version: ${VERSION} | Generated: ${now}

const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useAutoSync(intervalMs = DEFAULT_INTERVAL) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  const [nextSyncAt, setNextSyncAt] = useState<Date | null>(null);
  const [syncCount, setSyncCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { syncFullRepository } = useGitHubFullSync();

  const runSync = useCallback(async () => {
    try {
      await syncFullRepository('[AutoSync] Scheduled synchronization');
      setLastAutoSync(new Date());
      setSyncCount(prev => prev + 1);
    } catch (error) {
      console.error('[useAutoSync] Sync failed:', error);
    }
  }, [syncFullRepository]);

  useEffect(() => {
    if (isEnabled) {
      intervalRef.current = setInterval(runSync, intervalMs);
      setNextSyncAt(new Date(Date.now() + intervalMs));
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setNextSyncAt(null);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isEnabled, intervalMs, runSync]);

  const enable = useCallback(() => setIsEnabled(true), []);
  const disable = useCallback(() => setIsEnabled(false), []);

  return { isAutoSyncEnabled: isEnabled, nextSyncAt, lastAutoSync, syncCount, enable, disable };
}
`,

    'src/hooks/system/useCodeScan.ts': () => `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// TSiJUKEBOX Hook - Code Scan
// Version: ${VERSION} | Generated: ${now}

export interface ScanIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ScanResult {
  score: number;
  issues: ScanIssue[];
  timestamp: string;
}

export function useCodeScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (files: string[]) => {
    setIsScanning(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('code-scan', {
        body: { files }
      });

      if (fnError) throw fnError;

      const scanResult: ScanResult = {
        score: data?.score ?? 100,
        issues: data?.issues ?? [],
        timestamp: new Date().toISOString()
      };

      setResult(scanResult);
      toast.success(\`Scan complete! Score: \${scanResult.score}\`);
      return scanResult;
    } catch (err: any) {
      setError(err.message);
      toast.error('Scan failed: ' + err.message);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { isScanning, result, error, scan, clearResult };
}
`,

    'src/hooks/system/useA11yStats.ts': () => `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// TSiJUKEBOX Hook - Accessibility Stats
// Version: ${VERSION} | Generated: ${now}

export interface A11yStats {
  score: number;
  violations: number;
  warnings: number;
  passing: number;
  lastChecked: string;
}

export function useA11yStats() {
  const [stats, setStats] = useState<A11yStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('a11y-check');
      if (fnError) throw fnError;

      setStats({
        score: data?.score ?? 0,
        violations: data?.violations ?? 0,
        warnings: data?.warnings ?? 0,
        passing: data?.passing ?? 0,
        lastChecked: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, error, fetchStats };
}
`,

    'src/hooks/system/useSyncHistory.ts': () => `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// TSiJUKEBOX Hook - Sync History
// Version: ${VERSION} | Generated: ${now}

export interface SyncHistoryEntry {
  id: string;
  commit_sha: string;
  commit_message: string | null;
  files_synced: number;
  status: 'success' | 'partial' | 'failed';
  created_at: string;
}

export function useSyncHistory(limit = 10) {
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('sync_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (dbError) throw dbError;
      setHistory(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, error, refresh: fetchHistory };
}
`,

    'src/hooks/system/useGitHubStats.ts': () => `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// TSiJUKEBOX Hook - GitHub Stats
// Version: ${VERSION} | Generated: ${now}

export interface GitHubStats {
  totalCommits: number;
  totalFiles: number;
  lastCommit: { sha: string; message: string; date: string } | null;
  branch: string;
}

export function useGitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('github-stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch GitHub stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, fetchStats };
}
`,

    'src/hooks/system/useGitHubExport.ts': () => `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// TSiJUKEBOX Hook - GitHub Export
// Version: ${VERSION} | Generated: ${now}

export interface ExportResult {
  success: boolean;
  commit?: { sha: string; url: string };
  error?: string;
}

export function useGitHubExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [lastExport, setLastExport] = useState<Date | null>(null);

  const checkSyncStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('github-sync', {
        body: { action: 'status' }
      });
      setSyncStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportToGitHub = useCallback(async (files: any[], commitMessage?: string): Promise<ExportResult> => {
    setIsExporting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('github-sync', {
        body: { action: 'export', files, commitMessage }
      });
      if (fnError) throw fnError;
      setLastExport(new Date());
      toast.success('Export complete!');
      return { success: true, commit: data?.commit };
    } catch (err: any) {
      setError(err.message);
      toast.error('Export failed');
      return { success: false, error: err.message };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isExporting, isLoading, error, syncStatus, lastExport, checkSyncStatus, exportToGitHub, clearError };
}
`,

    'src/hooks/system/useConnectionMonitor.ts': () => `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// TSiJUKEBOX Hook - Connection Monitor
// Version: ${VERSION} | Generated: ${now}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export function useConnectionMonitor() {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const ping = useCallback(async () => {
    const start = Date.now();
    try {
      await supabase.from('_test_connection').select('*').limit(1).maybeSingle();
      setLatency(Date.now() - start);
      setStatus('connected');
      setLastPing(new Date());
    } catch {
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [ping]);

  return { status, lastPing, latency, ping };
}
`,

    'src/hooks/system/useNetworkStatus.ts': () => `import { useState, useEffect } from 'react';
// TSiJUKEBOX Hook - Network Status
// Version: ${VERSION} | Generated: ${now}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger reconnection logic
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
`,
  };

  const generator = hookMap[path];
  if (generator) {
    return generator();
  }

  return null;
}
