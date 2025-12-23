// Hooks YouTube templates - 7 templates for YouTube Music-related hooks
// Supports useYouTubeMusicSearch, useYouTubeMusicPlayer, useYouTubeMusicLibrary, etc.

export function generateHooksYouTubeContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/youtube/index.ts':
      return `// YouTube Music hooks barrel export
export { useYouTubeMusicSearch } from './useYouTubeMusicSearch';
export { useYouTubeMusicPlayer } from './useYouTubeMusicPlayer';
export { useYouTubeMusicLibrary } from './useYouTubeMusicLibrary';
export { useYouTubeMusicPlaylists } from './useYouTubeMusicPlaylists';
export { useYouTubeMusicBrowse } from './useYouTubeMusicBrowse';
export { useYouTubeMusicRecommendations } from './useYouTubeMusicRecommendations';
`;

    case 'src/hooks/youtube/useYouTubeMusicSearch.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';

export interface YouTubeMusicSearchResults {
  tracks: YouTubeMusicTrack[];
  artists: YouTubeMusicArtist[];
  albums: YouTubeMusicAlbum[];
  playlists: YouTubeMusicPlaylist[];
}

interface YouTubeMusicTrack {
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnailUrl: string;
}

interface YouTubeMusicArtist {
  browseId: string;
  name: string;
  thumbnailUrl: string;
  subscribers?: string;
}

interface YouTubeMusicAlbum {
  browseId: string;
  title: string;
  artist: string;
  year?: string;
  thumbnailUrl: string;
}

interface YouTubeMusicPlaylist {
  playlistId: string;
  title: string;
  author: string;
  itemCount: number;
  thumbnailUrl: string;
}

export function useYouTubeMusicSearch(query: string, filter: string = 'songs') {
  const { isConnected, api } = useYouTubeMusicContext();

  return useQuery({
    queryKey: ['youtube-music', 'search', query, filter],
    queryFn: async (): Promise<YouTubeMusicSearchResults> => {
      if (!api) throw new Error('YouTube Music not connected');
      
      const response = await api.search(query, filter);
      
      return {
        tracks: response.tracks ?? [],
        artists: response.artists ?? [],
        albums: response.albums ?? [],
        playlists: response.playlists ?? [],
      };
    },
    enabled: !!query && query.length >= 2 && isConnected,
    staleTime: 1000 * 60 * 5,
  });
}
`;

    case 'src/hooks/youtube/useYouTubeMusicPlayer.ts':
      return `import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';
import { toast } from 'sonner';

export function useYouTubeMusicPlayer() {
  const { isConnected, api } = useYouTubeMusicContext();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  const playbackQuery = useQuery({
    queryKey: ['youtube-music', 'playback'],
    queryFn: async () => {
      if (!api) return null;
      try {
        const state = await api.getPlaybackState();
        setIsPlaying(state?.isPlaying ?? false);
        setCurrentTrack(state?.track ?? null);
        return state;
      } catch {
        return null;
      }
    },
    enabled: isConnected,
    refetchInterval: 5000,
  });

  const playMutation = useMutation({
    mutationFn: async (videoId?: string) => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.play(videoId);
    },
    onSuccess: () => {
      setIsPlaying(true);
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'playback'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao reproduzir', { description: error.message });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.pause();
    },
    onSuccess: () => {
      setIsPlaying(false);
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'playback'] });
    },
  });

  const nextMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.next();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'playback'] });
    },
  });

  const prevMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.previous();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'playback'] });
    },
  });

  return {
    playback: playbackQuery.data,
    currentTrack,
    isPlaying,
    play: (videoId?: string) => playMutation.mutate(videoId),
    pause: () => pauseMutation.mutate(),
    next: () => nextMutation.mutate(),
    prev: () => prevMutation.mutate(),
    isLoading: playbackQuery.isLoading,
    refetch: playbackQuery.refetch,
  };
}
`;

    case 'src/hooks/youtube/useYouTubeMusicLibrary.ts':
      return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';
import { toast } from 'sonner';

export function useYouTubeMusicLibrary() {
  const { isConnected, api } = useYouTubeMusicContext();
  const queryClient = useQueryClient();

  const likedSongsQuery = useQuery({
    queryKey: ['youtube-music', 'library', 'liked'],
    queryFn: async () => {
      if (!api) return [];
      return api.getLikedSongs();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 5,
  });

  const historyQuery = useQuery({
    queryKey: ['youtube-music', 'library', 'history'],
    queryFn: async () => {
      if (!api) return [];
      return api.getHistory();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 2,
  });

  const uploadedSongsQuery = useQuery({
    queryKey: ['youtube-music', 'library', 'uploads'],
    queryFn: async () => {
      if (!api) return [];
      return api.getUploadedSongs();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 10,
  });

  const likeSongMutation = useMutation({
    mutationFn: async (videoId: string) => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.likeSong(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'library', 'liked'] });
      toast.success('Música curtida');
    },
  });

  const unlikeSongMutation = useMutation({
    mutationFn: async (videoId: string) => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.unlikeSong(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'library', 'liked'] });
      toast.success('Curtida removida');
    },
  });

  return {
    likedSongs: likedSongsQuery.data ?? [],
    history: historyQuery.data ?? [],
    uploadedSongs: uploadedSongsQuery.data ?? [],
    isLoading: likedSongsQuery.isLoading || historyQuery.isLoading,
    likeSong: likeSongMutation.mutate,
    unlikeSong: unlikeSongMutation.mutate,
    refetch: () => {
      likedSongsQuery.refetch();
      historyQuery.refetch();
      uploadedSongsQuery.refetch();
    },
  };
}
`;

    case 'src/hooks/youtube/useYouTubeMusicPlaylists.ts':
      return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';
