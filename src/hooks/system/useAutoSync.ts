import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PendingSyncFile {
  id: string;
  file_path: string;
  file_hash: string | null;
  category: string;
  priority: number;
  status: string;
  detected_at: string;
  synced_at: string | null;
  error_message: string | null;
}

export interface AutoSyncConfig {
  isEnabled: boolean;
  syncInterval: number; // in minutes
  lastSync: string | null;
}

export interface AutoSyncStatus {
  isEnabled: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  pendingFiles: PendingSyncFile[];
  pendingCount: number;
  syncInterval: number;
}

export interface UseAutoSyncReturn extends AutoSyncStatus {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  triggerSync: () => Promise<void>;
  setSyncInterval: (minutes: number) => void;
  getTimeUntilNextSync: () => number | null;
  refreshPendingFiles: () => Promise<void>;
  markFileAsSynced: (fileId: string) => Promise<void>;
  clearSyncedFiles: () => Promise<void>;
}

const STORAGE_KEY = 'tsijukebox-auto-sync-config';
const DEFAULT_INTERVAL = 30; // 30 minutes

function loadConfig(): AutoSyncConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load auto-sync config:', e);
  }
  return {
    isEnabled: false,
    syncInterval: DEFAULT_INTERVAL,
    lastSync: null
  };
}

function saveConfig(config: AutoSyncConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save auto-sync config:', e);
  }
}

export function useAutoSync(): UseAutoSyncReturn {
  const [config, setConfig] = useState<AutoSyncConfig>(loadConfig);
  const [pendingFiles, setPendingFiles] = useState<PendingSyncFile[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [nextSync, setNextSync] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist config changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Fetch pending files from Supabase
  const refreshPendingFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pending_sync_files')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: true })
        .order('detected_at', { ascending: true });

      if (error) {
        console.error('[useAutoSync] Error fetching pending files:', error);
        return;
      }

      setPendingFiles(data || []);
    } catch (err) {
      console.error('[useAutoSync] Fetch error:', err);
    }
  }, []);

  // Setup Realtime subscription for pending_sync_files
  useEffect(() => {
    // Initial fetch
    refreshPendingFiles();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('pending-sync-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_sync_files'
        },
        (payload) => {
          console.log('[useAutoSync] Realtime update:', payload);
          refreshPendingFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshPendingFiles]);

  // Calculate next sync time
  const updateNextSync = useCallback(() => {
    if (config.isEnabled && config.lastSync) {
      const lastSyncDate = new Date(config.lastSync);
      const next = new Date(lastSyncDate.getTime() + config.syncInterval * 60 * 1000);
      setNextSync(next);
    } else if (config.isEnabled) {
      const next = new Date(Date.now() + config.syncInterval * 60 * 1000);
      setNextSync(next);
    } else {
      setNextSync(null);
    }
  }, [config.isEnabled, config.lastSync, config.syncInterval]);

  useEffect(() => {
    updateNextSync();
  }, [updateNextSync]);

  // Mark file as synced in database
  const markFileAsSynced = useCallback(async (fileId: string) => {
    try {
      await supabase
        .from('pending_sync_files')
        .update({ 
          status: 'synced', 
          synced_at: new Date().toISOString() 
        })
        .eq('id', fileId);
    } catch (err) {
      console.error('[useAutoSync] Error marking file as synced:', err);
    }
  }, []);

  // Clear all synced files from database
  const clearSyncedFiles = useCallback(async () => {
    try {
      await supabase
        .from('pending_sync_files')
        .delete()
        .eq('status', 'synced');
      
      toast.success('Arquivos sincronizados removidos');
    } catch (err) {
      console.error('[useAutoSync] Error clearing synced files:', err);
    }
  }, []);

  // Sync function
  const triggerSync = useCallback(async () => {
    if (isSyncing || pendingFiles.length === 0) {
      if (pendingFiles.length === 0) {
        toast.info('Nenhum arquivo pendente para sincronizar');
      }
      return;
    }

    setIsSyncing(true);
    toast.loading('Sincronizando arquivos...', { id: 'auto-sync' });

    try {
      // Mark files as syncing
      const fileIds = pendingFiles.map(f => f.id);
      await supabase
        .from('pending_sync_files')
        .update({ status: 'syncing' })
        .in('id', fileIds);

      // Prepare files for sync
      const filesToSync = pendingFiles.map(f => ({
        path: f.file_path,
        content: '' // Content will be fetched by the edge function
      }));

      const { data, error } = await supabase.functions.invoke('auto-sync-repository', {
        body: {
          files: filesToSync,
          commitMessage: `[Auto-Sync] ${pendingFiles.length} arquivo(s) - ${new Date().toLocaleString('pt-BR')}`
        }
      });

      if (error) throw error;

      // Mark all as synced
      await supabase
        .from('pending_sync_files')
        .update({ 
          status: 'synced', 
          synced_at: new Date().toISOString() 
        })
        .in('id', fileIds);

      const now = new Date().toISOString();
      setConfig(prev => ({
        ...prev,
        lastSync: now
      }));

      toast.success(`✅ ${pendingFiles.length} arquivo(s) sincronizado(s)`, { id: 'auto-sync' });
      
      // Refresh to get updated state
      refreshPendingFiles();
    } catch (error) {
      console.error('Auto-sync failed:', error);
      
      // Mark files as error
      const fileIds = pendingFiles.map(f => f.id);
      await supabase
        .from('pending_sync_files')
        .update({ 
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .in('id', fileIds);

      toast.error('Falha na sincronização automática', { id: 'auto-sync' });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, pendingFiles, refreshPendingFiles]);

  // Scheduler
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (config.isEnabled && config.syncInterval > 0) {
      timerRef.current = setInterval(() => {
        if (pendingFiles.length > 0) {
          triggerSync();
        }
        updateNextSync();
      }, config.syncInterval * 60 * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [config.isEnabled, config.syncInterval, pendingFiles.length, triggerSync, updateNextSync]);

  // Actions
  const enable = useCallback(() => {
    setConfig(prev => ({ ...prev, isEnabled: true }));
    toast.success('Auto-sync ativado');
  }, []);

  const disable = useCallback(() => {
    setConfig(prev => ({ ...prev, isEnabled: false }));
    toast.info('Auto-sync desativado');
  }, []);

  const toggle = useCallback(() => {
    setConfig(prev => {
      const newEnabled = !prev.isEnabled;
      toast[newEnabled ? 'success' : 'info'](
        newEnabled ? 'Auto-sync ativado' : 'Auto-sync desativado'
      );
      return { ...prev, isEnabled: newEnabled };
    });
  }, []);

  const setSyncInterval = useCallback((minutes: number) => {
    if (minutes < 1) minutes = 1;
    if (minutes > 1440) minutes = 1440; // Max 24 hours
    setConfig(prev => ({ ...prev, syncInterval: minutes }));
    toast.success(`Intervalo de sync: ${minutes} minuto(s)`);
  }, []);

  const getTimeUntilNextSync = useCallback(() => {
    if (!nextSync) return null;
    const diff = nextSync.getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }, [nextSync]);

  return {
    isEnabled: config.isEnabled,
    isSyncing,
    lastSync: config.lastSync ? new Date(config.lastSync) : null,
    nextSync,
    pendingFiles,
    pendingCount: pendingFiles.length,
    syncInterval: config.syncInterval,
    enable,
    disable,
    toggle,
    triggerSync,
    setSyncInterval,
    getTimeUntilNextSync,
    refreshPendingFiles,
    markFileAsSynced,
    clearSyncedFiles
  };
}
