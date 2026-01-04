# Jam Context

## Overview
React Context for managing collaborative jam sessions with real-time participant synchronization, queue management, and playback control.

## Import

```typescript
import { JamProvider, useJam } from '@/contexts/JamContext';
```

## Type Definitions

```typescript
interface JamContextValue {
  // Session
  session: JamSession | null;
  isHost: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Participant
  participantId: string | null;
  nickname: string | null;
  
  // Participants
  participants: JamParticipant[];
  participantCount: number;
  
  // Queue
  queue: JamQueueItem[];
  queueLength: number;
  
  // Actions
  createSession: (config: CreateJamConfig) => Promise<string | null>;
  joinSession: (code: string, nickname: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  
  // Playback (host only)
  updatePlaybackState: (state: Partial<PlaybackState>) => Promise<void>;
  updateCurrentTrack: (track: CurrentTrack | null) => Promise<void>;
  
  // Queue actions
  addToQueue: (track: AddTrackParams) => Promise<boolean>;
  voteTrack: (queueItemId: string) => Promise<void>;
  removeFromQueue: (queueItemId: string) => Promise<void>;
  markAsPlayed: (queueItemId: string) => Promise<void>;
  getNextTrack: () => JamQueueItem | null;
}
```

## Provider Usage

```typescript
import { JamProvider } from '@/contexts/JamContext';

function App() {
  return (
    <JamProvider>
      <YourApp />
    </JamProvider>
  );
}
```

## Hook Usage

```typescript
function JamSession() {
  const {
    session,
    isHost,
    isConnected,
    participantCount,
    queue,
    createSession,
    joinSession,
    addToQueue,
    voteTrack
  } = useJam();

  return (
    <div>
      {isConnected ? (
        <>
          <h2>Session: {session?.code}</h2>
          <p>Participants: {participantCount}</p>
          <p>Queue: {queue.length} tracks</p>
        </>
      ) : (
        <button onClick={() => createSession({ hostNickname: 'DJ' })}>
          Create Session
        </button>
      )}
    </div>
  );
}
```

## Session Management

### createSession(config)
Creates a new jam session as host.

**Parameters:**
```typescript
interface CreateJamConfig {
  hostNickname: string;
  sessionName?: string;
  isPublic?: boolean;
  maxParticipants?: number;
}
```

**Returns:** `Promise<string | null>` - Session code or null on failure

**Example:**
```typescript
const code = await createSession({
  hostNickname: 'DJ Smith',
  sessionName: 'Friday Night Jam',
  isPublic: true,
  maxParticipants: 50
});

if (code) {
  console.log(`Session created: ${code}`);
}
```

### joinSession(code, nickname)
Joins an existing jam session.

**Parameters:**
- `code: string` - 6-character session code
- `nickname: string` - Display name for participant

**Returns:** `Promise<boolean>` - Success status

**Example:**
```typescript
const joined = await joinSession('ABC123', 'Music Fan');
if (joined) {
  console.log('Joined session!');
}
```

### leaveSession()
Leaves current session.

**Returns:** `Promise<void>`

**Side Effects:**
- Clears participant ID
- Clears nickname
- Disconnects from session

## Participant Management

### Automatic Presence Updates
Context automatically updates presence every 30 seconds:

```typescript
useEffect(() => {
  if (!participantId) return;
  
  const interval = setInterval(() => {
    updatePresence(participantId);
  }, 30000);
  
  return () => clearInterval(interval);
}, [participantId]);
```

### Participants List
```typescript
const { participants, participantCount } = useJam();

participants.forEach(p => {
  console.log(`${p.nickname} - ${p.isOnline ? 'Online' : 'Offline'}`);
});
```

## Queue Management

### addToQueue(track)
Adds track to collaborative queue.

**Parameters:**
```typescript
interface AddTrackParams {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  artworkUrl?: string;
  provider?: 'spotify' | 'youtube' | 'local';
}
```

**Returns:** `Promise<boolean>`

**Example:**
```typescript
await addToQueue({
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  duration: 354,
  provider: 'spotify'
});
```

### voteTrack(queueItemId)
Upvotes a track in queue.

**Parameters:**
- `queueItemId: string` - Queue item ID

