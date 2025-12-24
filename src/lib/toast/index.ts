/**
 * Toast System - TSiJUKEBOX
 * 
 * Sistema de notificações toast aprimorado baseado no Sonner.
 * Integrado com o Design System e Logger Service.
 * 
 * Features:
 * - Variantes customizadas (success, error, warning, info, loading)
 * - Ícones do Design System
 * - Suporte a ações e callbacks
 * - Integração com Logger
 * - Toasts persistentes
 * - Toasts com progresso
 * 
 * @version 1.0.0
 * @author TSiJUKEBOX Team
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'outline' | 'destructive';
}

export interface ToastOptions extends Omit<ExternalToast, 'action'> {
  /** Toast variant for styling */
  variant?: ToastVariant;
  /** Action button */
  action?: ToastAction;
  /** Secondary action button */
  secondaryAction?: ToastAction;
  /** Whether to log the toast */
  log?: boolean;
  /** Log level if logging is enabled */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Whether toast is persistent (won't auto-dismiss) */
  persistent?: boolean;
  /** Progress value (0-100) for progress toasts */
  progress?: number;
  /** Custom icon component */
  icon?: React.ReactNode;
}

export interface PromiseToastOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
  finally?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DURATION = 4000;
const PERSISTENT_DURATION = Infinity;

const variantConfig: Record<ToastVariant, { 
  className: string; 
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}> = {
  default: {
    className: 'bg-kiosk-surface border-kiosk-border/30 text-kiosk-text',
    logLevel: 'info',
  },
  success: {
    className: 'bg-kiosk-surface border-accent-green/30 text-kiosk-text [&>svg]:text-accent-green',
    logLevel: 'info',
  },
  error: {
    className: 'bg-kiosk-surface border-red-500/30 text-kiosk-text [&>svg]:text-red-500',
    logLevel: 'error',
  },
  warning: {
    className: 'bg-kiosk-surface border-yellow-500/30 text-kiosk-text [&>svg]:text-yellow-500',
    logLevel: 'warn',
  },
  info: {
    className: 'bg-kiosk-surface border-accent-cyan/30 text-kiosk-text [&>svg]:text-accent-cyan',
    logLevel: 'info',
  },
  loading: {
    className: 'bg-kiosk-surface border-kiosk-border/30 text-kiosk-text',
    logLevel: 'debug',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildToastOptions(options: ToastOptions = {}): ExternalToast {
  const { 
    variant = 'default', 
    action, 
    secondaryAction,
    log = false,
    logLevel,
    persistent = false,
    progress,
    icon,
    ...rest 
  } = options;

  const config = variantConfig[variant];

  // Build action if provided
  const actionConfig = action ? {
    label: action.label,
    onClick: action.onClick,
  } : undefined;

  return {
    ...rest,
    className: `${config.className} ${rest.className || ''}`,
    duration: persistent ? PERSISTENT_DURATION : (rest.duration || DEFAULT_DURATION),
    action: actionConfig,
    icon,
  };
}

function logToast(message: string, options: ToastOptions = {}) {
  if (options.log === false) return;
  
  const variant = options.variant || 'default';
  const level = options.logLevel || variantConfig[variant].logLevel;
  
  logger[level](`[Toast] ${message}`, { variant, ...options });
}

// ============================================================================
// TOAST FUNCTIONS
// ============================================================================

/**
 * Show a default toast notification
 */
function show(message: string, options?: ToastOptions): string | number {
  logToast(message, options);
  return sonnerToast(message, buildToastOptions(options));
}

/**
 * Show a success toast notification
 */
function success(message: string, options?: Omit<ToastOptions, 'variant'>): string | number {
  const opts = { ...options, variant: 'success' as const };
  logToast(message, opts);
  return sonnerToast.success(message, buildToastOptions(opts));
}

/**
 * Show an error toast notification
 */
function error(message: string, options?: Omit<ToastOptions, 'variant'>): string | number {
  const opts = { ...options, variant: 'error' as const };
  logToast(message, opts);
  return sonnerToast.error(message, buildToastOptions(opts));
}

/**
 * Show a warning toast notification
 */
function warning(message: string, options?: Omit<ToastOptions, 'variant'>): string | number {
  const opts = { ...options, variant: 'warning' as const };
  logToast(message, opts);
  return sonnerToast.warning(message, buildToastOptions(opts));
}

/**
 * Show an info toast notification
 */
function info(message: string, options?: Omit<ToastOptions, 'variant'>): string | number {
  const opts = { ...options, variant: 'info' as const };
  logToast(message, opts);
  return sonnerToast.info(message, buildToastOptions(opts));
}

/**
 * Show a loading toast notification
 */
function loading(message: string, options?: Omit<ToastOptions, 'variant'>): string | number {
  const opts = { ...options, variant: 'loading' as const, persistent: true };
  logToast(message, opts);
  return sonnerToast.loading(message, buildToastOptions(opts));
}

/**
 * Show a toast for a promise
 */
function promise<T>(
  promise: Promise<T>,
  messages: PromiseToastOptions<T>,
  options?: Omit<ToastOptions, 'variant'>
): Promise<T> {
  logger.debug('[Toast] Promise started', { loading: messages.loading });
  
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      const msg = typeof messages.success === 'function' 
        ? messages.success(data) 
        : messages.success;
      logger.info(`[Toast] Promise success: ${msg}`);
      return msg;
    },
    error: (err) => {
      const msg = typeof messages.error === 'function' 
        ? messages.error(err) 
        : messages.error;
      logger.error(`[Toast] Promise error: ${msg}`, err);
      return msg;
    },
    finally: messages.finally,
    ...buildToastOptions(options),
  });
}

