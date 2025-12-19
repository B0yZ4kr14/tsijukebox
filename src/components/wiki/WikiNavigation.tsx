import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, FolderOpen, FolderClosed, Minus, Search, X, Filter } from 'lucide-react';
import { 
  Music, 
  Keyboard, 
  Palette, 
  Plug, 
  Shield, 
  Terminal, 
  HelpCircle 
} from 'lucide-react';
import { wikiCategories, WikiCategory, WikiSubSection } from './wikiData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { cn, formatBrandName } from '@/lib/utils';

interface WikiNavigationProps {
  selectedArticle: string | null;
  onSelectArticle: (articleId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
  isArticleRead?: (articleId: string) => boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  'Music': <Music className="w-4 h-4" />,
  'Keyboard': <Keyboard className="w-4 h-4" />,
  'Palette': <Palette className="w-4 h-4" />,
  'Plug': <Plug className="w-4 h-4" />,
  'Shield': <Shield className="w-4 h-4" />,
  'Terminal': <Terminal className="w-4 h-4" />,
  'HelpCircle': <HelpCircle className="w-4 h-4" />,
};

// IDs of newly added articles (Spicetify, YouTube Music, Multi-Provider)
const NEW_ARTICLE_IDS = new Set([
  'spicetify-overview',
  'spicetify-themes', 
  'spicetify-extensions',
  'ytm-connect',
  'ytm-oauth-setup',
  'ytm-library',
  'ytm-playback',
  'provider-selection',
  'provider-fallback',
]);

// Category with new articles
const CATEGORY_WITH_NEW_ARTICLES = 'integrations';

// Count total articles in a category
function getCategoryArticleCount(category: WikiCategory): number {
  return category.subSections.reduce((acc, sub) => acc + sub.articles.length, 0);
}

// Get total article count
function getTotalArticleCount(): number {
  return wikiCategories.reduce((acc, cat) => acc + getCategoryArticleCount(cat), 0);
}

// Highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i} className="bg-cyan-500/40 text-white rounded px-0.5">{part}</mark> : part
  );
}

