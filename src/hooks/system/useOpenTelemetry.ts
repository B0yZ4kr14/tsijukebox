import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  durationMs: number;
  status: "OK" | "ERROR" | "UNSET";
  attributes: Record<string, string | number | boolean>;
  events?: Array<{
    name: string;
    timestamp: number;
    attributes?: Record<string, unknown>;
  }>;
}

export interface Trace {
  traceId: string;
  sessionId: string;
  spans: TraceSpan[];
  totalDurationMs: number;
  status: "success" | "failed" | "running";
  startTime: string;
  endTime?: string;
  distro?: string;
  version?: string;
}

interface UseOpenTelemetryReturn {
  traces: Trace[];
  currentTrace: Trace | null;
  isLoading: boolean;
  error: string | null;
  fetchTraces: (limit?: number) => Promise<void>;
  getTrace: (sessionId: string) => Promise<Trace | null>;
  exportToCollector: (collectorUrl: string, traces?: Trace[]) => Promise<boolean>;
  exportToJaeger: (jaegerUrl: string, traces?: Trace[]) => Promise<boolean>;
  downloadAsJson: (traces?: Trace[]) => void;
}

// Convert installation steps to OpenTelemetry spans
function convertToSpans(
  sessionId: string,
  steps: Array<{ name: string; duration_ms: number; status: string }>,
  startTime: number
): TraceSpan[] {
  let currentTime = startTime;
  
  return steps.map((step, index) => {
    const spanId = `${sessionId.slice(0, 8)}-span-${index.toString().padStart(4, "0")}`;
    const startTimeNano = currentTime * 1_000_000; // Convert to nanoseconds
    const durationMs = step.duration_ms || 0;
    const endTimeNano = (currentTime + durationMs) * 1_000_000;
    
    currentTime += durationMs;
    
    return {
      spanId,
      parentSpanId: index > 0 ? `${sessionId.slice(0, 8)}-span-${(index - 1).toString().padStart(4, "0")}` : undefined,
      operationName: step.name,
      startTimeUnixNano: startTimeNano,
      endTimeUnixNano: endTimeNano,
      durationMs,
      status: step.status === "success" ? "OK" : step.status === "error" ? "ERROR" : "UNSET",
      attributes: {
        "step.index": index,
        "step.name": step.name,
        "step.status": step.status,
        "step.duration_ms": durationMs,
      },
    };
  });
}

// Convert to OpenTelemetry Protocol (OTLP) format
function toOtlpFormat(traces: Trace[]): object {
  return {
    resourceSpans: traces.map((trace) => ({
      resource: {
        attributes: [
          { key: "service.name", value: { stringValue: "tsijukebox-installer" } },
          { key: "service.version", value: { stringValue: trace.version || "unknown" } },
          { key: "host.name", value: { stringValue: trace.distro || "unknown" } },
        ],
      },
      scopeSpans: [
        {
          scope: {
            name: "tsijukebox.installer",
            version: "1.0.0",
          },
          spans: trace.spans.map((span) => ({
            traceId: trace.traceId,
            spanId: span.spanId,
            parentSpanId: span.parentSpanId || "",
            name: span.operationName,
            kind: 1, // SPAN_KIND_INTERNAL
            startTimeUnixNano: span.startTimeUnixNano.toString(),
            endTimeUnixNano: span.endTimeUnixNano.toString(),
            status: {
              code: span.status === "OK" ? 1 : span.status === "ERROR" ? 2 : 0,
            },
            attributes: Object.entries(span.attributes).map(([key, value]) => ({
              key,
              value: typeof value === "string" 
                ? { stringValue: value }
                : typeof value === "number"
                ? { intValue: value.toString() }
                : { boolValue: value },
            })),
          })),
        },
      ],
    })),
  };
}

// Convert to Jaeger format
function toJaegerFormat(traces: Trace[]): object {
  return {
    data: traces.map((trace) => ({
      traceID: trace.traceId,
      spans: trace.spans.map((span) => ({
        traceID: trace.traceId,
        spanID: span.spanId,
        operationName: span.operationName,
        references: span.parentSpanId
          ? [{ refType: "CHILD_OF", traceID: trace.traceId, spanID: span.parentSpanId }]
          : [],
        startTime: Math.floor(span.startTimeUnixNano / 1000), // Convert to microseconds
        duration: span.durationMs * 1000, // Convert to microseconds
        tags: Object.entries(span.attributes).map(([key, value]) => ({
          key,
          type: typeof value === "string" ? "string" : typeof value === "number" ? "int64" : "bool",
          value,
        })),
        logs: span.events?.map((event) => ({
          timestamp: event.timestamp,
          fields: [
            { key: "event", type: "string", value: event.name },
            ...Object.entries(event.attributes || {}).map(([key, value]) => ({
              key,
              type: typeof value === "string" ? "string" : "object",
              value,
            })),
          ],
        })) || [],
        processID: "p1",
      })),
      processes: {
        p1: {
          serviceName: "tsijukebox-installer",
          tags: [
            { key: "hostname", type: "string", value: trace.distro || "unknown" },
            { key: "version", type: "string", value: trace.version || "unknown" },
          ],
        },
      },
    })),
  };
}

