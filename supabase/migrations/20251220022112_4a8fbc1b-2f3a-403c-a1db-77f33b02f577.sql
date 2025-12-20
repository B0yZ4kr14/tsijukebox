-- Criar tabela para métricas de instalação
CREATE TABLE public.installer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_duration_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  distro_family TEXT,
  distro_name TEXT,
  install_mode TEXT CHECK (install_mode IN ('full', 'minimal', 'custom', 'update')),
  database_type TEXT CHECK (database_type IN ('sqlite', 'mariadb', 'postgresql', 'firebird')),
  steps JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  installer_version TEXT,
  system_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries agregadas
CREATE INDEX idx_installer_metrics_started ON public.installer_metrics(started_at);
CREATE INDEX idx_installer_metrics_status ON public.installer_metrics(status);
CREATE INDEX idx_installer_metrics_distro ON public.installer_metrics(distro_family);
CREATE INDEX idx_installer_metrics_session ON public.installer_metrics(session_id);

-- Comentários
COMMENT ON TABLE public.installer_metrics IS 'Métricas anônimas de instalação do TSiJUKEBOX';
COMMENT ON COLUMN public.installer_metrics.session_id IS 'ID único da sessão de instalação';
COMMENT ON COLUMN public.installer_metrics.steps IS 'Array de etapas completadas com tempo';
COMMENT ON COLUMN public.installer_metrics.errors IS 'Array de erros ocorridos durante instalação';

-- Enable RLS
ALTER TABLE public.installer_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Insert público (analytics.py é anônimo)
CREATE POLICY "Allow anonymous insert installer_metrics" 
ON public.installer_metrics
FOR INSERT 
WITH CHECK (true);

-- Policy: Select público (dashboard de métricas é público)
CREATE POLICY "Allow public read installer_metrics" 
ON public.installer_metrics
FOR SELECT 
USING (true);

-- Policy: Update para atualizar status de instalação em andamento
CREATE POLICY "Allow update by session_id" 
ON public.installer_metrics
FOR UPDATE 
USING (true);