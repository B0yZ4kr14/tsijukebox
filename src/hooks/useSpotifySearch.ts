import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { spotifyClient, SpotifySearchResults } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { useDebounce } from '@/hooks/common';

export type SearchType = 'track' | 'album' | 'artist' | 'playlist';

export function useSpotifySearch() {
  const { spotify } = useSettings();
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<SearchType[]>(['track', 'album', 'artist', 'playlist']);
  const debouncedQuery = useDebounce(query, 300);
  const isConnected = spotify.isConnected && spotifyClient.isAuthenticated();

  const searchQuery = useQuery({
    queryKey: ['spotify', 'search', debouncedQuery, types],
    queryFn: () => spotifyClient.search(debouncedQuery, types),
    enabled: isConnected && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const results: SpotifySearchResults = useMemo(() => ({
    tracks: searchQuery.data?.tracks ?? [],
    albums: searchQuery.data?.albums ?? [],
    artists: searchQuery.data?.artists ?? [],
    playlists: searchQuery.data?.playlists ?? [],
  }), [searchQuery.data]);

  const hasResults = useMemo(() => 
    results.tracks.length > 0 || 
    results.albums.length > 0 || 
    results.artists.length > 0 || 
    results.playlists.length > 0,
  [results]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    types,
    setTypes,
    results,
    hasResults,
    isLoading: searchQuery.isLoading,
    isSearching: searchQuery.isFetching,
    error: searchQuery.error,
    clearSearch,
    isConnected,
  };
}
