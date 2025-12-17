import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tsi_wiki_read_articles';

export function useReadArticles() {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
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

  // Mark an article as read
  const markAsRead = useCallback((articleId: string) => {
    setReadArticles(prev => {
      const updated = new Set(prev);
      updated.add(articleId);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
      } catch (e) {
        if (import.meta.env.DEV) console.log('Failed to save read articles:', e);
      }
      
      return updated;
    });
  }, []);

  // Check if an article has been read
  const isRead = useCallback((articleId: string) => {
    return readArticles.has(articleId);
  }, [readArticles]);

  // Clear all read status (for testing/reset)
  const clearReadStatus = useCallback(() => {
    setReadArticles(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      if (import.meta.env.DEV) console.log('Failed to clear read articles:', e);
    }
  }, []);

  return {
    readArticles,
    markAsRead,
    isRead,
    clearReadStatus,
  };
}
