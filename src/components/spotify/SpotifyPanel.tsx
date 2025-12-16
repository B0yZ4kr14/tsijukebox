import { useState } from 'react';
import { Search, ListMusic, Heart, Clock, Sparkles, Music2, ChevronLeft, ChevronRight, Play, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpotifyPlaylists } from '@/hooks/useSpotifyPlaylists';
import { useSpotifyLibrary } from '@/hooks/useSpotifyLibrary';
import { useSpotifySearch } from '@/hooks/useSpotifySearch';
import { useSpotifyRecommendations } from '@/hooks/useSpotifyRecommendations';
import { useSettings } from '@/contexts/SettingsContext';
import { spotifyClient, SpotifyTrack } from '@/lib/api/spotify';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SpotifyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackId?: string;
  currentArtistIds?: string[];
}

function TrackRow({ track, onPlay, onAddToQueue }: { 
  track: SpotifyTrack; 
  onPlay: () => void;
  onAddToQueue: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors">
      <div className="relative w-10 h-10 flex-shrink-0">
        {track.albumImageUrl ? (
          <img 
            src={track.albumImageUrl} 
            alt={track.album}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-kiosk-surface rounded flex items-center justify-center">
            <Music2 className="w-4 h-4 text-kiosk-text/50" />
          </div>
        )}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
        >
          <Play className="w-4 h-4 text-white fill-white" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-kiosk-text truncate">{track.name}</p>
        <p className="text-xs text-kiosk-text/60 truncate">{track.artist}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onAddToQueue}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function SpotifyPanel({ isOpen, onClose, currentTrackId, currentArtistIds = [] }: SpotifyPanelProps) {
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

  if (!isConnected) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed top-0 right-0 h-full w-80 bg-kiosk-background/95 backdrop-blur-xl border-l border-kiosk-surface z-50 transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-kiosk-surface">
        <h2 className="text-lg font-bold text-kiosk-text flex items-center gap-2">
          <Music2 className="w-5 h-5 text-[#1DB954]" />
          Spotify
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="p-4 border-b border-kiosk-surface">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/50" />
          <Input
            type="text"
            placeholder="Buscar músicas, artistas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-kiosk-surface border-kiosk-surface/50 text-kiosk-text placeholder:text-kiosk-text/40"
          />
        </div>
      </form>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100%-140px)]">
        <TabsList className="grid grid-cols-4 mx-4 bg-kiosk-surface/50">
          <TabsTrigger value="playlists" className="text-xs data-[state=active]:bg-[#1DB954] data-[state=active]:text-white">
            <ListMusic className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="liked" className="text-xs data-[state=active]:bg-[#1DB954] data-[state=active]:text-white">
            <Heart className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs data-[state=active]:bg-[#1DB954] data-[state=active]:text-white">
            <Clock className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs data-[state=active]:bg-[#1DB954] data-[state=active]:text-white">
            <Sparkles className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-2">
          {/* Playlists Tab */}
          <TabsContent value="playlists" className="px-4 pb-4 mt-0">
            {playlistsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-kiosk-surface/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlayPlaylist(playlist.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors text-left"
                  >
                    {playlist.imageUrl ? (
                      <img 
                        src={playlist.imageUrl} 
                        alt={playlist.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-kiosk-surface rounded flex items-center justify-center">
                        <ListMusic className="w-4 h-4 text-kiosk-text/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-kiosk-text truncate">{playlist.name}</p>
                      <p className="text-xs text-kiosk-text/60">{playlist.tracksTotal} músicas</p>
                    </div>
                    <Play className="w-4 h-4 text-kiosk-text/40" />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Liked Songs Tab */}
          <TabsContent value="liked" className="px-4 pb-4 mt-0">
            {libraryLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-kiosk-surface/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {likedTracks.slice(0, 20).map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    onPlay={() => handlePlayTrack(track)}
                    onAddToQueue={() => handleAddToQueue(track)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="px-4 pb-4 mt-0">
            {libraryLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-kiosk-surface/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {recentlyPlayed.slice(0, 20).map((track, idx) => (
                  <TrackRow
                    key={`${track.id}-${idx}`}
                    track={track}
                    onPlay={() => handlePlayTrack(track)}
                    onAddToQueue={() => handleAddToQueue(track)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="px-4 pb-4 mt-0">
            {!currentTrackId ? (
              <div className="text-center py-8 text-kiosk-text/60">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Toque uma música para ver recomendações</p>
              </div>
            ) : recommendationsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-kiosk-surface/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
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
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="search" className="px-4 pb-4 mt-0">
            {isSearching ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-kiosk-surface/50 rounded animate-pulse" />
                ))}
              </div>
            ) : searchResults.tracks.length > 0 ? (
              <div className="space-y-1">
                {searchResults.tracks.slice(0, 20).map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    onPlay={() => handlePlayTrack(track)}
                    onAddToQueue={() => handleAddToQueue(track)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-kiosk-text/60">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pesquise por músicas ou artistas</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => {}}
          className="absolute top-1/2 -left-10 -translate-y-1/2 w-10 h-20 bg-[#1DB954] rounded-l-lg flex items-center justify-center shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}

// Toggle button to open the panel
export function SpotifyPanelToggle({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-full transition-all",
        isOpen ? "bg-[#1DB954] text-white" : "bg-kiosk-surface/50 text-[#1DB954] hover:bg-[#1DB954]/20"
      )}
    >
      {isOpen ? <ChevronRight className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
    </Button>
  );
}
