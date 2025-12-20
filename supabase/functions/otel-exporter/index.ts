import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  durationMs: number;
  status: 'OK' | 'ERROR' | 'UNSET';
  attributes: Record<string, string | number | boolean>;
}

interface OtlpResourceSpan {
  resource: {
    attributes: Array<{ key: string; value: { stringValue?: string; intValue?: string; boolValue?: boolean } }>;
  };
  scopeSpans: Array<{
    scope: { name: string; version: string };
    spans: Array<{
      traceId: string;
      spanId: string;
      parentSpanId: string;
      name: string;
      kind: number;
      startTimeUnixNano: string;
      endTimeUnixNano: string;
      status: { code: number };
      attributes: Array<{ key: string; value: { stringValue?: string; intValue?: string; boolValue?: boolean } }>;
    }>;
  }>;
}

// Convert installation steps to OpenTelemetry spans
function convertToSpans(
  sessionId: string,
  steps: Array<{ name: string; duration_ms: number; status: string }>,
  startTime: number
): TraceSpan[] {
  let currentTime = startTime;
  
  return steps.map((step, index) => {
    const spanId = sessionId.replace(/-/g, '').slice(0, 8) + index.toString(16).padStart(8, '0');
    const startTimeNano = currentTime * 1_000_000;
    const durationMs = step.duration_ms || 0;
    const endTimeNano = (currentTime + durationMs) * 1_000_000;
    
    currentTime += durationMs;
    
    return {
      spanId,
      parentSpanId: index > 0 ? sessionId.replace(/-/g, '').slice(0, 8) + (index - 1).toString(16).padStart(8, '0') : undefined,
      operationName: step.name,
      startTimeUnixNano: startTimeNano,
      endTimeUnixNano: endTimeNano,
      durationMs,
      status: step.status === 'success' ? 'OK' : step.status === 'error' ? 'ERROR' : 'UNSET',
      attributes: {
        'step.index': index,
        'step.name': step.name,
        'step.status': step.status,
        'step.duration_ms': durationMs,
      },
    };
  });
}

// Convert to OTLP format
function toOtlpFormat(metrics: any[]): { resourceSpans: OtlpResourceSpan[] } {
  return {
    resourceSpans: metrics.map((metric) => {
      const steps = (metric.steps as Array<{ name: string; duration_ms: number; status: string }>) || [];
      const startTime = new Date(metric.started_at).getTime();
      const traceId = metric.session_id.replace(/-/g, '').slice(0, 32).padEnd(32, '0');
      const spans = convertToSpans(metric.session_id, steps, startTime);

      return {
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'tsijukebox-installer' } },
            { key: 'service.version', value: { stringValue: metric.installer_version || 'unknown' } },
            { key: 'host.name', value: { stringValue: metric.distro_family || 'unknown' } },
            { key: 'deployment.environment', value: { stringValue: 'production' } },
          ],
        },
        scopeSpans: [
          {
            scope: {
              name: 'tsijukebox.installer',
              version: '1.0.0',
            },
            spans: spans.map((span) => ({
              traceId,
              spanId: span.spanId,
              parentSpanId: span.parentSpanId || '',
              name: span.operationName,
              kind: 1, // SPAN_KIND_INTERNAL
              startTimeUnixNano: span.startTimeUnixNano.toString(),
              endTimeUnixNano: span.endTimeUnixNano.toString(),
              status: {
                code: span.status === 'OK' ? 1 : span.status === 'ERROR' ? 2 : 0,
              },
              attributes: Object.entries(span.attributes).map(([key, value]) => ({
                key,
                value: typeof value === 'string'
                  ? { stringValue: value }
                  : typeof value === 'number'
                  ? { intValue: value.toString() }
                  : { boolValue: value },
              })),
            })),
          },
        ],
      };
    }),
  };
}

