import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricPayload {
  session_id: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  distro_family?: string;
  distro_name?: string;
  install_mode?: 'full' | 'minimal' | 'custom' | 'update';
  database_type?: 'sqlite' | 'mariadb' | 'postgresql' | 'firebird';
  steps?: Array<{ name: string; duration_ms: number; status: string }>;
  errors?: Array<{ code: string; message: string; step?: string }>;
  installer_version?: string;
  system_info?: Record<string, unknown>;
  total_duration_ms?: number;
}

interface AggregatedMetrics {
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
    const path = url.pathname.split('/').pop() || '';

    // POST - Receber métricas do analytics.py
    if (req.method === 'POST') {
      const payload: MetricPayload = await req.json();
      
      console.log('[installer-metrics] Received metric:', {
        session_id: payload.session_id,
        status: payload.status,
        distro: payload.distro_family,
      });

      // Verificar se já existe uma sessão
      const { data: existing } = await supabase
        .from('installer_metrics')
        .select('id')
        .eq('session_id', payload.session_id)
        .single();

      if (existing) {
        // Atualizar métrica existente
        const { error: updateError } = await supabase
          .from('installer_metrics')
          .update({
            status: payload.status,
            completed_at: payload.status !== 'running' ? new Date().toISOString() : null,
            total_duration_ms: payload.total_duration_ms,
            steps: payload.steps || [],
            errors: payload.errors || [],
          })
          .eq('session_id', payload.session_id);

        if (updateError) {
          console.error('[installer-metrics] Update error:', updateError);
          throw updateError;
        }

        return new Response(
          JSON.stringify({ success: true, action: 'updated', session_id: payload.session_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Inserir nova métrica
        const { error: insertError } = await supabase
          .from('installer_metrics')
          .insert({
            session_id: payload.session_id,
            status: payload.status,
            distro_family: payload.distro_family,
            distro_name: payload.distro_name,
            install_mode: payload.install_mode,
            database_type: payload.database_type,
            steps: payload.steps || [],
            errors: payload.errors || [],
            installer_version: payload.installer_version,
            system_info: payload.system_info || {},
          });

        if (insertError) {
          console.error('[installer-metrics] Insert error:', insertError);
          throw insertError;
        }

        return new Response(
          JSON.stringify({ success: true, action: 'created', session_id: payload.session_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET - Buscar métricas agregadas
    if (req.method === 'GET') {
      const period = url.searchParams.get('period') || 'week';
      
      // Calcular data de início baseado no período
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0); // all time
      }

      // Buscar todas as métricas do período
      const { data: metrics, error: fetchError } = await supabase
        .from('installer_metrics')
        .select('*')
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: false });

      if (fetchError) {
        console.error('[installer-metrics] Fetch error:', fetchError);
        throw fetchError;
      }

      const allMetrics = metrics || [];
      
      // Calcular métricas agregadas
      const totalInstalls = allMetrics.length;
      const successCount = allMetrics.filter(m => m.status === 'success').length;
      const failedCount = allMetrics.filter(m => m.status === 'failed').length;
      const successRate = totalInstalls > 0 ? (successCount / totalInstalls) * 100 : 0;
      const failureRate = totalInstalls > 0 ? (failedCount / totalInstalls) * 100 : 0;

      // Tempo médio (apenas instalações completas)
      const completedMetrics = allMetrics.filter(m => m.total_duration_ms);
      const avgTimeMs = completedMetrics.length > 0
        ? completedMetrics.reduce((sum, m) => sum + (m.total_duration_ms || 0), 0) / completedMetrics.length
        : 0;
      const avgTimeMinutes = avgTimeMs / 60000;

      // Instalações de hoje
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayInstalls = allMetrics.filter(m => 
        new Date(m.started_at) >= todayStart
      ).length;

      // Crescimento semanal (comparar última semana com a anterior)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const thisWeekCount = allMetrics.filter(m => 
        new Date(m.started_at) >= oneWeekAgo
      ).length;

      const { data: lastWeekMetrics } = await supabase
        .from('installer_metrics')
        .select('id')
        .gte('started_at', twoWeeksAgo.toISOString())
        .lt('started_at', oneWeekAgo.toISOString());

      const lastWeekCount = lastWeekMetrics?.length || 0;
      const weeklyGrowth = lastWeekCount > 0 
        ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 
        : 0;

      // Instalações por dia (últimos 7 dias)
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      const installsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayMetrics = allMetrics.filter(m => {
          const metricDate = new Date(m.started_at);
          return metricDate >= dayStart && metricDate <= dayEnd;
        });

        installsByDay.push({
          day: daysOfWeek[dayStart.getDay()],
          installs: dayMetrics.length,
          success: dayMetrics.filter(m => m.status === 'success').length,
          failed: dayMetrics.filter(m => m.status === 'failed').length,
        });
      }

      // Tempo médio por semana (últimas 4 semanas)
      const installTimeHistory = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        const weekMetrics = allMetrics.filter(m => {
          const metricDate = new Date(m.started_at);
          return metricDate >= weekStart && metricDate <= weekEnd && m.total_duration_ms;
        });

        const weekAvg = weekMetrics.length > 0
          ? weekMetrics.reduce((sum, m) => sum + (m.total_duration_ms || 0), 0) / weekMetrics.length / 60000
          : 0;

        installTimeHistory.push({
          week: `Sem ${4 - i}`,
          avgTime: Math.round(weekAvg * 10) / 10,
        });
      }

      // Distribuição por distro
      const distroColors: Record<string, string> = {
        'arch': 'hsl(195, 100%, 50%)',
        'cachyos': 'hsl(45, 100%, 50%)',
        'manjaro': 'hsl(280, 100%, 60%)',
        'endeavouros': 'hsl(340, 100%, 50%)',
        'garuda': 'hsl(160, 100%, 50%)',
      };

      const distroGroups: Record<string, number> = {};
      allMetrics.forEach(m => {
        const distro = (m.distro_family || 'unknown').toLowerCase();
        distroGroups[distro] = (distroGroups[distro] || 0) + 1;
      });

      const distroData = Object.entries(distroGroups)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((count / totalInstalls) * 100) || 0,
          color: distroColors[name] || 'hsl(0, 0%, 50%)',
        }))
        .sort((a, b) => b.value - a.value);

      // Distribuição por banco de dados
      const dbColors: Record<string, string> = {
        'sqlite': 'hsl(195, 80%, 45%)',
        'mariadb': 'hsl(160, 80%, 45%)',
        'postgresql': 'hsl(220, 80%, 55%)',
        'firebird': 'hsl(30, 80%, 50%)',
      };

      const dbGroups: Record<string, number> = {};
      allMetrics.forEach(m => {
        const db = (m.database_type || 'unknown').toLowerCase();
        dbGroups[db] = (dbGroups[db] || 0) + 1;
      });

      const databaseData = Object.entries(dbGroups)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((count / totalInstalls) * 100) || 0,
          color: dbColors[name] || 'hsl(0, 0%, 50%)',
        }))
        .sort((a, b) => b.value - a.value);

      // Tipos de erros
      const errorGroups: Record<string, number> = {};
      allMetrics.forEach(m => {
        const errors = m.errors as Array<{ code: string }> || [];
        errors.forEach(err => {
          const code = err.code || 'unknown';
          errorGroups[code] = (errorGroups[code] || 0) + 1;
        });
      });

      const totalErrors = Object.values(errorGroups).reduce((sum, count) => sum + count, 0);
      const errorTypes = Object.entries(errorGroups)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
          percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const aggregated: AggregatedMetrics = {
        totalInstalls,
        successRate: Math.round(successRate * 10) / 10,
        failureRate: Math.round(failureRate * 10) / 10,
        avgTimeMinutes: Math.round(avgTimeMinutes * 10) / 10,
        todayInstalls,
        weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
        installsByDay,
        installTimeHistory,
        distroData,
        databaseData,
        errorTypes,
      };

      console.log('[installer-metrics] Returning aggregated metrics:', {
        total: totalInstalls,
        success: successRate,
        period,
      });

      return new Response(
        JSON.stringify(aggregated),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[installer-metrics] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
