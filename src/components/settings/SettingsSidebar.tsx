import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plug, 
  Database, 
  Settings2, 
  Palette, 
  Shield, 
  Globe,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  X,
  Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type SettingsCategory = 
  | 'dashboard'
  | 'connections' 
  | 'data' 
  | 'system' 
  | 'appearance' 
  | 'security' 
  | 'integrations';

interface CategoryItem {
  id: SettingsCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  keywords: string[];
}

const categories: CategoryItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'gold', keywords: ['dashboard', 'visão', 'geral', 'status', 'overview'] },
  { id: 'connections', label: 'Conexões', icon: Plug, color: 'cyan', keywords: ['backend', 'api', 'websocket', 'polling', 'cloud', 'url', 'servidor'] },
  { id: 'data', label: 'Dados', icon: Database, color: 'amber', keywords: ['database', 'sqlite', 'backup', 'restore', 'cloud', 'aws', 's3', 'google drive', 'schedule', 'agendamento'] },
  { id: 'system', label: 'Sistema', icon: Settings2, color: 'purple', keywords: ['demo', 'ntp', 'hora', 'time', 'versão', 'info', 'urls', 'grafana', 'prometheus'] },
  { id: 'appearance', label: 'Aparência', icon: Palette, color: 'pink', keywords: ['tema', 'theme', 'cor', 'color', 'idioma', 'language', 'acessibilidade', 'contraste'] },
  { id: 'security', label: 'Segurança', icon: Shield, color: 'green', keywords: ['usuário', 'user', 'senha', 'password', 'admin', 'permissão', 'keys', 'api key', 'auth'] },
  { id: 'integrations', label: 'Integrações', icon: Globe, color: 'blue', keywords: ['spotify', 'spicetify', 'youtube', 'youtube music', 'ytm', 'clima', 'weather', 'openweathermap', 'música', 'music', 'streaming', 'tema', 'extensão'] },
];

interface SettingsSidebarProps {
  activeCategory: SettingsCategory;
  onCategoryChange: (category: SettingsCategory) => void;
}

export function SettingsSidebar({ activeCategory, onCategoryChange }: SettingsSidebarProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.label.toLowerCase().includes(query) ||
      cat.keywords.some(kw => kw.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        className={cn(
          "settings-sidebar",
          isExpanded && "settings-sidebar-expanded"
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="settings-sidebar-toggle"
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>

        {/* Search Field (only when expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-2 mb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/80" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 bg-kiosk-bg/50 border-kiosk-surface/50 text-sm h-9 text-kiosk-text placeholder:text-kiosk-text/80"
                />
                {searchQuery && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-kiosk-text/85 hover:text-kiosk-text"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact search icon when collapsed */}
        {!isExpanded && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(true)}
                className="w-10 h-10 mb-2 text-kiosk-text/85 hover:text-kiosk-text hover:bg-kiosk-surface/50"
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="settings-tooltip">
              Buscar configurações
            </TooltipContent>
          </Tooltip>
        )}

        {/* Category Buttons */}
        <nav className="flex flex-col gap-2">
          {filteredCategories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <Tooltip key={category.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                      "settings-nav-button-3d relative",
                      isActive && "active"
                    )}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5 settings-nav-icon-3d" />

                    {isExpanded && (
                      <motion.span
                        className="ml-3 text-sm font-medium whitespace-nowrap flex-1 text-left text-kiosk-text/90"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {category.label}
                      </motion.span>
                    )}
                  </motion.button>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" className="settings-tooltip">
                    {category.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {/* GitHub Dashboard Link */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => navigate('/github-dashboard')}
                className="settings-nav-button-3d relative mt-4 border-t border-kiosk-surface/30 pt-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5 settings-nav-icon-3d" />

                {isExpanded && (
                  <motion.span
                    className="ml-3 text-sm font-medium whitespace-nowrap flex-1 text-left text-kiosk-text/90"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    GitHub Stats
                  </motion.span>
                )}
              </motion.button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right" className="settings-tooltip">
                GitHub Dashboard
              </TooltipContent>
            )}
          </Tooltip>
        </nav>

        {/* No results message */}
        {searchQuery && filteredCategories.length === 0 && (
          <motion.p
            className="text-xs text-kiosk-text/85 text-center mt-4 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Nenhuma categoria encontrada
          </motion.p>
        )}
      </motion.aside>
    </TooltipProvider>
  );
}
