import { useState, useEffect, useCallback, useRef } from 'react';

export type VoiceLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export interface CustomVoiceCommand {
  id: string;
  name: string;
  patterns: string[];
  action: 'play' | 'pause' | 'next' | 'previous' | 'volume' | 'search' | 'shuffle' | 'repeat' | 'mute' | 'custom';
  customAction?: string;
  enabled: boolean;
}

export interface VoiceControlSettings {
  enabled: boolean;
  language: VoiceLanguage;
  continuousListening: boolean;
  wakeWord: string;
  // Sensitivity settings
  minConfidenceThreshold: number;
  noiseReduction: boolean;
  silenceTimeout: number;
  autoStopAfterCommand: boolean;
  // Custom commands
  customCommands: CustomVoiceCommand[];
}

export interface VoiceCommand {
  command: string;
  patterns: RegExp[];
  action: string;
  extractQuery?: boolean;
}

export interface VoiceCommandEvent {
  action: string;
  transcript: string;
  searchQuery?: string;
  confidence: number;
}

interface UseVoiceControlReturn {
  settings: VoiceControlSettings;
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  updateSettings: (settings: Partial<VoiceControlSettings>) => void;
  resetSettings: () => void;
  executeCommand: (command: string) => void;
  addCustomCommand: (command: Omit<CustomVoiceCommand, 'id'>) => void;
  removeCustomCommand: (id: string) => void;
  toggleCustomCommand: (id: string, enabled: boolean) => void;
}

const STORAGE_KEY = 'tsijukebox-voice-control';

const defaultSettings: VoiceControlSettings = {
  enabled: false,
  language: 'pt-BR',
  continuousListening: false,
  wakeWord: 'jukebox',
  minConfidenceThreshold: 0.7,
  noiseReduction: true,
  silenceTimeout: 2000,
  autoStopAfterCommand: true,
  customCommands: []
};

// Command patterns for multiple languages
export const VOICE_COMMANDS: VoiceCommand[] = [
  // Play commands
  { 
    command: 'play', 
    patterns: [/\b(play|tocar|reproduzir|iniciar)\b/i], 
    action: 'play' 
  },
  // Pause commands
  { 
    command: 'pause', 
    patterns: [/\b(pause|pausar|parar|para)\b/i], 
    action: 'pause' 
  },
  // Next track
  { 
    command: 'next', 
    patterns: [/\b(next|próxima|proxima|skip|pular|avançar|avancar)\b/i], 
    action: 'next' 
  },
  // Previous track
  { 
    command: 'previous', 
    patterns: [/\b(previous|anterior|voltar|volta)\b/i], 
    action: 'previous' 
  },
  // Volume up
  { 
    command: 'volumeUp', 
    patterns: [/\b(volume up|aumentar volume|mais alto|louder)\b/i], 
    action: 'volumeUp' 
  },
  // Volume down
  { 
    command: 'volumeDown', 
    patterns: [/\b(volume down|diminuir volume|mais baixo|quieter|lower)\b/i], 
    action: 'volumeDown' 
  },
  // Mute
  { 
    command: 'mute', 
    patterns: [/\b(mute|mudo|silenciar|silêncio|silencio)\b/i], 
    action: 'mute' 
  },
  // Shuffle
  { 
    command: 'shuffle', 
    patterns: [/\b(shuffle|aleatório|aleatorio|embaralhar|misturar)\b/i], 
    action: 'shuffle' 
  },
  // Repeat
  { 
    command: 'repeat', 
    patterns: [/\b(repeat|repetir|loop)\b/i], 
    action: 'repeat' 
  },
  // Stop
  { 
    command: 'stop', 
    patterns: [/\b(stop|parar tudo|encerrar)\b/i], 
    action: 'stop' 
  },
  // Search commands
  { 
    command: 'search', 
    patterns: [
      /\b(buscar|procurar|search|encontrar|achar)\s+(.+)/i,
      /\b(tocar|play)\s+(música|musica|artista|banda|album|álbum)\s+(.+)/i,
      /\b(pesquisar)\s+(.+)/i
    ], 
    action: 'search',
    extractQuery: true
  }
];

function loadSettings(): VoiceControlSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Error loading voice control settings:', error);
  }
  return defaultSettings;
}

function saveSettings(settings: VoiceControlSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving voice control settings:', error);
  }
}

