import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LyricsLine, LyricsWord } from '@/lib/lrcParser';
import { generateWordTimestamps } from '@/lib/lrcParser';

interface KaraokeLyricsProps {
  lines: LyricsLine[];
  position: number; // Current playback position in seconds
  className?: string;
}

export function KaraokeLyrics({ lines, position, className }: KaraokeLyricsProps) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Find current line index
  const currentLineIndex = lines.findIndex((line, index) => {
    const nextLine = lines[index + 1];
    return position >= line.time && (!nextLine || position < nextLine.time);
  });
  
  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex]) {
      lineRefs.current[currentLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);
  
  // Get words for a line (generate if not available)
  const getLineWords = (line: LyricsLine, index: number): LyricsWord[] => {
    if (line.words && line.words.length > 0) {
      return line.words;
    }
    const nextLine = lines[index + 1];
    return generateWordTimestamps(line, nextLine?.time);
  };
  
  // Determine word state based on position
  const getWordState = (word: LyricsWord): 'past' | 'current' | 'future' => {
    if (position >= word.endTime) return 'past';
    if (position >= word.startTime) return 'current';
    return 'future';
  };
  
  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-6 space-y-6">
        {lines.map((line, lineIndex) => {
          const words = getLineWords(line, lineIndex);
          const isCurrentLine = lineIndex === currentLineIndex;
          const isPastLine = lineIndex < currentLineIndex;
          
          return (
            <div
              key={lineIndex}
              ref={(el) => { lineRefs.current[lineIndex] = el; }}
              className={cn(
                'text-center transition-all duration-300',
                isCurrentLine && 'scale-105',
                isPastLine && 'opacity-40'
              )}
            >
              {line.text ? (
                <p className="leading-relaxed">
                  {words.map((word, wordIndex) => {
                    const state = isCurrentLine ? getWordState(word) : (isPastLine ? 'past' : 'future');
                    
                    return (
                      <span
                        key={wordIndex}
                        className={cn(
                          'inline-block mx-0.5 transition-all duration-150',
                          state === 'past' && 'text-cyan-400',
                          state === 'current' && 'text-kiosk-text font-bold scale-110 drop-shadow-[0_0_8px_hsl(var(--kiosk-primary))]',
                          state === 'future' && 'text-kiosk-text/50'
                        )}
                        style={{
                          textShadow: state === 'current' 
                            ? '0 0 15px hsl(195 100% 50% / 0.6)' 
                            : undefined,
                        }}
                      >
                        {word.word}
                      </span>
                    );
                  })}
                </p>
              ) : (
                <p className="text-kiosk-text/30">♪</p>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
