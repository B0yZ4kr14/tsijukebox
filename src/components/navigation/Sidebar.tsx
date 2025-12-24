/**
 * TSiJUKEBOX Sidebar Component
 * 
 * Sidebar responsiva com suporte aos 5 temas oficiais.
 * Baseada no design de referência "Settings Dark".
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { TSiLogoSidebar } from '@/components/ui/TSiLogo';
import { 
  Home, 
  Music, 
  ListMusic, 
  Search, 
  Settings, 
  Mic2, 
  Radio, 
  Heart, 
  Clock, 
  Users,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Monitor,
  Wifi,
  Cloud,
  Shield,
  Info,
  Accessibility,
  type LucideIcon
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  isActive?: boolean;
}

interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  variant?: 'default' | 'settings';
}

// ============================================================================
// NAVEGAÇÃO PADRÃO
// ============================================================================

const defaultNavSections: NavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'library', label: 'Library', icon: Music },
      { id: 'playlists', label: 'Playlists', icon: ListMusic },
      { id: 'search', label: 'Search', icon: Search },
    ],
  },
  {
    id: 'features',
    title: 'Features',
    items: [
      { id: 'karaoke', label: 'Karaoke', icon: Mic2 },
      { id: 'radio', label: 'Radio', icon: Radio },
      { id: 'jam', label: 'JAM Sessions', icon: Users },
    ],
  },
  {
    id: 'library',
    title: 'Your Library',
    items: [
      { id: 'favorites', label: 'Favorites', icon: Heart },
      { id: 'recent', label: 'Recently Played', icon: Clock },
    ],
  },
];

const settingsNavSections: NavSection[] = [
  {
    id: 'settings',
    items: [
      { id: 'general', label: 'General', icon: Settings },
      { id: 'audio', label: 'Audio', icon: Volume2 },
      { id: 'display', label: 'Display', icon: Monitor },
      { id: 'network', label: 'Network', icon: Wifi },
      { id: 'cloud-backup', label: 'Cloud Backup', icon: Cloud },
      { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'about', label: 'About', icon: Info },
    ],
  },
];

// ============================================================================
// NAV ITEM COMPONENT
// ============================================================================

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({
  item,
  isActive,
  collapsed,
  onClick,
}) => {
  const Icon = item.icon;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'text-left group relative',
        isActive
          ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[var(--accent-primary)]"
          style={{
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
      )}
      
      {/* Icon */}
      <Icon
        className={cn(
          'w-5 h-5 flex-shrink-0 transition-colors',
          isActive && 'text-[var(--accent-primary)]'
        )}
      />
      
      {/* Label */}
      {!collapsed && (
        <span className="flex-1 truncate font-medium text-sm">
          {item.label}
        </span>
      )}
      
      {/* Badge */}
      {!collapsed && item.badge && (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--accent-primary)] text-white">
          {item.badge}
        </span>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </button>
  );
};

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  activeItem = 'home',
  onItemClick,
  variant = 'default',
}) => {
  const { currentTheme } = useTheme();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;
  
  const navSections = variant === 'settings' ? settingsNavSections : defaultNavSections;
  
  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };
  
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[240px]',
        className
      )}
    >
      {/* Header with Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-[var(--border-primary)]',
        collapsed && 'justify-center px-2'
      )}>
        <TSiLogoSidebar collapsed={collapsed} />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section, sectionIndex) => (
          <div key={section.id} className={cn(sectionIndex > 0 && 'mt-6')}>
            {/* Section Title */}
            {section.title && !collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {section.title}
              </h3>
            )}
            
            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  isActive={activeItem === item.id}
                  collapsed={collapsed}
                  onClick={() => handleItemClick(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border-primary)]">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-tertiary)] transition-colors'
          )}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

// ============================================================================
// MOBILE SIDEBAR
// ============================================================================

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  variant?: 'default' | 'settings';
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  activeItem = 'home',
  onItemClick,
  variant = 'default',
}) => {
  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          variant={variant}
          className="h-full shadow-xl"
        />
      </div>
    </>
  );
};

export default Sidebar;
