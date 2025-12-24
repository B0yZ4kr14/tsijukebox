/**
 * TSiJUKEBOX Themed Player Component
 * 
 * Player de música com suporte aos 5 temas oficiais.
 * Baseado no design de referência "Cosmic Player".
 * 
 * Features:
 * - Controles de reprodução completos
 * - Barra de progresso interativa
 * - Controle de volume
 * - Queue/fila de reprodução
 * - Integração com Spotify/YouTube
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCurrentTheme } from '@/contexts/ThemeContext';
import { TSiLogo } from '@/components/ui/TSiLogo';
import { Card, Button, Slider } from '@/components/ui/themed';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Heart,
  MoreHorizontal,
  Maximize2,
  type LucideIcon
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // em segundos
  coverUrl?: string;
  source?: 'spotify' | 'youtube' | 'local';
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  isLiked: boolean;
}

export interface ThemedPlayerProps {
  track?: Track;
  queue?: Track[];
  state?: PlayerState;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: () => void;
  onShuffleToggle?: () => void;
  onRepeatToggle?: () => void;
  onLikeToggle?: () => void;
  onQueueClick?: () => void;
  onFullscreen?: () => void;
  variant?: 'full' | 'compact' | 'mini';
  showQueue?: boolean;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getVolumeIcon(volume: number, isMuted: boolean): LucideIcon {
  if (isMuted || volume === 0) return VolumeX;
  if (volume < 50) return Volume1;
  return Volume2;
}

// ============================================================================
// ALBUM COVER COMPONENT
// ============================================================================

interface AlbumCoverProps {
  coverUrl?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
  className?: string;
}

const AlbumCover: React.FC<AlbumCoverProps> = ({
  coverUrl,
  title = 'Album Cover',
  size = 'md',
  isPlaying,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-[var(--bg-tertiary)]',
        'shadow-lg',
        sizeClasses[size],
        isPlaying && 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]',
        className
      )}
      style={{
        boxShadow: isPlaying ? `0 0 30px var(--accent-glow)` : undefined,
      }}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ListMusic className="w-1/3 h-1/3 text-[var(--text-muted)]" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  showTime?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  showTime = true,
  className,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !onSeek) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={progressRef}
        onClick={handleClick}
        className="relative h-1.5 bg-[var(--bg-tertiary)] rounded-full cursor-pointer group"
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[var(--accent-primary)] transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full',
            'bg-white shadow-md',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'cursor-grab active:cursor-grabbing'
          )}
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
      {showTime && (
        <div className="flex justify-between mt-1.5 text-xs text-[var(--text-muted)]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PLAYBACK CONTROLS COMPONENT
// ============================================================================

interface PlaybackControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  shuffle,
  repeat,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onShuffleToggle,
  onRepeatToggle,
  size = 'md',
  className,
}) => {
  const sizeConfig = {
    sm: { main: 'w-10 h-10', secondary: 'w-8 h-8', icon: 'w-4 h-4', mainIcon: 'w-5 h-5' },
    md: { main: 'w-14 h-14', secondary: 'w-10 h-10', icon: 'w-5 h-5', mainIcon: 'w-6 h-6' },
    lg: { main: 'w-16 h-16', secondary: 'w-12 h-12', icon: 'w-6 h-6', mainIcon: 'w-8 h-8' },
  };

  const config = sizeConfig[size];

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* Shuffle */}
      <button
        type="button"
        onClick={onShuffleToggle}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          config.secondary,
          shuffle
            ? 'text-[var(--accent-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        )}
        aria-label={shuffle ? 'Desativar shuffle' : 'Ativar shuffle'}
      >
        <Shuffle className={config.icon} />
      </button>

      {/* Previous */}
      <button
        type="button"
        onClick={onPrevious}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          config.secondary,
          'text-[var(--text-primary)] hover:text-[var(--accent-primary)]'
        )}
        aria-label="Música anterior"
      >
        <SkipBack className={config.icon} />
      </button>

      {/* Play/Pause */}
      <button
        type="button"
        onClick={isPlaying ? onPause : onPlay}
        className={cn(
          'flex items-center justify-center rounded-full transition-all',
          config.main,
          'bg-[var(--accent-primary)] text-white',
          'hover:scale-105 active:scale-95',
          'shadow-lg'
        )}
        style={{
          boxShadow: `0 0 20px var(--accent-glow)`,
        }}
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? (
          <Pause className={config.mainIcon} />
        ) : (
          <Play className={cn(config.mainIcon, 'ml-1')} />
        )}
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={onNext}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          config.secondary,
          'text-[var(--text-primary)] hover:text-[var(--accent-primary)]'
        )}
        aria-label="Próxima música"
      >
        <SkipForward className={config.icon} />
      </button>

      {/* Repeat */}
      <button
        type="button"
        onClick={onRepeatToggle}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          config.secondary,
          repeat !== 'off'
            ? 'text-[var(--accent-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        )}
        aria-label={`Repetir: ${repeat}`}
      >
        <RepeatIcon className={config.icon} />
      </button>
    </div>
  );
};

