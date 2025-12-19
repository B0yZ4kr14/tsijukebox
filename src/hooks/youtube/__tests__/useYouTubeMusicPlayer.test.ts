import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYouTubeMusicPlayer } from '../useYouTubeMusicPlayer';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { toast } from 'sonner';

vi.mock('@/lib/api/youtubeMusic', () => ({
  youtubeMusicClient: {
    play: vi.fn(),
    pause: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    addToQueue: vi.fn(),
  },
}));

describe('useYouTubeMusicPlayer', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides play function', () => {
    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    expect(typeof result.current.play).toBe('function');
  });

  it('provides pause function', () => {
    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    expect(typeof result.current.pause).toBe('function');
  });

  it('provides next function', () => {
    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    expect(typeof result.current.next).toBe('function');
  });

  it('provides previous function', () => {
    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    expect(typeof result.current.previous).toBe('function');
  });

  it('calls youtubeMusicClient.play when playing', async () => {
    vi.mocked(youtubeMusicClient.play).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      await result.current.play('video-123');
    });

    expect(youtubeMusicClient.play).toHaveBeenCalledWith('video-123');
  });

  it('calls youtubeMusicClient.pause when pausing', async () => {
    vi.mocked(youtubeMusicClient.pause).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      await result.current.pause();
    });

    expect(youtubeMusicClient.pause).toHaveBeenCalled();
  });

  it('calls youtubeMusicClient.next when skipping', async () => {
    vi.mocked(youtubeMusicClient.next).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      await result.current.next();
    });

    expect(youtubeMusicClient.next).toHaveBeenCalled();
  });

  it('calls youtubeMusicClient.previous when going back', async () => {
    vi.mocked(youtubeMusicClient.previous).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      await result.current.previous();
    });

    expect(youtubeMusicClient.previous).toHaveBeenCalled();
  });

  it('calls youtubeMusicClient.seek when seeking', async () => {
    vi.mocked(youtubeMusicClient.seek).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      await result.current.seek(30000);
    });

    expect(youtubeMusicClient.seek).toHaveBeenCalledWith(30000);
  });

  it('calls youtubeMusicClient.setVolume when changing volume', async () => {
    vi.mocked(youtubeMusicClient.setVolume).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      await result.current.setVolume(75);
    });

    expect(youtubeMusicClient.setVolume).toHaveBeenCalledWith(75);
  });

  it('handles errors gracefully', async () => {
    vi.mocked(youtubeMusicClient.play).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useYouTubeMusicPlayer(), { wrapper });

    await act(async () => {
      try {
        await result.current.play('video-123');
      } catch {
        // Error expected
      }
    });

    expect(toast.error).toHaveBeenCalled();
  });
});
