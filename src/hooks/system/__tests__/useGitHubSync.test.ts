import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGitHubSync } from '../useGitHubSync';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '@/integrations/supabase/client';

const mockCommitData = {
  success: true,
  data: [
    {
      sha: 'abc123def456',
      commit: {
        message: 'feat: Add new feature\n\nDetailed description',
        author: {
          name: 'Test Author',
          date: '2024-01-15T10:30:00Z',
        },
      },
      author: {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
      },
      html_url: 'https://github.com/repo/commit/abc123',
    },
  ],
};

const mockRepoData = {
  success: true,
  data: {
    pushed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    default_branch: 'main',
    html_url: 'https://github.com/B0yZ4kr14/TSiJUKEBOX',
  },
};

describe('useGitHubSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null sync status', () => {
    const { result } = renderHook(() => useGitHubSync());
    
    expect(result.current.syncStatus).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastRefresh).toBeNull();
  });

  it('should fetch sync status successfully', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke
      .mockResolvedValueOnce({ data: mockCommitData, error: null })
      .mockResolvedValueOnce({ data: mockRepoData, error: null });

    const { result } = renderHook(() => useGitHubSync());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.syncStatus).not.toBeNull();
    expect(result.current.syncStatus?.lastCommit?.sha).toBe('abc123d');
    expect(result.current.syncStatus?.lastCommit?.message).toBe('feat: Add new feature');
    expect(result.current.syncStatus?.branch).toBe('main');
    expect(result.current.lastRefresh).toBeInstanceOf(Date);
  });

  it('should handle API errors gracefully', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({ 
      data: null, 
      error: { message: 'API Error' } 
    });

    const { result } = renderHook(() => useGitHubSync());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.syncStatus).toBeNull();
  });

  it('should parse commit data correctly', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke
      .mockResolvedValueOnce({ data: mockCommitData, error: null })
      .mockResolvedValueOnce({ data: mockRepoData, error: null });

    const { result } = renderHook(() => useGitHubSync());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.syncStatus?.lastCommit).toBeDefined();
    });

    const lastCommit = result.current.syncStatus?.lastCommit;
    expect(lastCommit?.author).toBe('Test Author');
    expect(lastCommit?.url).toBe('https://github.com/repo/commit/abc123');
  });

  it('should determine sync status based on timestamps', async () => {
    const recentPush = new Date();
    const mockRepoDataRecent = {
      success: true,
      data: {
        pushed_at: recentPush.toISOString(),
        updated_at: recentPush.toISOString(),
        default_branch: 'main',
        html_url: 'https://github.com/B0yZ4kr14/TSiJUKEBOX',
      },
    };

    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke
      .mockResolvedValueOnce({ data: mockCommitData, error: null })
      .mockResolvedValueOnce({ data: mockRepoDataRecent, error: null });

    const { result } = renderHook(() => useGitHubSync());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.syncStatus?.syncStatus).toBe('synced');
    });
  });

  it('should handle empty commit array', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke
      .mockResolvedValueOnce({ data: { success: true, data: [] }, error: null })
      .mockResolvedValueOnce({ data: mockRepoData, error: null });

    const { result } = renderHook(() => useGitHubSync());

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.syncStatus?.lastCommit).toBeNull();
  });

  it('should refresh data when requested', async () => {
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke
      .mockResolvedValueOnce({ data: mockCommitData, error: null })
      .mockResolvedValueOnce({ data: mockRepoData, error: null });

    const { result } = renderHook(() => useGitHubSync());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockInvoke).toHaveBeenCalledWith('github-repo', {
      body: { action: 'last-commit' },
    });
    expect(mockInvoke).toHaveBeenCalledWith('github-repo', {
      body: { action: 'sync-status' },
    });
  });
});
