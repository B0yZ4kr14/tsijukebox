import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, X, Music, Disc, ListMusic, Loader2 } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YouTubeMusicTrackItem, YouTubeMusicAlbumCard, YouTubeMusicPlaylistCard, AddToPlaylistModal } from '@/components/youtube';
import { useYouTubeMusicSearch } from '@/hooks/useYouTubeMusicSearch';
import { useYouTubeMusicLibrary } from '@/hooks/useYouTubeMusicLibrary';
import { useYouTubeMusicPlayer } from '@/hooks/useYouTubeMusicPlayer';
import { useSettings } from '@/contexts/SettingsContext';
import { YouTubeMusicTrack } from '@/lib/api/youtubeMusic';
import { toast } from 'sonner';

export default function YouTubeMusicSearch() {
  const navigate = useNavigate();
  const { youtubeMusic } = useSettings();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { results, isSearching, search, clearResults } = useYouTubeMusicSearch();
  const { playlists, createPlaylist, addToPlaylist } = useYouTubeMusicLibrary();
  const { play, addToQueue } = useYouTubeMusicPlayer();
  
  const [selectedTrack, setSelectedTrack] = useState<YouTubeMusicTrack | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  useEffect(() => {
    if (!youtubeMusic.isConnected) {
      toast.error('Conecte-se ao YouTube Music nas configurações');
      navigate('/settings');
    }
  }, [youtubeMusic.isConnected, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
  };

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

  const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.playlists.length > 0;

  return (
    <KioskLayout>
      <div className="min-h-screen bg-kiosk-background">
        {/* Header */}
        <motion.header
          className="p-4 border-b border-kiosk-border"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/youtube-music')}
              className="w-10 h-10 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-kiosk-text">Buscar</h1>
              <p className="text-sm text-kiosk-text/85">YouTube Music</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-text/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar músicas, álbuns, playlists..."
              className="pl-10 pr-10 bg-kiosk-surface border-kiosk-border text-kiosk-text"
              autoFocus
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </form>
        </motion.header>

        <div className="p-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF0000]" />
            </div>
          ) : !hasResults ? (
            <div className="text-center py-20 text-kiosk-text/85">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Busque por músicas, álbuns ou playlists</p>
              <p className="text-sm">Digite algo no campo de busca acima</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-kiosk-surface">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="tracks" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                  <Music className="w-4 h-4" />
                  Músicas ({results.tracks.length})
                </TabsTrigger>
                <TabsTrigger value="albums" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                  <Disc className="w-4 h-4" />
                  Álbuns ({results.albums.length})
                </TabsTrigger>
                <TabsTrigger value="playlists" className="gap-2 data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                  <ListMusic className="w-4 h-4" />
                  Playlists ({results.playlists.length})
                </TabsTrigger>
              </TabsList>

              {/* All Results */}
              <TabsContent value="all" className="space-y-8">
                {results.tracks.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-kiosk-text mb-4">Músicas</h2>
                    <div className="space-y-1">
                      {results.tracks.slice(0, 5).map((track, index) => (
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
                    {results.tracks.length > 5 && (
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('tracks')}
                        className="mt-2 text-[#FF0000]"
                      >
                        Ver todas ({results.tracks.length})
                      </Button>
                    )}
                  </section>
                )}

                {results.albums.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-kiosk-text mb-4">Álbuns</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {results.albums.slice(0, 5).map((album) => (
                        <YouTubeMusicAlbumCard
                          key={album.id}
                          album={album}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {results.playlists.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-kiosk-text mb-4">Playlists</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {results.playlists.slice(0, 5).map((playlist) => (
                        <YouTubeMusicPlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onClick={() => navigate(`/youtube-music/playlist/${playlist.id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* Tracks Only */}
              <TabsContent value="tracks">
                <div className="space-y-1">
                  {results.tracks.map((track, index) => (
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
              </TabsContent>

              {/* Albums Only */}
              <TabsContent value="albums">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.albums.map((album) => (
                    <YouTubeMusicAlbumCard
                      key={album.id}
                      album={album}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Playlists Only */}
              <TabsContent value="playlists">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.playlists.map((playlist) => (
                    <YouTubeMusicPlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onClick={() => navigate(`/youtube-music/playlist/${playlist.id}`)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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
