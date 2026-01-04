// Root Components Templates - 3 arquivos

export function generateRootComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/GlobalSearchModal.tsx':
      return `import { useState, useEffect, useCallback } from 'react';
import { Search, Music, User, Settings, FileText, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'page' | 'track' | 'setting' | 'action';
  title: string;
  description?: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
}

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions: SearchResult[] = [
  { id: 'home', type: 'page', title: 'Home', description: 'Go to home page', icon: <Music className="h-4 w-4" />, path: '/' },
  { id: 'settings', type: 'page', title: 'Settings', description: 'App settings', icon: <Settings className="h-4 w-4" />, path: '/settings' },
  { id: 'admin', type: 'page', title: 'Admin Dashboard', description: 'Administration', icon: <User className="h-4 w-4" />, path: '/admin' },
  { id: 'github', type: 'page', title: 'GitHub Dashboard', description: 'Repository sync', icon: <FileText className="h-4 w-4" />, path: '/github-dashboard' },
];

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>(quickActions);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(quickActions);
    } else {
      const filtered = quickActions.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (result.path) {
      navigate(result.path);
    }
    if (result.action) {
      result.action();
    }
    onOpenChange(false);
    setQuery('');
  }, [navigate, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, settings, actions..."
            className="border-0 focus-visible:ring-0 text-lg"
            autoFocus
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <ScrollArea className="max-h-80">
          <div className="p-2">
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No results found</p>
            ) : (
              results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                    index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                  )}
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.description && (
                      <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/NavLink.tsx':
      return `import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

export function NavLink({
  to,
  icon: Icon,
  children,
  className,
  activeClassName = 'bg-primary text-primary-foreground',
  exact = false,
}: NavLinkProps) {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
        isActive ? activeClassName : 'text-muted-foreground',
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span className="truncate">{children}</span>
    </Link>
  );
}
`;

    case 'src/components/kiosk/KioskRemoteControl.tsx':
      return `import { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Power,
  RefreshCw,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KioskRemoteControlProps {
  kioskId: string;
  kioskName: string;
  status: 'online' | 'offline' | 'idle';
  isPlaying?: boolean;
  volume?: number;
  currentTrack?: {
    name: string;
    artist: string;
  };
  onPlay?: () => void;
  onPause?: () => void;
  onSkip?: () => void;
  onPrevious?: () => void;
  onVolumeChange?: (volume: number) => void;
  onRestart?: () => void;
  onShutdown?: () => void;
}

export function KioskRemoteControl({
  kioskId,
  kioskName,
  status,
  isPlaying,
  volume = 50,
  currentTrack,
  onPlay,
  onPause,
  onSkip,
  onPrevious,
  onVolumeChange,
  onRestart,
  onShutdown,
}: KioskRemoteControlProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange?.(previousVolume);
    } else {
      setPreviousVolume(volume);
      onVolumeChange?.(0);
    }
    setIsMuted(!isMuted);
  };

  const statusColor = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    idle: 'bg-yellow-500',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {kioskName}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1.5">
            <div className={\`w-2 h-2 rounded-full \${statusColor[status]}\`} />
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Track */}
        {currentTrack && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium truncate">{currentTrack.name}</p>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPrevious} disabled={status === 'offline'}>
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12"
            onClick={isPlaying ? onPause : onPlay}
            disabled={status === 'offline'}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onSkip} disabled={status === 'offline'}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={([v]) => {
              setIsMuted(false);
              onVolumeChange?.(v);
            }}
            disabled={status === 'offline'}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">
            {isMuted ? 0 : volume}%
          </span>
        </div>

        {/* System Controls */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onRestart}
            disabled={status === 'offline'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onShutdown}
            disabled={status === 'offline'}
          >
            <Power className="h-4 w-4 mr-2" />
            Shutdown
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
`;

    default:
      return null;
  }
}
