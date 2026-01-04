// Error Components Templates - 3 arquivos

export function generateErrorsComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/errors/ErrorBoundary.tsx':
      return `import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && this.props.resetKeys !== prevProps.resetKeys) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => window.location.reload();
  handleGoHome = () => window.location.href = '/';

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try refreshing the page.
              </p>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="text-left p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-destructive">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
`;

    case 'src/components/errors/SuspenseBoundary.tsx':
      return `import { ReactNode, Suspense } from 'react';
import { Loader2, Music } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  variant?: 'default' | 'minimal' | 'music' | 'inline';
  message?: string;
}

function DefaultLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  );
}

function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function MusicLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
      <div className="relative">
        <Music className="h-16 w-16 text-primary animate-pulse" />
        <div className="absolute -inset-4 border-4 border-primary/20 rounded-full animate-ping" />
      </div>
      <p className="text-muted-foreground">{message || 'Loading...'}</p>
    </div>
  );
}

function InlineLoader() {
  return <Loader2 className="h-4 w-4 animate-spin inline" />;
}

export function SuspenseBoundary({
  children,
  fallback,
  errorFallback,
  variant = 'default',
  message,
}: SuspenseBoundaryProps) {
  const getLoader = () => {
    if (fallback) return fallback;
    switch (variant) {
      case 'minimal': return <MinimalLoader />;
      case 'music': return <MusicLoader message={message} />;
      case 'inline': return <InlineLoader />;
      default: return <DefaultLoader message={message} />;
    }
  };

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={getLoader()}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export function PageBoundary({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary variant="music" message="Loading page...">
      {children}
    </SuspenseBoundary>
  );
}

export function ComponentBoundary({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary variant="default">
      {children}
    </SuspenseBoundary>
  );
}
`;

    case 'src/components/errors/index.ts':
      return `export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { SuspenseBoundary, PageBoundary, ComponentBoundary } from './SuspenseBoundary';
`;

    default:
      return null;
  }
}
