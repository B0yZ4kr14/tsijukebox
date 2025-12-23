// Hooks Spotify templates - 7 templates for Spotify-related hooks
// Supports useSpotifySearch, useSpotifyPlayer, useSpotifyLibrary, etc.

export function generateHooksSpotifyContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/spotify/index.ts':
      return `// Spotify hooks barrel export
export { useSpotifySearch } from './useSpotifySearch';
export { useSpotifyPlayer } from './useSpotifyPlayer';
export { useSpotifyLibrary } from './useSpotifyLibrary';
export { useSpotifyPlaylists } from './useSpotifyPlaylists';
export { useSpotifyBrowse } from './useSpotifyBrowse';
export { useSpotifyRecommendations } from './useSpotifyRecommendations';
`;

    case 'src/hooks/spotify/useSpotifySearch.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { useSpotifyContext } from '@/contexts/SpotifyContext';

export interface SpotifySearchResults {
  tracks: SpotifyApi.TrackObjectFull[];
  artists: SpotifyApi.ArtistObjectFull[];
  albums: SpotifyApi.AlbumObjectSimplified[];
  playlists: SpotifyApi.PlaylistObjectSimplified[];
}

export function useSpotifySearch(query: string, types: string[] = ['track', 'artist', 'album']) {
  const { isConnected, api } = useSpotifyContext();

  return useQuery({
    queryKey: ['spotify', 'search', query, types],
    queryFn: async (): Promise<SpotifySearchResults> => {
      if (!api) throw new Error('Spotify not connected');
      
      const response = await api.search(query, types as any, { limit: 20 });
      
      return {
        tracks: response.tracks?.items ?? [],
        artists: response.artists?.items ?? [],
        albums: response.albums?.items ?? [],
        playlists: response.playlists?.items ?? [],
      };
    },
    enabled: !!query && query.length >= 2 && isConnected,
    staleTime: 1000 * 60 * 5,
  });
}
`;

    case 'src/hooks/spotify/useSpotifyPlayer.ts':
      return `import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import { toast } from 'sonner';

export function useSpotifyPlayer() {
  const { isConnected, api, deviceId } = useSpotifyContext();
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(false);

  const playbackQuery = useQuery({
    queryKey: ['spotify', 'playback'],
    queryFn: async () => {
      if (!api) return null;
      try {
        const state = await api.getMyCurrentPlaybackState();
        setIsActive(state?.is_playing ?? false);
        return state;
      } catch {
        return null;
      }
    },
    enabled: isConnected,
    refetchInterval: 5000,
  });

  const playMutation = useMutation({
    mutationFn: async (uris?: string[]) => {
      if (!api) throw new Error('Spotify not connected');
      await api.play({ device_id: deviceId, uris });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao reproduzir', { description: error.message });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('Spotify not connected');
      await api.pause();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
    },
  });

  const nextMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('Spotify not connected');
      await api.skipToNext();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
    },
  });

  const prevMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('Spotify not connected');
      await api.skipToPrevious();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
    },
  });

  return {
    playback: playbackQuery.data,
    isPlaying: playbackQuery.data?.is_playing ?? false,
    isActive,
    play: (uris?: string[]) => playMutation.mutate(uris),
    pause: () => pauseMutation.mutate(),
    next: () => nextMutation.mutate(),
    prev: () => prevMutation.mutate(),
    isLoading: playbackQuery.isLoading,
    refetch: playbackQuery.refetch,
  };
}
`;

    case 'src/hooks/spotify/useSpotifyLibrary.ts':
      return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import { toast } from 'sonner';

export function useSpotifyLibrary() {
  const { isConnected, api } = useSpotifyContext();
  const queryClient = useQueryClient();

  const savedTracksQuery = useQuery({
    queryKey: ['spotify', 'library', 'tracks'],
    queryFn: async () => {
      if (!api) return { items: [], total: 0 };
      const response = await api.getMySavedTracks({ limit: 50 });
      return response;
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 5,
  });

  const savedAlbumsQuery = useQuery({
    queryKey: ['spotify', 'library', 'albums'],
    queryFn: async () => {
      if (!api) return { items: [], total: 0 };
      const response = await api.getMySavedAlbums({ limit: 50 });
      return response;
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 5,
  });

  const followedArtistsQuery = useQuery({
    queryKey: ['spotify', 'library', 'artists'],
    queryFn: async () => {
      if (!api) return { artists: { items: [], total: 0 } };
      const response = await api.getFollowedArtists({ limit: 50 });
      return response;
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 5,
  });

  const saveTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      if (!api) throw new Error('Spotify not connected');
      await api.addToMySavedTracks([trackId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'library', 'tracks'] });
      toast.success('Música salva na biblioteca');
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      if (!api) throw new Error('Spotify not connected');
      await api.removeFromMySavedTracks([trackId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'library', 'tracks'] });
      toast.success('Música removida da biblioteca');
    },
  });

  return {
    savedTracks: savedTracksQuery.data?.items ?? [],
    savedAlbums: savedAlbumsQuery.data?.items ?? [],
    followedArtists: followedArtistsQuery.data?.artists?.items ?? [],
    isLoading: savedTracksQuery.isLoading || savedAlbumsQuery.isLoading,
    saveTrack: saveTrackMutation.mutate,
    removeTrack: removeTrackMutation.mutate,
    refetch: () => {
      savedTracksQuery.refetch();
      savedAlbumsQuery.refetch();
      followedArtistsQuery.refetch();
    },
  };
}
`;

    case 'src/hooks/spotify/useSpotifyPlaylists.ts':
      return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import { toast } from 'sonner';

