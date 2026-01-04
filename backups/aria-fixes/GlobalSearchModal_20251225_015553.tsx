import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, HelpCircle, Filter, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toggle } from '@/components/ui/toggle';
import { UnifiedSearchResult } from '@/lib/globalSearch';
import { Badge, Button, Input } from "@/components/ui/themed"

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: UnifiedSearchResult[];
  filters: {
    sources: ('help' | 'wiki')[];
    categories: string[];
  };
  toggleSource: (source: 'help' | 'wiki') => void;
  clearSearch: () => void;
  helpCount: number;
  wikiCount: number;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  query,
  setQuery,
  results,
  filters,
  toggleSource,
  clearSearch,
  helpCount,
  wikiCount
}: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleResultClick = (result: UnifiedSearchResult) => {
    if (result.source === 'help') {
      navigate(`/help?section=${result.categoryId}`);
    } else {
      navigate(`/wiki?article=${result.id}`);
    }
    onClose();
    clearSearch();
  };

  const handleClose = () => {
    onClose();
    clearSearch();
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-primary-foreground rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-kiosk-bg border-kiosk-border">
        <DialogHeader className="p-4 border-b border-kiosk-border">
          <DialogTitle className="flex items-center gap-2 text-kiosk-text">
            <Search aria-hidden="true" className="w-5 h-5 icon-neon-blue" />
            Busca Global
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="p-4 border-b border-kiosk-border">
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/85" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar em toda a documentação..."
              className="pl-10 pr-10 input-3d bg-kiosk-surface text-kiosk-text"
            />
            {query && (
              <Button
                variant="ghost"
                size="xs"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setQuery('')}
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Source Filters */}
          <div className="flex items-center gap-2 mt-3">
            <Filter aria-hidden="true" className="w-4 h-4 text-kiosk-text/85" />
            <Toggle
              pressed={filters.sources.includes('help')}
              onPressedChange={() => toggleSource('help')}
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
              size="sm"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help ({helpCount})
            </Toggle>
            <Toggle
              pressed={filters.sources.includes('wiki')}
              onPressedChange={() => toggleSource('wiki')}
              className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
              size="sm"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Wiki ({wikiCount})
            </Toggle>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          {query.length < 2 ? (
            <div className="p-8 text-center text-kiosk-text/85">
              <Search aria-hidden="true" className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Digite pelo menos 2 caracteres para pesquisar</p>
              <p className="text-sm mt-2">
                <kbd className="px-2 py-1 bg-kiosk-surface rounded text-xs">Ctrl+K</kbd>
                {' '}ou{' '}
                <kbd className="px-2 py-1 bg-kiosk-surface rounded text-xs">/</kbd>
                {' '}para abrir a busca
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-kiosk-text/85">
              <Search aria-hidden="true" className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum resultado encontrado para "{query}"</p>
              <p className="text-sm mt-2">Tente outros termos ou ajuste os filtros</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-kiosk-text/85">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left rounded-lg hover:bg-kiosk-surface/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        result.source === 'help' 
                          ? 'bg-amber-500/10 text-amber-500' 
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {result.source === 'help' 
                          ? <HelpCircle className="w-4 h-4" /> 
                          : <BookOpen className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-kiosk-text truncate">
                            {highlightMatch(result.title, query)}
                          </span>
                          <ChevronRight aria-hidden="true" className="w-4 h-4 text-kiosk-text/85 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-kiosk-text/80 line-clamp-2 mt-1">
                          {highlightMatch(result.description, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {result.source === 'help' ? 'Help' : 'Wiki'}
                          </Badge>
                          <span className="text-xs text-kiosk-text/80">
                            {result.path}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-kiosk-border flex items-center justify-between text-xs text-kiosk-text/85">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-kiosk-surface rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-kiosk-surface rounded ml-1">↓</kbd>
              {' '}navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-kiosk-surface rounded">Enter</kbd>
              {' '}selecionar
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 bg-kiosk-surface rounded">Esc</kbd>
            {' '}fechar
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