// Convert to Jaeger format
function toJaegerFormat(metrics: any[]): { data: any[] } {
  return {
    data: metrics.map((metric) => {
      const steps = (metric.steps as Array<{ name: string; duration_ms: number; status: string }>) || [];
      const startTime = new Date(metric.started_at).getTime();
      const traceId = metric.session_id.replace(/-/g, '').slice(0, 32).padEnd(32, '0');
      const spans = convertToSpans(metric.session_id, steps, startTime);

      return {
        traceID: traceId,
        spans: spans.map((span) => ({
          traceID: traceId,
          spanID: span.spanId,
          operationName: span.operationName,
          references: span.parentSpanId
            ? [{ refType: 'CHILD_OF', traceID: traceId, spanID: span.parentSpanId }]
            : [],
          startTime: Math.floor(span.startTimeUnixNano / 1000),
          duration: span.durationMs * 1000,
          tags: Object.entries(span.attributes).map(([key, value]) => ({
            key,
            type: typeof value === 'string' ? 'string' : typeof value === 'number' ? 'int64' : 'bool',
            value,
          })),
          logs: [],
          processID: 'p1',
        })),
        processes: {
          p1: {
            serviceName: 'tsijukebox-installer',
            tags: [
              { key: 'hostname', type: 'string', value: metric.distro_family || 'unknown' },
              { key: 'version', type: 'string', value: metric.installer_version || 'unknown' },
            ],
          },
        },
      };
    }),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    // GET /traces - List all traces
    if (req.method === 'GET' && lastPart === 'traces') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const format = url.searchParams.get('format') || 'otlp';

      const { data: metrics, error } = await supabase
        .from('installer_metrics')
        .select('*')
        .not('steps', 'is', null)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[otel-exporter] Query error:', error);
        throw error;
      }

      let responseData;
      if (format === 'jaeger') {
        responseData = toJaegerFormat(metrics || []);
      } else {
        responseData = toOtlpFormat(metrics || []);
      }

      console.log(`[otel-exporter] Returning ${metrics?.length || 0} traces in ${format} format`);

      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /traces/:session_id - Get single trace
    if (req.method === 'GET' && pathParts.includes('traces') && lastPart !== 'traces') {
      const sessionId = lastPart;
      const format = url.searchParams.get('format') || 'otlp';

      const { data: metric, error } = await supabase
        .from('installer_metrics')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('[otel-exporter] Query error:', error);
        throw error;
      }

      if (!metric) {
        return new Response(
          JSON.stringify({ error: 'Trace not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let responseData;
      if (format === 'jaeger') {
        responseData = toJaegerFormat([metric]);
      } else {
        responseData = toOtlpFormat([metric]);
      }

      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /export - Export to external collector
    if (req.method === 'POST' && lastPart === 'export') {
      const { collectorUrl, sessionIds, format = 'otlp' } = await req.json();

      if (!collectorUrl) {
        return new Response(
          JSON.stringify({ error: 'collectorUrl is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch metrics to export
      let query = supabase
        .from('installer_metrics')
        .select('*')
        .not('steps', 'is', null);

      if (sessionIds && sessionIds.length > 0) {
        query = query.in('session_id', sessionIds);
      } else {
        query = query.limit(100);
      }

      const { data: metrics, error } = await query.order('started_at', { ascending: false });

      if (error) {
        console.error('[otel-exporter] Query error:', error);
        throw error;
      }

      const exportData = format === 'jaeger' 
        ? toJaegerFormat(metrics || [])
        : toOtlpFormat(metrics || []);

      // Send to external collector
      const endpoint = format === 'jaeger' 
        ? `${collectorUrl}/api/traces`
        : `${collectorUrl}/v1/traces`;

      try {
        const exportResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exportData),
        });

        if (!exportResponse.ok) {
          const errorText = await exportResponse.text();
          console.error('[otel-exporter] Export failed:', errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Export failed: ${exportResponse.status} ${errorText}` 
            }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[otel-exporter] Exported ${metrics?.length || 0} traces to ${collectorUrl}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            exported: metrics?.length || 0,
            format,
            collectorUrl 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (exportError) {
        console.error('[otel-exporter] Export request failed:', exportError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Connection failed: ${exportError instanceof Error ? exportError.message : 'Unknown error'}` 
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[otel-exporter] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