export function WikiNavigation({ 
  selectedArticle, 
  onSelectArticle, 
  onSelectCategory,
  selectedCategory,
  isArticleRead 
}: WikiNavigationProps) {
  // Default: expand 'integrations' category to show new Spicetify/YouTube Music articles
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(selectedCategory ? [selectedCategory, 'integrations'] : ['integrations'])
  );
  // Default: expand integrations subsections (spicetify, youtube-music, multi-provider)
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(
    new Set(['spicetify', 'youtube-music', 'multi-provider'])
  );
  const [showTreeLines, setShowTreeLines] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [highlightedArticle, setHighlightedArticle] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search and category filter
  const filteredCategories = useMemo(() => {
    let categories = [...wikiCategories];
    
    // Apply category filter
    if (categoryFilter) {
      categories = categories.filter(cat => cat.id === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      categories = categories.map(category => {
        const filteredSubSections = category.subSections.map(subSection => {
          const filteredArticles = subSection.articles.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.description?.toLowerCase().includes(query)
          );
          return { ...subSection, articles: filteredArticles };
        }).filter(sub => sub.articles.length > 0);
        
        return { ...category, subSections: filteredSubSections };
      }).filter(cat => cat.subSections.length > 0);
    }
    
    return categories;
  }, [searchQuery, categoryFilter]);

  // Auto-expand categories with search results
  useEffect(() => {
    if (searchQuery.trim()) {
      const catsWithResults = new Set(filteredCategories.map(c => c.id));
      const subsWithResults = new Set(filteredCategories.flatMap(c => c.subSections.map(s => s.id)));
      setExpandedCategories(catsWithResults);
      setExpandedSubSections(subsWithResults);
    }
  }, [searchQuery, filteredCategories]);

  // Build flat list for keyboard navigation
  const flatItems = useCallback(() => {
    const items: { type: 'category' | 'subsection' | 'article'; id: string; categoryId?: string; subSectionId?: string }[] = [];
    
    filteredCategories.forEach(category => {
      items.push({ type: 'category', id: category.id });
      if (expandedCategories.has(category.id)) {
        category.subSections.forEach(subSection => {
          items.push({ type: 'subsection', id: subSection.id, categoryId: category.id });
          if (expandedSubSections.has(subSection.id)) {
            subSection.articles.forEach(article => {
              items.push({ type: 'article', id: article.id, categoryId: category.id, subSectionId: subSection.id });
            });
          }
        });
      }
    });
    
    return items;
  }, [expandedCategories, expandedSubSections, filteredCategories]);

  // Expand all categories and subsections
  const expandAll = () => {
    const allCategories = new Set(wikiCategories.map(c => c.id));
    const allSubSections = new Set(wikiCategories.flatMap(c => c.subSections.map(s => s.id)));
    setExpandedCategories(allCategories);
    setExpandedSubSections(allSubSections);
  };

  // Collapse all
  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedSubSections(new Set());
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    onSelectCategory(categoryId);
  };

  const toggleSubSection = (subSectionId: string) => {
    setExpandedSubSections(prev => {
      const next = new Set(prev);
      if (next.has(subSectionId)) {
        next.delete(subSectionId);
      } else {
        next.add(subSectionId);
      }
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!navRef.current?.contains(document.activeElement)) return;
      
      const items = flatItems();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            const item = items[focusedIndex];
            if (item.type === 'category' && !expandedCategories.has(item.id)) {
              toggleCategory(item.id);
            } else if (item.type === 'subsection' && !expandedSubSections.has(item.id)) {
              toggleSubSection(item.id);
            }
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            const item = items[focusedIndex];
            if (item.type === 'category' && expandedCategories.has(item.id)) {
              toggleCategory(item.id);
            } else if (item.type === 'subsection' && expandedSubSections.has(item.id)) {
              toggleSubSection(item.id);
            }
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            const item = items[focusedIndex];
            if (item.type === 'article') {
              onSelectArticle(item.id);
            } else if (item.type === 'category') {
              toggleCategory(item.id);
            } else if (item.type === 'subsection') {
              toggleSubSection(item.id);
            }
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, flatItems, expandedCategories, expandedSubSections]);

  const totalArticles = getTotalArticleCount();
  const filteredArticleCount = filteredCategories.reduce((acc, cat) => acc + getCategoryArticleCount(cat), 0);

  const clearSearch = () => {
    setSearchQuery('');
    setCategoryFilter(null);
  };

  return (
    <div ref={navRef} tabIndex={0} className="outline-none">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar artigos..."
          className="pl-9 pr-9 h-9 bg-kiosk-bg/50 border-cyan-500/20 text-white placeholder:text-kiosk-text/90 focus:border-cyan-500/50"
        />
        {(searchQuery || categoryFilter) && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-red-500/20"
            onClick={clearSearch}
          >
            <X className="w-3 h-3 text-red-400" />
          </Button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCategoryFilter(null)}
          className={cn(
            "h-6 px-2 text-[10px] rounded-full border transition-all",
            !categoryFilter 
              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" 
              : "bg-transparent border-kiosk-border text-kiosk-text/85 hover:border-cyan-500/30"
          )}
        >
          <Filter className="w-3 h-3 mr-1" />
          Todas
        </Button>
        {wikiCategories.map(cat => (
          <Button
            key={cat.id}
            variant="ghost"
            size="sm"
            onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
            className={cn(
              "h-6 px-2 text-[10px] rounded-full border transition-all",
              categoryFilter === cat.id 
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" 
                : "bg-transparent border-kiosk-border text-kiosk-text/85 hover:border-cyan-500/30"
            )}
          >
            {cat.title.split(' ')[0]}
          </Button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="p-3 mb-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-7 text-xs text-nav-neon-white hover:bg-primary/10"
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            Expandir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-7 text-xs text-nav-neon-white hover:bg-primary/10"
          >
            <FolderClosed className="w-3 h-3 mr-1" />
            Recolher
          </Button>
          <div className="ml-auto">
            <Toggle
              pressed={showTreeLines}
              onPressedChange={setShowTreeLines}
              size="sm"
              className="h-7 text-xs data-[state=on]:bg-primary/20"
            >
              <Minus className="w-3 h-3 mr-1" />
              Linhas
            </Toggle>
          </div>
        </div>
        <div className="text-xs text-description-visible">
          {searchQuery || categoryFilter 
            ? `${filteredArticleCount} de ${totalArticles} artigos` 
            : `${totalArticles} artigos • ${wikiCategories.length} categorias`
          }
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-380px)]">
        <nav className="space-y-1 pr-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-description-visible">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum artigo encontrado</p>
              <p className="text-xs mt-1">Tente outros termos de busca</p>
            </div>
          ) : (
          filteredCategories.map((category, catIndex) => {
            const isLastCategory = catIndex === filteredCategories.length - 1;
            const categoryArticleCount = getCategoryArticleCount(category);
            
            return (
              <div key={category.id} className="relative">
                {/* Category */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all",
                    "hover:bg-primary/10 border border-transparent",
                    expandedCategories.has(category.id) && "bg-kiosk-surface/50 border-primary/20",
                    selectedCategory === category.id && "bg-primary/20 text-primary border-primary/40",
                    // Special highlight for category with new articles (only if has unread)
                    category.id === CATEGORY_WITH_NEW_ARTICLES && 
                      [...NEW_ARTICLE_IDS].some(id => !(isArticleRead?.(id))) && 
                      "border-green-500/40 bg-green-500/5 hover:bg-green-500/10"
                  )}
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  <span className="icon-neon-blue">{iconMap[category.icon]}</span>
                  <span className="text-sm font-medium truncate flex-1">
                    {highlightMatch(category.title, searchQuery)}
                  </span>
                  {/* NOVO badge for integrations category (hide when all read) */}
                  {category.id === CATEGORY_WITH_NEW_ARTICLES && 
                    [...NEW_ARTICLE_IDS].some(id => !(isArticleRead?.(id))) && (
                    <Badge className="bg-green-500 text-white text-[8px] px-1.5 py-0 h-4 animate-pulse shadow-[0_0_8px_hsl(142_70%_45%/0.6)]">
                      NOVO
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-cyan-500/30 text-cyan-400">
                    {categoryArticleCount}
                  </Badge>
                </button>

                {/* SubSections */}
                <AnimatePresence>
                  {expandedCategories.has(category.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={cn("ml-4 relative", showTreeLines && "tree-container")}>
                        {/* Tree line for category */}
                        {showTreeLines && (
                          <div 
                            className="absolute left-2 top-0 bottom-4 w-px bg-gradient-to-b from-cyan-500/40 to-cyan-500/10"
                            style={{ height: 'calc(100% - 16px)' }}
                          />
                        )}
                        
                        {category.subSections.map((subSection, subIndex) => {
                          const isLastSubSection = subIndex === category.subSections.length - 1;
                          
                          return (
                            <div key={subSection.id} className="relative">
                              {/* Tree branch connector */}
                              {showTreeLines && (
                                <div className="absolute left-2 top-4 w-3 h-px bg-cyan-500/30" />
                              )}
                              
                              {/* SubSection Button */}
                              <button
                                onClick={() => toggleSubSection(subSection.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 py-1.5 rounded text-left",
                                  "hover:bg-kiosk-surface/50 text-nav-subtitle hover:text-kiosk-text",
                                  showTreeLines ? "pl-6 pr-2" : "px-3"
                                )}
                              >
                                {expandedSubSections.has(subSection.id) ? (
                                  <ChevronDown className="w-3 h-3 shrink-0 text-primary/70" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 shrink-0" />
                                )}
                                <span className="text-xs font-medium truncate flex-1">
                                  {highlightMatch(subSection.title, searchQuery)}
                                </span>
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-kiosk-border text-description-visible">
                                  {subSection.articles.length}
                                </Badge>
                              </button>

                              {/* Articles */}
                              <AnimatePresence>
                                {expandedSubSections.has(subSection.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden"
                                  >
                                    <div className={cn("relative", showTreeLines && "ml-4")}>
                                      {/* Tree line for subsection */}
                                      {showTreeLines && (
                                        <div 
                                          className="absolute left-2 top-0 w-px bg-gradient-to-b from-cyan-500/20 to-transparent"
                                          style={{ height: 'calc(100% - 12px)' }}
                                        />
                                      )}
                                      
                                      {subSection.articles.map((article, artIndex) => {
                                        const isLastArticle = artIndex === subSection.articles.length - 1;
                                        
                                        return (
                                          <div key={article.id} className="relative">
                                            {/* Article tree branch */}
                                            {showTreeLines && (
                                              <div className="absolute left-2 top-3 w-2 h-px bg-cyan-500/20" />
                                            )}
                                            
                                            <button
                                              onClick={() => {
                                                onSelectArticle(article.id);
                                                setHighlightedArticle(article.id);
                                                setTimeout(() => setHighlightedArticle(null), 1500);
                                              }}
                                              className={cn(
                                                "w-full flex items-center gap-2 py-1 rounded text-left text-xs transition-all",
                                                showTreeLines ? "pl-5 pr-2" : "px-3",
                                                selectedArticle === article.id
                                                  ? "bg-primary/20 text-primary"
                                                  : "hover:bg-kiosk-surface/30 text-description-visible hover:text-kiosk-text",
                                                // Highlight new articles (only if not read)
                                                NEW_ARTICLE_IDS.has(article.id) && !(isArticleRead?.(article.id)) && "bg-green-500/5 hover:bg-green-500/10",
                                                // Highlight pulse animation
                                                highlightedArticle === article.id && "animate-highlight-pulse"
                                              )}
                                            >
                                              <span className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                                                selectedArticle === article.id 
                                                  ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]" 
                                                  : (NEW_ARTICLE_IDS.has(article.id) && !(isArticleRead?.(article.id)))
                                                    ? "bg-green-500 shadow-[0_0_4px_hsl(142_70%_45%/0.5)]"
                                                    : "bg-current opacity-50"
                                              )} />
                                              <span className="truncate flex-1">
                                                {highlightMatch(article.title, searchQuery)}
                                              </span>
                                              {/* NOVO badge for new articles (hide if read) */}
                                              {NEW_ARTICLE_IDS.has(article.id) && !(isArticleRead?.(article.id)) && (
                                                <Badge className="bg-green-500/80 text-white text-[7px] px-1 py-0 h-3.5 ml-1">
                                                  NOVO
                                                </Badge>
                                              )}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
