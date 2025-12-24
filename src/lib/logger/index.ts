/**
 * TSiJUKEBOX Logger Service
 * 
 * Sistema de logging estruturado para substituir console.log em produção.
 * Mantém compatibilidade com desenvolvimento enquanto oferece logging
 * estruturado para produção.
 * 
 * @version 1.0.0
 * @author TSiJUKEBOX Team
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    duration?: number;
  };
}

export interface LoggerConfig {
  /** Nível mínimo de log a ser registrado */
  minLevel: LogLevel;
  /** Habilitar logs no console (desenvolvimento) */
  enableConsole: boolean;
  /** Habilitar envio para serviço externo (produção) */
  enableRemote: boolean;
  /** URL do serviço de logging remoto */
  remoteUrl?: string;
  /** Incluir stack trace em erros */
  includeStackTrace: boolean;
  /** Prefixo para identificar a aplicação */
  appPrefix: string;
  /** Máximo de logs em buffer antes de enviar */
  bufferSize: number;
  /** Intervalo de flush do buffer (ms) */
  flushInterval: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#6b7280', // gray
  info: '#00d4ff',  // cyan (Design System)
  warn: '#f59e0b',  // yellow/gold (Design System)
  error: '#ef4444', // red
  fatal: '#dc2626', // dark red
};

const LOG_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  fatal: '💀',
};

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
  enableConsole: import.meta.env.DEV,
  enableRemote: import.meta.env.PROD,
  remoteUrl: import.meta.env.VITE_LOG_ENDPOINT,
  includeStackTrace: import.meta.env.DEV,
  appPrefix: 'TSiJUKEBOX',
  bufferSize: 50,
  flushInterval: 5000,
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.startFlushTimer();
    }

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC METHODS
  // --------------------------------------------------------------------------

  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug(message: string, data?: Record<string, unknown>, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Log informativo - operações normais
   */
  info(message: string, data?: Record<string, unknown>, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Log de aviso - situações inesperadas mas não críticas
   */
  warn(message: string, data?: Record<string, unknown>, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Log de erro - falhas que precisam de atenção
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    const errorData = this.formatError(error);
    this.log('error', message, errorData ? { error: errorData } : undefined, context);
  }

  /**
   * Log fatal - erros críticos que impedem funcionamento
   */
  fatal(message: string, error?: Error | unknown, context?: string): void {
    const errorData = this.formatError(error);
    this.log('fatal', message, errorData ? { error: errorData } : undefined, context);
  }

  /**
   * Log de performance - mede duração de operações
   */
  performance(action: string, startTime: number, context?: string): void {
    const duration = performance.now() - startTime;
    this.log('info', `Performance: ${action}`, { 
      duration: Math.round(duration * 100) / 100,
      unit: 'ms'
    }, context);
  }

  /**
   * Cria um logger com contexto fixo
   */
  withContext(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * Cria um logger para um componente específico
   */
  forComponent(componentName: string): ContextLogger {
    return this.withContext(`Component:${componentName}`);
  }

  /**
   * Cria um logger para um hook específico
   */
  forHook(hookName: string): ContextLogger {
    return this.withContext(`Hook:${hookName}`);
  }

  /**
   * Cria um logger para uma API específica
   */
  forAPI(apiName: string): ContextLogger {
    return this.withContext(`API:${apiName}`);
  }

  /**
   * Força o envio dos logs em buffer
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    if (this.config.enableRemote && this.config.remoteUrl) {
      try {
        await fetch(this.config.remoteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: logsToSend }),
          keepalive: true,
        });
      } catch (err) {
        // Fallback: log to console if remote fails
        if (this.config.enableConsole) {
          console.error('[Logger] Failed to send logs to remote:', err);
        }
      }
    }
  }

  /**
   * Atualiza configuração do logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.startFlushTimer();
    } else {
      this.stopFlushTimer();
    }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  private log(
    level: LogLevel, 
    message: string, 
    data?: Record<string, unknown>,
    context?: string
  ): void {
    // Check minimum level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      metadata: {
        sessionId: this.sessionId,
      },
    };

    // Console output (development)
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Buffer for remote (production)
    if (this.config.enableRemote) {
      this.buffer.push(entry);
      
      if (this.buffer.length >= this.config.bufferSize) {
        this.flush();
      }
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, context, data, timestamp } = entry;
    const color = LOG_COLORS[level];
    const icon = LOG_ICONS[level];
    const prefix = `[${this.config.appPrefix}]`;
    const contextStr = context ? `[${context}]` : '';
    const timeStr = new Date(timestamp).toLocaleTimeString();

    const style = `color: ${color}; font-weight: bold;`;
    const resetStyle = 'color: inherit; font-weight: normal;';

    // Format message
    const formattedMessage = `%c${icon} ${prefix}${contextStr}%c ${message} %c(${timeStr})`;

    if (data && Object.keys(data).length > 0) {
      console.groupCollapsed(formattedMessage, style, resetStyle, 'color: #6b7280; font-size: 0.85em;');
      console.log('Data:', data);
      if (data.error) {
        console.log('Error Details:', data.error);
      }
      console.groupEnd();
    } else {
      console.log(formattedMessage, style, resetStyle, 'color: #6b7280; font-size: 0.85em;');
    }
  }

  private formatError(error: Error | unknown): LogEntry['error'] | undefined {
    if (!error) return undefined;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.config.includeStackTrace ? error.stack : undefined,
      };
    }

    if (typeof error === 'string') {
      return {
        name: 'Error',
        message: error,
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private startFlushTimer(): void {
    this.stopFlushTimer();
    this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// ============================================================================
// CONTEXT LOGGER CLASS
// ============================================================================

class ContextLogger {
  constructor(
    private logger: Logger,
    private context: string
  ) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.logger.debug(message, data, this.context);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.logger.info(message, data, this.context);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.logger.warn(message, data, this.context);
  }

  error(message: string, error?: Error | unknown): void {
    this.logger.error(message, error, this.context);
  }

  fatal(message: string, error?: Error | unknown): void {
    this.logger.fatal(message, error, this.context);
  }

  performance(action: string, startTime: number): void {
    this.logger.performance(action, startTime, this.context);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const logger = new Logger();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export { Logger, ContextLogger };

// Named exports for direct use
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const fatal = logger.fatal.bind(logger);

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * Hook para usar o logger em componentes React
 * 
 * @example
 * const log = useLogger('MyComponent');
 * log.info('Component mounted');
 * log.error('Failed to load data', error);
 */
export function useLogger(componentName: string): ContextLogger {
  return logger.forComponent(componentName);
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Funções de migração para facilitar a transição de console.log
 * 
 * @deprecated Use logger.debug/info/warn/error diretamente
 */
export const migrationHelpers = {
  /** Substitui console.log */
  log: (message: string, ...args: unknown[]) => {
    logger.debug(message, args.length > 0 ? { args } : undefined);
  },
  
  /** Substitui console.warn */
  warn: (message: string, ...args: unknown[]) => {
    logger.warn(message, args.length > 0 ? { args } : undefined);
  },
  
  /** Substitui console.error */
  error: (message: string, ...args: unknown[]) => {
    const error = args.find(arg => arg instanceof Error);
    logger.error(message, error, undefined);
  },
};

export default logger;
