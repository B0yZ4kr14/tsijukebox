import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllArticles, getArticlePath, WikiArticle } from './wikiData';

interface WikiSearchProps {
  onSelectArticle: (articleId: string) => void;
}

export function WikiSearch({ onSelectArticle }: WikiSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const articles = getAllArticles();
    
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      article.steps?.some(step => step.toLowerCase().includes(searchTerm)) ||
      article.tips?.some(tip => tip.toLowerCase().includes(searchTerm))
    ).slice(0, 10);
  }, [query]);

  const handleSelect = (articleId: string) => {
    onSelectArticle(articleId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-text/50" />
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
                {results.map((article) => {
                  const path = getArticlePath(article.id);
                  return (
                    <button
                      key={article.id}
                      onClick={() => handleSelect(article.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-kiosk-bg transition-colors text-left"
                    >
                      <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-kiosk-text truncate">{article.title}</p>
                        <p className="text-xs text-kiosk-text/85 truncate">{article.description}</p>
                        {path && (
                          <p className="text-xs text-kiosk-text/80 mt-1">
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
            <Search className="w-8 h-8 mx-auto text-kiosk-text/50 mb-2" />
            <p className="text-sm text-kiosk-text/85">Nenhum resultado para "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
