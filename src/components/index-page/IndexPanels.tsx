import { QueuePanel } from '@/components/player/QueuePanel';
import { SpotifyPanel } from '@/components/spotify/SpotifyPanel';
import { SideInfoPanel } from '@/components/player/SideInfoPanel';
import { LibraryPanel } from '@/components/player/LibraryPanel';
import { CommandDeck } from '@/components/player/CommandDeck';
import { GuidedTour, type TourStep } from '@/components/tour/GuidedTour';
import type { SystemStatus, PlaybackQueue } from '@/lib/api/types';

interface IndexPanelsProps {
  status: SystemStatus | undefined;
  queue: PlaybackQueue | null;
  showQueue: boolean;
  showSpotifyPanel: boolean;
  showSideInfoPanel: boolean;
  showLibraryPanel: boolean;
  showTour: boolean;
  tourSteps: TourStep[];
  isFirstAccess: boolean;
  onCloseQueue: () => void;
  onCloseSpotify: () => void;
  onCloseSideInfo: () => void;
  onCloseLibrary: () => void;
  onCloseTour: () => void;
  onPlayItem: (uri: string) => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onReorderQueue: (fromIndex: number, toIndex: number) => void;
}

export function IndexPanels({
  status,
  queue,
  showQueue,
  showSpotifyPanel,
  showSideInfoPanel,
  showLibraryPanel,
  showTour,
  tourSteps,
  isFirstAccess,
  onCloseQueue,
  onCloseSpotify,
  onCloseSideInfo,
  onCloseLibrary,
  onCloseTour,
  onPlayItem,
  onRemoveItem,
  onClearQueue,
  onReorderQueue,
}: IndexPanelsProps) {
  return (
    <>
      {/* Command Deck */}
      <CommandDeck />

      {/* Queue Panel */}
      <QueuePanel
        isOpen={showQueue}
        onClose={onCloseQueue}
        queue={queue}
        onPlayItem={onPlayItem}
        onRemoveItem={onRemoveItem}
        onClearQueue={onClearQueue}
        onReorderQueue={onReorderQueue}
      />

      {/* Spotify Panel */}
      <SpotifyPanel
        isOpen={showSpotifyPanel}
        onClose={onCloseSpotify}
        currentTrackId={status?.track?.id}
        currentAlbumId={status?.track?.albumId}
      />

      {/* Side Info Panel - Left (Queue, Lyrics, Info) */}
      <SideInfoPanel
        isOpen={showSideInfoPanel}
        onClose={onCloseSideInfo}
        currentTrack={status?.track ? {
          id: status.track.id,
          title: status.track.title,
          artist: status.track.artist,
          album: status.track.album,
          albumId: status.track.albumId,
          cover: status.track.cover ?? undefined,
          duration: status.track.duration,
          position: status.track.position,
          genre: status.track.genre,
        } : null}
        queue={queue}
        onPlayItem={onPlayItem}
        onRemoveItem={onRemoveItem}
        isPlaying={status?.playing}
      />

      {/* Library Panel - Right (Playlists, Search, Albums, Artists) */}
      <LibraryPanel
        isOpen={showLibraryPanel}
        onClose={onCloseLibrary}
      />

      {/* Guided Tour for new users */}
      <GuidedTour
        steps={tourSteps}
        isOpen={showTour && !isFirstAccess}
        onClose={onCloseTour}
        onComplete={onCloseTour}
      />
    </>
  );
}
