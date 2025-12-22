import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KioskEvent {
  event: 'heartbeat' | 'chromium_restart' | 'container_restart' | 'health_check_failed' | 
         'recovery_started' | 'boot_complete' | 'watchdog_started' | 'error' | 'screenshot' |
         'command_result' | 'container_updated';
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
  command_id?: string;
  result?: string;
  screenshot_data?: string;
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
  cpu_usage_percent?: number;
  memory_used_mb?: number;
  last_screenshot_url?: string;
}

// Função auxiliar para registrar logs de auditoria
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logAudit(
  supabaseClient: any,
  data: {
    action: string;
    category: string;
    severity?: 'info' | 'warning' | 'critical';
    target_type?: string;
    target_id?: string;
    target_name?: string;
    details?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    status?: 'success' | 'failure' | 'pending';
    error_message?: string;
  }
) {
  try {
    await supabaseClient.from('audit_logs').insert([{
      action: data.action,
      category: data.category,
      severity: data.severity || 'info',
      target_type: data.target_type,
      target_id: data.target_id,
      target_name: data.target_name,
      details: data.details || {},
      metadata: data.metadata || {},
      status: data.status || 'success',
      error_message: data.error_message,
    }]);
  } catch (error) {
    console.error('[kiosk-webhook] Error logging audit:', error);
  }
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

    // GET /kiosk-webhook/commands?machine_id=XXX - Retorna comandos pendentes para um kiosk
    if (req.method === "GET" && path === "commands") {
      const machineId = url.searchParams.get("machine_id");
      
      if (!machineId) {
        return new Response(JSON.stringify({ error: "machine_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[kiosk-webhook] GET /commands for machine_id: ${machineId}`);

      const { data: commands, error } = await supabase
        .from("kiosk_commands")
        .select("*")
        .eq("machine_id", machineId)
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) throw error;

      if (commands && commands.length > 0) {
        // Marcar como em execução
        await supabase
          .from("kiosk_commands")
          .update({ status: "executing" })
          .eq("id", commands[0].id);

        // Log de auditoria: comando sendo executado
        await logAudit(supabase, {
          action: 'kiosk_command_executing',
          category: 'kiosk',
          severity: 'info',
          target_type: 'kiosk',
          target_id: machineId,
          details: {
            command_id: commands[0].id,
            command: commands[0].command,
            params: commands[0].params,
          },
          status: 'pending',
        });

        return new Response(JSON.stringify({ 
          success: true, 
          command: commands[0] 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        command: null 
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

    // POST /kiosk-webhook/commands/:id/complete - Marca comando como executado
    if (req.method === "POST" && url.pathname.includes("/commands/") && url.pathname.endsWith("/complete")) {
      const parts = url.pathname.split("/");
      const commandId = parts[parts.length - 2];
      
      const body = await req.json().catch(() => ({}));
      
      console.log(`[kiosk-webhook] POST /commands/${commandId}/complete`);

      // Buscar o comando para obter informações
      const { data: commandData } = await supabase
        .from("kiosk_commands")
        .select("*")
        .eq("id", commandId)
        .single();

      const { error } = await supabase
        .from("kiosk_commands")
        .update({ 
          status: body.success ? "completed" : "failed",
          result: body.result || null,
          executed_at: new Date().toISOString()
        })
        .eq("id", commandId);

      if (error) throw error;

      // Log de auditoria: comando executado
      await logAudit(supabase, {
        action: body.success ? 'kiosk_command_completed' : 'kiosk_command_failed',
        category: 'kiosk',
        severity: body.success ? 'info' : 'warning',
        target_type: 'kiosk',
        target_id: commandData?.machine_id,
        details: {
          command_id: commandId,
          command: commandData?.command,
          result: body.result,
        },
        status: body.success ? 'success' : 'failure',
        error_message: body.success ? undefined : body.result,
      });

      return new Response(JSON.stringify({ success: true }), {
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

      // Se for resultado de comando, atualizar comando
      if (event.event === 'command_result' && event.command_id) {
        await supabase
          .from("kiosk_commands")
          .update({ 
            status: "completed",
            result: event.result || null,
            executed_at: new Date().toISOString()
          })
          .eq("id", event.command_id);

        // Log de auditoria: resultado do comando
        await logAudit(supabase, {
          action: 'kiosk_command_result',
          category: 'kiosk',
          severity: 'info',
          target_type: 'kiosk',
          target_id: event.machine_id,
          target_name: event.hostname,
          details: {
            command_id: event.command_id,
            result: event.result,
          },
          status: 'success',
        });
      }

      // Determinar status baseado no evento
      let status: KioskConnection['status'] = 'online';
      switch (event.event) {
        case 'error':
        case 'health_check_failed':
          status = 'error';
          // Log de auditoria: erro no kiosk
          await logAudit(supabase, {
            action: 'kiosk_error',
            category: 'kiosk',
            severity: 'critical',
            target_type: 'kiosk',
            target_id: event.machine_id,
            target_name: event.hostname,
            details: {
              event_type: event.event,
              error_message: event.error_message,
              metrics: event.metrics,
            },
            status: 'failure',
            error_message: event.error_message,
          });
          break;
        case 'recovery_started':
          status = 'recovering';
          await logAudit(supabase, {
            action: 'kiosk_recovery_started',
            category: 'kiosk',
            severity: 'warning',
            target_type: 'kiosk',
            target_id: event.machine_id,
            target_name: event.hostname,
            status: 'pending',
          });
          break;
        case 'chromium_restart':
        case 'container_restart':
          status = 'online';
          await logAudit(supabase, {
            action: event.event === 'chromium_restart' ? 'kiosk_chromium_restart' : 'kiosk_container_restart',
            category: 'kiosk',
            severity: 'warning',
            target_type: 'kiosk',
            target_id: event.machine_id,
            target_name: event.hostname,
            details: { metrics: event.metrics },
            status: 'success',
          });
          break;
        case 'heartbeat':
        case 'boot_complete':
        case 'watchdog_started':
        case 'container_updated':
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
        cpu_usage_percent: event.metrics?.cpu_usage_percent,
        memory_used_mb: event.metrics?.memory_used_mb,
      };

      // Handle screenshot upload
      if (event.event === 'screenshot' && event.screenshot_data) {
        try {
          const fileName = `kiosk-${event.machine_id}-${Date.now()}.png`;
          const imageData = Uint8Array.from(atob(event.screenshot_data), c => c.charCodeAt(0));
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('screenshots')
            .upload(fileName, imageData, {
              contentType: 'image/png',
              upsert: true
            });

          if (!uploadError && uploadData) {
            const { data: publicUrl } = supabase.storage
              .from('screenshots')
              .getPublicUrl(fileName);
            
            kioskData.last_screenshot_url = publicUrl.publicUrl;

            // Log de auditoria: screenshot capturado
            await logAudit(supabase, {
              action: 'kiosk_screenshot_captured',
              category: 'kiosk',
              severity: 'info',
              target_type: 'kiosk',
              target_id: event.machine_id,
              target_name: event.hostname,
              details: { screenshot_url: publicUrl.publicUrl },
              status: 'success',
            });
          }
        } catch (e) {
          console.error('[kiosk-webhook] Error uploading screenshot:', e);
        }
      }

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

        // Log de auditoria: novo kiosk registrado
        await logAudit(supabase, {
          action: 'kiosk_registered',
          category: 'kiosk',
          severity: 'info',
          target_type: 'kiosk',
          target_id: event.machine_id,
          target_name: event.hostname,
          details: {
            ip_address: event.ip_address,
            install_id: event.install_id,
          },
          status: 'success',
        });
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