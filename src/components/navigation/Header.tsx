/**
 * Header Component
 * 
 * Barra superior de navegação com breadcrumbs, busca, notificações e perfil.
 * Complementa o GlobalSidebar para formar a estrutura de navegação completa.
 * 
 * @component
 * @version 1.0.0
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
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

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}

// ============================================================================
// Helper Functions
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
// Component
// ============================================================================

export function Header({
  className,
  onMenuClick,
  showBreadcrumbs = true,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
}: HeaderProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'sticky top-0 z-40 h-16 bg-bg-secondary/95 backdrop-blur-sm',
        'border-b border-white/5',
        'flex items-center justify-between px-6',
        className
      )}
    >
      {/* Left Section: Menu + Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-accent-cyan/10 border border-white/5 hover:border-accent-cyan/30 text-gray-400 hover:text-accent-cyan transition-all duration-200"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <nav className="hidden md:flex items-center gap-2 min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <Link
                  to={crumb.path}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 truncate',
                    index === breadcrumbs.length - 1
                      ? 'text-white'
                      : 'text-gray-400 hover:text-accent-cyan'
                  )}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Right Section: Search + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar músicas, playlists..."
                    className="w-full h-10 px-4 bg-bg-tertiary border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan/50 focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-accent-cyan/10 border border-white/5 hover:border-accent-cyan/30 text-gray-400 hover:text-accent-cyan transition-all duration-200"
                  aria-label="Abrir busca"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-accent-cyan/10 border border-white/5 hover:border-accent-cyan/30 text-gray-400 hover:text-accent-cyan transition-all duration-200"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent-cyan text-bg-primary rounded-full border-2 border-bg-secondary">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-bg-tertiary border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-white">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-white/5 hover:bg-bg-secondary transition-colors cursor-pointer',
                          !notification.read && 'bg-accent-cyan/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                              notification.type === 'info' && 'bg-accent-cyan',
                              notification.type === 'success' && 'bg-accent-greenNeon',
                              notification.type === 'warning' && 'bg-accent-yellowGold',
                              notification.type === 'error' && 'bg-accent-orange'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/5 text-center">
                    <Link
                      to="/notifications"
                      className="text-sm font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Ver todas as notificações
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-accent-cyan/10 border border-white/5 hover:border-accent-cyan/30 text-gray-400 hover:text-accent-cyan transition-all duration-200"
          aria-label="Configurações"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* Profile */}
        {showProfile && (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg bg-bg-tertiary hover:bg-accent-cyan/10 border border-white/5 hover:border-accent-cyan/30 transition-all duration-200"
              aria-label="Perfil"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 border border-accent-cyan/20 flex items-center justify-center">
                <User className="w-4 h-4 text-accent-cyan" />
              </div>
              <span className="hidden md:block text-sm font-medium text-white">
                Usuário
              </span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-bg-tertiary border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5">
                    <p className="text-sm font-medium text-white">Usuário</p>
                    <p className="text-xs text-gray-500">user@tsijukebox.com</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-bg-secondary hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-bg-secondary hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Link>
                  </div>
                  <div className="p-2 border-t border-white/5">
                    <button className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left">
                      Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.header>
  );
}

export default Header;
