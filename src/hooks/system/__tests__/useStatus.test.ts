import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies before importing the hook
vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: vi.fn(() => ({
    isDemoMode: false,
    apiUrl: 'http://localhost:3000',
    useWebSocket: false,
    pollingInterval: 5000,
  })),
}));

vi.mock('./useMockData', () => ({
  useMockStatus: vi.fn(() => ({
    status: {
      uptime: 3600,
      version: '1.0.0',
      cpuUsage: 25,
      memoryUsage: 50,
      activeConnections: 10,
    },
  })),
}));

vi.mock('./useWebSocketStatus', () => ({
  useWebSocketStatus: vi.fn(() => ({
    status: null,
    isConnected: false,
    error: null,
    reconnect: vi.fn(),
  })),
}));

vi.mock('@/lib/api/client', () => ({
  api: {
    getStatus: vi.fn(() => Promise.resolve({
      uptime: 7200,
      version: '2.0.0',
      cpuUsage: 30,
      memoryUsage: 60,
      activeConnections: 20,
    })),
  },
  ApiError: class ApiError extends Error {},
}));

import { useStatus } from '../useStatus';
import { useSettings } from '@/contexts/SettingsContext';
import { useWebSocketStatus } from '../useWebSocketStatus';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return demo data when isDemoMode is true', () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: true,
      apiUrl: 'http://localhost:3000',
      useWebSocket: false,
      pollingInterval: 5000,
      setDemoMode: vi.fn(),
      theme: 'dark',
      setTheme: vi.fn(),
      language: 'en',
      setLanguage: vi.fn(),
      volume: 80,
      setVolume: vi.fn(),
      notifications: true,
      setNotifications: vi.fn(),
      autoPlay: true,
      setAutoPlay: vi.fn(),
      enableAnimations: true,
      setEnableAnimations: vi.fn(),
    } as any);

    const { result } = renderHook(() => useStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.connectionType).toBe('demo');
    expect(result.current.uiState).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should use WebSocket when connected', () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
      useWebSocket: true,
      pollingInterval: 5000,
    } as any);

    vi.mocked(useWebSocketStatus).mockReturnValue({
      status: {
        uptime: 1000,
        version: '3.0.0',
        cpuUsage: 15,
        memoryUsage: 40,
        activeConnections: 5,
      } as any,
      isConnected: true,
      error: null,
      reconnect: vi.fn(),
    });

    const { result } = renderHook(() => useStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.connectionType).toBe('websocket');
    expect(result.current.uiState).toBe('success');
    expect(result.current.data?.version).toBe('3.0.0');
  });

  it('should fallback to polling when WebSocket fails', () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
      useWebSocket: true,
      pollingInterval: 5000,
    } as any);

    vi.mocked(useWebSocketStatus).mockReturnValue({
      status: null,
      isConnected: false,
      error: new Error('WebSocket connection failed'),
      reconnect: vi.fn(),
    });

    const { result } = renderHook(() => useStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.connectionType).toBe('polling-fallback');
  });

  it('should return correct UIState: loading', async () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
      useWebSocket: false,
      pollingInterval: 5000,
    } as any);

    const { result } = renderHook(() => useStatus(), {
      wrapper: createWrapper(),
    });

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
  });

  it('should return correct UIState: success after data loads', async () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
      useWebSocket: false,
      pollingInterval: 5000,
    } as any);

    const { result } = renderHook(() => useStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.uiState).toBe('success');
    });

    expect(result.current.data?.version).toBe('2.0.0');
  });

  it('should not fetch when disabled', () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
      useWebSocket: false,
      pollingInterval: 5000,
    } as any);

    const { result } = renderHook(() => useStatus(false), {
      wrapper: createWrapper(),
    });

    // When disabled, should not be loading and have no data
    expect(result.current.isLoading).toBe(false);
  });

  it('should use polling connection type when WebSocket is disabled', () => {
    vi.mocked(useSettings).mockReturnValue({
      isDemoMode: false,
      apiUrl: 'http://localhost:3000',
      useWebSocket: false,
      pollingInterval: 5000,
    } as any);

    vi.mocked(useWebSocketStatus).mockReturnValue({
      status: null,
      isConnected: false,
      error: null,
      reconnect: vi.fn(),
    });

    const { result } = renderHook(() => useStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.connectionType).toBe('polling');
  });
});
