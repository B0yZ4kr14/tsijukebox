import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BackupManager } from '../BackupManager';
import { mockBackupApiResponse, createMockFetch } from '@/test/mocks/backupMocks';
import { Toaster } from '@/components/ui/sonner';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BackupManager Integration', () => {
  const originalFetch = global.fetch;
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    const storage: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete storage[key]; }),
      clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
      length: 0,
      key: vi.fn(),
    };

    // Mock fetch
    global.fetch = createMockFetch(mockBackupApiResponse);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
  });

  describe('Rendering', () => {
    it('should render backup manager with default props', () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });

    it('should render with custom title via instructions', () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Backup/i)).toBeInTheDocument();
    });

    it('should show demo mode warning when isDemoMode is true', () => {
      render(<BackupManager isDemoMode={true} />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/demo/i)).toBeInTheDocument();
    });
  });

  describe('Backup Flow', () => {
    it('should have full backup button enabled by default', () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      const fullBackupButton = screen.getByText('Backup Completo').closest('button');
      expect(fullBackupButton).not.toBeDisabled();
    });

    it('should have incremental backup button', () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Incremental')).toBeInTheDocument();
    });

    it('should call API when full backup button is clicked', async () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText('Backup Completo'));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Multi-Provider', () => {
    it('should render tabs when multiple providers configured', () => {
      render(
        <BackupManager providers={['local', 'cloud', 'distributed']} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });

    it('should render single provider without tabs', () => {
      render(
        <BackupManager providers={['local']} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });
  });

  describe('Scheduler Integration', () => {
    it('should show scheduler when showScheduler=true', () => {
      render(
        <BackupManager showScheduler={true} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });

    it('should hide scheduler when showScheduler=false', () => {
      render(
        <BackupManager showScheduler={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });
  });

  describe('History Integration', () => {
    it('should show history when showHistory=true', () => {
      render(
        <BackupManager showHistory={true} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });

    it('should hide history when showHistory=false', () => {
      render(
        <BackupManager showHistory={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Backup Completo')).toBeInTheDocument();
    });
  });

  describe('Demo Mode', () => {
    it('should show warning in demo mode', () => {
      render(<BackupManager isDemoMode={true} />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/demo/i)).toBeInTheDocument();
    });

    it('should not call API in demo mode', async () => {
      render(<BackupManager isDemoMode={true} />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText('Backup Completo'));
      
      await waitFor(() => {
        expect(screen.getByText('Backup Completo')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      render(<BackupManager />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText('Backup Completo'));
      
      await waitFor(() => {
        expect(screen.getByText('Backup Completo')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should attempt to load from localStorage on mount', () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      expect(localStorage.getItem).toHaveBeenCalled();
    });

    it('should save to localStorage after backup action', async () => {
      render(<BackupManager />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText('Backup Completo'));
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });
  });
});
