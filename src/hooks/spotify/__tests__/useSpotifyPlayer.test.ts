import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpotifyPlayer } from '../useSpotifyPlayer';
import { api } from '@/lib/api/client';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { toast } from 'sonner';

vi.mock('@/lib/api/client', () => ({
  api: {
    playSpotifyUri: vi.fn(),
  },
}));

describe('useSpotifyPlayer', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides playTrack function', () => {
    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    expect(typeof result.current.playTrack).toBe('function');
  });

  it('provides playPlaylist function', () => {
    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    expect(typeof result.current.playPlaylist).toBe('function');
  });

  it('provides playAlbum function', () => {
    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    expect(typeof result.current.playAlbum).toBe('function');
  });

  it('provides playArtist function', () => {
    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    expect(typeof result.current.playArtist).toBe('function');
  });

  it('calls api.playSpotifyUri when playing track', async () => {
    vi.mocked(api.playSpotifyUri).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    act(() => {
      result.current.playTrack('spotify:track:123');
    });

    expect(api.playSpotifyUri).toHaveBeenCalledWith('spotify:track:123');
    expect(toast.success).toHaveBeenCalledWith('Reproduzindo...', { icon: '▶️' });
  });

  it('calls api.playSpotifyUri when playing playlist', async () => {
    vi.mocked(api.playSpotifyUri).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    act(() => {
      result.current.playPlaylist('spotify:playlist:123');
    });

    expect(api.playSpotifyUri).toHaveBeenCalledWith('spotify:playlist:123');
    expect(toast.success).toHaveBeenCalledWith('Reproduzindo playlist...', { icon: '▶️' });
  });

  it('tracks isPlaying state', () => {
    const { result } = renderHook(() => useSpotifyPlayer(), { wrapper });

    expect(result.current.isPlaying).toBe(false);
  });
});
