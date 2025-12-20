-- Create table for code scan history
CREATE TABLE public.code_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  issues JSONB NOT NULL DEFAULT '[]',
  issues_count INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_scan_history ENABLE ROW LEVEL SECURITY;

-- Policy for public read
CREATE POLICY "Allow public read code_scan_history"
  ON public.code_scan_history FOR SELECT USING (true);

-- Policy for public insert
CREATE POLICY "Allow public insert code_scan_history"
  ON public.code_scan_history FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_code_scan_history_file ON public.code_scan_history(file_name);
CREATE INDEX idx_code_scan_history_date ON public.code_scan_history(scanned_at DESC);
CREATE INDEX idx_code_scan_history_score ON public.code_scan_history(score);