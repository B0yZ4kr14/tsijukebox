// Context templates for GitHub sync - 8 arquivos

const VERSION = '2.1.0';
const UPDATED = new Date().toISOString().split('T')[0];

export function generateContextContent(path: string): string | null {
  const templates: Record<string, string> = {
    'src/contexts/AppSettingsContext.tsx': `/**
 * TSiJUKEBOX - App Settings Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Global application settings context provider
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoPlay: boolean;
  crossfade: boolean;
  crossfadeDuration: number;
  normalization: boolean;
  gapless: boolean;
  highQuality: boolean;
  showNotifications: boolean;
  kioskMode: boolean;
  debugMode: boolean;
}

interface AppSettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'pt-BR',
  autoPlay: true,
  crossfade: true,
  crossfadeDuration: 5,
  normalization: true,
  gapless: true,
  highQuality: true,
  showNotifications: true,
  kioskMode: false,
  debugMode: false,
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo(() => ({
    settings,
    updateSetting,
    resetSettings,
    isLoading,
  }), [settings, updateSetting, resetSettings, isLoading]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}

export { AppSettingsContext };
`,

    'src/contexts/JamContext.tsx': `/**
 * TSiJUKEBOX - Jam Session Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Real-time collaborative listening session management
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

export interface JamParticipant {
  id: string;
  nickname: string;
  avatarColor: string;
  isHost: boolean;
  isActive: boolean;
  lastSeenAt: string;
}

export interface JamSession {
  id: string;
  code: string;
  name: string;
  hostId: string;
  hostNickname: string;
  isActive: boolean;
  privacy: 'public' | 'private';
  maxParticipants: number;
  currentTrack: any | null;
  playbackState: any | null;
}

export interface JamQueueItem {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  addedBy: string;
  addedByNickname: string;
  votes: number;
  position: number;
}

interface JamContextValue {
  session: JamSession | null;
  participants: JamParticipant[];
  queue: JamQueueItem[];
  isHost: boolean;
  isConnected: boolean;
  createSession: (name: string, nickname: string) => Promise<string>;
  joinSession: (code: string, nickname: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  addToQueue: (track: any) => Promise<void>;
  voteTrack: (queueItemId: string, vote: 1 | -1) => Promise<void>;
  skipTrack: () => Promise<void>;
  sendReaction: (emoji: string) => void;
}

const JamContext = createContext<JamContextValue | undefined>(undefined);

export function JamProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<JamSession | null>(null);
  const [participants, setParticipants] = useState<JamParticipant[]>([]);
  const [queue, setQueue] = useState<JamQueueItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const isHost = useMemo(() => {
    if (!session) return false;
    return participants.some(p => p.isHost && p.isActive);
  }, [session, participants]);

  const createSession = useCallback(async (name: string, nickname: string): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    // Implementation with Supabase
    return code;
  }, []);

  const joinSession = useCallback(async (code: string, nickname: string): Promise<boolean> => {
    // Implementation with Supabase
    return true;
  }, []);

  const leaveSession = useCallback(async () => {
    setSession(null);
    setParticipants([]);
    setQueue([]);
    setIsConnected(false);
  }, []);

  const addToQueue = useCallback(async (track: any) => {
    // Implementation
  }, [session]);

  const voteTrack = useCallback(async (queueItemId: string, vote: 1 | -1) => {
    // Implementation
  }, []);

  const skipTrack = useCallback(async () => {
    // Implementation
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    // Implementation
  }, [session]);

  const value = useMemo(() => ({
    session,
    participants,
    queue,
    isHost,
    isConnected,
    createSession,
    joinSession,
    leaveSession,
    addToQueue,
    voteTrack,
    skipTrack,
    sendReaction,
  }), [session, participants, queue, isHost, isConnected, createSession, joinSession, leaveSession, addToQueue, voteTrack, skipTrack, sendReaction]);

  return (
    <JamContext.Provider value={value}>
      {children}
    </JamContext.Provider>
  );
}

export function useJam() {
  const context = useContext(JamContext);
  if (!context) {
    throw new Error('useJam must be used within JamProvider');
  }
  return context;
}

export { JamContext };
`,

    'src/contexts/SettingsContext.tsx': `/**
 * TSiJUKEBOX - Settings Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * User preferences and configuration management
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

export interface UserSettings {
  // Audio
  volume: number;
  muted: boolean;
  equalizer: number[];
  
  // Display
  showLyrics: boolean;
  showVisualizer: boolean;
  visualizerType: 'bars' | 'wave' | 'circular';
  albumArtSize: 'small' | 'medium' | 'large';
  
  // Behavior
  confirmSkip: boolean;
  rememberPosition: boolean;
  scrobbleEnabled: boolean;
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const defaultSettings: UserSettings = {
  volume: 80,
  muted: false,
  equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  showLyrics: true,
  showVisualizer: true,
  visualizerType: 'bars',
  albumArtSize: 'medium',
  confirmSkip: false,
  rememberPosition: true,
  scrobbleEnabled: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const stored = localStorage.getItem('tsi-settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('tsi-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      setSettings({ ...defaultSettings, ...parsed });
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    settings,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  }), [settings, updateSettings, resetToDefaults, exportSettings, importSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

export { SettingsContext };
`,

    'src/contexts/SpotifyContext.tsx': `/**
 * TSiJUKEBOX - Spotify Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Spotify API authentication and playback management
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string;
  product: 'free' | 'premium';
  country: string;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SpotifySettings {
  clientId: string;
  clientSecret: string;
  tokens: SpotifyTokens | null;
  user: SpotifyUser | null;
  isConnected: boolean;
}

interface SpotifyContextValue {
  settings: SpotifySettings;
  isConnected: boolean;
  user: SpotifyUser | null;
  setCredentials: (clientId: string, clientSecret: string) => void;
  setTokens: (tokens: SpotifyTokens) => void;
  setUser: (user: SpotifyUser) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const defaultSettings: SpotifySettings = {
  clientId: '',
  clientSecret: '',
  tokens: null,
  user: null,
  isConnected: false,
};

const SpotifyContext = createContext<SpotifyContextValue | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SpotifySettings>(defaultSettings);

  const setCredentials = useCallback((clientId: string, clientSecret: string) => {
    setSettings(prev => ({ ...prev, clientId, clientSecret }));
  }, []);

  const setTokens = useCallback((tokens: SpotifyTokens) => {
    setSettings(prev => ({ ...prev, tokens, isConnected: true }));
  }, []);

  const setUser = useCallback((user: SpotifyUser) => {
    setSettings(prev => ({ ...prev, user }));
  }, []);

  const clearAuth = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      tokens: null,
      user: null,
      isConnected: false,
    }));
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!settings.tokens?.refreshToken) return false;
    // Implementation with Spotify API
    return true;
  }, [settings.tokens]);

  const value = useMemo(() => ({
    settings,
    isConnected: settings.isConnected,
    user: settings.user,
    setCredentials,
    setTokens,
    setUser,
    clearAuth,
    refreshAccessToken,
  }), [settings, setCredentials, setTokens, setUser, clearAuth, refreshAccessToken]);

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within SpotifyProvider');
  }
  return context;
}

export { SpotifyContext };
`,

    'src/contexts/ThemeContext.tsx': `/**
 * TSiJUKEBOX - Theme Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Dynamic theming and color extraction
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  adaptiveColors: boolean;
  extractedColor?: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

interface ThemeContextValue {
  theme: ThemeConfig;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  setExtractedColor: (color: string) => void;
  toggleAdaptiveColors: () => void;
  setRadius: (radius: ThemeConfig['radius']) => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'system',
  colors: {
    primary: 'hsl(262, 83%, 58%)',
    secondary: 'hsl(240, 4.8%, 95.9%)',
    accent: 'hsl(240, 4.8%, 95.9%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(240, 10%, 3.9%)',
    muted: 'hsl(240, 4.8%, 95.9%)',
    mutedForeground: 'hsl(240, 3.8%, 46.1%)',
  },
  adaptiveColors: true,
  radius: 'md',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedMode = useMemo(() => {
    return theme.mode === 'system' ? systemMode : theme.mode;
  }, [theme.mode, systemMode]);

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme(prev => ({ ...prev, mode }));
  }, []);

  const setColors = useCallback((colors: Partial<ThemeColors>) => {
    setTheme(prev => ({ ...prev, colors: { ...prev.colors, ...colors } }));
  }, []);

  const setExtractedColor = useCallback((color: string) => {
    setTheme(prev => ({ ...prev, extractedColor: color }));
  }, []);

  const toggleAdaptiveColors = useCallback(() => {
    setTheme(prev => ({ ...prev, adaptiveColors: !prev.adaptiveColors }));
  }, []);

  const setRadius = useCallback((radius: ThemeConfig['radius']) => {
    setTheme(prev => ({ ...prev, radius }));
  }, []);

  const value = useMemo(() => ({
    theme,
    resolvedMode,
    setMode,
    setColors,
    setExtractedColor,
    toggleAdaptiveColors,
    setRadius,
  }), [theme, resolvedMode, setMode, setColors, setExtractedColor, toggleAdaptiveColors, setRadius]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export { ThemeContext };
`,

    'src/contexts/UserContext.tsx': `/**
 * TSiJUKEBOX - User Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * User authentication and permissions management
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

export type UserRole = 'admin' | 'user' | 'newbie';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageLibrary: boolean;
  canCreatePlaylists: boolean;
  canDeleteTracks: boolean;
  canAccessKiosk: boolean;
  canViewStats: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const defaultPermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canManageUsers: true,
    canManageSettings: true,
    canManageLibrary: true,
    canCreatePlaylists: true,
    canDeleteTracks: true,
    canAccessKiosk: true,
    canViewStats: true,
  },
  user: {
    canManageUsers: false,
    canManageSettings: false,
    canManageLibrary: true,
    canCreatePlaylists: true,
    canDeleteTracks: false,
    canAccessKiosk: true,
    canViewStats: true,
  },
  newbie: {
    canManageUsers: false,
    canManageSettings: false,
    canManageLibrary: false,
    canCreatePlaylists: false,
    canDeleteTracks: false,
    canAccessKiosk: true,
    canViewStats: false,
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Implementation
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      // Implementation
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
    if (!user) return false;
    return user.permissions[permission] ?? false;
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<AppUser>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signUp,
    hasPermission,
    updateProfile,
  }), [user, isLoading, login, logout, signUp, hasPermission, updateProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

export { UserContext };
`,

    'src/contexts/YouTubeMusicContext.tsx': `/**
 * TSiJUKEBOX - YouTube Music Context
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * YouTube Music API integration and playback
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface YouTubeMusicUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface YouTubeMusicSettings {
  apiKey: string;
  isConnected: boolean;
  user: YouTubeMusicUser | null;
  preferredQuality: 'low' | 'medium' | 'high';
  autoplay: boolean;
}

interface YouTubeMusicContextValue {
  settings: YouTubeMusicSettings;
  isConnected: boolean;
  user: YouTubeMusicUser | null;
  setApiKey: (key: string) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  setPreferredQuality: (quality: YouTubeMusicSettings['preferredQuality']) => void;
  search: (query: string) => Promise<any[]>;
}

const defaultSettings: YouTubeMusicSettings = {
  apiKey: '',
  isConnected: false,
  user: null,
  preferredQuality: 'high',
  autoplay: true,
};

const YouTubeMusicContext = createContext<YouTubeMusicContextValue | undefined>(undefined);

export function YouTubeMusicProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<YouTubeMusicSettings>(defaultSettings);

  const setApiKey = useCallback((key: string) => {
    setSettings(prev => ({ ...prev, apiKey: key }));
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    if (!settings.apiKey) return false;
    // Implementation
    setSettings(prev => ({ ...prev, isConnected: true }));
    return true;
  }, [settings.apiKey]);

  const disconnect = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      isConnected: false,
      user: null,
    }));
  }, []);

  const setPreferredQuality = useCallback((quality: YouTubeMusicSettings['preferredQuality']) => {
    setSettings(prev => ({ ...prev, preferredQuality: quality }));
  }, []);

  const search = useCallback(async (query: string): Promise<any[]> => {
    if (!settings.isConnected) return [];
    // Implementation
    return [];
  }, [settings.isConnected]);

  const value = useMemo(() => ({
    settings,
    isConnected: settings.isConnected,
    user: settings.user,
    setApiKey,
    connect,
    disconnect,
    setPreferredQuality,
    search,
  }), [settings, setApiKey, connect, disconnect, setPreferredQuality, search]);

  return (
    <YouTubeMusicContext.Provider value={value}>
      {children}
    </YouTubeMusicContext.Provider>
  );
}

export function useYouTubeMusic() {
  const context = useContext(YouTubeMusicContext);
  if (!context) {
    throw new Error('useYouTubeMusic must be used within YouTubeMusicProvider');
  }
  return context;
}

export { YouTubeMusicContext };
`,

    'src/contexts/index.ts': `/**
 * TSiJUKEBOX - Contexts Index
 * @version ${VERSION}
 * @updated ${UPDATED}
 * 
 * Central export for all React contexts
 */

// App Settings
export { AppSettingsContext, AppSettingsProvider, useAppSettings } from './AppSettingsContext';
export type { AppSettings } from './AppSettingsContext';

// Jam Sessions
export { JamContext, JamProvider, useJam } from './JamContext';
export type { JamSession, JamParticipant, JamQueueItem } from './JamContext';

// User Settings
export { SettingsContext, SettingsProvider, useSettings } from './SettingsContext';
export type { UserSettings } from './SettingsContext';

// Spotify Integration
export { SpotifyContext, SpotifyProvider, useSpotify } from './SpotifyContext';
export type { SpotifyUser, SpotifyTokens, SpotifySettings } from './SpotifyContext';

// Theme
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
export type { ThemeMode, ThemeColors, ThemeConfig } from './ThemeContext';

// User Authentication
export { UserContext, UserProvider, useUser } from './UserContext';
export type { AppUser, UserRole, UserPermissions } from './UserContext';

// YouTube Music
export { YouTubeMusicContext, YouTubeMusicProvider, useYouTubeMusic } from './YouTubeMusicContext';
export type { YouTubeMusicUser, YouTubeMusicSettings } from './YouTubeMusicContext';
`,
  };

  return templates[path] ?? null;
}
