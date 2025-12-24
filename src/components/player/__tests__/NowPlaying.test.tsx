/**
 * NowPlaying Component Tests
 * 
 * Testes unitários para o componente NowPlaying do TSiJUKEBOX.
 * Exibe informações da música atual em reprodução.
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NowPlaying } from '../NowPlaying';

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockTrack = {
  id: 'track-1',
  title: 'Wonderwall',
  artist: 'Oasis',
  album: '(What\'s the Story) Morning Glory?',
  albumArt: 'https://example.com/album.jpg',
  duration: 258,
  year: 1995,
};

const mockTrackLongTitle = {
  id: 'track-2',
  title: 'A Very Long Song Title That Should Be Truncated In The Display',
  artist: 'Artist With A Very Long Name That Might Need Truncation',
  album: 'Album Name',
  albumArt: 'https://example.com/album2.jpg',
  duration: 300,
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('NowPlaying', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // RENDERING TESTS
  // --------------------------------------------------------------------------

  describe('Renderização', () => {
    it('deve renderizar informações da música', () => {
      render(<NowPlaying track={mockTrack} isPlaying={true} />);

      expect(screen.getByText('Wonderwall')).toBeInTheDocument();
      expect(screen.getByText('Oasis')).toBeInTheDocument();
    });

    it('deve renderizar capa do álbum', () => {
      render(<NowPlaying track={mockTrack} isPlaying={true} />);

      const albumArt = screen.getByRole('img');
      expect(albumArt).toHaveAttribute('src', mockTrack.albumArt);
      expect(albumArt).toHaveAttribute('alt', expect.stringContaining('Wonderwall'));
    });

    it('deve mostrar placeholder quando não há música', () => {
      render(<NowPlaying track={null} isPlaying={false} />);

      expect(screen.getByText(/nenhuma música/i)).toBeInTheDocument();
    });

    it('deve mostrar nome do álbum quando disponível', () => {
      render(<NowPlaying track={mockTrack} isPlaying={true} showAlbum={true} />);

      expect(screen.getByText(mockTrack.album)).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // STATE TESTS
  // --------------------------------------------------------------------------

  describe('Estados', () => {
    it('deve indicar visualmente quando está reproduzindo', () => {
      const { container } = render(<NowPlaying track={mockTrack} isPlaying={true} />);

      // Verificar classe ou indicador de playing
      expect(container.querySelector('[data-playing="true"]')).toBeInTheDocument();
    });

    it('deve indicar visualmente quando está pausado', () => {
      const { container } = render(<NowPlaying track={mockTrack} isPlaying={false} />);

      expect(container.querySelector('[data-playing="false"]')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // TRUNCATION TESTS
  // --------------------------------------------------------------------------

  describe('Truncamento', () => {
    it('deve truncar títulos longos', () => {
      render(<NowPlaying track={mockTrackLongTitle} isPlaying={true} />);

      const titleElement = screen.getByTestId('track-title');
      expect(titleElement).toHaveClass('truncate');
    });

    it('deve truncar nomes de artistas longos', () => {
      render(<NowPlaying track={mockTrackLongTitle} isPlaying={true} />);

      const artistElement = screen.getByTestId('track-artist');
      expect(artistElement).toHaveClass('truncate');
    });
  });

  // --------------------------------------------------------------------------
  // ACCESSIBILITY TESTS
  // --------------------------------------------------------------------------

  describe('Acessibilidade', () => {
    it('deve ter alt text na imagem do álbum', () => {
      render(<NowPlaying track={mockTrack} isPlaying={true} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).not.toBe('');
    });

    it('deve ter estrutura semântica correta', () => {
      render(<NowPlaying track={mockTrack} isPlaying={true} />);

      // Título deve ser heading ou ter role apropriado
      const title = screen.getByText('Wonderwall');
      expect(title.tagName).toMatch(/H[1-6]|SPAN|P/);
    });

    it('deve anunciar mudanças para screen readers', () => {
      const { container } = render(<NowPlaying track={mockTrack} isPlaying={true} />);

      // Verificar aria-live region
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // VISUAL TESTS
  // --------------------------------------------------------------------------

  describe('Visual', () => {
    it('deve aplicar classes de animação quando reproduzindo', () => {
      const { container } = render(<NowPlaying track={mockTrack} isPlaying={true} />);

      // Verificar animação de pulse ou similar
      expect(container.querySelector('.animate-pulse, [data-animating]')).toBeInTheDocument();
    });

    it('deve ter layout responsivo', () => {
      const { container } = render(<NowPlaying track={mockTrack} isPlaying={true} />);

      // Verificar classes responsivas
      expect(container.firstChild).toHaveClass('flex');
    });
  });

  // --------------------------------------------------------------------------
  // PROPS TESTS
  // --------------------------------------------------------------------------

  describe('Props', () => {
    it('deve aceitar className customizado', () => {
      const { container } = render(
        <NowPlaying track={mockTrack} isPlaying={true} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('deve aceitar size prop', () => {
      render(<NowPlaying track={mockTrack} isPlaying={true} size="large" />);

      const img = screen.getByRole('img');
      expect(img).toHaveClass('w-20', 'h-20');
    });

    it('deve aceitar compact mode', () => {
      const { container } = render(
        <NowPlaying track={mockTrack} isPlaying={true} compact={true} />
      );

      expect(container.firstChild).toHaveClass('compact');
    });
  });

  // --------------------------------------------------------------------------
  // EDGE CASES
  // --------------------------------------------------------------------------

  describe('Casos Especiais', () => {
    it('deve lidar com track sem albumArt', () => {
      const trackNoArt = { ...mockTrack, albumArt: undefined };
      render(<NowPlaying track={trackNoArt} isPlaying={true} />);

      // Deve mostrar placeholder
      const img = screen.getByRole('img');
      expect(img.getAttribute('src')).toContain('placeholder');
    });

    it('deve lidar com track sem artista', () => {
      const trackNoArtist = { ...mockTrack, artist: undefined };
      render(<NowPlaying track={trackNoArtist} isPlaying={true} />);

      expect(screen.getByText(/artista desconhecido/i)).toBeInTheDocument();
    });

    it('deve lidar com caracteres especiais no título', () => {
      const trackSpecial = { ...mockTrack, title: 'Rock & Roll <Queen>' };
      render(<NowPlaying track={trackSpecial} isPlaying={true} />);

      expect(screen.getByText('Rock & Roll <Queen>')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('NowPlaying Snapshots', () => {
  it('deve corresponder ao snapshot com música', () => {
    const { container } = render(<NowPlaying track={mockTrack} isPlaying={true} />);
    expect(container).toMatchSnapshot();
  });

  it('deve corresponder ao snapshot sem música', () => {
    const { container } = render(<NowPlaying track={null} isPlaying={false} />);
    expect(container).toMatchSnapshot();
  });
});
