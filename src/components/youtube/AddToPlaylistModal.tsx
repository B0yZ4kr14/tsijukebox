import { useState } from 'react';
import { X, Plus, Music, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { YouTubeMusicPlaylist, YouTubeMusicTrack } from '@/lib/api/youtubeMusic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: YouTubeMusicTrack | null;
  playlists: YouTubeMusicPlaylist[];
  onAddToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  onCreatePlaylist: (title: string, description?: string) => Promise<YouTubeMusicPlaylist>;
}

export function AddToPlaylistModal({
  isOpen,
  onClose,
  track,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
}: AddToPlaylistModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTo, setAddedTo] = useState<string[]>([]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!track) return;
    
    setIsLoading(true);
    try {
      await onAddToPlaylist(playlistId, track.videoId);
      setAddedTo(prev => [...prev, playlistId]);
      toast.success('Adicionado à playlist');
    } catch (error) {
      toast.error('Erro ao adicionar à playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      toast.error('Digite um nome para a playlist');
      return;
    }

    setIsLoading(true);
    try {
      const newPlaylist = await onCreatePlaylist(newPlaylistTitle, newPlaylistDescription || undefined);
      if (track) {
        await onAddToPlaylist(newPlaylist.id, track.videoId);
        setAddedTo(prev => [...prev, newPlaylist.id]);
      }
      toast.success('Playlist criada e música adicionada');
      setIsCreating(false);
      setNewPlaylistTitle('');
      setNewPlaylistDescription('');
    } catch (error) {
      toast.error('Erro ao criar playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsCreating(false);
    setNewPlaylistTitle('');
    setNewPlaylistDescription('');
    setAddedTo([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-kiosk-surface border-kiosk-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-kiosk-text flex items-center gap-2">
            <Music className="w-5 h-5 text-[#FF0000]" />
            Adicionar à Playlist
          </DialogTitle>
          {track && (
            <DialogDescription className="text-kiosk-text/85">
              {track.title} - {track.artist}
            </DialogDescription>
          )}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-kiosk-text">Nome da Playlist</Label>
                <Input
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Minha Nova Playlist"
                  className="bg-kiosk-background border-kiosk-border text-kiosk-text"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kiosk-text">Descrição (opcional)</Label>
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Descrição da playlist..."
                  className="bg-kiosk-background border-kiosk-border text-kiosk-text"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="kiosk-outline"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  className="flex-1 bg-[#FF0000] hover:bg-[#FF0000]/90"
                  disabled={isLoading || !newPlaylistTitle.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Criar e Adicionar'
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Button
                variant="kiosk-outline"
                onClick={() => setIsCreating(true)}
                className="w-full mb-4 border-dashed border-[#FF0000]/50 text-[#FF0000] hover:bg-[#FF0000]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Playlist
              </Button>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {playlists.length === 0 ? (
                    <p className="text-center text-kiosk-text/85 py-8">
                      Nenhuma playlist encontrada
                    </p>
                  ) : (
                    playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        disabled={isLoading || addedTo.includes(playlist.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                          addedTo.includes(playlist.id)
                            ? "bg-[#FF0000]/10 border border-[#FF0000]/30"
                            : "hover:bg-kiosk-background/50"
                        )}
                      >
                        <div className="w-12 h-12 rounded overflow-hidden bg-kiosk-background flex-shrink-0">
                          {playlist.thumbnailUrl ? (
                            <img
                              src={playlist.thumbnailUrl}
                              alt={playlist.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-6 h-6 text-[#FF0000]/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-kiosk-text truncate">
                            {playlist.title}
                          </p>
                          <p className="text-sm text-kiosk-text/85">
                            {playlist.trackCount} faixas
                          </p>
                        </div>
                        {addedTo.includes(playlist.id) ? (
                          <Check className="w-5 h-5 text-[#FF0000] flex-shrink-0" />
                        ) : isLoading ? (
                          <Loader2 className="w-5 h-5 text-kiosk-text/30 animate-spin flex-shrink-0" />
                        ) : (
                          <Plus className="w-5 h-5 text-kiosk-text/30 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