export function useOpenTelemetry(): UseOpenTelemetryReturn {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [currentTrace, setCurrentTrace] = useState<Trace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTraces = useCallback(async (limit = 50) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("installer_metrics")
        .select("*")
        .not("steps", "is", null)
        .order("started_at", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const processedTraces: Trace[] = (data || []).map((metric) => {
        const steps = (metric.steps as Array<{ name: string; duration_ms: number; status: string }>) || [];
        const startTime = new Date(metric.started_at).getTime();
        
        // Generate trace ID from session ID
        const traceId = metric.session_id.replace(/-/g, "").slice(0, 32).padEnd(32, "0");
        
        return {
          traceId,
          sessionId: metric.session_id,
          spans: convertToSpans(metric.session_id, steps, startTime),
          totalDurationMs: metric.total_duration_ms || 0,
          status: metric.status as "success" | "failed" | "running",
          startTime: metric.started_at,
          endTime: metric.completed_at,
          distro: metric.distro_family,
          version: metric.installer_version,
        };
      });

      setTraces(processedTraces);
    } catch (e) {
      console.error("Error fetching traces:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch traces");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTrace = useCallback(async (sessionId: string): Promise<Trace | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("installer_metrics")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) return null;

      const steps = (data.steps as Array<{ name: string; duration_ms: number; status: string }>) || [];
      const startTime = new Date(data.started_at).getTime();
      const traceId = data.session_id.replace(/-/g, "").slice(0, 32).padEnd(32, "0");

      const trace: Trace = {
        traceId,
        sessionId: data.session_id,
        spans: convertToSpans(data.session_id, steps, startTime),
        totalDurationMs: data.total_duration_ms || 0,
        status: data.status as "success" | "failed" | "running",
        startTime: data.started_at,
        endTime: data.completed_at,
        distro: data.distro_family,
        version: data.installer_version,
      };

      setCurrentTrace(trace);
      return trace;
    } catch (e) {
      console.error("Error fetching trace:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch trace");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportToCollector = useCallback(async (collectorUrl: string, tracesToExport?: Trace[]): Promise<boolean> => {
    const exportData = tracesToExport || traces;
    if (exportData.length === 0) {
      toast.error("Nenhum trace para exportar");
      return false;
    }

    try {
      const otlpData = toOtlpFormat(exportData);
      
      const response = await fetch(`${collectorUrl}/v1/traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otlpData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      toast.success(`${exportData.length} traces exportados para OpenTelemetry Collector`);
      return true;
    } catch (e) {
      console.error("Error exporting to collector:", e);
      toast.error(`Falha ao exportar: ${e instanceof Error ? e.message : "Unknown error"}`);
      return false;
    }
  }, [traces]);

  const exportToJaeger = useCallback(async (jaegerUrl: string, tracesToExport?: Trace[]): Promise<boolean> => {
    const exportData = tracesToExport || traces;
    if (exportData.length === 0) {
      toast.error("Nenhum trace para exportar");
      return false;
    }

    try {
      const jaegerData = toJaegerFormat(exportData);
      
      const response = await fetch(`${jaegerUrl}/api/traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jaegerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      toast.success(`${exportData.length} traces exportados para Jaeger`);
      return true;
    } catch (e) {
      console.error("Error exporting to Jaeger:", e);
      toast.error(`Falha ao exportar: ${e instanceof Error ? e.message : "Unknown error"}`);
      return false;
    }
  }, [traces]);

  const downloadAsJson = useCallback((tracesToExport?: Trace[]) => {
    const exportData = tracesToExport || traces;
    if (exportData.length === 0) {
      toast.error("Nenhum trace para exportar");
      return;
    }

    const otlpData = toOtlpFormat(exportData);
    const blob = new Blob([JSON.stringify(otlpData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tsijukebox-traces-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${exportData.length} traces exportados como JSON`);
  }, [traces]);

  return {
    traces,
    currentTrace,
    isLoading,
    error,
    fetchTraces,
    getTrace,
    exportToCollector,
    exportToJaeger,
    downloadAsJson,
  };
}
