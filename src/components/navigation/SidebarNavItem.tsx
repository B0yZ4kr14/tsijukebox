/**
 * SidebarNavItem Component
 * 
 * Item de navegação individual do sidebar com animações e estados interativos.
 * Suporta ícones customizados, badges e tooltips.
 * 
 * @component
 * @version 1.0.0
 */

import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SidebarNavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isActive?: boolean;
  collapsed?: boolean;
  badge?: string;
  color?: string;
  onClick?: () => void;
}

// ============================================================================
// Animation Variants
// ============================================================================

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.15,
    },
  },
};

const glowVariants = {
  inactive: {
    boxShadow: '0 0 0px rgba(0, 212, 255, 0)',
  },
  active: {
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  hover: {
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)',
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export function SidebarNavItem({
  id,
  label,
  icon: Icon,
  path,
  isActive = false,
  collapsed = false,
  badge,
  color,
  onClick,
}: SidebarNavItemProps) {
  return (
    <motion.li
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      variants={itemVariants}
    >
      <Link
        to={path}
        onClick={onClick}
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
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
      >
        {/* Icon with glow effect */}
        <motion.div
          variants={glowVariants}
          initial="inactive"
          animate={isActive ? 'active' : 'inactive'}
          whileHover={!isActive ? 'hover' : undefined}
          className="relative"
        >
          <Icon
            className={cn(
              'w-5 h-5 flex-shrink-0 transition-colors duration-200',
              isActive
                ? color || 'text-accent-cyan'
                : 'text-gray-400 group-hover:text-gray-200',
              isActive && 'drop-shadow-[0_0_8px_currentColor]'
            )}
          />
        </motion.div>

        {/* Label and Badge */}
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
                {label}
              </span>

              {badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 500, 
                    damping: 30 
                  }}
                  className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                >
                  {badge}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-2 px-3 py-2 bg-bg-tertiary border border-white/10 rounded-lg shadow-xl opacity-0 pointer-events-none whitespace-nowrap z-50"
          >
            <span className="text-sm font-medium text-white">{label}</span>
            {badge && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                {badge}
              </span>
            )}
          </motion.div>
        )}

        {/* Active indicator pulse */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-accent-cyan/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </Link>
    </motion.li>
  );
}

export default SidebarNavItem;
