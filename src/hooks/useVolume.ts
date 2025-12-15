import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { VolumeControl } from '@/lib/api/types';
import { toast } from 'sonner';

export function useVolume() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (control: VolumeControl) => api.setVolume(control),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao ajustar volume', {
        description: error.message,
      });
    },
  });

  return {
    setVolume: (level: number) => mutation.mutate({ level }),
    toggleMute: (mute: boolean) => mutation.mutate({ level: 0, mute }),
    isLoading: mutation.isPending,
  };
}
