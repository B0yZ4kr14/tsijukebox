# Lyrics Search Edge Function

## Overview
The `lyrics-search` edge function provides synchronized and plain text lyrics for music tracks from multiple sources.

## Endpoint
`POST /functions/v1/lyrics-search`

## Request Schema

```typescript
interface LyricsSearchRequest {
  trackName: string;    // 1-500 characters
  artistName: string;   // 1-500 characters
}
```

## Response Schema

```typescript
interface LyricsResponse {
  source: 'lrclib' | 'genius' | 'none';
  synced: boolean;
  lines: LyricsLine[];
  plainText?: string;
  trackName: string;
  artistName: string;
}

interface LyricsLine {
  time: number;  // Timestamp in seconds
  text: string;
  words?: {
    word: string;
    startTime: number;
    endTime: number;
  }[];
}
```

## Data Sources

### 1. LRCLIB (Primary)
- Free, no API key required
- Supports synced lyrics in LRC format
- Supports enhanced LRC with word-level timestamps
- Exact match and fuzzy search available

### 2. Genius API (Fallback)
- Requires `GENIUS_API_KEY` environment variable
- Provides plain text lyrics only (no timestamps)
- Web scraping for lyrics extraction

## LRC Format Support

### Standard LRC
```
[00:12.34]First line of lyrics
[00:16.78]Second line of lyrics
```

### Enhanced LRC (Word-level)
```
[00:12.34]<00:12.34>First <00:12.89>word <00:13.45>by <00:13.89>word
```

## Search Strategy
1. **Exact Match**: Try exact match on LRCLIB
2. **Fuzzy Search**: If no exact match, search LRCLIB
3. **Genius Fallback**: If LRCLIB fails and `GENIUS_API_KEY` is configured

## Example Request

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/lyrics-search \
  -H "Content-Type: application/json" \
  -d '{
    "trackName": "Bohemian Rhapsody",
    "artistName": "Queen"
  }'
```

## Example Response

```json
{
  "source": "lrclib",
  "synced": true,
  "lines": [
    {
      "time": 12.34,
      "text": "First line of lyrics",
      "words": [
        { "word": "First", "startTime": 12.34, "endTime": 12.89 },
        { "word": "line", "startTime": 12.89, "endTime": 13.45 }
      ]
    }
  ],
  "plainText": "Full plain text lyrics...",
  "trackName": "Bohemian Rhapsody",
  "artistName": "Queen"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Invalid request parameters",
  "details": [
    { "path": "trackName", "message": "trackName is required" }
  ]
}
```

### No Lyrics Found (200)
```json
{
  "source": "none",
  "synced": false,
  "lines": [],
  "trackName": "Track Name",
  "artistName": "Artist Name"
}
```

## Environment Variables
- `GENIUS_API_KEY` (optional): Enables Genius API fallback

## Features
- ✅ Synchronized lyrics with timestamps
- ✅ Word-level synchronization support
- ✅ Multiple data sources with fallback
- ✅ Request validation with Zod
- ✅ CORS enabled
- ✅ Comprehensive error handling

## Use Cases
- Karaoke mode with synchronized lyrics display
- Lyrics viewer for music player
- Lyrics search and discovery
- Real-time lyrics synchronization during playback
