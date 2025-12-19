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

function getPeriodFilter(period: StatsPeriod): Date | null {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    case 'all':
      return null;
  }
}

async function fetchPlaybackStats(period: StatsPeriod): Promise<AggregatedStats> {
  const periodFilter = getPeriodFilter(period);
  
  let query = supabase
    .from('playback_stats')
    .select('*')
    .order('played_at', { ascending: false });

  if (periodFilter) {
    query = query.gte('played_at', periodFilter.toISOString());
  }

  const { data, error } = await query.limit(1000);

  if (error) {
    throw error;
  }

  const plays = data || [];
  
  // Calculate aggregated stats
  const uniqueTracks = new Set(plays.map(p => p.track_id));
  const uniqueArtists = new Set(plays.map(p => p.artist_name));
  const totalMinutes = plays.reduce((acc, p) => acc + ((p.duration_ms || 0) / 60000), 0);

  // Top tracks
  const trackCounts = plays.reduce((acc, p) => {
    const key = p.track_id;
    if (!acc[key]) {
      acc[key] = {
        track_id: p.track_id,
        track_name: p.track_name,
        artist_name: p.artist_name,
        album_art: p.album_art,
        plays: 0
      };
    }
    acc[key].plays++;
    return acc;
  }, {} as Record<string, any>);

  const topTracks = Object.values(trackCounts)
    .sort((a: any, b: any) => b.plays - a.plays)
    .slice(0, 10);

  // Top artists
  const artistCounts = plays.reduce((acc, p) => {
    if (!acc[p.artist_name]) {
      acc[p.artist_name] = { artist_name: p.artist_name, plays: 0 };
    }
    acc[p.artist_name].plays++;
    return acc;
  }, {} as Record<string, any>);

  const topArtists = Object.values(artistCounts)
    .sort((a: any, b: any) => b.plays - a.plays)
    .slice(0, 10);

  // Hourly activity
  const hourlyCounts = plays.reduce((acc, p) => {
    const hour = new Date(p.played_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourlyCounts[hour] || 0
  }));

  // Provider stats
  const providerCounts = plays.reduce((acc, p) => {
    acc[p.provider] = (acc[p.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const providerStats = Object.entries(providerCounts).map(([provider, plays]) => ({
    provider,
    plays
  }));

  return {
    totalPlays: plays.length,
    uniqueTracks: uniqueTracks.size,
    uniqueArtists: uniqueArtists.size,
    totalMinutes: Math.round(totalMinutes),
    topTracks,
    topArtists,
    hourlyActivity,
    recentPlays: plays.slice(0, 20) as PlaybackStat[],
    providerStats
  };
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
      const { error } = await supabase.from('playback_stats').insert({
        track_id: data.track_id,
        track_name: data.track_name,
        artist_name: data.artist_name,
        album_name: data.album_name,
        album_art: data.album_art,
        provider: data.provider,
        duration_ms: data.duration_ms,
        completed: data.completed || false,
        user_agent: navigator.userAgent
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
