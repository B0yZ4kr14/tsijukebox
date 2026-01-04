import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ListMusic, Mic2, Info, Music, Disc3, User2, 
  Calendar, Clock, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks';
import { LyricsDisplay } from './LyricsDisplay';
import { QueueItem, PlaybackQueue } from '@/lib/api/types';

interface SideInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack?: {
    id?: string;
    title?: string;
    artist?: string;
    album?: string;
    albumId?: string;
    cover?: string;
    duration?: number;
    position?: number;
    genre?: string;
    year?: number;
  } | null;
  queue?: PlaybackQueue | null;
  onPlayItem?: (uri: string) => void;
  onRemoveItem?: (id: string) => void;
  isPlaying?: boolean;
}

export function SideInfoPanel({ 
  isOpen, 
  onClose, 
  currentTrack,
  queue,
  onPlayItem,
  onRemoveItem,
  isPlaying
}: SideInfoPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('queue');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 bottom-0 w-80 lg:w-96 z-40 bg-kiosk-bg/95 backdrop-blur-xl border-r border-cyan-500/20 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <h2 className="text-lg font-bold text-gold-neon flex items-center gap-2">
              <Info className="w-5 h-5 icon-neon-blue" />
              Informações
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 text-kiosk-text/80 hover:text-kiosk-text"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 gap-1 mx-4 mt-2 bg-kiosk-surface/30">
              <TabsTrigger value="queue" className="text-xs data-[state=active]:bg-primary/20">
                <ListMusic className="w-3 h-3 mr-1" />
                Fila
              </TabsTrigger>
              <TabsTrigger value="lyrics" className="text-xs data-[state=active]:bg-primary/20">
                <Mic2 className="w-3 h-3 mr-1" />
                Letras
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs data-[state=active]:bg-primary/20">
                <Info className="w-3 h-3 mr-1" />
                Info
              </TabsTrigger>
            </TabsList>

            {/* Queue Tab */}
            <TabsContent value="queue" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Now Playing Mini */}
                  {currentTrack && (
                    <div className="p-3 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20">
                      <p className="text-xs text-description-visible uppercase tracking-wider mb-2 font-semibold">Tocando Agora</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          {currentTrack.cover ? (
                            <img src={currentTrack.cover} alt={currentTrack.album} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                              <Music className="w-5 h-5 text-kiosk-text/80" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-kiosk-text truncate">{currentTrack.title}</p>
                          <p className="text-sm text-description-visible truncate">{currentTrack.artist}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Up */}
                  <div>
                    <p className="text-xs text-description-visible uppercase tracking-wider mb-3 font-semibold">
                      Próximas ({queue?.next.length || 0})
                    </p>
                    {!queue || queue.next.length === 0 ? (
                      <div className="text-center py-8 text-kiosk-text/80">
                        <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">A fila está vazia</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {queue.next.slice(0, 10).map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors group"
                          >
                            <span className="w-5 text-center text-xs text-kiosk-text/80">{index + 1}</span>
                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              {item.cover ? (
                                <img src={item.cover} alt={item.album} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                                  <Music className="w-4 h-4 text-kiosk-text/80" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-kiosk-text truncate">{item.title}</p>
                              <p className="text-xs text-kiosk-text/80 truncate">{item.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* History */}
                  {queue && queue.history.length > 0 && (
                    <div className="opacity-70">
                      <p className="text-xs text-description-visible uppercase tracking-wider mb-3 font-semibold">Histórico</p>
                      <div className="space-y-2">
                        {queue.history.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/30 transition-colors"
                          >
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              {item.cover ? (
                                <img src={item.cover} alt={item.album} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                                  <Music className="w-3 h-3 text-kiosk-text/80" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-kiosk-text truncate">{item.title}</p>
                              <p className="text-xs text-kiosk-text/80 truncate">{item.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Lyrics Tab */}
            <TabsContent value="lyrics" className="flex-1 mt-0 overflow-hidden">
              <LyricsDisplay
                trackId={currentTrack?.id}
                trackName={currentTrack?.title}
                artistName={currentTrack?.artist}
                position={currentTrack?.position}
                isPlaying={isPlaying}
              />
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {!currentTrack ? (
                    <div className="text-center py-12 text-kiosk-text/80">
                      <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma música tocando</p>
                    </div>
                  ) : (
                    <>
                      {/* Album Art */}
                      <div className="aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden shadow-2xl">
                        {currentTrack.cover ? (
                          <img 
                            src={currentTrack.cover} 
                            alt={currentTrack.album} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-kiosk-surface flex items-center justify-center">
                            <Disc3 className="w-16 h-16 text-secondary-visible" />
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-nav-neon-white mb-1">{currentTrack.title}</h3>
                        <p className="text-description-visible">{currentTrack.artist}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/30">
                          <Disc3 className="w-5 h-5 text-cyan-400" />
                          <div className="flex-1">
                            <p className="text-xs text-kiosk-text/80 font-medium">Álbum</p>
                            <p className="text-sm text-kiosk-text">{currentTrack.album || 'Desconhecido'}</p>
                          </div>
                        </div>

                        {currentTrack.duration && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/30">
                            <Clock className="w-5 h-5 text-cyan-400" />
                            <div className="flex-1">
                              <p className="text-xs text-kiosk-text/80 font-medium">Duração</p>
                              <p className="text-sm text-kiosk-text">{formatDuration(currentTrack.duration)}</p>
                            </div>
                          </div>
                        )}

                        {currentTrack.genre && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/30">
                            <Tag className="w-5 h-5 text-cyan-400" />
                            <div className="flex-1">
                              <p className="text-xs text-kiosk-text/80 font-medium">Gênero</p>
                              <Badge variant="outline" className="mt-1">{currentTrack.genre}</Badge>
                            </div>
                          </div>
                        )}

                        {currentTrack.year && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/30">
                            <Calendar className="w-5 h-5 text-cyan-400" />
                            <div className="flex-1">
                              <p className="text-xs text-kiosk-text/80 font-medium">Ano</p>
                              <p className="text-sm text-kiosk-text">{currentTrack.year}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SideInfoPanelToggle({ 
  onClick, 
  isOpen 
}: { 
  onClick: () => void; 
  isOpen: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`w-10 h-10 rounded-full transition-all ${
        isOpen 
          ? 'bg-cyan-500/20 text-cyan-400' 
          : 'bg-kiosk-surface/50 text-description-visible hover:text-cyan-400'
      }`}
    >
      <Info className="w-5 h-5" />
    </Button>
  );
}
