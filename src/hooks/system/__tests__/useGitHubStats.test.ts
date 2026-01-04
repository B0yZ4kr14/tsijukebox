import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGitHubStats } from '../useGitHubStats';
import * as cacheModule from '../useGitHubCache';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

// Mock cache functions
vi.mock('../useGitHubCache', () => ({
  getFromCache: vi.fn(),
  setToCache: vi.fn(),
  clearCache: vi.fn(),
  getCacheStats: vi.fn(() => ({ size: 0, keys: [], lastUpdate: null })),
}));

const mockRepoInfo = {
  name: 'test-repo',
  full_name: 'owner/test-repo',
  description: 'A test repository',
  stargazers_count: 100,
  forks_count: 50,
  watchers_count: 75,
  open_issues_count: 10,
  topics: ['typescript', 'react'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  pushed_at: '2024-06-15T00:00:00Z',
  default_branch: 'main',
  size: 1024,
  language: 'TypeScript',
  html_url: 'https://github.com/owner/test-repo',
};

const mockCommits = [
  {
    sha: 'abc123',
    commit: {
      message: 'Initial commit',
      author: { name: 'Test User', date: '2024-06-01T00:00:00Z' },
    },
    author: { login: 'testuser', avatar_url: 'https://example.com/avatar.png' },
    html_url: 'https://github.com/owner/test-repo/commit/abc123',
  },
];

const mockContributors = [
  {
    login: 'testuser',
    avatar_url: 'https://example.com/avatar.png',
    contributions: 50,
    html_url: 'https://github.com/testuser',
  },
];

const mockReleases = [
  {
    id: 1,
    tag_name: 'v1.0.0',
    name: 'Version 1.0.0',
    published_at: '2024-06-01T00:00:00Z',
    html_url: 'https://github.com/owner/test-repo/releases/tag/v1.0.0',
    prerelease: false,
    draft: false,
  },
];

const mockBranches = [
  { name: 'main', protected: true },
  { name: 'develop', protected: false },
];

const mockLanguages = {
  TypeScript: 80000,
  JavaScript: 15000,
  CSS: 5000,
};

describe('useGitHubStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset cache mocks
    vi.mocked(cacheModule.getFromCache).mockReturnValue(null);
    vi.mocked(cacheModule.getCacheStats).mockReturnValue({ size: 0, keys: [], lastUpdate: null });
    
    // Setup default successful API responses
    mockInvoke.mockImplementation(async (_functionName: string, options: { body: { action: string } }) => {
      const { action } = options.body;
      
      const responses: Record<string, unknown> = {
        'repo-info': mockRepoInfo,
        'commits': mockCommits,
        'contributors': mockContributors,
        'releases': mockReleases,
        'branches': mockBranches,
        'languages': mockLanguages,
      };

      return {
        data: { success: true, data: responses[action] },
        error: null,
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useGitHubStats());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.repoInfo).toBeNull();
    expect(result.current.commits).toEqual([]);
    expect(result.current.contributors).toEqual([]);
  });

  it('should fetch all GitHub data on mount', async () => {
    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.repoInfo).toEqual(mockRepoInfo);
    expect(result.current.commits).toEqual(mockCommits);
    expect(result.current.contributors).toEqual(mockContributors);
    expect(result.current.releases).toEqual(mockReleases);
    expect(result.current.branches).toEqual(mockBranches);
    expect(result.current.languages).toEqual(mockLanguages);
  });

  it('should handle API errors gracefully', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error('API Error'),
    });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Falha ao carregar dados do GitHub');
    expect(result.current.repoInfo).toBeNull();
  });

  it('should use cache when available', async () => {
    vi.mocked(cacheModule.getFromCache).mockImplementation((key: string) => {
      const cachedData: Record<string, unknown> = {
        'repo-info': mockRepoInfo,
        'commits': mockCommits,
        'contributors': mockContributors,
        'releases': mockReleases,
        'branches': mockBranches,
        'languages': mockLanguages,
      };
      return cachedData[key] ?? null;
    });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fromCache).toBe(true);
    expect(result.current.repoInfo).toEqual(mockRepoInfo);
    
    // Should not call API when cache is available
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('should force refresh when requested', async () => {
    // Setup cache first
    vi.mocked(cacheModule.getFromCache).mockReturnValue(mockRepoInfo);

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Force refresh
    await act(async () => {
      await result.current.refetch(true);
    });

    // Should call API even with cache
    expect(mockInvoke).toHaveBeenCalled();
  });

  it('should clear cache correctly', async () => {
    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.clearAllCache();
    });

    expect(cacheModule.clearCache).toHaveBeenCalled();
  });

  it('should handle partial API failure', async () => {
    mockInvoke.mockImplementation(async (_functionName: string, options: { body: { action: string } }) => {
      const { action } = options.body;
      
      if (action === 'commits') {
        return { data: { success: false, error: 'Failed to fetch commits' }, error: null };
      }

      return {
        data: { success: true, data: action === 'repo-info' ? mockRepoInfo : [] },
        error: null,
      };
    });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still have repo info even if commits failed
    expect(result.current.repoInfo).toEqual(mockRepoInfo);
    expect(result.current.commits).toEqual([]);
  });

  it('should update cache stats after operations', async () => {
    const mockStats = { size: 1024, keys: ['repo-info', 'commits'], lastUpdate: Date.now() };
    vi.mocked(cacheModule.getCacheStats).mockReturnValue(mockStats);

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cacheStats).toEqual(mockStats);
  });

  it('should set data to cache after fetching', async () => {
    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify setToCache was called for each data type
    expect(cacheModule.setToCache).toHaveBeenCalledWith('repo-info', mockRepoInfo);
    expect(cacheModule.setToCache).toHaveBeenCalledWith('commits', mockCommits);
    expect(cacheModule.setToCache).toHaveBeenCalledWith('contributors', mockContributors);
  });
});
