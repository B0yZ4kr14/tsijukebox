// Jam Session Components Templates - 10 arquivos

export function generateJamComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/jam/JamHeader.tsx':
      return `import { Users, Share2, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JamHeaderProps {
  sessionName: string;
  sessionCode: string;
  participantCount: number;
  isHost?: boolean;
  onShare?: () => void;
  onSettings?: () => void;
  onLeave?: () => void;
}

export function JamHeader({
  sessionName,
  sessionCode,
  participantCount,
  isHost,
  onShare,
  onSettings,
  onLeave,
}: JamHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-border">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {sessionName}
            {isHost && (
              <Badge variant="secondary" className="text-xs">Host</Badge>
            )}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <code className="px-2 py-0.5 bg-muted rounded font-mono">{sessionCode}</code>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {participantCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Invite
        </Button>
        {isHost && (
          <Button variant="ghost" size="icon" onClick={onSettings}>
            <Settings className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onLeave} className="text-destructive">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
`;

    case 'src/components/jam/JamQueue.tsx':
      return `import { GripVertical, Play, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface QueueItem {
  id: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  addedBy: string;
  votes: number;
}

interface JamQueueProps {
  items: QueueItem[];
  currentTrackId?: string;
  isHost?: boolean;
  onPlayNow?: (id: string) => void;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
}

export function JamQueue({
  items,
  currentTrackId,
  isHost,
  onPlayNow,
  onRemove,
  onVote,
}: JamQueueProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Music className="h-12 w-12 mb-4 opacity-50" />
        <p>Queue is empty</p>
        <p className="text-sm">Add tracks to get the party started!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'group flex items-center gap-3 p-3 rounded-lg bg-card border border-border',
              currentTrackId === item.id && 'border-primary bg-primary/5'
            )}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

            <span className="w-6 text-center text-sm text-muted-foreground">
              {index + 1}
            </span>

            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
              {item.albumArt ? (
                <img src={item.albumArt} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Music className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.trackName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {item.artistName} • Added by {item.addedBy}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote?.(item.id)}
              className="text-muted-foreground hover:text-primary"
            >
              👍 {item.votes}
            </Button>

            {isHost && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onPlayNow?.(item.id)}>
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onRemove?.(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
`;

    case 'src/components/jam/JamParticipantsList.tsx':
      return `import { Crown, Mic, MicOff, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  nickname: string;
  avatarColor: string;
  isHost: boolean;
  isActive: boolean;
}

interface JamParticipantsListProps {
  participants: Participant[];
  currentUserId?: string;
  isHost?: boolean;
  onKick?: (id: string) => void;
  onMakeHost?: (id: string) => void;
}

export function JamParticipantsList({
  participants,
  currentUserId,
  isHost,
  onKick,
  onMakeHost,
}: JamParticipantsListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={cn(
              'group flex items-center gap-3 p-2 rounded-lg',
              participant.id === currentUserId && 'bg-muted/50'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback style={{ backgroundColor: participant.avatarColor }}>
                {participant.nickname[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate flex items-center gap-2">
                {participant.nickname}
                {participant.id === currentUserId && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
              </p>
            </div>

            {participant.isHost && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}

            <div className={cn(
              'w-2 h-2 rounded-full',
              participant.isActive ? 'bg-green-500' : 'bg-gray-400'
            )} />

            {isHost && participant.id !== currentUserId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
`;

    case 'src/components/jam/JamReactions.tsx':
      return `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  id: string;
  emoji: string;
  nickname: string;
}

interface JamReactionsProps {
  reactions: Reaction[];
  onReact?: (emoji: string) => void;
}

const EMOJIS = ['🔥', '❤️', '🎉', '👏', '🙌', '💯', '🎵', '🎶'];

export function JamReactions({ reactions, onReact }: JamReactionsProps) {
  const [floatingReactions, setFloatingReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (reactions.length > 0) {
      const latest = reactions[reactions.length - 1];
      setFloatingReactions((prev) => [...prev, latest]);
      
      // Remove after animation
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== latest.id));
      }, 2000);
    }
  }, [reactions]);

  return (
    <div className="relative">
      {/* Floating Reactions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {floatingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 1, y: 0, x: Math.random() * 100 }}
              animate={{ opacity: 0, y: -100 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute bottom-0 text-2xl"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction Bar */}
      <div className="flex items-center justify-center gap-2 p-2 bg-card/80 backdrop-blur rounded-full border border-border">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact?.(emoji)}
            className="text-xl hover:scale-125 transition-transform p-1"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
`;

    case 'src/components/jam/JamPlayer.tsx':
      return `import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface JamPlayerProps {
  trackName: string;
  artistName: string;
  albumArt?: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isHost?: boolean;
  onPlayPause?: () => void;
  onSkip?: () => void;
  onSeek?: (value: number) => void;
  onVolumeChange?: (value: number) => void;
}

export function JamPlayer({
  trackName,
  artistName,
  albumArt,
  isPlaying,
  progress,
  duration,
  volume,
  isHost,
  onPlayPause,
  onSkip,
  onSeek,
  onVolumeChange,
}: JamPlayerProps) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
      <div className="flex items-center gap-6">
        {/* Album Art */}
        <div className="w-20 h-20 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
          <img
            src={albumArt || '/placeholder.svg'}
            alt={trackName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Track Info & Controls */}
        <div className="flex-1">
          <div className="mb-2">
            <h3 className="font-bold text-lg truncate">{trackName}</h3>
            <p className="text-sm text-muted-foreground truncate">{artistName}</p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration}
              step={1000}
              onValueChange={([v]) => onSeek?.(v)}
              disabled={!isHost}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isHost && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={onPlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onSkip}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 w-32">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([v]) => onVolumeChange?.(v)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

    case 'src/components/jam/CreateJamModal.tsx':
      return `import { useState } from 'react';
