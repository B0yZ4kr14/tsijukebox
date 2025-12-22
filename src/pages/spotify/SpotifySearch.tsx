import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Loader2, Music, Disc3, User, ListMusic } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackItem } from '@/components/spotify/TrackItem';
import { AlbumCard } from '@/components/spotify/AlbumCard';
import { ArtistCard } from '@/components/spotify/ArtistCard';
import { PlaylistCard } from '@/components/spotify/PlaylistCard';
import { AddToPlaylistModal } from '@/components/spotify/AddToPlaylistModal';
import { useSpotifySearch, useSpotifyPlayer, useSpotifyLibrary } from '@/hooks';
import { SpotifyTrack } from '@/lib/api/spotify';

export default function SpotifySearchPage() {
  const navigate = useNavigate();
  const { query, setQuery, results, hasResults, isSearching, clearSearch, isConnected } = useSpotifySearch();
  const { playTrack, playAlbum, playArtist, playPlaylist } = useSpotifyPlayer();
  const { likeTrack } = useSpotifyLibrary();
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  if (!isConnected) {
    return (
      <KioskLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#1DB954]/20 flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-[#1DB954]" />
            </div>
            <h1 className="text-2xl font-bold text-kiosk-text">Conecte-se ao Spotify</h1>
            <p className="text-kiosk-text/90">
              Para buscar músicas, álbuns e artistas, conecte sua conta do Spotify.
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
        <header className="sticky top-0 z-40 bg-kiosk-bg/95 backdrop-blur-md border-b border-kiosk-border p-4">
          <div className="flex items-center gap-4">
            <Link to="/spotify">
              <Button variant="ghost" size="icon" className="text-kiosk-text" aria-label="Voltar ao Spotify">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-text/90" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você quer ouvir?"
                className="pl-10 pr-10 h-12 bg-kiosk-surface border-none text-kiosk-text text-lg"
                autoFocus
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kiosk-text/90 hover:text-kiosk-text"
                  aria-label="Limpar busca"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
            </div>
          )}

          {!isSearching && !hasResults && query.length >= 2 && (
            <div className="text-center py-12">
              {/* WCAG Exception: /30 decorative Music icon for empty search state */}
              <Music className="w-12 h-12 text-kiosk-text/30 mx-auto mb-4" />
              <p className="text-kiosk-text/85">Nenhum resultado para "{query}"</p>
            </div>
          )}

          {!isSearching && !query && (
            <div className="text-center py-12">
              {/* WCAG Exception: /30 decorative Search icon for initial state */}
              <Search className="w-12 h-12 text-kiosk-text/30 mx-auto mb-4" />
              <p className="text-kiosk-text/85">Busque por músicas, álbuns, artistas ou playlists</p>
            </div>
          )}

          {hasResults && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-kiosk-surface/50 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-kiosk-surface">Todos</TabsTrigger>
                <TabsTrigger value="tracks" className="data-[state=active]:bg-kiosk-surface">
                  <Music className="w-4 h-4 mr-1" /> Músicas
                </TabsTrigger>
                <TabsTrigger value="albums" className="data-[state=active]:bg-kiosk-surface">
                  <Disc3 className="w-4 h-4 mr-1" /> Álbuns
                </TabsTrigger>
                <TabsTrigger value="artists" className="data-[state=active]:bg-kiosk-surface">
                  <User className="w-4 h-4 mr-1" /> Artistas
                </TabsTrigger>
                <TabsTrigger value="playlists" className="data-[state=active]:bg-kiosk-surface">
                  <ListMusic className="w-4 h-4 mr-1" /> Playlists
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {results.tracks[0] && (
                  <section>
                    <h2 className="text-lg font-bold text-kiosk-text mb-4">Melhor Resultado</h2>
                    <div
                      className="p-5 bg-kiosk-surface/50 rounded-lg hover:bg-kiosk-surface transition-colors cursor-pointer"
                      onClick={() => playTrack(results.tracks[0].uri)}
                    >
                      <img
                        src={results.tracks[0].albumImageUrl || ''}
                        alt={results.tracks[0].album}
                        className="w-24 h-24 rounded-lg mb-4 shadow-lg"
                      />
                      <h3 className="text-2xl font-bold text-kiosk-text mb-1">{results.tracks[0].name}</h3>
                      <p className="text-kiosk-text/90">{results.tracks[0].artist} • Música</p>
                    </div>
                  </section>
                )}

                {results.tracks.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-kiosk-text mb-4">Músicas</h2>
                    <div className="bg-kiosk-surface/30 rounded-lg overflow-hidden">
                      {results.tracks.slice(0, 4).map((track) => (
                        <TrackItem
                          key={track.id}
                          track={track}
                          onPlay={() => playTrack(track.uri)}
                          onLike={() => likeTrack(track.id)}
                          onAddToPlaylist={() => { setSelectedTrack(track); setShowAddModal(true); }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {results.artists.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-kiosk-text mb-4">Artistas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.artists.slice(0, 6).map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} onPlay={() => playArtist(artist.uri)} />
                      ))}
                    </div>
                  </section>
                )}

                {results.albums.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-kiosk-text mb-4">Álbuns</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.albums.slice(0, 6).map((album) => (
                        <AlbumCard key={album.id} album={album} onPlay={() => playAlbum(album.uri)} />
                      ))}
                    </div>
                  </section>
                )}

                {results.playlists.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-kiosk-text mb-4">Playlists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.playlists.slice(0, 6).map((playlist) => (
                        <PlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onClick={() => navigate(`/spotify/playlist/${playlist.id}`)}
                          onPlay={() => playPlaylist(`spotify:playlist:${playlist.id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="tracks">
                <div className="bg-kiosk-surface/30 rounded-lg overflow-hidden">
                  {results.tracks.map((track, index) => (
                    <TrackItem
                      key={track.id}
                      track={track}
                      index={index}
                      onPlay={() => playTrack(track.uri)}
                      onLike={() => likeTrack(track.id)}
                      onAddToPlaylist={() => { setSelectedTrack(track); setShowAddModal(true); }}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="albums">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.albums.map((album) => (
                    <AlbumCard key={album.id} album={album} onPlay={() => playAlbum(album.uri)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="artists">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} onPlay={() => playArtist(artist.uri)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="playlists">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.playlists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onClick={() => navigate(`/spotify/playlist/${playlist.id}`)}
                      onPlay={() => playPlaylist(`spotify:playlist:${playlist.id}`)}
                    />
                  ))}
                </div>
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
