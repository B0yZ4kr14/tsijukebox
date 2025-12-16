import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { spotifyClient, SpotifyPlaylist, SpotifyAlbum, SpotifyCategory, SpotifyTrack, SpotifyArtist } from '@/lib/api/spotify';

interface UseSpotifyBrowseReturn {
  featuredPlaylists: SpotifyPlaylist[];
  newReleases: SpotifyAlbum[];
  categories: SpotifyCategory[];
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useSpotifyBrowse(): UseSpotifyBrowseReturn {
  const { spotify } = useSettings();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [newReleases, setNewReleases] = useState<SpotifyAlbum[]>([]);
  const [categories, setCategories] = useState<SpotifyCategory[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrowseData = useCallback(async () => {
    if (!spotify.isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const [featured, releases, cats, top, artists] = await Promise.allSettled([
        spotifyClient.getFeaturedPlaylists(20),
        spotifyClient.getNewReleases(20),
        spotifyClient.getCategories(20),
        spotifyClient.getTopTracks('medium_term', 20),
        spotifyClient.getTopArtists('medium_term', 20),
      ]);

      if (featured.status === 'fulfilled') {
        setFeaturedPlaylists(featured.value);
      }
      if (releases.status === 'fulfilled') {
        setNewReleases(releases.value);
      }
      if (cats.status === 'fulfilled') {
        setCategories(cats.value);
      }
      if (top.status === 'fulfilled') {
        setTopTracks(top.value);
      }
      if (artists.status === 'fulfilled') {
        setTopArtists(artists.value);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch browse data'));
    } finally {
      setIsLoading(false);
    }
  }, [spotify.isConnected]);

  useEffect(() => {
    fetchBrowseData();
  }, [fetchBrowseData]);

  return {
    featuredPlaylists,
    newReleases,
    categories,
    topTracks,
    topArtists,
    isLoading,
    error,
    refresh: fetchBrowseData,
  };
}
