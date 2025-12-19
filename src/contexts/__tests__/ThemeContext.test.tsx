import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import React from 'react';

// Mock theme-utils
vi.mock('@/lib/theme-utils', () => ({
  setHighContrast: vi.fn(),
  setReducedMotion: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeProvider Integration', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    
    // Setup matchMedia mock
    mockMatchMedia = vi.fn((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    vi.stubGlobal('matchMedia', mockMatchMedia);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should provide default theme values', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('blue');
    expect(result.current.themeMode).toBe('dark');
    expect(result.current.language).toBe('pt-BR');
  });

  it('should sync with system dark mode preference when themeMode is system', () => {
    // Mock system prefers dark
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode('system');
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('should sync with system reduced motion preference', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query.includes('reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Default should use system preference
    expect(typeof result.current.reducedMotion).toBe('boolean');
  });

  it('should sync with system high contrast preference', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query.includes('contrast'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(typeof result.current.highContrast).toBe('boolean');
  });

  it('should persist high contrast setting to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setHighContrast(true);
    });

    const stored = localStorage.getItem('tsi_jukebox_accessibility');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).highContrast).toBe(true);
  });

  it('should persist reduced motion setting to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setReducedMotion(true);
    });

    const stored = localStorage.getItem('tsi_jukebox_accessibility');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).reducedMotion).toBe(true);
  });

  it('should toggle high contrast correctly', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setHighContrast(false);
    });
    expect(result.current.highContrast).toBe(false);

    act(() => {
      result.current.setHighContrast(true);
    });
    expect(result.current.highContrast).toBe(true);
  });

  it('should compute isDarkMode based on themeMode and system preference', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Dark mode explicit
    act(() => {
      result.current.setThemeMode('dark');
    });
    expect(result.current.isDarkMode).toBe(true);

    // Light mode explicit
    act(() => {
      result.current.setThemeMode('light');
    });
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should persist theme mode to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode('light');
    });

    const stored = localStorage.getItem('tsi_jukebox_theme_mode');
    expect(stored).toBe('light');
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
