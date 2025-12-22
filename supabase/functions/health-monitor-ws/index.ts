import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthMetrics {
  timestamp: string;
  services: Record<string, 'active' | 'inactive' | 'failed' | 'unknown'>;
  metrics: {
    cpuPercent: number;
    memoryPercent: number;
    diskFreeGb: number;
    diskTotalGb: number;
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warn' | 'error' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

function generateHealthMetrics(): HealthMetrics {
  const baseMetrics = {
    cpuPercent: 15 + Math.random() * 25,
    memoryPercent: 40 + Math.random() * 20,
    diskFreeGb: 40 + Math.random() * 10,
    diskTotalGb: 100,
  };

  const services: Record<string, 'active' | 'inactive' | 'failed' | 'unknown'> = {
    tsijukebox: 'active',
    grafana: Math.random() > 0.1 ? 'active' : 'inactive',
    prometheus: Math.random() > 0.15 ? 'active' : 'inactive',
    spotify: 'active',
    playerctl: Math.random() > 0.05 ? 'active' : 'failed',
  };

  const alerts: HealthMetrics['alerts'] = [];
  
  if (baseMetrics.cpuPercent > 80) {
    alerts.push({
      id: `cpu-${Date.now()}`,
      severity: 'warn',
      message: `CPU usage high: ${baseMetrics.cpuPercent.toFixed(1)}%`,
      timestamp: new Date().toISOString(),
    });
  }

  if (baseMetrics.memoryPercent > 85) {
    alerts.push({
      id: `mem-${Date.now()}`,
      severity: 'error',
      message: `Memory usage critical: ${baseMetrics.memoryPercent.toFixed(1)}%`,
      timestamp: new Date().toISOString(),
    });
  }

  Object.entries(services).forEach(([name, status]) => {
    if (status === 'failed') {
      alerts.push({
        id: `svc-${name}-${Date.now()}`,
        severity: 'error',
        message: `Service ${name} has failed`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return {
    timestamp: new Date().toISOString(),
    services,
    metrics: baseMetrics,
    alerts,
  };
}

serve(async (req) => {
  const { headers, method } = req;
  
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log("[HealthMonitor] HTTP request - returning JSON health status");
    const healthData = generateHealthMetrics();
    return new Response(JSON.stringify(healthData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    let intervalId: number | undefined;
    
    socket.onopen = () => {
      console.log("[HealthMonitor] Client connected via WebSocket");
      const initialData = generateHealthMetrics();
      socket.send(JSON.stringify(initialData));
      
      intervalId = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          const healthData = generateHealthMetrics();
          socket.send(JSON.stringify(healthData));
        }
      }, 30000);
    };
    
    socket.onmessage = (event) => {
      if (event.data === 'ping') socket.send('pong');
      if (event.data === 'refresh') {
        const healthData = generateHealthMetrics();
        socket.send(JSON.stringify(healthData));
      }
    };
    
    socket.onclose = () => {
      console.log("[HealthMonitor] Client disconnected");
      if (intervalId) clearInterval(intervalId);
    };
    
    return response;
  } catch (error) {
    console.error("[HealthMonitor] WebSocket upgrade failed:", error);
    return new Response(
      JSON.stringify({ error: "WebSocket upgrade failed" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});