// ============================================================================
// VOLUME CONTROL COMPONENT
// ============================================================================

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className,
}) => {
  const VolumeIcon = getVolumeIcon(volume, isMuted);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={onMuteToggle}
        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>
      <div className="w-24">
        <Slider
          value={isMuted ? 0 : volume}
          onChange={onVolumeChange}
          min={0}
          max={100}
        />
      </div>
      <span className="text-xs text-[var(--text-muted)] w-8 text-right">
        {isMuted ? '0' : volume}%
      </span>
    </div>
  );
};

// ============================================================================
// QUEUE ITEM COMPONENT
// ============================================================================

interface QueueItemProps {
  track: Track;
  isActive?: boolean;
  onClick?: () => void;
}

const QueueItem: React.FC<QueueItemProps> = ({ track, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
        isActive
          ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/50'
          : 'hover:bg-[var(--bg-tertiary)]'
      )}
    >
      <AlbumCover coverUrl={track.coverUrl} title={track.title} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
        )}>
          {track.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] truncate">{track.artist}</p>
      </div>
    </button>
  );
};

// ============================================================================
// QUEUE PANEL COMPONENT
// ============================================================================

interface QueuePanelProps {
  queue: Track[];
  currentTrackId?: string;
  onTrackSelect?: (trackId: string) => void;
  className?: string;
}

const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  currentTrackId,
  onTrackSelect,
  className,
}) => {
  return (
    <Card variant="glass" padding="md" className={cn('w-64', className)}>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wider">
        Queue
      </h3>
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {queue.map((track) => (
          <QueueItem
            key={track.id}
            track={track}
            isActive={track.id === currentTrackId}
            onClick={() => onTrackSelect?.(track.id)}
          />
        ))}
      </div>
    </Card>
  );
};

// ============================================================================
// FULL PLAYER COMPONENT
// ============================================================================

