import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Lightbulb, 
  ListOrdered, 
  Link2,
  Play,
  SkipForward,
  SkipBack,
  Volume2,
  Settings,
  Music,
  Hand,
  Keyboard,
  Bookmark,
  Download,
  Check,
  CloudOff
} from 'lucide-react';
import { WikiArticle as WikiArticleType, findArticleById, getArticlePath } from './wikiData';
import { formatBrandName } from '@/lib/utils';
import { Badge, Button } from "@/components/ui/themed"

interface WikiArticleProps {
  article: WikiArticleType;
  onSelectArticle: (articleId: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onArticleViewed?: (articleId: string) => void;
  onSaveOffline?: (article: WikiArticleType) => void;
  onRemoveOffline?: (articleId: string) => void;
  isSavedOffline?: boolean;
  isOfflineMode?: boolean;
}

// Simple illustration components
function PlayerIllustration() {
  return (
    <div className="bg-kiosk-bg rounded-xl p-6 border border-border">
      <div className="flex items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <Music className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-kiosk-surface rounded" />
          <div className="h-3 w-24 bg-kiosk-surface/60 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="w-12 h-12 rounded-full bg-kiosk-surface flex items-center justify-center">
          <SkipBack aria-hidden="true" className="w-5 h-5 text-kiosk-text/90" />
        </div>
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <Play className="w-8 h-8 text-primary-foreground ml-1" />
        </div>
        <div className="w-12 h-12 rounded-full bg-kiosk-surface flex items-center justify-center">
          <SkipForward aria-hidden="true" className="w-5 h-5 text-kiosk-text/90" />
        </div>
      </div>
    </div>
  );
}

function KeyboardIllustration() {
  return (
    <div className="bg-kiosk-bg rounded-xl p-6 border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {['←', '↑', '↓', '→'].map((key) => (
            <div
              key={key}
              className="w-10 h-10 rounded-lg bg-kiosk-surface border border-border flex items-center justify-center text-kiosk-text font-mono"
            >
              {key}
            </div>
          ))}
        </div>
        <div className="w-32 h-10 rounded-lg bg-kiosk-surface border border-border flex items-center justify-center text-kiosk-text font-mono text-sm">
          Espaço
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-lg bg-kiosk-surface border border-border flex items-center justify-center text-kiosk-text font-mono">
            +
          </div>
          <div className="w-10 h-10 rounded-lg bg-kiosk-surface border border-border flex items-center justify-center text-kiosk-text font-mono">
            -
          </div>
        </div>
      </div>
    </div>
  );
}

function GestureIllustration() {
  return (
    <div className="bg-kiosk-bg rounded-xl p-6 border border-border">
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-kiosk-surface flex items-center justify-center mb-2">
            <Hand className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs text-kiosk-text/90">Toque</span>
        </div>
        <div className="flex items-center gap-2 text-kiosk-text/85">
          <span>←</span>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <span>→</span>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-kiosk-surface flex items-center justify-center mb-2">
            <ChevronRight aria-hidden="true" className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs text-kiosk-text/90">Deslizar</span>
        </div>
      </div>
    </div>
  );
}

