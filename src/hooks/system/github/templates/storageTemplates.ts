// Storage templates - 2 arquivos
// Geração automática de conteúdo para src/lib/storage/

const VERSION = '2.5.0';
const GENERATED_AT = new Date().toISOString();

export function generateStorageContent(path: string): string | null {
  const fileName = path.split('/').pop();
  
  switch (fileName) {
    case 'index.ts':
      return generateStorageIndex();
    case 'mediaProviderStorage.ts':
      return generateMediaProviderStorage();
    default:
      return null;
  }
}

function generateStorageIndex(): string {
  return `// Storage utilities - centralized exports
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export * from './mediaProviderStorage';

// Storage keys enum for type safety
export const STORAGE_KEYS = {
  MEDIA_PROVIDER: 'tsijukebox_media_provider',
  THEME: 'tsijukebox_theme',
  VOLUME: 'tsijukebox_volume',
  QUEUE: 'tsijukebox_queue',
  RECENTLY_PLAYED: 'tsijukebox_recently_played',
  USER_PREFERENCES: 'tsijukebox_user_preferences',
  AUTH_TOKEN: 'tsijukebox_auth_token',
  SPOTIFY_STATE: 'tsijukebox_spotify_state',
  YOUTUBE_STATE: 'tsijukebox_youtube_state',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Generic storage helpers
export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(\`Failed to save \${key} to storage:\`, error);
  }
}

export function removeStorageItem(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(\`Failed to remove \${key} from storage:\`, error);
  }
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
}
`;
}

function generateMediaProviderStorage(): string {
  return `// Media Provider Storage
// TSiJUKEBOX v${VERSION}
// Generated: ${GENERATED_AT}

export type MediaProvider = 'local' | 'spotify' | 'youtube' | 'none';

const STORAGE_KEY = 'tsijukebox_media_provider';

export interface MediaProviderState {
  activeProvider: MediaProvider;
  lastUsed: string;
  preferences: {
    autoConnect: boolean;
    rememberChoice: boolean;
  };
}

const DEFAULT_STATE: MediaProviderState = {
  activeProvider: 'none',
  lastUsed: new Date().toISOString(),
  preferences: {
    autoConnect: true,
    rememberChoice: true,
  },
};

export function getMediaProviderState(): MediaProviderState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
    return DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function setMediaProvider(provider: MediaProvider): void {
  const current = getMediaProviderState();
  const updated: MediaProviderState = {
    ...current,
    activeProvider: provider,
    lastUsed: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateMediaProviderPreferences(
  preferences: Partial<MediaProviderState['preferences']>
): void {
  const current = getMediaProviderState();
  const updated: MediaProviderState = {
    ...current,
    preferences: { ...current.preferences, ...preferences },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearMediaProviderState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
`;
}
