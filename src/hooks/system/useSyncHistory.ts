import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SyncHistoryEntry } from './github/types';

export function useSyncHistory(limit = 20) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sync-history', limit],
    queryFn: async (): Promise<SyncHistoryEntry[]> => {
      const { data, error } = await supabase
        .from('sync_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[useSyncHistory] Error:', error);
        throw error;
      }

      return (data || []) as SyncHistoryEntry[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('sync-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sync_history',
        },
        (payload) => {
          console.log('[useSyncHistory] New sync entry:', payload);
          queryClient.invalidateQueries({ queryKey: ['sync-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    history: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
