import { useQuery } from '@tanstack/react-query';
import { spotifyClient, SpotifyTrack } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';

interface UseSpotifyRecommendationsParams {
  seedTrackId?: string;
  seedArtistIds?: string[];
  seedGenres?: string[];
  limit?: number;
  enabled?: boolean;
}

export function useSpotifyRecommendations({
  seedTrackId,
  seedArtistIds = [],
  seedGenres = [],
  limit = 20,
  enabled = true,
}: UseSpotifyRecommendationsParams = {}) {
  const { spotify } = useSettings();
  const isConnected = spotify.isConnected;

  const { data: recommendations = [], isLoading, refetch } = useQuery<SpotifyTrack[]>({
    queryKey: ['spotify', 'recommendations', seedTrackId, seedArtistIds, seedGenres, limit],
    queryFn: async () => {
      const seedTracks = seedTrackId ? [seedTrackId] : [];
      
      // Need at least one seed
      if (seedTracks.length === 0 && seedArtistIds.length === 0 && seedGenres.length === 0) {
        return [];
      }

      return spotifyClient.getRecommendations({
        seedTracks,
        seedArtists: seedArtistIds.slice(0, 2), // Max 5 seeds total
        seedGenres: seedGenres.slice(0, 2),
        limit,
      });
    },
    enabled: enabled && isConnected && (!!seedTrackId || seedArtistIds.length > 0 || seedGenres.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    recommendations,
    isLoading,
    isConnected,
    refetch,
  };
}
