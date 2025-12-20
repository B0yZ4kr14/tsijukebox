-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'critical_issue', 'scan_complete', 'task_complete', 'refactor_ready'
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for public read
CREATE POLICY "Allow public read notifications" 
  ON public.notifications FOR SELECT USING (true);

-- Policy for public insert
CREATE POLICY "Allow public insert notifications" 
  ON public.notifications FOR INSERT WITH CHECK (true);

-- Policy for public update (to mark as read)
CREATE POLICY "Allow public update notifications" 
  ON public.notifications FOR UPDATE USING (true);

-- Policy for public delete
CREATE POLICY "Allow public delete notifications" 
  ON public.notifications FOR DELETE USING (true);

-- Index for faster queries
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_severity ON public.notifications(severity);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;