/**
 * ProgressBar Component Tests
 * 
 * Testes unitários para o componente ProgressBar do TSiJUKEBOX.
 * Barra de progresso da música com seek functionality.
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressBar } from '../ProgressBar';

// ============================================================================
// MOCKS
// ============================================================================

const mockOnSeek = vi.fn();

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('ProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // RENDERING TESTS
  // --------------------------------------------------------------------------

  describe('Renderização', () => {
    it('deve renderizar barra de progresso', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('deve mostrar tempo atual', () => {
      render(
        <ProgressBar 
          currentTime={65} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('1:05')).toBeInTheDocument();
    });

    it('deve mostrar duração total', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('deve mostrar tempo restante quando configurado', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          showRemaining={true}
        />
      );

      expect(screen.getByText('-2:00')).toBeInTheDocument();
    });

    it('deve calcular porcentagem corretamente', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={90} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const progressFill = container.querySelector('[data-progress-fill]');
      expect(progressFill).toHaveStyle({ width: '50%' });
    });
  });

  // --------------------------------------------------------------------------
  // INTERACTION TESTS
  // --------------------------------------------------------------------------

  describe('Interações', () => {
    it('deve chamar onSeek ao clicar na barra', async () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const track = container.querySelector('[data-progress-track]');
      
      // Simular clique no meio da barra
      fireEvent.click(track!, {
        clientX: 100,
        currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 200 }) }
      });

      expect(mockOnSeek).toHaveBeenCalled();
    });

    it('deve permitir seek via slider', async () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '120' } });

      expect(mockOnSeek).toHaveBeenCalledWith(120);
    });

    it('deve suportar drag para seek', async () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const thumb = container.querySelector('[data-progress-thumb]');

      fireEvent.mouseDown(thumb!);
      fireEvent.mouseMove(document, { clientX: 150 });
      fireEvent.mouseUp(document);

      expect(mockOnSeek).toHaveBeenCalled();
    });

    it('deve mostrar preview de tempo no hover', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          showPreview={true}
        />
      );

      const track = container.querySelector('[data-progress-track]');
      await user.hover(track!);

      expect(container.querySelector('[data-time-preview]')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // VALUE TESTS
  // --------------------------------------------------------------------------

  describe('Valores', () => {
    it('deve ter valor mínimo de 0', () => {
      render(
        <ProgressBar 
          currentTime={0} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
    });

    it('deve ter valor máximo igual à duração', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('max', '180');
    });

    it('deve atualizar quando currentTime muda', () => {
      const { rerender } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('1:00')).toBeInTheDocument();

      rerender(
        <ProgressBar 
          currentTime={120} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    it('deve lidar com duração 0', () => {
      render(
        <ProgressBar 
          currentTime={0} 
          duration={0} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // ACCESSIBILITY TESTS
  // --------------------------------------------------------------------------

  describe('Acessibilidade', () => {
    it('deve ter aria-label no slider', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label');
    });

    it('deve ter aria-valuenow correto', () => {
      render(
        <ProgressBar 
          currentTime={90} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '90');
    });

    it('deve ter aria-valuetext com tempo formatado', () => {
      render(
        <ProgressBar 
          currentTime={90} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '1:30 de 3:00');
    });

    it('deve ser navegável por teclado', async () => {
      const user = userEvent.setup();
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      await user.keyboard('{ArrowRight}');
      expect(mockOnSeek).toHaveBeenCalled();
    });

    it('deve ter step apropriado para navegação', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '1');
    });
  });

  // --------------------------------------------------------------------------
  // VISUAL TESTS
  // --------------------------------------------------------------------------

  describe('Visual', () => {
    it('deve ter cor de preenchimento correta', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const fill = container.querySelector('[data-progress-fill]');
      expect(fill).toHaveClass('bg-accent-cyan');
    });

    it('deve ter animação de transição', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const fill = container.querySelector('[data-progress-fill]');
      expect(fill).toHaveClass('transition-all');
    });

    it('deve ter thumb visível no hover', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      const track = container.querySelector('[data-progress-track]');
      await user.hover(track!);

      const thumb = container.querySelector('[data-progress-thumb]');
      expect(thumb).toHaveClass('opacity-100');
    });

    it('deve ter glow effect quando ativo', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          isActive={true}
        />
      );

      const fill = container.querySelector('[data-progress-fill]');
      expect(fill).toHaveClass('shadow-glow-cyan');
    });
  });

  // --------------------------------------------------------------------------
  // PROPS TESTS
  // --------------------------------------------------------------------------

  describe('Props', () => {
    it('deve aceitar className customizado', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          className="custom-progress"
        />
      );

      expect(container.firstChild).toHaveClass('custom-progress');
    });

    it('deve aceitar disabled prop', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          disabled={true}
        />
      );

      expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('deve aceitar size prop', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          size="large"
        />
      );

      const track = container.querySelector('[data-progress-track]');
      expect(track).toHaveClass('h-3');
    });

    it('deve aceitar color prop', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          color="magenta"
        />
      );

      const fill = container.querySelector('[data-progress-fill]');
      expect(fill).toHaveClass('bg-accent-magenta');
    });

    it('deve ocultar tempos quando showTime=false', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          showTime={false}
        />
      );

      expect(screen.queryByText('1:00')).not.toBeInTheDocument();
      expect(screen.queryByText('3:00')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // BUFFERING TESTS
  // --------------------------------------------------------------------------

  describe('Buffering', () => {
    it('deve mostrar buffer quando fornecido', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          buffered={120}
          onSeek={mockOnSeek}
        />
      );

      const bufferFill = container.querySelector('[data-buffer-fill]');
      expect(bufferFill).toHaveStyle({ width: '66.67%' });
    });

    it('deve ter cor diferente para buffer', () => {
      const { container } = render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          buffered={120}
          onSeek={mockOnSeek}
        />
      );

      const bufferFill = container.querySelector('[data-buffer-fill]');
      expect(bufferFill).toHaveClass('bg-white/20');
    });
  });

  // --------------------------------------------------------------------------
  // EDGE CASES
  // --------------------------------------------------------------------------

  describe('Casos Especiais', () => {
    it('deve lidar com currentTime > duration', () => {
      render(
        <ProgressBar 
          currentTime={200} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      // Deve clampar ao máximo
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('180');
    });

    it('deve lidar com valores negativos', () => {
      render(
        <ProgressBar 
          currentTime={-10} 
          duration={180} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('0:00')).toBeInTheDocument();
    });

    it('deve lidar com duração muito longa (> 1 hora)', () => {
      render(
        <ProgressBar 
          currentTime={3665} 
          duration={7200} 
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('1:01:05')).toBeInTheDocument();
      expect(screen.getByText('2:00:00')).toBeInTheDocument();
    });

    it('deve lidar com seek durante loading', () => {
      render(
        <ProgressBar 
          currentTime={60} 
          duration={180} 
          onSeek={mockOnSeek}
          isLoading={true}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('ProgressBar Snapshots', () => {
  it('deve corresponder ao snapshot padrão', () => {
    const { container } = render(
      <ProgressBar 
        currentTime={90} 
        duration={180} 
        onSeek={vi.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('deve corresponder ao snapshot com buffer', () => {
    const { container } = render(
      <ProgressBar 
        currentTime={60} 
        duration={180} 
        buffered={120}
        onSeek={vi.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
