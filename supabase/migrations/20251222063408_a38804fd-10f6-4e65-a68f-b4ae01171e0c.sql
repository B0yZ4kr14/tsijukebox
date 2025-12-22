-- =============================================
-- TABELA DE LOGS DE AUDITORIA
-- =============================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Quem executou a ação
    actor_id UUID,
    actor_email TEXT,
    actor_role TEXT,
    
    -- O que aconteceu
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    
    -- Contexto
    target_type TEXT,
    target_id TEXT,
    target_name TEXT,
    
    -- Detalhes
    details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ler logs de auditoria
CREATE POLICY "Admins can read audit_logs" 
ON public.audit_logs
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Política: Sistema pode inserir logs (via service_role ou anônimo para edge functions)
CREATE POLICY "System can insert audit_logs" 
ON public.audit_logs
FOR INSERT 
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);

-- Habilitar realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- Comentário na tabela
COMMENT ON TABLE public.audit_logs IS 'Registro de auditoria para rastrear ações administrativas e comandos de kiosk';