import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface TestWrapperProps {
  children: React.ReactNode;
}

export function createTestWrapper() {
  const queryClient = createTestQueryClient();
  
  return function TestWrapper({ children }: TestWrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}
