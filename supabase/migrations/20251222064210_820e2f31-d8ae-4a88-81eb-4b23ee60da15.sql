-- Corrigir policy de notifications para remover acesso anônimo a notificações do sistema
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin')
  );

-- Adicionar DELETE para jam_sessions (permitir limpeza por host ou admin)
CREATE POLICY "Host or admin can delete sessions" ON public.jam_sessions
  FOR DELETE USING (
    host_id IS NULL 
    OR host_id = auth.uid() 
    OR has_role(auth.uid(), 'admin')
  );

-- Adicionar UPDATE para playback_stats (correção de dados por admin)
CREATE POLICY "Admins can update playback_stats" ON public.playback_stats
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Adicionar UPDATE e DELETE para code_scan_history
CREATE POLICY "Admins can update code_scan_history" ON public.code_scan_history
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete code_scan_history" ON public.code_scan_history
  FOR DELETE USING (has_role(auth.uid(), 'admin'));