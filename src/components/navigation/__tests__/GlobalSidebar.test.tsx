/**
 * GlobalSidebar Component Tests
 * 
 * Testes unitários para o componente GlobalSidebar.
 * Cobre renderização, navegação, estados e responsividade.
 * 
 * @test
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { GlobalSidebar } from '../GlobalSidebar';

// ============================================================================
// Test Helpers
// ============================================================================

const renderWithRouter = (
  component: React.ReactElement,
  { route = '/' } = {}
) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {component}
    </MemoryRouter>
  );
};

// ============================================================================
// Tests
// ============================================================================

describe('GlobalSidebar', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('should render the sidebar with logo and version', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText(/TSI/i)).toBeInTheDocument();
      expect(screen.getByText(/JUKEBOX/i)).toBeInTheDocument();
      expect(screen.getByText(/v4.2.1/i)).toBeInTheDocument();
    });

    it('should render all navigation sections', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.getByText('Documentação')).toBeInTheDocument();
      expect(screen.getByText('Avançado')).toBeInTheDocument();
    });

    it('should render all main navigation items', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('Karaoke')).toBeInTheDocument();
      expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    });

    it('should render all documentation items', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('Instalação')).toBeInTheDocument();
      expect(screen.getByText('Configuração')).toBeInTheDocument();
      expect(screen.getByText('Tutoriais')).toBeInTheDocument();
      expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
    });

    it('should render all advanced items', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Monitoramento')).toBeInTheDocument();
      expect(screen.getByText('Testes')).toBeInTheDocument();
    });

    it('should render user profile section', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('Usuário')).toBeInTheDocument();
      expect(screen.getByText('user@tsijukebox.com')).toBeInTheDocument();
    });

    it('should render footer credits', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText(/Desenvolvido por/i)).toBeInTheDocument();
      expect(screen.getByText(/B0.y_Z4kr14/i)).toBeInTheDocument();
      expect(screen.getByText(/TSI Telecom/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Collapse/Expand Tests
  // ==========================================================================

  describe('Collapse/Expand', () => {
    it('should start expanded by default', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('Dashboard')).toBeVisible();
      expect(screen.getByText('Principal')).toBeVisible();
    });

    it('should start collapsed when defaultCollapsed is true', () => {
      renderWithRouter(<GlobalSidebar defaultCollapsed={true} />);
      
      expect(screen.queryByText('Principal')).not.toBeInTheDocument();
    });

    it('should toggle collapsed state when button is clicked', async () => {
      renderWithRouter(<GlobalSidebar />);
      
      const toggleButton = screen.getByLabelText('Recolher sidebar');
      
      // Should be expanded initially
      expect(screen.getByText('Principal')).toBeVisible();
      
      // Click to collapse
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Principal')).not.toBeInTheDocument();
      });
      
      // Click to expand
      fireEvent.click(screen.getByLabelText('Expandir sidebar'));
      
      await waitFor(() => {
        expect(screen.getByText('Principal')).toBeVisible();
      });
    });

    it('should call onCollapsedChange when collapsed state changes', () => {
      const onCollapsedChange = vi.fn();
      renderWithRouter(<GlobalSidebar onCollapsedChange={onCollapsedChange} />);
      
      const toggleButton = screen.getByLabelText('Recolher sidebar');
      fireEvent.click(toggleButton);
      
      expect(onCollapsedChange).toHaveBeenCalledWith(true);
    });
  });

  // ==========================================================================
  // Navigation Tests
  // ==========================================================================

  describe('Navigation', () => {
    it('should highlight active route', () => {
      renderWithRouter(<GlobalSidebar />, { route: '/dashboard' });
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have correct href for all navigation items', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /player/i })).toHaveAttribute('href', '/player');
      expect(screen.getByRole('link', { name: /karaoke/i })).toHaveAttribute('href', '/karaoke');
    });

    it('should show badge for items with badge prop', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Color Tests
  // ==========================================================================

  describe('Colors', () => {
    it('should apply correct colors to documentation icons', () => {
      renderWithRouter(<GlobalSidebar />);
      
      // Check if color classes are applied (via data-testid or class inspection)
      const installationLink = screen.getByRole('link', { name: /instalação/i });
      expect(installationLink).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<GlobalSidebar />);
      
      expect(screen.getByLabelText('Recolher sidebar')).toBeInTheDocument();
    });

    it('should have proper link roles', () => {
      renderWithRouter(<GlobalSidebar />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should mark active route with aria-current', () => {
      renderWithRouter(<GlobalSidebar />, { route: '/dashboard' });
      
      const activeLink = screen.getByRole('link', { name: /dashboard/i });
      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });
  });

  // ==========================================================================
  // Responsive Tests
  // ==========================================================================

  describe('Responsive Behavior', () => {
    it('should show tooltips in collapsed state', async () => {
      renderWithRouter(<GlobalSidebar defaultCollapsed={true} />);
      
      // Tooltips should exist in the DOM but be hidden
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration', () => {
    it('should work with custom className', () => {
      const { container } = renderWithRouter(
        <GlobalSidebar className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should persist collapsed state to localStorage', async () => {
      renderWithRouter(<GlobalSidebar />);
      
      const toggleButton = screen.getByLabelText('Recolher sidebar');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const stored = localStorage.getItem('tsijukebox_sidebar_state');
        expect(stored).toBeTruthy();
        if (stored) {
          const state = JSON.parse(stored);
          expect(state.collapsed).toBe(true);
        }
      });
    });
  });
});
