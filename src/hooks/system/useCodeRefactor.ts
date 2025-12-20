import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RefactorSuggestion {
  type: 'security' | 'performance' | 'readability' | 'best-practice';
  original: string;
  suggested: string;
  explanation: string;
  priority: 'high' | 'medium' | 'low';
  lineStart?: number;
  lineEnd?: number;
}

export interface RefactorResult {
  fileName: string;
  language: string;
  originalCode: string;
  suggestions: RefactorSuggestion[];
  refactoredCode: string;
  summary: string;
  improvementScore: number;
  refactoredAt: string;
}

export interface UseCodeRefactorReturn {
  result: RefactorResult | null;
  isRefactoring: boolean;
  error: string | null;
  refactorCode: (code: string, fileName: string, language?: string) => Promise<RefactorResult | null>;
  clearResult: () => void;
  getSuggestionsByType: (type: RefactorSuggestion['type']) => RefactorSuggestion[];
  getSuggestionsByPriority: (priority: RefactorSuggestion['priority']) => RefactorSuggestion[];
}

export function useCodeRefactor(): UseCodeRefactorReturn {
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refactorCode = useCallback(async (
    code: string, 
    fileName: string, 
    language: string = 'auto'
  ): Promise<RefactorResult | null> => {
    setIsRefactoring(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('code-refactor', {
        body: { code, fileName, language },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Refactor failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Refactor failed');
      }

      const refactorResult: RefactorResult = response.data.data;
      setResult(refactorResult);
      return refactorResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[useCodeRefactor] Error refactoring ${fileName}:`, errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsRefactoring(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const getSuggestionsByType = useCallback(
    (type: RefactorSuggestion['type']): RefactorSuggestion[] => {
      return result?.suggestions.filter((s) => s.type === type) || [];
    },
    [result]
  );

  const getSuggestionsByPriority = useCallback(
    (priority: RefactorSuggestion['priority']): RefactorSuggestion[] => {
      return result?.suggestions.filter((s) => s.priority === priority) || [];
    },
    [result]
  );

  return {
    result,
    isRefactoring,
    error,
    refactorCode,
    clearResult,
    getSuggestionsByType,
    getSuggestionsByPriority,
  };
}
