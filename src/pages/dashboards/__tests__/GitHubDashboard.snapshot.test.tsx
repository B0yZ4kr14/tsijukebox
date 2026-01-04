import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Supabase
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

// Mock hooks
const mockUseGitHubStats = vi.fn();
const mockUseGitHubFullSync = vi.fn();
const mockUseAutoSync = vi.fn();

vi.mock('@/hooks/system/useGitHubStats', () => ({
  useGitHubStats: () => mockUseGitHubStats(),
}));

vi.mock('@/hooks/system/useGitHubFullSync', () => ({
  useGitHubFullSync: () => mockUseGitHubFullSync(),
}));

vi.mock('@/hooks/system/useAutoSync', () => ({
  useAutoSync: () => mockUseAutoSync(),
}));

// Import component after mocks
import GitHubDashboard from '../GitHubDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

const mockRepoInfo = {
  full_name: 'test/repo',
  html_url: 'https://github.com/test/repo',
  stargazers_count: 100,
  forks_count: 50,
  watchers_count: 75,
  open_issues_count: 10,
  created_at: '2024-01-01T00:00:00Z',
  pushed_at: '2024-12-20T00:00:00Z',
  size: 1024,
};

const defaultMockValues = {
  repoInfo: null,
  commits: [],
  contributors: [],
  releases: [],
  branches: [],
  languages: {},
  isLoading: false,
  error: null,
  fromCache: false,
  cacheStats: { hits: 0, misses: 0, size: 0 },
  refetch: vi.fn(),
  clearAllCache: vi.fn(),
};

const defaultSyncValues = {
  isSyncing: false,
  progress: null,
  syncFullRepository: vi.fn(),
  lastSync: null,
};

const defaultAutoSyncValues = {
  isEnabled: false,
  interval: 30,
  lastRun: null,
  nextRun: null,
  toggle: vi.fn(),
  setInterval: vi.fn(),
};

describe('GitHubDashboard Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGitHubFullSync.mockReturnValue(defaultSyncValues);
    mockUseAutoSync.mockReturnValue(defaultAutoSyncValues);
  });

  it('should match loading state snapshot', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      isLoading: true,
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Verify loading skeleton is displayed
    expect(container.querySelector('.animate-fade-in')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should match error state snapshot', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      error: 'Failed to fetch repository data. Please check your GitHub token.',
      isLoading: false,
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Verify error state is displayed
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch repository data/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should match success state snapshot with full data', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      repoInfo: mockRepoInfo,
      commits: [
        {
          sha: 'abc123',
          commit: {
            message: 'feat: add new feature',
            author: { name: 'Test User', date: '2024-12-20T10:00:00Z' },
          },
          author: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
        },
      ],
      contributors: [
        { login: 'testuser', avatar_url: 'https://example.com/avatar.png', contributions: 50 },
      ],
      releases: [
        { tag_name: 'v1.0.0', name: 'Release 1.0.0', published_at: '2024-12-01T00:00:00Z' },
      ],
      branches: [
        { name: 'main', protected: true },
        { name: 'develop', protected: false },
      ],
      languages: { TypeScript: 80000, JavaScript: 10000, CSS: 5000 },
      isLoading: false,
      fromCache: true,
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Verify main content is displayed
    expect(screen.getByText('GitHub Dashboard')).toBeInTheDocument();
    expect(screen.getByText('test/repo')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should match empty state snapshot (no repo info)', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      isLoading: false,
      repoInfo: null,
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Should show header but no content
    expect(screen.getByText('GitHub Dashboard')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should match syncing state snapshot', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      repoInfo: mockRepoInfo,
    });

    mockUseGitHubFullSync.mockReturnValue({
      ...defaultSyncValues,
      isSyncing: true,
      progress: { phase: 'uploading', current: 5, total: 10 },
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Verify syncing state
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should match auto-sync enabled state snapshot', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      repoInfo: mockRepoInfo,
    });

    mockUseAutoSync.mockReturnValue({
      ...defaultAutoSyncValues,
      isEnabled: true,
      interval: 60,
      lastRun: new Date().toISOString(),
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Verify auto-sync badge
    expect(screen.getByText('🔄 Auto')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should match cache loaded state snapshot', () => {
    mockUseGitHubStats.mockReturnValue({
      ...defaultMockValues,
      repoInfo: mockRepoInfo,
      fromCache: true,
      cacheStats: { hits: 5, misses: 1, size: 3 },
    });

    const { container } = render(<GitHubDashboard />, { wrapper });

    // Main content should be displayed
    expect(screen.getByText('GitHub Dashboard')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
