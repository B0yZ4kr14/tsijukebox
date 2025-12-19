import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'tsi_wiki_bookmarks';

export function useWikiBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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

  const isBookmarked = useCallback((articleId: string) => {
    return bookmarks.includes(articleId);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return { bookmarks, toggleBookmark, isBookmarked, clearBookmarks };
}
