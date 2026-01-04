import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Music, Plus, Loader2, Radio, Youtube, Disc3 } from 'lucide-react';
import { AddTrackParams } from '@/hooks/jam/useJamQueue';
import { useJamMusicSearch, JamTrack, MusicProvider } from '@/hooks/jam/useJamMusicSearch';
import { toast } from 'sonner';
import { Badge, Button, Input } from "@/components/ui/themed"

interface JamAddTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrack: (track: AddTrackParams) => Promise<boolean>;
}

export function JamAddTrackModal({ open, onOpenChange, onAddTrack }: JamAddTrackModalProps) {
  const [isAdding, setIsAdding] = useState<string | null>(null);
  
  const {
    query,
    setQuery,
    activeProvider,
    setActiveProvider,
    results,
    isLoading,
    isSpotifyConnected,
    isYouTubeConnected,
    hasResults,
  } = useJamMusicSearch();

  const handleAddTrack = async (track: JamTrack) => {
    setIsAdding(track.id);
    try {
      const success = await onAddTrack({
        trackId: track.id,
        trackName: track.trackName,
        artistName: track.artistName,
        albumArt: track.albumArt,
        durationMs: track.durationMs,
      });
      if (success) {
        toast.success(`"${track.trackName}" adicionada à fila`);
        onOpenChange(false);
        setQuery('');
      }
    } finally {
      setIsAdding(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveProvider(value as MusicProvider);
  };

  const getProviderIcon = (provider: MusicProvider) => {
    switch (provider) {
      case 'spotify':
        return <Radio className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'demo':
        return <Disc3 className="w-4 h-4" />;
    }
  };

  const getProviderLabel = (provider: MusicProvider) => {
    switch (provider) {
      case 'spotify':
        return 'Spotify';
      case 'youtube':
        return 'YouTube';
      case 'demo':
        return 'Demo';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Adicionar Música
          </DialogTitle>
          <DialogDescription>
            Pesquise e adicione músicas à fila colaborativa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Provider Tabs */}
          <Tabs value={activeProvider} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="spotify" 
                disabled={!isSpotifyConnected}
                className="gap-1.5 text-xs"
              >
                <Radio className="w-3 h-3" />
                Spotify
                {!isSpotifyConnected && (
                  <Badge variant="outline" className="ml-1 text-[10px] px-1">OFF</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="youtube" 
                disabled={!isYouTubeConnected}
                className="gap-1.5 text-xs"
              >
                <Youtube className="w-3 h-3" />
                YouTube
                {!isYouTubeConnected && (
                  <Badge variant="outline" className="ml-1 text-[10px] px-1">OFF</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="demo" className="gap-1.5 text-xs">
                <Disc3 className="w-3 h-3" />
                Demo
              </TabsTrigger>
            </TabsList>

            {/* Search Input */}
            <div className="relative mt-4">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Pesquisar no ${getProviderLabel(activeProvider)}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            {/* Results for all tabs */}
            <TabsContent value="spotify" className="mt-4">
              <TrackList
                tracks={results}
                isLoading={isLoading}
                isAdding={isAdding}
                onAddTrack={handleAddTrack}
                query={query}
                emptyMessage={
                  !isSpotifyConnected 
                    ? "Conecte sua conta Spotify nas configurações"
                    : query.length < 2 
                    ? "Digite para pesquisar no Spotify"
                    : "Nenhuma música encontrada"
                }
              />
            </TabsContent>

            <TabsContent value="youtube" className="mt-4">
              <TrackList
                tracks={results}
                isLoading={isLoading}
                isAdding={isAdding}
                onAddTrack={handleAddTrack}
                query={query}
                emptyMessage={
                  !isYouTubeConnected 
                    ? "Conecte sua conta YouTube Music nas configurações"
                    : query.length < 2 
                    ? "Digite para pesquisar no YouTube Music"
                    : "Nenhuma música encontrada"
                }
              />
            </TabsContent>

            <TabsContent value="demo" className="mt-4">
              <TrackList
                tracks={results}
                isLoading={false}
                isAdding={isAdding}
                onAddTrack={handleAddTrack}
                query={query}
                emptyMessage="Nenhuma música demo encontrada"
              />
              <p className="text-xs text-muted-foreground text-center mt-3">
                Músicas de exemplo para teste
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Extracted TrackList component for reuse
interface TrackListProps {
  tracks: JamTrack[];
  isLoading: boolean;
  isAdding: string | null;
  onAddTrack: (track: JamTrack) => void;
  query: string;
  emptyMessage: string;
}

function TrackList({ tracks, isLoading, isAdding, onAddTrack, query, emptyMessage }: TrackListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {tracks.map((track) => (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
        >
          {track.albumArt ? (
            <img
              src={track.albumArt}
              alt={track.trackName}
              className="w-10 h-10 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center" aria-hidden="true">
              <Music className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate text-sm">
              {track.trackName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {track.artistName}
            </p>
          </div>

          <Badge variant="outline" className="text-[10px] px-1.5">
            {track.provider === 'spotify' ? '🎵' : track.provider === 'youtube' ? '📺' : '🎯'}
          </Badge>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddTrack(track)}
            disabled={isAdding === track.id}
            className="gap-1"
          >
            {isAdding === track.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus aria-hidden="true" className="w-4 h-4" />
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
