import { useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

export function useConnectionMonitor() {
  const { isDemoMode, apiUrl } = useSettings();
  const lastStatusRef = useRef<'online' | 'offline'>('online');
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission;
      });
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
    }
  }, []);

  // Monitor backend connection
  useEffect(() => {
    if (isDemoMode) return;

    const sendNotification = (title: string, body: string) => {
      if (notificationPermissionRef.current === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/pwa-192x192.png',
            tag: 'connection-status',
          });
        } catch (e) {
          // Notification API may not be available in some contexts
          if (import.meta.env.DEV) console.log('Notification failed:', e);
        }
      }
    };

    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok && lastStatusRef.current === 'offline') {
          // Connection restored
          lastStatusRef.current = 'online';
          toast.success('Conexão com o servidor restaurada', {
            icon: '✅',
            duration: 4000,
          });
          sendNotification('TSiJUKEBOX', '✅ Conexão com o servidor restaurada');
        } else if (response.ok) {
          lastStatusRef.current = 'online';
        }
      } catch {
        if (lastStatusRef.current === 'online') {
          // Connection lost
          lastStatusRef.current = 'offline';
          toast.error('Conexão com o servidor perdida', {
            icon: '❌',
            duration: 6000,
            description: 'Tentando reconectar automaticamente...',
          });
          sendNotification('TSiJUKEBOX', '❌ Conexão com o servidor perdida!');
        }
      }
    };

    // Initial check after a short delay
    const initialTimeout = setTimeout(checkConnection, 2000);
    
    // Periodic checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [apiUrl, isDemoMode]);

  return {
    isOnline: lastStatusRef.current === 'online',
  };
}
