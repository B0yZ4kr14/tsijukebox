import React, { Suspense, ReactNode } from 'react';
import { Loader2, Music } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  variant?: 'default' | 'minimal' | 'music' | 'inline';
  message?: string;
}

// Loading variants
function DefaultLoader({ message }: { message?: string }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        {message && <p className="text-muted-foreground text-sm">{message}</p>}
      </div>
    </div>
  );
}

function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function MusicLoader({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse" aria-hidden="true">
          <Music className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">{message ?? 'Carregando...'}</p>
      </div>
    </div>
  );
}

function InlineLoader() {
  return <Loader2 className="w-4 h-4 animate-spin inline-block" />;
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
      case 'minimal':
        return <MinimalLoader />;
      case 'music':
        return <MusicLoader message={message} />;
      case 'inline':
        return <InlineLoader />;
      default:
        return <DefaultLoader message={message} />;
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

// Page-level wrapper with full error boundary and suspense
interface PageBoundaryProps {
  children: ReactNode;
  loadingMessage?: string;
}

export function PageBoundary({ children, loadingMessage = 'Carregando página...' }: PageBoundaryProps) {
  return (
    <SuspenseBoundary variant="music" message={loadingMessage}>
      {children}
    </SuspenseBoundary>
  );
}

// Component-level wrapper
interface ComponentBoundaryProps {
  children: ReactNode;
  loadingMessage?: string;
}

export function ComponentBoundary({ children, loadingMessage }: ComponentBoundaryProps) {
  return (
    <SuspenseBoundary variant="default" message={loadingMessage}>
      {children}
    </SuspenseBoundary>
  );
}
