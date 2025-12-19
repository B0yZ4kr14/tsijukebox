import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, ListMusic, Disc3, User2, Music, Play, 
  Plus, ChevronRight, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks';
import { useSpotifyPlaylists } from '@/hooks/useSpotifyPlaylists';
import { useSpotifyLibrary } from '@/hooks/useSpotifyLibrary';
import { useSpotifySearch } from '@/hooks/useSpotifySearch';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface LibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LibraryPanel({ isOpen, onClose }: LibraryPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('playlists');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { playlists, isLoading: playlistsLoading } = useSpotifyPlaylists();
  const { likedTracks, albums, artists } = useSpotifyLibrary();
  const { results, setQuery, isSearching } = useSpotifySearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setQuery(query);
    if (query.trim().length > 2) {
      setActiveTab('search');
    }
  };

  const handlePlayPlaylist = async (uri: string) => {
    try {
      await api.playSpotifyUri(uri);
      toast.success(t('player.playing'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handlePlayTrack = async (uri: string) => {
    try {
      await api.playSpotifyUri(uri);
      toast.success(t('player.playing'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleAddToQueue = async (uri: string) => {
    try {
      await api.addToQueue(uri);
      toast.success(t('player.trackAdded'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-80 lg:w-96 z-40 bg-kiosk-bg/95 backdrop-blur-xl border-l border-cyan-500/20 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <h2 className="text-lg font-bold text-gold-neon flex items-center gap-2">
              <ListMusic className="w-5 h-5 icon-neon-blue" />
              {t('spotify.playlists')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-kiosk-text/80 hover:text-kiosk-text"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-cyan-500/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/50" />
              <Input
                placeholder={t('spotify.search')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-kiosk-surface/50 border-cyan-500/20 focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 gap-1 mx-4 mt-2 bg-kiosk-surface/30">
              <TabsTrigger value="playlists" className="text-xs data-[state=active]:bg-primary/20">
                <ListMusic className="w-3 h-3 mr-1" />
                Playlists
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs data-[state=active]:bg-primary/20">
                <Search className="w-3 h-3 mr-1" />
                {t('common.search')}
              </TabsTrigger>
              <TabsTrigger value="albums" className="text-xs data-[state=active]:bg-primary/20">
                <Disc3 className="w-3 h-3 mr-1" />
                Álbuns
              </TabsTrigger>
              <TabsTrigger value="artists" className="text-xs data-[state=active]:bg-primary/20">
                <User2 className="w-3 h-3 mr-1" />
                Artistas
              </TabsTrigger>
            </TabsList>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {/* Liked Songs */}
                  <button
                    onClick={() => handlePlayPlaylist('spotify:collection:tracks')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-kiosk-text">{t('spotify.liked')}</p>
                      <p className="text-xs text-kiosk-text/70">{likedTracks.length} {t('spotify.songs')}</p>
                    </div>
                    <Play className="w-5 h-5 text-kiosk-text/50 group-hover:text-[#1DB954] transition-colors" />
                  </button>

                  {/* User Playlists */}
                  {playlistsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 rounded-lg bg-kiosk-surface/30 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handlePlayPlaylist(`spotify:playlist:${playlist.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-kiosk-surface/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          {playlist.imageUrl ? (
                            <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                              <Music className="w-5 h-5 text-kiosk-text/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-kiosk-text truncate">{playlist.name}</p>
                          <p className="text-xs text-kiosk-text/60">{playlist.tracksTotal || 0} {t('spotify.songs')}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-kiosk-text/30 group-hover:text-kiosk-text/60 transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
                    </div>
                  ) : searchQuery.length < 3 ? (
                    <div className="text-center py-12 text-kiosk-text/60">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('spotify.search')}</p>
                    </div>
                  ) : results.tracks.length === 0 ? (
                    <div className="text-center py-12 text-kiosk-text/60">
                      <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum resultado encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {results.tracks.slice(0, 20).map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            {track.albumImageUrl ? (
                              <img src={track.albumImageUrl} alt={track.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                                <Music className="w-4 h-4 text-kiosk-text/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-kiosk-text truncate">{track.name}</p>
                            <p className="text-xs text-kiosk-text/60 truncate">
                              {track.artists?.map((a) => a.name).join(', ')}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => handlePlayTrack(track.uri)}
                            >
                              <Play className="w-4 h-4 text-[#1DB954]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => handleAddToQueue(track.uri)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Albums Tab */}
            <TabsContent value="albums" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid grid-cols-2 gap-3">
                  {albums.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-kiosk-text/60">
                      <Disc3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum álbum salvo</p>
                    </div>
                  ) : (
                    albums.slice(0, 20).map((album) => (
                      <button
                        key={album.id}
                        onClick={() => handlePlayPlaylist(`spotify:album:${album.id}`)}
                        className="p-3 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10 hover:border-cyan-500/30 transition-all text-left group"
                      >
                        <div className="aspect-square rounded overflow-hidden mb-2">
                          {album.imageUrl ? (
                            <img src={album.imageUrl} alt={album.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                              <Disc3 className="w-8 h-8 text-kiosk-text/40" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-kiosk-text truncate">{album.name}</p>
                        <p className="text-xs text-kiosk-text/60 truncate">{album.artist}</p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Artists Tab */}
            <TabsContent value="artists" className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid grid-cols-2 gap-3">
                  {artists.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-kiosk-text/60">
                      <User2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum artista seguido</p>
                    </div>
                  ) : (
                    artists.slice(0, 20).map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => handlePlayPlaylist(`spotify:artist:${artist.id}`)}
                        className="p-3 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                      >
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-2">
                          {artist.imageUrl ? (
                            <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                              <User2 className="w-6 h-6 text-kiosk-text/40" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-kiosk-text truncate">{artist.name}</p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LibraryPanelToggle({ 
  onClick, 
  isOpen 
}: { 
  onClick: () => void; 
  isOpen: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`w-10 h-10 rounded-full transition-all ${
        isOpen 
          ? 'bg-cyan-500/20 text-cyan-400' 
          : 'bg-kiosk-surface/50 text-kiosk-text/70 hover:text-cyan-400'
      }`}
    >
      <ListMusic className="w-5 h-5" />
    </Button>
  );
}
