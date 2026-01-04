import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Clock, Disc, Music, RefreshCw } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from "@/components/ui/themed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { YouTubeMusicTrackItem, YouTubeMusicAlbumCard, YouTubeMusicPlaylistCard, AddToPlaylistModal } from '@/components/youtube';
import { useYouTubeMusicLibrary, useYouTubeMusicPlayer } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { YouTubeMusicTrack } from '@/lib/api/youtubeMusic';
import { toast } from 'sonner';

export default function YouTubeMusicLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'liked';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { youtubeMusic } = useSettings();
  
  const {
    playlists,
    likedSongs,
    recentlyPlayed,
    albums,
    isLoading,
    fetchAll,
    createPlaylist,
    addToPlaylist,
  } = useYouTubeMusicLibrary();
  
  const { play, addToQueue } = useYouTubeMusicPlayer();
  
  const [selectedTrack, setSelectedTrack] = useState<YouTubeMusicTrack | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  useEffect(() => {
    if (!youtubeMusic.isConnected) {
      toast.error('Conecte-se ao YouTube Music nas configurações');
      navigate('/settings');
    }
  }, [youtubeMusic.isConnected, navigate]);

  const handlePlayTrack = (track: YouTubeMusicTrack) => {
    play(track.videoId);
  };

  const handleAddToQueue = (track: YouTubeMusicTrack) => {
    addToQueue(track.videoId);
    toast.success('Adicionado à fila');
  };

  const handleAddToPlaylist = (track: YouTubeMusicTrack) => {
    setSelectedTrack(track);
    setIsPlaylistModalOpen(true);
  };

  return (
    <KioskLayout>
      <div className="min-h-screen bg-kiosk-background">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between p-4 border-b border-kiosk-border"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/youtube-music')}
              className="w-10 h-10 rounded-full" aria-label="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-kiosk-text">Sua Biblioteca</h1>
              <p className="text-sm text-kiosk-text/85">YouTube Music</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={fetchAll}
            disabled={isLoading}
            className="w-10 h-10" aria-label="Atualizar">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </motion.header>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-kiosk-surface">
              <TabsTrigger value="liked" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <Heart className="w-4 h-4" />
                Curtidas
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <Clock className="w-4 h-4" />
                Recentes
              </TabsTrigger>
              <TabsTrigger value="albums" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <Disc className="w-4 h-4" />
                Álbuns
              </TabsTrigger>
              <TabsTrigger value="playlists" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <Music className="w-4 h-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            {/* Liked Songs */}
            <TabsContent value="liked">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center" aria-hidden="true">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-kiosk-text">Músicas Curtidas</h2>
                    <p className="text-sm text-kiosk-text/85">{likedSongs.length} músicas</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : likedSongs.length === 0 ? (
                  <div className="text-center py-12 text-kiosk-text/85">
                    <Heart aria-hidden="true" className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma música curtida</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {likedSongs.map((track, index) => (
                      <YouTubeMusicTrackItem
                        key={track.id}
                        track={track}
                        index={index}
                        isLiked={track.isLiked}
                        onPlay={() => handlePlayTrack(track)}
                        onAddToQueue={() => handleAddToQueue(track)}
                        onAddToPlaylist={() => handleAddToPlaylist(track)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Recently Played */}
            <TabsContent value="recent">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center" aria-hidden="true">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-kiosk-text">Tocadas Recentemente</h2>
                    <p className="text-sm text-kiosk-text/85">{recentlyPlayed.length} músicas</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : recentlyPlayed.length === 0 ? (
                  <div className="text-center py-12 text-kiosk-text/85">
                    <Clock aria-hidden="true" className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma música tocada recentemente</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentlyPlayed.map((track, index) => (
                      <YouTubeMusicTrackItem
                        key={track.id}
                        track={track}
                        index={index}
                        onPlay={() => handlePlayTrack(track)}
                        onAddToQueue={() => handleAddToQueue(track)}
                        onAddToPlaylist={() => handleAddToPlaylist(track)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Albums */}
            <TabsContent value="albums">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : albums.length === 0 ? (
                  <div className="text-center py-12 text-kiosk-text/85">
                    <Disc aria-hidden="true" className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum álbum salvo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {albums.map((album) => (
                      <YouTubeMusicAlbumCard
                        key={album.id}
                        album={album}
                        onClick={() => {/* TODO: Navigate to album */}}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Playlists */}
            <TabsContent value="playlists">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="text-center py-12 text-kiosk-text/85">
                    <Music aria-hidden="true" className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma playlist encontrada</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {playlists.map((playlist) => (
                      <YouTubeMusicPlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        onClick={() => navigate(`/youtube-music/playlist/${playlist.id}`)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
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
