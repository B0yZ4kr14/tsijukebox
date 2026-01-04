/**
 * VolumeSlider Component Tests
 * 
 * Testes unitários para o componente VolumeSlider do TSiJUKEBOX.
 * Controle de volume com slider e ícones dinâmicos.
 * 
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VolumeSlider } from '../VolumeSlider';

// ============================================================================
// MOCKS
// ============================================================================

const mockOnVolumeChange = vi.fn();
const mockOnMuteToggle = vi.fn();

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('VolumeSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // RENDERING TESTS
  // --------------------------------------------------------------------------

  describe('Renderização', () => {
    it('deve renderizar slider e botão de mute', () => {
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(screen.getByRole('slider')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('deve mostrar ícone de volume alto quando volume > 50', () => {
      render(
        <VolumeSlider 
          volume={75} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(screen.getByTestId('volume-high-icon')).toBeInTheDocument();
    });

    it('deve mostrar ícone de volume médio quando volume entre 1 e 50', () => {
      render(
        <VolumeSlider 
          volume={30} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(screen.getByTestId('volume-medium-icon')).toBeInTheDocument();
    });

    it('deve mostrar ícone de mute quando volume = 0', () => {
      render(
        <VolumeSlider 
          volume={0} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(screen.getByTestId('volume-mute-icon')).toBeInTheDocument();
    });

    it('deve mostrar ícone de mute quando isMuted = true', () => {
      render(
        <VolumeSlider 
          volume={50} 
          isMuted={true}
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(screen.getByTestId('volume-mute-icon')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // INTERACTION TESTS
  // --------------------------------------------------------------------------

  describe('Interações', () => {
    it('deve chamar onVolumeChange ao mover slider', async () => {
      const user = userEvent.setup();
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '75' } });

      expect(mockOnVolumeChange).toHaveBeenCalledWith(75);
    });

    it('deve chamar onMuteToggle ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(mockOnMuteToggle).toHaveBeenCalledTimes(1);
    });

    it('deve permitir ajuste fino com teclado', async () => {
      const user = userEvent.setup();
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      await user.keyboard('{ArrowRight}');
      expect(mockOnVolumeChange).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // VALUE TESTS
  // --------------------------------------------------------------------------

  describe('Valores', () => {
    it('deve ter valor mínimo de 0', () => {
      render(
        <VolumeSlider 
          volume={0} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
    });

    it('deve ter valor máximo de 100', () => {
      render(
        <VolumeSlider 
          volume={100} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('max', '100');
    });

    it('deve refletir o valor atual do volume', () => {
      render(
        <VolumeSlider 
          volume={75} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('75');
    });

    it('deve atualizar quando volume prop muda', () => {
      const { rerender } = render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('50');

      rerender(
        <VolumeSlider 
          volume={80} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(slider).toHaveValue('80');
    });
  });

  // --------------------------------------------------------------------------
  // ACCESSIBILITY TESTS
  // --------------------------------------------------------------------------

  describe('Acessibilidade', () => {
    it('deve ter aria-label no slider', () => {
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label');
    });

    it('deve ter aria-valuenow correto', () => {
      render(
        <VolumeSlider 
          volume={75} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('deve ter aria-label no botão de mute', () => {
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('deve indicar estado de mute via aria-pressed', () => {
      render(
        <VolumeSlider 
          volume={50} 
          isMuted={true}
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('deve ser navegável por teclado', async () => {
      const user = userEvent.setup();
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('slider')).toHaveFocus();
    });
  });

  // --------------------------------------------------------------------------
  // VISUAL TESTS
  // --------------------------------------------------------------------------

  describe('Visual', () => {
    it('deve ter estilo de preenchimento baseado no volume', () => {
      const { container } = render(
        <VolumeSlider 
          volume={75} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      // Verificar CSS custom property ou style
      const slider = container.querySelector('[data-volume-fill]');
      expect(slider).toHaveStyle({ '--volume-fill': '75%' });
    });

    it('deve ter cor diferente quando mutado', () => {
      const { container } = render(
        <VolumeSlider 
          volume={50} 
          isMuted={true}
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      expect(container.firstChild).toHaveClass('muted');
    });

    it('deve ter animação de hover', () => {
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:');
    });
  });

  // --------------------------------------------------------------------------
  // PROPS TESTS
  // --------------------------------------------------------------------------

  describe('Props', () => {
    it('deve aceitar className customizado', () => {
      const { container } = render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
          className="custom-volume"
        />
      );

      expect(container.firstChild).toHaveClass('custom-volume');
    });

    it('deve aceitar disabled prop', () => {
      render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
          disabled={true}
        />
      );

      expect(screen.getByRole('slider')).toBeDisabled();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('deve aceitar showValue prop para exibir porcentagem', () => {
      render(
        <VolumeSlider 
          volume={75} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
          showValue={true}
        />
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('deve aceitar orientation vertical', () => {
      const { container } = render(
        <VolumeSlider 
          volume={50} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
          orientation="vertical"
        />
      );

      expect(container.firstChild).toHaveClass('vertical');
    });
  });

  // --------------------------------------------------------------------------
  // EDGE CASES
  // --------------------------------------------------------------------------

  describe('Casos Especiais', () => {
    it('deve lidar com valores fora do range', () => {
      render(
        <VolumeSlider 
          volume={150} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('100'); // Clamped to max
    });

    it('deve lidar com valores negativos', () => {
      render(
        <VolumeSlider 
          volume={-10} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('0'); // Clamped to min
    });

    it('deve lidar com valores decimais', () => {
      render(
        <VolumeSlider 
          volume={50.5} 
          onVolumeChange={mockOnVolumeChange}
          onMuteToggle={mockOnMuteToggle}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('51'); // Rounded
    });
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('VolumeSlider Snapshots', () => {
  it('deve corresponder ao snapshot com volume médio', () => {
    const { container } = render(
      <VolumeSlider 
        volume={50} 
        onVolumeChange={vi.fn()}
        onMuteToggle={vi.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('deve corresponder ao snapshot mutado', () => {
    const { container } = render(
      <VolumeSlider 
        volume={50} 
        isMuted={true}
        onVolumeChange={vi.fn()}
        onMuteToggle={vi.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
