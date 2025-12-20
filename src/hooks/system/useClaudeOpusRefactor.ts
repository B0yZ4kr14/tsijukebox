import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type RefactorAction = 
  | 'refactor-python' 
  | 'refactor-docker' 
  | 'refactor-sqlite' 
  | 'generate-docs' 
  | 'analyze-security' 
  | 'optimize-archlinux';

export type TargetDistro = 'cachyos' | 'archlinux' | 'manjaro';

export interface RefactorFile {
  path: string;
  content: string;
}

export interface RefactoredFile {
  path: string;
  originalContent: string;
  refactoredContent: string;
  changes: string[];
  improvements: string[];
}

export interface RefactorResult {
  files: RefactoredFile[];
  summary: string;
  securityNotes?: string[];
  performanceGains?: string[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}

export interface UseClaudeOpusRefactorReturn {
  isRefactoring: boolean;
  error: string | null;
  lastResult: RefactorResult | null;
  refactorFiles: (
    action: RefactorAction,
    files: RefactorFile[],
    context?: string,
    targetDistro?: TargetDistro
  ) => Promise<RefactorResult | null>;
  refactorPython: (files: RefactorFile[], context?: string) => Promise<RefactorResult | null>;
  refactorDocker: (files: RefactorFile[], context?: string) => Promise<RefactorResult | null>;
  optimizeForCachyOS: (files: RefactorFile[], context?: string) => Promise<RefactorResult | null>;
  analyzeSecurity: (files: RefactorFile[], context?: string) => Promise<RefactorResult | null>;
  generateDocs: (files: RefactorFile[], context?: string) => Promise<RefactorResult | null>;
  clearError: () => void;
  clearResult: () => void;
}

export function useClaudeOpusRefactor(): UseClaudeOpusRefactorReturn {
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RefactorResult | null>(null);

  const refactorFiles = useCallback(async (
    action: RefactorAction,
    files: RefactorFile[],
    context?: string,
    targetDistro: TargetDistro = 'cachyos'
  ): Promise<RefactorResult | null> => {
    if (files.length === 0) {
      setError('No files to refactor');
      return null;
    }

    setIsRefactoring(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('claude-refactor-opus', {
        body: {
          action,
          files,
          context,
          targetDistro,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to call Claude Opus refactor function');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result: RefactorResult = {
        files: data.result.files,
        summary: data.result.summary,
        securityNotes: data.result.securityNotes,
        performanceGains: data.result.performanceGains,
        usage: data.usage,
        model: data.model,
      };

      setLastResult(result);
      toast.success(`Refatoração concluída: ${result.files.length} arquivos`);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refactor files';
      setError(message);
      toast.error(`Erro na refatoração: ${message}`);
      return null;
    } finally {
      setIsRefactoring(false);
    }
  }, []);

  const refactorPython = useCallback(async (
    files: RefactorFile[],
    context?: string
  ): Promise<RefactorResult | null> => {
    return refactorFiles('refactor-python', files, context);
  }, [refactorFiles]);

  const refactorDocker = useCallback(async (
    files: RefactorFile[],
    context?: string
  ): Promise<RefactorResult | null> => {
    return refactorFiles('refactor-docker', files, context);
  }, [refactorFiles]);

  const optimizeForCachyOS = useCallback(async (
    files: RefactorFile[],
    context?: string
  ): Promise<RefactorResult | null> => {
    return refactorFiles('optimize-archlinux', files, context, 'cachyos');
  }, [refactorFiles]);

  const analyzeSecurity = useCallback(async (
    files: RefactorFile[],
    context?: string
  ): Promise<RefactorResult | null> => {
    return refactorFiles('analyze-security', files, context);
  }, [refactorFiles]);

  const generateDocs = useCallback(async (
    files: RefactorFile[],
    context?: string
  ): Promise<RefactorResult | null> => {
    return refactorFiles('generate-docs', files, context);
  }, [refactorFiles]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    isRefactoring,
    error,
    lastResult,
    refactorFiles,
    refactorPython,
    refactorDocker,
    optimizeForCachyOS,
    analyzeSecurity,
    generateDocs,
    clearError,
    clearResult,
  };
}
