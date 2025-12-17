import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, FileText, Printer, Star, Trash2, Search, Download, Code, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { WikiNavigation } from '@/components/wiki/WikiNavigation';
import { WikiArticleView } from '@/components/wiki/WikiArticle';
import { WikiSearch } from '@/components/wiki/WikiSearch';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { wikiCategories, findArticleById, getTotalArticleCount } from '@/components/wiki/wikiData';
import { useWikiBookmarks } from '@/hooks/useWikiBookmarks';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { downloadMarkdown, downloadHTML, printDocument } from '@/lib/documentExporter';
import { toast } from 'sonner';

export default function Wiki() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { bookmarks, toggleBookmark, isBookmarked, clearBookmarks } = useWikiBookmarks();

  // Global search
  const globalSearch = useGlobalSearch({});

  // Handle URL params for article selection
  useEffect(() => {
    const articleId = searchParams.get('article');
    if (articleId) {
      setSelectedArticle(articleId);
    }
  }, [searchParams]);

  const article = selectedArticle ? findArticleById(selectedArticle) : null;
  const totalArticles = getTotalArticleCount();

  // Export functions
  const handleExportMarkdown = () => {
    downloadMarkdown([]);
    toast.success('Markdown exportado com sucesso!');
  };

  const handleExportHTML = () => {
    downloadHTML([]);
    toast.success('HTML exportado com sucesso!');
  };

  const handlePrint = () => {
    printDocument([]);
  };

  return (
    <div className="min-h-screen bg-kiosk-bg">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-kiosk-bg/95 backdrop-blur border-b border-border no-print">
        <div className="p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-kiosk-text/70 hover:text-kiosk-text"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 icon-neon-blue" />
                <div>
                  <h1 className="text-xl font-bold text-gold-neon">Wiki</h1>
                  <p className="text-xs text-kiosk-text/60">
                    {totalArticles} artigos em {wikiCategories.length} categorias
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-64">
                <WikiSearch onSelectArticle={setSelectedArticle} />
              </div>
              {/* Global Search Button */}
              <Button
                onClick={() => globalSearch.setIsOpen(true)}
                variant="outline"
                size="sm"
                className="button-outline-neon"
              >
                <Search className="w-4 h-4 mr-2" />
                <kbd className="px-1 py-0.5 text-[10px] bg-kiosk-surface rounded">Ctrl+K</kbd>
              </Button>
              <Button
                onClick={() => navigate('/help')}
                variant="outline"
                size="sm"
                className="button-outline-neon"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="button-outline-neon">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-kiosk-surface border-kiosk-border">
                  <DropdownMenuItem onClick={handleExportMarkdown} className="text-kiosk-text hover:bg-kiosk-bg cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Exportar Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportHTML} className="text-kiosk-text hover:bg-kiosk-bg cursor-pointer">
                    <Code className="w-4 h-4 mr-2" />
                    Exportar HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint} className="text-kiosk-text hover:bg-kiosk-bg cursor-pointer">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir / PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <LogoBrand size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={globalSearch.isOpen}
        onClose={() => globalSearch.setIsOpen(false)}
        query={globalSearch.query}
        setQuery={globalSearch.setQuery}
        results={globalSearch.results}
        filters={globalSearch.filters}
        toggleSource={globalSearch.toggleSource}
        clearSearch={globalSearch.clearSearch}
        helpCount={globalSearch.helpCount}
        wikiCount={globalSearch.wikiCount}
      />

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 no-print">
            <div className="sticky top-24 space-y-4">
              {/* Bookmarks Section */}
              {bookmarks.length > 0 && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-yellow-400">Favoritos</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearBookmarks();
                        toast.success('Favoritos limpos');
                      }}
                      className="h-6 w-6 p-0 text-kiosk-text/50 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {bookmarks.slice(0, 5).map(id => {
                      const art = findArticleById(id);
                      if (!art) return null;
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="cursor-pointer text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300"
                          onClick={() => setSelectedArticle(id)}
                        >
                          {art.title.length > 15 ? art.title.slice(0, 15) + '...' : art.title}
                        </Badge>
                      );
                    })}
                    {bookmarks.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{bookmarks.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <h2 className="text-sm font-semibold text-label-yellow px-3">NAVEGAÇÃO</h2>
              <WikiNavigation
                selectedArticle={selectedArticle}
                onSelectArticle={setSelectedArticle}
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 wiki-content">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {article ? (
                <WikiArticleView 
                  article={article} 
                  onSelectArticle={setSelectedArticle}
                  isBookmarked={isBookmarked(article.id)}
                  onToggleBookmark={() => {
                    toggleBookmark(article.id);
                    toast.success(isBookmarked(article.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
                  }}
                />
              ) : selectedCategory ? (
                <CategoryOverview 
                  categoryId={selectedCategory}
                  onSelectArticle={setSelectedArticle}
                />
              ) : (
                <WelcomeScreen 
                  onSelectCategory={setSelectedCategory}
                  onSelectArticle={setSelectedArticle}
                />
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Overview Component
function CategoryOverview({ 
  categoryId, 
  onSelectArticle 
}: { 
  categoryId: string; 
  onSelectArticle: (id: string) => void;
}) {
  const category = wikiCategories.find(c => c.id === categoryId);
  if (!category) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gold-neon">{category.title}</h1>
        <p className="text-kiosk-text/70">{category.description}</p>
      </header>

      <div className="grid gap-4">
        {category.subSections.map((subSection) => (
          <div 
            key={subSection.id}
            className="p-4 rounded-xl bg-kiosk-surface/50 border border-border space-y-3"
          >
            <h2 className="font-semibold text-kiosk-text">{subSection.title}</h2>
            <div className="grid gap-2">
              {subSection.articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => onSelectArticle(article.id)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-kiosk-bg transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-kiosk-text text-sm">{article.title}</p>
                    <p className="text-xs text-kiosk-text/60">{article.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Welcome Screen Component
function WelcomeScreen({ 
  onSelectCategory,
  onSelectArticle
}: { 
  onSelectCategory: (id: string) => void;
  onSelectArticle: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center py-8">
        <LogoBrand size="sm" variant="metal" className="opacity-50 mb-4" />
        <h1 className="text-2xl font-bold text-gold-neon mb-2">
          Bem-vindo à Wiki
        </h1>
        <p className="text-kiosk-text/70 max-w-lg mx-auto">
          Documentação completa sobre todas as funcionalidades do sistema. 
          Selecione uma categoria na navegação ou use a busca para encontrar o que precisa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wikiCategories.map((category) => {
          const articleCount = category.subSections.reduce(
            (acc, sub) => acc + sub.articles.length, 0
          );
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="p-6 rounded-xl bg-kiosk-surface/50 border border-border hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Book className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-kiosk-text group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-xs text-kiosk-text/50">{articleCount} artigos</p>
                </div>
              </div>
              <p className="text-sm text-kiosk-text/60 line-clamp-2">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
        <h3 className="font-semibold text-primary mb-4">Artigos Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['play-pause', 'keyboard-playback', 'swipe-gestures', 'spotify-connect'].map((articleId) => {
            const article = findArticleById(articleId);
            if (!article) return null;
            return (
              <button
                key={articleId}
                onClick={() => onSelectArticle(articleId)}
                className="p-3 rounded-lg bg-kiosk-surface/50 hover:bg-kiosk-surface transition-colors text-left"
              >
                <p className="text-sm font-medium text-kiosk-text truncate">{article.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
