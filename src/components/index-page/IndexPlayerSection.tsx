import { NowPlaying } from '@/components/player/NowPlaying';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';
import { ProgressBar } from '@/components/player/ProgressBar';
import { PlaybackControls } from '@/components/player/PlaybackControls';
import { PlayerControls } from '@/components/player/PlayerControls';
import { VolumeSlider } from '@/components/player/VolumeSlider';
import { VoiceControlButton } from '@/components/player/VoiceControlButton';
import { CreateJamButton } from '@/components/player/CreateJamButton';
import type { SystemStatus } from '@/lib/api/types';

interface IndexPlayerSectionProps {
  status: SystemStatus | undefined;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
  onSeek: (positionSeconds: number) => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onQueueOpen: () => void;
}

export function IndexPlayerSection({
  status,
  shuffle,
  repeat,
  onSeek,
  onShuffleToggle,
  onRepeatToggle,
  onQueueOpen,
}: IndexPlayerSectionProps) {
  return (
    <main id="main-content" className="flex-1 flex flex-col items-center justify-start pt-4 gap-2 px-4 pb-32 touch-pan-y">
      {/* Centralized container for all player elements */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        {/* Now Playing */}
        <NowPlaying 
          track={status?.track ?? null} 
          isPlaying={status?.playing ?? false} 
        />

        {/* Audio Visualizer */}
        <div className="w-full">
          <AudioVisualizer 
            isPlaying={status?.playing ?? false} 
            barCount={32}
            genre={status?.track?.genre}
          />
        </div>

        {/* Linha divisória sutil */}
        <div className="w-full max-w-[200px] divider-subtle my-2" />

        {/* Progress Bar */}
        <div className="w-full mt-2">
          <ProgressBar
            position={status?.track?.position ?? 0}
            duration={status?.track?.duration ?? 0}
            genre={status?.track?.genre}
            onSeek={onSeek}
          />
        </div>
        
        {/* Playback Controls (shuffle, repeat, queue) */}
        <div className="mt-4">
          <PlaybackControls
            shuffle={shuffle}
            repeat={repeat}
            onShuffleToggle={onShuffleToggle}
            onRepeatToggle={onRepeatToggle}
            onQueueOpen={onQueueOpen}
          />
        </div>

        {/* Player Controls (play/pause/prev/next) */}
        <div className="mt-5">
          <PlayerControls isPlaying={status?.playing ?? false} />
        </div>
        
        {/* Volume Slider + Voice Control */}
        <div className="w-full max-w-[280px] mt-5 flex items-center gap-3">
          <VolumeSlider 
            volume={status?.volume ?? 75} 
            muted={status?.muted ?? false} 
          />
          <VoiceControlButton size="md" showFeedback={true} />
        </div>

        {/* Create JAM Button */}
        <div className="mt-6">
          <CreateJamButton />
        </div>
      </div>
    </main>
  );
}
