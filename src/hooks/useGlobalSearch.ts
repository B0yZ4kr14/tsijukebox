import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  searchHelp, 
  searchWiki, 
  UnifiedSearchResult, 
  SearchFilters,
  HelpSection 
} from '@/lib/globalSearch';

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

  // Perform search
  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const helpResults = searchHelp(query, helpSections, filters);
    const wikiResults = searchWiki(query, filters);
    
    return [...helpResults, ...wikiResults]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 25);
  }, [query, filters, helpSections]);

  // Toggle source filter
  const toggleSource = useCallback((source: 'help' | 'wiki') => {
    setFilters(prev => {
      const sources = prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source];
      return { ...prev, sources: sources.length > 0 ? sources : ['help', 'wiki'] };
    });
  }, []);

  // Toggle category filter
  const toggleCategory = useCallback((categoryId: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ sources: ['help', 'wiki'], categories: [] });
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    clearFilters();
  }, [clearFilters]);

  // Global keyboard shortcut (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

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
    query,
    setQuery,
    results,
    filters,
    toggleSource,
    toggleCategory,
    clearFilters,
    clearSearch,
    isOpen,
    setIsOpen,
    resultCount: results.length,
    helpCount: results.filter(r => r.source === 'help').length,
    wikiCount: results.filter(r => r.source === 'wiki').length
  };
}