export function useSpotifyPlaylists() {
  const { isConnected, api, user } = useSpotifyContext();
  const queryClient = useQueryClient();

  const playlistsQuery = useQuery({
    queryKey: ['spotify', 'playlists'],
    queryFn: async () => {
      if (!api) return { items: [], total: 0 };
      const response = await api.getUserPlaylists({ limit: 50 });
      return response;
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 2,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async ({ name, description, isPublic }: { name: string; description?: string; isPublic?: boolean }) => {
      if (!api || !user) throw new Error('Spotify not connected');
      const response = await api.createPlaylist(user.id, {
        name,
        description,
        public: isPublic ?? false,
      });
      return response;
    },
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
      toast.success(\`Playlist "\${playlist.name}" criada\`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar playlist', { description: error.message });
    },
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, uris }: { playlistId: string; uris: string[] }) => {
      if (!api) throw new Error('Spotify not connected');
      await api.addTracksToPlaylist(playlistId, uris);
    },
    onSuccess: () => {
      toast.success('Músicas adicionadas à playlist');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar à playlist', { description: error.message });
    },
  });

  const removeFromPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, uris }: { playlistId: string; uris: string[] }) => {
      if (!api) throw new Error('Spotify not connected');
      await api.removeTracksFromPlaylist(playlistId, uris.map(uri => ({ uri })));
    },
    onSuccess: () => {
      toast.success('Músicas removidas da playlist');
    },
  });

  return {
    playlists: playlistsQuery.data?.items ?? [],
    total: playlistsQuery.data?.total ?? 0,
    isLoading: playlistsQuery.isLoading,
    createPlaylist: createPlaylistMutation.mutate,
    addToPlaylist: addToPlaylistMutation.mutate,
    removeFromPlaylist: removeFromPlaylistMutation.mutate,
    refetch: playlistsQuery.refetch,
  };
}
`;

    case 'src/hooks/spotify/useSpotifyBrowse.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { useSpotifyContext } from '@/contexts/SpotifyContext';

export function useSpotifyBrowse() {
  const { isConnected, api } = useSpotifyContext();

  const newReleasesQuery = useQuery({
    queryKey: ['spotify', 'browse', 'new-releases'],
    queryFn: async () => {
      if (!api) return { albums: { items: [] } };
      return api.getNewReleases({ limit: 20, country: 'BR' });
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 30,
  });

  const featuredPlaylistsQuery = useQuery({
    queryKey: ['spotify', 'browse', 'featured'],
    queryFn: async () => {
      if (!api) return { playlists: { items: [] } };
      return api.getFeaturedPlaylists({ limit: 20, country: 'BR' });
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 30,
  });

  const categoriesQuery = useQuery({
    queryKey: ['spotify', 'browse', 'categories'],
    queryFn: async () => {
      if (!api) return { categories: { items: [] } };
      return api.getCategories({ limit: 50, country: 'BR' });
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 60,
  });

  return {
    newReleases: newReleasesQuery.data?.albums?.items ?? [],
    featuredPlaylists: featuredPlaylistsQuery.data?.playlists?.items ?? [],
    categories: categoriesQuery.data?.categories?.items ?? [],
    isLoading: newReleasesQuery.isLoading || featuredPlaylistsQuery.isLoading,
    refetch: () => {
      newReleasesQuery.refetch();
      featuredPlaylistsQuery.refetch();
      categoriesQuery.refetch();
    },
  };
}
`;

    case 'src/hooks/spotify/useSpotifyRecommendations.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { useSpotifyContext } from '@/contexts/SpotifyContext';

interface RecommendationSeed {
  seedArtists?: string[];
  seedTracks?: string[];
  seedGenres?: string[];
}

export function useSpotifyRecommendations(seeds: RecommendationSeed = {}) {
  const { isConnected, api } = useSpotifyContext();
  const { seedArtists = [], seedTracks = [], seedGenres = [] } = seeds;

  const hasSeeds = seedArtists.length > 0 || seedTracks.length > 0 || seedGenres.length > 0;

  const recommendationsQuery = useQuery({
    queryKey: ['spotify', 'recommendations', seedArtists, seedTracks, seedGenres],
    queryFn: async () => {
      if (!api) return { tracks: [] };
      
      const options: any = {
        limit: 20,
        market: 'BR',
      };
      
      if (seedArtists.length > 0) options.seed_artists = seedArtists.slice(0, 2).join(',');
      if (seedTracks.length > 0) options.seed_tracks = seedTracks.slice(0, 2).join(',');
      if (seedGenres.length > 0) options.seed_genres = seedGenres.slice(0, 1).join(',');
      
      return api.getRecommendations(options);
    },
    enabled: isConnected && hasSeeds,
    staleTime: 1000 * 60 * 15,
  });

  const availableGenresQuery = useQuery({
    queryKey: ['spotify', 'genres'],
    queryFn: async () => {
      if (!api) return { genres: [] };
      return api.getAvailableGenreSeeds();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return {
    tracks: recommendationsQuery.data?.tracks ?? [],
    availableGenres: availableGenresQuery.data?.genres ?? [],
    isLoading: recommendationsQuery.isLoading,
    refetch: recommendationsQuery.refetch,
  };
}
`;

    default:
      return null;
  }
}