export const ThemedPlayer: React.FC<ThemedPlayerProps> = ({
  track,
  queue = [],
  state = {
    isPlaying: false,
    currentTime: 0,
    volume: 75,
    isMuted: false,
    shuffle: false,
    repeat: 'off',
    isLiked: false,
  },
  onPlay = () => {},
  onPause = () => {},
  onNext = () => {},
  onPrevious = () => {},
  onSeek = () => {},
  onVolumeChange = () => {},
  onMuteToggle = () => {},
  onShuffleToggle = () => {},
  onRepeatToggle = () => {},
  onLikeToggle = () => {},
  onQueueClick = () => {},
  onFullscreen = () => {},
  variant = 'full',
  showQueue = true,
  className,
}) => {
  const theme = useCurrentTheme();

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center gap-4 p-4',
        'bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]',
        className
      )}>
        <AlbumCover coverUrl={track?.coverUrl} title={track?.title} size="md" isPlaying={state.isPlaying} />
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text-primary)] truncate">{track?.title || 'No track'}</p>
          <p className="text-sm text-[var(--text-muted)] truncate">{track?.artist || 'Unknown artist'}</p>
        </div>

        <PlaybackControls
          isPlaying={state.isPlaying}
          shuffle={state.shuffle}
          repeat={state.repeat}
          onPlay={onPlay}
          onPause={onPause}
          onNext={onNext}
          onPrevious={onPrevious}
          onShuffleToggle={onShuffleToggle}
          onRepeatToggle={onRepeatToggle}
          size="sm"
        />

        <VolumeControl
          volume={state.volume}
          isMuted={state.isMuted}
          onVolumeChange={onVolumeChange}
          onMuteToggle={onMuteToggle}
        />
      </div>
    );
  }

  // Mini variant
  if (variant === 'mini') {
    return (
      <div className={cn(
        'flex items-center gap-3 p-2',
        'bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]',
        className
      )}>
        <AlbumCover coverUrl={track?.coverUrl} title={track?.title} size="sm" isPlaying={state.isPlaying} />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{track?.title || 'No track'}</p>
        </div>

        <button
          type="button"
          onClick={state.isPlaying ? onPause : onPlay}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent-primary)] text-white"
        >
          {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-screen p-8',
      'bg-[var(--bg-primary)]',
      className
    )}>
      {/* Logo */}
      <div className="mb-8">
        <TSiLogo variant="wordmark" size="xl" animated />
      </div>

      {/* Main Content */}
      <div className="flex items-start gap-8">
        {/* Player */}
        <div className="flex flex-col items-center">
          {/* Album Cover */}
          <AlbumCover
            coverUrl={track?.coverUrl}
            title={track?.title}
            size="xl"
            isPlaying={state.isPlaying}
            className="mb-6"
          />

          {/* Track Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {track?.title || 'No track selected'}
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              {track?.artist || 'Unknown artist'}
            </p>
            {track?.album && (
              <p className="text-sm text-[var(--text-muted)]">{track.album}</p>
            )}
          </div>

          {/* Progress Bar */}
          <ProgressBar
            currentTime={state.currentTime}
            duration={track?.duration || 0}
            onSeek={onSeek}
            className="w-96 mb-6"
          />

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={state.isPlaying}
            shuffle={state.shuffle}
            repeat={state.repeat}
            onPlay={onPlay}
            onPause={onPause}
            onNext={onNext}
            onPrevious={onPrevious}
            onShuffleToggle={onShuffleToggle}
            onRepeatToggle={onRepeatToggle}
            size="lg"
            className="mb-6"
          />

          {/* Secondary Controls */}
          <div className="flex items-center gap-6">
            <VolumeControl
              volume={state.volume}
              isMuted={state.isMuted}
              onVolumeChange={onVolumeChange}
              onMuteToggle={onMuteToggle}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLikeToggle}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  state.isLiked
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
                aria-label={state.isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart className={cn('w-5 h-5', state.isLiked && 'fill-current')} />
              </button>

              <button
                type="button"
                onClick={onQueueClick}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Ver fila"
              >
                <ListMusic className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onFullscreen}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Tela cheia"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Source indicator */}
          {track?.source && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className={cn(
                'w-2 h-2 rounded-full',
                track.source === 'spotify' && 'bg-[#1DB954]',
                track.source === 'youtube' && 'bg-[#FF0000]',
                track.source === 'local' && 'bg-[var(--accent-primary)]'
              )} />
              <span className="capitalize">{track.source}</span>
            </div>
          )}
        </div>

        {/* Queue Panel */}
        {showQueue && queue.length > 0 && (
          <QueuePanel
            queue={queue}
            currentTrackId={track?.id}
          />
        )}
      </div>
    </div>
  );
};

export default ThemedPlayer;
