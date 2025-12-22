import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KioskConnection {
  id: string;
  hostname: string;
  machine_id: string;
  ip_address: string | null;
  status: 'online' | 'offline' | 'error' | 'recovering' | 'unknown';
  last_heartbeat: string | null;
  last_event: string | null;
  last_event_at: string | null;
  install_id: string | null;
  config: Record<string, unknown>;
  events: Array<{
    event: string;
    timestamp: string;
    details?: Record<string, unknown>;
  }>;
  metrics: Record<string, unknown>;
  uptime_seconds: number;
  crash_count: number;
  created_at: string;
  updated_at: string;
}

export interface KioskMetrics {
  total: number;
  online: number;
  offline: number;
  error: number;
  total_uptime_hours: number;
  total_crashes: number;
}

export function useKioskMonitor() {
  const [kiosks, setKiosks] = useState<KioskConnection[]>([]);
  const [metrics, setMetrics] = useState<KioskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  // Fetch all kiosks
  const fetchKiosks = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('kiosk-webhook/status', {
        method: 'GET',
      });

      if (fetchError) throw fetchError;

      if (data?.kiosks) {
        setKiosks(data.kiosks);
        
        // Calculate metrics
        const now = new Date();
        let online = 0;
        let offline = 0;
        let errorCount = 0;
        let totalUptime = 0;
        let totalCrashes = 0;

        data.kiosks.forEach((kiosk: KioskConnection) => {
          if (kiosk.last_heartbeat) {
            const lastHeartbeat = new Date(kiosk.last_heartbeat);
            const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 60000;
            
            if (diffMinutes <= 2) {
              online++;
            } else {
              offline++;
            }
          } else {
            offline++;
          }
          
          if (kiosk.status === 'error') errorCount++;
          totalUptime += kiosk.uptime_seconds || 0;
          totalCrashes += kiosk.crash_count || 0;
        });

        setMetrics({
          total: data.kiosks.length,
          online,
          offline,
          error: errorCount,
          total_uptime_hours: Math.round(totalUptime / 3600),
          total_crashes: totalCrashes,
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching kiosks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch kiosks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    fetchKiosks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('kiosk-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kiosk_connections',
        },
        (payload) => {
          console.log('Kiosk connection change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setKiosks(prev => [payload.new as KioskConnection, ...prev]);
            toast({
              title: 'Novo Kiosk Conectado',
              description: `${(payload.new as KioskConnection).hostname} está online`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setKiosks(prev => 
              prev.map(k => k.id === (payload.new as KioskConnection).id ? payload.new as KioskConnection : k)
            );
            
            // Notify on status changes
            const oldStatus = (payload.old as KioskConnection)?.status;
            const newStatus = (payload.new as KioskConnection).status;
            
            if (oldStatus !== newStatus) {
              if (newStatus === 'error' || newStatus === 'offline') {
                toast({
                  title: 'Kiosk Offline',
                  description: `${(payload.new as KioskConnection).hostname} está ${newStatus}`,
                  variant: 'destructive',
                });
              } else if (newStatus === 'online' && oldStatus !== 'online') {
                toast({
                  title: 'Kiosk Online',
                  description: `${(payload.new as KioskConnection).hostname} está online novamente`,
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setKiosks(prev => prev.filter(k => k.id !== (payload.old as KioskConnection).id));
          }
        }
      )
      .subscribe();

    // Poll every 30 seconds as fallback
    const pollInterval = setInterval(fetchKiosks, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [fetchKiosks, toast]);

  // Get time since last heartbeat
  const getTimeSinceHeartbeat = useCallback((lastHeartbeat: string | null): string => {
    if (!lastHeartbeat) return 'Nunca';
    
    const now = new Date();
    const last = new Date(lastHeartbeat);
    const diffSeconds = Math.floor((now.getTime() - last.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s atrás`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m atrás`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h atrás`;
    return `${Math.floor(diffSeconds / 86400)}d atrás`;
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: KioskConnection['status']): string => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'error': return 'text-red-600';
      case 'recovering': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: KioskConnection['status']): string => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'error': return '❌';
      case 'recovering': return '🟡';
      default: return '⚪';
    }
  }, []);

  // Format uptime
  const formatUptime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }, []);

  return {
    kiosks,
    metrics,
    isLoading,
    error,
    refetch: fetchKiosks,
    getTimeSinceHeartbeat,
    getStatusColor,
    getStatusIcon,
    formatUptime,
  };
}
