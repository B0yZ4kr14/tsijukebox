import { useState, useEffect, useCallback, useRef } from 'react';

export interface HealthMetrics {
  timestamp: string;
  services: Record<string, 'active' | 'inactive' | 'failed' | 'unknown'>;
  metrics: {
    cpuPercent: number;
    memoryPercent: number;
    diskFreeGb: number;
    diskTotalGb: number;
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warn' | 'error' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

interface UseHealthMonitorWebSocketOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseHealthMonitorWebSocketResult {
  data: HealthMetrics | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
  history: HealthMetrics[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const MAX_HISTORY = 30;

export function useHealthMonitorWebSocket(
  options: UseHealthMonitorWebSocketOptions = {}
): UseHealthMonitorWebSocketResult {
  const { enabled = true, onConnect, onDisconnect, onError } = options;

  const [data, setData] = useState<HealthMetrics | null>(null);
  const [history, setHistory] = useState<HealthMetrics[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!enabled || !SUPABASE_URL) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const fullUrl = `${wsUrl}/functions/v1/health-monitor-ws`;

    console.log('[HealthMonitor] Connecting to:', fullUrl);

    try {
      wsRef.current = new WebSocket(fullUrl);

      wsRef.current.onopen = () => {
        console.log('[HealthMonitor] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const healthData: HealthMetrics = JSON.parse(event.data);
          setData(healthData);
          setHistory((prev) => {
            const updated = [...prev, healthData];
            return updated.slice(-MAX_HISTORY);
          });
        } catch (e) {
          console.error('[HealthMonitor] Parse error:', e);
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('[HealthMonitor] Error:', event);
        setError('Connection error');
        onError?.(event);
      };

      wsRef.current.onclose = () => {
        console.log('[HealthMonitor] Disconnected');
        setIsConnected(false);
        onDisconnect?.();

        if (enabled && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          console.log(`[HealthMonitor] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    } catch (e) {
      console.error('[HealthMonitor] Connection failed:', e);
      setError('Failed to connect');
    }
  }, [enabled, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    disconnect();
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { data, isConnected, error, reconnect, history };
}