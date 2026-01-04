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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button, Input } from "@/components/ui/themed"

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

/**
 * SettingsSidebar Component
 * 
 * Navigation sidebar for Settings page with search, expand/collapse, and category filtering.
 * Integrated with TSiJUKEBOX Design System tokens.
 * 
 * @example
 * ```tsx
 * <SettingsSidebar 
 *   activeCategory="dashboard" 
 *   onCategoryChange={(cat) => setCategory(cat)} 
 * />
 * ```
 */
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
          // Base styles with design tokens
          "fixed left-0 top-0 h-full z-40",
          "bg-bg-secondary/80 backdrop-blur-xl border-r border-[#222222]",
          "flex flex-col p-3 gap-3",
          "transition-all duration-normal",
          // Width based on expanded state
          isExpanded ? "w-64" : "w-16",
          // Shadow
          "shadow-elevation-high"
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "self-end shrink-0",
            "text-text-secondary hover:text-accent-cyan",
            "hover:bg-bg-tertiary"
          )}
          aria-label={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft aria-hidden="true" className="w-4 h-4" />
          ) : (
            <ChevronRight aria-hidden="true" className="w-4 h-4" />
          )}
        </Button>

        {/* Search Field (only when expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9"
                  variant="primary"
                  aria-label="Buscar configurações"
                />
                {searchQuery && (
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    aria-label="Limpar busca"
                  >
                    <X aria-hidden="true" className="w-3 h-3" />
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
                size="xs"
                onClick={() => setIsExpanded(true)}
                className={cn(
                  "w-10 h-10",
                  "text-text-secondary hover:text-accent-cyan",
                  "hover:bg-bg-tertiary"
                )}
                aria-label="Abrir busca"
              >
                <Search aria-hidden="true" className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="bg-bg-tertiary border-[#333333] text-text-primary"
            >
              Buscar configurações
            </TooltipContent>
          </Tooltip>
        )}

        {/* Category Buttons */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto" role="navigation" aria-label="Categorias de configurações">
          {filteredCategories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <Tooltip key={category.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => onCategoryChange(category.id)}
                    className={cn(
                      // Base styles
                      "relative flex items-center justify-start",
                      "px-3 py-2.5 rounded-lg",
                      "transition-all duration-normal",
                      "group",
                      // Default state
                      "bg-bg-tertiary/50 border border-[#222222]",
                      "text-text-secondary",
                      // Hover state
                      "hover:bg-bg-tertiary hover:border-accent-cyan/30",
                      "hover:text-accent-cyan hover:shadow-glow-cyan",
                      // Active state
                      isActive && [
                        "bg-accent-cyan/10 border-accent-cyan/50",
                        "text-accent-cyan shadow-glow-cyan",
                      ],
                      // Focus state
                      "focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg-primary"
                    )}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={category.label}
                  >
                    <Icon 
                      className={cn(
                        "w-5 h-5 shrink-0",
                        "transition-all duration-normal",
                        isActive && "drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]"
                      )} 
                    />

                    {isExpanded && (
                      <motion.span
                        className="ml-3 text-sm font-medium whitespace-nowrap flex-1 text-left"
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
                  <TooltipContent 
                    side="right" 
                    className="bg-bg-tertiary border-[#333333] text-text-primary"
                  >
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
                className={cn(
                  // Base styles
                  "relative flex items-center justify-start",
                  "px-3 py-2.5 rounded-lg",
                  "transition-all duration-normal",
                  "group",
                  "mt-4 border-t border-[#222222] pt-4",
                  // Default state
                  "bg-bg-tertiary/50 border border-[#222222]",
                  "text-text-secondary",
                  // Hover state
                  "hover:bg-bg-tertiary hover:border-brand-github/30",
                  "hover:text-brand-github hover:shadow-[0_0_20px_rgba(88,166,255,0.3)]",
                  // Focus state
                  "focus:outline-none focus:ring-2 focus:ring-brand-github focus:ring-offset-2 focus:ring-offset-bg-primary"
                )}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="GitHub Dashboard"
              >
                <Github className="w-5 h-5 shrink-0 transition-all duration-normal" />

                {isExpanded && (
                  <motion.span
                    className="ml-3 text-sm font-medium whitespace-nowrap flex-1 text-left"
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
              <TooltipContent 
                side="right" 
                className="bg-bg-tertiary border-[#333333] text-text-primary"
              >
                GitHub Dashboard
              </TooltipContent>
            )}
          </Tooltip>
        </nav>

        {/* No results message */}
        {searchQuery && filteredCategories.length === 0 && (
          <motion.p
            className="text-xs text-text-tertiary text-center px-2"
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
