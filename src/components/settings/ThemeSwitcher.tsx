/**
 * TSiJUKEBOX Theme Switcher Component
 * ===================================
 * Componente visual para troca dinâmica entre os 6 temas
 * 
 * @author B0.y_Z4kr14
 * @license Public Domain
 */

import React from 'react';
import { useTheme, themes, ThemeId, Theme } from '@/themes/themeManager';
import { Check, ChevronLeft, ChevronRight, Palette } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// THEME CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, onClick }) => {
  const { colors } = theme;
  
  return (
    <button
      onClick={onClick}
      className={`
        relative group w-full p-4 rounded-xl border-2 transition-all duration-300
        ${isActive 
          ? 'border-[var(--accent-primary)] shadow-[var(--glow-primary)]' 
          : 'border-[var(--bg-tertiary)] hover:border-[var(--accent-secondary)]'
        }
      `}
      style={{ backgroundColor: colors.bgSecondary }}
    >
      {/* Preview do tema */}
      <div 
        className="w-full h-24 rounded-lg mb-3 overflow-hidden"
        style={{ background: colors.bgGradient }}
      >
        {/* Mini preview */}
        <div className="p-2 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.accentPrimary }}
            />
            <div 
              className="h-2 w-12 rounded"
              style={{ backgroundColor: colors.textSecondary }}
            />
          </div>
          
          {/* Content */}
          <div className="flex gap-2">
            <div 
              className="h-8 w-8 rounded"
              style={{ backgroundColor: colors.accentSecondary }}
            />
            <div className="flex-1 space-y-1">
              <div 
                className="h-2 w-full rounded"
                style={{ backgroundColor: colors.textPrimary }}
              />
              <div 
                className="h-2 w-3/4 rounded"
                style={{ backgroundColor: colors.textSecondary }}
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex gap-1">
            {[colors.accentPrimary, colors.accentSecondary, colors.accentTertiary].map((color, i) => (
              <div 
                key={i}
                className="h-1.5 flex-1 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{theme.icon}</span>
          <span 
            className="font-semibold text-sm"
            style={{ color: colors.textPrimary }}
          >
            {theme.name}
          </span>
        </div>
        <p 
          className="text-xs line-clamp-2"
          style={{ color: colors.textSecondary }}
        >
          {theme.description}
        </p>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.accentPrimary }}
        >
          <Check className="w-4 h-4" style={{ color: colors.bgPrimary }} />
        </div>
      )}
      
      {/* Color palette preview */}
      <div className="absolute bottom-2 right-2 flex gap-0.5">
        {[colors.accentPrimary, colors.accentSecondary, colors.accentTertiary].map((color, i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME SWITCHER GRID
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeSwitcherGridProps {
  columns?: 2 | 3;
}

export const ThemeSwitcherGrid: React.FC<ThemeSwitcherGridProps> = ({ columns = 3 }) => {
  const { themeId, setTheme, allThemes } = useTheme();
  
  return (
    <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {allThemes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          isActive={themeId === theme.id}
          onClick={() => setTheme(theme.id)}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME SWITCHER COMPACT (para navbar)
// ═══════════════════════════════════════════════════════════════════════════

export const ThemeSwitcherCompact: React.FC = () => {
  const { theme, nextTheme, previousTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)]">
      <button
        onClick={previousTheme}
        className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
        title="Tema anterior"
      >
        <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>
      
      <div className="flex items-center gap-2 min-w-[120px] justify-center">
        <span className="text-lg">{theme.icon}</span>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {theme.name}
        </span>
      </div>
      
      <button
        onClick={nextTheme}
        className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
        title="Próximo tema"
      >
        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME SWITCHER DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeSwitcherDropdownProps {
  align?: 'left' | 'right';
}

export const ThemeSwitcherDropdown: React.FC<ThemeSwitcherDropdownProps> = ({ align = 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, themeId, setTheme, allThemes } = useTheme();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Fecha dropdown ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] hover:border-[var(--accent-primary)] transition-all"
        title="Trocar tema"
      >
        <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
        <span className="text-lg">{theme.icon}</span>
      </button>
      
      {isOpen && (
        <div 
          className={`
            absolute top-full mt-2 w-64 p-2 rounded-xl
            bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)]
            shadow-lg z-50
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 mb-2">
            Selecionar Tema
          </div>
          
          <div className="space-y-1">
            {allThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${themeId === t.id 
                    ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]' 
                    : 'hover:bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                <span className="text-xl">{t.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {t.name}
                  </div>
                </div>
                {themeId === t.id && (
                  <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ThemePreviewProps {
  themeId: ThemeId;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ themeId, size = 'md' }) => {
  const theme = themes[themeId];
  if (!theme) return null;
  
  const { colors } = theme;
  const sizeClasses = {
    sm: 'w-16 h-12',
    md: 'w-24 h-16',
    lg: 'w-32 h-24',
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-[var(--bg-tertiary)]`}
      style={{ background: colors.bgGradient }}
      title={theme.name}
    >
      <div className="p-1 h-full flex flex-col justify-between">
        <div className="flex gap-1">
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.accentPrimary }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.accentSecondary }}
          />
        </div>
        <div className="flex gap-0.5">
          {[colors.accentPrimary, colors.accentSecondary, colors.accentTertiary].map((color, i) => (
            <div 
              key={i}
              className="h-1 flex-1 rounded"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default ThemeSwitcherGrid;
