import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettingsOAuth } from '../useSettingsOAuth';

// Mock modules
const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

const mockSpotifyExchangeCode = vi.fn();
const mockSpotifyValidateToken = vi.fn();
const mockSpotifyGetAuthUrl = vi.fn();

vi.mock('@/lib/api/spotify', () => ({
  spotifyClient: {
    exchangeCode: (...args: unknown[]) => mockSpotifyExchangeCode(...args),
    validateToken: () => mockSpotifyValidateToken(),
    getAuthUrl: () => mockSpotifyGetAuthUrl(),
  },
}));

const mockYouTubeMusicExchangeCode = vi.fn();
const mockYouTubeMusicGetCurrentUser = vi.fn();

vi.mock('@/lib/api/youtubeMusic', () => ({
  youtubeMusicClient: {
    exchangeCode: (...args: unknown[]) => mockYouTubeMusicExchangeCode(...args),
    getCurrentUser: () => mockYouTubeMusicGetCurrentUser(),
  },
}));

const mockSetSpotifyTokens = vi.fn();
const mockSetSpotifyUser = vi.fn();
const mockClearSpotifyAuth = vi.fn();
const mockSetYouTubeMusicTokens = vi.fn();
const mockSetYouTubeMusicUser = vi.fn();

vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: () => ({
    spotify: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    },
    setSpotifyTokens: mockSetSpotifyTokens,
    setSpotifyUser: mockSetSpotifyUser,
    clearSpotifyAuth: mockClearSpotifyAuth,
    setYouTubeMusicTokens: mockSetYouTubeMusicTokens,
    setYouTubeMusicUser: mockSetYouTubeMusicUser,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useSettingsOAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('spotify_code');
    mockSearchParams.delete('code');
    mockSearchParams.delete('state');
    mockSearchParams.delete('spotify_error');
    mockSearchParams.delete('error');
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSettingsOAuth());

    expect(result.current.isProcessingCallback).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.oauthError).toBeNull();
  });

  it('should have required methods', () => {
    const { result } = renderHook(() => useSettingsOAuth());

    expect(typeof result.current.handleSpotifyConnect).toBe('function');
    expect(typeof result.current.handleSpotifyDisconnect).toBe('function');
    expect(typeof result.current.clearOAuthError).toBe('function');
  });

  it('should handle Spotify connect when credentials are valid', async () => {
    mockSpotifyGetAuthUrl.mockResolvedValue({ authUrl: 'https://spotify.com/auth' });
    
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
    });

    const { result } = renderHook(() => useSettingsOAuth());

    await act(async () => {
      await result.current.handleSpotifyConnect();
    });

    expect(mockSpotifyGetAuthUrl).toHaveBeenCalled();
    
    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should handle Spotify disconnect', () => {
    const { result } = renderHook(() => useSettingsOAuth());

    act(() => {
      result.current.handleSpotifyDisconnect();
    });

    expect(mockClearSpotifyAuth).toHaveBeenCalled();
  });

  it('should clear OAuth error', () => {
    const { result } = renderHook(() => useSettingsOAuth());

    act(() => {
      result.current.clearOAuthError();
    });

    expect(result.current.oauthError).toBeNull();
  });

  it('should return correct interface shape', () => {
    const { result } = renderHook(() => useSettingsOAuth());

    expect(result.current).toHaveProperty('isProcessingCallback');
    expect(result.current).toHaveProperty('isConnecting');
    expect(result.current).toHaveProperty('oauthError');
    expect(result.current).toHaveProperty('handleSpotifyConnect');
    expect(result.current).toHaveProperty('handleSpotifyDisconnect');
    expect(result.current).toHaveProperty('clearOAuthError');
  });
});
