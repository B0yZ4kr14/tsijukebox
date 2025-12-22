-- Create sync_history table for tracking all GitHub synchronizations
CREATE TABLE public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_sha TEXT NOT NULL,
  commit_url TEXT,
  commit_message TEXT,
  branch TEXT DEFAULT 'main',
  files_synced INTEGER DEFAULT 0,
  files_skipped INTEGER DEFAULT 0,
  synced_files JSONB DEFAULT '[]',
  skipped_files JSONB DEFAULT '[]',
  sync_type TEXT DEFAULT 'manual',
  sync_source TEXT,
  duration_ms INTEGER,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: only admins can read/manage sync history
CREATE POLICY "Admins can read sync_history"
ON public.sync_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert sync_history"
ON public.sync_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete sync_history"
ON public.sync_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE sync_history;

-- Create index for faster queries
CREATE INDEX idx_sync_history_created_at ON public.sync_history(created_at DESC);
CREATE INDEX idx_sync_history_status ON public.sync_history(status);