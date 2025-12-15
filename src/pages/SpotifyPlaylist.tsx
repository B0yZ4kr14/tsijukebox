import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Shuffle, Clock, MoreHorizontal, Loader2, Music, Heart } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { TrackItem } from '@/components/spotify/TrackItem';
import { AddToPlaylistModal } from '@/components/spotify/AddToPlaylistModal';
import { useSpotifyPlaylist } from '@/hooks/useSpotifyPlaylists';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useSpotifyLibrary } from '@/hooks/useSpotifyLibrary';
import { SpotifyTrack } from '@/lib/api/spotify';

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min`;
}

export default function SpotifyPlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlist, tracks, isLoading, addTracks } = useSpotifyPlaylist(id);
  const { playTrack, playPlaylist } = useSpotifyPlayer();
  const { likeTrack, unlikeTrack } = useSpotifyLibrary();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  const totalDuration = tracks.reduce((acc, track) => acc + track.durationMs, 0);

  if (isLoading) {
    return (
      <KioskLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        </div>
      </KioskLayout>
    );
  }

  if (!playlist) {
    return (
      <KioskLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <Music className="w-16 h-16 text-kiosk-text/30 mb-4" />
          <h1 className="text-xl font-bold text-kiosk-text mb-2">Playlist não encontrada</h1>
          <p className="text-kiosk-text/60 mb-4">A playlist pode ter sido removida ou você não tem acesso.</p>
          <Link to="/spotify">
            <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-black">
              Voltar ao Spotify
            </Button>
          </Link>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="min-h-screen">
        {/* Hero Header */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Background gradient */}
          <div 
            className="absolute inset-0 h-80"
            style={{
              background: `linear-gradient(180deg, rgba(29, 185, 84, 0.3) 0%, transparent 100%)`,
            }}
          />

          {/* Content */}
          <div className="relative p-6">
            {/* Back button */}
            <Link to="/spotify">
              <Button variant="ghost" size="icon" className="text-kiosk-text mb-4">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>

            {/* Playlist info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
              {/* Cover */}
              <motion.div
                className="w-48 h-48 md:w-56 md:h-56 rounded-lg overflow-hidden shadow-2xl bg-kiosk-surface flex-shrink-0"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {playlist.imageUrl ? (
                  <img
                    src={playlist.imageUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-20 h-20 text-kiosk-text/30" />
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-sm text-kiosk-text/60 uppercase tracking-wider mb-1">Playlist</p>
                <h1 className="text-3xl md:text-5xl font-bold text-kiosk-text mb-4">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-kiosk-text/60 mb-2 line-clamp-2">{playlist.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-kiosk-text/60">
                  <span className="font-semibold text-kiosk-text">{playlist.owner}</span>
                  <span>•</span>
                  <span>{tracks.length} músicas</span>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playPlaylist(`spotify:playlist:${playlist.id}`)}
              >
                <Play className="w-6 h-6 text-black fill-black ml-1" />
              </motion.button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-kiosk-text/60 hover:text-kiosk-text"
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-kiosk-text/60 hover:text-kiosk-text"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-kiosk-text/60 hover:text-kiosk-text"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Track list header */}
        <div className="sticky top-0 z-30 bg-kiosk-bg/95 backdrop-blur-md border-b border-kiosk-border">
          <div className="flex items-center gap-4 px-4 py-2 text-sm text-kiosk-text/60">
            <span className="w-8 text-center">#</span>
            <span className="w-10" /> {/* Image space */}
            <span className="flex-1">Título</span>
            <span className="hidden md:block flex-1">Álbum</span>
            <span className="w-24" /> {/* Actions space */}
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Tracks */}
        <div className="p-4">
          {tracks.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-kiosk-text/30 mx-auto mb-4" />
              <p className="text-kiosk-text/60">Esta playlist está vazia</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <TrackItem
                  key={`${track.id}-${index}`}
                  track={track}
                  index={index}
                  onPlay={() => playTrack(track.uri)}
                  onLike={() => track.isLiked ? unlikeTrack(track.id) : likeTrack(track.id)}
                  isLiked={track.isLiked}
                  onAddToPlaylist={() => {
                    setSelectedTrack(track);
                    setShowAddModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add to Playlist Modal */}
        <AddToPlaylistModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTrack(null);
          }}
          track={selectedTrack}
          onAdd={(playlistId) => {
            if (selectedTrack) {
              addTracks([selectedTrack.uri]);
              setShowAddModal(false);
              setSelectedTrack(null);
            }
          }}
        />
      </div>
    </KioskLayout>
  );
}
