import { useState, useCallback, useEffect } from 'react';

export type NormalizationMode = 'soft' | 'moderate' | 'aggressive';

export interface VolumeNormalizationSettings {
  enabled: boolean;
  mode: NormalizationMode;
  targetLoudness: number; // -23 to -6 LUFS
  peakLimit: number; // 0.9 to 1.0
}

interface NormalizationPreset {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
}

const PRESETS: Record<NormalizationMode, NormalizationPreset> = {
  soft: { threshold: -24, ratio: 2, attack: 0.05, release: 0.25, knee: 30 },
  moderate: { threshold: -18, ratio: 4, attack: 0.02, release: 0.2, knee: 20 },
  aggressive: { threshold: -12, ratio: 8, attack: 0.01, release: 0.15, knee: 10 },
};

const STORAGE_KEY = 'tsi_volume_normalization';

const defaultSettings: VolumeNormalizationSettings = {
  enabled: false,
  mode: 'moderate',
  targetLoudness: -14,
  peakLimit: 0.95,
};

function loadSettings(): VolumeNormalizationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultSettings;
}

function saveSettings(settings: VolumeNormalizationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    console.warn('Failed to save normalization settings');
  }
}

export function useVolumeNormalization() {
  const [settings, setSettingsState] = useState<VolumeNormalizationSettings>(loadSettings);
  const [currentLoudness, setCurrentLoudness] = useState<number>(-14);
  const [gainAdjustment, setGainAdjustment] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current preset
  const currentPreset = PRESETS[settings.mode];

  // Update settings
  const updateSettings = useCallback((partial: Partial<VolumeNormalizationSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...partial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  // Set mode
  const setMode = useCallback((mode: NormalizationMode) => {
    updateSettings({ mode });
  }, [updateSettings]);

  // Set target loudness
  const setTargetLoudness = useCallback((targetLoudness: number) => {
    const clamped = Math.max(-23, Math.min(-6, targetLoudness));
    updateSettings({ targetLoudness: clamped });
  }, [updateSettings]);

  // Set peak limit
  const setPeakLimit = useCallback((peakLimit: number) => {
    const clamped = Math.max(0.9, Math.min(1.0, peakLimit));
    updateSettings({ peakLimit: clamped });
  }, [updateSettings]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettingsState(defaultSettings);
    saveSettings(defaultSettings);
  }, []);

  // Calculate gain multiplier based on settings
  const gainMultiplier = settings.enabled
    ? Math.pow(10, gainAdjustment / 20)
    : 1;

  // Simulate loudness analysis (in production, this would use Web Audio API)
  useEffect(() => {
    if (!settings.enabled) {
      setIsProcessing(false);
      setGainAdjustment(0);
      return;
    }

    setIsProcessing(true);

    // Simulated loudness detection interval
    const interval = setInterval(() => {
      // In a real implementation, this would analyze audio via AnalyserNode
      const simulatedLoudness = -18 + Math.random() * 8 - 4;
      setCurrentLoudness(simulatedLoudness);

      // Calculate needed gain adjustment
      const adjustment = settings.targetLoudness - simulatedLoudness;
      const clampedAdjustment = Math.max(-12, Math.min(12, adjustment));
      setGainAdjustment(clampedAdjustment);
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsProcessing(false);
    };
  }, [settings.enabled, settings.targetLoudness]);

  return {
    settings,
    currentPreset,
    currentLoudness,
    gainAdjustment,
    gainMultiplier,
    isProcessing,
    updateSettings,
    toggleEnabled,
    setMode,
    setTargetLoudness,
    setPeakLimit,
    resetToDefaults,
  };
}