/**
 * Dismiss a toast by ID
 */
function dismiss(toastId?: string | number): void {
  sonnerToast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
function dismissAll(): void {
  sonnerToast.dismiss();
}

/**
 * Show a custom toast with JSX content
 */
function custom(
  content: React.ReactNode,
  options?: ToastOptions
): string | number {
  logToast('[Custom Toast]', options);
  return sonnerToast.custom(() => content, buildToastOptions(options));
}

/**
 * Update an existing toast
 */
function update(
  toastId: string | number,
  message: string,
  options?: ToastOptions
): void {
  dismiss(toastId);
  show(message, { ...options, id: toastId });
}

// ============================================================================
// SPECIALIZED TOASTS
// ============================================================================

/**
 * Show a toast for copied content
 */
function copied(what: string = 'Conteúdo'): string | number {
  return success(`${what} copiado para a área de transferência!`, {
    duration: 2000,
  });
}

/**
 * Show a toast for saved content
 */
function saved(what: string = 'Alterações'): string | number {
  return success(`${what} salvas com sucesso!`);
}

/**
 * Show a toast for deleted content
 */
function deleted(what: string = 'Item'): string | number {
  return success(`${what} excluído com sucesso!`);
}

/**
 * Show a toast for network errors
 */
function networkError(action: string = 'realizar a operação'): string | number {
  return error(`Erro de conexão ao ${action}. Verifique sua internet.`, {
    action: {
      label: 'Tentar novamente',
      onClick: () => window.location.reload(),
    },
  });
}

/**
 * Show a toast for unauthorized access
 */
function unauthorized(): string | number {
  return error('Sessão expirada. Faça login novamente.', {
    action: {
      label: 'Login',
      onClick: () => window.location.href = '/auth',
    },
    persistent: true,
  });
}

/**
 * Show a toast for feature not available
 */
function featureNotAvailable(feature: string): string | number {
  return info(`${feature} estará disponível em breve!`, {
    duration: 3000,
  });
}

/**
 * Show a toast with undo action
 */
function withUndo(
  message: string,
  onUndo: () => void | Promise<void>,
  options?: Omit<ToastOptions, 'action'>
): string | number {
  return show(message, {
    ...options,
    duration: 5000,
    action: {
      label: 'Desfazer',
      onClick: onUndo,
    },
  });
}

/**
 * Show a progress toast
 */
function progress(
  message: string,
  progressValue: number,
  toastId?: string | number
): string | number {
  const id = toastId || `progress-${Date.now()}`;
  
  if (progressValue >= 100) {
    dismiss(id);
    return success(`${message} - Concluído!`);
  }

  return show(`${message} - ${Math.round(progressValue)}%`, {
    id,
    persistent: true,
    description: `Progresso: ${Math.round(progressValue)}%`,
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export const toast = {
  // Core functions
  show,
  success,
  error,
  warning,
  info,
  loading,
  promise,
  custom,
  
  // Management
  dismiss,
  dismissAll,
  update,
  
  // Specialized
  copied,
  saved,
  deleted,
  networkError,
  unauthorized,
  featureNotAvailable,
  withUndo,
  progress,
};

export default toast;
