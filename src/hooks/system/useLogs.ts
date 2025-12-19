import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { LogEntry } from '@/lib/api/types';

export function useLogs(limit: number = 100, autoRefresh: boolean = false) {
  return useQuery<LogEntry[]>({
    queryKey: ['logs', limit],
    queryFn: () => api.getLogs(limit),
    refetchInterval: autoRefresh ? 5000 : false,
    staleTime: 10000,
  });
}
