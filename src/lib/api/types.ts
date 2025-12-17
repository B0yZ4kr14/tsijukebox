// TypeScript interfaces matching FastAPI backend schemas

export type MusicGenre = 'rock' | 'pop' | 'soul' | 'hip-hop' | 'ballad' | 'classic-rock';

export interface TrackInfo {
  id?: string;
  albumId?: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  duration?: number;
  position?: number;
  genre?: MusicGenre;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  temp: number;
  playing: boolean;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
  /** DMX lighting control status (optional feature for kiosk environments) */
  dmx?: boolean;
  track: TrackInfo | null;
}

export interface QueueItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  duration: number;
  uri?: string;
}

export interface PlaybackQueue {
  current: QueueItem | null;
  next: QueueItem[];
  history: QueueItem[];
}

export interface PlaybackAction {
  action: 'play' | 'pause' | 'next' | 'prev' | 'stop';
}

export interface VolumeControl {
  level: number;
  mute?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  filename: string;
  duration: number;
  plays: number;
  added_at: string;
}

export interface LogEntry {
  id: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  timestamp: string;
  module: string;
}

export interface Feedback {
  id: number;
  message: string;
  rating: number;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
