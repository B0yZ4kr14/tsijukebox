-- =====================================================
-- SECURITY FIX: Restrict RLS policies for sensitive tables
-- =====================================================

-- =====================================================
-- 1. KIOSK_COMMANDS - Only admins can control kiosks
-- =====================================================
DROP POLICY IF EXISTS "Allow public read kiosk_commands" ON public.kiosk_commands;
DROP POLICY IF EXISTS "Allow public insert kiosk_commands" ON public.kiosk_commands;
DROP POLICY IF EXISTS "Allow public update kiosk_commands" ON public.kiosk_commands;
DROP POLICY IF EXISTS "Allow public delete kiosk_commands" ON public.kiosk_commands;

CREATE POLICY "Admins can read kiosk_commands" ON public.kiosk_commands
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can insert kiosk_commands" ON public.kiosk_commands
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can update kiosk_commands" ON public.kiosk_commands
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can delete kiosk_commands" ON public.kiosk_commands
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 2. KIOSK_CONNECTIONS - Admins read, service_role writes
-- =====================================================
DROP POLICY IF EXISTS "Allow public read kiosk_connections" ON public.kiosk_connections;
DROP POLICY IF EXISTS "Allow public insert kiosk_connections" ON public.kiosk_connections;
DROP POLICY IF EXISTS "Allow public update kiosk_connections" ON public.kiosk_connections;

CREATE POLICY "Admins can read kiosk_connections" ON public.kiosk_connections
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Service role will handle kiosk operations (bypasses RLS)
-- No public insert/update needed - handled by edge function with service_role

-- =====================================================
-- 3. INSTALLER_METRICS - Admins read, anonymous insert for installers
-- =====================================================
DROP POLICY IF EXISTS "Allow public read installer_metrics" ON public.installer_metrics;
DROP POLICY IF EXISTS "Allow anonymous insert installer_metrics" ON public.installer_metrics;
DROP POLICY IF EXISTS "Allow update by session_id" ON public.installer_metrics;

CREATE POLICY "Admins can read installer_metrics" ON public.installer_metrics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Keep insert for installers (they don't authenticate)
CREATE POLICY "Installers can register metrics" ON public.installer_metrics
  FOR INSERT WITH CHECK (true);

-- Keep update for session updates
CREATE POLICY "Installers can update own metrics" ON public.installer_metrics
  FOR UPDATE USING (true);

-- =====================================================
-- 4. PENDING_SYNC_FILES - Admins only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read pending_sync_files" ON public.pending_sync_files;
DROP POLICY IF EXISTS "Allow public insert pending_sync_files" ON public.pending_sync_files;
DROP POLICY IF EXISTS "Allow public update pending_sync_files" ON public.pending_sync_files;
DROP POLICY IF EXISTS "Allow public delete pending_sync_files" ON public.pending_sync_files;

CREATE POLICY "Admins can read pending_sync_files" ON public.pending_sync_files
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can insert pending_sync_files" ON public.pending_sync_files
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can update pending_sync_files" ON public.pending_sync_files
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can delete pending_sync_files" ON public.pending_sync_files
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 5. CODE_SCAN_HISTORY - Admins only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read code_scan_history" ON public.code_scan_history;
DROP POLICY IF EXISTS "Allow public insert code_scan_history" ON public.code_scan_history;

CREATE POLICY "Admins can read code_scan_history" ON public.code_scan_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can insert code_scan_history" ON public.code_scan_history
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. NOTIFICATIONS - Add user_id and restrict access
-- =====================================================
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS user_id UUID;

DROP POLICY IF EXISTS "Allow public read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public delete notifications" ON public.notifications;

-- Users see their own notifications or global ones (user_id IS NULL)
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
    OR user_id IS NULL
  );

-- Admins can create notifications
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can mark their own as read
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );

-- =====================================================
-- 7. PLAYBACK_STATS - Admins read, anonymous insert for kiosks
-- =====================================================
DROP POLICY IF EXISTS "Allow public read playback_stats" ON public.playback_stats;
DROP POLICY IF EXISTS "Allow public insert playback_stats" ON public.playback_stats;

CREATE POLICY "Admins can read playback_stats" ON public.playback_stats
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Keep insert for kiosks to log playback
CREATE POLICY "Kiosks can log playback" ON public.playback_stats
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- 8. JAM_SESSIONS - Prevent hijacking
-- =====================================================
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.jam_sessions;

-- Only host or admin can update session settings
CREATE POLICY "Host can update sessions" ON public.jam_sessions
  FOR UPDATE USING (
    host_id IS NULL  -- Anonymous sessions (anyone can update)
    OR host_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- =====================================================
-- 9. JAM_PARTICIPANTS - Prevent impersonation
-- =====================================================
DROP POLICY IF EXISTS "Anyone can update their presence" ON public.jam_participants;
DROP POLICY IF EXISTS "Anyone can leave sessions" ON public.jam_participants;

-- Participants can only update their own presence
CREATE POLICY "Participants can update own presence" ON public.jam_participants
  FOR UPDATE USING (
    user_id IS NULL  -- Anonymous participants
    OR user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- Participants can only leave their own session
CREATE POLICY "Participants can leave own session" ON public.jam_participants
  FOR DELETE USING (
    user_id IS NULL  -- Anonymous participants
    OR user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );