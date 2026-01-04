// Templates for Hooks System (28 main files, excluding /github/ subdirectory)

export function generateHooksSystemContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/system/index.ts':
      return `// System hooks barrel export
export { useAutoSync } from './useAutoSync';
export { useCodeScan } from './useCodeScan';
export { useConnectionMonitor } from './useConnectionMonitor';
export { useFileChangeDetector } from './useFileChangeDetector';
export { useGitHubCache } from './useGitHubCache';
export { useGitHubExport } from './useGitHubExport';
export { useGitHubFullSync } from './useGitHubFullSync';
export { useGitHubStats } from './useGitHubStats';
export { useGitHubSync } from './useGitHubSync';
export { useInstallerMetrics } from './useInstallerMetrics';
export { useKioskMonitor } from './useKioskMonitor';
export { useLogs } from './useLogs';
export { useMockData } from './useMockData';
export { useNetworkStatus } from './useNetworkStatus';
export { usePlaybackStats } from './usePlaybackStats';
export { useStatus } from './useStatus';
export { useSyncHistory } from './useSyncHistory';
export { useWeather } from './useWeather';
export { useWebSocketStatus } from './useWebSocketStatus';
`;

    case 'src/hooks/system/useAutoSync.ts':
      return `import { useState, useEffect, useCallback, useRef } from 'react';

interface AutoSyncConfig {
  enabled: boolean;
  intervalMinutes: number;
}

export function useAutoSync(onSync: () => Promise<void>) {
  const [config, setConfig] = useState<AutoSyncConfig>(() => {
    try {
      return JSON.parse(localStorage.getItem('auto_sync_config') || '{"enabled":false,"intervalMinutes":30}');
    } catch { return { enabled: false, intervalMinutes: 30 }; }
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const performSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await onSync();
      setLastSync(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [onSync, isSyncing]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (config.enabled) {
      intervalRef.current = setInterval(performSync, config.intervalMinutes * 60 * 1000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [config, performSync]);

  const updateConfig = useCallback((updates: Partial<AutoSyncConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('auto_sync_config', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { config, updateConfig, lastSync, isSyncing, triggerSync: performSync };
}
`;

    case 'src/hooks/system/useCodeScan.ts':
      return `import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CodeIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
}

interface ScanResult {
  fileName: string;
  score: number;
  issues: CodeIssue[];
  scannedAt: string;
}

export function useCodeScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanCode = useCallback(async (fileName: string, code: string) => {
    setIsScanning(true);
    setError(null);

    try {
      // Simplified scan logic - checks for common issues
      const issues: CodeIssue[] = [];
      
      if (code.includes('console.log')) {
        issues.push({ severity: 'low', message: 'Console.log found', rule: 'no-console' });
      }
      if (code.includes('any')) {
        issues.push({ severity: 'medium', message: 'Use of "any" type', rule: 'no-any' });
      }
      if (code.length > 500 && !code.includes('//')) {
        issues.push({ severity: 'low', message: 'Large file without comments', rule: 'require-comments' });
      }

      const score = Math.max(0, 100 - issues.length * 10);
      const result: ScanResult = {
        fileName,
        score,
        issues,
        scannedAt: new Date().toISOString()
      };

      // Save to database
      await supabase.from('code_scan_history').insert({
        file_name: fileName,
        score,
        issues: issues as any,
        issues_count: issues.length,
        low_count: issues.filter(i => i.severity === 'low').length,
        medium_count: issues.filter(i => i.severity === 'medium').length,
        high_count: issues.filter(i => i.severity === 'high').length,
        critical_count: issues.filter(i => i.severity === 'critical').length
      });

      setResults(prev => [result, ...prev].slice(0, 50));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('code_scan_history')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(50);
    
    if (data) {
      setResults(data.map(d => ({
        fileName: d.file_name,
        score: d.score,
        issues: (d.issues as any) || [],
        scannedAt: d.scanned_at || d.created_at || ''
      })));
    }
  }, []);

  return { isScanning, results, error, scanCode, loadHistory };
}
`;

    case 'src/hooks/system/useConnectionMonitor.ts':
      return `import { useState, useEffect, useCallback } from 'react';

interface ConnectionStatus {
  isOnline: boolean;
  latency: number | null;
  lastCheck: Date | null;
  connectionType: string | null;
}

export function useConnectionMonitor(checkUrl = '/api/health', intervalMs = 30000) {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    latency: null,
    lastCheck: null,
    connectionType: null
  });

  const checkConnection = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      await fetch(checkUrl, { method: 'HEAD', cache: 'no-cache' });
      const latency = Math.round(performance.now() - startTime);
      
      setStatus({
        isOnline: true,
        latency,
        lastCheck: new Date(),
        connectionType: (navigator as any).connection?.effectiveType || null
      });
    } catch {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastCheck: new Date()
      }));
    }
  }, [checkUrl]);

  useEffect(() => {
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnection();
    const interval = setInterval(checkConnection, intervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection, intervalMs]);

  return { ...status, checkConnection };
}
`;

    case 'src/hooks/system/useFileChangeDetector.ts':
      return `import { useState, useCallback, useRef } from 'react';

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  hash?: string;
  detectedAt: string;
}

export function useFileChangeDetector() {
  const [changes, setChanges] = useState<FileChange[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const hashCache = useRef<Map<string, string>>(new Map());

  const hashContent = (content: string): string => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };

  const detectChanges = useCallback((files: { path: string; content: string }[]) => {
    setIsDetecting(true);
    const newChanges: FileChange[] = [];
    const currentPaths = new Set(files.map(f => f.path));

    // Check for modified and added files
    for (const file of files) {
      const newHash = hashContent(file.content);
      const oldHash = hashCache.current.get(file.path);

      if (!oldHash) {
        newChanges.push({ path: file.path, type: 'added', hash: newHash, detectedAt: new Date().toISOString() });
      } else if (oldHash !== newHash) {
        newChanges.push({ path: file.path, type: 'modified', hash: newHash, detectedAt: new Date().toISOString() });
      }

      hashCache.current.set(file.path, newHash);
    }

    // Check for deleted files
    for (const [path] of hashCache.current) {
      if (!currentPaths.has(path)) {
        newChanges.push({ path, type: 'deleted', detectedAt: new Date().toISOString() });
        hashCache.current.delete(path);
      }
    }

    setChanges(newChanges);
    setIsDetecting(false);
    return newChanges;
  }, []);

  const clearChanges = useCallback(() => setChanges([]), []);
  const resetCache = useCallback(() => hashCache.current.clear(), []);

  return { changes, isDetecting, detectChanges, clearChanges, resetCache };
}
`;

    case 'src/hooks/system/useGitHubCache.ts':
      return `import { useState, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

const CACHE_PREFIX = 'github_cache_';

export function useGitHubCache<T>(key: string, expiresInMs = 5 * 60 * 1000) {
  const [isLoading, setIsLoading] = useState(false);

  const getCached = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(\`\${CACHE_PREFIX}\${key}\`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      if (Date.now() - entry.timestamp > entry.expiresIn) {
        localStorage.removeItem(\`\${CACHE_PREFIX}\${key}\`);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }, [key]);

  const setCache = useCallback((data: T) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs
    };
    localStorage.setItem(\`\${CACHE_PREFIX}\${key}\`, JSON.stringify(entry));
  }, [key, expiresInMs]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(\`\${CACHE_PREFIX}\${key}\`);
  }, [key]);

  const fetchWithCache = useCallback(async (fetchFn: () => Promise<T>): Promise<T> => {
    const cached = getCached();
    if (cached) return cached;

    setIsLoading(true);
    try {
      const data = await fetchFn();
      setCache(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [getCached, setCache]);

  return { getCached, setCache, clearCache, fetchWithCache, isLoading };
}

export function clearAllGitHubCache() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
`;

    case 'src/hooks/system/useInstallerMetrics.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InstallerMetric {
  id: string;
  session_id: string;
  status: string;
  distro_name: string | null;
  distro_family: string | null;
  install_mode: string | null;
  started_at: string;
  completed_at: string | null;
  total_duration_ms: number | null;
}

