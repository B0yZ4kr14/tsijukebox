import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Disc3, User, Loader2 } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from "@/components/ui/themed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackItem } from '@/components/spotify/TrackItem';
import { AlbumCard } from '@/components/spotify/AlbumCard';
import { ArtistCard } from '@/components/spotify/ArtistCard';
import { AddToPlaylistModal } from '@/components/spotify/AddToPlaylistModal';
import { useSpotifyLibrary, useSpotifyPlayer } from '@/hooks';
import { useSettings } from '@/contexts/SettingsContext';
import { SpotifyTrack } from '@/lib/api/spotify';

export default function SpotifyLibraryPage() {
  const { spotify } = useSettings();
  const { 
    likedTracks, 
    likedTracksTotal,
    albums, 
    artists, 
    isLoading, 
    isConnected,
    unlikeTrack,
  } = useSpotifyLibrary();
  const { playTrack, playAlbum, playArtist } = useSpotifyPlayer();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  if (!isConnected) {
    return (
      <KioskLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-[#1DB954]" />
            </div>
            <h1 className="text-2xl font-bold text-kiosk-text">Conecte-se ao Spotify</h1>
            <p className="text-kiosk-text/85">
              Para acessar sua biblioteca, conecte sua conta do Spotify.
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

  return (
    <KioskLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-kiosk-bg/95 backdrop-blur-md border-b border-kiosk-border">
          <div className="flex items-center gap-4 p-4">
            <Link to="/spotify">
              <Button variant="ghost" size="xs" className="text-kiosk-text" aria-label="Voltar ao Spotify">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#1DB954]" />
              <h1 className="text-xl font-bold text-kiosk-text">Sua Biblioteca</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
            </div>
          ) : (
            <Tabs defaultValue="liked">
              <TabsList className="bg-kiosk-surface/50 mb-6">
                <TabsTrigger value="liked" className="data-[state=active]:bg-kiosk-surface">
                  <Heart className="w-4 h-4 mr-1" /> Curtidas ({likedTracksTotal})
                </TabsTrigger>
                <TabsTrigger value="albums" className="data-[state=active]:bg-kiosk-surface">
                  <Disc3 className="w-4 h-4 mr-1" /> Álbuns ({albums.length})
                </TabsTrigger>
                <TabsTrigger value="artists" className="data-[state=active]:bg-kiosk-surface">
                  <User className="w-4 h-4 mr-1" /> Artistas ({artists.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="liked">
                {/* Liked songs header */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-600/30 to-purple-800/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-kiosk-text">Músicas Curtidas</h2>
                    <p className="text-kiosk-text/85">{likedTracksTotal} músicas</p>
                  </div>
                </div>

                {likedTracks.length === 0 ? (
                  <div className="text-center py-12 bg-kiosk-surface/30 rounded-lg">
                  <Heart className="w-12 h-12 text-kiosk-text/85 mx-auto mb-4" />
                  <p className="text-kiosk-text/85">Você ainda não curtiu nenhuma música</p>
                  </div>
                ) : (
                  <div className="bg-kiosk-surface/30 rounded-lg overflow-hidden">
                    {likedTracks.map((track, index) => (
                      <TrackItem
                        key={track.id}
                        track={track}
                        index={index}
                        isLiked={true}
                        onPlay={() => playTrack(track.uri)}
                        onLike={() => unlikeTrack(track.id)}
                        onAddToPlaylist={() => { setSelectedTrack(track); setShowAddModal(true); }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="albums">
                {albums.length === 0 ? (
                  <div className="text-center py-12 bg-kiosk-surface/30 rounded-lg">
                    <Disc3 className="w-12 h-12 text-kiosk-text/80 mx-auto mb-4" />
                    <p className="text-kiosk-text/85">Você ainda não salvou nenhum álbum</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {albums.map((album) => (
                      <AlbumCard key={album.id} album={album} onPlay={() => playAlbum(album.uri)} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="artists">
                {artists.length === 0 ? (
                  <div className="text-center py-12 bg-kiosk-surface/30 rounded-lg">
                    <User className="w-12 h-12 text-kiosk-text/80 mx-auto mb-4" />
                    <p className="text-kiosk-text/85">Você ainda não segue nenhum artista</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {artists.map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} onPlay={() => playArtist(artist.uri)} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <AddToPlaylistModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setSelectedTrack(null); }}
          track={selectedTrack}
          onAdd={() => { setShowAddModal(false); setSelectedTrack(null); }}
        />
      </div>
    </KioskLayout>
  );
}
