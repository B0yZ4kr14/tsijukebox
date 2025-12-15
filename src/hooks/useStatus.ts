import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { SystemStatus } from '@/lib/api/types';

export function useStatus(enabled: boolean = true) {
  return useQuery<SystemStatus>({
    queryKey: ['status'],
    queryFn: () => api.getStatus(),
    refetchInterval: 1000, // Poll every second
    enabled,
    retry: 1,
    staleTime: 500,
  });
}
