import { useState, useEffect } from 'react';
import type { SystemStatus } from '@/lib/api/types';

// Mock track data for demo mode
const mockTracks = [
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    cover: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
    duration: 354,
    position: 120,
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    cover: 'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778',
    duration: 391,
    position: 60,
  },
  {
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    cover: 'https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69',
    duration: 482,
    position: 200,
  },
  {
    title: 'Comfortably Numb',
    artist: 'Pink Floyd',
    album: 'The Wall',
    cover: 'https://i.scdn.co/image/ab67616d0000b2735d48e2f56d691f9a4e4b0bdf',
    duration: 382,
    position: 0,
  },
  {
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    album: 'Appetite for Destruction',
    cover: 'https://i.scdn.co/image/ab67616d0000b2736c3d1e8e1f4a8e0f5c5c0a5b',
    duration: 356,
    position: 0,
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
