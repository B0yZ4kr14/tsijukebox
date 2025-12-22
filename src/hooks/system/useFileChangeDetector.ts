import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DetectedFile {
  path: string;
  timestamp: number;
}

export interface UseFileChangeDetectorReturn {
  detectedFiles: DetectedFile[];
  isDetecting: boolean;
  lastDetection: Date | null;
  submitFilesForSync: (files: string[]) => Promise<boolean>;
  clearDetected: () => void;
  startDetection: () => void;
  stopDetection: () => void;
}

// Patterns for files that should trigger auto-sync
const SYNC_PATTERNS = [
  /^src\/.+\.(tsx?|jsx?|css|scss)$/,
  /^docs\/.+\.(md|mdx)$/,
  /^supabase\/functions\/.+\.ts$/,
  /^public\/.+$/,
];

// Patterns for files to ignore
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist\//,
  /\.cache/,
  /\.test\.(tsx?|jsx?)$/,
  /\.spec\.(tsx?|jsx?)$/,
];

function shouldTrackFile(path: string): boolean {
  // Check if should be ignored
  if (IGNORE_PATTERNS.some(pattern => pattern.test(path))) {
    return false;
  }
  
  // Check if matches sync patterns
  return SYNC_PATTERNS.some(pattern => pattern.test(path));
}

export function useFileChangeDetector(): UseFileChangeDetectorReturn {
  const [detectedFiles, setDetectedFiles] = useState<DetectedFile[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<Date | null>(null);
  const detectionEnabled = useRef(false);

  // Submit files to the webhook
  const submitFilesForSync = useCallback(async (filePaths: string[]): Promise<boolean> => {
    if (filePaths.length === 0) return false;

    try {
      const { data, error } = await supabase.functions.invoke('file-change-webhook', {
        body: {
          files: filePaths.map(path => ({ path })),
          source: 'hmr'
        }
      });

      if (error) {
        console.error('[useFileChangeDetector] Error submitting files:', error);
        return false;
      }

      console.log('[useFileChangeDetector] Files submitted:', data);
      setLastDetection(new Date());
      
      if (data?.summary?.added > 0 || data?.summary?.updated > 0) {
        toast.info(`${data.summary.added + data.summary.updated} arquivo(s) detectado(s) para sync`);
      }

      return true;
    } catch (err) {
      console.error('[useFileChangeDetector] Submit error:', err);
      return false;
    }
  }, []);

  // Setup HMR detection
  useEffect(() => {
    if (typeof import.meta?.hot === 'undefined') {
      console.log('[useFileChangeDetector] HMR not available');
      return;
    }

    const handleHotUpdate = (data: { file?: string; type?: string }) => {
      if (!detectionEnabled.current) return;
      
      // Try to extract file path from various HMR event formats
      const file = data?.file || '';
      
      if (file && shouldTrackFile(file)) {
        console.log('[useFileChangeDetector] Detected change:', file);
        
        setDetectedFiles(prev => {
          const exists = prev.some(f => f.path === file);
          if (exists) {
            return prev.map(f => 
              f.path === file ? { ...f, timestamp: Date.now() } : f
            );
          }
          return [...prev, { path: file, timestamp: Date.now() }];
        });

        // Auto-submit after brief debounce
        setTimeout(() => {
          if (detectionEnabled.current) {
            submitFilesForSync([file]);
          }
        }, 1000);
      }
    };

    // Listen to Vite HMR events
    import.meta.hot?.on('vite:beforeUpdate', (payload: { updates?: Array<{ path?: string }> }) => {
      payload.updates?.forEach(update => {
        if (update.path) {
          handleHotUpdate({ file: update.path });
        }
      });
    });

    // Alternative: listen to general update events
    import.meta.hot?.on('vite:afterUpdate', (payload: { updates?: Array<{ path?: string }> }) => {
      console.log('[useFileChangeDetector] After update:', payload);
    });

    return () => {
      // Cleanup if needed
    };
  }, [submitFilesForSync]);

  const startDetection = useCallback(() => {
    detectionEnabled.current = true;
    setIsDetecting(true);
    console.log('[useFileChangeDetector] Detection started');
  }, []);

  const stopDetection = useCallback(() => {
    detectionEnabled.current = false;
    setIsDetecting(false);
    console.log('[useFileChangeDetector] Detection stopped');
  }, []);

  const clearDetected = useCallback(() => {
    setDetectedFiles([]);
  }, []);

  return {
    detectedFiles,
    isDetecting,
    lastDetection,
    submitFilesForSync,
    clearDetected,
    startDetection,
    stopDetection
  };
}
