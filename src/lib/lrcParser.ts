export interface LyricsWord {
  word: string;
  startTime: number;
  endTime: number;
}

export interface LyricsLine {
  time: number;
  text: string;
  words?: LyricsWord[];
}

// Parse standard LRC format: [mm:ss.xx]text
export function parseLRC(lrcText: string): LyricsLine[] {
  const lines: LyricsLine[] = [];
  const lrcLines = lrcText.split('\n');
  
  for (const line of lrcLines) {
    // Match [mm:ss.xx] or [mm:ss:xx] format
    const match = line.match(/\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = match[3].length === 2 
        ? parseInt(match[3]) * 10 
        : parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      
      lines.push({ time, text });
    }
  }
  
  return lines.sort((a, b) => a.time - b.time);
}

// Parse Enhanced LRC with word timestamps: [mm:ss.xx]<mm:ss.xx>word1 <mm:ss.xx>word2
export function parseEnhancedLRC(lrcText: string): LyricsLine[] {
  const lines: LyricsLine[] = [];
  const lrcLines = lrcText.split('\n');
  
  for (const line of lrcLines) {
    const lineMatch = line.match(/\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/);
    if (!lineMatch) continue;
    
    const minutes = parseInt(lineMatch[1]);
    const seconds = parseInt(lineMatch[2]);
    const milliseconds = lineMatch[3].length === 2 
      ? parseInt(lineMatch[3]) * 10 
      : parseInt(lineMatch[3]);
    const lineTime = minutes * 60 + seconds + milliseconds / 1000;
    const content = lineMatch[4];
    
    // Check for word-level timestamps
    const wordMatches = content.matchAll(/<(\d{2}):(\d{2})[.:](\d{2,3})>([^<]+)/g);
    const words: LyricsWord[] = [];
    
    for (const wordMatch of wordMatches) {
      const wMin = parseInt(wordMatch[1]);
      const wSec = parseInt(wordMatch[2]);
      const wMs = wordMatch[3].length === 2 
        ? parseInt(wordMatch[3]) * 10 
        : parseInt(wordMatch[3]);
      const startTime = wMin * 60 + wSec + wMs / 1000;
      const word = wordMatch[4].trim();
      
      if (word) {
        words.push({
          word,
          startTime,
          endTime: startTime + 0.5, // Will be refined
        });
      }
    }
    
    // Refine end times based on next word
    for (let i = 0; i < words.length - 1; i++) {
      words[i].endTime = words[i + 1].startTime;
    }
    
    const fullText = words.length > 0 
      ? words.map(w => w.word).join(' ')
      : content.replace(/<[^>]+>/g, '').trim();
    
    lines.push({
      time: lineTime,
      text: fullText,
      words: words.length > 0 ? words : undefined,
    });
  }
  
  return lines.sort((a, b) => a.time - b.time);
}

// Generate word timestamps from line text (for karaoke when no word timestamps exist)
export function generateWordTimestamps(line: LyricsLine, nextLineTime?: number): LyricsWord[] {
  const words = line.text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];
  
  const lineDuration = (nextLineTime ?? line.time + 5) - line.time;
  const wordDuration = lineDuration / words.length;
  
  return words.map((word, index) => ({
    word,
    startTime: line.time + index * wordDuration,
    endTime: line.time + (index + 1) * wordDuration,
  }));
}

// Format time as mm:ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
