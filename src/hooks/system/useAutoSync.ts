import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutoSyncConfig {
  isEnabled: boolean;
  syncInterval: number; // in minutes
  lastSync: string | null;
  pendingFiles: string[];
}

export interface AutoSyncStatus {
  isEnabled: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  pendingFiles: string[];
  syncInterval: number;
}

export interface UseAutoSyncReturn extends AutoSyncStatus {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  addPendingFile: (filePath: string) => void;
  addPendingFiles: (filePaths: string[]) => void;
  removePendingFile: (filePath: string) => void;
  clearPendingFiles: () => void;
  triggerSync: () => Promise<void>;
  setSyncInterval: (minutes: number) => void;
  getTimeUntilNextSync: () => number | null;
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
    lastSync: null,
    pendingFiles: []
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [nextSync, setNextSync] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Persist config changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Calculate next sync time
  const updateNextSync = useCallback(() => {
    if (config.isEnabled && config.lastSync) {
      const lastSyncDate = new Date(config.lastSync);
      const next = new Date(lastSyncDate.getTime() + config.syncInterval * 60 * 1000);
      setNextSync(next);
    } else if (config.isEnabled) {
      // If no last sync, schedule for syncInterval from now
      const next = new Date(Date.now() + config.syncInterval * 60 * 1000);
      setNextSync(next);
    } else {
      setNextSync(null);
    }
  }, [config.isEnabled, config.lastSync, config.syncInterval]);

  useEffect(() => {
    updateNextSync();
  }, [updateNextSync]);

  // Sync function
  const triggerSync = useCallback(async () => {
    if (isSyncing || config.pendingFiles.length === 0) {
      if (config.pendingFiles.length === 0) {
        toast.info('Nenhum arquivo pendente para sincronizar');
      }
      return;
    }

    setIsSyncing(true);
    toast.loading('Sincronizando arquivos...', { id: 'auto-sync' });

    try {
      const { data, error } = await supabase.functions.invoke('auto-sync-repository', {
        body: {
          files: config.pendingFiles,
          commitMessage: `[Auto-Sync] ${config.pendingFiles.length} arquivo(s) - ${new Date().toLocaleString('pt-BR')}`
        }
      });

      if (error) throw error;

      const now = new Date().toISOString();
      setConfig(prev => ({
        ...prev,
        lastSync: now,
        pendingFiles: []
      }));

      toast.success(`✅ ${config.pendingFiles.length} arquivo(s) sincronizado(s)`, { id: 'auto-sync' });
    } catch (error) {
      console.error('Auto-sync failed:', error);
      toast.error('Falha na sincronização automática', { id: 'auto-sync' });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, config.pendingFiles]);

  // Scheduler
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (config.isEnabled && config.syncInterval > 0) {
      timerRef.current = setInterval(() => {
        if (config.pendingFiles.length > 0) {
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
  }, [config.isEnabled, config.syncInterval, config.pendingFiles.length, triggerSync, updateNextSync]);

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

  const addPendingFile = useCallback((filePath: string) => {
    setConfig(prev => {
      if (prev.pendingFiles.includes(filePath)) return prev;
      return { ...prev, pendingFiles: [...prev.pendingFiles, filePath] };
    });
  }, []);

  const addPendingFiles = useCallback((filePaths: string[]) => {
    setConfig(prev => {
      const newFiles = filePaths.filter(f => !prev.pendingFiles.includes(f));
      if (newFiles.length === 0) return prev;
      return { ...prev, pendingFiles: [...prev.pendingFiles, ...newFiles] };
    });
  }, []);

  const removePendingFile = useCallback((filePath: string) => {
    setConfig(prev => ({
      ...prev,
      pendingFiles: prev.pendingFiles.filter(f => f !== filePath)
    }));
  }, []);

  const clearPendingFiles = useCallback(() => {
    setConfig(prev => ({ ...prev, pendingFiles: [] }));
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
    pendingFiles: config.pendingFiles,
    syncInterval: config.syncInterval,
    enable,
    disable,
    toggle,
    addPendingFile,
    addPendingFiles,
    removePendingFile,
    clearPendingFiles,
    triggerSync,
    setSyncInterval,
    getTimeUntilNextSync
  };
}
