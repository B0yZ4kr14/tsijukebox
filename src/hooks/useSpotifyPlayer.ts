import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

// Interface for playing via playerctl (backend)
interface PlayUriParams {
  uri: string;
  context?: string;
}

export function useSpotifyPlayer() {
  // Play track via playerctl (backend)
  const playMutation = useMutation({
    mutationFn: async ({ uri }: PlayUriParams) => {
      // Call backend to play via playerctl
      return api.playSpotifyUri(uri);
    },
    onError: (error) => {
      console.error('Play error:', error);
      toast.error('Erro ao reproduzir. Verifique se o Spotify está aberto.');
    },
  });

  const playTrack = (trackUri: string) => {
    playMutation.mutate({ uri: trackUri });
    toast.success('Reproduzindo...', { icon: '▶️' });
  };

  const playPlaylist = (playlistUri: string) => {
    playMutation.mutate({ uri: playlistUri });
    toast.success('Reproduzindo playlist...', { icon: '▶️' });
  };

  const playAlbum = (albumUri: string) => {
    playMutation.mutate({ uri: albumUri });
    toast.success('Reproduzindo álbum...', { icon: '▶️' });
  };

  const playArtist = (artistUri: string) => {
    playMutation.mutate({ uri: artistUri });
    toast.success('Reproduzindo artista...', { icon: '▶️' });
  };

  return {
    playTrack,
    playPlaylist,
    playAlbum,
    playArtist,
    isPlaying: playMutation.isPending,
  };
}
