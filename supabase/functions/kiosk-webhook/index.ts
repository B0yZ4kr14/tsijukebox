import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KioskEvent {
  event: 'heartbeat' | 'chromium_restart' | 'container_restart' | 'health_check_failed' | 
         'recovery_started' | 'boot_complete' | 'watchdog_started' | 'error';
  hostname: string;
  machine_id: string;
  ip_address?: string;
  timestamp: string;
  metrics?: {
    chromium_pid?: number;
    container_running?: number;
    uptime_seconds?: number;
    memory_used_mb?: number;
    cpu_usage_percent?: number;
  };
  error_message?: string;
  install_id?: string;
}

interface KioskConnection {
  id?: string;
  hostname: string;
  machine_id: string;
  ip_address?: string;
  status: 'online' | 'offline' | 'error' | 'recovering' | 'unknown';
  last_heartbeat: string;
  last_event: string;
  last_event_at: string;
  install_id?: string;
  config?: Record<string, unknown>;
  events?: Array<{
    event: string;
    timestamp: string;
    details?: Record<string, unknown>;
  }>;
  metrics?: Record<string, unknown>;
  uptime_seconds?: number;
  crash_count?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // GET /kiosk-webhook/status - Retorna status de todos os kiosks
    if (req.method === "GET" && path === "status") {
      console.log("[kiosk-webhook] GET /status - Fetching all kiosks");
      
      const { data: kiosks, error } = await supabase
        .from("kiosk_connections")
        .select("*")
        .order("last_heartbeat", { ascending: false });

      if (error) {
        console.error("[kiosk-webhook] Error fetching kiosks:", error);
        throw error;
      }

      // Marcar kiosks offline se heartbeat > 2 minutos
      const now = new Date();
      const updatedKiosks = kiosks?.map((kiosk: KioskConnection) => {
        if (kiosk.last_heartbeat) {
          const lastHeartbeat = new Date(kiosk.last_heartbeat);
          const diffMs = now.getTime() - lastHeartbeat.getTime();
          const diffMinutes = diffMs / 60000;
          
          if (diffMinutes > 2 && kiosk.status === 'online') {
            return { ...kiosk, status: 'offline' };
          }
        }
        return kiosk;
      }) || [];

      console.log(`[kiosk-webhook] Found ${updatedKiosks.length} kiosks`);

      return new Response(JSON.stringify({ 
        success: true, 
        kiosks: updatedKiosks,
        timestamp: now.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /kiosk-webhook - Retorna métricas agregadas
    if (req.method === "GET") {
      console.log("[kiosk-webhook] GET / - Fetching metrics");
      
      const { data: kiosks, error } = await supabase
        .from("kiosk_connections")
        .select("*");

      if (error) throw error;

      const now = new Date();
      let onlineCount = 0;
      let offlineCount = 0;
      let errorCount = 0;
      let totalUptime = 0;
      let totalCrashes = 0;

      kiosks?.forEach((kiosk: KioskConnection) => {
        if (kiosk.last_heartbeat) {
          const lastHeartbeat = new Date(kiosk.last_heartbeat);
          const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 60000;
          
          if (diffMinutes <= 2) {
            onlineCount++;
          } else {
            offlineCount++;
          }
        } else {
          offlineCount++;
        }
        
        if (kiosk.status === 'error') errorCount++;
        totalUptime += kiosk.uptime_seconds || 0;
        totalCrashes += kiosk.crash_count || 0;
      });

      return new Response(JSON.stringify({
        success: true,
        metrics: {
          total: kiosks?.length || 0,
          online: onlineCount,
          offline: offlineCount,
          error: errorCount,
          total_uptime_hours: Math.round(totalUptime / 3600),
          total_crashes: totalCrashes,
        },
        timestamp: now.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /kiosk-webhook - Receber evento do kiosk
    if (req.method === "POST") {
      const event: KioskEvent = await req.json();
      console.log(`[kiosk-webhook] POST - Event: ${event.event} from ${event.hostname} (${event.machine_id})`);

      if (!event.hostname || !event.machine_id || !event.event) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Missing required fields: hostname, machine_id, event" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Determinar status baseado no evento
      let status: KioskConnection['status'] = 'online';
      switch (event.event) {
        case 'error':
        case 'health_check_failed':
          status = 'error';
          break;
        case 'recovery_started':
          status = 'recovering';
          break;
        case 'heartbeat':
        case 'boot_complete':
        case 'watchdog_started':
          status = 'online';
          break;
      }

      // Verificar se kiosk já existe
      const { data: existing } = await supabase
        .from("kiosk_connections")
        .select("id, events, crash_count")
        .eq("machine_id", event.machine_id)
        .maybeSingle();

      const eventRecord = {
        event: event.event,
        timestamp: event.timestamp || new Date().toISOString(),
        details: {
          metrics: event.metrics,
          error_message: event.error_message,
        }
      };

      // Atualizar contagem de crashes
      let crashCount = existing?.crash_count || 0;
      if (event.event === 'chromium_restart' || event.event === 'container_restart') {
        crashCount++;
      }

      // Manter últimos 100 eventos
      let events = existing?.events || [];
      events = [eventRecord, ...events].slice(0, 100);

      const kioskData: Partial<KioskConnection> = {
        hostname: event.hostname,
        machine_id: event.machine_id,
        ip_address: event.ip_address,
        status,
        last_heartbeat: event.event === 'heartbeat' ? new Date().toISOString() : undefined,
        last_event: event.event,
        last_event_at: new Date().toISOString(),
        install_id: event.install_id,
        events,
        metrics: event.metrics,
        uptime_seconds: event.metrics?.uptime_seconds,
        crash_count: crashCount,
      };

      // Remover campos undefined
      Object.keys(kioskData).forEach(key => {
        if (kioskData[key as keyof typeof kioskData] === undefined) {
          delete kioskData[key as keyof typeof kioskData];
        }
      });

      let result;
      if (existing) {
        // Update existing
        console.log(`[kiosk-webhook] Updating kiosk: ${existing.id}`);
        result = await supabase
          .from("kiosk_connections")
          .update(kioskData)
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        // Insert new
        console.log(`[kiosk-webhook] Creating new kiosk connection`);
        result = await supabase
          .from("kiosk_connections")
          .insert(kioskData)
          .select()
          .single();
      }

      if (result.error) {
        console.error("[kiosk-webhook] Database error:", result.error);
        throw result.error;
      }

      console.log(`[kiosk-webhook] Success - Kiosk ${event.hostname} status: ${status}`);

      return new Response(JSON.stringify({ 
        success: true, 
        kiosk: result.data,
        message: `Event ${event.event} processed for ${event.hostname}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[kiosk-webhook] Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
