import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  RefreshCw,
  Layers
} from "lucide-react";
import { useOpenTelemetry, Trace, TraceSpan } from "@/hooks/system/useOpenTelemetry";
import { toast } from "sonner";
import { Badge, Button, Card, Input } from "@/components/ui/themed"

interface TraceViewerProps {
  sessionId?: string;
  onSelectTrace?: (trace: Trace) => void;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "OK":
    case "success":
      return "text-green-400 bg-green-500/20 border-green-500/30";
    case "ERROR":
    case "failed":
      return "text-red-400 bg-red-500/20 border-red-500/30";
    default:
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
  }
}

function SpanRow({ span, totalDuration, startOffset, level = 0 }: { 
  span: TraceSpan; 
  totalDuration: number;
  startOffset: number;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const widthPercent = Math.max((span.durationMs / totalDuration) * 100, 1);
  const leftPercent = (startOffset / totalDuration) * 100;

  return (
    <div className="group">
      <div 
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/30 rounded cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-5 flex justify-center" style={{ marginLeft: level * 16 }}>
          {expanded ? (
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{span.operationName}</span>
            <Badge variant="outline" className={`text-xs px-1 py-0 ${getStatusColor(span.status)}`}>
              {span.status}
            </Badge>
          </div>
          
          {/* Timeline bar */}
          <div className="mt-1 h-2 bg-muted/20 rounded-full relative overflow-hidden">
            <div 
              className={`absolute h-full rounded-full transition-all ${
                span.status === "OK" ? "bg-green-500/60" : 
                span.status === "ERROR" ? "bg-red-500/60" : "bg-yellow-500/60"
              }`}
              style={{ 
                left: `${leftPercent}%`, 
                width: `${widthPercent}%`,
              }}
            />
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <span className="text-sm font-mono text-muted-foreground">
            {formatDuration(span.durationMs)}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="ml-8 pl-4 border-l border-border/50 py-2 space-y-1">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Span ID:</span>
              <code className="ml-2 text-primary">{span.spanId}</code>
            </div>
            {span.parentSpanId && (
              <div>
                <span className="text-muted-foreground">Parent:</span>
                <code className="ml-2 text-muted-foreground">{span.parentSpanId}</code>
              </div>
            )}
          </div>
          {Object.keys(span.attributes).length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground font-medium">Atributos:</span>
              <div className="mt-1 p-2 bg-muted/20 rounded text-xs font-mono space-y-0.5">
                {Object.entries(span.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-cyan-400">{key}</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TraceCard({ trace, onSelect, isSelected }: { 
  trace: Trace; 
  onSelect: () => void;
  isSelected: boolean;
}) {
  const spanCount = trace.spans.length;
  const errorCount = trace.spans.filter(s => s.status === "ERROR").length;

  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? "border-primary bg-primary/10" 
          : "border-border/50 hover:border-primary/50 hover:bg-muted/20"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(trace.status)}>
            {trace.status === "success" ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : trace.status === "failed" ? (
              <XCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {trace.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(trace.startTime).toLocaleString()}
          </span>
        </div>
        <span className="text-sm font-mono text-primary">{formatDuration(trace.totalDurationMs)}</span>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {spanCount} spans
        </span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <XCircle className="h-3 w-3" />
            {errorCount} errors
          </span>
        )}
        {trace.distro && (
          <span>{trace.distro}</span>
        )}
        {trace.version && (
          <span>v{trace.version}</span>
        )}
      </div>
      
      <code className="text-xs text-muted-foreground/60 mt-1 block truncate">
        {trace.traceId}
      </code>
    </div>
  );
}

export function TraceViewer({ sessionId, onSelectTrace }: TraceViewerProps) {
  const { 
    traces, 
    currentTrace, 
    isLoading, 
    fetchTraces, 
    getTrace,
    exportToCollector,
    downloadAsJson
  } = useOpenTelemetry();
  
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectorUrl, setCollectorUrl] = useState("http://localhost:4318");

  useEffect(() => {
    if (sessionId) {
      getTrace(sessionId);
    } else {
      fetchTraces();
    }
  }, [sessionId, fetchTraces, getTrace]);

  const selectedTrace = useMemo(() => {
    if (currentTrace) return currentTrace;
    return traces.find(t => t.traceId === selectedTraceId) || null;
  }, [traces, selectedTraceId, currentTrace]);

  const filteredTraces = useMemo(() => {
    if (!searchQuery) return traces;
    const query = searchQuery.toLowerCase();
    return traces.filter(t => 
      t.traceId.toLowerCase().includes(query) ||
      t.sessionId.toLowerCase().includes(query) ||
      t.distro?.toLowerCase().includes(query) ||
      t.version?.toLowerCase().includes(query) ||
      t.spans.some(s => s.operationName.toLowerCase().includes(query))
    );
  }, [traces, searchQuery]);

  const handleCopyTraceId = (traceId: string) => {
    navigator.clipboard.writeText(traceId);
    toast.success("Trace ID copiado!");
  };

  const handleExport = async () => {
    if (selectedTrace) {
      await exportToCollector(collectorUrl, [selectedTrace]);
    } else {
      await exportToCollector(collectorUrl);
    }
  };

  // Calculate span offsets for timeline
  const spanOffsets = useMemo(() => {
    if (!selectedTrace) return new Map<string, number>();
    const offsets = new Map<string, number>();
    let offset = 0;
    selectedTrace.spans.forEach(span => {
      offsets.set(span.spanId, offset);
      offset += span.durationMs;
    });
    return offsets;
  }, [selectedTrace]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Traces List */}
      <Card className="lg:col-span-1 card-dark-neon-border">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Traces</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchTraces()}
              disabled={isLoading}
            >
              <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search aria-hidden="true" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar traces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        
        <div className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredTraces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Carregando traces..." : "Nenhum trace encontrado"}
                </div>
              ) : (
                filteredTraces.map((trace) => (
                  <TraceCard
                    key={trace.traceId}
                    trace={trace}
                    isSelected={selectedTraceId === trace.traceId}
                    onSelect={() => {
                      setSelectedTraceId(trace.traceId);
                      onSelectTrace?.(trace);
                    }}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Trace Detail */}
      <Card className="lg:col-span-2 card-dark-neon-border">
        <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Clock className="h-5 w-5 text-primary" />
                Detalhes do Trace
              </h3>
              {selectedTrace && (
                <p className="text-sm text-[var(--text-muted)]">
                  <code className="text-xs">{selectedTrace.traceId}</code>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyTraceId(selectedTrace.traceId)}
                      >
                        <Copy aria-hidden="true" className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar Trace ID</TooltipContent>
                  </Tooltip>
                </p>
              )}
            </div>
            
            {selectedTrace && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(selectedTrace.status)}>
                  {formatDuration(selectedTrace.totalDurationMs)}
                </Badge>
              </div>
            )}
          </div>
        
        
        <div className="mt-4">
          {!selectedTrace ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Layers className="h-12 w-12 mb-4 opacity-50" />
              <p>Selecione um trace para ver os detalhes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Trace metadata */}
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted/20 rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground">Session ID</span>
                  <p className="text-sm font-mono truncate">{selectedTrace.sessionId}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Distro</span>
                  <p className="text-sm">{selectedTrace.distro || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Version</span>
                  <p className="text-sm">{selectedTrace.version || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Spans</span>
                  <p className="text-sm">{selectedTrace.spans.length}</p>
                </div>
              </div>

              <Separator />

              {/* Spans Timeline */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Timeline de Spans
                </h4>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-1 pr-4">
                    {selectedTrace.spans.map((span, index) => (
                      <SpanRow
                        key={span.spanId}
                        span={span}
                        totalDuration={selectedTrace.totalDurationMs}
                        startOffset={spanOffsets.get(span.spanId) || 0}
                        level={0}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Export Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <ExternalLink aria-hidden="true" className="h-4 w-4 text-primary" />
                  Exportar
                </h4>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="URL do Collector (ex: http://localhost:4318)"
                    value={collectorUrl}
                    onChange={(e) => setCollectorUrl(e.target.value)}
                    className="flex-1 bg-background/50"
                  />
                  <Button size="sm" variant="outline" onClick={handleExport}>
                    Enviar OTLP
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsJson(selectedTrace ? [selectedTrace] : undefined)}>
                    <Download aria-hidden="true" className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
