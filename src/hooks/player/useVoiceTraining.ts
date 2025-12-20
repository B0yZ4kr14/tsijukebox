import { useState, useCallback, useRef } from 'react';
import { CustomVoiceCommand } from './useVoiceControl';

export interface VoiceTrainingSample {
  id: string;
  createdAt: number;
  transcript: string;
  targetAction: string;
  confidence: number;
  reviewed: boolean;
  approved: boolean;
}

export interface VoiceTrainingSession {
  id: string;
  startedAt: number;
  targetCommand: string;
  targetAction: string;
  samples: VoiceTrainingSample[];
  status: 'selecting' | 'recording' | 'reviewing' | 'completed';
  requiredSamples: number;
}

interface UseVoiceTrainingReturn {
  session: VoiceTrainingSession | null;
  isRecording: boolean;
  currentSampleIndex: number;
  savedPatterns: SavedTrainingPattern[];
  startSession: (targetAction: string, targetCommand: string) => void;
  recordSample: (transcript: string, confidence: number) => void;
  reviewSample: (sampleId: string, approved: boolean, editedTranscript?: string) => void;
  completeSession: () => CustomVoiceCommand | null;
  cancelSession: () => void;
  deleteSavedPattern: (id: string) => void;
  getTrainingStats: () => TrainingStats;
}

export interface SavedTrainingPattern {
  id: string;
  createdAt: number;
  action: string;
  commandName: string;
  patterns: string[];
  samplesCount: number;
  averageConfidence: number;
}

export interface TrainingStats {
  totalSessions: number;
  totalPatterns: number;
  totalSamples: number;
  averageConfidence: number;
  mostTrainedActions: { action: string; count: number }[];
}

const STORAGE_KEY = 'tsijukebox-voice-training';
const REQUIRED_SAMPLES = 3;

function loadSavedPatterns(): SavedTrainingPattern[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading training patterns:', error);
  }
  return [];
}

function savePatternsToStorage(patterns: SavedTrainingPattern[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch (error) {
    console.error('Error saving training patterns:', error);
  }
}

export function useVoiceTraining(): UseVoiceTrainingReturn {
  const [session, setSession] = useState<VoiceTrainingSession | null>(null);
  const [savedPatterns, setSavedPatterns] = useState<SavedTrainingPattern[]>(loadSavedPatterns);
  const [isRecording, setIsRecording] = useState(false);
  const sessionIdRef = useRef<string>('');

  const currentSampleIndex = session?.samples.length || 0;

  const startSession = useCallback((targetAction: string, targetCommand: string) => {
    const newSession: VoiceTrainingSession = {
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      targetCommand,
      targetAction,
      samples: [],
      status: 'recording',
      requiredSamples: REQUIRED_SAMPLES
    };
    
    sessionIdRef.current = newSession.id;
    setSession(newSession);
  }, []);

  const recordSample = useCallback((transcript: string, confidence: number) => {
    if (!session || session.status !== 'recording') return;

    const sample: VoiceTrainingSample = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      transcript: transcript.toLowerCase().trim(),
      targetAction: session.targetAction,
      confidence,
      reviewed: false,
      approved: true
    };

    setSession(prev => {
      if (!prev) return null;
      
      const updatedSamples = [...prev.samples, sample];
      const newStatus = updatedSamples.length >= prev.requiredSamples ? 'reviewing' : 'recording';
      
      return {
        ...prev,
        samples: updatedSamples,
        status: newStatus
      };
    });
  }, [session]);

  const reviewSample = useCallback((sampleId: string, approved: boolean, editedTranscript?: string) => {
    setSession(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        samples: prev.samples.map(s => 
          s.id === sampleId 
            ? { 
                ...s, 
                reviewed: true, 
                approved,
                transcript: editedTranscript || s.transcript 
              }
            : s
        )
      };
    });
  }, []);

  const completeSession = useCallback((): CustomVoiceCommand | null => {
    if (!session) return null;

    const approvedSamples = session.samples.filter(s => s.approved);
    
    if (approvedSamples.length === 0) {
      setSession(null);
      return null;
    }

    // Create patterns from approved samples
    const patterns = approvedSamples.map(s => {
      // Escape special regex characters and create pattern
      const escaped = s.transcript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return `\\b${escaped}\\b`;
    });

    // Calculate average confidence
    const avgConfidence = approvedSamples.reduce((acc, s) => acc + s.confidence, 0) / approvedSamples.length;

    // Save training pattern
    const savedPattern: SavedTrainingPattern = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      action: session.targetAction,
      commandName: session.targetCommand,
      patterns,
      samplesCount: approvedSamples.length,
      averageConfidence: avgConfidence
    };

    setSavedPatterns(prev => {
      const updated = [...prev, savedPattern];
      savePatternsToStorage(updated);
      return updated;
    });

    // Create custom command
    const customCommand: CustomVoiceCommand = {
      id: crypto.randomUUID(),
      name: `${session.targetCommand} (Treinado)`,
      patterns: approvedSamples.map(s => s.transcript),
      action: session.targetAction as CustomVoiceCommand['action'],
      enabled: true
    };

    // Update session status
    setSession(prev => prev ? { ...prev, status: 'completed' } : null);

    // Clear session after a delay
    setTimeout(() => setSession(null), 500);

    return customCommand;
  }, [session]);

  const cancelSession = useCallback(() => {
    setSession(null);
    setIsRecording(false);
  }, []);

  const deleteSavedPattern = useCallback((id: string) => {
    setSavedPatterns(prev => {
      const updated = prev.filter(p => p.id !== id);
      savePatternsToStorage(updated);
      return updated;
    });
  }, []);

  const getTrainingStats = useCallback((): TrainingStats => {
    const actionCounts: Record<string, number> = {};
    let totalSamples = 0;
    let totalConfidence = 0;

    savedPatterns.forEach(p => {
      actionCounts[p.action] = (actionCounts[p.action] || 0) + 1;
      totalSamples += p.samplesCount;
      totalConfidence += p.averageConfidence * p.samplesCount;
    });

    return {
      totalSessions: savedPatterns.length,
      totalPatterns: savedPatterns.reduce((acc, p) => acc + p.patterns.length, 0),
      totalSamples,
      averageConfidence: totalSamples > 0 ? Math.round((totalConfidence / totalSamples) * 100) : 0,
      mostTrainedActions: Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  }, [savedPatterns]);

  return {
    session,
    isRecording,
    currentSampleIndex,
    savedPatterns,
    startSession,
    recordSample,
    reviewSample,
    completeSession,
    cancelSession,
    deleteSavedPattern,
    getTrainingStats
  };
}
