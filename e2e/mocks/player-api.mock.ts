import { Page } from '@playwright/test';

export const mockPlayerStatus = {
  is_playing: true,
  track: {
    id: 'demo-track-1',
    name: 'Demo Song',
    artist: 'Demo Artist',
    album: 'Demo Album',
    duration_ms: 240000,
    album_art: '/demo-cover.jpg'
  },
  progress_ms: 60000,
  volume: 75,
  shuffle: false,
  repeat_mode: 'off' as const
};

export const mockTrackList = [
  {
    id: 'demo-track-1',
    name: 'Demo Song',
    artist: 'Demo Artist',
    album: 'Demo Album',
    duration_ms: 240000,
    album_art: '/demo-cover.jpg'
  },
  {
    id: 'demo-track-2',
    name: 'Second Track',
    artist: 'Another Artist',
    album: 'Another Album',
    duration_ms: 180000,
    album_art: '/demo-cover-2.jpg'
  },
  {
    id: 'demo-track-3',
    name: 'Third Track',
    artist: 'Third Artist',
    album: 'Third Album',
    duration_ms: 300000,
    album_art: '/demo-cover-3.jpg'
  }
];

export async function setupPlayerMocks(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('tsi-jukebox-demo-mode', 'true');
  });
}

export async function mockPlaybackState(page: Page, state: Partial<typeof mockPlayerStatus>) {
  await page.evaluate((playerState) => {
    localStorage.setItem('tsi-jukebox-playback-state', JSON.stringify(playerState));
  }, { ...mockPlayerStatus, ...state });
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
