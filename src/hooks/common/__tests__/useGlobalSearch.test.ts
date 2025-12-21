import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalSearch } from '../useGlobalSearch';
import type { HelpSection } from '@/lib/globalSearch';

// Mock globalSearch functions
vi.mock('@/lib/globalSearch', async () => {
  const actual = await vi.importActual('@/lib/globalSearch');
  return {
    ...actual,
    searchHelp: vi.fn((query: string, sections: HelpSection[]) => {
      if (!query || query.length < 2) return [];
      return sections
        .flatMap(s => s.items)
        .filter(item => 
          item.question.toLowerCase().includes(query.toLowerCase()) ||
          item.answer.toLowerCase().includes(query.toLowerCase())
        )
        .map((item, i) => ({
          id: `help-${i}`,
          title: item.question,
          description: item.answer.slice(0, 50),
          content: item.answer,
          source: 'help' as const,
          category: 'Test',
          categoryId: 'test',
          path: 'Help > Test',
          matchType: 'title' as const,
          relevanceScore: 100 - i,
        }));
    }),
    searchWiki: vi.fn((query: string) => {
      if (!query || query.length < 2) return [];
      if (query.toLowerCase().includes('wiki')) {
        return [{
          id: 'wiki-1',
          title: 'Wiki Article',
          description: 'Test wiki content',
          content: 'Full wiki content',
          source: 'wiki' as const,
          category: 'Wiki',
          categoryId: 'wiki',
          path: 'Wiki > Test',
          matchType: 'title' as const,
          relevanceScore: 80,
        }];
      }
      return [];
    }),
  };
});

const mockHelpSections: HelpSection[] = [
  {
    id: 'test-section',
    title: 'Test Section',
    items: [
      { id: 'item1', question: 'How to search?', answer: 'Use the search bar' },
      { id: 'item2', question: 'How to filter?', answer: 'Use filters panel' },
    ],
  },
];

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should start with empty query', () => {
      const { result } = renderHook(() => useGlobalSearch());
      expect(result.current.query).toBe('');
    });

    it('should start with default filters', () => {
      const { result } = renderHook(() => useGlobalSearch());
      expect(result.current.filters).toEqual({
        sources: ['help', 'wiki'],
        categories: [],
      });
    });

    it('should start with isOpen false', () => {
      const { result } = renderHook(() => useGlobalSearch());
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('search', () => {
    it('should return empty results for query < 2 chars', () => {
      const { result } = renderHook(() => 
        useGlobalSearch({ helpSections: mockHelpSections })
      );

      act(() => {
        result.current.setQuery('a');
      });

      expect(result.current.results).toEqual([]);
    });

    it('should search help sections', () => {
      const { result } = renderHook(() => 
        useGlobalSearch({ helpSections: mockHelpSections })
      );

      act(() => {
        result.current.setQuery('search');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.helpCount).toBeGreaterThan(0);
    });

    it('should search wiki entries', () => {
      const { result } = renderHook(() => 
        useGlobalSearch({ helpSections: mockHelpSections })
      );

      act(() => {
        result.current.setQuery('wiki');
      });

      expect(result.current.wikiCount).toBeGreaterThan(0);
    });

    it('should sort by relevance score', () => {
      const { result } = renderHook(() => 
        useGlobalSearch({ helpSections: mockHelpSections })
      );

      act(() => {
        result.current.setQuery('search');
      });

      const scores = result.current.results.map(r => r.relevanceScore);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });
  });

  describe('filters', () => {
    it('should toggle source filter', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.toggleSource('help');
      });

      expect(result.current.filters.sources).toEqual(['wiki']);
    });

    it('should keep at least one source', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.toggleSource('help');
        result.current.toggleSource('wiki');
      });

      // Should reset to both when trying to remove all
      expect(result.current.filters.sources).toEqual(['help', 'wiki']);
    });

    it('should toggle category filter', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.toggleCategory('test-category');
      });

      expect(result.current.filters.categories).toContain('test-category');

      act(() => {
        result.current.toggleCategory('test-category');
      });

      expect(result.current.filters.categories).not.toContain('test-category');
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.toggleSource('help');
        result.current.toggleCategory('test-category');
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        sources: ['help', 'wiki'],
        categories: [],
      });
    });
  });

  describe('clearSearch', () => {
    it('should clear query and filters', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery('test');
        result.current.toggleCategory('cat1');
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.query).toBe('');
      expect(result.current.filters.categories).toEqual([]);
    });
  });

  describe('keyboard shortcuts', () => {
    it('should open on Ctrl+K', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should open on / key when not in input', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close on Escape', () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('counts', () => {
    it('should return correct result count', () => {
      const { result } = renderHook(() => 
        useGlobalSearch({ helpSections: mockHelpSections })
      );

      act(() => {
        result.current.setQuery('search');
      });

      expect(result.current.resultCount).toBe(result.current.results.length);
    });
  });
});
