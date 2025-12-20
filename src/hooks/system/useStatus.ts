import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api/client';
import { useMockStatus } from './useMockData';
import { useWebSocketStatus } from './useWebSocketStatus';
import { useSettings } from '@/contexts/SettingsContext';
import type { SystemStatus } from '@/lib/api/types';

// UI State Types
type UIState = 'loading' | 'error' | 'empty' | 'success';
type ConnectionType = 'demo' | 'websocket' | 'polling' | 'polling-fallback';

interface UseStatusResult {
  data: SystemStatus | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  connectionType: ConnectionType;
  uiState: UIState;
  refetch: () => void;
  isStale: boolean;
}

export function useStatus(enabled: boolean = true): UseStatusResult {
  const { isDemoMode, apiUrl, useWebSocket, pollingInterval } = useSettings();
  const mockData = useMockStatus(isDemoMode);

  // WebSocket connection for real-time updates
  const wsStatus = useWebSocketStatus({
    url: apiUrl,
    enabled: enabled && !isDemoMode && useWebSocket,
  });

  // Polling fallback when WebSocket is disabled or unavailable
  const pollingQuery = useQuery<SystemStatus, ApiError>({
    queryKey: ['status', apiUrl],
    queryFn: () => api.getStatus(),
    refetchInterval: pollingInterval,
    enabled: enabled && !isDemoMode && (!useWebSocket || (useWebSocket && wsStatus.error !== null)),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 8000),
    staleTime: Math.floor(pollingInterval / 2),
    gcTime: pollingInterval * 2,
  });

  // Calculate UI state
  const getUIState = (): UIState => {
    if (isDemoMode) return 'success';
    if (useWebSocket && wsStatus.isConnected && wsStatus.status) return 'success';
    if (pollingQuery.isLoading) return 'loading';
    if (pollingQuery.isError) return 'error';
    if (!pollingQuery.data) return 'empty';
    return 'success';
  };

  // Return mock data in demo mode
  if (isDemoMode) {
    return {
      data: mockData.status,
      isLoading: false,
      error: null,
      isError: false,
      connectionType: 'demo',
      uiState: 'success',
      refetch: () => {},
      isStale: false,
    };
  }

  // Use WebSocket data if connected
  if (useWebSocket && wsStatus.isConnected && wsStatus.status) {
    return {
      data: wsStatus.status,
      isLoading: false,
      error: null,
      isError: false,
      connectionType: 'websocket',
      uiState: 'success',
      refetch: wsStatus.reconnect,
      isStale: false,
    };
  }

  // Fallback to polling
  const connectionType: ConnectionType = (useWebSocket && wsStatus.error) ? 'polling-fallback' : 'polling';
  
  return {
    data: pollingQuery.data,
    isLoading: pollingQuery.isLoading,
    error: pollingQuery.error,
    isError: pollingQuery.isError,
    connectionType,
    uiState: getUIState(),
    refetch: pollingQuery.refetch,
    isStale: pollingQuery.isStale,
  };
}
