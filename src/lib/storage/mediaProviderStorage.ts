/**
 * Generic storage utilities for media provider tokens and settings.
 * Reduces duplication between Spotify and YouTube Music contexts.
 */

export interface StorageResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Safely load settings from localStorage with error handling.
 */
export function loadFromStorage<T>(storageKey: string): StorageResult<T> {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return { data: null, error: null };
    }
    const parsed = JSON.parse(stored) as T;
    return { data: parsed, error: null };
  } catch (error) {
    console.error(`Failed to load from storage (${storageKey}):`, error);
    // Clear corrupted data
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore removal errors
    }
    return { data: null, error: 'Corrupted storage data' };
  }
}

/**
 * Safely save settings to localStorage with error handling.
 */
export function saveToStorage<T>(storageKey: string, data: T): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save to storage (${storageKey}):`, error);
    return false;
  }
}

/**
 * Clear settings from localStorage.
 */
export function clearStorage(storageKey: string): boolean {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error(`Failed to clear storage (${storageKey}):`, error);
    return false;
  }
}
