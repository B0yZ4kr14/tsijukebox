import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlaybackStat {
  id: string;
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  album_art?: string;
  provider: string;
  duration_ms?: number;
  played_at: string;
  completed: boolean;
}

export interface AggregatedStats {
  totalPlays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  totalMinutes: number;
  topTracks: Array<{
    track_id: string;
    track_name: string;
    artist_name: string;
    album_art?: string;
    plays: number;
  }>;
  topArtists: Array<{
    artist_name: string;
    plays: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    count: number;
  }>;
  recentPlays: PlaybackStat[];
  providerStats: Array<{
    provider: string;
    plays: number;
  }>;
}

export type StatsPeriod = 'today' | 'week' | 'month' | 'all';

interface UsePlaybackStatsReturn {
  stats: AggregatedStats | null;
  isLoading: boolean;
  error: Error | null;
  period: StatsPeriod;
  setPeriod: (period: StatsPeriod) => void;
  refetch: () => void;
}

interface TrackPlaybackData {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  album_art?: string;
  provider: string;
  duration_ms?: number;
  completed?: boolean;
}

// Fetch stats via edge function
async function fetchPlaybackStats(period: StatsPeriod): Promise<AggregatedStats> {
  const { data, error } = await supabase.functions.invoke('track-playback', {
    body: { action: 'getStats', period }
  });

  if (error) {
    throw error;
  }

  return data as AggregatedStats;
}

export function usePlaybackStats(initialPeriod: StatsPeriod = 'week'): UsePlaybackStatsReturn {
  const [period, setPeriod] = useState<StatsPeriod>(initialPeriod);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['playback-stats', period],
    queryFn: () => fetchPlaybackStats(period),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });

  return {
    stats: data || null,
    isLoading,
    error: error as Error | null,
    period,
    setPeriod,
    refetch
  };
}

interface UseTrackPlaybackReturn {
  recordPlay: (data: TrackPlaybackData) => Promise<void>;
  isRecording: boolean;
}

export function useTrackPlayback(): UseTrackPlaybackReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: TrackPlaybackData) => {
      const { error } = await supabase.functions.invoke('track-playback', {
        body: { 
          action: 'record',
          ...data
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playback-stats'] });
    }
  });

  const recordPlay = useCallback(async (data: TrackPlaybackData) => {
    await mutation.mutateAsync(data);
  }, [mutation]);

  return {
    recordPlay,
    isRecording: mutation.isPending
  };
}
