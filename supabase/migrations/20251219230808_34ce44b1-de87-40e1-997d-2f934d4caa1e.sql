-- Tabela de estatísticas de reprodução
CREATE TABLE public.playback_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_art TEXT,
  provider TEXT NOT NULL DEFAULT 'spotify',
  duration_ms INTEGER,
  played_at TIMESTAMPTZ DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas de estatísticas
CREATE INDEX idx_playback_stats_played_at ON public.playback_stats(played_at);
CREATE INDEX idx_playback_stats_artist ON public.playback_stats(artist_name);
CREATE INDEX idx_playback_stats_provider ON public.playback_stats(provider);
CREATE INDEX idx_playback_stats_track_id ON public.playback_stats(track_id);

-- Habilitar RLS
ALTER TABLE public.playback_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para jukebox público (leitura e inserção liberadas)
CREATE POLICY "Allow public read playback_stats" ON public.playback_stats
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert playback_stats" ON public.playback_stats
  FOR INSERT WITH CHECK (true);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.playback_stats;