export function useInstallerMetrics() {
  const [metrics, setMetrics] = useState<InstallerMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('installer_metrics')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const getStats = useCallback(() => {
    const total = metrics.length;
    const successful = metrics.filter(m => m.status === 'completed').length;
    const failed = metrics.filter(m => m.status === 'failed').length;
    const avgDuration = metrics
      .filter(m => m.total_duration_ms)
      .reduce((sum, m) => sum + (m.total_duration_ms || 0), 0) / (successful || 1);

    return { total, successful, failed, avgDuration, successRate: total > 0 ? (successful / total) * 100 : 0 };
  }, [metrics]);

  return { metrics, isLoading, error, refetch: fetchMetrics, getStats };
}
`;

    case 'src/hooks/system/useKioskMonitor.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KioskConnection {
  id: string;
  hostname: string;
  machine_id: string | null;
  status: string | null;
  last_heartbeat: string | null;
  cpu_usage_percent: number | null;
  memory_used_mb: number | null;
  uptime_seconds: number | null;
  ip_address: string | null;
}

export function useKioskMonitor() {
  const [connections, setConnections] = useState<KioskConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('kiosk_connections')
        .select('*')
        .order('last_heartbeat', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();

    const channel = supabase
      .channel('kiosk_connections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosk_connections' }, () => {
        fetchConnections();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConnections]);

  const sendCommand = useCallback(async (machineId: string, command: string, params?: Record<string, unknown>) => {
    await supabase.from('kiosk_commands').insert({
      machine_id: machineId,
      command,
      params: params || {}
    });
  }, []);

  const getOnlineCount = useCallback(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    return connections.filter(c => c.last_heartbeat && c.last_heartbeat > fiveMinutesAgo).length;
  }, [connections]);

  return { connections, isLoading, error, refetch: fetchConnections, sendCommand, getOnlineCount };
}
`;

    case 'src/hooks/system/useLogs.ts':
      return `import { useState, useCallback } from 'react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

const MAX_LOGS = 1000;

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  const log = useCallback((level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    const entry: LogEntry = {
      id: \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      level,
      message,
      timestamp: new Date().toISOString(),
      meta
    };

    setLogs(prev => [entry, ...prev].slice(0, MAX_LOGS));

    if (import.meta.env.DEV) {
      const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      fn(\`[\${level.toUpperCase()}] \${message}\`, meta || '');
    }
  }, []);

  const debug = useCallback((msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta), [log]);
  const info = useCallback((msg: string, meta?: Record<string, unknown>) => log('info', msg, meta), [log]);
  const warn = useCallback((msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta), [log]);
  const error = useCallback((msg: string, meta?: Record<string, unknown>) => log('error', msg, meta), [log]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);
  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs: filteredLogs, filter, setFilter, debug, info, warn, error, clearLogs, allLogs: logs };
}
`;

    case 'src/hooks/system/useMockData.ts':
      return `import { useState, useCallback } from 'react';

interface MockDataConfig {
  delay?: number;
  shouldFail?: boolean;
  failureRate?: number;
}

export function useMockData<T>(defaultData: T, config: MockDataConfig = {}) {
  const [data, setData] = useState<T>(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { delay = 500, shouldFail = false, failureRate = 0 } = config;

  const fetchMock = useCallback(async (newData?: T): Promise<T> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shouldFailNow = shouldFail || Math.random() < failureRate;
        
        if (shouldFailNow) {
          const err = new Error('Mock fetch failed');
          setError(err);
          setIsLoading(false);
          reject(err);
        } else {
          const result = newData ?? data;
          setData(result);
          setIsLoading(false);
          resolve(result);
        }
      }, delay);
    });
  }, [data, delay, shouldFail, failureRate]);

  const reset = useCallback(() => {
    setData(defaultData);
    setError(null);
    setIsLoading(false);
  }, [defaultData]);

  return { data, setData, isLoading, error, fetchMock, reset };
}
`;

    case 'src/hooks/system/useNetworkStatus.ts':
      return `import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine
  });

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as any).connection;
      setStatus({
        isOnline: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData
      });
    };

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return status;
}
`;

    case 'src/hooks/system/usePlaybackStats.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlaybackStat {
  id: string;
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name: string | null;
  album_art: string | null;
  duration_ms: number | null;
  played_at: string | null;
  completed: boolean | null;
  provider: string;
}

