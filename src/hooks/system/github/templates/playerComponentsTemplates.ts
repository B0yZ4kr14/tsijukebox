// Player Components Templates - Music player UI components
// Covers 10 core player components

export function generatePlayerComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/player/NowPlaying.tsx':
      return `import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NowPlayingProps {
  track: {
    id: string;
    name: string;
    artist: string;
    album?: string;
    albumArt?: string;
    duration: number;
  } | null;
  isPlaying: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  className?: string;
}

export function NowPlaying({
  track,
  isPlaying,
  isFavorite = false,
  onFavoriteToggle,
  onShare,
  className
}: NowPlayingProps) {
  if (!track) {
    return (
      <div className={cn("flex items-center gap-4 p-4", className)}>
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
          <Music2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">No track playing</p>
          <p className="text-xs text-muted-foreground">Select a song to play</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("flex items-center gap-4 p-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="relative">
        <motion.img
          src={track.albumArt || '/placeholder.svg'}
          alt={track.album || track.name}
          className="w-16 h-16 rounded-lg object-cover shadow-lg"
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
        />
        {isPlaying && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.h3
            key={track.id}
            className="font-semibold text-foreground truncate"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {track.name}
          </motion.h3>
        </AnimatePresence>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        {track.album && (
          <p className="text-xs text-muted-foreground truncate">{track.album}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {onFavoriteToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavoriteToggle}
            className={cn(isFavorite && "text-red-500")}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </Button>
        )}
        {onShare && (
          <Button variant="ghost" size="icon" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default NowPlaying;
`;

    case 'src/components/player/PlayerControls.tsx':
      return `import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  disabled?: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  className?: string;
}

export function PlayerControls({
  isPlaying,
  isShuffled,
  repeatMode,
  disabled = false,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffleToggle,
  onRepeatToggle,
  className
}: PlayerControlsProps) {
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onShuffleToggle}
        disabled={disabled}
        className={cn(isShuffled && "text-primary")}
      >
        <Shuffle className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={disabled}
      >
        <SkipBack className="w-5 h-5" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        disabled={disabled}
        className="w-12 h-12 rounded-full"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={disabled}
      >
        <SkipForward className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onRepeatToggle}
        disabled={disabled}
        className={cn(repeatMode !== 'off' && "text-primary")}
      >
        <RepeatIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default PlayerControls;
`;

    case 'src/components/player/PlaybackControls.tsx':
      return `import React from 'react';
import { PlayerControls } from './PlayerControls';
import { VolumeSlider } from './VolumeSlider';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  disabled?: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export function PlaybackControls({
  isPlaying,
  isShuffled,
  repeatMode,
  currentTime,
  duration,
  volume,
  isMuted,
  disabled = false,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffleToggle,
  onRepeatToggle,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  className
}: PlaybackControlsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        disabled={disabled}
      />
      
      <div className="flex items-center justify-between">
        <div className="w-32" />
        
        <PlayerControls
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          disabled={disabled}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          onShuffleToggle={onShuffleToggle}
          onRepeatToggle={onRepeatToggle}
        />
        
        <VolumeSlider
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
          className="w-32"
        />
      </div>
    </div>
  );
}

export default PlaybackControls;
`;

    case 'src/components/player/VolumeSlider.tsx':
      return `import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VolumeSliderProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export function VolumeSlider({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className
}: VolumeSliderProps) {
  const VolumeIcon = isMuted || volume === 0
    ? VolumeX
    : volume < 0.5
    ? Volume1
    : Volume2;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        className="shrink-0"
      >
        <VolumeIcon className="w-4 h-4" />
      </Button>
      
      <Slider
        value={[isMuted ? 0 : volume * 100]}
        onValueChange={([value]) => onVolumeChange(value / 100)}
        max={100}
        step={1}
        className="flex-1"
      />
    </div>
  );
}

export default VolumeSlider;
`;

    case 'src/components/player/ProgressBar.tsx':
      return `import React, { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  disabled = false,
  className
}: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const handleValueChange = useCallback(([value]: number[]) => {
    setIsDragging(true);
    setDragValue(value);
  }, []);

  const handleValueCommit = useCallback(([value]: number[]) => {
    setIsDragging(false);
    onSeek((value / 100) * duration);
  }, [duration, onSeek]);

  const progress = duration > 0
    ? (isDragging ? dragValue : (currentTime / duration) * 100)
    : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
        {formatTime(currentTime)}
      </span>
      
      <Slider
        value={[progress]}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        max={100}
        step={0.1}
        disabled={disabled || duration === 0}
        className="flex-1"
      />
      
      <span className="text-xs text-muted-foreground tabular-nums w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export default ProgressBar;
`;

    case 'src/components/player/QueuePanel.tsx':
      return `import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, X, Play, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface QueueTrack {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  duration: number;
}

interface QueuePanelProps {
  queue: QueueTrack[];
  currentTrackId?: string;
  onPlayTrack: (trackId: string) => void;
  onRemoveTrack: (trackId: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  className?: string;
}

export function QueuePanel({
  queue,
  currentTrackId,
  onPlayTrack,
  onRemoveTrack,
  className
}: QueuePanelProps) {
  if (queue.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <Music2 className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Queue is empty</p>
        <p className="text-sm text-muted-foreground">Add songs to start playing</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[400px]", className)}>
      <div className="space-y-1 p-2">
        <AnimatePresence initial={false}>
          {queue.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 group",
                currentTrackId === track.id && "bg-accent"
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
              
              <span className="text-sm text-muted-foreground w-6 text-right">
                {index + 1}
              </span>
              
              <img
                src={track.albumArt || '/placeholder.svg'}
                alt={track.name}
                className="w-10 h-10 rounded object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{track.name}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPlayTrack(track.id)}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onRemoveTrack(track.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}

export default QueuePanel;
`;

    case 'src/components/player/LyricsDisplay.tsx':
      return `import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  className?: string;
}

export function LyricsDisplay({
  lyrics,
  currentTime,
  isPlaying,
  onSeek,
  className
}: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentLineIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  useEffect(() => {
    if (containerRef.current && currentLineIndex >= 0) {
      const currentElement = containerRef.current.children[currentLineIndex] as HTMLElement;
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLineIndex]);

  if (lyrics.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        <p>No lyrics available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto h-full py-32 px-4", className)}
    >
      <AnimatePresence>
        {lyrics.map((line, index) => {
          const isActive = index === currentLineIndex;
          const isPast = index < currentLineIndex;
          
          return (
            <motion.p
              key={\`\${line.time}-\${index}\`}
              className={cn(
                "text-center py-2 cursor-pointer transition-all duration-300",
                isActive && "text-2xl font-bold text-primary scale-105",
                isPast && "text-muted-foreground opacity-50",
                !isActive && !isPast && "text-muted-foreground"
              )}
              onClick={() => onSeek?.(line.time)}
              whileHover={{ scale: 1.02 }}
            >
              {line.text || '♪'}
            </motion.p>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default LyricsDisplay;
`;

    case 'src/components/player/AudioVisualizer.tsx':
      return `import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioData?: Uint8Array;
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({
  isPlaying,
  audioData,
  barCount = 32,
  className
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount;
      
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < barCount; i++) {
        const value = audioData
          ? audioData[Math.floor(i * (audioData.length / barCount))] / 255
          : isPlaying
          ? Math.random() * 0.5 + 0.1
          : 0.1;
        
        const barHeight = value * height;
        const x = i * barWidth;
        const y = height - barHeight;
        
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'hsl(var(--primary) / 0.3)');
        gradient.addColorStop(1, 'hsl(var(--primary))');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [isPlaying, audioData, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className={cn("w-full h-16", className)}
    />
  );
}

export default AudioVisualizer;
`;

    case 'src/components/player/LibraryPanel.tsx':
      return `import React, { useState } from 'react';
import { Search, Grid, List, Music2, Disc, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LibraryItem {
  id: string;
  name: string;
  type: 'track' | 'album' | 'artist' | 'playlist';
  image?: string;
  subtitle?: string;
}

interface LibraryPanelProps {
  items: LibraryItem[];
  onItemClick: (item: LibraryItem) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

export function LibraryPanel({
  items,
  onItemClick,
  onSearch,
  className
}: LibraryPanelProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getIcon = (type: LibraryItem['type']) => {
    switch (type) {
      case 'album': return Disc;
      case 'artist': return User;
      default: return Music2;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-1 ml-4">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className={cn(
          "p-4",
          viewMode === 'grid'
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {items.map((item) => {
            const Icon = getIcon(item.type);
            
            return viewMode === 'grid' ? (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium text-sm truncate">{item.name}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
              </div>
            ) : (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default LibraryPanel;
`;

    case 'src/components/player/index.ts':
      return `// Player Components barrel export
export { NowPlaying } from './NowPlaying';
export { PlayerControls } from './PlayerControls';
export { PlaybackControls } from './PlaybackControls';
export { VolumeSlider } from './VolumeSlider';
export { ProgressBar } from './ProgressBar';
export { QueuePanel } from './QueuePanel';
export { LyricsDisplay } from './LyricsDisplay';
export { AudioVisualizer } from './AudioVisualizer';
export { LibraryPanel } from './LibraryPanel';
`;

    default:
      return null;
  }
}
