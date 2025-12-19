import { useState, useEffect, useCallback, useRef } from 'react';

export type VoiceLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export interface VoiceControlSettings {
  enabled: boolean;
  language: VoiceLanguage;
  continuousListening: boolean;
  wakeWord: string;
}

export interface VoiceCommand {
  command: string;
  patterns: RegExp[];
  action: string;
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
}

const STORAGE_KEY = 'tsijukebox-voice-control';

const defaultSettings: VoiceControlSettings = {
  enabled: false,
  language: 'pt-BR',
  continuousListening: false,
  wakeWord: 'jukebox'
};

// Command patterns for multiple languages
const VOICE_COMMANDS: VoiceCommand[] = [
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
  }
];

function loadSettings(): VoiceControlSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
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

export function useVoiceControl(): UseVoiceControlReturn {
  const [settings, setSettings] = useState<VoiceControlSettings>(loadSettings);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandCallbacksRef = useRef<Map<string, () => void>>(new Map());

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = settings.continuousListening;
    recognition.interimResults = true;
    recognition.lang = settings.language;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
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

      if (result.isFinal) {
        // Check for wake word if configured
        const hasWakeWord = !settings.wakeWord || 
          transcriptText.includes(settings.wakeWord.toLowerCase());

        if (hasWakeWord) {
          processCommand(transcriptText);
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
    };
  }, [isSupported, settings.language, settings.continuousListening, settings.wakeWord, settings.enabled]);

  // Process recognized command
  const processCommand = useCallback((text: string) => {
    for (const cmd of VOICE_COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(text)) {
          setLastCommand(cmd.action);
          
          // Execute callback if registered
          const callback = commandCallbacksRef.current.get(cmd.action);
          if (callback) {
            callback();
          }
          
          // Dispatch custom event for other components to listen
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { action: cmd.action, transcript: text } 
          }));
          
          return;
        }
      }
    }
    // No command matched
    setLastCommand(null);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || !settings.enabled) return;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started or other error
    }
  }, [isSupported, settings.enabled]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Not started or other error
    }
  }, []);

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
    processCommand(command);
  }, [processCommand]);

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
    executeCommand
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