export function usePlaybackStats() {
  const [stats, setStats] = useState<PlaybackStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async (limit = 50) => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('playback_stats')
        .select('*')
        .order('played_at', { ascending: false })
        .limit(limit);
      
      setStats(data || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordPlayback = useCallback(async (track: Omit<PlaybackStat, 'id' | 'played_at'>) => {
    await supabase.from('playback_stats').insert({
      ...track,
      played_at: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getTopTracks = useCallback((limit = 10) => {
    const counts = stats.reduce((acc, s) => {
      acc[s.track_id] = (acc[s.track_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([trackId, count]) => ({
        track: stats.find(s => s.track_id === trackId)!,
        playCount: count
      }));
  }, [stats]);

  return { stats, isLoading, fetchStats, recordPlayback, getTopTracks };
}
`;

    case 'src/hooks/system/useStatus.ts':
      return `import { useState, useEffect, useCallback } from 'react';

interface SystemStatus {
  api: 'online' | 'offline' | 'degraded';
  database: 'connected' | 'disconnected' | 'error';
  lastCheck: Date | null;
}

export function useStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'offline',
    database: 'disconnected',
    lastCheck: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      // Simple health check
      const start = Date.now();
      const response = await fetch('/api/health', { method: 'HEAD' });
      const latency = Date.now() - start;

      setStatus({
        api: response.ok ? (latency > 1000 ? 'degraded' : 'online') : 'offline',
        database: 'connected', // Assume connected if API responds
        lastCheck: new Date()
      });
    } catch {
      setStatus(prev => ({
        ...prev,
        api: 'offline',
        lastCheck: new Date()
      }));
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const isHealthy = status.api === 'online' && status.database === 'connected';

  return { status, isChecking, checkStatus, isHealthy };
}
`;

    case 'src/hooks/system/useSyncHistory.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncEntry {
  id: string;
  commit_sha: string;
  commit_message: string | null;
  commit_url: string | null;
  branch: string | null;
  files_synced: number | null;
  files_skipped: number | null;
  sync_type: string | null;
  status: string | null;
  duration_ms: number | null;
  created_at: string | null;
}

export function useSyncHistory() {
  const [history, setHistory] = useState<SyncEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (limit = 50) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sync_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEntry = useCallback(async (entry: Omit<SyncEntry, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('sync_history')
      .insert(entry)
      .select()
      .single();

    if (!error && data) {
      setHistory(prev => [data, ...prev]);
    }
    return { data, error };
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStats = useCallback(() => {
    const total = history.length;
    const successful = history.filter(h => h.status === 'success').length;
    const totalFiles = history.reduce((sum, h) => sum + (h.files_synced || 0), 0);
    
    return { total, successful, successRate: total > 0 ? (successful / total) * 100 : 0, totalFiles };
  }, [history]);

  return { history, isLoading, error, fetchHistory, addEntry, getStats };
}
`;

    case 'src/hooks/system/useWeather.ts':
      return `import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

export function useWeather() {
  const { weather } = useSettings();
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!weather?.apiKey || !weather?.location) {
      setError('Weather not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        \`https://api.weatherapi.com/v1/current.json?key=\${weather.apiKey}&q=\${weather.location}\`
      );

      if (!response.ok) throw new Error('Weather fetch failed');

      const result = await response.json();
      setData({
        temperature: result.current.temp_c,
        condition: result.current.condition.text,
        humidity: result.current.humidity,
        windSpeed: result.current.wind_kph,
        icon: result.current.condition.icon,
        location: result.location.name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  }, [weather?.apiKey, weather?.location]);

  useEffect(() => {
    if (weather?.apiKey && weather?.location) {
      fetchWeather();
      const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Refresh every 30 min
      return () => clearInterval(interval);
    }
  }, [fetchWeather, weather?.apiKey, weather?.location]);

  return { data, isLoading, error, refresh: fetchWeather, isConfigured: !!(weather?.apiKey && weather?.location) };
}
`;

    case 'src/hooks/system/useWebSocketStatus.ts':
      return `import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketStatus {
  isConnected: boolean;
  lastMessage: unknown | null;
  lastError: string | null;
  reconnectAttempts: number;
}

export function useWebSocketStatus(url: string, autoConnect = true) {
  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    lastMessage: null,
    lastError: null,
    reconnectAttempts: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setStatus(prev => ({ ...prev, isConnected: true, reconnectAttempts: 0, lastError: null }));
      };

      wsRef.current.onclose = () => {
        setStatus(prev => ({ ...prev, isConnected: false }));
        // Auto-reconnect with backoff
        const delay = Math.min(1000 * Math.pow(2, status.reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setStatus(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
          connect();
        }, delay);
      };

      wsRef.current.onerror = () => {
        setStatus(prev => ({ ...prev, lastError: 'WebSocket error' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStatus(prev => ({ ...prev, lastMessage: data }));
        } catch {
          setStatus(prev => ({ ...prev, lastMessage: event.data }));
        }
      };
    } catch (err) {
      setStatus(prev => ({ ...prev, lastError: err instanceof Error ? err.message : 'Connection failed' }));
    }
  }, [url, status.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return disconnect;
  }, [autoConnect, connect, disconnect]);

  return { ...status, connect, disconnect, send };
}
`;

    default:
      return null;
  }
}
