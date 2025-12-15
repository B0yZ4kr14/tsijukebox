import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Heart, Clock, TrendingUp, Loader2, Music, Disc3 } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { PlaylistCard } from '@/components/spotify/PlaylistCard';
import { TrackItem } from '@/components/spotify/TrackItem';
import { CreatePlaylistModal } from '@/components/spotify/CreatePlaylistModal';
import { useSpotifyPlaylists } from '@/hooks/useSpotifyPlaylists';
import { useSpotifyLibrary } from '@/hooks/useSpotifyLibrary';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useSettings } from '@/contexts/SettingsContext';

export default function SpotifyBrowser() {
  const navigate = useNavigate();
  const { spotify } = useSettings();
  const { playlists, isLoading: playlistsLoading, createPlaylist, isCreating } = useSpotifyPlaylists();
  const { recentlyPlayed, topTracks, likedTracksTotal, isLoading: libraryLoading } = useSpotifyLibrary();
  const { playTrack, playPlaylist } = useSpotifyPlayer();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isConnected = spotify.isConnected;

  if (!isConnected) {
    return (
      <KioskLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto">
              <Disc3 className="w-10 h-10 text-[#1DB954]" />
            </div>
            <h1 className="text-2xl font-bold text-kiosk-text">Conecte-se ao Spotify</h1>
            <p className="text-kiosk-text/60">
              Para acessar suas playlists, músicas curtidas e recomendações, conecte sua conta do Spotify.
            </p>
            <Link to="/settings">
              <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-black">
                Ir para Configurações
              </Button>
            </Link>
          </div>
        </div>
      </KioskLayout>
    );
  }

  const isLoading = playlistsLoading || libraryLoading;

  return (
    <KioskLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-kiosk-bg/95 backdrop-blur-md border-b border-kiosk-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-kiosk-text">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Disc3 className="w-6 h-6 text-[#1DB954]" />
                <h1 className="text-xl font-bold text-kiosk-text">Spotify</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/spotify/search">
                <Button variant="ghost" size="icon" className="text-kiosk-text">
                  <Search className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Playlist
              </Button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
          </div>
        ) : (
          <div className="space-y-8 p-4">
            {/* Quick Access */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <Link to="/spotify/library">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/30 to-purple-800/30 rounded-lg hover:from-purple-600/40 hover:to-purple-800/40 transition-colors">
                    <Heart className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="font-semibold text-kiosk-text">Curtidas</p>
                      <p className="text-xs text-kiosk-text/60">{likedTracksTotal} músicas</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-lg cursor-pointer">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="font-semibold text-kiosk-text">Recentes</p>
                    <p className="text-xs text-kiosk-text/60">{recentlyPlayed.length} músicas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600/30 to-green-800/30 rounded-lg cursor-pointer">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="font-semibold text-kiosk-text">Top Músicas</p>
                    <p className="text-xs text-kiosk-text/60">{topTracks.length} músicas</p>
                  </div>
                </div>
                <Link to="/spotify/search">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-600/30 to-orange-800/30 rounded-lg hover:from-orange-600/40 hover:to-orange-800/40 transition-colors">
                    <Search className="w-6 h-6 text-orange-400" />
                    <div>
                      <p className="font-semibold text-kiosk-text">Buscar</p>
                      <p className="text-xs text-kiosk-text/60">Músicas e mais</p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>

            {/* Playlists */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-kiosk-text">Suas Playlists</h2>
                <span className="text-sm text-kiosk-text/60">{playlists.length} playlists</span>
              </div>
              {playlists.length === 0 ? (
                <div className="text-center py-12 bg-kiosk-surface/30 rounded-lg">
                  <Music className="w-12 h-12 text-kiosk-text/30 mx-auto mb-4" />
                  <p className="text-kiosk-text/60 mb-4">Você ainda não tem playlists</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Playlist
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {playlists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onClick={() => navigate(`/spotify/playlist/${playlist.id}`)}
                      onPlay={() => playPlaylist(`spotify:playlist:${playlist.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-kiosk-text mb-4">Tocadas Recentemente</h2>
                <div className="bg-kiosk-surface/30 rounded-lg overflow-hidden">
                  {recentlyPlayed.slice(0, 5).map((track, index) => (
                    <TrackItem
                      key={`${track.id}-${index}`}
                      track={track}
                      index={index}
                      onPlay={() => playTrack(track.uri)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Top Tracks */}
            {topTracks.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-kiosk-text mb-4">Suas Top Músicas</h2>
                <div className="bg-kiosk-surface/30 rounded-lg overflow-hidden">
                  {topTracks.slice(0, 5).map((track, index) => (
                    <TrackItem
                      key={track.id}
                      track={track}
                      index={index}
                      onPlay={() => playTrack(track.uri)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Create Playlist Modal */}
        <CreatePlaylistModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={(params) => {
            createPlaylist(params);
            setShowCreateModal(false);
          }}
          isCreating={isCreating}
        />
      </div>
    </KioskLayout>
  );
}
