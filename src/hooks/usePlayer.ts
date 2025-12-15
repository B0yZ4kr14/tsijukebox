import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PlaybackAction } from '@/lib/api/types';
import { toast } from 'sonner';

export function usePlayer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (action: PlaybackAction) => api.controlPlayback(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao controlar player', {
        description: error.message,
      });
    },
  });

  return {
    play: () => mutation.mutate({ action: 'play' }),
    pause: () => mutation.mutate({ action: 'pause' }),
    next: () => mutation.mutate({ action: 'next' }),
    prev: () => mutation.mutate({ action: 'prev' }),
    stop: () => mutation.mutate({ action: 'stop' }),
    isLoading: mutation.isPending,
  };
}
