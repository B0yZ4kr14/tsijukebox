import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseFailureRateAlertOptions {
  threshold?: number; // Default 10%
  cooldownMinutes?: number; // Default 5 minutes
  autoCheck?: boolean;
}

interface UseFailureRateAlertReturn {
  failureRate: number;
  threshold: number;
  isAlertActive: boolean;
  lastAlertTime: Date | null;
  cooldownRemaining: number; // seconds
  acknowledgeAlert: () => void;
  checkFailureRate: (rate: number) => void;
  resetAlert: () => void;
}

const STORAGE_KEY = 'installer_failure_alert_state';

interface StoredAlertState {
  acknowledged: boolean;
  lastAlertTime: string | null;
  acknowledgedUntil: string | null;
}

export function useFailureRateAlert(
  options: UseFailureRateAlertOptions = {}
): UseFailureRateAlertReturn {
  const {
    threshold = 10,
    cooldownMinutes = 5,
    autoCheck = true,
  } = options;

  const [failureRate, setFailureRate] = useState(0);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: StoredAlertState = JSON.parse(stored);
        if (state.lastAlertTime) {
          setLastAlertTime(new Date(state.lastAlertTime));
        }
        if (state.acknowledgedUntil) {
          const until = new Date(state.acknowledgedUntil);
          if (until > new Date()) {
            setIsAcknowledged(true);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback((state: Partial<StoredAlertState>) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const existing: StoredAlertState = current 
        ? JSON.parse(current) 
        : { acknowledged: false, lastAlertTime: null, acknowledgedUntil: null };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...state }));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Update cooldown timer
  useEffect(() => {
    if (!lastAlertTime) return;

    const updateCooldown = () => {
      const now = new Date();
      const cooldownEnd = new Date(lastAlertTime.getTime() + cooldownMinutes * 60 * 1000);
      const remaining = Math.max(0, Math.floor((cooldownEnd.getTime() - now.getTime()) / 1000));
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastAlertTime, cooldownMinutes]);

  // Check failure rate and trigger alert
  const checkFailureRate = useCallback((rate: number) => {
    setFailureRate(rate);

    if (rate <= threshold) {
      setIsAlertActive(false);
      return;
    }

    // Rate exceeds threshold
    setIsAlertActive(true);

    // Check if we should show alert
    if (isAcknowledged) return;
    
    // Check cooldown
    if (lastAlertTime) {
      const cooldownEnd = new Date(lastAlertTime.getTime() + cooldownMinutes * 60 * 1000);
      if (new Date() < cooldownEnd) return;
    }

    // Trigger alert
    const now = new Date();
    setLastAlertTime(now);
    saveState({ lastAlertTime: now.toISOString() });

    toast.error(
      `⚠️ Taxa de falha crítica: ${rate.toFixed(1)}%`,
      {
        description: `A taxa de falha de instalação ultrapassou ${threshold}%. Verifique os logs de erro.`,
        duration: 10000,
        action: {
          label: 'Ver métricas',
          onClick: () => {
            window.location.href = '/installer-metrics';
          },
        },
      }
    );
  }, [threshold, cooldownMinutes, isAcknowledged, lastAlertTime, saveState]);

  // Acknowledge alert (suppress for 1 hour)
  const acknowledgeAlert = useCallback(() => {
    setIsAcknowledged(true);
    const until = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    saveState({ 
      acknowledged: true, 
      acknowledgedUntil: until.toISOString() 
    });
    toast.info('Alerta reconhecido. Novos alertas suprimidos por 1 hora.');
  }, [saveState]);

  // Reset alert state
  const resetAlert = useCallback(() => {
    setIsAcknowledged(false);
    setIsAlertActive(false);
    setLastAlertTime(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Estado de alerta resetado.');
  }, []);

  return {
    failureRate,
    threshold,
    isAlertActive,
    lastAlertTime,
    cooldownRemaining,
    acknowledgeAlert,
    checkFailureRate,
    resetAlert,
  };
}
