import { useState, useEffect } from 'react';
import type { SystemStatus } from '@/lib/api/types';

import type { MusicGenre } from '@/lib/api/types';

// Mock track data for demo mode - expanded playlist with varied covers and genres
const mockTracks: Array<{
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
  position: number;
  genre: MusicGenre;
}> = [
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    cover: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
    duration: 354,
    position: 0,
    genre: 'rock',
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    cover: 'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778',
    duration: 391,
    position: 0,
    genre: 'classic-rock',
  },
  {
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: 'Thriller',
    cover: 'https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97',
    duration: 294,
    position: 0,
    genre: 'pop',
  },
  {
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    cover: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d937',
    duration: 301,
    position: 0,
    genre: 'rock',
  },
  {
    title: 'Imagine',
    artist: 'John Lennon',
    album: 'Imagine',
    cover: 'https://i.scdn.co/image/ab67616d0000b273c9f744b0d62da795bc21d04a',
    duration: 187,
    position: 0,
    genre: 'ballad',
  },
  {
    title: 'Like a Rolling Stone',
    artist: 'Bob Dylan',
    album: 'Highway 61 Revisited',
    cover: 'https://i.scdn.co/image/ab67616d0000b2737d214af8499aa95ad220f573',
    duration: 369,
    position: 0,
    genre: 'classic-rock',
  },
  {
    title: 'Purple Rain',
    artist: 'Prince',
    album: 'Purple Rain',
    cover: 'https://i.scdn.co/image/ab67616d0000b2737e8dfd93a57d53f0fb8406ff',
    duration: 520,
    position: 0,
    genre: 'soul',
  },
  {
    title: 'Hey Jude',
    artist: 'The Beatles',
    album: 'Hey Jude',
    cover: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
    duration: 431,
    position: 0,
    genre: 'classic-rock',
  },
  {
    title: 'Wonderwall',
    artist: 'Oasis',
    album: "(What's the Story) Morning Glory?",
    cover: 'https://i.scdn.co/image/ab67616d0000b273b6e7e6bc618eea98a21e8bcf',
    duration: 258,
    position: 0,
    genre: 'rock',
  },
  {
    title: 'Back in Black',
    artist: 'AC/DC',
    album: 'Back in Black',
    cover: 'https://i.scdn.co/image/ab67616d0000b2730b51f8d91f3a21e8426361ae',
    duration: 255,
    position: 0,
    genre: 'rock',
  },
  {
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: '8 Mile',
    cover: 'https://i.scdn.co/image/ab67616d0000b2736ca5c90113b30c3c43ffb8f4',
    duration: 326,
    position: 0,
    genre: 'hip-hop',
  },
  {
    title: 'Rolling in the Deep',
    artist: 'Adele',
    album: '21',
    cover: 'https://i.scdn.co/image/ab67616d0000b2732118bf9b198b05a95ded6300',
    duration: 228,
    position: 0,
    genre: 'soul',
  },
];

// Generate random system metrics
function generateMockMetrics() {
  return {
    cpu: Math.floor(Math.random() * 30) + 15, // 15-45%
    memory: Math.floor(Math.random() * 20) + 40, // 40-60%
    temp: Math.floor(Math.random() * 15) + 45, // 45-60°C
  };
}

export function useMockStatus(isDemoMode: boolean) {
  const [mockStatus, setMockStatus] = useState<SystemStatus>(() => ({
    ...generateMockMetrics(),
    playing: true,
    volume: 75,
    muted: false,
    dmx: false,
    track: mockTracks[0],
  }));

  const [trackIndex, setTrackIndex] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    if (!isDemoMode) return;

    const metricsInterval = setInterval(() => {
      setMockStatus(prev => ({
        ...prev,
        ...generateMockMetrics(),
        track: prev.track && prev.playing ? {
          ...prev.track,
          position: Math.min((prev.track.position ?? 0) + 1, prev.track.duration ?? 300),
        } : prev.track,
      }));
    }, 1000);

    return () => clearInterval(metricsInterval);
  }, [isDemoMode]);

  // Auto-advance track when song ends
  useEffect(() => {
    if (!isDemoMode || !mockStatus.playing) return;

    if (mockStatus.track && mockStatus.track.position >= (mockStatus.track.duration ?? 300)) {
      setTrackIndex(prev => (prev + 1) % mockTracks.length);
    }
  }, [isDemoMode, mockStatus.playing, mockStatus.track?.position, mockStatus.track?.duration]);

  // Update track when index changes
  useEffect(() => {
    setMockStatus(prev => ({
      ...prev,
      track: { ...mockTracks[trackIndex], position: 0 },
    }));
  }, [trackIndex]);

  const togglePlay = () => {
    setMockStatus(prev => ({ ...prev, playing: !prev.playing }));
  };

  const nextTrack = () => {
    setTrackIndex(prev => (prev + 1) % mockTracks.length);
  };

  const prevTrack = () => {
    setTrackIndex(prev => (prev - 1 + mockTracks.length) % mockTracks.length);
  };

  const setVolume = (volume: number) => {
    setMockStatus(prev => ({ ...prev, volume, muted: volume === 0 }));
  };

  const toggleMute = () => {
    setMockStatus(prev => ({ ...prev, muted: !prev.muted }));
  };

  return {
    status: mockStatus,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
  };
}
