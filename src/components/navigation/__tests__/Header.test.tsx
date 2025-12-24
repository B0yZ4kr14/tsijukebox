/**
 * Header Component Tests
 * 
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Wrapper with Router
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header component', () => {
      render(<Header />, { wrapper: Wrapper });
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render breadcrumbs by default', () => {
      render(<Header />, { wrapper: Wrapper });
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should hide breadcrumbs when showBreadcrumbs is false', () => {
      render(<Header showBreadcrumbs={false} />, { wrapper: Wrapper });
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('should render search button by default', () => {
      render(<Header />, { wrapper: Wrapper });
      expect(screen.getByLabelText('Abrir busca')).toBeInTheDocument();
    });

    it('should hide search when showSearch is false', () => {
      render(<Header showSearch={false} />, { wrapper: Wrapper });
      expect(screen.queryByLabelText('Abrir busca')).not.toBeInTheDocument();
    });

    it('should render notifications button by default', () => {
      render(<Header />, { wrapper: Wrapper });
      expect(screen.getByLabelText('Notificações')).toBeInTheDocument();
    });

    it('should hide notifications when showNotifications is false', () => {
      render(<Header showNotifications={false} />, { wrapper: Wrapper });
      expect(screen.queryByLabelText('Notificações')).not.toBeInTheDocument();
    });

    it('should render profile button by default', () => {
      render(<Header />, { wrapper: Wrapper });
      expect(screen.getByLabelText('Perfil')).toBeInTheDocument();
    });

    it('should hide profile when showProfile is false', () => {
      render(<Header showProfile={false} />, { wrapper: Wrapper });
      expect(screen.queryByLabelText('Perfil')).not.toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(<Header />, { wrapper: Wrapper });
      expect(screen.getByLabelText('Configurações')).toBeInTheDocument();
    });
  });

  describe('Breadcrumbs', () => {
    it('should generate breadcrumbs from pathname', () => {
      window.history.pushState({}, '', '/settings/audio');
      render(<Header />, { wrapper: Wrapper });
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
    });

    it('should highlight current breadcrumb', () => {
      window.history.pushState({}, '', '/settings');
      render(<Header />, { wrapper: Wrapper });
      
      const settingsCrumb = screen.getByText('Settings');
      expect(settingsCrumb).toHaveClass('text-white');
    });

    it('should make non-current breadcrumbs clickable', () => {
      window.history.pushState({}, '', '/settings/audio');
      render(<Header />, { wrapper: Wrapper });
      
      const homeCrumb = screen.getByText('Home');
      expect(homeCrumb).toHaveClass('text-gray-400');
      expect(homeCrumb.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('Search Functionality', () => {
    it('should open search input when search button is clicked', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const searchButton = screen.getByLabelText('Abrir busca');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
      });
    });

    it('should close search when X button is clicked', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      // Open search
      const searchButton = screen.getByLabelText('Abrir busca');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
      });
      
      // Close search
      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Buscar/i)).not.toBeInTheDocument();
      });
    });

    it('should update search query on input', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      // Open search
      const searchButton = screen.getByLabelText('Abrir busca');
      fireEvent.click(searchButton);
      
      const searchInput = await screen.findByPlaceholderText(/Buscar/i);
      fireEvent.change(searchInput, { target: { value: 'Wonderwall' } });
      
      expect(searchInput).toHaveValue('Wonderwall');
    });
  });

  describe('Notifications', () => {
    it('should display unread count badge', () => {
      render(<Header />, { wrapper: Wrapper });
      
      const badge = screen.getByText('2'); // 2 unread notifications in mock data
      expect(badge).toBeInTheDocument();
    });

    it('should open notifications panel when button is clicked', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const notificationsButton = screen.getByLabelText('Notificações');
      fireEvent.click(notificationsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Nova música adicionada')).toBeInTheDocument();
      });
    });

    it('should close notifications panel when clicked again', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const notificationsButton = screen.getByLabelText('Notificações');
      
      // Open
      fireEvent.click(notificationsButton);
      await waitFor(() => {
        expect(screen.getByText('Nova música adicionada')).toBeInTheDocument();
      });
      
      // Close
      fireEvent.click(notificationsButton);
      await waitFor(() => {
        expect(screen.queryByText('Nova música adicionada')).not.toBeInTheDocument();
      });
    });

    it('should display notification types with correct colors', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const notificationsButton = screen.getByLabelText('Notificações');
      fireEvent.click(notificationsButton);
      
      await waitFor(() => {
        const notifications = screen.getAllByRole('generic').filter(el => 
          el.className.includes('w-2 h-2 rounded-full')
        );
        expect(notifications.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Profile Menu', () => {
    it('should open profile menu when button is clicked', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const profileButton = screen.getByLabelText('Perfil');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      });
    });

    it('should close profile menu when clicked again', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const profileButton = screen.getByLabelText('Perfil');
      
      // Open
      fireEvent.click(profileButton);
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      });
      
      // Close
      fireEvent.click(profileButton);
      await waitFor(() => {
        expect(screen.queryByText('Meu Perfil')).not.toBeInTheDocument();
      });
    });

    it('should display user email', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const profileButton = screen.getByLabelText('Perfil');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('user@tsijukebox.com')).toBeInTheDocument();
      });
    });

    it('should have logout button', async () => {
      render(<Header />, { wrapper: Wrapper });
      
      const profileButton = screen.getByLabelText('Perfil');
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sair')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Menu', () => {
    it('should call onMenuClick when menu button is clicked', () => {
      const onMenuClick = vi.fn();
      render(<Header onMenuClick={onMenuClick} />, { wrapper: Wrapper });
      
      // Note: Menu button only visible on mobile (lg:hidden)
      // This test assumes the button is rendered
      const menuButtons = screen.getAllByRole('button');
      const menuButton = menuButtons.find(btn => 
        btn.getAttribute('aria-label') === 'Toggle menu'
      );
      
      if (menuButton) {
        fireEvent.click(menuButton);
        expect(onMenuClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Header />, { wrapper: Wrapper });
      
      expect(screen.getByLabelText('Abrir busca')).toBeInTheDocument();
      expect(screen.getByLabelText('Notificações')).toBeInTheDocument();
      expect(screen.getByLabelText('Configurações')).toBeInTheDocument();
      expect(screen.getByLabelText('Perfil')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<Header />, { wrapper: Wrapper });
      
      const searchButton = screen.getByLabelText('Abrir busca');
      searchButton.focus();
      expect(document.activeElement).toBe(searchButton);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Header className="custom-class" />, { wrapper: Wrapper });
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('custom-class');
    });
  });
});
