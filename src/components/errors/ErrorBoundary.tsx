import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button, Card } from "@/components/ui/themed"
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const keysChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (keysChanged) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const showDetails = this.props.showDetails ?? import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Ops! Algo deu errado</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
              </p>
            
            
            <div className="mt-4">
              {showDetails && error && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <Bug className="w-4 h-4" />
                    {error.name}: {error.message}
                  </div>
                  {errorInfo?.componentStack && (
                    <pre className="text-xs text-muted-foreground overflow-x-auto max-h-32 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={this.resetError}>
                <RefreshCw aria-hidden="true" className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home aria-hidden="true" className="w-4 h-4 mr-2" />
                Ir ao início
              </Button>
              <Button variant="danger" onClick={this.handleReload}>
                Recarregar página
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: unknown[];
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryWrapperProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
