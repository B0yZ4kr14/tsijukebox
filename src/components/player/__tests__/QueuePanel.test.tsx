import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueuePanel } from '../QueuePanel';
import type { PlaybackQueue, QueueItem } from '@/lib/api/types';

// Mock dependencies
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    hasPermission: (permission: string) => {
      if (permission === 'canRemoveFromQueue') return true;
      if (permission === 'canControlPlayback') return true;
      return false;
    },
  }),
}));

vi.mock('@/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'player.clearQueue': 'Clear Queue',
        'common.close': 'Close',
        'player.play': 'Play',
        'player.removeFromQueue': 'Remove from queue',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  DragOverlay: ({ children }: { children?: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

const createMockQueueItem = (id: string, title: string): QueueItem => ({
  id,
  title,
  artist: 'Test Artist',
  album: 'Test Album',
  cover: null,
  duration: 180000,
  uri: `spotify:track:${id}`,
});

const mockQueue: PlaybackQueue = {
  current: createMockQueueItem('current-1', 'Current Song'),
  next: [
    createMockQueueItem('next-1', 'Next Song 1'),
    createMockQueueItem('next-2', 'Next Song 2'),
    createMockQueueItem('next-3', 'Next Song 3'),
  ],
  history: [
    createMockQueueItem('history-1', 'Previous Song 1'),
    createMockQueueItem('history-2', 'Previous Song 2'),
  ],
};

describe('QueuePanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    queue: mockQueue,
    onPlayItem: vi.fn(),
    onRemoveItem: vi.fn(),
    onClearQueue: vi.fn(),
    onReorderQueue: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render queue panel when isOpen is true', () => {
    render(<QueuePanel {...defaultProps} />);
    
    expect(screen.getByTestId('queue-panel')).toBeInTheDocument();
    expect(screen.getByText('Fila de Reprodução')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<QueuePanel {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByTestId('queue-panel')).not.toBeInTheDocument();
  });

  it('should display "Now Playing" section with current track', () => {
    render(<QueuePanel {...defaultProps} />);
    
    expect(screen.getByText('Tocando Agora')).toBeInTheDocument();
    expect(screen.getByText('Current Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('should display "Next Up" section with queue items', () => {
    render(<QueuePanel {...defaultProps} />);
    
    expect(screen.getByText(/Próximas/)).toBeInTheDocument();
    expect(screen.getByText('Next Song 1')).toBeInTheDocument();
    expect(screen.getByText('Next Song 2')).toBeInTheDocument();
    expect(screen.getByText('Next Song 3')).toBeInTheDocument();
  });

  it('should display history section', () => {
    render(<QueuePanel {...defaultProps} />);
    
    expect(screen.getByText('Histórico')).toBeInTheDocument();
    expect(screen.getByText('Previous Song 1')).toBeInTheDocument();
    expect(screen.getByText('Previous Song 2')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<QueuePanel {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByTestId('queue-close');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<QueuePanel {...defaultProps} onClose={onClose} />);
    
    // Click on backdrop (the semi-transparent overlay)
    const backdrop = document.querySelector('.bg-black\\/70');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onClearQueue when clear button is clicked', () => {
    const onClearQueue = vi.fn();
    render(<QueuePanel {...defaultProps} onClearQueue={onClearQueue} />);
    
    const clearButton = screen.getByTestId('queue-clear');
    fireEvent.click(clearButton);
    
    expect(onClearQueue).toHaveBeenCalledTimes(1);
  });

  it('should display empty state when queue is empty', () => {
    const emptyQueue: PlaybackQueue = {
      current: null,
      next: [],
      history: [],
    };
    
    render(<QueuePanel {...defaultProps} queue={emptyQueue} />);
    
    expect(screen.getByTestId('queue-empty')).toBeInTheDocument();
    expect(screen.getByText('A fila está vazia')).toBeInTheDocument();
  });

  it('should display empty state when queue is null', () => {
    render(<QueuePanel {...defaultProps} queue={null} />);
    
    expect(screen.getByTestId('queue-empty')).toBeInTheDocument();
  });

  it('should not show clear button when queue is empty', () => {
    const emptyQueue: PlaybackQueue = {
      current: null,
      next: [],
      history: [],
    };
    
    render(<QueuePanel {...defaultProps} queue={emptyQueue} />);
    
    expect(screen.queryByTestId('queue-clear')).not.toBeInTheDocument();
  });

  it('should render DndContext for drag-and-drop', () => {
    render(<QueuePanel {...defaultProps} />);
    
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('should show queue count in section header', () => {
    render(<QueuePanel {...defaultProps} />);
    
    expect(screen.getByText(/Próximas \(3\)/)).toBeInTheDocument();
  });

  it('should limit history items to 5', () => {
    const queueWithLongHistory: PlaybackQueue = {
      ...mockQueue,
      history: Array.from({ length: 10 }, (_, i) => 
        createMockQueueItem(`history-${i}`, `History Song ${i}`)
      ),
    };
    
    render(<QueuePanel {...defaultProps} queue={queueWithLongHistory} />);
    
    // Should only show 5 history items
    const historySection = screen.getByText('Histórico').closest('section');
    const historyItems = historySection?.querySelectorAll('[class*="flex items-center gap-3"]');
    
    // The first 5 history songs should be visible
    expect(screen.getByText('History Song 0')).toBeInTheDocument();
    expect(screen.getByText('History Song 4')).toBeInTheDocument();
    expect(screen.queryByText('History Song 5')).not.toBeInTheDocument();
  });

  it('should not render history section when history is empty', () => {
    const queueWithoutHistory: PlaybackQueue = {
      ...mockQueue,
      history: [],
    };
    
    render(<QueuePanel {...defaultProps} queue={queueWithoutHistory} />);
    
    expect(screen.queryByText('Histórico')).not.toBeInTheDocument();
  });

  it('should display cover image when available', () => {
    const queueWithCover: PlaybackQueue = {
      current: {
        ...mockQueue.current!,
        cover: 'https://example.com/cover.jpg',
      },
      next: [],
      history: [],
    };
    
    render(<QueuePanel {...defaultProps} queue={queueWithCover} />);
    
    const coverImage = screen.getByAltText('Test Album');
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('should show music icon when no cover is available', () => {
    render(<QueuePanel {...defaultProps} />);
    
    // Current track has no cover, should show Music icon placeholder
    const musicIcons = document.querySelectorAll('.lucide-music');
    expect(musicIcons.length).toBeGreaterThan(0);
  });
});
