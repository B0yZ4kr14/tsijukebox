import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LyricsLine {
  time: number;
  text: string;
  words?: {
    word: string;
    startTime: number;
    endTime: number;
  }[];
}

interface LyricsResponse {
  source: 'lrclib' | 'genius' | 'none';
  synced: boolean;
  lines: LyricsLine[];
  plainText?: string;
  trackName: string;
  artistName: string;
}

// Parse standard LRC format: [mm:ss.xx]text
function parseLRC(lrcText: string): LyricsLine[] {
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
function parseEnhancedLRC(lrcText: string): LyricsLine[] {
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
    const words: LyricsLine['words'] = [];
    
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
          endTime: startTime + 0.5, // Estimate, will be refined
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

// Fetch from LRCLIB (free, no API key needed)
async function fetchFromLRCLIB(trackName: string, artistName: string): Promise<LyricsResponse | null> {
  try {
    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });
    
    const response = await fetch(`https://lrclib.net/api/get?${params}`, {
      headers: {
        'User-Agent': 'TSiJUKEBOX/1.0',
      },
    });
    
    if (!response.ok) {
      console.log('LRCLIB response not ok:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data) {
      return null;
    }
    
    // Try synced lyrics first
    if (data.syncedLyrics) {
      // Check if it's enhanced LRC (has word timestamps)
      const hasWordTimestamps = data.syncedLyrics.includes('<');
      const lines = hasWordTimestamps 
        ? parseEnhancedLRC(data.syncedLyrics)
        : parseLRC(data.syncedLyrics);
      
      return {
        source: 'lrclib',
        synced: true,
        lines,
        plainText: data.plainLyrics,
        trackName: data.trackName || trackName,
        artistName: data.artistName || artistName,
      };
    }
    
    // Fall back to plain lyrics
    if (data.plainLyrics) {
      const plainLines = data.plainLyrics.split('\n').map((text: string, index: number) => ({
        time: index * 4, // Estimate 4 seconds per line
        text: text.trim(),
      }));
      
      return {
        source: 'lrclib',
        synced: false,
        lines: plainLines,
        plainText: data.plainLyrics,
        trackName: data.trackName || trackName,
        artistName: data.artistName || artistName,
      };
    }
    
    return null;
  } catch (error) {
    console.error('LRCLIB fetch error:', error);
    return null;
  }
}

// Search LRCLIB if exact match fails
async function searchLRCLIB(trackName: string, artistName: string): Promise<LyricsResponse | null> {
  try {
    const query = `${trackName} ${artistName}`;
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'TSiJUKEBOX/1.0',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const results = await response.json();
    
    if (!results || results.length === 0) {
      return null;
    }
    
    // Get the first result with synced lyrics
    // LRCLIBResult interface used for type-safe access
    interface LRCLIBResult {
      id: number;
      trackName: string;
      artistName: string;
      albumName?: string;
      duration?: number;
      instrumental: boolean;
      plainLyrics: string | null;
      syncedLyrics: string | null;
    }
    const bestMatch = (results as LRCLIBResult[]).find((r) => r.syncedLyrics) || results[0];
    
    if (bestMatch.syncedLyrics) {
      const hasWordTimestamps = bestMatch.syncedLyrics.includes('<');
      const lines = hasWordTimestamps 
        ? parseEnhancedLRC(bestMatch.syncedLyrics)
        : parseLRC(bestMatch.syncedLyrics);
      
      return {
        source: 'lrclib',
        synced: true,
        lines,
        plainText: bestMatch.plainLyrics,
        trackName: bestMatch.trackName || trackName,
        artistName: bestMatch.artistName || artistName,
      };
    }
    
    if (bestMatch.plainLyrics) {
      const plainLines = bestMatch.plainLyrics.split('\n').map((text: string, index: number) => ({
        time: index * 4,
        text: text.trim(),
      }));
      
      return {
        source: 'lrclib',
        synced: false,
        lines: plainLines,
        plainText: bestMatch.plainLyrics,
        trackName: bestMatch.trackName || trackName,
        artistName: bestMatch.artistName || artistName,
      };
    }
    
    return null;
  } catch (error) {
    console.error('LRCLIB search error:', error);
    return null;
  }
}

// Fetch from Genius API as fallback (requires GENIUS_API_KEY)
async function fetchFromGenius(trackName: string, artistName: string): Promise<LyricsResponse | null> {
  const geniusApiKey = Deno.env.get('GENIUS_API_KEY');
  
  if (!geniusApiKey) {
    console.log('GENIUS_API_KEY not configured, skipping Genius fallback');
    return null;
  }
  
  try {
    // Step 1: Search for the song
    const query = `${trackName} ${artistName}`;
    const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;
    
    console.log('Searching Genius for:', query);
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${geniusApiKey}`,
      },
    });
    
    if (!searchResponse.ok) {
      console.log('Genius search failed:', searchResponse.status);
      return null;
    }
    
    const searchData = await searchResponse.json();
    const hits = searchData.response?.hits;
    
    if (!hits || hits.length === 0) {
      console.log('No Genius results found');
      return null;
    }
    
    // Get the best match (first result)
    const song = hits[0].result;
    const songUrl = song.url;
    const songTitle = song.title;
    const songArtist = song.primary_artist?.name;
    
    console.log('Found Genius song:', songTitle, 'by', songArtist);
    
    // Step 2: Scrape lyrics from the song page
    const pageResponse = await fetch(songUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!pageResponse.ok) {
      console.log('Failed to fetch Genius page:', pageResponse.status);
      return null;
    }
    
    const html = await pageResponse.text();
    
    // Extract lyrics using multiple patterns (Genius changes their HTML structure)
    let lyricsText = '';
    
    // Pattern 1: data-lyrics-container
    const containerMatches = html.match(/data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g);
    if (containerMatches) {
      lyricsText = containerMatches.join('\n');
    }
    
    // Pattern 2: Lyrics__Container class
    if (!lyricsText) {
      const classMatch = html.match(/class="Lyrics__Container[^"]*"[^>]*>([\s\S]*?)<\/div>/g);
      if (classMatch) {
        lyricsText = classMatch.join('\n');
      }
    }
    
    if (!lyricsText) {
      console.log('Could not extract lyrics from Genius page');
      return null;
    }
    
    // Clean HTML tags and decode entities
    let plainText = lyricsText
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\[.*?\]/g, '') // Remove section headers like [Verse 1]
      .replace(/\n\n+/g, '\n\n')
      .trim();
    
    // Convert to lines (not synced, estimate 4 seconds per line)
    const lines = plainText.split('\n')
      .filter(line => line.trim())
      .map((text, index) => ({
        time: index * 4,
        text: text.trim(),
      }));
    
    if (lines.length === 0) {
      console.log('No lyrics lines extracted from Genius');
      return null;
    }
    
    console.log(`Extracted ${lines.length} lines from Genius`);
    
    return {
      source: 'genius',
      synced: false, // Genius doesn't provide timestamps
      lines,
      plainText,
      trackName: songTitle || trackName,
      artistName: songArtist || artistName,
    };
    
  } catch (error) {
    console.error('Genius fetch error:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { trackName, artistName } = await req.json();
    
    if (!trackName || !artistName) {
      return new Response(
        JSON.stringify({ error: 'trackName and artistName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Searching lyrics for: "${trackName}" by "${artistName}"`);
    
    // Try LRCLIB exact match first
    let lyrics = await fetchFromLRCLIB(trackName, artistName);
    
    // If no exact match, try search
    if (!lyrics) {
      console.log('No exact match, trying LRCLIB search...');
      lyrics = await searchLRCLIB(trackName, artistName);
    }
    
    // If still no lyrics, try Genius as fallback
    if (!lyrics) {
      console.log('LRCLIB failed, trying Genius fallback...');
      lyrics = await fetchFromGenius(trackName, artistName);
    }
    
    if (lyrics) {
      console.log(`Found lyrics from ${lyrics.source}, synced: ${lyrics.synced}, lines: ${lyrics.lines.length}`);
      return new Response(
        JSON.stringify(lyrics),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // No lyrics found
    console.log('No lyrics found');
    return new Response(
      JSON.stringify({
        source: 'none',
        synced: false,
        lines: [],
        trackName,
        artistName,
      } as LyricsResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in lyrics-search:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
