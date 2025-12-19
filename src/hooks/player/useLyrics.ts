import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCachedLyrics, setCachedLyrics } from '@/lib/lyricsCache';
import type { LyricsData } from '@/types/lyrics';

export type { LyricsData } from '@/types/lyrics';

async function fetchLyrics(trackName: string, artistName: string): Promise<LyricsData> {
  // Check localStorage cache first
  const cached = getCachedLyrics(trackName, artistName);
  if (cached) {
    console.log('[Lyrics] Loaded from cache:', trackName);
    return cached;
  }

  // Fetch from edge function
  const { data, error } = await supabase.functions.invoke('lyrics-search', {
    body: { trackName, artistName },
  });
  
  if (error) {
    console.error('[Lyrics] Error fetching:', error);
    throw new Error(error.message);
  }
  
  const lyricsData = data as LyricsData;
  
  // Cache only if lyrics were found
  if (lyricsData.source !== 'none') {
    setCachedLyrics(trackName, artistName, lyricsData);
    console.log('[Lyrics] Cached:', trackName);
  }
  
  return lyricsData;
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
