/**
 * TSiJUKEBOX Header Component V2
 * 
 * Header responsivo com suporte aos 5 temas oficiais.
 * Mantém compatibilidade com Header original e adiciona novos recursos.
 * Baseado no design de referência "Dashboard Home".
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { TSiLogoHeader } from '@/components/ui/TSiLogo';
import { ThemeSelectorCompact } from '@/components/settings/ThemeSelector';
import {
  Home,
  Music,
  ListMusic,
  Search,
  Bell,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

interface Breadcrumb {
  label: string;
  path: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NavLink {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  isActive?: boolean;
}

interface HeaderV2Props {
  className?: string;
  activeLink?: string;
  onLinkClick?: (linkId: string) => void;
  onMenuClick?: () => void;
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showThemeSelector?: boolean;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
}

// ============================================================================
// NAVEGAÇÃO PADRÃO
// ============================================================================

const defaultNavLinks: NavLink[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'library', label: 'Library', icon: Music },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'search', label: 'Search', icon: Search },
];

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova música adicionada',
    message: 'Wonderwall - Oasis foi adicionada à biblioteca',
    time: '5 min atrás',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Backup concluído',
    message: 'Backup automático da biblioteca concluído com sucesso',
    time: '1 hora atrás',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Atualização disponível',
    message: 'TSiJUKEBOX v4.2.2 está disponível',
    time: '2 horas atrás',
    read: true,
    type: 'info',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [{ label: 'Home', path: '/' }];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  });

  return breadcrumbs;
}

// ============================================================================
// SEARCH BAR
// ============================================================================

interface SearchBarProps {
  isOpen: boolean;
  onToggle: () => void;
  query: string;
  onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onToggle,
  query,
  onQueryChange,
}) => {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar músicas, playlists..."
              className={cn(
                'w-full h-10 px-4 rounded-lg text-sm',
                'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
                'text-[var(--text-primary)] placeholder-[var(--text-muted)]',
                'focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20',
                'transition-all'
              )}
              autoFocus
            />
            <button
              onClick={() => {
                onToggle();
                onQueryChange('');
              }}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg',
                'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
                'text-[var(--text-muted)] hover:text-[var(--error)] hover:border-[var(--error)]/30',
                'transition-all duration-200'
              )}
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
              'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30',
              'transition-all duration-200'
            )}
            aria-label="Abrir busca"
          >
            <Search aria-hidden="true" className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// NOTIFICATIONS DROPDOWN
// ============================================================================

interface NotificationsDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  notifications: Notification[];
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onToggle,
  notifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-[var(--success)]';
      case 'warning': return 'bg-[var(--warning)]';
      case 'error': return 'bg-[var(--error)]';
      default: return 'bg-[var(--accent-primary)]';
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-lg',
          'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
          'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30',
          'transition-all duration-200'
        )}
        aria-label="Notificações"
      >
        <Bell aria-hidden="true" className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-[var(--accent-primary)] text-white rounded-full border-2 border-[var(--bg-secondary)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[var(--border-primary)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notificações</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border-b border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer',
                    !notification.read && 'bg-[var(--accent-primary)]/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', getTypeColor(notification.type))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]/60 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border-primary)] text-center">
              <Link
                to="/notifications"
                className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 transition-colors"
                onClick={onToggle}
              >
                Ver todas as notificações
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// USER MENU DROPDOWN
// ============================================================================

interface UserMenuDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  isOpen,
  onToggle,
  userName = 'Usuário',
  userEmail = 'user@tsijukebox.com',
  userAvatar,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg',
          'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
          'hover:border-[var(--accent-primary)]/30',
          'transition-all duration-200'
        )}
        aria-label="Perfil"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)]/30 to-[var(--brand-primary)]/30 border border-[var(--accent-primary)]/20 flex items-center justify-center">
            <User aria-hidden="true" className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-[var(--text-primary)]">
          {userName}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[var(--border-primary)]">
              <p className="text-sm font-medium text-[var(--text-primary)]">{userName}</p>
              <p className="text-xs text-[var(--text-muted)]">{userEmail}</p>
            </div>
            <div className="py-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={onToggle}
              >
                <User aria-hidden="true" className="w-4 h-4" />
                Meu Perfil
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={onToggle}
              >
                <Settings aria-hidden="true" className="w-4 h-4" />
                Configurações
              </Link>
            </div>
            <div className="p-2 border-t border-[var(--border-primary)]">
              <button aria-label="PREENCHER" type="button" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors text-left">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// HEADER V2 COMPONENT
// ============================================================================

export function HeaderV2({
  className,
  activeLink = 'home',
  onLinkClick,
  onMenuClick,
  showBreadcrumbs = true,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  showThemeSelector = true,
  userName,
  userAvatar,
  userEmail,
}: HeaderV2Props) {
  const location = useLocation();
  const { currentTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  const handleLinkClick = (linkId: string) => {
    if (onLinkClick) {
      onLinkClick(linkId);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'sticky top-0 z-40 h-16',
        'bg-[var(--bg-secondary)]/95 backdrop-blur-sm',
        'border-b border-[var(--border-primary)]',
        'flex items-center justify-between px-4 lg:px-6',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className={cn(
            'lg:hidden flex items-center justify-center w-10 h-10 rounded-lg',
            'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
            'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30',
            'transition-all duration-200'
          )}
          aria-label="Toggle menu"
        >
          <Menu aria-hidden="true" className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="hidden lg:block">
          <TSiLogoHeader />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {defaultNavLinks.map((link) => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors relative',
                  isActive
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                {link.label}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent-primary)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Breadcrumbs (Mobile) */}
        {showBreadcrumbs && (
          <nav className="hidden md:flex lg:hidden items-center gap-2 min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight aria-hidden="true" className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                )}
                <Link
                  to={crumb.path}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 truncate',
                    index === breadcrumbs.length - 1
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--accent-primary)]'
                  )}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {showSearch && (
          <SearchBar
            isOpen={searchOpen}
            onToggle={() => setSearchOpen(!searchOpen)}
            query={searchQuery}
            onQueryChange={setSearchQuery}
          />
        )}

        {/* Theme Selector */}
        {showThemeSelector && (
          <div className="hidden sm:block">
            <ThemeSelectorCompact />
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <NotificationsDropdown
            isOpen={notificationsOpen}
            onToggle={() => setNotificationsOpen(!notificationsOpen)}
            notifications={mockNotifications}
          />
        )}

        {/* Settings */}
        <Link
          to="/settings"
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg',
            'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]',
            'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30',
            'transition-all duration-200'
          )}
          aria-label="Configurações"
        >
          <Settings aria-hidden="true" className="w-5 h-5" />
        </Link>

        {/* Profile */}
        {showProfile && (
          <UserMenuDropdown
            isOpen={profileOpen}
            onToggle={() => setProfileOpen(!profileOpen)}
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
          />
        )}
      </div>
    </motion.header>
  );
}

export default HeaderV2;
