// Components Index-Page templates (5 files)

export function generateComponentsIndexPageContent(path: string): string | null {
  switch (path) {
    case 'src/components/index-page/index.ts':
      return `// Index Page components barrel export
export { IndexHeader } from './IndexHeader';
export { IndexPanels } from './IndexPanels';
export { IndexPlayerSection } from './IndexPlayerSection';
export { IndexStates } from './IndexStates';
`;

    case 'src/components/index-page/IndexHeader.tsx':
      return `import React from 'react';
import { Music2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IndexHeaderProps {
  title?: string;
  onSettingsClick?: () => void;
}

export function IndexHeader({ title = 'TSiJUKEBOX', onSettingsClick }: IndexHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center gap-3">
        <Music2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {onSettingsClick && (
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
`;

    case 'src/components/index-page/IndexPanels.tsx':
      return `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Panel {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface IndexPanelsProps {
  panels: Panel[];
  columns?: 1 | 2 | 3;
}

export function IndexPanels({ panels, columns = 2 }: IndexPanelsProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={\`grid \${gridCols[columns]} gap-4 p-4\`}>
      {panels.map((panel) => (
        <Card key={panel.id}>
          <CardHeader>
            <CardTitle>{panel.title}</CardTitle>
          </CardHeader>
          <CardContent>{panel.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}
`;

    case 'src/components/index-page/IndexPlayerSection.tsx':
      return `import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface IndexPlayerSectionProps {
  isPlaying?: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    albumArt?: string;
  };
  progress?: number;
  volume?: number;
  onPlayPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onVolumeChange?: (value: number) => void;
}

export function IndexPlayerSection({
  isPlaying = false,
  currentTrack,
  progress = 0,
  volume = 80,
  onPlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
}: IndexPlayerSectionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
      <div className="flex items-center gap-4 max-w-screen-xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {currentTrack?.albumArt && (
            <img src={currentTrack.albumArt} alt="" className="w-12 h-12 rounded" />
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{currentTrack?.title || 'No track'}</p>
            <p className="text-sm text-muted-foreground truncate">
              {currentTrack?.artist || 'Unknown artist'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPrevious}>
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={onPlayPause}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume */}
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
  );
}
`;

    case 'src/components/index-page/IndexStates.tsx':
      return `import React from 'react';
import { Loader2, AlertCircle, Music, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IndexStatesProps {
  state: 'loading' | 'error' | 'empty' | 'success';
  error?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function IndexStates({ state, error, onRetry, children }: IndexStatesProps) {
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error || 'Ocorreu um erro'}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Inbox className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhum item encontrado</p>
      </div>
    );
  }

  return <>{children}</>;
}
`;

    default:
      return null;
  }
}