import { toast } from 'sonner';

export function useYouTubeMusicPlaylists() {
  const { isConnected, api } = useYouTubeMusicContext();
  const queryClient = useQueryClient();

  const playlistsQuery = useQuery({
    queryKey: ['youtube-music', 'playlists'],
    queryFn: async () => {
      if (!api) return [];
      return api.getPlaylists();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 2,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async ({ title, description, privacy }: { 
      title: string; 
      description?: string; 
      privacy?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED' 
    }) => {
      if (!api) throw new Error('YouTube Music not connected');
      return api.createPlaylist(title, description, privacy ?? 'PRIVATE');
    },
    onSuccess: (playlist) => {
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'playlists'] });
      toast.success(\`Playlist "\${playlist.title}" criada\`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar playlist', { description: error.message });
    },
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, videoIds }: { playlistId: string; videoIds: string[] }) => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.addToPlaylist(playlistId, videoIds);
    },
    onSuccess: () => {
      toast.success('Músicas adicionadas à playlist');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar à playlist', { description: error.message });
    },
  });

  const removeFromPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, setVideoIds }: { playlistId: string; setVideoIds: string[] }) => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.removeFromPlaylist(playlistId, setVideoIds);
    },
    onSuccess: () => {
      toast.success('Músicas removidas da playlist');
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!api) throw new Error('YouTube Music not connected');
      await api.deletePlaylist(playlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-music', 'playlists'] });
      toast.success('Playlist excluída');
    },
  });

  return {
    playlists: playlistsQuery.data ?? [],
    isLoading: playlistsQuery.isLoading,
    createPlaylist: createPlaylistMutation.mutate,
    addToPlaylist: addToPlaylistMutation.mutate,
    removeFromPlaylist: removeFromPlaylistMutation.mutate,
    deletePlaylist: deletePlaylistMutation.mutate,
    refetch: playlistsQuery.refetch,
  };
}
`;

    case 'src/hooks/youtube/useYouTubeMusicBrowse.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';

export function useYouTubeMusicBrowse() {
  const { isConnected, api } = useYouTubeMusicContext();

  const homeQuery = useQuery({
    queryKey: ['youtube-music', 'browse', 'home'],
    queryFn: async () => {
      if (!api) return { sections: [] };
      return api.getHome();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 30,
  });

  const chartsQuery = useQuery({
    queryKey: ['youtube-music', 'browse', 'charts'],
    queryFn: async () => {
      if (!api) return { songs: [], videos: [], artists: [] };
      return api.getCharts('BR');
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 60,
  });

  const moodPlaylistsQuery = useQuery({
    queryKey: ['youtube-music', 'browse', 'moods'],
    queryFn: async () => {
      if (!api) return { moods: [] };
      return api.getMoodPlaylists();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 60,
  });

  return {
    homeSections: homeQuery.data?.sections ?? [],
    chartSongs: chartsQuery.data?.songs ?? [],
    chartArtists: chartsQuery.data?.artists ?? [],
    moodPlaylists: moodPlaylistsQuery.data?.moods ?? [],
    isLoading: homeQuery.isLoading || chartsQuery.isLoading,
    refetch: () => {
      homeQuery.refetch();
      chartsQuery.refetch();
      moodPlaylistsQuery.refetch();
    },
  };
}
`;

    case 'src/hooks/youtube/useYouTubeMusicRecommendations.ts':
      return `import { useQuery } from '@tanstack/react-query';
import { useYouTubeMusicContext } from '@/contexts/YouTubeMusicContext';

interface RecommendationOptions {
  videoId?: string;
  playlistId?: string;
}

export function useYouTubeMusicRecommendations(options: RecommendationOptions = {}) {
  const { isConnected, api } = useYouTubeMusicContext();
  const { videoId, playlistId } = options;

  const hasSource = !!videoId || !!playlistId;

  const watchPlaylistQuery = useQuery({
    queryKey: ['youtube-music', 'recommendations', 'watch', videoId],
    queryFn: async () => {
      if (!api || !videoId) return { tracks: [] };
      return api.getWatchPlaylist(videoId);
    },
    enabled: isConnected && !!videoId,
    staleTime: 1000 * 60 * 15,
  });

  const relatedQuery = useQuery({
    queryKey: ['youtube-music', 'recommendations', 'related', playlistId],
    queryFn: async () => {
      if (!api || !playlistId) return { suggestions: [] };
      return api.getRelatedPlaylists(playlistId);
    },
    enabled: isConnected && !!playlistId,
    staleTime: 1000 * 60 * 30,
  });

  const mixesQuery = useQuery({
    queryKey: ['youtube-music', 'recommendations', 'mixes'],
    queryFn: async () => {
      if (!api) return { mixes: [] };
      return api.getPersonalMixes();
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 60,
  });

  return {
    watchPlaylist: watchPlaylistQuery.data?.tracks ?? [],
    relatedPlaylists: relatedQuery.data?.suggestions ?? [],
    personalMixes: mixesQuery.data?.mixes ?? [],
    isLoading: watchPlaylistQuery.isLoading || relatedQuery.isLoading || mixesQuery.isLoading,
    refetch: () => {
      if (videoId) watchPlaylistQuery.refetch();
      if (playlistId) relatedQuery.refetch();
      mixesQuery.refetch();
    },
  };
}
`;

    default:
      return null;
  }
}
