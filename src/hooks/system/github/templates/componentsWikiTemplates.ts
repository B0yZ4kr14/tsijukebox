// Wiki components templates - 4 files

const VERSION = '4.2.0';

export function generateComponentsWikiContent(path: string): string | null {
  const now = new Date().toISOString();

  switch (path) {
    case 'src/components/wiki/WikiArticle.tsx':
      return `// Wiki Article Component
// Version: ${VERSION}
// Last updated: ${now}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react';

interface WikiArticleProps {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  lastUpdated?: string;
}

export function WikiArticle({ 
  id, 
  title, 
  content, 
  category, 
  tags = [],
  lastUpdated 
}: WikiArticleProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('wiki-bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(id));
  }, [id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('wiki-bookmarks') || '[]');
    const updated = isBookmarked 
      ? bookmarks.filter((b: string) => b !== id)
      : [...bookmarks, id];
    localStorage.setItem('wiki-bookmarks', JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <Badge variant="outline" className="mb-2">{category}</Badge>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleBookmark}>
            {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WikiArticle;
`;

    case 'src/components/wiki/WikiNavigation.tsx':
      return `// Wiki Navigation Component
// Version: ${VERSION}
// Last updated: ${now}

import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WikiCategory {
  id: string;
  name: string;
  articles: { id: string; title: string }[];
}

interface WikiNavigationProps {
  categories: WikiCategory[];
  currentArticleId?: string;
  onArticleSelect: (articleId: string) => void;
}

export function WikiNavigation({ 
  categories, 
  currentArticleId, 
  onArticleSelect 
}: WikiNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map(c => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <ScrollArea className="h-full">
      <nav className="p-4 space-y-2" aria-label="Wiki navigation">
        {categories.map(category => {
          const isExpanded = expandedCategories.includes(category.id);
          
          return (
            <div key={category.id} className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start font-medium"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                <Folder className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
              
              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {category.articles.map(article => (
                    <Button
                      key={article.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start pl-6",
                        currentArticleId === article.id && "bg-accent"
                      )}
                      onClick={() => onArticleSelect(article.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {article.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

export default WikiNavigation;
`;

    case 'src/components/wiki/WikiSearch.tsx':
      return `// Wiki Search Component
// Version: ${VERSION}
// Last updated: ${now}

import { useState, useCallback, useEffect } from 'react';
import { Search, X, FileText, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/common/useDebounce';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
}

interface WikiSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (articleId: string) => void;
}

export function WikiSearch({ onSearch, onResultClick }: WikiSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const saved = localStorage.getItem('wiki-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      onSearch(debouncedQuery)
        .then(setResults)
        .finally(() => setIsLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery, onSearch]);

  const handleResultClick = useCallback((articleId: string) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('wiki-recent-searches', JSON.stringify(updated));
    
    onResultClick(articleId);
    setQuery('');
    setIsOpen(false);
  }, [query, recentSearches, onResultClick]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search wiki..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50">
          <ScrollArea className="max-h-80">
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            )}
            
            {!isLoading && results.length > 0 && (
              <div className="p-2">
                {results.map(result => (
                  <button
                    key={result.id}
                    className="w-full p-3 text-left hover:bg-accent rounded-lg"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{result.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {result.excerpt}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && !query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-1">Recent searches</p>
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    className="w-full p-2 text-left hover:bg-accent rounded-lg flex items-center gap-2"
                    onClick={() => setQuery(search)}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No results found
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default WikiSearch;
`;

    case 'src/components/wiki/wikiData.ts':
      return `// Wiki Data Configuration
// Version: ${VERSION}
// Last updated: ${now}

export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
}

export interface WikiCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const WIKI_CATEGORIES: WikiCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of TSiJUKEBOX',
    icon: 'rocket'
  },
  {
    id: 'installation',
    name: 'Installation',
    description: 'Installation and setup guides',
    icon: 'download'
  },
  {
    id: 'configuration',
    name: 'Configuration',
    description: 'Configuration options and settings',
    icon: 'settings'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Third-party integrations',
    icon: 'plug'
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: 'help-circle'
  },
  {
    id: 'api',
    name: 'API Reference',
    description: 'API documentation',
    icon: 'code'
  }
];

export const WIKI_ARTICLES: WikiArticle[] = [
  {
    id: 'welcome',
    title: 'Welcome to TSiJUKEBOX',
    category: 'getting-started',
    tags: ['intro', 'overview'],
    lastUpdated: '${now}',
    content: \`
      <h2>Welcome to TSiJUKEBOX</h2>
      <p>TSiJUKEBOX is a modern jukebox application designed for music enthusiasts.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Multi-provider music streaming</li>
        <li>Collaborative playlists</li>
        <li>Kiosk mode for public displays</li>
        <li>Real-time synchronization</li>
      </ul>
    \`
  },
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    category: 'getting-started',
    tags: ['tutorial', 'beginner'],
    lastUpdated: '${now}',
    content: \`
      <h2>Quick Start Guide</h2>
      <p>Get up and running with TSiJUKEBOX in minutes.</p>
      <h3>Step 1: Installation</h3>
      <code>npm install tsijukebox</code>
      <h3>Step 2: Configuration</h3>
      <p>Set up your music providers in the settings panel.</p>
    \`
  }
];

export function getArticleById(id: string): WikiArticle | undefined {
  return WIKI_ARTICLES.find(article => article.id === id);
}

export function getArticlesByCategory(categoryId: string): WikiArticle[] {
  return WIKI_ARTICLES.filter(article => article.category === categoryId);
}

export function searchArticles(query: string): WikiArticle[] {
  const lowerQuery = query.toLowerCase();
  return WIKI_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.content.toLowerCase().includes(lowerQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export default { WIKI_CATEGORIES, WIKI_ARTICLES, getArticleById, getArticlesByCategory, searchArticles };
`;

    default:
      return null;
  }
}
