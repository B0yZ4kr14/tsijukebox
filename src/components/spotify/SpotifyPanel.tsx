import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ListMusic, Heart, Clock, Sparkles, Music2, Play, Plus, X, Disc3, Star, TrendingUp } from 'lucide-react';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpotifyPlaylists } from '@/hooks/useSpotifyPlaylists';
import { useSpotifyLibrary } from '@/hooks/useSpotifyLibrary';
import { useSpotifySearch } from '@/hooks/useSpotifySearch';
import { useSpotifyRecommendations } from '@/hooks/useSpotifyRecommendations';
import { useSpotifyBrowse } from '@/hooks/useSpotifyBrowse';
import { useSettings } from '@/contexts/SettingsContext';
import { spotifyClient, SpotifyTrack, SpotifyAlbum, SpotifyPlaylist } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { RippleContainer } from '@/components/ui/RippleContainer';

interface SpotifyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackId?: string;
  currentAlbumId?: string;
  currentArtistIds?: string[];
}

function TrackRow({ track, onPlay, onAddToQueue }: { 
  track: SpotifyTrack; 
  onPlay: () => void;
  onAddToQueue: () => void;
}) {
  const playRipple = useRipple();
  const queueRipple = useRipple();
  const { playSound } = useSoundEffects();
  const { soundEnabled, animationsEnabled } = useSettings();

  const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) playRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    onPlay();
  };

  const handleQueue = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animationsEnabled) queueRipple.createRipple(e);
    if (soundEnabled) playSound('click');
    onAddToQueue();
  };

  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors card-3d">
      <div className="relative w-10 h-10 flex-shrink-0">
        {track.albumImageUrl ? (
          <img 
            src={track.albumImageUrl} 
            alt={track.album}
            className="w-full h-full object-cover rounded shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-kiosk-surface rounded flex items-center justify-center">
            <Music2 className="w-4 h-4 text-kiosk-text/85" />
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded relative overflow-hidden"
        >
          <RippleContainer ripples={playRipple.ripples} color="spotify" />
          <Play className="w-4 h-4 text-white fill-white relative z-10" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-kiosk-text truncate">{track.name}</p>
        <p className="text-xs text-kiosk-text/90 truncate">{track.artist}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity button-3d relative overflow-hidden"
        onClick={handleQueue}
        aria-label="Adicionar à fila"
      >
        <RippleContainer ripples={queueRipple.ripples} color="spotify" />
        <Plus className="w-4 h-4 relative z-10" />
      </Button>
    </div>
  );
}

