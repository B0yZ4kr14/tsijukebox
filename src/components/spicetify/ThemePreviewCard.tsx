import { useState } from 'react';
import { Check, Eye, Download, Palette, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge, Button, Card } from "@/components/ui/themed"

export interface SpicetifyThemeColors {
  main?: string;
  sidebar?: string;
  player?: string;
  accent?: string;
  text?: string;
}

export interface SpicetifyTheme {
  name: string;
  author: string;
  description?: string;
  colors?: SpicetifyThemeColors;
  preview?: string;
  category?: 'dark' | 'light' | 'colorful' | 'minimal';
  downloads?: number;
}

interface ThemePreviewCardProps {
  theme: SpicetifyTheme;
  isActive: boolean;
  onApply: () => Promise<void> | void;
  onPreview: () => void;
}

export function ThemePreviewCard({ theme, isActive, onApply, onPreview }: ThemePreviewCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply();
      toast.success(`Tema "${theme.name}" aplicado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao aplicar tema');
    } finally {
      setIsApplying(false);
    }
  };

  const colors = {
    main: theme.colors?.main || '#181818',
    sidebar: theme.colors?.sidebar || '#121212',
    player: theme.colors?.player || '#282828',
    accent: theme.colors?.accent || '#1DB954',
    text: theme.colors?.text || '#ffffff',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={`
          group relative overflow-hidden transition-all duration-300 cursor-pointer
          bg-card/50 backdrop-blur-sm border-border/50
          hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
          ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
      >
        {/* Mock Spotify Player */}
        <div className="aspect-video relative overflow-hidden rounded-t-lg" role="presentation">
          <div className="absolute inset-0 flex" role="presentation">
            {/* Sidebar mock */}
            <div 
              className="w-1/4 h-full p-2 flex flex-col gap-2"
              style={{ backgroundColor: colors.sidebar }}
            >
              <div className="w-6 h-6 rounded bg-white/10" aria-hidden="true" />
              <div className="space-y-1.5 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-white/20" aria-hidden="true" />
                    <div className="flex-1 h-2 rounded bg-white/15" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main content mock */}
            <div 
              className="flex-1 flex flex-col"
              style={{ backgroundColor: colors.main }}
            >
              <div className="p-3 flex-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square rounded bg-white/10" />
                  ))}
                </div>
              </div>
              
              {/* Player bar mock */}
              <div 
                className="h-14 flex items-center px-3 gap-3"
                style={{ backgroundColor: colors.player }}
              >
                <div className="w-10 h-10 rounded bg-white/20 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 space-y-1">
                  <div className="w-20 h-2 rounded" style={{ backgroundColor: colors.text + '40' }} aria-hidden="true" />
                  <div className="w-14 h-1.5 rounded" style={{ backgroundColor: colors.text + '20' }} aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.text + '30' }} aria-hidden="true" />
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.text + '30' }} aria-hidden="true" />
                </div>
                <div className="w-24 space-y-0.5">
                  <div className="h-1 rounded-full bg-white/20 overflow-hidden" aria-hidden="true">
                    <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: colors.accent }} aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hover overlay with actions */}
          <motion.div 
            className="absolute inset-0 bg-black/70 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onPreview(); }} className="gap-1">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApply(); }} disabled={isApplying || isActive} className="gap-1">
              <Download aria-hidden="true" className="w-4 h-4" />
              {isActive ? 'Ativo' : 'Aplicar'}
            </Button>
          </motion.div>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-primary-foreground gap-1">
                <Check aria-hidden="true" className="w-3 h-3" />
                Ativo
              </Badge>
            </div>
          )}
        </div>
        
        {/* Theme Info */}
        <div className="mt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm truncate">{theme.name}</h3>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <User aria-hidden="true" className="w-3 h-3" />
                <span className="truncate">{theme.author}</span>
              </div>
            </div>
            {theme.category && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                {theme.category}
              </Badge>
            )}
          </div>
          
          {/* Color swatches */}
          <div className="flex gap-1 mt-2">
            {Object.entries(colors).slice(0, 4).map(([key, color]) => (
              <div
                key={key}
                className="w-5 h-5 rounded-full border border-border/50"
                style={{ backgroundColor: color }}
                title={key}
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}