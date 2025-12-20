import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { spotifyClient } from '@/lib/api/spotify';
import { youtubeMusicClient, YouTubeMusicTrack } from '@/lib/api/youtubeMusic';
import { useSettings } from '@/contexts/SettingsContext';
import { useDebounce } from '@/hooks/common';

export type MusicProvider = 'spotify' | 'youtube' | 'demo';

export interface JamTrack {
  id: string;
  provider: MusicProvider;
  trackName: string;
  artistName: string;
  albumArt: string | null;
  durationMs: number;
  providerUri?: string;
}

// Demo tracks for offline/testing
const DEMO_TRACKS: JamTrack[] = [
  {
    id: 'demo-1',
    provider: 'demo',
    trackName: 'Blinding Lights',
    artistName: 'The Weeknd',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    durationMs: 200000,
  },
  {
    id: 'demo-2',
    provider: 'demo',
    trackName: 'Levitating',
    artistName: 'Dua Lipa',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
    durationMs: 203000,
  },
  {
    id: 'demo-3',
    provider: 'demo',
    trackName: 'Watermelon Sugar',
    artistName: 'Harry Styles',
    albumArt: null,
    durationMs: 174000,
  },
  {
    id: 'demo-4',
    provider: 'demo',
    trackName: 'drivers license',
    artistName: 'Olivia Rodrigo',
    albumArt: null,
    durationMs: 242000,
  },
  {
    id: 'demo-5',
    provider: 'demo',
    trackName: 'Save Your Tears',
    artistName: 'The Weeknd',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    durationMs: 215000,
  },
];

export function useJamMusicSearch() {
  const { spotify } = useSettings();
  const [query, setQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState<MusicProvider>('demo');
  const debouncedQuery = useDebounce(query, 300);
  
  const isSpotifyConnected = spotify.isConnected && spotifyClient.isAuthenticated();
  const isYouTubeConnected = youtubeMusicClient.getTokens() !== null;

  // Spotify search
  const spotifyQuery = useQuery({
    queryKey: ['jam', 'spotify', 'search', debouncedQuery],
    queryFn: () => spotifyClient.search(debouncedQuery, ['track']),
    enabled: isSpotifyConnected && activeProvider === 'spotify' && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  // YouTube Music search
  const youtubeQuery = useQuery({
    queryKey: ['jam', 'youtube', 'search', debouncedQuery],
    queryFn: () => youtubeMusicClient.search(debouncedQuery, 'song'),
    enabled: isYouTubeConnected && activeProvider === 'youtube' && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  // Normalize Spotify tracks
  const spotifyTracks: JamTrack[] = useMemo(() => {
    if (!spotifyQuery.data?.tracks) return [];
    return spotifyQuery.data.tracks.map(track => ({
      id: track.id,
      provider: 'spotify' as const,
      trackName: track.name,
      artistName: track.artists.map(a => a.name).join(', '),
      albumArt: track.albumImageUrl || null,
      durationMs: track.durationMs,
      providerUri: track.uri,
    }));
  }, [spotifyQuery.data]);

  // Normalize YouTube tracks
  const youtubeTracks: JamTrack[] = useMemo(() => {
    if (!youtubeQuery.data?.tracks) return [];
    return youtubeQuery.data.tracks.map((track: YouTubeMusicTrack) => ({
      id: track.videoId,
      provider: 'youtube' as const,
      trackName: track.title,
      artistName: track.artist,
      albumArt: track.thumbnailUrl,
      durationMs: track.durationMs,
      providerUri: `https://music.youtube.com/watch?v=${track.videoId}`,
    }));
  }, [youtubeQuery.data]);

  // Filter demo tracks
  const demoTracks: JamTrack[] = useMemo(() => {
    if (!debouncedQuery || activeProvider !== 'demo') return DEMO_TRACKS;
    const q = debouncedQuery.toLowerCase();
    return DEMO_TRACKS.filter(
      track =>
        track.trackName.toLowerCase().includes(q) ||
        track.artistName.toLowerCase().includes(q)
    );
  }, [debouncedQuery, activeProvider]);

  // Get current results based on active provider
  const results = useMemo((): JamTrack[] => {
    switch (activeProvider) {
      case 'spotify':
        return spotifyTracks;
      case 'youtube':
        return youtubeTracks;
      case 'demo':
      default:
        return demoTracks;
    }
  }, [activeProvider, spotifyTracks, youtubeTracks, demoTracks]);

  const isLoading = useMemo(() => {
    switch (activeProvider) {
      case 'spotify':
        return spotifyQuery.isLoading;
      case 'youtube':
        return youtubeQuery.isLoading;
      default:
        return false;
    }
  }, [activeProvider, spotifyQuery.isLoading, youtubeQuery.isLoading]);

  const error = useMemo(() => {
    switch (activeProvider) {
      case 'spotify':
        return spotifyQuery.error;
      case 'youtube':
        return youtubeQuery.error;
      default:
        return null;
    }
  }, [activeProvider, spotifyQuery.error, youtubeQuery.error]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    activeProvider,
    setActiveProvider,
    results,
    isLoading,
    error,
    clearSearch,
    isSpotifyConnected,
    isYouTubeConnected,
    hasResults: results.length > 0,
  };
}
