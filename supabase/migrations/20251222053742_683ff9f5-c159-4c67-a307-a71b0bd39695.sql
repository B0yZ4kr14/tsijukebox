-- Tabela para monitorar kiosks conectados via webhook
CREATE TABLE public.kiosk_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostname TEXT NOT NULL,
    machine_id TEXT UNIQUE,
    ip_address TEXT,
    status TEXT DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'error', 'recovering', 'unknown')),
    last_heartbeat TIMESTAMPTZ,
    last_event TEXT,
    last_event_at TIMESTAMPTZ,
    install_id UUID REFERENCES public.installer_metrics(id) ON DELETE SET NULL,
    config JSONB DEFAULT '{}',
    events JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    uptime_seconds INTEGER DEFAULT 0,
    crash_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_kiosk_connections_status ON public.kiosk_connections(status);
CREATE INDEX idx_kiosk_connections_last_heartbeat ON public.kiosk_connections(last_heartbeat);
CREATE INDEX idx_kiosk_connections_machine_id ON public.kiosk_connections(machine_id);

-- Habilitar RLS
ALTER TABLE public.kiosk_connections ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Allow public read kiosk_connections"
    ON public.kiosk_connections
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert kiosk_connections"
    ON public.kiosk_connections
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update kiosk_connections"
    ON public.kiosk_connections
    FOR UPDATE
    USING (true);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosk_connections;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_kiosk_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_kiosk_connections_updated_at
    BEFORE UPDATE ON public.kiosk_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_kiosk_connection_timestamp();