import { useState, useMemo } from 'react';
import { Palette, Search, Filter, Grid, LayoutGrid, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { ThemePreviewCard, SpicetifyTheme } from '@/components/spicetify/ThemePreviewCard';
import { useSpicetifyIntegration } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Sample themes for demonstration
const SAMPLE_THEMES: SpicetifyTheme[] = [
  {
    name: 'Dribbblish',
    author: 'nimsandu',
    description: 'A Spotify theme with Dribbble-like aesthetics',
    colors: { main: '#1e1e2e', sidebar: '#181825', player: '#11111b', accent: '#cba6f7', text: '#cdd6f4' },
    category: 'dark',
  },
  {
    name: 'Catppuccin',
    author: 'catppuccin',
    description: 'Soothing pastel theme for Spotify',
    colors: { main: '#1e1e2e', sidebar: '#181825', player: '#11111b', accent: '#f5c2e7', text: '#cdd6f4' },
    category: 'dark',
  },
  {
    name: 'Nord',
    author: 'Tetrax-10',
    description: 'Arctic, north-bluish color palette',
    colors: { main: '#2e3440', sidebar: '#242933', player: '#3b4252', accent: '#88c0d0', text: '#eceff4' },
    category: 'dark',
  },
  {
    name: 'Gruvbox',
    author: 'Fausto-Korpsvart',
    description: 'Retro groove colors',
    colors: { main: '#282828', sidebar: '#1d2021', player: '#3c3836', accent: '#fe8019', text: '#ebdbb2' },
    category: 'dark',
  },
  {
    name: 'Dracula',
    author: 'dracula',
    description: 'Dark theme for Spotify',
    colors: { main: '#282a36', sidebar: '#21222c', player: '#44475a', accent: '#ff79c6', text: '#f8f8f2' },
    category: 'dark',
  },
  {
    name: 'Tokyo Night',
    author: 'enkia',
    description: 'Clean dark theme inspired by Tokyo Night',
    colors: { main: '#1a1b26', sidebar: '#16161e', player: '#24283b', accent: '#7aa2f7', text: '#c0caf5' },
    category: 'dark',
  },
  {
    name: 'Rosé Pine',
    author: 'rose-pine',
    description: 'Soho vibes for late-night sessions',
    colors: { main: '#191724', sidebar: '#1f1d2e', player: '#26233a', accent: '#c4a7e7', text: '#e0def4' },
    category: 'dark',
  },
  {
    name: 'Everforest',
    author: 'sainnhe',
    description: 'Green-based comfortable theme',
    colors: { main: '#2d353b', sidebar: '#272e33', player: '#343f44', accent: '#a7c080', text: '#d3c6aa' },
    category: 'dark',
  },
  {
    name: 'Solarized Light',
    author: 'altercation',
    description: 'Precision light theme',
    colors: { main: '#fdf6e3', sidebar: '#eee8d5', player: '#93a1a1', accent: '#268bd2', text: '#657b83' },
    category: 'light',
  },
  {
    name: 'Aura',
    author: 'daltonmenezes',
    description: 'A beautiful dark theme with soft purples',
    colors: { main: '#15141b', sidebar: '#110f18', player: '#1c1b22', accent: '#a277ff', text: '#edecee' },
    category: 'dark',
  },
  {
    name: 'Kanagawa',
    author: 'rebelot',
    description: 'Dark theme inspired by Japanese art',
    colors: { main: '#1f1f28', sidebar: '#16161d', player: '#2a2a37', accent: '#7e9cd8', text: '#dcd7ba' },
    category: 'dark',
  },
  {
    name: 'Monochrome',
    author: 'minimal',
    description: 'Simple black and white theme',
    colors: { main: '#0a0a0a', sidebar: '#000000', player: '#141414', accent: '#ffffff', text: '#e0e0e0' },
    category: 'minimal',
  },
];

type CategoryFilter = 'all' | 'dark' | 'light' | 'colorful' | 'minimal';

export default function SpicetifyThemeGallery() {
  const { themes, applyTheme, status } = useSpicetifyIntegration();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [activeTheme, setActiveTheme] = useState<string>('Dribbblish');
  const [previewTheme, setPreviewTheme] = useState<SpicetifyTheme | null>(null);

  // Combine sample themes with any loaded themes
  const allThemes = useMemo(() => {
    const loadedThemes = themes?.map((t: { name: string; author?: string }) => ({
      name: t.name,
      author: t.author || 'Unknown',
      category: 'dark' as const,
    })) || [];
    return [...SAMPLE_THEMES, ...loadedThemes];
  }, [themes]);

  // Filter themes
  const filteredThemes = useMemo(() => {
    return allThemes.filter((theme) => {
      const matchesSearch = 
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'all' || theme.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [allThemes, searchQuery, categoryFilter]);

  const handleApplyTheme = async (themeName: string) => {
    try {
      await applyTheme(themeName);
      setActiveTheme(themeName);
    } catch (error) {
      console.error('Error applying theme:', error);
      throw error;
    }
  };

  const handlePreview = (theme: SpicetifyTheme) => {
    setPreviewTheme(theme);
    toast.info(`Previewing: ${theme.name}`, {
      description: `By ${theme.author}`,
      duration: 2000,
    });
  };

  const categories: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'Todos', icon: <Grid className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <LayoutGrid className="w-4 h-4" /> },
    { value: 'light', label: 'Light', icon: <Sparkles className="w-4 h-4" /> },
    { value: 'minimal', label: 'Minimal', icon: <Filter className="w-4 h-4" /> },
  ];

  return (
    <KioskLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Spicetify Themes</h1>
              <p className="text-sm text-muted-foreground">
                Personalize seu Spotify com temas incríveis
              </p>
            </div>
          </div>
          
          {status && (
            <Badge 
              variant={status.installed ? 'default' : 'secondary'}
              className="self-start md:self-auto"
            >
              Spicetify: {status.installed ? 'Instalado' : 'Não instalado'}
            </Badge>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar temas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="gap-1.5">
                  {cat.icon}
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredThemes.length} temas encontrados</span>
          {activeTheme && (
            <Badge variant="outline" className="gap-1">
              <Palette className="w-3 h-3" />
              Tema ativo: {activeTheme}
            </Badge>
          )}
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredThemes.map((theme, index) => (
              <motion.div
                key={theme.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <ThemePreviewCard
                  theme={theme}
                  isActive={activeTheme === theme.name}
                  onApply={() => handleApplyTheme(theme.name)}
                  onPreview={() => handlePreview(theme)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredThemes.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Palette className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum tema encontrado
              </p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar seus filtros de busca
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
              >
                Limpar filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preview Modal would go here */}
      </div>
    </KioskLayout>
  );
}