// Internal type definitions for Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function useVoiceControl(): UseVoiceControlReturn {
  const [settings, setSettings] = useState<VoiceControlSettings>(loadSettings);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const commandCallbacksRef = useRef<Map<string, () => void>>(new Map());
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  const windowWithSpeech = typeof window !== 'undefined' ? window as unknown as WindowWithSpeechRecognition : null;
  const isSupported = windowWithSpeech !== null && 
    ('SpeechRecognition' in (windowWithSpeech as object) || 'webkitSpeechRecognition' in (windowWithSpeech as object));

  // Extract search query from text
  const extractSearchQuery = useCallback((text: string, pattern: RegExp): string | undefined => {
    const match = text.match(pattern);
    if (!match) return undefined;
    
    // Try to get the last capture group (the search term)
    for (let i = match.length - 1; i > 0; i--) {
      if (match[i] && match[i].trim()) {
        return match[i].trim();
      }
    }
    return undefined;
  }, []);

  // Dispatch history event
  const dispatchHistoryEvent = useCallback((data: {
    transcript: string;
    confidence: number;
    action: string | null;
    searchQuery?: string;
    matchedPattern?: string;
    success: boolean;
    processingTimeMs: number;
  }) => {
    window.dispatchEvent(new CustomEvent('voice-command-history', { detail: data }));
  }, []);

  // Process recognized command
  const processCommand = useCallback((text: string, currentConfidence: number) => {
    const startTime = performance.now();
    let matchedAction: string | null = null;
    let matchedPattern: string | undefined;
    let searchQuery: string | undefined;
    let success = false;

    // Check confidence threshold
    if (currentConfidence < settings.minConfidenceThreshold) {
      console.log(`Confiança ${(currentConfidence * 100).toFixed(0)}% abaixo do threshold ${(settings.minConfidenceThreshold * 100).toFixed(0)}%`);
      
      // Record failed attempt due to low confidence
      dispatchHistoryEvent({
        transcript: text,
        confidence: currentConfidence,
        action: null,
        success: false,
        processingTimeMs: performance.now() - startTime
      });
      return;
    }

    // Check custom commands first
    for (const cmd of settings.customCommands) {
      if (!cmd.enabled) continue;
      
      for (const patternStr of cmd.patterns) {
        try {
          const pattern = new RegExp(patternStr, 'i');
          if (pattern.test(text)) {
            matchedAction = cmd.customAction || cmd.action;
            matchedPattern = patternStr;
            success = true;
            setLastCommand(cmd.action);
            
            window.dispatchEvent(new CustomEvent<VoiceCommandEvent>('voice-command', { 
              detail: { 
                action: matchedAction, 
                transcript: text,
                confidence: currentConfidence
              } 
            }));
            
            // Record successful command
            dispatchHistoryEvent({
              transcript: text,
              confidence: currentConfidence,
              action: matchedAction,
              matchedPattern,
              success: true,
              processingTimeMs: performance.now() - startTime
            });
            
            return;
          }
        } catch (e) {
          console.error('Invalid custom command pattern:', patternStr);
        }
      }
    }

    // Check built-in commands
    for (const cmd of VOICE_COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(text)) {
          matchedAction = cmd.action;
          matchedPattern = pattern.source;
          success = true;
          setLastCommand(cmd.action);
          
          // Extract search query if this is a search command
          searchQuery = cmd.extractQuery ? extractSearchQuery(text, pattern) : undefined;
          
          // Execute callback if registered
          const callback = commandCallbacksRef.current.get(cmd.action);
          if (callback) {
            callback();
          }
          
          // Dispatch custom event for other components to listen
          window.dispatchEvent(new CustomEvent<VoiceCommandEvent>('voice-command', { 
            detail: { 
              action: cmd.action, 
              transcript: text,
              searchQuery,
              confidence: currentConfidence
            } 
          }));
          
          // Record successful command
          dispatchHistoryEvent({
            transcript: text,
            confidence: currentConfidence,
            action: matchedAction,
            searchQuery,
            matchedPattern,
            success: true,
            processingTimeMs: performance.now() - startTime
          });
          
          return;
        }
      }
    }
    
    // No command matched
    setLastCommand(null);
    
    // Record failed attempt (no match)
    dispatchHistoryEvent({
      transcript: text,
      confidence: currentConfidence,
      action: null,
      success: false,
      processingTimeMs: performance.now() - startTime
    });
  }, [settings.minConfidenceThreshold, settings.customCommands, extractSearchQuery, dispatchHistoryEvent]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Not started or other error
    }
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported || !windowWithSpeech) {
      setError('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = settings.continuousListening;
    recognition.interimResults = true;
    recognition.lang = settings.language;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      
      // Start silence timeout
      if (settings.silenceTimeout > 0 && !settings.continuousListening) {
        silenceTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, settings.silenceTimeout);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Clear silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      // Restart if continuous listening is enabled
      if (settings.enabled && settings.continuousListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started or other error
        }
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcriptText = result[0].transcript.toLowerCase().trim();
      const conf = result[0].confidence;

      setTranscript(transcriptText);
      setConfidence(conf);

      // Reset silence timeout on speech
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, settings.silenceTimeout);
      }

      if (result.isFinal) {
        // Check for wake word if configured
        const hasWakeWord = !settings.wakeWord || 
          transcriptText.includes(settings.wakeWord.toLowerCase());

        if (hasWakeWord) {
          processCommand(transcriptText, conf);
          
          // Auto-stop after command if enabled
          if (settings.autoStopAfterCommand && !settings.continuousListening) {
            stopListening();
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError(`Erro de reconhecimento: ${event.error}`);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isSupported, settings.language, settings.continuousListening, settings.wakeWord, settings.enabled, settings.silenceTimeout, settings.autoStopAfterCommand, processCommand, stopListening, windowWithSpeech]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || !settings.enabled) return;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started or other error
    }
  }, [isSupported, settings.enabled]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const updateSettings = useCallback((newSettings: Partial<VoiceControlSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    setLastCommand(null);
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  // Execute command programmatically
  const executeCommand = useCallback((command: string) => {
    processCommand(command, 1.0);
  }, [processCommand]);

  // Add custom command
  const addCustomCommand = useCallback((command: Omit<CustomVoiceCommand, 'id'>) => {
    const newCommand: CustomVoiceCommand = {
      ...command,
      id: crypto.randomUUID()
    };
    
    setSettings(prev => {
      const updated = {
        ...prev,
        customCommands: [...prev.customCommands, newCommand]
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Remove custom command
  const removeCustomCommand = useCallback((id: string) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        customCommands: prev.customCommands.filter(cmd => cmd.id !== id)
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Toggle custom command enabled state
  const toggleCustomCommand = useCallback((id: string, enabled: boolean) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        customCommands: prev.customCommands.map(cmd => 
          cmd.id === id ? { ...cmd, enabled } : cmd
        )
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  return {
    settings,
    isListening,
    isSupported,
    lastCommand,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    toggleListening,
    updateSettings,
    resetSettings,
    executeCommand,
    addCustomCommand,
    removeCustomCommand,
    toggleCustomCommand
  };
}
