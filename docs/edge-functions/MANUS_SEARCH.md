# Manus Search Edge Function

## Overview
The `manus-search` edge function provides AI-powered search for music, artists, documentation, and general queries using the Manus.im API.

## Endpoint
`POST /functions/v1/manus-search`

## Request Schema

```typescript
interface ManusSearchRequest {
  query: string;     // 1-1000 characters
  type?: 'artist' | 'track' | 'documentation' | 'general';  // Default: 'general'
  limit?: number;    // 1-50, Default: 5
}
```

## Response Schema

```typescript
interface ManusSearchResponse {
  results: Array<{
    title: string;
    description: string;
    url?: string;
    metadata?: Record<string, unknown>;
  }>;
  query: string;
  type: string;
}
```

## Search Types

### Artist Search
- **Type**: `artist`
- **Query Enhancement**: Adds "biography discography"
- **Returns**: Artist information, biography, discography

### Track Search
- **Type**: `track`
- **Query Enhancement**: Adds "lyrics meaning history"
- **Returns**: Song details, lyrics, meaning, history

### Documentation Search
- **Type**: `documentation`
- **Query Enhancement**: Adds "API documentation"
- **Returns**: Technical documentation, API references

### General Search
- **Type**: `general`
- **Query**: Used as-is
- **Returns**: General search results

## Example: Artist Search

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/manus-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Queen",
    "type": "artist",
    "limit": 5
  }'
```

## Example Response: Artist Search

```json
{
  "results": [
    {
      "title": "Queen - British Rock Band",
      "description": "Queen are a British rock band formed in London in 1970. Members: Freddie Mercury, Brian May, Roger Taylor, John Deacon...",
      "url": "https://en.wikipedia.org/wiki/Queen_(band)",
      "metadata": {
        "source": "Wikipedia",
        "relevance": 0.95
      }
    },
    {
      "title": "Queen Discography",
      "description": "Complete discography of Queen including studio albums, live albums, compilations...",
      "url": "https://www.queenoline.com/discography",
      "metadata": {
        "source": "Official Site",
        "relevance": 0.92
      }
    }
  ],
  "query": "Queen",
  "type": "artist"
}
```

## Example: Track Search

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/manus-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Bohemian Rhapsody",
    "type": "track",
    "limit": 3
  }'
```

## Example Response: Track Search

```json
{
  "results": [
    {
      "title": "Bohemian Rhapsody - Queen",
      "description": "A six-minute suite, consisting of several sections without a chorus: an intro, a ballad segment, an operatic passage, a hard rock part and a reflective coda...",
      "url": "https://en.wikipedia.org/wiki/Bohemian_Rhapsody",
      "metadata": {
        "artist": "Queen",
        "year": "1975",
        "album": "A Night at the Opera"
      }
    }
  ],
  "query": "Bohemian Rhapsody",
  "type": "track"
}
```

## Example: Documentation Search

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/manus-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Spotify Web API authentication",
    "type": "documentation",
    "limit": 5
  }'
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Invalid request parameters",
  "details": [
    { "path": "query", "message": "query is required" }
  ],
  "results": []
}
```

### API Unavailable (200 with fallback)
```json
{
  "results": [],
  "query": "search query",
  "type": "general",
  "error": "Manus API unavailable, using fallback"
}
```

### Server Error (500)
```json
{
  "error": "MANUS_API_KEY is not configured",
  "results": []
}
```

## Fallback Behavior

If Manus API is unavailable:
- Returns empty results array
- Includes error message
- Returns HTTP 200 (graceful degradation)
- Frontend can handle missing results

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MANUS_API_KEY` | Yes | Manus.im API key |

## Features
- ✅ AI-powered search
- ✅ Context-aware queries
- ✅ Multiple search types
- ✅ Graceful degradation
- ✅ Request validation with Zod
- ✅ Configurable result limits
- ✅ Metadata support
- ✅ CORS enabled

## Use Cases
- Music discovery
- Artist research
- Track information lookup
- API documentation search
- General knowledge queries
- Contextual help system
