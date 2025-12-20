import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'critical_issue' | 'scan_complete' | 'task_complete' | 'refactor_ready';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setNotifications((data as Notification[]) || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (updateError) throw updateError;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  const clearNotification = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error clearing notification:', err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const ids = notifications.map(n => n.id);
      
      if (ids.length === 0) return;

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      setNotifications([]);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  }, [notifications]);

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          console.log('New notification received:', newNotification);

          // Add to state
          setNotifications(prev => [newNotification, ...prev]);

          // Show toast for critical notifications
          if (newNotification.severity === 'critical') {
            toast.error(newNotification.title, {
              description: newNotification.message,
              duration: 10000,
            });
          } else if (newNotification.severity === 'warning') {
            toast.warning(newNotification.title, {
              description: newNotification.message,
              duration: 5000,
            });
          } else {
            toast.info(newNotification.title, {
              description: newNotification.message,
              duration: 3000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications(prev =>
            prev.map(n => (n.id === updated.id ? updated : n))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setNotifications(prev => prev.filter(n => n.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    refetch: fetchNotifications,
  };
}