function AlbumCard({ album, onPlay, isPlaying }: { album: SpotifyAlbum; onPlay: () => void; isPlaying?: boolean }) {
  return (
    <button
      onClick={onPlay}
      className="group flex flex-col gap-2 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-all card-3d-deep"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        {album.imageUrl ? (
          <img 
            src={album.imageUrl} 
            alt={album.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
            <Disc3 className="w-8 h-8 text-kiosk-text/85" />
          </div>
        )}
        {isPlaying ? (
          <div className="absolute inset-x-0 bottom-0 h-8 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent pb-1">
            <AudioVisualizer isPlaying={true} barCount={8} variant="compact" className="opacity-90" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        )}
      </div>
      <div className="text-left">
        <p className="text-xs font-medium text-kiosk-text truncate">{album.name}</p>
        <p className="text-[10px] text-kiosk-text/90 truncate">{album.artist}</p>
      </div>
    </button>
  );
}

function PlaylistCard({ playlist, onPlay, isPlaying }: { playlist: SpotifyPlaylist; onPlay: () => void; isPlaying?: boolean }) {
  return (
    <button
      onClick={onPlay}
      className="group flex flex-col gap-2 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-all card-3d-deep"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        {playlist.imageUrl ? (
          <img 
            src={playlist.imageUrl} 
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
            <ListMusic className="w-8 h-8 text-kiosk-text/85" />
          </div>
        )}
        {isPlaying ? (
          <div className="absolute inset-x-0 bottom-0 h-8 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent pb-1">
            <AudioVisualizer isPlaying={true} barCount={8} variant="compact" className="opacity-90" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        )}
      </div>
      <div className="text-left">
        <p className="text-xs font-medium text-kiosk-text truncate">{playlist.name}</p>
        <p className="text-[10px] text-kiosk-text/90 truncate">{playlist.tracksTotal} músicas</p>
      </div>
    </button>
  );
}

export function SpotifyPanel({ isOpen, onClose, currentTrackId, currentAlbumId, currentArtistIds = [] }: SpotifyPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('playlists');
  const { spotify } = useSettings();
  const isConnected = spotify.isConnected;

  const { playlists, isLoading: playlistsLoading } = useSpotifyPlaylists();
  const { likedTracks, recentlyPlayed, isLoading: libraryLoading } = useSpotifyLibrary();
  const { results: searchResults, isSearching, setQuery: setSpotifyQuery } = useSpotifySearch();
  const { recommendations, isLoading: recommendationsLoading } = useSpotifyRecommendations({
    seedTrackId: currentTrackId,
    seedArtistIds: currentArtistIds,
    enabled: activeTab === 'recommendations' && isConnected,
  });
  const { 
    featuredPlaylists, 
    newReleases, 
    categories, 
    topTracks,
    isLoading: browseLoading 
  } = useSpotifyBrowse();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSpotifyQuery(searchQuery);
      setActiveTab('search');
    }
  };

  const handlePlayTrack = async (track: SpotifyTrack) => {
    try {
      await spotifyClient.play({ uris: [track.uri] });
      toast.success(`Tocando ${track.name}`);
    } catch (error) {
      toast.error('Erro ao tocar música');
    }
  };

  const handleAddToQueue = async (track: SpotifyTrack) => {
    try {
      await spotifyClient.addToQueue(track.uri);
      toast.success(`${track.name} adicionada à fila`);
    } catch (error) {
      toast.error('Erro ao adicionar à fila');
    }
  };

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      await spotifyClient.play({ contextUri: `spotify:playlist:${playlistId}` });
      toast.success('Playlist iniciada');
    } catch (error) {
      toast.error('Erro ao tocar playlist');
    }
  };

  const handlePlayAlbum = async (albumId: string) => {
    try {
      await spotifyClient.play({ contextUri: `spotify:album:${albumId}` });
      toast.success('Álbum iniciado');
    } catch (error) {
      toast.error('Erro ao tocar álbum');
    }
  };

  if (!isConnected) {
    return null;
  }

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-kiosk-surface/50 rounded animate-pulse" />
      ))}
    </div>
  );

  return (
    <div 
      className={cn(
        "fixed top-0 right-0 h-full w-96 z-50 transition-transform duration-300 ease-out panel-3d",
        "bg-kiosk-bg/98 backdrop-blur-xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kiosk-surface header-3d">
        <h2 className="text-lg font-bold text-kiosk-text flex items-center gap-2">
          <Music2 className="w-5 h-5 text-[#1DB954]" />
          Spotify
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 button-3d" aria-label="Fechar painel">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="p-4 border-b border-kiosk-surface">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/85" />
          <Input
            type="text"
            placeholder="Buscar músicas, artistas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-kiosk-surface border-kiosk-surface/50 text-kiosk-text placeholder:text-kiosk-text/85 progress-track-3d"
          />
        </div>
      </form>

      {/* Tabs - 7 tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100%-140px)]">
        <TabsList className="grid grid-cols-7 mx-4 bg-kiosk-surface/50 badge-3d">
          <TabsTrigger value="playlists" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Suas Playlists">
            <ListMusic className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="liked" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Curtidas">
            <Heart className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Recentes">
            <Clock className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Recomendações">
            <Sparkles className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="releases" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Lançamentos">
            <Disc3 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="featured" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Destaque">
            <Star className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="top" className="text-xs p-1 data-[state=active]:bg-[#1DB954] data-[state=active]:text-white" title="Top">
            <TrendingUp className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="px-4 pb-4"
            >
              {/* Playlists Tab */}
              {activeTab === 'playlists' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Suas Playlists</h3>
                  {playlistsLoading ? <LoadingSkeleton /> : (
                    <div className="space-y-1">
                      {playlists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => handlePlayPlaylist(playlist.id)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors text-left card-3d"
                        >
                          {playlist.imageUrl ? (
                            <img src={playlist.imageUrl} alt={playlist.name} className="w-10 h-10 object-cover rounded shadow-lg" />
                          ) : (
                            <div className="w-10 h-10 bg-kiosk-surface rounded flex items-center justify-center">
                              <ListMusic className="w-4 h-4 text-kiosk-text/85" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-kiosk-text truncate">{playlist.name}</p>
                            <p className="text-xs text-kiosk-text/90">{playlist.tracksTotal} músicas</p>
                          </div>
                          <Play className="w-4 h-4 text-kiosk-text/85" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Liked Songs Tab */}
              {activeTab === 'liked' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Músicas Curtidas</h3>
                  {libraryLoading ? <LoadingSkeleton /> : (
                    <div className="space-y-1">
                      {likedTracks.slice(0, 30).map((track) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          onPlay={() => handlePlayTrack(track)}
                          onAddToQueue={() => handleAddToQueue(track)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Recent Tab */}
              {activeTab === 'recent' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Tocadas Recentemente</h3>
                  {libraryLoading ? <LoadingSkeleton /> : (
                    <div className="space-y-1">
                      {recentlyPlayed.slice(0, 30).map((track, idx) => (
                        <TrackRow
                          key={`${track.id}-${idx}`}
                          track={track}
                          onPlay={() => handlePlayTrack(track)}
                          onAddToQueue={() => handleAddToQueue(track)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Para Você</h3>
                  {!currentTrackId ? (
                    <div className="text-center py-8 text-kiosk-text/90">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-60" />
                      <p className="text-sm">Toque uma música para ver recomendações</p>
                    </div>
                  ) : recommendationsLoading ? <LoadingSkeleton /> : (
                    <div className="space-y-1">
                      {recommendations.map((track) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          onPlay={() => handlePlayTrack(track)}
                          onAddToQueue={() => handleAddToQueue(track)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* New Releases Tab */}
              {activeTab === 'releases' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Novos Lançamentos</h3>
                  {browseLoading ? <LoadingSkeleton /> : (
                    <div className="grid grid-cols-2 gap-2">
                      {newReleases.slice(0, 20).map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onPlay={() => handlePlayAlbum(album.id)}
                          isPlaying={currentAlbumId === album.id}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Featured Playlists Tab */}
              {activeTab === 'featured' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Playlists em Destaque</h3>
                  {browseLoading ? <LoadingSkeleton /> : (
                    <div className="grid grid-cols-2 gap-2">
                      {featuredPlaylists.slice(0, 20).map((playlist) => (
                        <PlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onPlay={() => handlePlayPlaylist(playlist.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Top Tracks Tab */}
              {activeTab === 'top' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Suas Top Músicas</h3>
                  {browseLoading ? <LoadingSkeleton /> : (
                    <div className="space-y-1">
                      {topTracks.slice(0, 30).map((track, idx) => (
                        <div key={track.id} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-kiosk-primary w-5">{idx + 1}</span>
                          <div className="flex-1">
                            <TrackRow
                              track={track}
                              onPlay={() => handlePlayTrack(track)}
                              onAddToQueue={() => handleAddToQueue(track)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Search Results Tab */}
              {activeTab === 'search' && (
                <>
                  <h3 className="text-sm font-semibold text-kiosk-text/85 mb-3">Resultados da Busca</h3>
                  {isSearching ? <LoadingSkeleton /> : searchResults.tracks.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.tracks.slice(0, 30).map((track) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          onPlay={() => handlePlayTrack(track)}
                          onAddToQueue={() => handleAddToQueue(track)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-kiosk-text/75">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-60" />
                      <p className="text-sm">Pesquise por músicas ou artistas</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// Toggle button to open the panel
export function SpotifyPanelToggle({ onClick, isOpen, isConnected = true }: { onClick: () => void; isOpen: boolean; isConnected?: boolean }) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-full transition-all button-3d",
        isConnected 
          ? isOpen 
            ? "bg-[#1DB954] text-white button-primary-3d" 
            : "bg-kiosk-surface/50 text-[#1DB954] hover:bg-[#1DB954]/20"
          : "bg-kiosk-surface/30 text-kiosk-text/40 hover:bg-kiosk-surface/50 hover:text-kiosk-text/60"
      )}
    >
      {isOpen ? <X className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
    </Button>
  );
}
