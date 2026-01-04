// Spotify Components Templates - 9 arquivos

export function generateSpotifyComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/spotify/SpotifyPanel.tsx':
      return `import { useState } from 'react';
import { Music, Search, Heart, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackItem } from './TrackItem';
import { PlaylistCard } from './PlaylistCard';
import { ArtistCard } from './ArtistCard';
import { AlbumCard } from './AlbumCard';

interface SpotifyPanelProps {
  onTrackSelect?: (trackId: string) => void;
}

export function SpotifyPanel({ onTrackSelect }: SpotifyPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="browse">
            <Music className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">Featured Playlists</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <PlaylistCard name="Today's Top Hits" imageUrl="/placeholder.svg" trackCount={50} />
                <PlaylistCard name="Discover Weekly" imageUrl="/placeholder.svg" trackCount={30} />
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 overflow-auto p-4">
          <p className="text-muted-foreground">Your favorite tracks will appear here.</p>
        </TabsContent>

        <TabsContent value="recent" className="flex-1 overflow-auto p-4">
          <p className="text-muted-foreground">Recently played tracks will appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;

    case 'src/components/spotify/TrackItem.tsx':
      return `import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrackItemProps {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: number;
  imageUrl?: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
}

export function TrackItem({
  id,
  name,
  artist,
  album,
  duration,
  imageUrl,
  isPlaying,
  isFavorite,
  onPlay,
  onFavorite,
}: TrackItemProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors',
        isPlaying && 'bg-primary/10'
      )}
    >
      {/* Album Art / Play Button */}
      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={album || name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onPlay}
          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', isPlaying && 'text-primary')}>
          {name}
        </p>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>

      {/* Duration */}
      <span className="text-sm text-muted-foreground hidden sm:block">
        {formatDuration(duration)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFavorite}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
`;

    case 'src/components/spotify/PlaylistCard.tsx':
      return `import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaylistCardProps {
  id?: string;
  name: string;
  imageUrl?: string;
  description?: string;
  trackCount?: number;
  onClick?: () => void;
  className?: string;
}

export function PlaylistCard({
  name,
  imageUrl,
  description,
  trackCount,
  onClick,
  className,
}: PlaylistCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative bg-card hover:bg-muted/50 rounded-lg p-4 text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={name}
          className="w-full h-full object-cover"
        />
        {/* Play Button Overlay */}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-105 transition-transform">
            <Play className="h-5 w-5" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Info */}
      <h4 className="font-semibold truncate">{name}</h4>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
      )}
      {trackCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-2">{trackCount} tracks</p>
      )}
    </button>
  );
}
`;

    case 'src/components/spotify/AlbumCard.tsx':
      return `import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  id?: string;
  name: string;
  artist: string;
  imageUrl?: string;
  releaseYear?: number;
  onClick?: () => void;
  className?: string;
}

export function AlbumCard({
  name,
  artist,
  imageUrl,
  releaseYear,
  onClick,
  className,
}: AlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative bg-card hover:bg-muted/50 rounded-lg p-4 text-left transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      {/* Album Cover */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
            <Play className="h-5 w-5" fill="currentColor" />
          </div>
        </div>
      </div>

      <h4 className="font-semibold truncate">{name}</h4>
      <p className="text-sm text-muted-foreground truncate">
        {releaseYear && \`\${releaseYear} • \`}{artist}
      </p>
    </button>
  );
}
`;

    case 'src/components/spotify/ArtistCard.tsx':
      return `import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtistCardProps {
  id?: string;
  name: string;
  imageUrl?: string;
  followers?: number;
  onClick?: () => void;
  className?: string;
}

export function ArtistCard({
  name,
  imageUrl,
  followers,
  onClick,
  className,
}: ArtistCardProps) {
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return \`\${(count / 1000000).toFixed(1)}M\`;
    if (count >= 1000) return \`\${(count / 1000).toFixed(1)}K\`;
    return count.toString();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative bg-card hover:bg-muted/50 rounded-lg p-4 text-center transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      {/* Artist Image */}
      <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 shadow-lg">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="h-8 w-8 text-white" fill="white" />
        </div>
      </div>

      <h4 className="font-semibold truncate">{name}</h4>
      {followers !== undefined && (
        <p className="text-sm text-muted-foreground">
          {formatFollowers(followers)} followers
        </p>
      )}
    </button>
  );
}
`;

    case 'src/components/spotify/SpotifyUserBadge.tsx':
      return `import { Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SpotifyUserBadgeProps {
  displayName: string;
  imageUrl?: string;
  isPremium?: boolean;
  isConnected?: boolean;
}

export function SpotifyUserBadge({
  displayName,
  imageUrl,
  isPremium,
  isConnected = true,
}: SpotifyUserBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
      <Avatar className="h-10 w-10">
        <AvatarImage src={imageUrl} alt={displayName} />
        <AvatarFallback>
          <Music className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{displayName}</p>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Badge variant="outline" className="text-xs text-green-500 border-green-500">
              Connected
            </Badge>
          )}
          {isPremium && (
            <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600">
              Premium
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
`;

    case 'src/components/spotify/AddToPlaylistModal.tsx':
      return `import { useState } from 'react';
import { Plus, Search, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Playlist {
  id: string;
  name: string;
  imageUrl?: string;
  trackCount: number;
}

interface AddToPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackName: string;
  playlists: Playlist[];
  onSelect: (playlistId: string) => void;
  onCreateNew: () => void;
}

export function AddToPlaylistModal({
  open,
  onOpenChange,
  trackName,
  playlists,
  onSelect,
  onCreateNew,
}: AddToPlaylistModalProps) {
  const [search, setSearch] = useState('');

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">"{trackName}"</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find a playlist"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" className="w-full justify-start" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Playlist
          </Button>

          <ScrollArea className="h-64">
            <div className="space-y-1">
              {filteredPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => onSelect(playlist.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    {playlist.imageUrl ? (
                      <img src={playlist.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <Music className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.trackCount} tracks</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/spotify/CreatePlaylistModal.tsx':
      return `import { useState } from 'react';
import { Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; description: string; isPublic: boolean }) => void;
  isLoading?: boolean;
}

export function CreatePlaylistModal({
  open,
  onOpenChange,
  onCreate,
  isLoading,
}: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({ name: name.trim(), description: description.trim(), isPublic });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Create Playlist
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="public" className="cursor-pointer">Make public</Label>
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/spotify/index.ts':
      return `export { SpotifyPanel } from './SpotifyPanel';
export { TrackItem } from './TrackItem';
export { PlaylistCard } from './PlaylistCard';
export { AlbumCard } from './AlbumCard';
export { ArtistCard } from './ArtistCard';
export { SpotifyUserBadge } from './SpotifyUserBadge';
export { AddToPlaylistModal } from './AddToPlaylistModal';
export { CreatePlaylistModal } from './CreatePlaylistModal';
`;

    default:
      return null;
  }
}