function SettingsIllustration() {
  return (
    <div className="bg-kiosk-bg rounded-xl p-6 border border-border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
          <Settings aria-hidden="true" className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-kiosk-surface rounded" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-10 bg-primary/30 rounded-full" />
            <div className="h-3 w-16 bg-kiosk-surface/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VolumeIllustration() {
  return (
    <div className="bg-kiosk-bg rounded-xl p-6 border border-border">
      <div className="flex items-center gap-4">
        <Volume2 aria-hidden="true" className="w-6 h-6 text-primary" />
        <div className="flex-1 h-2 bg-kiosk-surface rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
        </div>
        <span className="text-sm font-mono text-kiosk-text">75%</span>
      </div>
    </div>
  );
}

const illustrations: Record<string, React.ReactNode> = {
  player: <PlayerIllustration />,
  keyboard: <KeyboardIllustration />,
  gesture: <GestureIllustration />,
  settings: <SettingsIllustration />,
  volume: <VolumeIllustration />,
  spotify: <PlayerIllustration />,
  queue: <PlayerIllustration />,
  playback: <PlayerIllustration />,
  deck: <SettingsIllustration />,
};

export function WikiArticleView({ 
  article, 
  onSelectArticle, 
  isBookmarked, 
  onToggleBookmark, 
  onArticleViewed,
  onSaveOffline,
  onRemoveOffline,
  isSavedOffline,
  isOfflineMode
}: WikiArticleProps) {
  const path = getArticlePath(article.id);

  // Mark article as read when viewed
  useEffect(() => {
    if (onArticleViewed) {
      onArticleViewed(article.id);
    }
  }, [article.id, onArticleViewed]);

  const handleOfflineToggle = () => {
    if (isSavedOffline && onRemoveOffline) {
      onRemoveOffline(article.id);
    } else if (onSaveOffline) {
      onSaveOffline(article);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      {path && (
        <div className="flex items-center gap-2 text-xs text-kiosk-text/85">
          <span>Wiki</span>
          <ChevronRight aria-hidden="true" className="w-3 h-3" />
          <span>{path.category.title}</span>
          <ChevronRight aria-hidden="true" className="w-3 h-3" />
          <span>{path.subSection.title}</span>
          <ChevronRight aria-hidden="true" className="w-3 h-3" />
          <span className="text-primary">{article.title}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gold-neon">{formatBrandName(article.title)}</h1>
            {isSavedOffline && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <CloudOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {isOfflineMode && !isSavedOffline && (
              <Badge variant="danger" className="text-xs">
                Sem cache
              </Badge>
            )}
          </div>
          <p className="text-kiosk-text/90">{formatBrandName(article.description)}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Offline Button */}
          {(onSaveOffline || onRemoveOffline) && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleOfflineToggle}
              className={`${isSavedOffline ? 'text-green-500 hover:text-green-400' : 'text-secondary-visible hover:text-green-500'}`}
              title={isSavedOffline ? 'Remover do offline' : 'Salvar para offline'} aria-label="Confirmar">
              {isSavedOffline ? (
                <Check aria-hidden="true" className="w-5 h-5" />
              ) : (
                <Download aria-hidden="true" className="w-5 h-5" />
              )}
            </Button>
          )}
          {/* Bookmark Button */}
          {onToggleBookmark && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onToggleBookmark}
              className={`${isBookmarked ? 'text-yellow-500' : 'text-secondary-visible hover:text-yellow-500'}`} aria-label="Salvar">
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500' : ''}`} />
            </Button>
          )}
        </div>
      </header>

      {/* Illustration */}
      {article.illustration && illustrations[article.illustration] && (
        <div className="my-6">
          {illustrations[article.illustration]}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <p className="text-kiosk-text/80 leading-relaxed">{formatBrandName(article.content)}</p>
      </div>

      {/* Steps */}
      {article.steps && article.steps.length > 0 && (
        <div className="space-y-3 p-4 rounded-xl bg-kiosk-surface/50 border border-border">
          <div className="flex items-center gap-2 text-label-yellow">
            <ListOrdered className="w-5 h-5" />
            <h3 className="font-semibold">Passo a Passo</h3>
          </div>
          <ol className="space-y-2">
            {article.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-kiosk-text/80">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{formatBrandName(step)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tips */}
      {article.tips && article.tips.length > 0 && (
        <div className="space-y-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-semibold">Dicas</h3>
          </div>
          <ul className="space-y-1">
            {article.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-kiosk-text/90">
                <span className="text-primary">•</span>
                <span>{formatBrandName(tip)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-kiosk-text/90">
            <Link2 className="w-4 h-4" />
            <h3 className="text-sm font-medium">Artigos Relacionados</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.relatedArticles.map((relatedId) => {
              const related = findArticleById(relatedId);
              if (!related) return null;
              return (
                <Button
                  key={relatedId}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectArticle(relatedId)}
                  className="text-xs"
                >
                  {related.title}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </motion.article>
  );
}