import { Music, Lock, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CreateJamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; privacy: 'public' | 'private'; accessCode?: string }) => void;
  isLoading?: boolean;
}

export function CreateJamModal({
  open,
  onOpenChange,
  onCreate,
  isLoading,
}: CreateJamModalProps) {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: name.trim() || 'My Jam Session',
      privacy,
      accessCode: privacy === 'private' ? accessCode : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Create Jam Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              placeholder="Friday Night Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Privacy</Label>
            <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as 'public' | 'private')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4" />
                  Public - Anyone with the code can join
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  Private - Requires access code
                </Label>
              </div>
            </RadioGroup>
          </div>

          {privacy === 'private' && (
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                placeholder="Enter a secret code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/jam/JamInviteModal.tsx':
      return `import { Copy, Check, QrCode, Share2 } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface JamInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionCode: string;
  sessionUrl: string;
}

export function JamInviteModal({
  open,
  onOpenChange,
  sessionCode,
  sessionUrl,
}: JamInviteModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSession = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join my Jam Session!',
        text: \`Join my music session with code: \${sessionCode}\`,
        url: sessionUrl,
      });
    } else {
      copyToClipboard(sessionUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Session Code</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-4xl font-mono font-bold tracking-wider px-4 py-2 bg-muted rounded-lg">
                {sessionCode}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(sessionCode)}
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Or share link</p>
            <div className="flex gap-2">
              <Input value={sessionUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={() => copyToClipboard(sessionUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <Button className="w-full" onClick={shareSession}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/jam/JamNicknameModal.tsx':
      return `import { useState } from 'react';
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface JamNicknameModalProps {
  open: boolean;
  onSubmit: (nickname: string) => void;
  isLoading?: boolean;
}

export function JamNicknameModal({
  open,
  onSubmit,
  isLoading,
}: JamNicknameModalProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Enter Your Nickname
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              placeholder="DJ Awesome"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This is how other participants will see you
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={!nickname.trim() || isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/jam/JamAddTrackModal.tsx':
      return `import { useState } from 'react';
import { Search, Music, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Track {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  duration: number;
}

interface JamAddTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => Promise<Track[]>;
  onAddTrack: (trackId: string) => void;
}

export function JamAddTrackModal({
  open,
  onOpenChange,
  onSearch,
  onAddTrack,
}: JamAddTrackModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const tracks = await onSearch(query);
      setResults(tracks);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Track to Queue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a song..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <ScrollArea className="h-80">
            <div className="space-y-2">
              {results.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                >
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    {track.albumArt ? (
                      <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <Button size="sm" onClick={() => onAddTrack(track.id)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}

              {results.length === 0 && query && !isSearching && (
                <p className="text-center text-muted-foreground py-8">
                  No results found. Try a different search.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
`;

    case 'src/components/jam/JamAISuggestions.tsx':
      return `import { Sparkles, Plus, RefreshCw, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SuggestedTrack {
  id: string;
  name: string;
  artist: string;
  reason: string;
}

interface JamAISuggestionsProps {
  suggestions: SuggestedTrack[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAdd?: (trackId: string) => void;
}

export function JamAISuggestions({
  suggestions,
  isLoading,
  onRefresh,
  onAdd,
}: JamAISuggestionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Suggestions
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add more tracks to get personalized suggestions
          </p>
        ) : (
          suggestions.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{track.name}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                <p className="text-xs text-primary/70 truncate">{track.reason}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onAdd?.(track.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
`;

    default:
      return null;
  }
}
