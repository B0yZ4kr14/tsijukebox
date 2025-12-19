import { useState, useEffect, useRef, useCallback } from 'react';
import type { SystemStatus } from '@/lib/api/types';

interface UseWebSocketStatusOptions {
  url: string;
  enabled?: boolean;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface WebSocketStatusResult {
  status: SystemStatus | null;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

export function useWebSocketStatus({
  url,
  enabled = true,
  onError,
  onConnect,
  onDisconnect,
}: UseWebSocketStatusOptions): WebSocketStatusResult {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Convert HTTP URL to WebSocket URL
      const wsUrl = url.replace(/^http/, 'ws').replace('/api', '/ws/status');
      if (import.meta.env.DEV) console.log('[WebSocket] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (import.meta.env.DEV) console.log('[WebSocket] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStatus(data);
        } catch (e) {
          if (import.meta.env.DEV) console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      ws.onerror = (event) => {
        if (import.meta.env.DEV) console.error('[WebSocket] Error:', event);
        setError(new Error('WebSocket connection error'));
        onError?.(event);
      };

      ws.onclose = (event) => {
        if (import.meta.env.DEV) console.log('[WebSocket] Disconnected, code:', event.code);
        setIsConnected(false);
        wsRef.current = null;
        onDisconnect?.();

        // Attempt reconnection with exponential backoff
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          if (import.meta.env.DEV) console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          if (import.meta.env.DEV) console.log('[WebSocket] Max reconnect attempts reached');
          setError(new Error('Failed to connect after multiple attempts'));
        }
      };
    } catch (e) {
      if (import.meta.env.DEV) console.error('[WebSocket] Connection error:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    }
  }, [url, enabled, onConnect, onDisconnect, onError]);

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
    reconnectAttemptsRef.current = 0;
    disconnect();
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    status,
    isConnected,
    error,
    reconnect,
  };
}
