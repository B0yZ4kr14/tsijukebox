import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VersionMetrics {
  version: string;
  totalInstalls: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  failureRate: number;
  avgDurationMs: number;
  medianDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  topErrors: Array<{ code: string; count: number }>;
  firstSeen: string;
  lastSeen: string;
  distroBreakdown: Record<string, number>;
}

export interface RegressionAnalysis {
  slope: number;
  trend: "improving" | "stable" | "degrading";
  rSquared: number;
  prediction: number;
}

export interface ComparisonData {
  versions: string[];
  metrics: {
    successRates: number[];
    avgDurations: number[];
    errorCounts: number[];
    installCounts: number[];
  };
  timeSeriesData: Array<{
    date: string;
    [version: string]: number | string;
  }>;
  radarData: Array<{
    metric: string;
    [version: string]: number | string;
    fullMark: number;
  }>;
}

interface UseVersionMetricsReturn {
  versions: VersionMetrics[];
  selectedVersions: string[];
  comparisonData: ComparisonData | null;
  regressionAnalysis: RegressionAnalysis | null;
  selectVersion: (version: string) => void;
  deselectVersion: (version: string) => void;
  clearSelection: () => void;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// Linear regression calculation
function calculateRegression(data: Array<{ x: number; y: number }>): RegressionAnalysis {
  if (data.length < 2) {
    return { slope: 0, trend: "stable", rSquared: 0, prediction: data[0]?.y || 0 };
  }

  const n = data.length;
  const sumX = data.reduce((acc, p) => acc + p.x, 0);
  const sumY = data.reduce((acc, p) => acc + p.y, 0);
  const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = data.reduce((acc, p) => acc + p.x * p.x, 0);
  const sumY2 = data.reduce((acc, p) => acc + p.y * p.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  const ssTotal = data.reduce((acc, p) => acc + Math.pow(p.y - yMean, 2), 0);
  const ssResidual = data.reduce((acc, p) => {
    const predicted = slope * p.x + intercept;
    return acc + Math.pow(p.y - predicted, 2);
  }, 0);
  const rSquared = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  // Prediction for next point
  const prediction = slope * (n + 1) + intercept;

  // Determine trend
  let trend: "improving" | "stable" | "degrading" = "stable";
  if (Math.abs(slope) > 0.5) {
    trend = slope > 0 ? "degrading" : "improving"; // Higher duration = worse
  }

  return { slope, trend, rSquared, prediction };
}

// Calculate median
function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function useVersionMetrics(): UseVersionMetricsReturn {
  const [versions, setVersions] = useState<VersionMetrics[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("installer_metrics")
        .select("*")
        .order("started_at", { ascending: false });

      if (fetchError) throw fetchError;

      setRawData(data || []);

      // Group by version
      const versionGroups: Record<string, any[]> = {};
      (data || []).forEach((metric) => {
        const version = metric.installer_version || "unknown";
        if (!versionGroups[version]) {
          versionGroups[version] = [];
        }
        versionGroups[version].push(metric);
      });

      // Calculate metrics for each version
      const versionMetrics: VersionMetrics[] = Object.entries(versionGroups).map(
        ([version, metrics]) => {
          const totalInstalls = metrics.length;
          const successCount = metrics.filter((m) => m.status === "success").length;
          const failedCount = metrics.filter((m) => m.status === "failed").length;
          const successRate = totalInstalls > 0 ? (successCount / totalInstalls) * 100 : 0;
          const failureRate = totalInstalls > 0 ? (failedCount / totalInstalls) * 100 : 0;

          // Duration stats
          const durations = metrics
            .filter((m) => m.total_duration_ms)
            .map((m) => m.total_duration_ms);
          const avgDurationMs = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0;
          const medianDurationMs = median(durations);
          const minDurationMs = durations.length > 0 ? Math.min(...durations) : 0;
          const maxDurationMs = durations.length > 0 ? Math.max(...durations) : 0;

          // Error analysis
          const errorCounts: Record<string, number> = {};
          metrics.forEach((m) => {
            const errors = (m.errors as Array<{ code: string }>) || [];
            errors.forEach((err) => {
              const code = err.code || "unknown";
              errorCounts[code] = (errorCounts[code] || 0) + 1;
            });
          });
          const topErrors = Object.entries(errorCounts)
            .map(([code, count]) => ({ code, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Distro breakdown
          const distroBreakdown: Record<string, number> = {};
          metrics.forEach((m) => {
            const distro = m.distro_family || "unknown";
            distroBreakdown[distro] = (distroBreakdown[distro] || 0) + 1;
          });

          // Time range
          const dates = metrics.map((m) => new Date(m.started_at).getTime());
          const firstSeen = new Date(Math.min(...dates)).toISOString();
          const lastSeen = new Date(Math.max(...dates)).toISOString();

          return {
            version,
            totalInstalls,
            successCount,
            failedCount,
            successRate: Math.round(successRate * 10) / 10,
            failureRate: Math.round(failureRate * 10) / 10,
            avgDurationMs: Math.round(avgDurationMs),
            medianDurationMs: Math.round(medianDurationMs),
            minDurationMs,
            maxDurationMs,
            topErrors,
            firstSeen,
            lastSeen,
            distroBreakdown,
          };
        }
      );

      // Sort by version (semantic versioning)
      versionMetrics.sort((a, b) => {
        const parseVersion = (v: string) => {
          const parts = v.replace(/[^\d.]/g, "").split(".");
          return parts.map((p) => parseInt(p, 10) || 0);
        };
        const aV = parseVersion(a.version);
        const bV = parseVersion(b.version);
        for (let i = 0; i < Math.max(aV.length, bV.length); i++) {
          const diff = (bV[i] || 0) - (aV[i] || 0);
          if (diff !== 0) return diff;
        }
        return 0;
      });

      setVersions(versionMetrics);

      // Auto-select latest 2 versions if none selected
      if (selectedVersions.length === 0 && versionMetrics.length >= 2) {
        setSelectedVersions(versionMetrics.slice(0, 2).map((v) => v.version));
      }
    } catch (e) {
      console.error("Error fetching version metrics:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch metrics");
    } finally {
      setIsLoading(false);
    }
  }, [selectedVersions.length]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Generate comparison data for selected versions
  const comparisonData = useMemo<ComparisonData | null>(() => {
    if (selectedVersions.length === 0) return null;

    const selected = versions.filter((v) => selectedVersions.includes(v.version));
    if (selected.length === 0) return null;

    // Basic metrics arrays
    const successRates = selected.map((v) => v.successRate);
    const avgDurations = selected.map((v) => v.avgDurationMs / 60000); // Convert to minutes
    const errorCounts = selected.map((v) => v.topErrors.reduce((sum, e) => sum + e.count, 0));
    const installCounts = selected.map((v) => v.totalInstalls);

    // Time series data (last 30 days)
    const timeSeriesData: Array<{ date: string; [version: string]: number | string }> = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const point: { date: string; [version: string]: number | string } = { date: dateStr };
      
      selectedVersions.forEach((version) => {
        const dayMetrics = rawData.filter((m) => {
          const mDate = new Date(m.started_at).toISOString().split("T")[0];
          return m.installer_version === version && mDate === dateStr;
        });
        const daySuccess = dayMetrics.filter((m) => m.status === "success").length;
        const dayTotal = dayMetrics.length;
        point[version] = dayTotal > 0 ? Math.round((daySuccess / dayTotal) * 100) : 0;
      });
      
      timeSeriesData.push(point);
    }

    // Radar chart data
    const maxSuccessRate = Math.max(...selected.map((v) => v.successRate), 100);
    const maxDuration = Math.max(...selected.map((v) => v.avgDurationMs / 60000), 30);
    const maxInstalls = Math.max(...selected.map((v) => v.totalInstalls), 100);

    const radarData: Array<{ metric: string; [version: string]: number | string; fullMark: number }> = [
      {
        metric: "Taxa de Sucesso",
        ...Object.fromEntries(selected.map((v) => [v.version, v.successRate])),
        fullMark: 100,
      },
      {
        metric: "Velocidade",
        ...Object.fromEntries(selected.map((v) => [v.version, 100 - Math.min((v.avgDurationMs / 60000 / maxDuration) * 100, 100)])),
        fullMark: 100,
      },
      {
        metric: "Estabilidade",
        ...Object.fromEntries(selected.map((v) => [v.version, 100 - v.failureRate])),
        fullMark: 100,
      },
      {
        metric: "Popularidade",
        ...Object.fromEntries(selected.map((v) => [v.version, (v.totalInstalls / maxInstalls) * 100])),
        fullMark: 100,
      },
    ];

    return {
      versions: selectedVersions,
      metrics: { successRates, avgDurations, errorCounts, installCounts },
      timeSeriesData,
      radarData,
    };
  }, [selectedVersions, versions, rawData]);

  // Regression analysis for duration trend
  const regressionAnalysis = useMemo<RegressionAnalysis | null>(() => {
    if (versions.length < 2) return null;

    const dataPoints = versions
      .filter((v) => v.avgDurationMs > 0)
      .map((v, i) => ({ x: i, y: v.avgDurationMs / 60000 }));

    return calculateRegression(dataPoints);
  }, [versions]);

  const selectVersion = useCallback((version: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(version)) return prev;
      if (prev.length >= 4) return prev; // Max 4 versions
      return [...prev, version];
    });
  }, []);

  const deselectVersion = useCallback((version: string) => {
    setSelectedVersions((prev) => prev.filter((v) => v !== version));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVersions([]);
  }, []);

  return {
    versions,
    selectedVersions,
    comparisonData,
    regressionAnalysis,
    selectVersion,
    deselectVersion,
    clearSelection,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}
