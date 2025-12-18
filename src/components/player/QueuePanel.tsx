import { useState, forwardRef } from 'react';
import { X, Trash2, Music, GripVertical, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QueueItem, PlaybackQueue } from '@/lib/api/types';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: PlaybackQueue | null;
  onPlayItem: (uri: string) => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onReorderQueue?: (fromIndex: number, toIndex: number) => void;
  isLoading?: boolean;
}

// Base component for queue track items - eliminates duplication
interface QueueTrackItemBaseProps {
  item: QueueItem;
  onPlay?: () => void;
  onRemove?: () => void;
  showPlay?: boolean;
  showDragHandle?: boolean;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  canRemove?: boolean;
  playLabel?: string;
  removeLabel?: string;
}

function QueueTrackItemBase({ 
  item, 
  onPlay, 
  onRemove,
  showPlay = true,
  showDragHandle = false,
  isDragging = false,
  dragHandleProps,
  canRemove = true,
  playLabel = 'Play track',
  removeLabel = 'Remove from queue',
}: QueueTrackItemBaseProps) {
  return (
    <div className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-kiosk-surface/50 transition-colors ${isDragging ? 'opacity-50 bg-kiosk-surface/30' : ''}`}>
      {/* Drag handle */}
      {showDragHandle && dragHandleProps ? (
        <div {...dragHandleProps} className="touch-none">
          <GripVertical className="w-4 h-4 text-kiosk-text/80 cursor-grab active:cursor-grabbing" />
        </div>
      ) : (
        <GripVertical className="w-4 h-4 text-kiosk-text/20 opacity-0 group-hover:opacity-100" />
      )}
      
      {/* Cover */}
      <div className="w-10 h-10 rounded bg-kiosk-surface flex-shrink-0 overflow-hidden">
        {item.cover ? (
          <img src={item.cover} alt={item.album} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-kiosk-text/85" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-kiosk-text truncate">{item.title}</p>
        <p className="text-xs text-kiosk-text/85 truncate">{item.artist}</p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showPlay && onPlay && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlay}
            aria-label={playLabel}
            className="w-8 h-8 text-kiosk-text/85 hover:text-[#1DB954]"
          >
            <Play className="w-4 h-4" />
          </Button>
        )}
        {canRemove && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={removeLabel}
            className="w-8 h-8 text-kiosk-text/85 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SortableQueueItem({
  item,
  onPlay,
  onRemove,
  canRemove,
  playLabel,
  removeLabel,
}: {
  item: QueueItem;
  onPlay: () => void;
  onRemove?: () => void;
  canRemove?: boolean;
  playLabel?: string;
  removeLabel?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QueueTrackItemBase
        item={item}
        onPlay={onPlay}
        onRemove={onRemove}
        showPlay={true}
        showDragHandle={true}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        canRemove={canRemove}
        playLabel={playLabel}
        removeLabel={removeLabel}
      />
    </div>
  );
}

export const QueuePanel = forwardRef<HTMLDivElement, QueuePanelProps>(function QueuePanel({
  isOpen,
  onClose,
  queue,
  onPlayItem,
  onRemoveItem,
  onClearQueue,
  onReorderQueue,
  isLoading,
}, ref) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { hasPermission } = useUser();
  const { t } = useTranslation();
  
  const canRemove = hasPermission('canRemoveFromQueue');
  const canPlay = hasPermission('canControlPlayback');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id && queue) {
      const oldIndex = queue.next.findIndex((item) => item.id === active.id);
      const newIndex = queue.next.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && onReorderQueue) {
        onReorderQueue(oldIndex, newIndex);
      }
    }
  };

  const activeItem = activeId ? queue?.next.find((item) => item.id === activeId) : null;

  if (!isOpen) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-kiosk-bg border border-kiosk-border rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-kiosk-border">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#1DB954]" />
            <h2 className="text-lg font-bold text-kiosk-text">Fila de Reprodução</h2>
          </div>
          <div className="flex items-center gap-2">
            {canRemove && queue && queue.next.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearQueue}
                aria-label={t('player.clearQueue')}
                className="text-kiosk-text/85 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t('player.clearQueue')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t('common.close')}
              className="w-8 h-8 text-kiosk-text/85 hover:text-kiosk-text"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Now Playing */}
            {queue?.current && (
              <section>
                <h3 className="text-xs font-semibold text-kiosk-text/85 uppercase tracking-wider mb-2">
                  Tocando Agora
                </h3>
                <div className="p-3 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-kiosk-surface overflow-hidden">
                      {queue.current.cover ? (
                        <img src={queue.current.cover} alt={queue.current.album} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-kiosk-text/85" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-kiosk-text truncate">{queue.current.title}</p>
                      <p className="text-sm text-kiosk-text/80 truncate">{queue.current.artist}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Next Up - Sortable */}
            <section>
              <h3 className="text-xs font-semibold text-kiosk-text/85 uppercase tracking-wider mb-2">
                Próximas ({queue?.next.length || 0})
              </h3>
              {!queue || queue.next.length === 0 ? (
                <div className="text-center py-8 text-kiosk-text/80">
                  <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">A fila está vazia</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={queue.next.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {queue.next.map((item) => (
                        <SortableQueueItem
                          key={item.id}
                          item={item}
                          onPlay={() => canPlay && item.uri && onPlayItem(item.uri)}
                          onRemove={canRemove ? () => onRemoveItem(item.id) : undefined}
                          canRemove={canRemove}
                          playLabel={t('player.play')}
                          removeLabel={t('player.removeFromQueue')}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeItem && (
                      <div className="p-2 rounded-lg bg-kiosk-surface border border-kiosk-border shadow-lg">
                        <QueueTrackItemBase item={activeItem} showPlay={false} />
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              )}
            </section>

            {/* History */}
            {queue && queue.history.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-kiosk-text/85 uppercase tracking-wider mb-2">
                  Histórico
                </h3>
                <div className="space-y-1 opacity-60">
                  {queue.history.slice(0, 5).map((item) => (
                    <QueueTrackItemBase
                      key={item.id}
                      item={item}
                      onPlay={() => item.uri && onPlayItem(item.uri)}
                      showPlay={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});
