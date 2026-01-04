import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getAllArticles, getArticlePath, WikiArticle } from './wikiData';
import { formatBrandInText } from '@/components/ui/BrandText';

interface WikiSearchProps {
  onSelectArticle: (articleId: string) => void;
}

interface ScoredArticle {
  article: WikiArticle;
  score: number;
}

// Calculate relevance score for search results
function getSearchScore(article: WikiArticle, searchTerm: string): number {
  const term = searchTerm.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (article.title.toLowerCase().includes(term)) {
    score += 100;
    // Bonus for exact match or starts with
    if (article.title.toLowerCase() === term) score += 50;
    if (article.title.toLowerCase().startsWith(term)) score += 25;
  }
  
  // Description match (medium weight)
  if (article.description.toLowerCase().includes(term)) {
    score += 50;
  }
  
  // Content match (lower weight, but count occurrences)
  const contentLower = article.content.toLowerCase();
  const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
  score += Math.min(contentMatches * 5, 30); // Cap at 30
  
  // Steps match
  if (article.steps?.some(step => step.toLowerCase().includes(term))) {
    score += 20;
  }
  
  // Tips match
  if (article.tips?.some(tip => tip.toLowerCase().includes(term))) {
    score += 15;
  }
  
  return score;
}

export function WikiSearch({ onSelectArticle }: WikiSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    const articles = getAllArticles();
    
    // Score and filter articles
    const scored: ScoredArticle[] = articles
      .map(article => ({
        article,
        score: getSearchScore(article, searchTerm)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
    
    return scored;
  }, [query]);

  const handleSelect = (articleId: string) => {
    onSelectArticle(articleId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-text/85" />
        <Input
          placeholder="Buscar na wiki..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-kiosk-surface border-border text-kiosk-text"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-kiosk-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <ScrollArea className="max-h-80">
              <div className="p-2 space-y-1">
                {results.map(({ article, score }) => {
                  const path = getArticlePath(article.id);
                  const isHighScore = score >= 100;
                  return (
                    <button
                      key={article.id}
                      onClick={() => handleSelect(article.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-kiosk-bg transition-colors text-left"
                    >
                      <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${isHighScore ? 'text-amber-400' : 'text-primary'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-kiosk-text truncate">{formatBrandInText(article.title)}</p>
                          {isHighScore && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 border-amber-500/50 text-amber-400">
                              <Star className="w-2.5 h-2.5 mr-0.5" />
                              Relevante
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-kiosk-text/85 truncate">{formatBrandInText(article.description)}</p>
                        {path && (
                          <p className="text-xs text-kiosk-text/85 mt-1">
                            {path.category.title} → {path.subSection.title}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {isOpen && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-kiosk-surface border border-border rounded-xl shadow-xl z-50 p-6 text-center"
          >
            <Search className="w-8 h-8 mx-auto text-kiosk-text/85 mb-2" />
            <p className="text-sm text-kiosk-text/90">Nenhum resultado para "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
