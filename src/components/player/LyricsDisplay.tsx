import { useState, useEffect } from 'react';
import { Music, Mic2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';

interface LyricsLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  trackId?: string;
  trackName?: string;
  artistName?: string;
  position?: number;
  isPlaying?: boolean;
}

export function LyricsDisplay({ 
  trackId, 
  trackName, 
  artistName, 
  position = 0,
  isPlaying 
}: LyricsDisplayProps) {
  const { t } = useTranslation();
  const [lyrics, setLyrics] = useState<LyricsLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Simulated lyrics fetch - replace with real API
  useEffect(() => {
    if (!trackId || !trackName) {
      setLyrics([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call - in production, integrate with lyrics API
    const timer = setTimeout(() => {
      // Demo lyrics - replace with real API integration
      const demoLyrics: LyricsLine[] = [
        { time: 0, text: '♪ Instrumental ♪' },
        { time: 5, text: `Now playing: ${trackName}` },
        { time: 10, text: `By: ${artistName || 'Unknown Artist'}` },
        { time: 15, text: '' },
        { time: 20, text: 'Lyrics not available for this track.' },
        { time: 25, text: '' },
        { time: 30, text: 'To enable lyrics:' },
        { time: 35, text: '• Connect to a lyrics provider' },
        { time: 40, text: '• Or enable Spotify lyrics sync' },
        { time: 45, text: '' },
        { time: 50, text: '♪ ♫ ♪ ♫ ♪' },
      ];
      
      setLyrics(demoLyrics);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [trackId, trackName, artistName]);

  // Update current line based on position
  useEffect(() => {
    if (lyrics.length === 0) return;

    const currentIndex = lyrics.findIndex((line, index) => {
      const nextLine = lyrics[index + 1];
      return position >= line.time && (!nextLine || position < nextLine.time);
    });

    if (currentIndex !== -1 && currentIndex !== currentLineIndex) {
      setCurrentLineIndex(currentIndex);
    }
  }, [position, lyrics, currentLineIndex]);

  if (!trackId || !trackName) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-kiosk-text/60 p-8">
        <Music className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-center">Selecione uma música para ver as letras</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
        <p className="text-kiosk-text/70">Carregando letras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-kiosk-text/60 p-8">
        <AlertCircle className="w-12 h-12 mb-4 text-red-400/60" />
        <p className="text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2 text-label-yellow">
          <Mic2 className="w-4 h-4" />
          <span className="text-sm font-semibold">Letras</span>
        </div>
        <p className="text-sm text-kiosk-text/90 mt-1 truncate">{trackName}</p>
        <p className="text-xs text-kiosk-text/60 truncate">{artistName}</p>
      </div>

      {/* Lyrics Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {lyrics.map((line, index) => (
            <p
              key={index}
              className={`text-center transition-all duration-300 ${
                index === currentLineIndex
                  ? 'text-xl font-bold text-kiosk-text scale-105'
                  : index < currentLineIndex
                  ? 'text-base text-kiosk-text/40'
                  : 'text-base text-kiosk-text/60'
              }`}
              style={{
                textShadow: index === currentLineIndex 
                  ? '0 0 20px hsl(195 100% 50% / 0.5)' 
                  : 'none'
              }}
            >
              {line.text || '\u00A0'}
            </p>
          ))}
        </div>
      </ScrollArea>

      {/* Status indicator */}
      {isPlaying && (
        <div className="p-3 border-t border-cyan-500/10 flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
          <span className="text-xs text-kiosk-text/60">Sincronizado</span>
        </div>
      )}
    </div>
  );
}
