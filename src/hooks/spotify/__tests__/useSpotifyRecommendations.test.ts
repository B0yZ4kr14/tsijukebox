import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSpotifyRecommendations } from '../useSpotifyRecommendations';
import { spotifyClient } from '@/lib/api/spotify';
import { useSettings } from '@/contexts/SettingsContext';
import { createTestWrapper } from '@/test/utils/testWrapper';
import { mockSpotifyTrack } from '@/test/mocks/spotifyMocks';

vi.mock('@/lib/api/spotify', () => ({
  spotifyClient: {
    getRecommendations: vi.fn(),
  },
}));

describe('useSpotifyRecommendations', () => {
  const wrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: true },
    } as ReturnType<typeof useSettings>);
  });

  it('returns empty array without seeds', () => {
    const { result } = renderHook(() => useSpotifyRecommendations(), { wrapper });

    expect(result.current.recommendations).toEqual([]);
    expect(spotifyClient.getRecommendations).not.toHaveBeenCalled();
  });

  it('fetches recommendations with seed track', async () => {
    vi.mocked(spotifyClient.getRecommendations).mockResolvedValue([mockSpotifyTrack]);

    const { result } = renderHook(
      () => useSpotifyRecommendations({ seedTrackId: 'track-1' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.recommendations).toHaveLength(1);
    });

    expect(spotifyClient.getRecommendations).toHaveBeenCalledWith({
      seedTracks: ['track-1'],
      seedArtists: [],
      seedGenres: [],
      limit: 20,
    });
  });

  it('fetches recommendations with seed artists', async () => {
    vi.mocked(spotifyClient.getRecommendations).mockResolvedValue([mockSpotifyTrack]);

    const { result } = renderHook(
      () => useSpotifyRecommendations({ seedArtistIds: ['artist-1', 'artist-2'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.recommendations).toHaveLength(1);
    });

    expect(spotifyClient.getRecommendations).toHaveBeenCalledWith({
      seedTracks: [],
      seedArtists: ['artist-1', 'artist-2'],
      seedGenres: [],
      limit: 20,
    });
  });

  it('fetches recommendations with seed genres', async () => {
    vi.mocked(spotifyClient.getRecommendations).mockResolvedValue([mockSpotifyTrack]);

    const { result } = renderHook(
      () => useSpotifyRecommendations({ seedGenres: ['pop', 'rock'] }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.recommendations).toHaveLength(1);
    });
  });

  it('respects limit parameter', async () => {
    vi.mocked(spotifyClient.getRecommendations).mockResolvedValue([mockSpotifyTrack]);

    renderHook(
      () => useSpotifyRecommendations({ seedTrackId: 'track-1', limit: 10 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(spotifyClient.getRecommendations).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });
  });

  it('respects enabled parameter', () => {
    const { result } = renderHook(
      () => useSpotifyRecommendations({ seedTrackId: 'track-1', enabled: false }),
      { wrapper }
    );

    expect(result.current.recommendations).toEqual([]);
    expect(spotifyClient.getRecommendations).not.toHaveBeenCalled();
  });

  it('provides refetch function', () => {
    const { result } = renderHook(
      () => useSpotifyRecommendations({ seedTrackId: 'track-1' }),
      { wrapper }
    );

    expect(typeof result.current.refetch).toBe('function');
  });

  it('tracks connection state', () => {
    vi.mocked(useSettings).mockReturnValue({
      spotify: { isConnected: false },
    } as ReturnType<typeof useSettings>);

    const { result } = renderHook(() => useSpotifyRecommendations(), { wrapper });

    expect(result.current.isConnected).toBe(false);
  });
});