**Example:**
```typescript
await voteTrack('queue-item-123');
```

### removeFromQueue(queueItemId)
Removes track from queue (host only).

**Parameters:**
- `queueItemId: string` - Queue item ID

### markAsPlayed(queueItemId)
Marks track as played (host only).

**Parameters:**
- `queueItemId: string` - Queue item ID

### getNextTrack()
Gets next track to play based on votes.

**Returns:** `JamQueueItem | null`

**Example:**
```typescript
const nextTrack = getNextTrack();
if (nextTrack) {
  console.log(`Next up: ${nextTrack.title}`);
}
```

## Playback Control (Host Only)

### updatePlaybackState(state)
Updates playback state.

**Parameters:**
```typescript
interface PlaybackState {
  isPlaying: boolean;
  position: number;
  volume: number;
}
```

**Example:**
```typescript
if (isHost) {
  await updatePlaybackState({
    isPlaying: true,
    position: 45000,
    volume: 0.8
  });
}
```

### updateCurrentTrack(track)
Updates currently playing track.

**Parameters:**
```typescript
interface CurrentTrack {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artworkUrl?: string;
}
```

## State Properties

| Property | Type | Description |
|----------|------|-------------|
| `session` | `JamSession \| null` | Current session data |
| `isHost` | `boolean` | Whether user is session host |
| `isConnected` | `boolean` | Connection status |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `participantId` | `string \| null` | Current user's participant ID |
| `nickname` | `string \| null` | Current user's nickname |
| `participants` | `JamParticipant[]` | All participants |
| `participantCount` | `number` | Number of participants |
| `queue` | `JamQueueItem[]` | Queue items |
| `queueLength` | `number` | Queue length |

## Example: Complete Jam Session Flow

```typescript
function JamSessionManager() {
  const {
    session,
    isHost,
    isConnected,
    participants,
    queue,
    createSession,
    joinSession,
    leaveSession,
    addToQueue,
    voteTrack,
    getNextTrack,
    updatePlaybackState
  } = useJam();

  // Create session
  const handleCreate = async () => {
    const code = await createSession({
      hostNickname: 'DJ',
      sessionName: 'Party Mix',
      isPublic: true
    });
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success(`Session created! Code: ${code}`);
    }
  };

  // Join session
  const handleJoin = async (code: string) => {
    const joined = await joinSession(code, 'Guest');
    if (joined) {
      toast.success('Joined session!');
    }
  };

  // Add and vote for tracks
  const handleAddTrack = async () => {
    await addToQueue({
      title: 'Song Title',
      artist: 'Artist Name',
      duration: 180
    });
  };

  // Host playback control
  const handlePlay = async () => {
    if (isHost) {
      const next = getNextTrack();
      if (next) {
        await markAsPlayed(next.id);
        await updatePlaybackState({ isPlaying: true, position: 0 });
      }
    }
  };

  return (
    <div>
      {isConnected ? (
        <>
          <h2>{session?.name}</h2>
          <p>Code: {session?.code}</p>
          <p>Participants: {participants.length}</p>
          <ul>
            {queue.map(item => (
              <li key={item.id}>
                {item.title} - {item.votes} votes
                <button onClick={() => voteTrack(item.id)}>Vote</button>
              </li>
            ))}
          </ul>
          {isHost && <button onClick={handlePlay}>Play Next</button>}
          <button onClick={leaveSession}>Leave</button>
        </>
      ) : (
        <>
          <button onClick={handleCreate}>Create Session</button>
          <button onClick={() => handleJoin('ABC123')}>Join Session</button>
        </>
      )}
    </div>
  );
}
```

## Performance

Context value is memoized to prevent unnecessary re-renders:

```typescript
const value = useMemo<JamContextValue>(() => ({
  session,
  isHost,
  // ... all values
}), [/* all dependencies */]);
```

## Integration with Hooks

Uses specialized hooks for functionality:
- `useJamSession` - Session management
- `useJamParticipants` - Participant tracking
- `useJamQueue` - Queue operations

## See Also
- [useJamSession](/docs/hooks/USEJAMSESSION.md)
- [useJamQueue](/docs/hooks/USEJAMQUEUE.md)
- [Jam Session Guide](/docs/guides/JAM_SESSIONS.md)
