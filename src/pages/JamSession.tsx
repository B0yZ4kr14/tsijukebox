import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { JamProvider, useJam } from '@/contexts/JamContext';
import { JamHeader } from '@/components/jam/JamHeader';
import { JamPlayer } from '@/components/jam/JamPlayer';
import { JamReactions } from '@/components/jam/JamReactions';
import { JamParticipantsList } from '@/components/jam/JamParticipantsList';
import { JamQueue } from '@/components/jam/JamQueue';
import { JamNicknameModal } from '@/components/jam/JamNicknameModal';
import { JamInviteModal } from '@/components/jam/JamInviteModal';
import { JamAddTrackModal } from '@/components/jam/JamAddTrackModal';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function JamSessionContent() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    session,
    isHost,
    isConnected,
    isLoading,
    error,
    participantId,
    participants,
    participantCount,
    queue,
    joinSession,
    leaveSession,
    updatePlaybackState,
    updateCurrentTrack,
    addToQueue,
    voteTrack,
    removeFromQueue,
    markAsPlayed,
  } = useJam();

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Show nickname modal if not connected
  useEffect(() => {
    if (code && !isConnected && !isLoading) {
      setShowNicknameModal(true);
    }
  }, [code, isConnected, isLoading]);

  const handleJoin = async (nickname: string) => {
    if (!code) return false;
    setIsJoining(true);
    const success = await joinSession(code, nickname);
    setIsJoining(false);
    if (success) {
      setShowNicknameModal(false);
    }
    return success;
  };

  const handleLeave = async () => {
    await leaveSession();
    toast.success(isHost ? 'Sessão encerrada' : 'Você saiu da sessão');
    navigate('/');
  };

  const handlePlay = () => updatePlaybackState({ is_playing: true });
  const handlePause = () => updatePlaybackState({ is_playing: false });
  const handleSeek = (positionMs: number) => updatePlaybackState({ position_ms: positionMs });
  
  const handleSkip = async () => {
    const nextTrack = queue[0];
    if (nextTrack) {
      await markAsPlayed(nextTrack.id);
      await updateCurrentTrack({
        track_id: nextTrack.track_id,
        track_name: nextTrack.track_name,
        artist_name: nextTrack.artist_name,
        album_art: nextTrack.album_art,
        duration_ms: nextTrack.duration_ms || 0,
      });
    } else {
      await updateCurrentTrack(null);
    }
  };

  const handlePlayFromQueue = async (item: typeof queue[0]) => {
    await markAsPlayed(item.id);
    await updateCurrentTrack({
      track_id: item.track_id,
      track_name: item.track_name,
      artist_name: item.artist_name,
      album_art: item.album_art,
      duration_ms: item.duration_ms || 0,
    });
  };

  // Loading state
  if (isLoading && !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not connected - show nickname modal
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <JamNicknameModal
          open={showNicknameModal}
          onOpenChange={(open) => {
            setShowNicknameModal(open);
            if (!open) navigate('/');
          }}
          sessionCode={code || ''}
          onJoin={handleJoin}
          isLoading={isJoining}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Erro</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <JamHeader
        sessionName={session?.name || 'JAM Session'}
        sessionCode={session?.code || code || ''}
        participantCount={participantCount}
        isHost={isHost}
        onLeave={handleLeave}
        onShare={() => setShowInviteModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Player & Queue */}
        <div className="lg:col-span-2 space-y-4">
          <JamPlayer
            currentTrack={session?.current_track || null}
            playbackState={session?.playback_state || { is_playing: false, position_ms: 0 }}
            isHost={isHost}
            onPlay={handlePlay}
            onPause={handlePause}
            onSkip={handleSkip}
            onSeek={handleSeek}
          />

          {/* Reactions System */}
          <JamReactions trackId={session?.current_track?.track_id} />

          <JamQueue
            queue={queue}
            isHost={isHost}
            currentParticipantId={participantId}
            onVote={voteTrack}
            onRemove={removeFromQueue}
            onPlay={handlePlayFromQueue}
            onAddTrack={() => setShowAddTrackModal(true)}
          />
        </div>

        {/* Right Column - Participants */}
        <div>
          <JamParticipantsList
            participants={participants}
            currentParticipantId={participantId}
          />
        </div>
      </main>

      {/* Modals */}
      <JamInviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        sessionCode={session?.code || ''}
        sessionName={session?.name || ''}
      />

      <JamAddTrackModal
        open={showAddTrackModal}
        onOpenChange={setShowAddTrackModal}
        onAddTrack={addToQueue}
      />
    </div>
  );
}

export default function JamSession() {
  return (
    <JamProvider>
      <JamSessionContent />
    </JamProvider>
  );
}
