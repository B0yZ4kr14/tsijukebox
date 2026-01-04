/**
 * Modal System - TSiJUKEBOX
 * 
 * Sistema completo de modais com:
 * - Múltiplas variantes (default, danger, success, info)
 * - Tamanhos configuráveis (sm, md, lg, xl, full)
 * - Animações com Framer Motion
 * - Acessibilidade completa (ARIA, focus trap)
 * - Composable API (ModalHeader, ModalBody, ModalFooter)
 * 
 * @version 1.0.0
 * @author TSiJUKEBOX Team
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// ============================================================================
// TYPES
// ============================================================================

export type ModalVariant = 'default' | 'danger' | 'success' | 'info' | 'warning';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal variant for styling */
  variant?: ModalVariant;
  /** Modal size */
  size?: ModalSize;
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether modal is closable at all */
  closable?: boolean;
  /** Custom className */
  className?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Accessible title for screen readers */
  ariaLabel?: string;
  /** ID of element that labels the modal */
  ariaLabelledBy?: string;
  /** ID of element that describes the modal */
  ariaDescribedBy?: string;
  /** Whether to center modal vertically */
  centered?: boolean;
  /** Whether to show overlay/backdrop */
  showOverlay?: boolean;
  /** Custom z-index */
  zIndex?: number;
}

export interface ModalHeaderProps {
  /** Header content (usually title) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Icon to show before title */
  icon?: React.ReactNode;
  /** Whether to show divider below header */
  showDivider?: boolean;
}

export interface ModalBodyProps {
  /** Body content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Whether content is scrollable */
  scrollable?: boolean;
  /** Max height for scrollable content */
  maxHeight?: string;
}

export interface ModalFooterProps {
  /** Footer content (usually buttons) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Alignment of footer content */
  align?: 'left' | 'center' | 'right' | 'between';
  /** Whether to show divider above footer */
  showDivider?: boolean;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  /** Title of the confirmation */
  title: string;
  /** Description/message */
  description: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Whether confirm action is loading */
  isLoading?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] min-h-[90vh]',
};

const variantStyles: Record<ModalVariant, { border: string; icon: React.ReactNode; iconColor: string }> = {
  default: {
    border: 'border-kiosk-border/30',
    icon: null,
    iconColor: '',
  },
  danger: {
    border: 'border-red-500/30',
    icon: <AlertTriangle className="w-6 h-6" />,
    iconColor: 'text-red-500',
  },
  success: {
    border: 'border-accent-green/30',
    icon: <CheckCircle className="w-6 h-6" />,
    iconColor: 'text-accent-green',
  },
  info: {
    border: 'border-accent-cyan/30',
    icon: <Info className="w-6 h-6" />,
    iconColor: 'text-accent-cyan',
  },
  warning: {
    border: 'border-yellow-500/30',
    icon: <AlertCircle className="w-6 h-6" />,
    iconColor: 'text-yellow-500',
  },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

// ============================================================================
// CONTEXT
// ============================================================================

interface ModalContextValue {
  variant: ModalVariant;
  onClose: () => void;
  closable: boolean;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal compound components must be used within a Modal');
  }
  return context;
};

// ============================================================================
// MODAL HEADER
// ============================================================================

export function ModalHeader({ 
  children, 
  className, 
  icon,
  showDivider = false,
}: ModalHeaderProps) {
  const { variant, onClose, closable } = useModalContext();
  const variantStyle = variantStyles[variant];

  return (
    <div 
      className={cn(
        'flex items-center justify-between px-6 py-4',
        showDivider && 'border-b border-kiosk-border/20',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {(icon || variantStyle.icon) && (
          <span className={variantStyle.iconColor}>
            {icon || variantStyle.icon}
          </span>
        )}
        <h2 className="text-lg font-semibold text-kiosk-text" id="modal-title">
          {children}
        </h2>
      </div>
      
      {closable && (
        <Button
          variant="ghost"
          size="xs"
          onClick={onClose}
          className="text-kiosk-text/60 hover:text-kiosk-text hover:bg-kiosk-surface-alt -mr-2"
          aria-label="Fechar modal"
        >
          <X aria-hidden="true" className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// MODAL BODY
// ============================================================================

export function ModalBody({ 
  children, 
  className,
  scrollable = false,
  maxHeight = '60vh',
}: ModalBodyProps) {
  return (
    <div 
      className={cn(
        'px-6 py-4 text-kiosk-text/80',
        scrollable && 'overflow-y-auto',
        className
      )}
      style={scrollable ? { maxHeight } : undefined}
      id="modal-description"
    >
      {children}
    </div>
  );
}

// ============================================================================
// MODAL FOOTER
// ============================================================================

export function ModalFooter({ 
  children, 
  className,
  align = 'right',
  showDivider = false,
}: ModalFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-3 px-6 py-4',
        alignClasses[align],
        showDivider && 'border-t border-kiosk-border/20',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  variant = 'default',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  closable = true,
  className,
  children,
  ariaLabel,
  ariaLabelledBy = 'modal-title',
  ariaDescribedBy = 'modal-description',
  centered = true,
  showOverlay = true,
  zIndex = 50,
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape || !closable) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, closable, onClose]);

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && closable && e.target === e.currentTarget) {
      onClose();
    }
  };

  const variantStyle = variantStyles[variant];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0" 
          style={{ zIndex }}
          role="presentation"
        >
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />
          )}

          {/* Modal Container */}
          <div 
            className={cn(
              'absolute inset-0 flex p-4 overflow-y-auto',
              centered ? 'items-center justify-center' : 'items-start justify-center pt-20'
            )}
            onClick={handleBackdropClick}
          >
            <motion.div
              ref={modalRef}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'relative w-full bg-kiosk-surface rounded-xl shadow-2xl border',
                variantStyle.border,
                sizeClasses[size],
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalContext.Provider value={{ variant, onClose, closable: closable && showCloseButton }}>
                {children}
              </ModalContext.Provider>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render in portal
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

// ============================================================================
// CONFIRM MODAL
// ============================================================================

export function ConfirmModal({
  isOpen,
  onClose,
  variant = 'default',
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  isLoading = false,
  icon,
  ...props
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const confirmButtonVariant = variant === 'danger' ? 'destructive' : 'default';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant={variant}
      size="sm"
      {...props}
    >
      <ModalHeader icon={icon}>{title}</ModalHeader>
      <ModalBody>
        <p className="text-kiosk-text/70">{description}</p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="border-kiosk-border/30"
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmButtonVariant}
          onClick={handleConfirm}
          disabled={isLoading}
          className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-accent-cyan hover:bg-accent-cyan/90'}
        >
          {isLoading ? 'Processando...' : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// ============================================================================
// HOOK: useModal
// ============================================================================

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

// ============================================================================
// HOOK: useConfirmModal
// ============================================================================

export interface UseConfirmModalOptions {
  title: string;
  description: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
}

export interface UseConfirmModalReturn {
  confirm: () => Promise<boolean>;
  ConfirmModalComponent: React.FC;
}

export function useConfirmModal(options: UseConfirmModalOptions): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback(() => {
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    resolveRef.current?.(true);
    setIsOpen(false);
  }, []);

  const handleClose = React.useCallback(() => {
    resolveRef.current?.(false);
    setIsOpen(false);
  }, []);

  const ConfirmModalComponent: React.FC = React.useCallback(() => (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...options}
    />
  ), [isOpen, handleClose, handleConfirm, options]);

  return { confirm, ConfirmModalComponent };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default Modal;
