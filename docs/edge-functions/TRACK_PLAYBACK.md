# Track Playback Analytics Edge Function

## Overview
The `track-playback` edge function records and aggregates music playback statistics.

## Endpoints

### Record Playback
`POST /functions/v1/track-playback`

### Get Statistics
`GET /functions/v1/track-playback?period={period}`

## Record Playback Request

```typescript
interface TrackPlaybackData {
  track_id: string;        // Required: Unique track identifier
  track_name: string;      // Required: Track name
  artist_name: string;     // Required: Artist name
  album_name?: string;     // Optional: Album name
  album_art?: string;      // Optional: Album art URL
  provider: string;        // Required: 'spotify', 'youtube', 'local'
  duration_ms?: number;    // Optional: Track duration in milliseconds
  completed?: boolean;     // Optional: Whether track was fully played
}
```

## Get Statistics Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `period` | `today`, `week`, `month`, `all` | `week` | Time period for statistics |

## Statistics Response

```typescript
interface PlaybackStats {
  totalPlays: number;
  uniqueTracks: number;
  uniqueArtists: number;
  totalMinutes: number;
  topTracks: TopTrack[];
  topArtists: TopArtist[];
  hourlyActivity: HourlyActivity[];
  recentPlays: PlaybackRecord[];
  providerStats: ProviderStats[];
  period: string;
}

interface TopTrack {
  track_id: string;
  track_name: string;
  artist_name: string;
  album_art?: string;
  plays: number;
}

interface TopArtist {
  artist_name: string;
  plays: number;
}

interface HourlyActivity {
  hour: number;     // 0-23
  count: number;    // Play count
}

interface ProviderStats {
  provider: string;
  plays: number;
}
```

## Example: Record Playback

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/track-playback \
  -H "Content-Type: application/json" \
  -d '{
    "track_id": "spotify:track:123",
    "track_name": "Bohemian Rhapsody",
    "artist_name": "Queen",
    "album_name": "A Night at the Opera",
    "album_art": "https://...",
    "provider": "spotify",
    "duration_ms": 354000,
    "completed": true
  }'
```

## Example Response: Record Playback

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "track_id": "spotify:track:123",
    "track_name": "Bohemian Rhapsody",
    "played_at": "2024-01-04T10:00:00Z"
  }
}
```

## Example: Get Statistics

```bash
curl https://[project-id].supabase.co/functions/v1/track-playback?period=week
```

## Example Response: Statistics

```json
{
  "totalPlays": 250,
  "uniqueTracks": 75,
  "uniqueArtists": 42,
  "totalMinutes": 1250,
  "topTracks": [
    {
      "track_id": "spotify:track:123",
      "track_name": "Bohemian Rhapsody",
      "artist_name": "Queen",
      "plays": 15
    }
  ],
  "topArtists": [
    { "artist_name": "Queen", "plays": 35 }
  ],
  "hourlyActivity": [
    { "hour": 0, "count": 5 },
    { "hour": 1, "count": 2 }
  ],
  "providerStats": [
    { "provider": "spotify", "plays": 180 },
    { "provider": "youtube", "plays": 70 }
  ],
  "period": "week"
}
```

## Database Schema

Table: `playback_stats`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `track_id` | text | Track identifier |
| `track_name` | text | Track name |
| `artist_name` | text | Artist name |
| `album_name` | text | Album name |
| `album_art` | text | Album art URL |
| `provider` | text | Music provider |
| `duration_ms` | integer | Duration in ms |
| `completed` | boolean | Play completed |
| `played_at` | timestamp | Playback time |
| `user_agent` | text | Client user agent |
| `client_ip` | text | Client IP address |

## Error Responses

### Missing Fields (400)
```json
{
  "error": "Missing required fields: track_id, track_name, artist_name, provider"
}
```

### Database Error (500)
```json
{
  "error": "Failed to record playback",
  "details": "Database error message"
}
```

## Features
- ✅ Track individual playback events
- ✅ Aggregate statistics by time period
- ✅ Top tracks and artists analysis
- ✅ Hourly activity patterns
- ✅ Provider usage statistics
- ✅ Recent playback history
- ✅ Client metadata tracking (IP, User-Agent)
- ✅ CORS enabled

## Use Cases
- Analytics dashboard
- Listening history
- Music recommendation engine
- Usage pattern analysis
- Provider performance comparison
