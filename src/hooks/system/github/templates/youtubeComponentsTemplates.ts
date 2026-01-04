// YouTube Music Components Templates - 6 arquivos

export function generateYouTubeComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/youtube/YouTubeMusicPlaylistCard.tsx':
      return `import { Play, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeMusicPlaylistCardProps {
  id?: string;
  name: string;
  imageUrl?: string;
  trackCount?: number;
  onClick?: () => void;
  className?: string;
}

export function YouTubeMusicPlaylistCard({
  name,
  imageUrl,
  trackCount,
  onClick,
  className,
}: YouTubeMusicPlaylistCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative bg-card hover:bg-muted/50 rounded-lg p-4 text-left transition-all',
        'focus:outline-none focus:ring-2 focus:ring-red-500',
        className
      )}
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Music2 className="h-12 w-12 text-white/80" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="bg-red-600 text-white rounded-full p-3 shadow-lg">
            <Play className="h-5 w-5" fill="currentColor" />
          </div>
        </div>
      </div>

      <h4 className="font-semibold truncate">{name}</h4>
      {trackCount !== undefined && (
        <p className="text-sm text-muted-foreground">{trackCount} videos</p>
      )}
    </button>
  );
}
`;

    case 'src/components/youtube/YouTubeMusicAlbumCard.tsx':
      return `import { Play, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeMusicAlbumCardProps {
  id?: string;
  name: string;
  artist: string;
  imageUrl?: string;
  year?: number;
  onClick?: () => void;
  className?: string;
}

export function YouTubeMusicAlbumCard({
  name,
  artist,
  imageUrl,
  year,
  onClick,
  className,
}: YouTubeMusicAlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative bg-card hover:bg-muted/50 rounded-lg p-4 text-left transition-all',
        'focus:outline-none focus:ring-2 focus:ring-red-500',
        className
      )}
    >
      <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Disc className="h-12 w-12 text-white/60" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <div className="bg-red-600 text-white rounded-full p-3 shadow-lg">
            <Play className="h-5 w-5" fill="currentColor" />
          </div>
        </div>
      </div>

      <h4 className="font-semibold truncate">{name}</h4>
      <p className="text-sm text-muted-foreground truncate">
        {year && \`\${year} • \`}{artist}
      </p>
    </button>
  );
}
`;

    case 'src/components/youtube/YouTubeMusicTrackItem.tsx':
      return `import { Play, Pause, MoreVertical, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface YouTubeMusicTrackItemProps {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnailUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
}

export function YouTubeMusicTrackItem({
  title,
  artist,
  duration,
  thumbnailUrl,
  isPlaying,
  onPlay,
}: YouTubeMusicTrackItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors',
        isPlaying && 'bg-red-500/10'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Music2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', isPlaying && 'text-red-500')}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>

      {/* Duration */}
      <span className="text-sm text-muted-foreground">{duration}</span>

      {/* Actions */}
      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}
`;

    case 'src/components/youtube/YouTubeMusicUserBadge.tsx':
      return `import { Youtube } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface YouTubeMusicUserBadgeProps {
  displayName: string;
  imageUrl?: string;
  isPremium?: boolean;
  isConnected?: boolean;
}

export function YouTubeMusicUserBadge({
  displayName,
  imageUrl,
  isPremium,
  isConnected = true,
}: YouTubeMusicUserBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
      <Avatar className="h-10 w-10">
        <AvatarImage src={imageUrl} alt={displayName} />
        <AvatarFallback className="bg-red-500">
          <Youtube className="h-5 w-5 text-white" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{displayName}</p>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Badge variant="outline" className="text-xs text-red-500 border-red-500">
              Connected
            </Badge>
          )}
          {isPremium && (
            <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-700">
              Premium
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
`;

    case 'src/components/youtube/AddToPlaylistModal.tsx':
      return `import { useState } from 'react';
import { Plus, Search, Music2 } from 'lucide-react';
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
  thumbnailUrl?: string;
  videoCount: number;
}

interface YouTubeAddToPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle: string;
  playlists: Playlist[];
  onSelect: (playlistId: string) => void;
  onCreateNew: () => void;
}

export function YouTubeAddToPlaylistModal({
  open,
  onOpenChange,
  videoTitle,
  playlists,
  onSelect,
  onCreateNew,
}: YouTubeAddToPlaylistModalProps) {
  const [search, setSearch] = useState('');

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-500">Save to playlist</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">"{videoTitle}"</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search playlists"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            className="w-full justify-start border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create new playlist
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
                    {playlist.thumbnailUrl ? (
                      <img src={playlist.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <Music2 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.videoCount} videos</p>
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

    case 'src/components/youtube/index.ts':
      return `export { YouTubeMusicPlaylistCard } from './YouTubeMusicPlaylistCard';
export { YouTubeMusicAlbumCard } from './YouTubeMusicAlbumCard';
export { YouTubeMusicTrackItem } from './YouTubeMusicTrackItem';
export { YouTubeMusicUserBadge } from './YouTubeMusicUserBadge';
export { YouTubeAddToPlaylistModal as AddToPlaylistModal } from './AddToPlaylistModal';
`;

    default:
      return null;
  }
}
