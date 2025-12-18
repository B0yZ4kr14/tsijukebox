import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LyricsLine } from '@/lib/lrcParser';

export interface LyricsData {
  source: 'lrclib' | 'genius' | 'none';
  synced: boolean;
  lines: LyricsLine[];
  plainText?: string;
  trackName: string;
  artistName: string;
}

async function fetchLyrics(trackName: string, artistName: string): Promise<LyricsData> {
  const { data, error } = await supabase.functions.invoke('lyrics-search', {
    body: { trackName, artistName },
  });
  
  if (error) {
    console.error('Error fetching lyrics:', error);
    throw new Error(error.message);
  }
  
  return data as LyricsData;
}

export function useLyrics(trackName?: string, artistName?: string) {
  return useQuery({
    queryKey: ['lyrics', trackName, artistName],
    queryFn: () => fetchLyrics(trackName!, artistName!),
    enabled: !!trackName && !!artistName,
    staleTime: Infinity, // Lyrics don't change
    gcTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1,
  });
}
