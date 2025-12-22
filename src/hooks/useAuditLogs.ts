import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  target_type: string | null;
  target_id: string | null;
  target_name: string | null;
  details: Record<string, unknown>;
  metadata: Record<string, unknown>;
  status: 'success' | 'failure' | 'pending';
  error_message: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  category?: string;
  action?: string;
  severity?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export function useAuditLogs(initialFilters?: AuditLogFilters) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters || {});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchLogs = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentPage = reset ? 0 : page;
      if (reset) setPage(0);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.targetId) {
        query = query.eq('target_id', filters.targetId);
      }
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }
      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,target_name.ilike.%${filters.search}%,actor_email.ilike.%${filters.search}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const typedData = (data || []) as AuditLog[];
      
      if (reset) {
        setLogs(typedData);
      } else {
        setLogs(prev => [...prev, ...typedData]);
      }
      
      setHasMore(typedData.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar logs');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, toast]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  const updateFilters = useCallback((newFilters: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  // Buscar logs quando filtros mudam
  useEffect(() => {
    fetchLogs(true);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Buscar mais logs quando página muda
  useEffect(() => {
    if (page > 0) {
      fetchLogs(false);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Configurar realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('audit_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        (payload) => {
          const newLog = payload.new as AuditLog;
          setLogs(prev => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Estatísticas
  const stats = {
    total: logs.length,
    byCategory: logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    logs,
    isLoading,
    error,
    filters,
    hasMore,
    stats,
    fetchLogs: () => fetchLogs(true),
    loadMore,
    updateFilters,
    clearFilters,
  };
}

// Hook para registrar logs de auditoria no frontend
export function useLogAudit() {
  const logAudit = useCallback(async (data: {
    action: string;
    category: string;
    severity?: 'info' | 'warning' | 'critical';
    target_type?: string;
    target_id?: string;
    target_name?: string;
    details?: Json;
    status?: 'success' | 'failure' | 'pending';
    error_message?: string;
  }) => {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('audit_logs').insert([{
        actor_id: user?.id,
        actor_email: user?.email,
        action: data.action,
        category: data.category,
        severity: data.severity || 'info',
        target_type: data.target_type,
        target_id: data.target_id,
        target_name: data.target_name,
        details: data.details || {},
        status: data.status || 'success',
        error_message: data.error_message,
      }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error logging audit:', err);
    }
  }, []);

  return { logAudit };
}