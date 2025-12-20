-- Create jam_reactions table for real-time emoji reactions
CREATE TABLE public.jam_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.jam_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.jam_participants(id) ON DELETE CASCADE,
  participant_nickname TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('🔥', '👏', '❤️', '😂', '🎵', '💯')),
  track_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_jam_reactions_session ON public.jam_reactions(session_id);
CREATE INDEX idx_jam_reactions_created ON public.jam_reactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.jam_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read reactions" ON public.jam_reactions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can add reactions" ON public.jam_reactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete old reactions" ON public.jam_reactions
  FOR DELETE USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.jam_reactions;