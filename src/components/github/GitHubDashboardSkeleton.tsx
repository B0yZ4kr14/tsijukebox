import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const shimmer = {
  hidden: { opacity: 0.3 },
  visible: { 
    opacity: 1,
    transition: { 
      repeat: Infinity, 
      repeatType: 'reverse' as const,
      duration: 1.2 
    }
  }
};

export function GitHubDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={shimmer}
            className="relative overflow-hidden"
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={shimmer}
            transition={{ delay: i * 0.1 }}
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Commits Table Skeleton */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={shimmer}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-[200px]" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border border-border/50 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Releases & Branches Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate="visible"
            variants={shimmer}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function GitHubErrorState({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <svg 
          className="w-10 h-10 text-destructive" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Erro ao carregar dados
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Tentar novamente
      </button>
    </motion.div>
  );
}

export function GitHubEmptyState({ 
  title = 'Nenhum dado disponível',
  description = 'Os dados do repositório ainda não foram carregados.'
}: { 
  title?: string;
  description?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4" aria-hidden="true">
        <svg 
          className="w-8 h-8 text-muted-foreground" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
    </motion.div>
  );
}
