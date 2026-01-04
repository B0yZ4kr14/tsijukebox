// E2E Mocks templates (2 files)

export function generateE2EMocksContent(path: string): string | null {
  switch (path) {
    case 'e2e/mocks/backup-api.mock.ts':
      return `// Backup API Mock for E2E Testing
import { Page } from '@playwright/test';

export interface MockBackup {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
  provider: 'local' | 'cloud' | 'distributed';
  status: 'pending' | 'completed' | 'failed' | 'syncing';
}

export const mockBackups: MockBackup[] = [
  {
    id: '1',
    name: 'Backup 2024-01-15',
    type: 'full',
    size: '2.5 GB',
    date: '2024-01-15T10:30:00Z',
    provider: 'local',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Backup 2024-01-14',
    type: 'incremental',
    size: '450 MB',
    date: '2024-01-14T10:30:00Z',
    provider: 'cloud',
    status: 'completed',
  },
];

export async function setupBackupApiMock(page: Page): Promise<void> {
  await page.route('**/api/backups', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ backups: mockBackups }),
    });
  });

  await page.route('**/api/backups/create', (route) => {
    const newBackup: MockBackup = {
      id: crypto.randomUUID(),
      name: \`Backup \${new Date().toLocaleDateString('pt-BR')}\`,
      type: 'full',
      size: '0 MB',
      date: new Date().toISOString(),
      provider: 'local',
      status: 'pending',
    };
    
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(newBackup),
    });
  });

  await page.route('**/api/backups/*/restore', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Backup restored successfully' }),
    });
  });

  await page.route('**/api/backups/*/delete', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

export async function mockBackupFailure(page: Page): Promise<void> {
  await page.route('**/api/backups/create', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to create backup' }),
    });
  });
}

export async function mockBackupProgress(page: Page): Promise<void> {
  let progress = 0;
  
  await page.route('**/api/backups/progress', (route) => {
    progress = Math.min(progress + 20, 100);
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        progress,
        status: progress < 100 ? 'in_progress' : 'completed',
      }),
    });
  });
}
`;

    case 'e2e/mocks/player-api.mock.ts':
      return `// Player API Mock for E2E Testing
import { Page } from '@playwright/test';

export interface MockTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  provider: 'spotify' | 'youtube' | 'local';
}

export interface MockPlaybackState {
  isPlaying: boolean;
  currentTrack: MockTrack | null;
  position: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
}

export const mockTracks: MockTrack[] = [
  {
    id: 'track-1',
    name: 'Test Song 1',
    artist: 'Test Artist',
    album: 'Test Album',
    albumArt: 'https://via.placeholder.com/300',
    duration: 180000,
    provider: 'spotify',
  },
  {
    id: 'track-2',
    name: 'Test Song 2',
    artist: 'Another Artist',
    album: 'Another Album',
    albumArt: 'https://via.placeholder.com/300',
    duration: 240000,
    provider: 'spotify',
  },
];

let playbackState: MockPlaybackState = {
  isPlaying: false,
  currentTrack: null,
  position: 0,
  volume: 80,
  shuffle: false,
  repeat: 'off',
};

export async function setupPlayerApiMock(page: Page): Promise<void> {
  // Get playback state
  await page.route('**/api/player/state', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(playbackState),
    });
  });

  // Play/Pause
  await page.route('**/api/player/play', (route) => {
    playbackState.isPlaying = true;
    if (!playbackState.currentTrack && mockTracks.length > 0) {
      playbackState.currentTrack = mockTracks[0];
    }
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(playbackState),
    });
  });

  await page.route('**/api/player/pause', (route) => {
    playbackState.isPlaying = false;
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(playbackState),
    });
  });

  // Skip tracks
  await page.route('**/api/player/next', (route) => {
    const currentIndex = mockTracks.findIndex(
      (t) => t.id === playbackState.currentTrack?.id
    );
    const nextIndex = (currentIndex + 1) % mockTracks.length;
    playbackState.currentTrack = mockTracks[nextIndex];
    playbackState.position = 0;
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(playbackState),
    });
  });

  await page.route('**/api/player/previous', (route) => {
    const currentIndex = mockTracks.findIndex(
      (t) => t.id === playbackState.currentTrack?.id
    );
    const prevIndex = currentIndex <= 0 ? mockTracks.length - 1 : currentIndex - 1;
    playbackState.currentTrack = mockTracks[prevIndex];
    playbackState.position = 0;
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(playbackState),
    });
  });

  // Volume
  await page.route('**/api/player/volume', async (route) => {
    const request = route.request();
    const body = request.postDataJSON();
    
    if (body?.volume !== undefined) {
      playbackState.volume = body.volume;
    }
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ volume: playbackState.volume }),
    });
  });

  // Seek
  await page.route('**/api/player/seek', async (route) => {
    const request = route.request();
    const body = request.postDataJSON();
    
    if (body?.position !== undefined) {
      playbackState.position = body.position;
    }
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ position: playbackState.position }),
    });
  });

  // Shuffle
  await page.route('**/api/player/shuffle', async (route) => {
    playbackState.shuffle = !playbackState.shuffle;
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ shuffle: playbackState.shuffle }),
    });
  });

  // Repeat
  await page.route('**/api/player/repeat', async (route) => {
    const modes: MockPlaybackState['repeat'][] = ['off', 'context', 'track'];
    const currentIndex = modes.indexOf(playbackState.repeat);
    playbackState.repeat = modes[(currentIndex + 1) % modes.length];
    
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ repeat: playbackState.repeat }),
    });
  });
}

export function resetPlayerState(): void {
  playbackState = {
    isPlaying: false,
    currentTrack: null,
    position: 0,
    volume: 80,
    shuffle: false,
    repeat: 'off',
  };
}

export function setMockPlaybackState(state: Partial<MockPlaybackState>): void {
  playbackState = { ...playbackState, ...state };
}
`;

    default:
      return null;
  }
}
