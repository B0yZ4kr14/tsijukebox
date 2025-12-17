import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
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

interface WikiNavigationProps {
  selectedArticle: string | null;
  onSelectArticle: (articleId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
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

export function WikiNavigation({ 
  selectedArticle, 
  onSelectArticle, 
  onSelectCategory,
  selectedCategory 
}: WikiNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(selectedCategory ? [selectedCategory] : [])
  );
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());

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

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <nav className="space-y-1 pr-4">
        {wikiCategories.map((category) => (
          <div key={category.id} className="space-y-1">
            {/* Category */}
            <button
              onClick={() => toggleCategory(category.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-kiosk-surface text-kiosk-text/80 hover:text-kiosk-text'
              }`}
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
              <span className="icon-neon-blue">{iconMap[category.icon]}</span>
              <span className="text-sm font-medium truncate">{category.title}</span>
            </button>

            {/* SubSections */}
            <AnimatePresence>
              {expandedCategories.has(category.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden ml-4"
                >
                  {category.subSections.map((subSection) => (
                    <div key={subSection.id} className="space-y-1">
                      {/* SubSection */}
                      <button
                        onClick={() => toggleSubSection(subSection.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-left hover:bg-kiosk-surface/50 text-kiosk-text/70 hover:text-kiosk-text"
                      >
                        {expandedSubSections.has(subSection.id) ? (
                          <ChevronDown className="w-3 h-3 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 shrink-0" />
                        )}
                        <span className="text-xs font-medium truncate">{subSection.title}</span>
                        <span className="text-xs text-kiosk-text/40 ml-auto">{subSection.articles.length}</span>
                      </button>

                      {/* Articles */}
                      <AnimatePresence>
                        {expandedSubSections.has(subSection.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden ml-4"
                          >
                            {subSection.articles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => onSelectArticle(article.id)}
                                className={`w-full flex items-center gap-2 px-3 py-1 rounded text-left text-xs transition-all ${
                                  selectedArticle === article.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-kiosk-surface/30 text-kiosk-text/60 hover:text-kiosk-text'
                                }`}
                              >
                                <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                                <span className="truncate">{article.title}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
