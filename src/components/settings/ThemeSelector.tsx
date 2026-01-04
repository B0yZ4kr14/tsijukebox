/**
 * TSiJUKEBOX Theme Selector
 * 
 * Componente para seleção dos 5 temas oficiais:
 * 1. Cosmic Player - Visual aurora cósmico
 * 2. Karaoke Stage - Visual de palco
 * 3. Dashboard Home - Visual moderno com cards
 * 4. Spotify Integration - Visual verde Spotify
 * 5. Settings Dark - Visual escuro minimalista
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { type ThemeName, themes, themeList } from '@/lib/themes';
import { Check, Palette, Music, Mic2, LayoutDashboard, Settings, Sparkles } from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

interface ThemeSelectorProps {
  className?: string;
  layout?: 'grid' | 'list';
  showDescription?: boolean;
  showPreview?: boolean;
}

interface ThemeCardProps {
  themeName: ThemeName;
  isSelected: boolean;
  onSelect: () => void;
  showDescription?: boolean;
  showPreview?: boolean;
  layout?: 'grid' | 'list';
}

// ============================================================================
// ÍCONES DOS TEMAS
// ============================================================================

const themeIcons: Record<ThemeName, React.ReactNode> = {
  'cosmic-player': <Sparkles className="w-5 h-5" />,
  'karaoke-stage': <Mic2 className="w-5 h-5" />,
  'dashboard-home': <LayoutDashboard className="w-5 h-5" />,
  'spotify-integration': <Music className="w-5 h-5" />,
  'settings-dark': <Settings aria-hidden="true" className="w-5 h-5" />,
};

// ============================================================================
// PREVIEW COLORS
// ============================================================================

interface PreviewColorsProps {
  themeName: ThemeName;
}

const PreviewColors: React.FC<PreviewColorsProps> = ({ themeName }) => {
  const theme = themes[themeName];
  const { colors } = theme;
  
  return (
    <div className="flex gap-1 mt-2">
      <div
        className="w-4 h-4 rounded-full border border-white/20"
        style={{ backgroundColor: colors.bgPrimary }}
        title="Background"
      />
      <div
        className="w-4 h-4 rounded-full border border-white/20"
        style={{ backgroundColor: colors.accentPrimary }}
        title="Accent"
      />
      <div
        className="w-4 h-4 rounded-full border border-white/20"
        style={{ backgroundColor: colors.brandPrimary }}
        title="Brand"
      />
      <div
        className="w-4 h-4 rounded-full border border-white/20"
        style={{ backgroundColor: colors.success }}
        title="Success"
      />
    </div>
  );
};

// ============================================================================
// THEME CARD
// ============================================================================

const ThemeCard: React.FC<ThemeCardProps> = ({
  themeName,
  isSelected,
  onSelect,
  showDescription = true,
  showPreview = true,
  layout = 'grid',
}) => {
  const theme = themes[themeName];
  const { colors } = theme;
  
  if (layout === 'list') {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200',
          'border-2',
          isSelected
            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
            : 'border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
        )}
        style={{
          boxShadow: isSelected ? `0 0 20px ${colors.accentPrimary}30` : undefined,
        }}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-lg',
            isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
          )}
          style={{
            backgroundColor: isSelected ? `${colors.accentPrimary}20` : colors.bgTertiary,
          }}
        >
          {themeIcons[themeName]}
        </div>
        
        {/* Content */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-semibold',
              isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
            )}>
              {theme.displayName}
            </span>
            {isSelected && (
              <Check aria-hidden="true" className="w-4 h-4 text-[var(--accent-primary)]" />
            )}
          </div>
          {showDescription && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5 line-clamp-1">
              {theme.description}
            </p>
          )}
        </div>
        
        {/* Preview */}
        {showPreview && <PreviewColors themeName={themeName} />}
      </button>
    );
  }
  
  // Grid layout
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center p-4 rounded-xl transition-all duration-200',
        'border-2 min-h-[140px]',
        isSelected
          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
          : 'border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
      )}
      style={{
        boxShadow: isSelected ? `0 0 20px ${colors.accentPrimary}30` : undefined,
      }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-full"
            style={{ backgroundColor: colors.accentPrimary }}
          >
            <Check aria-hidden="true" className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-xl mb-3',
          isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
        )}
        style={{
          backgroundColor: isSelected ? `${colors.accentPrimary}20` : colors.bgTertiary,
        }}
      >
        {themeIcons[themeName]}
      </div>
      
      {/* Name */}
      <span className={cn(
        'font-semibold text-center',
        isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
      )}>
        {theme.displayName}
      </span>
      
      {/* Description */}
      {showDescription && (
        <p className="text-xs text-[var(--text-muted)] text-center mt-1 line-clamp-2">
          {theme.description}
        </p>
      )}
      
      {/* Preview */}
      {showPreview && <PreviewColors themeName={themeName} />}
    </button>
  );
};

// ============================================================================
// THEME SELECTOR
// ============================================================================

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className,
  layout = 'grid',
  showDescription = true,
  showPreview = true,
}) => {
  const { themeName, setThemeName } = useTheme();
  
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-[var(--accent-primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Selecionar Tema
        </h3>
      </div>
      
      {/* Theme Grid/List */}
      <div
        className={cn(
          layout === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'
            : 'flex flex-col gap-3'
        )}
      >
        {themeList.map((theme) => (
          <ThemeCard
            key={theme.name}
            themeName={theme.name}
            isSelected={themeName === theme.name}
            onSelect={() => setThemeName(theme.name)}
            showDescription={showDescription}
            showPreview={showPreview}
            layout={layout}
          />
        ))}
      </div>
      
      {/* Current theme info */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)]">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{
              backgroundColor: themes[themeName].colors.accentPrimary + '20',
            }}
          >
            {themeIcons[themeName]}
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Tema atual</p>
            <p className="font-semibold text-[var(--text-primary)]">
              {themes[themeName].displayName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPACT THEME SELECTOR
// ============================================================================

export const ThemeSelectorCompact: React.FC<{ className?: string }> = ({ className }) => {
  const { themeName, setThemeName } = useTheme();
  
  return (
    <div className={cn('flex gap-2', className)}>
      {themeList.map((theme) => {
        const isSelected = themeName === theme.name;
        return (
          <button
            key={theme.name}
            type="button"
            onClick={() => setThemeName(theme.name)}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
              'border-2',
              isSelected
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/20'
                : 'border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
            )}
            title={theme.displayName}
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: theme.colors.accentPrimary }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
