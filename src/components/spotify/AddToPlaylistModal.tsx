import { useState } from 'react';
import { X, Search, Loader2, Check, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpotifyTrack, SpotifyPlaylist } from '@/lib/api/spotify';
import { useSpotifyPlaylists } from '@/hooks/useSpotifyPlaylists';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: SpotifyTrack | null;
  onAdd: (playlistId: string) => void;
  isAdding?: boolean;
}

export function AddToPlaylistModal({ isOpen, onClose, track, onAdd, isAdding }: AddToPlaylistModalProps) {
  const { playlists, isLoading } = useSpotifyPlaylists();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredPlaylists = playlists.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedId) {
      onAdd(selectedId);
    }
  };

  const handleClose = () => {
    setSearch('');
    setSelectedId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && track && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-kiosk-surface rounded-xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-kiosk-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-kiosk-text">Adicionar à Playlist</h2>
                <button
                  onClick={handleClose}
                  className="text-kiosk-text/85 hover:text-kiosk-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Track preview */}
              <div className="flex items-center gap-3 p-2 bg-kiosk-bg/50 rounded-lg">
                {track.albumImageUrl ? (
                  <img
                    src={track.albumImageUrl}
                    alt={track.album}
                    className="w-12 h-12 rounded"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-kiosk-surface flex items-center justify-center">
                    <Music className="w-6 h-6 text-kiosk-text/90" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-kiosk-text truncate">{track.name}</p>
                  <p className="text-sm text-kiosk-text/90 truncate">{track.artist}</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-kiosk-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/90" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar playlist..."
                  className="pl-9 bg-kiosk-bg border-kiosk-border text-kiosk-text"
                />
              </div>
            </div>

            {/* Playlist list */}
            <ScrollArea className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-kiosk-text/90" />
                </div>
              ) : filteredPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-kiosk-text/90">
                  <Music className="w-8 h-8 mb-2" />
                  <p>Nenhuma playlist encontrada</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedId === playlist.id
                          ? 'bg-[#1DB954]/20'
                          : 'hover:bg-kiosk-bg/50'
                      }`}
                      onClick={() => setSelectedId(playlist.id)}
                    >
                      {playlist.imageUrl ? (
                        <img
                          src={playlist.imageUrl}
                          alt={playlist.name}
                          className="w-10 h-10 rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-kiosk-surface flex items-center justify-center">
                          <Music className="w-5 h-5 text-kiosk-text/90" />
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-kiosk-text truncate">{playlist.name}</p>
                        <p className="text-xs text-kiosk-text/90">{playlist.tracksTotal} faixas</p>
                      </div>
                      {selectedId === playlist.id && (
                        <Check className="w-5 h-5 text-[#1DB954]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-kiosk-border">
              <Button
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black"
                disabled={!selectedId || isAdding}
                onClick={handleAdd}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  'Adicionar à Playlist'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
