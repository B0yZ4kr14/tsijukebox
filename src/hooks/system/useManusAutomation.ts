import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TaskType = 'create-task' | 'generate-docs' | 'generate-tutorial' | 'optimize-docker';

export interface ManusTask {
  taskId: string;
  taskTitle: string;
  taskUrl: string;
  shareUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  artifacts?: Array<{
    type: string;
    name: string;
    content: string;
  }>;
  mock?: boolean;
}

interface UseManusAutomationReturn {
  tasks: ManusTask[];
  currentTask: ManusTask | null;
  isLoading: boolean;
  error: string | null;
  createTask: (prompt: string) => Promise<ManusTask | null>;
  generateDocumentation: (files?: string[]) => Promise<ManusTask | null>;
  generateTutorial: (topic: string) => Promise<ManusTask | null>;
  optimizeDocker: (files?: string[]) => Promise<ManusTask | null>;
  getTaskStatus: (taskId: string) => Promise<ManusTask | null>;
  clearError: () => void;
}

export function useManusAutomation(): UseManusAutomationReturn {
  const [tasks, setTasks] = useState<ManusTask[]>([]);
  const [currentTask, setCurrentTask] = useState<ManusTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callManusFunction = useCallback(async (
    action: TaskType,
    params: Record<string, unknown> = {}
  ): Promise<ManusTask | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('manus-automation', {
        body: { action, ...params },
      });

      if (fnError) {
        throw fnError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      const task = data.task as ManusTask;
      setCurrentTask(task);
      setTasks(prev => [task, ...prev]);

      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to call Manus API';
      setError(message);
      console.error('Manus automation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (prompt: string): Promise<ManusTask | null> => {
    return callManusFunction('create-task', { prompt });
  }, [callManusFunction]);

  const generateDocumentation = useCallback(async (files?: string[]): Promise<ManusTask | null> => {
    return callManusFunction('generate-docs', { files });
  }, [callManusFunction]);

  const generateTutorial = useCallback(async (topic: string): Promise<ManusTask | null> => {
    return callManusFunction('generate-tutorial', { topic });
  }, [callManusFunction]);

  const optimizeDocker = useCallback(async (files?: string[]): Promise<ManusTask | null> => {
    return callManusFunction('optimize-docker', { files });
  }, [callManusFunction]);

  const getTaskStatus = useCallback(async (taskId: string): Promise<ManusTask | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('manus-automation', {
        body: { action: 'get-task', taskId },
      });

      if (fnError) {
        throw fnError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      const task = data.task as ManusTask;
      
      // Update task in list
      setTasks(prev => prev.map(t => t.taskId === taskId ? task : t));
      
      if (currentTask?.taskId === taskId) {
        setCurrentTask(task);
      }

      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get task status';
      setError(message);
      console.error('Get task status error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentTask]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    currentTask,
    isLoading,
    error,
    createTask,
    generateDocumentation,
    generateTutorial,
    optimizeDocker,
    getTaskStatus,
    clearError,
  };
}
