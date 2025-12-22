import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Shuffle, Clock, Music, Loader2 } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { YouTubeMusicTrackItem, AddToPlaylistModal } from '@/components/youtube';
import { useYouTubeMusicLibrary, useYouTubeMusicPlayer } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { YouTubeMusicTrack, YouTubeMusicPlaylist } from '@/lib/api/youtubeMusic';
import { toast } from 'sonner';

export default function YouTubeMusicPlaylistPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { youtubeMusic } = useSettings();
  
  const { playlists, getPlaylistTracks, createPlaylist, addToPlaylist } = useYouTubeMusicLibrary();
  const { play, addToQueue } = useYouTubeMusicPlayer();
  
  const [playlist, setPlaylist] = useState<YouTubeMusicPlaylist | null>(null);
  const [tracks, setTracks] = useState<YouTubeMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<YouTubeMusicTrack | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  useEffect(() => {
    if (!youtubeMusic.isConnected) {
      toast.error('Conecte-se ao YouTube Music nas configurações');
      navigate('/settings');
      return;
    }

    const loadPlaylist = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Find playlist info
        const foundPlaylist = playlists.find(p => p.id === id);
        if (foundPlaylist) {
          setPlaylist(foundPlaylist);
        }
        
        // Load tracks
        const playlistTracks = await getPlaylistTracks(id);
        setTracks(playlistTracks);
      } catch (error) {
        toast.error('Erro ao carregar playlist');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylist();
  }, [id, youtubeMusic.isConnected, playlists, getPlaylistTracks, navigate]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      play(tracks[0].videoId);
      toast.success('Reproduzindo playlist');
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      play(tracks[randomIndex].videoId);
      toast.success('Reproduzindo em modo aleatório');
    }
  };

  const handlePlayTrack = (track: YouTubeMusicTrack) => {
    play(track.videoId);
  };

  const handleAddToQueue = (track: YouTubeMusicTrack) => {
    addToQueue(track.videoId);
    toast.success('Adicionado à fila');
  };

  const handleAddToPlaylistClick = (track: YouTubeMusicTrack) => {
    setSelectedTrack(track);
    setIsPlaylistModalOpen(true);
  };

  const totalDuration = tracks.reduce((acc, track) => acc + track.durationMs, 0);
  const formatTotalDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  return (
    <KioskLayout>
      <div className="min-h-screen bg-kiosk-background">
        {/* Header with Playlist Info */}
        <motion.header
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF0000]/20 to-kiosk-background" />
          
          <div className="relative p-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/youtube-music')}
              className="w-10 h-10 rounded-full mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Playlist Cover */}
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-kiosk-surface flex-shrink-0 shadow-2xl">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : playlist?.thumbnailUrl ? (
                  <img
                    src={playlist.thumbnailUrl}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF0000]/30 to-[#FF0000]/10">
                    <Music className="w-20 h-20 text-[#FF0000]/50" />
                  </div>
                )}
              </div>

              {/* Playlist Info */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-kiosk-text/85 uppercase tracking-wide mb-1">Playlist</p>
                    <h1 className="text-3xl font-bold text-kiosk-text mb-2">
                      {playlist?.title || 'Playlist'}
                    </h1>
                    {playlist?.description && (
                      <p className="text-kiosk-text/90 mb-4">{playlist.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-kiosk-text/85">
                      <span>{tracks.length} músicas</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTotalDuration(totalDuration)}
                      </span>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handlePlayAll}
                    disabled={isLoading || tracks.length === 0}
                    className="bg-[#FF0000] hover:bg-[#FF0000]/90 text-white gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Reproduzir
                  </Button>
                  <Button
                    variant="kiosk-outline"
                    onClick={handleShufflePlay}
                    disabled={isLoading || tracks.length === 0}
                    className="gap-2"
                  >
                    <Shuffle className="w-5 h-5" />
                    Aleatório
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Tracks List */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-12 text-kiosk-text/85">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Esta playlist está vazia</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <YouTubeMusicTrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  isLiked={track.isLiked}
                  onPlay={() => handlePlayTrack(track)}
                  onAddToQueue={() => handleAddToQueue(track)}
                  onAddToPlaylist={() => handleAddToPlaylistClick(track)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add to Playlist Modal */}
        <AddToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => {
            setIsPlaylistModalOpen(false);
            setSelectedTrack(null);
          }}
          track={selectedTrack}
          playlists={playlists}
          onAddToPlaylist={addToPlaylist}
          onCreatePlaylist={createPlaylist}
        />
      </div>
    </KioskLayout>
  );
}
