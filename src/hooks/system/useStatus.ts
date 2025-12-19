import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useMockStatus } from './useMockData';
import { useWebSocketStatus } from './useWebSocketStatus';
import { useSettings } from '@/contexts/SettingsContext';
import type { SystemStatus } from '@/lib/api/types';

export function useStatus(enabled: boolean = true) {
  const { isDemoMode, apiUrl, useWebSocket, pollingInterval } = useSettings();
  const mockData = useMockStatus(isDemoMode);

  // WebSocket connection for real-time updates
  const wsStatus = useWebSocketStatus({
    url: apiUrl,
    enabled: enabled && !isDemoMode && useWebSocket,
  });

  // Polling fallback when WebSocket is disabled or unavailable
  const pollingQuery = useQuery<SystemStatus>({
    queryKey: ['status', apiUrl],
    queryFn: () => api.getStatus(),
    refetchInterval: pollingInterval,
    enabled: enabled && !isDemoMode && (!useWebSocket || (useWebSocket && wsStatus.error !== null)),
    retry: 2,
    retryDelay: 1000,
    staleTime: Math.floor(pollingInterval / 2),
  });

  // Return mock data in demo mode
  if (isDemoMode) {
    return {
      data: mockData.status,
      isLoading: false,
      error: null,
      isError: false,
      connectionType: 'demo' as const,
    };
  }

  // Use WebSocket data if connected
  if (useWebSocket && wsStatus.isConnected && wsStatus.status) {
    return {
      data: wsStatus.status,
      isLoading: false,
      error: null,
      isError: false,
      connectionType: 'websocket' as const,
    };
  }

  // Fallback to polling
  return {
    ...pollingQuery,
    connectionType: (useWebSocket && wsStatus.error) ? 'polling-fallback' as const : 'polling' as const,
  };
}
