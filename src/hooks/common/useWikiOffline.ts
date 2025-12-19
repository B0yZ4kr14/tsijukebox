import { useState, useEffect, useCallback } from 'react';
import type { WikiArticle } from '@/components/wiki/wikiData';

interface OfflineArticle extends WikiArticle {
  savedAt: string;
}

const STORAGE_PREFIX = 'wiki_offline_';
const INDEX_KEY = 'wiki_offline_index';

export function useWikiOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);

  // Listen for online/offline events
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

  // Load saved article index on mount
  useEffect(() => {
    try {
      const index = localStorage.getItem(INDEX_KEY);
      if (index) {
        setSavedArticles(JSON.parse(index));
      }
      calculateStorageUsed();
    } catch (error) {
      console.error('Failed to load offline index:', error);
    }
  }, []);

  const calculateStorageUsed = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          total += value.length * 2; // UTF-16 uses 2 bytes per character
        }
      }
    }
    setStorageUsed(total);
  };

  const saveArticleOffline = useCallback((article: WikiArticle) => {
    try {
      const offlineArticle: OfflineArticle = {
        ...article,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(
        `${STORAGE_PREFIX}${article.id}`,
        JSON.stringify(offlineArticle)
      );

      // Update index
      const newIndex = [...new Set([...savedArticles, article.id])];
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIndex));
      setSavedArticles(newIndex);
      calculateStorageUsed();
      
      return true;
    } catch (error) {
      console.error('Failed to save article offline:', error);
      return false;
    }
  }, [savedArticles]);

  const removeArticleOffline = useCallback((articleId: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${articleId}`);
      
      const newIndex = savedArticles.filter(id => id !== articleId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(newIndex));
      setSavedArticles(newIndex);
      calculateStorageUsed();
      
      return true;
    } catch (error) {
      console.error('Failed to remove offline article:', error);
      return false;
    }
  }, [savedArticles]);

  const getOfflineArticle = useCallback((articleId: string): OfflineArticle | null => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}${articleId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to get offline article:', error);
      return null;
    }
  }, []);

  const isArticleSaved = useCallback((articleId: string): boolean => {
    return savedArticles.includes(articleId);
  }, [savedArticles]);

  const clearAllOfflineArticles = useCallback(() => {
    try {
      savedArticles.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      });
      localStorage.removeItem(INDEX_KEY);
      setSavedArticles([]);
      setStorageUsed(0);
      return true;
    } catch (error) {
      console.error('Failed to clear offline articles:', error);
      return false;
    }
  }, [savedArticles]);

  const formatStorageSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return {
    isOffline,
    savedArticles,
    savedArticleCount: savedArticles.length,
    storageUsed,
    storageUsedFormatted: formatStorageSize(storageUsed),
    saveArticleOffline,
    removeArticleOffline,
    getOfflineArticle,
    isArticleSaved,
    clearAllOfflineArticles,
  };
}
