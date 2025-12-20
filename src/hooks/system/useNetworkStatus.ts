import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
  connectionType: string | null;
  downlink: number | null;
  rtt: number | null;
}

interface UseNetworkStatusResult extends NetworkState {
  checkConnection: () => Promise<boolean>;
}

// Extended Navigator type for Network Information API
interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

export function useNetworkStatus(): UseNetworkStatusResult {
  const [state, setState] = useState<NetworkState>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineAt: null,
    lastOfflineAt: null,
    connectionType: null,
    downlink: null,
    rtt: null,
  }));

  const wasOfflineTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get network connection info
  const getConnectionInfo = useCallback(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      return {
        connectionType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
      };
    }
    
    return { connectionType: null, downlink: null, rtt: null };
  }, []);

  // Manual connection check with exponential backoff
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Use a small request to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      const connectionInfo = getConnectionInfo();
      
      setState(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: new Date(),
        ...connectionInfo,
      }));

      // Clear any existing timeout
      if (wasOfflineTimeoutRef.current) {
        clearTimeout(wasOfflineTimeoutRef.current);
      }

      // Show reconnected state briefly (3 seconds)
      wasOfflineTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, wasOffline: false }));
      }, 3000);
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
        lastOfflineAt: new Date(),
        connectionType: null,
        downlink: null,
        rtt: null,
      }));
    };

    const handleConnectionChange = () => {
      const connectionInfo = getConnectionInfo();
      setState(prev => ({
        ...prev,
        ...connectionInfo,
      }));
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (Network Information API)
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
      // Initialize connection info
      handleConnectionChange();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      if (wasOfflineTimeoutRef.current) {
        clearTimeout(wasOfflineTimeoutRef.current);
      }
    };
  }, [getConnectionInfo]);

  return {
    ...state,
    checkConnection,
  };
}
