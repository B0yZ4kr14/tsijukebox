import { useState, useCallback, useEffect } from 'react';

export interface VoiceCommandHistoryEntry {
  id: string;
  timestamp: number;
  transcript: string;
  confidence: number;
  action: string | null;
  searchQuery?: string;
  matchedPattern?: string;
  success: boolean;
  processingTimeMs?: number;
}

export interface VoiceHistoryStats {
  totalCommands: number;
  successRate: number;
  averageConfidence: number;
  mostUsedCommands: { action: string; count: number }[];
  failedCommands: number;
  commandsToday: number;
  commandsThisWeek: number;
}

interface UseVoiceCommandHistoryReturn {
  history: VoiceCommandHistoryEntry[];
  stats: VoiceHistoryStats;
  addEntry: (entry: Omit<VoiceCommandHistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeEntry: (id: string) => void;
  exportAsJSON: () => string;
  exportAsCSV: () => string;
  getFilteredHistory: (filter: HistoryFilter) => VoiceCommandHistoryEntry[];
}

export interface HistoryFilter {
  startDate?: Date;
  endDate?: Date;
  action?: string;
  successOnly?: boolean;
  failedOnly?: boolean;
  minConfidence?: number;
}

const STORAGE_KEY = 'tsijukebox-voice-history';
const MAX_ENTRIES = 500;

function loadHistory(): VoiceCommandHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading voice history:', error);
  }
  return [];
}

function saveHistory(history: VoiceCommandHistoryEntry[]): void {
  try {
    // Keep only the last MAX_ENTRIES
    const trimmed = history.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving voice history:', error);
  }
}

export function useVoiceCommandHistory(): UseVoiceCommandHistoryReturn {
  const [history, setHistory] = useState<VoiceCommandHistoryEntry[]>(loadHistory);

  // Calculate stats
  const stats: VoiceHistoryStats = {
    totalCommands: history.length,
    successRate: history.length > 0 
      ? Math.round((history.filter(h => h.success).length / history.length) * 100)
      : 0,
    averageConfidence: history.length > 0
      ? Math.round((history.reduce((acc, h) => acc + h.confidence, 0) / history.length) * 100)
      : 0,
    mostUsedCommands: getMostUsedCommands(history),
    failedCommands: history.filter(h => !h.success).length,
    commandsToday: getCommandsInPeriod(history, 1),
    commandsThisWeek: getCommandsInPeriod(history, 7)
  };

  const addEntry = useCallback((entry: Omit<VoiceCommandHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: VoiceCommandHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setHistory(prev => {
      const updated = [...prev, newEntry];
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const exportAsJSON = useCallback((): string => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  const exportAsCSV = useCallback((): string => {
    const headers = ['timestamp', 'transcript', 'confidence', 'action', 'success', 'searchQuery', 'processingTimeMs'];
    const rows = history.map(h => [
      new Date(h.timestamp).toISOString(),
      `\"${h.transcript.replace(/\"/g, '\"\"')}\"`,
      (h.confidence * 100).toFixed(1),
      h.action || '',
      h.success ? 'true' : 'false',
      h.searchQuery || '',
      h.processingTimeMs?.toFixed(2) || ''
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }, [history]);

  const getFilteredHistory = useCallback((filter: HistoryFilter): VoiceCommandHistoryEntry[] => {
    return history.filter(entry => {
      if (filter.startDate && entry.timestamp < filter.startDate.getTime()) return false;
      if (filter.endDate && entry.timestamp > filter.endDate.getTime()) return false;
      if (filter.action && entry.action !== filter.action) return false;
      if (filter.successOnly && !entry.success) return false;
      if (filter.failedOnly && entry.success) return false;
      if (filter.minConfidence && entry.confidence < filter.minConfidence) return false;
      return true;
    });
  }, [history]);

  // Listen for voice command events and record them
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { action, transcript, searchQuery, confidence, success, processingTimeMs, matchedPattern } = event.detail;
      
      // Only add if this is a history event (has success property)
      if (typeof success === 'boolean') {
        addEntry({
          transcript,
          confidence,
          action,
          searchQuery,
          matchedPattern,
          success,
          processingTimeMs
        });
      }
    };

    window.addEventListener('voice-command-history', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voice-command-history', handleVoiceCommand as EventListener);
  }, [addEntry]);

  return {
    history,
    stats,
    addEntry,
    clearHistory,
    removeEntry,
    exportAsJSON,
    exportAsCSV,
    getFilteredHistory
  };
}

// Helper functions
function getMostUsedCommands(history: VoiceCommandHistoryEntry[]): { action: string; count: number }[] {
  const counts: Record<string, number> = {};
  history.forEach(h => {
    if (h.action) {
      counts[h.action] = (counts[h.action] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getCommandsInPeriod(history: VoiceCommandHistoryEntry[], days: number): number {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return history.filter(h => h.timestamp >= cutoff).length;
}
