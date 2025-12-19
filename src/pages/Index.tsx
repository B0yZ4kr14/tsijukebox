import { KioskLayout } from '@/components/layout/KioskLayout';
import { SkipLink } from '@/components/ui/SkipLink';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIndexPage } from '@/hooks/pages/useIndexPage';
import { VoiceControlButton } from '@/components/player/VoiceControlButton';
import { 
  IndexHeader, 
  IndexPlayerSection, 
  IndexLoadingState, 
  IndexErrorState, 
  IndexPanels 
} from '@/components/index-page';

export default function Index() {
  const {
    status,
    isLoading,
    error,
    connectionType,
    swipeDirection,
    showQueue,
    showSpotifyPanel,
    showLibraryPanel,
    showSideInfoPanel,
    showTour,
    tourSteps,
    isOnline,
    isFirstAccess,
    spotify,
    shuffle,
    repeat,
    queue,
    canInstall,
    setShowQueue,
    setShowSpotifyPanel,
    setShowLibraryPanel,
    setShowSideInfoPanel,
    setShowTour,
    handleInstall,
    handleSeek,
    handleSpotifyToggle,
    handlePlayQueueItem,
    toggleShuffle,
    toggleRepeat,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    touchHandlers,
    t,
  } = useIndexPage();

  // Loading state
  if (isLoading && !status) {
    return <IndexLoadingState message={t('notifications.connecting')} />;
  }

  // Error state
  if (error) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://midiaserver.local/api';
    const isDev = import.meta.env.DEV;
    
    return (
      <IndexErrorState 
        apiUrl={apiUrl}
        isDev={isDev}
        errorMessage={t('notifications.connectionError')}
        enableDemoModeText={t('notifications.enableDemoMode')}
        settingsText={t('settings.title')}
      />
    );
  }

  return (
    <KioskLayout>
      <SkipLink />
      <div 
        className="h-screen flex flex-col relative"
        {...touchHandlers}
      >
        {/* Swipe Indicators */}
        {swipeDirection && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-200 ${
              swipeDirection === 'left' ? 'right-8' : 'left-8'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-kiosk-primary/20 flex items-center justify-center backdrop-blur-sm">
              {swipeDirection === 'left' ? (
                <ChevronRight className="w-10 h-10 text-kiosk-primary" />
              ) : (
                <ChevronLeft className="w-10 h-10 text-kiosk-primary" />
              )}
            </div>
          </div>
        )}

        <IndexHeader 
          status={status}
          connectionType={connectionType}
          isOnline={isOnline}
          isSpotifyConnected={spotify.isConnected}
          showSideInfoPanel={showSideInfoPanel}
          showSpotifyPanel={showSpotifyPanel}
          showLibraryPanel={showLibraryPanel}
          canInstall={canInstall}
          onSideInfoToggle={() => setShowSideInfoPanel(!showSideInfoPanel)}
          onSpotifyToggle={handleSpotifyToggle}
          onLibraryToggle={() => setShowLibraryPanel(!showLibraryPanel)}
          onInstall={handleInstall}
        />

        <IndexPlayerSection 
          status={status}
          shuffle={shuffle}
          repeat={repeat}
          onSeek={handleSeek}
          onShuffleToggle={toggleShuffle}
          onRepeatToggle={toggleRepeat}
          onQueueOpen={() => setShowQueue(true)}
        />

        <IndexPanels 
          status={status}
          queue={queue ?? null}
          showQueue={showQueue}
          showSpotifyPanel={showSpotifyPanel}
          showSideInfoPanel={showSideInfoPanel}
          showLibraryPanel={showLibraryPanel}
          showTour={showTour}
          tourSteps={tourSteps}
          isFirstAccess={isFirstAccess}
          onCloseQueue={() => setShowQueue(false)}
          onCloseSpotify={() => setShowSpotifyPanel(false)}
          onCloseSideInfo={() => setShowSideInfoPanel(false)}
          onCloseLibrary={() => setShowLibraryPanel(false)}
          onCloseTour={() => setShowTour(false)}
          onPlayItem={handlePlayQueueItem}
          onRemoveItem={(id) => removeFromQueue(id)}
          onClearQueue={() => clearQueue()}
          onReorderQueue={reorderQueue}
        />

        {/* Floating Voice Control Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <VoiceControlButton size="lg" showFeedback={true} />
        </div>
      </div>
    </KioskLayout>
  );
}
