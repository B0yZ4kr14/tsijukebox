import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface ClientStatusUpdate {
  clientId: string;
  status: 'online' | 'offline' | 'warning';
  timestamp: string;
  metrics?: {
    cpu: number;
    memory: number;
    temp: number;
    uptime: number;
  };
  version?: string;
}

interface ClientConnection {
  clientId: string;
  ws: WebSocket | null;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdate: string | null;
  reconnectAttempts: number;
}

interface UseClientWebSocketOptions {
  enabled?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onStatusChange?: (clientId: string, status: ClientStatusUpdate) => void;
  onConnect?: (clientId: string) => void;
  onDisconnect?: (clientId: string) => void;
}

interface ClientInfo {
  id: string;
  apiUrl: string;
  name: string;
}

export function useClientWebSocket(
  clients: ClientInfo[],
  options: UseClientWebSocketOptions = {}
) {
  const {
    enabled = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onStatusChange,
    onConnect,
    onDisconnect,
  } = options;

  const [connections, setConnections] = useState<Record<string, ClientConnection>>({});
  const [clientStatuses, setClientStatuses] = useState<Record<string, ClientStatusUpdate>>({});
  const connectionsRef = useRef<Record<string, WebSocket>>({});
  const reconnectTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        tag: 'client-status',
      });
    }
  }, []);

  const connectToClient = useCallback((client: ClientInfo) => {
    if (!enabled) return;

    const existingWs = connectionsRef.current[client.id];
    if (existingWs && existingWs.readyState === WebSocket.OPEN) return;

    // Convert HTTP URL to WebSocket URL
    const wsUrl = client.apiUrl.replace(/^http/, 'ws').replace('/api', '/ws/status');
    
    try {
      const ws = new WebSocket(wsUrl);
      connectionsRef.current[client.id] = ws;

      setConnections(prev => ({
        ...prev,
        [client.id]: {
          clientId: client.id,
          ws,
          status: 'connecting',
          lastUpdate: null,
          reconnectAttempts: prev[client.id]?.reconnectAttempts || 0,
        },
      }));

      ws.onopen = () => {
        if (import.meta.env.DEV) console.log(`[WS] Connected to ${client.name}`);
        
        setConnections(prev => ({
          ...prev,
          [client.id]: {
            ...prev[client.id],
            status: 'connected',
            reconnectAttempts: 0,
          },
        }));

        onConnect?.(client.id);
      };

      ws.onmessage = (event) => {
        try {
          const data: ClientStatusUpdate = JSON.parse(event.data);
          data.clientId = client.id;
          data.timestamp = new Date().toISOString();

          setClientStatuses(prev => {
            const previousStatus = prev[client.id]?.status;
            
            // Notify on status change
            if (previousStatus && previousStatus !== data.status) {
              if (data.status === 'offline') {
                sendNotification(
                  `${client.name} Offline`,
                  `O cliente ${client.name} ficou offline.`
                );
                toast.error(`${client.name} ficou offline`);
              } else if (data.status === 'online' && previousStatus === 'offline') {
                sendNotification(
                  `${client.name} Online`,
                  `O cliente ${client.name} está online novamente.`
                );
                toast.success(`${client.name} está online`);
              } else if (data.status === 'warning') {
                toast.warning(`${client.name}: Atenção - métricas fora do normal`);
              }
            }

            return { ...prev, [client.id]: data };
          });

          setConnections(prev => ({
            ...prev,
            [client.id]: {
              ...prev[client.id],
              lastUpdate: data.timestamp,
            },
          }));

          onStatusChange?.(client.id, data);
        } catch (e) {
          if (import.meta.env.DEV) console.error('[WS] Failed to parse message:', e);
        }
      };

      ws.onerror = () => {
        setConnections(prev => ({
          ...prev,
          [client.id]: {
            ...prev[client.id],
            status: 'error',
          },
        }));
      };

      ws.onclose = () => {
        if (import.meta.env.DEV) console.log(`[WS] Disconnected from ${client.name}`);
        
        setConnections(prev => {
          const connection = prev[client.id];
          const newAttempts = (connection?.reconnectAttempts || 0) + 1;

          // Schedule reconnection if within limits
          if (enabled && newAttempts < maxReconnectAttempts) {
            const timer = setTimeout(() => {
              connectToClient(client);
            }, reconnectInterval * Math.pow(2, newAttempts - 1));
            
            reconnectTimersRef.current[client.id] = timer;
          } else if (newAttempts >= maxReconnectAttempts) {
            // Mark as offline after max attempts
            setClientStatuses(p => ({
              ...p,
              [client.id]: {
                clientId: client.id,
                status: 'offline',
                timestamp: new Date().toISOString(),
              },
            }));
            
            sendNotification(
              `${client.name} Desconectado`,
              `Não foi possível reconectar após ${maxReconnectAttempts} tentativas.`
            );
          }

          return {
            ...prev,
            [client.id]: {
              ...prev[client.id],
              status: 'disconnected',
              reconnectAttempts: newAttempts,
            },
          };
        });

        onDisconnect?.(client.id);
        delete connectionsRef.current[client.id];
      };
    } catch (error) {
      if (import.meta.env.DEV) console.error(`[WS] Error connecting to ${client.name}:`, error);
    }
  }, [enabled, maxReconnectAttempts, reconnectInterval, onConnect, onDisconnect, onStatusChange, sendNotification]);

  const disconnectFromClient = useCallback((clientId: string) => {
    const ws = connectionsRef.current[clientId];
    if (ws) {
      ws.close();
      delete connectionsRef.current[clientId];
    }

    const timer = reconnectTimersRef.current[clientId];
    if (timer) {
      clearTimeout(timer);
      delete reconnectTimersRef.current[clientId];
    }
  }, []);

  const disconnectAll = useCallback(() => {
    Object.keys(connectionsRef.current).forEach(disconnectFromClient);
    Object.values(reconnectTimersRef.current).forEach(clearTimeout);
    reconnectTimersRef.current = {};
  }, [disconnectFromClient]);

  const reconnectClient = useCallback((client: ClientInfo) => {
    disconnectFromClient(client.id);
    setConnections(prev => ({
      ...prev,
      [client.id]: {
        ...prev[client.id],
        reconnectAttempts: 0,
      },
    }));
    setTimeout(() => connectToClient(client), 100);
  }, [connectToClient, disconnectFromClient]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Connect to all clients
  useEffect(() => {
    if (!enabled) {
      disconnectAll();
      return;
    }

    clients.forEach(connectToClient);

    return () => {
      disconnectAll();
    };
  }, [clients, enabled, connectToClient, disconnectAll]);

  return {
    connections,
    clientStatuses,
    reconnectClient,
    disconnectFromClient,
    disconnectAll,
    isConnected: (clientId: string) => connections[clientId]?.status === 'connected',
    getClientStatus: (clientId: string) => clientStatuses[clientId] || null,
  };
}
