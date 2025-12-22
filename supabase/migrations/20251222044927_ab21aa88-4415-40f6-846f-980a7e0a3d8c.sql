-- Create pending_sync_files table for auto-sync system
CREATE TABLE public.pending_sync_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_hash TEXT,
  category TEXT DEFAULT 'other',
  priority INTEGER DEFAULT 10,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  UNIQUE(file_path)
);

-- Add comments
COMMENT ON TABLE public.pending_sync_files IS 'Tracks files pending synchronization to GitHub';
COMMENT ON COLUMN public.pending_sync_files.status IS 'pending, syncing, synced, error';
COMMENT ON COLUMN public.pending_sync_files.category IS 'critical, important, docs, config, other';

-- Enable RLS
ALTER TABLE public.pending_sync_files ENABLE ROW LEVEL SECURITY;

-- RLS policies - public access for this system table
CREATE POLICY "Allow public read pending_sync_files"
ON public.pending_sync_files FOR SELECT
USING (true);

CREATE POLICY "Allow public insert pending_sync_files"
ON public.pending_sync_files FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update pending_sync_files"
ON public.pending_sync_files FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete pending_sync_files"
ON public.pending_sync_files FOR DELETE
USING (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_sync_files;