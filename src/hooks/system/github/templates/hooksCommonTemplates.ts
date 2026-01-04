// Templates for Hooks Common (22 files)

export function generateHooksCommonContent(path: string): string | null {
  switch (path) {
    case 'src/hooks/common/index.ts':
      return `// Common hooks barrel export
export { useDebounce } from './useDebounce';
export { useTranslation } from './useTranslation';
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';
export { useRipple, type Ripple } from './useRipple';
export { useTouchGestures } from './useTouchGestures';
export { useSoundEffects } from './useSoundEffects';
export { useFirstAccess } from './useFirstAccess';
export { useGlobalSearch } from './useGlobalSearch';
export { usePWAInstall } from './usePWAInstall';
export { useReadArticles } from './useReadArticles';
export { useSettingsNotifications, type SettingsNotification } from './useSettingsNotifications';
export { useSettingsStatus, type SettingsCategoryId, type CategoryStatus, type StatusLevel } from './useSettingsStatus';
export { useSettingsTour, type SettingsTourId } from './useSettingsTour';
export { 
  useThemeCustomizer, 
  builtInPresets, 
  defaultColors, 
  hslToHex, 
  hexToHsl,
  applyCustomColors,
  type CustomThemeColors, 
  type ThemePreset 
} from './useThemeCustomizer';
export { useWikiBookmarks } from './useWikiBookmarks';
export { useBackNavigation } from './useBackNavigation';
export { useNotifications, type Notification } from './useNotifications';
export { 
  useSettingsSelector, 
  shallowEqual,
  selectTheme,
  selectLanguage,
  selectIsDemoMode,
  selectMusicProvider,
  selectSpotify,
  selectYoutubeMusic,
  selectAnimationsEnabled,
  selectSoundEnabled 
} from './useSettingsSelector';
`;

    case 'src/hooks/common/use-mobile.tsx':
      return `import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(\`(max-width: \${MOBILE_BREAKPOINT - 1}px)\`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
`;

    case 'src/hooks/common/use-toast.ts':
      return `import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) addToRemoveQueue(toastId);
      else state.toasts.forEach((t) => addToRemoveQueue(t.id));
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();
  const update = (props: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({ type: "ADD_TOAST", toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss(); } } });

  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, [state]);

  return { ...state, toast, dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }) };
}

export { useToast, toast };
`;

    case 'src/hooks/common/useBackNavigation.ts':
      return `import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export interface UseBackNavigationOptions {
  fallbackPath?: string;
  showToast?: boolean;
  toastMessage?: string;
}

export function useBackNavigation(options: UseBackNavigationOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    fallbackPath = '/',
    showToast = true,
    toastMessage = 'Redirecionando para a página inicial'
  } = options;

  const goBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallbackPath);
      if (showToast) {
        toast.info(toastMessage);
      }
    }
  };

  const hasHistory = location.key !== 'default';

  return { goBack, hasHistory, navigate, location };
}
`;

    case 'src/hooks/common/useDebounce.ts':
      return `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
`;

    case 'src/hooks/common/useFirstAccess.ts':
      return `import { STORAGE_KEYS } from '@/lib/constants';

export function useFirstAccess() {
  const isFirstAccess = !localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE);
  
  const markSetupComplete = () => {
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
  };
  
  const resetSetup = () => {
    localStorage.removeItem(STORAGE_KEYS.SETUP_COMPLETE);
  };

  return { isFirstAccess, markSetupComplete, resetSetup };
}
`;

    case 'src/hooks/common/useGlobalSearch.ts':
      return `import { useState, useMemo, useEffect, useCallback } from 'react';
import { searchHelp, searchWiki, SearchFilters, HelpSection } from '@/lib/globalSearch';

interface UseGlobalSearchProps {
  helpSections?: HelpSection[];
}

export function useGlobalSearch({ helpSections = [] }: UseGlobalSearchProps = {}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sources: ['help', 'wiki'],
    categories: []
  });

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const helpResults = searchHelp(query, helpSections, filters);
    const wikiResults = searchWiki(query, filters);
    
    return [...helpResults, ...wikiResults]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 25);
  }, [query, filters, helpSections]);

  const toggleSource = useCallback((source: 'help' | 'wiki') => {
    setFilters(prev => {
      const sources = prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source];
      return { ...prev, sources: sources.length > 0 ? sources : ['help', 'wiki'] };
    });
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ sources: ['help', 'wiki'], categories: [] });
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    clearFilters();
  }, [clearFilters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        clearSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, clearSearch]);

  return {
    query, setQuery, results, filters,
    toggleSource, toggleCategory, clearFilters, clearSearch,
    isOpen, setIsOpen,
    resultCount: results.length,
    helpCount: results.filter(r => r.source === 'help').length,
    wikiCount: results.filter(r => r.source === 'wiki').length
  };
}
`;

    case 'src/hooks/common/useMediaProviderStorage.ts':
      return `import { useState, useEffect, useCallback } from 'react';

interface MediaProviderClient {
  setToken?: (token: string) => void;
  clearToken?: () => void;
  setCredentials?: (clientId: string, clientSecret: string) => void;
  validateToken?: () => Promise<boolean>;
}

interface MediaProviderStorageConfig<T> {
  storageKey: string;
  defaultSettings: T;
  client: MediaProviderClient;
  getTokens: (settings: T) => { accessToken?: string; refreshToken?: string };
  getCredentials?: (settings: T) => { clientId?: string; clientSecret?: string };
  isConnected: (settings: T) => boolean;
}

export function useMediaProviderStorage<T extends object>(config: MediaProviderStorageConfig<T>) {
  const { storageKey, defaultSettings, client, getTokens, getCredentials, isConnected } = config;
  
  const [settings, setSettings] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const tokens = getTokens(settings);
    if (tokens.accessToken && client.setToken) {
      client.setToken(tokens.accessToken);
    }
    
    if (getCredentials && client.setCredentials) {
      const creds = getCredentials(settings);
      if (creds.clientId && creds.clientSecret) {
        client.setCredentials(creds.clientId, creds.clientSecret);
      }
    }
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken?: string) => {
    setSettings(prev => {
      const updated = { ...prev, accessToken, refreshToken } as T;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (client.setToken) client.setToken(accessToken);
      return updated;
    });
  }, [storageKey, client]);

  const setUser = useCallback((user: unknown) => {
    setSettings(prev => {
      const updated = { ...prev, user } as T;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const setCredentials = useCallback((clientId: string, clientSecret: string) => {
    setSettings(prev => {
      const updated = { ...prev, clientId, clientSecret } as T;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (client.setCredentials) client.setCredentials(clientId, clientSecret);
      return updated;
    });
  }, [storageKey, client]);

  const clearAuth = useCallback(() => {
    if (client.clearToken) client.clearToken();
    setSettings(prev => {
      const updated = { ...prev, accessToken: undefined, refreshToken: undefined, user: undefined } as T;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey, client]);

  return { settings, setTokens, setUser, setCredentials, clearAuth, isValidating };
}
`;

    case 'src/hooks/common/useNotifications.ts':
      return `import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  severity?: NotificationSeverity;
  read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface NotificationFilters {
  type?: NotificationType;
  severity?: NotificationSeverity;
  read?: boolean;
}

const DEFAULT_FILTERS: NotificationFilters = {};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>(DEFAULT_FILTERS);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const activeFiltersCount = useMemo(() => Object.values(filters).filter(v => v !== undefined).length, [filters]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filters.type && n.type !== filters.type) return false;
      if (filters.severity && n.severity !== filters.severity) return false;
      if (filters.read !== undefined && n.read !== filters.read) return false;
      return true;
    });
  }, [notifications, filters]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback(async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await supabase.from('notifications').delete().neq('id', '');
    setNotifications([]);
  }, []);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          if (newNotification.severity === 'critical' || newNotification.severity === 'high') {
            toast[newNotification.type === 'error' ? 'error' : 'warning'](newNotification.title);
          }
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  return {
    notifications, filteredNotifications, isLoading, error, unreadCount,
    filters, setFilters, activeFiltersCount, clearFilters,
    markAsRead, markAllAsRead, clearNotification, clearAll, refetch: fetchNotifications
  };
}
`;

    case 'src/hooks/common/usePWAInstall.ts':
      return `import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setCanInstall(false);
    }
    setDeferredPrompt(null);
    
    return outcome === 'accepted';
  };

  return { canInstall: canInstall && !isInstalled, isInstalled, install };
}
`;

    case 'src/hooks/common/useReadArticles.ts':
      return `import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tsi_wiki_read_articles';

export function useReadArticles() {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadArticles(new Set(parsed));
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) console.log('Failed to load read articles:', e);
    }
  }, []);

  const markAsRead = useCallback((articleId: string) => {
    setReadArticles(prev => {
      const updated = new Set(prev);
      updated.add(articleId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
      } catch (e) {
        if (import.meta.env.DEV) console.log('Failed to save read articles:', e);
      }
      return updated;
    });
  }, []);

  const isRead = useCallback((articleId: string) => readArticles.has(articleId), [readArticles]);

  const clearReadStatus = useCallback(() => {
    setReadArticles(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { readArticles, markAsRead, isRead, clearReadStatus };
}
`;

    case 'src/hooks/common/useRipple.ts':
      return `import { useState, useCallback } from 'react';

export interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2.5;
    
    const newRipple: Ripple = { id: Date.now(), x, y, size };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, []);

  const clearRipples = useCallback(() => setRipples([]), []);

  return { ripples, createRipple, clearRipples };
}
`;

    case 'src/hooks/common/useSettingsNotifications.ts':
      return `import { useState, useMemo, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export interface SettingsNotification {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: string;
  title: string;
  message: string;
  priority: number;
}

const DISMISSED_KEY = 'settings_dismissed_notifications';

export function useSettingsNotifications() {
  const settings = useSettings();
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    } catch { return []; }
  });

  const notifications = useMemo(() => {
    const all: SettingsNotification[] = [];

    if (settings.isDemoMode) {
      all.push({
        id: 'demo-mode',
        type: 'info',
        category: 'Modo Demo',
        title: 'Modo demonstração ativo',
        message: 'Algumas funcionalidades estão limitadas',
        priority: 1
      });
    }

    if (!settings.spotify?.accessToken) {
      all.push({
        id: 'spotify-not-connected',
        type: 'warning',
        category: 'Spotify',
        title: 'Spotify não conectado',
        message: 'Conecte sua conta para acessar suas playlists',
        priority: 2
      });
    }

    return all.filter(n => !dismissed.includes(n.id)).sort((a, b) => b.priority - a.priority);
  }, [settings, dismissed]);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const updated = [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const dismissAll = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setDismissed(prev => {
      const updated = [...new Set([...prev, ...allIds])];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [notifications]);

  const resetDismissed = useCallback(() => {
    setDismissed([]);
    localStorage.removeItem(DISMISSED_KEY);
  }, []);

  return {
    notifications,
    dismiss,
    dismissAll,
    resetDismissed,
    warningCount: notifications.filter(n => n.type === 'warning').length,
    errorCount: notifications.filter(n => n.type === 'error').length,
    infoCount: notifications.filter(n => n.type === 'info').length,
    totalCount: notifications.length,
    hasWarnings: notifications.some(n => n.type === 'warning'),
    hasErrors: notifications.some(n => n.type === 'error')
  };
}
`;

    case 'src/hooks/common/useSettingsSelector.ts':
      return `import { useMemo, useRef } from 'react';
import { useSettings, type SettingsContextType } from '@/contexts/SettingsContext';

export function useSettingsSelector<T>(
  selector: (settings: SettingsContextType) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is
): T {
  const settings = useSettings();
  const selectedRef = useRef<T>();
  
  const selected = useMemo(() => {
    const newSelected = selector(settings);
    if (selectedRef.current !== undefined && equalityFn(selectedRef.current, newSelected)) {
      return selectedRef.current;
    }
    selectedRef.current = newSelected;
    return newSelected;
  }, [settings, selector, equalityFn]);
  
  return selected;
}

export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  
  return true;
}

export const selectTheme = (s: SettingsContextType) => s.theme;
export const selectLanguage = (s: SettingsContextType) => s.language;
export const selectIsDemoMode = (s: SettingsContextType) => s.isDemoMode;
export const selectMusicProvider = (s: SettingsContextType) => s.musicProvider;
export const selectSpotify = (s: SettingsContextType) => s.spotify;
export const selectYoutubeMusic = (s: SettingsContextType) => s.youtubeMusic;
export const selectAnimationsEnabled = (s: SettingsContextType) => s.animationsEnabled;
export const selectSoundEnabled = (s: SettingsContextType) => s.soundEnabled;
`;

    case 'src/hooks/common/useSettingsStatus.ts':
      return `import { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export type StatusLevel = 'ok' | 'warning' | 'error';
export type SettingsCategoryId = 'backend' | 'spotify' | 'youtube' | 'weather' | 'backup' | 'users' | 'general';

export interface CategoryStatus {
  level: StatusLevel;
  message: string;
  configured: number;
  total: number;
}

export function useSettingsStatus() {
  const settings = useSettings();

  const getCategoryStatus = useCallback((categoryId: SettingsCategoryId): CategoryStatus => {
    switch (categoryId) {
      case 'backend':
        return {
          level: settings.isDemoMode ? 'warning' : 'ok',
          message: settings.isDemoMode ? 'Modo demo ativo' : 'Conectado',
          configured: settings.isDemoMode ? 0 : 1,
          total: 1
        };
      case 'spotify':
        return {
          level: settings.spotify?.accessToken ? 'ok' : 'warning',
          message: settings.spotify?.accessToken ? 'Conectado' : 'Não conectado',
          configured: settings.spotify?.accessToken ? 1 : 0,
          total: 1
        };
      default:
        return { level: 'ok', message: 'OK', configured: 1, total: 1 };
    }
  }, [settings]);

  const getAllStatuses = useCallback(() => {
    const categories: SettingsCategoryId[] = ['backend', 'spotify', 'youtube', 'weather', 'backup', 'users', 'general'];
    return Object.fromEntries(categories.map(id => [id, getCategoryStatus(id)]));
  }, [getCategoryStatus]);

  const getOverallStatus = useCallback(() => {
    const all = getAllStatuses();
    const statuses = Object.values(all);
    return {
      errors: statuses.filter(s => s.level === 'error').length,
      warnings: statuses.filter(s => s.level === 'warning').length,
      ok: statuses.filter(s => s.level === 'ok').length
    };
  }, [getAllStatuses]);

  return { getCategoryStatus, getAllStatuses, getOverallStatus };
}
`;

    case 'src/hooks/common/useSettingsTour.ts':
      return `import { useState, useCallback } from 'react';

export type SettingsTourId = 'general' | 'backend' | 'music' | 'appearance' | 'accessibility';

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const TOURS: Record<SettingsTourId, TourStep[]> = {
  general: [
    { target: '[data-tour="language"]', title: 'Idioma', content: 'Selecione o idioma da interface' },
    { target: '[data-tour="theme"]', title: 'Tema', content: 'Escolha entre tema claro ou escuro' }
  ],
  backend: [
    { target: '[data-tour="api-url"]', title: 'URL da API', content: 'Configure o endereço do servidor' }
  ],
  music: [
    { target: '[data-tour="spotify"]', title: 'Spotify', content: 'Conecte sua conta do Spotify' }
  ],
  appearance: [],
  accessibility: []
};

export function useSettingsTour(tourId: SettingsTourId) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = TOURS[tourId] || [];
  const hasSteps = steps.length > 0;

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const endTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(\`tour_complete_\${tourId}\`, 'true');
  }, [tourId]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(\`tour_complete_\${tourId}\`);
  }, [tourId]);

  const isTourComplete = localStorage.getItem(\`tour_complete_\${tourId}\`) === 'true';

  return { steps, isOpen, currentStep, setCurrentStep, startTour, endTour, resetTour, isTourComplete, hasSteps };
}

export function resetAllSettingsTours() {
  const tourIds: SettingsTourId[] = ['general', 'backend', 'music', 'appearance', 'accessibility'];
  tourIds.forEach(id => localStorage.removeItem(\`tour_complete_\${id}\`));
}
`;

    case 'src/hooks/common/useSoundEffects.ts':
      return `import { useCallback } from 'react';

type SoundType = 'click' | 'open' | 'close' | 'success' | 'error';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function useSoundEffects() {
  const playSound = useCallback(async (type: SoundType) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      switch (type) {
        case 'click':
          oscillator.frequency.value = 800;
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.05);
          break;
        case 'open':
          oscillator.frequency.setValueAtTime(400, ctx.currentTime);
          oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.1);
          break;
        case 'close':
          oscillator.frequency.setValueAtTime(600, ctx.currentTime);
          oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1);
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.1);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(523, ctx.currentTime);
          oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.2);
          break;
        case 'error':
          oscillator.frequency.value = 200;
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.2);
          break;
      }
    } catch {}
  }, []);

  return { playSound };
}
`;

    case 'src/hooks/common/useThemeCustomizer.ts':
      return `import { useState, useEffect, useCallback } from 'react';

export interface CustomThemeColors {
  primary: string;
  accent: string;
  background: string;
  text: string;
  gradient?: string;
  isLightMode?: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: CustomThemeColors;
  isBuiltIn?: boolean;
}

export const builtInPresets: ThemePreset[] = [
  {
    id: 'dark-neon',
    name: 'Dark Neon',
    colors: { primary: '280 100% 70%', accent: '180 100% 50%', background: '240 10% 4%', text: '0 0% 98%' },
    isBuiltIn: true
  },
  {
    id: 'light-silver',
    name: 'Light Silver',
    colors: { primary: '220 70% 50%', accent: '280 70% 60%', background: '0 0% 100%', text: '240 10% 4%', isLightMode: true },
    isBuiltIn: true
  }
];

export const defaultColors: CustomThemeColors = builtInPresets[0].colors;

const STORAGE_KEY = 'custom_theme_presets';
const ACTIVE_COLORS_KEY = 'active_custom_colors';

export function applyCustomColors(colors: CustomThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.text);
  root.setAttribute('data-custom-theme', 'true');
  if (colors.isLightMode) {
    root.setAttribute('data-theme', 'light');
  }
}

export function clearCustomColors() {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--accent');
  root.style.removeProperty('--background');
  root.style.removeProperty('--foreground');
  root.removeAttribute('data-custom-theme');
  root.removeAttribute('data-theme');
}

export function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return \`#\${f(0)}\${f(8)}\${f(4)}\`;
}

export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return \`\${Math.round(h * 360)} \${Math.round(s * 100)}% \${Math.round(l * 100)}%\`;
}

export function useThemeCustomizer() {
  const [customPresets, setCustomPresets] = useState<ThemePreset[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [activeColors, setActiveColors] = useState<CustomThemeColors | null>(() => {
    try { return JSON.parse(localStorage.getItem(ACTIVE_COLORS_KEY) || 'null'); } catch { return null; }
  });
  const [isCustomMode, setIsCustomMode] = useState(!!activeColors);

  useEffect(() => {
    if (activeColors) applyCustomColors(activeColors);
  }, []);

  const setColors = useCallback((colors: CustomThemeColors, withTransition = true) => {
    if (withTransition) document.documentElement.classList.add('theme-transition');
    applyCustomColors(colors);
    setActiveColors(colors);
    setIsCustomMode(true);
    localStorage.setItem(ACTIVE_COLORS_KEY, JSON.stringify(colors));
    if (withTransition) setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
  }, []);

  const savePreset = useCallback((name: string, colors: CustomThemeColors) => {
    const preset: ThemePreset = { id: \`custom-\${Date.now()}\`, name, colors };
    setCustomPresets(prev => {
      const updated = [...prev, preset];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return preset;
  }, []);

  const deletePreset = useCallback((id: string) => {
    setCustomPresets(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadPreset = useCallback((preset: ThemePreset) => {
    setColors(preset.colors);
  }, [setColors]);

  const resetToDefault = useCallback(() => {
    clearCustomColors();
    setActiveColors(null);
    setIsCustomMode(false);
    localStorage.removeItem(ACTIVE_COLORS_KEY);
  }, []);

  const updateColor = useCallback((key: keyof CustomThemeColors, value: string | boolean) => {
    setActiveColors(prev => {
      if (!prev) return null;
      const updated = { ...prev, [key]: value };
      applyCustomColors(updated);
      localStorage.setItem(ACTIVE_COLORS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    allPresets: [...builtInPresets, ...customPresets],
    activeColors,
    isCustomMode,
    setColors,
    savePreset,
    deletePreset,
    loadPreset,
    resetToDefault,
    updateColor
  };
}
`;

    case 'src/hooks/common/useTouchGestures.ts':
      return `import { useRef, useCallback, useEffect } from 'react';

interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
}

export function useTouchGestures(handlers: TouchGestureHandlers) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.();
        touchStart.current = null;
      }, 500);
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (deltaTime < maxSwipeTime) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > minSwipeDistance) handlers.onSwipeRight?.();
        else if (deltaX < -minSwipeDistance) handlers.onSwipeLeft?.();
      } else {
        if (deltaY > minSwipeDistance) handlers.onSwipeDown?.();
        else if (deltaY < -minSwipeDistance) handlers.onSwipeUp?.();
      }
    }

    touchStart.current = null;
  }, [handlers]);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const bind = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleTouchStart, handleTouchEnd, handleTouchMove]);

  return { bind };
}
`;

    case 'src/hooks/common/useTranslation.ts':
      return `import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return { t, i18n, changeLanguage, currentLanguage: i18n.language };
}
`;

    case 'src/hooks/common/useWikiBookmarks.ts':
      return `import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'tsi_wiki_bookmarks';

export function useWikiBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((articleId: string) => {
    setBookmarks(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  }, []);

  const isBookmarked = useCallback((articleId: string) => bookmarks.includes(articleId), [bookmarks]);

  const clearBookmarks = useCallback(() => setBookmarks([]), []);

  return { bookmarks, toggleBookmark, isBookmarked, clearBookmarks };
}
`;

    case 'src/hooks/common/useWikiOffline.ts':
      return `import { useState, useEffect, useCallback } from 'react';

interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category?: string;
}

interface OfflineArticle extends WikiArticle {
  savedAt: string;
}

const STORAGE_PREFIX = 'wiki_offline_';
const INDEX_KEY = 'wiki_offline_index';

export function useWikiOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
      setSavedArticles(index);
    } catch {}
  }, []);

  const calculateStorageUsed = useCallback(() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        total += (localStorage.getItem(key) || '').length * 2;
      }
    }
    setStorageUsed(total);
  }, []);

  useEffect(() => { calculateStorageUsed(); }, [calculateStorageUsed]);

  const saveArticleOffline = useCallback((article: WikiArticle) => {
    const offlineArticle: OfflineArticle = { ...article, savedAt: new Date().toISOString() };
    localStorage.setItem(\`\${STORAGE_PREFIX}\${article.id}\`, JSON.stringify(offlineArticle));
    
    setSavedArticles(prev => {
      const updated = prev.includes(article.id) ? prev : [...prev, article.id];
      localStorage.setItem(INDEX_KEY, JSON.stringify(updated));
      return updated;
    });
    calculateStorageUsed();
  }, [calculateStorageUsed]);

  const removeArticleOffline = useCallback((articleId: string) => {
    localStorage.removeItem(\`\${STORAGE_PREFIX}\${articleId}\`);
    setSavedArticles(prev => {
      const updated = prev.filter(id => id !== articleId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(updated));
      return updated;
    });
    calculateStorageUsed();
  }, [calculateStorageUsed]);

  const getOfflineArticle = useCallback((articleId: string): OfflineArticle | null => {
    try {
      const data = localStorage.getItem(\`\${STORAGE_PREFIX}\${articleId}\`);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }, []);

  const isArticleSaved = useCallback((articleId: string) => savedArticles.includes(articleId), [savedArticles]);

  const clearAllOfflineArticles = useCallback(() => {
    savedArticles.forEach(id => localStorage.removeItem(\`\${STORAGE_PREFIX}\${id}\`));
    localStorage.removeItem(INDEX_KEY);
    setSavedArticles([]);
    setStorageUsed(0);
  }, [savedArticles]);

  const formatStorageSize = (bytes: number): string => {
    if (bytes < 1024) return \`\${bytes} B\`;
    if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)} KB\`;
    return \`\${(bytes / (1024 * 1024)).toFixed(1)} MB\`;
  };

  return {
    isOffline, savedArticles, storageUsed,
    saveArticleOffline, removeArticleOffline, getOfflineArticle,
    isArticleSaved, clearAllOfflineArticles, formatStorageSize
  };
}
`;

    default:
      return null;
  }
}
