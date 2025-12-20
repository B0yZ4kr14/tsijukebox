import { useEffect, useRef, useCallback, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

// Configuration for exponential backoff
const BACKOFF_CONFIG = {
  initialDelayMs: 2000,
  maxDelayMs: 60000,
  multiplier: 2,
  checkIntervalMs: 30000,
};

type ConnectionStatus = 'online' | 'offline' | 'checking' | 'reconnecting';

interface UseConnectionMonitorResult {
  isOnline: boolean;
  status: ConnectionStatus;
  lastCheckAt: Date | null;
  consecutiveFailures: number;
  forceCheck: () => Promise<boolean>;
}

export function useConnectionMonitor(): UseConnectionMonitorResult {
  const { isDemoMode, apiUrl } = useSettings();
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastCheckAt, setLastCheckAt] = useState<Date | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  
  const lastStatusRef = useRef<'online' | 'offline'>('online');
  const notificationPermissionRef = useRef<NotificationPermission>('default');
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backoffDelayRef = useRef(BACKOFF_CONFIG.initialDelayMs);

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

  // Send desktop notification
  const sendNotification = useCallback((title: string, body: string) => {
    if (notificationPermissionRef.current === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          tag: 'connection-status',
          requireInteraction: false,
        });
      } catch (e) {
        if (import.meta.env.DEV) console.log('Notification failed:', e);
      }
    }
  }, []);

  // Check connection with exponential backoff on failure
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (isDemoMode) return true;
    
    setStatus('checking');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${apiUrl}/health`, { 
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // Connection successful
        const wasOffline = lastStatusRef.current === 'offline';
        lastStatusRef.current = 'online';
        setStatus('online');
        setLastCheckAt(new Date());
        setConsecutiveFailures(0);
        backoffDelayRef.current = BACKOFF_CONFIG.initialDelayMs;
        
        if (wasOffline) {
          toast.success('Conexão com o servidor restaurada', {
            icon: '✅',
            duration: 4000,
          });
          sendNotification('TSiJUKEBOX', '✅ Conexão com o servidor restaurada');
        }
        
        return true;
      }
      
      throw new Error('Response not OK');
    } catch {
      // Connection failed
      const wasOnline = lastStatusRef.current === 'online';
      lastStatusRef.current = 'offline';
      setLastCheckAt(new Date());
      setConsecutiveFailures(prev => prev + 1);
      
      // Calculate next backoff delay
      backoffDelayRef.current = Math.min(
        backoffDelayRef.current * BACKOFF_CONFIG.multiplier,
        BACKOFF_CONFIG.maxDelayMs
      );
      
      if (wasOnline) {
        setStatus('offline');
        toast.error('Conexão com o servidor perdida', {
          icon: '❌',
          duration: 6000,
          description: 'Tentando reconectar automaticamente...',
        });
        sendNotification('TSiJUKEBOX', '❌ Conexão com o servidor perdida!');
      } else {
        setStatus('reconnecting');
      }
      
      return false;
    }
  }, [apiUrl, isDemoMode, sendNotification]);

  // Force immediate check
  const forceCheck = useCallback(async (): Promise<boolean> => {
    backoffDelayRef.current = BACKOFF_CONFIG.initialDelayMs;
    return checkConnection();
  }, [checkConnection]);

  // Monitor backend connection
  useEffect(() => {
    if (isDemoMode) {
      setStatus('online');
      return;
    }

    // Initial check after a short delay
    const initialTimeout = setTimeout(checkConnection, BACKOFF_CONFIG.initialDelayMs);
    
    // Periodic checks
    checkIntervalRef.current = setInterval(() => {
      // Use backoff delay if we're offline
      if (lastStatusRef.current === 'offline') {
        // Check with exponential backoff
        checkConnection();
      } else {
        // Normal interval check
        checkConnection();
      }
    }, BACKOFF_CONFIG.checkIntervalMs);

    return () => {
      clearTimeout(initialTimeout);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [apiUrl, isDemoMode, checkConnection]);

  return {
    isOnline: status === 'online',
    status,
    lastCheckAt,
    consecutiveFailures,
    forceCheck,
  };
}
