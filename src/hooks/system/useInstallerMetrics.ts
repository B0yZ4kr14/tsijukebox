import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InstallerMetrics {
  totalInstalls: number;
  successRate: number;
  failureRate: number;
  avgTimeMinutes: number;
  todayInstalls: number;
  weeklyGrowth: number;
  installsByDay: Array<{ day: string; installs: number; success: number; failed: number }>;
  installTimeHistory: Array<{ week: string; avgTime: number }>;
  distroData: Array<{ name: string; value: number; color: string }>;
  databaseData: Array<{ name: string; value: number; color: string }>;
  errorTypes: Array<{ name: string; count: number; percentage: number }>;
}

export type MetricsPeriod = 'today' | 'week' | 'month' | 'all';

export interface UseInstallerMetricsReturn {
  metrics: InstallerMetrics | null;
  isLoading: boolean;
  error: string | null;
  period: MetricsPeriod;
  setPeriod: (period: MetricsPeriod) => void;
  refreshMetrics: () => Promise<void>;
  lastUpdated: Date | null;
}

const DEFAULT_METRICS: InstallerMetrics = {
  totalInstalls: 0,
  successRate: 0,
  failureRate: 0,
  avgTimeMinutes: 0,
  todayInstalls: 0,
  weeklyGrowth: 0,
  installsByDay: [],
  installTimeHistory: [],
  distroData: [],
  databaseData: [],
  errorTypes: [],
};

export function useInstallerMetrics(): UseInstallerMetricsReturn {
  const [metrics, setMetrics] = useState<InstallerMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<MetricsPeriod>('week');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('installer-metrics', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Fallback: try direct fetch if invoke doesn't work with GET
      if (invokeError || !data) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/installer-metrics?period=${period}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setMetrics(jsonData);
        setLastUpdated(new Date());
        return;
      }

      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar métricas';
      console.error('[useInstallerMetrics] Error:', err);
      setError(message);
      // Set default metrics on error
      setMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  const refreshMetrics = useCallback(async () => {
    await fetchMetrics();
    toast.success('Métricas atualizadas');
  }, [fetchMetrics]);

  // Fetch metrics on mount and when period changes
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    period,
    setPeriod,
    refreshMetrics,
    lastUpdated,
  };
}
