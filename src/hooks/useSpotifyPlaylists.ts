import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotifyClient, SpotifyPlaylist, CreatePlaylistParams } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

export function useSpotifyPlaylists() {
  const { spotify } = useSettings();
  const queryClient = useQueryClient();
  const isConnected = spotify.isConnected && spotifyClient.isAuthenticated();

  const playlistsQuery = useQuery({
    queryKey: ['spotify', 'playlists'],
    queryFn: () => spotifyClient.getPlaylists(),
    enabled: isConnected,
    staleTime: 60 * 1000,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: (params: CreatePlaylistParams) => spotifyClient.createPlaylist(params),
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
      toast.success(`Playlist "${playlist.name}" criada!`);
    },
    onError: () => {
      toast.error('Erro ao criar playlist');
    },
  });

  const followPlaylistMutation = useMutation({
    mutationFn: (playlistId: string) => spotifyClient.followPlaylist(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
      toast.success('Playlist seguida!');
    },
  });

  const unfollowPlaylistMutation = useMutation({
    mutationFn: (playlistId: string) => spotifyClient.unfollowPlaylist(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
      toast.success('Deixou de seguir a playlist');
    },
  });

  return {
    playlists: playlistsQuery.data?.items ?? [],
    total: playlistsQuery.data?.total ?? 0,
    isLoading: playlistsQuery.isLoading,
    error: playlistsQuery.error,
    isConnected,
    createPlaylist: createPlaylistMutation.mutate,
    followPlaylist: followPlaylistMutation.mutate,
    unfollowPlaylist: unfollowPlaylistMutation.mutate,
    isCreating: createPlaylistMutation.isPending,
    refetch: playlistsQuery.refetch,
  };
}

export function useSpotifyPlaylist(playlistId: string | undefined) {
  const { spotify } = useSettings();
  const queryClient = useQueryClient();
  const isConnected = spotify.isConnected && spotifyClient.isAuthenticated();

  const playlistQuery = useQuery({
    queryKey: ['spotify', 'playlist', playlistId],
    queryFn: () => spotifyClient.getPlaylist(playlistId!),
    enabled: isConnected && !!playlistId,
  });

  const tracksQuery = useQuery({
    queryKey: ['spotify', 'playlist', playlistId, 'tracks'],
    queryFn: () => spotifyClient.getPlaylistTracks(playlistId!),
    enabled: isConnected && !!playlistId,
  });

  const addTracksMutation = useMutation({
    mutationFn: (trackUris: string[]) => spotifyClient.addTracksToPlaylist(playlistId!, trackUris),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', playlistId] });
      toast.success('Faixas adicionadas!');
    },
  });

  const removeTracksMutation = useMutation({
    mutationFn: (trackUris: string[]) => spotifyClient.removeTracksFromPlaylist(playlistId!, trackUris),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify', 'playlist', playlistId] });
      toast.success('Faixas removidas!');
    },
  });

  return {
    playlist: playlistQuery.data,
    tracks: tracksQuery.data?.items ?? [],
    tracksTotal: tracksQuery.data?.total ?? 0,
    isLoading: playlistQuery.isLoading || tracksQuery.isLoading,
    addTracks: addTracksMutation.mutate,
    removeTracks: removeTracksMutation.mutate,
  };
}
