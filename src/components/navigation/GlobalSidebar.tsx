/**
 * GlobalSidebar Component
 * 
 * Sidebar de navegação global com integração completa do Design System.
 * Inclui navegação principal, seções da documentação e estados interativos.
 * 
 * @component
 * @version 1.0.0
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Music,
  Mic2,
  Library,
  Settings,
  BookOpen,
  Code,
  Database,
  Shield,
  Activity,
  TestTube,
  Download,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  color?: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

// ============================================================================
// Navigation Data
// ============================================================================

const navigationSections: NavSection[] = [
  {
    id: 'main',
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/dashboard',
      },
      {
        id: 'player',
        label: 'Player',
        icon: Music,
        path: '/player',
      },
      {
        id: 'karaoke',
        label: 'Karaoke',
        icon: Mic2,
        path: '/karaoke',
        badge: 'Beta',
      },
      {
        id: 'library',
        label: 'Biblioteca',
        icon: Library,
        path: '/library',
      },
    ],
  },
  {
    id: 'documentation',
    title: 'Documentação',
    items: [
      {
        id: 'installation',
        label: 'Instalação',
        icon: Download,
        path: '/docs/installation',
        color: 'text-accent-greenNeon',
      },
      {
        id: 'configuration',
        label: 'Configuração',
        icon: Settings,
        path: '/settings',
        color: 'text-accent-cyan',
      },
      {
        id: 'tutorials',
        label: 'Tutoriais',
        icon: BookOpen,
        path: '/docs/tutorials',
        color: 'text-accent-magenta',
      },
      {
        id: 'development',
        label: 'Desenvolvimento',
        icon: Code,
        path: '/docs/development',
        color: 'text-accent-yellowGold',
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Avançado',
    items: [
      {
        id: 'api',
        label: 'API',
        icon: Database,
        path: '/docs/api',
        color: 'text-accent-purple',
      },
      {
        id: 'security',
        label: 'Segurança',
        icon: Shield,
        path: '/docs/security',
        color: 'text-accent-orange',
      },
      {
        id: 'monitoring',
        label: 'Monitoramento',
        icon: Activity,
        path: '/docs/monitoring',
        color: 'text-accent-greenLime',
      },
      {
        id: 'testing',
        label: 'Testes',
        icon: TestTube,
        path: '/docs/testing',
        color: 'text-accent-blueElectric',
      },
    ],
  },
];

// ============================================================================
// Component Props
// ============================================================================

interface GlobalSidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function GlobalSidebar({
  className,
  defaultCollapsed = false,
  onCollapsedChange,
}: GlobalSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? '80px' : '280px',
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        'relative flex flex-col h-screen bg-bg-secondary border-r border-white/5',
        'shadow-2xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 border border-accent-cyan/20">
                <Music className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wider">
                  <span className="text-accent-yellowGold">TSI</span>
                  <span className="text-gray-400">JUKEBOX</span>
                </span>
                <span className="text-xs text-gray-500">v4.2.1</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleToggleCollapse}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg',
            'bg-bg-tertiary hover:bg-accent-cyan/10',
            'border border-white/5 hover:border-accent-cyan/30',
            'text-gray-400 hover:text-accent-cyan',
            'transition-all duration-200',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {navigationSections.map((section) => (
          <div key={section.id} className="mb-6">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {section.title}
                </motion.h3>
              )}
            </AnimatePresence>

            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = isActiveRoute(item.path);
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={cn(
                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'transition-all duration-200',
                        'hover:bg-bg-tertiary',
                        isActive && [
                          'bg-bg-tertiary',
                          'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                          'before:w-1 before:h-8 before:bg-accent-cyan before:rounded-r-full',
                          'before:shadow-[0_0_12px_rgba(0,212,255,0.5)]',
                        ],
                        collapsed && 'justify-center'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                          isActive
                            ? item.color || 'text-accent-cyan'
                            : 'text-gray-400 group-hover:text-gray-200',
                          isActive && 'drop-shadow-[0_0_8px_currentColor]'
                        )}
                      />

                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between flex-1 min-w-0"
                          >
                            <span
                              className={cn(
                                'text-sm font-medium truncate transition-colors duration-200',
                                isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                              )}
                            >
                              {item.label}
                            </span>

                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-bg-tertiary border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-2">
        <Link
          to="/profile"
          className={cn(
            'group flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'transition-all duration-200',
            'hover:bg-bg-tertiary',
            collapsed && 'justify-center'
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 border border-accent-cyan/20">
            <User className="w-4 h-4 text-accent-cyan" />
          </div>

          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between flex-1 min-w-0"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">Usuário</span>
                  <span className="text-xs text-gray-500 truncate">user@tsijukebox.com</span>
                </div>

                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="mt-2 px-3 py-2 text-center"
            >
              <p className="text-xs text-gray-600">
                Desenvolvido por{' '}
                <span className="text-accent-cyan font-semibold">B0.y_Z4kr14</span>
              </p>
              <p className="text-xs text-gray-700">TSI Telecom</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

export default GlobalSidebar;
