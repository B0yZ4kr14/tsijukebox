import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotifyClient } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

export function useSpotifyLibrary() {
  const { spotify } = useSettings();
  const queryClient = useQueryClient();
  const isConnected = spotify.isConnected && spotifyClient.isAuthenticated();

  // Liked tracks
  const likedTracksQuery = useQuery({
    queryKey: ['spotify', 'library', 'tracks'],
    queryFn: () => spotifyClient.getLikedTracks(),
    enabled: isConnected,
    staleTime: 60 * 1000,
  });

  // Saved albums
  const albumsQuery = useQuery({
    queryKey: ['spotify', 'library', 'albums'],
    queryFn: () => spotifyClient.getSavedAlbums(),
    enabled: isConnected,
    staleTime: 60 * 1000,
  });

  // Followed artists
  const artistsQuery = useQuery({
    queryKey: ['spotify', 'library', 'artists'],
    queryFn: () => spotifyClient.getFollowedArtists(),
    enabled: isConnected,
    staleTime: 60 * 1000,
  });

  // Recently played
  const recentQuery = useQuery({
    queryKey: ['spotify', 'recently-played'],
    queryFn: () => spotifyClient.getRecentlyPlayed(20),
    enabled: isConnected,
    staleTime: 30 * 1000,
  });

  // Top tracks
  const topTracksQuery = useQuery({
    queryKey: ['spotify', 'top-tracks'],
    queryFn: () => spotifyClient.getTopTracks('short_term', 20),
    enabled: isConnected,
    staleTime: 5 * 60 * 1000,
  });

  // Like/unlike mutations
  const likeMutation = useMutation({
    mutationFn: (trackId: string) => spotifyClient.likeTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'library', 'tracks'] });
      toast.success('Adicionado às músicas curtidas');
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (trackId: string) => spotifyClient.unlikeTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'library', 'tracks'] });
      toast.success('Removido das músicas curtidas');
    },
  });

  const saveAlbumMutation = useMutation({
    mutationFn: (albumId: string) => spotifyClient.saveAlbum(albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'library', 'albums'] });
      toast.success('Álbum salvo');
    },
  });

  const removeAlbumMutation = useMutation({
    mutationFn: (albumId: string) => spotifyClient.removeAlbum(albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'library', 'albums'] });
      toast.success('Álbum removido');
    },
  });

  return {
    likedTracks: likedTracksQuery.data?.items ?? [],
    likedTracksTotal: likedTracksQuery.data?.total ?? 0,
    albums: albumsQuery.data?.items ?? [],
    albumsTotal: albumsQuery.data?.total ?? 0,
    artists: artistsQuery.data?.items ?? [],
    recentlyPlayed: recentQuery.data ?? [],
    topTracks: topTracksQuery.data ?? [],
    isLoading: likedTracksQuery.isLoading || albumsQuery.isLoading || artistsQuery.isLoading,
    isConnected,
    likeTrack: likeMutation.mutate,
    unlikeTrack: unlikeMutation.mutate,
    saveAlbum: saveAlbumMutation.mutate,
    removeAlbum: removeAlbumMutation.mutate,
    refetch: () => {
      likedTracksQuery.refetch();
      albumsQuery.refetch();
      artistsQuery.refetch();
    },
  };
}
