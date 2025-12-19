import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { PlaybackQueue } from '@/lib/api/types';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';

export function usePlaybackControls() {
  const { isDemoMode } = useSettings();
  const queryClient = useQueryClient();
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'track' | 'context'>('off');

  // Queue query
  const queueQuery = useQuery({
    queryKey: ['playback', 'queue'],
    queryFn: () => api.getQueue(),
    enabled: !isDemoMode,
    staleTime: 5000,
    refetchInterval: 10000,
  });

  // Shuffle mutation
  const shuffleMutation = useMutation({
    mutationFn: (enabled: boolean) => api.setShuffle(enabled),
    onSuccess: (_, enabled) => {
      setShuffle(enabled);
      toast.success(enabled ? 'Shuffle ativado' : 'Shuffle desativado');
    },
    onError: () => {
      toast.error('Erro ao alterar shuffle');
    },
  });

  // Repeat mutation
  const repeatMutation = useMutation({
    mutationFn: (mode: 'off' | 'track' | 'context') => api.setRepeat(mode),
    onSuccess: (_, mode) => {
      setRepeat(mode);
      const labels = { off: 'Repeat desativado', track: 'Repetir faixa', context: 'Repetir contexto' };
      toast.success(labels[mode]);
    },
    onError: () => {
      toast.error('Erro ao alterar repeat');
    },
  });

  // Add to queue mutation
  const addToQueueMutation = useMutation({
    mutationFn: (uri: string) => api.addToQueue(uri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playback', 'queue'] });
      toast.success('Adicionado à fila');
    },
    onError: () => {
      toast.error('Erro ao adicionar à fila');
    },
  });

  // Remove from queue mutation
  const removeFromQueueMutation = useMutation({
    mutationFn: (id: string) => api.removeFromQueue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playback', 'queue'] });
      toast.success('Removido da fila');
    },
  });

  // Clear queue mutation
  const clearQueueMutation = useMutation({
    mutationFn: () => api.clearQueue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playback', 'queue'] });
      toast.success('Fila limpa');
    },
  });

  // Reorder queue mutation
  const reorderQueueMutation = useMutation({
    mutationFn: ({ trackId, fromIndex, toIndex }: { trackId: string; fromIndex: number; toIndex: number }) => 
      api.reorderQueue(trackId, fromIndex, toIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playback', 'queue'] });
      toast.success('Fila reordenada');
    },
    onError: () => {
      toast.error('Erro ao reordenar fila');
    },
  });

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    if (isDemoMode) {
      toast.success('Fila reordenada (demo)');
      return;
    }
    const trackId = queueQuery.data?.next[fromIndex]?.id;
    if (trackId) {
      reorderQueueMutation.mutate({ trackId, fromIndex, toIndex });
    }
  }, [isDemoMode, queueQuery.data, reorderQueueMutation]);

  const toggleShuffle = useCallback(() => {
    if (isDemoMode) {
      setShuffle(prev => !prev);
      toast.success(!shuffle ? 'Shuffle ativado' : 'Shuffle desativado');
      return;
    }
    shuffleMutation.mutate(!shuffle);
  }, [isDemoMode, shuffle, shuffleMutation]);

  const toggleRepeat = useCallback(() => {
    const nextMode = repeat === 'off' ? 'context' : repeat === 'context' ? 'track' : 'off';
    if (isDemoMode) {
      setRepeat(nextMode);
      const labels = { off: 'Repeat desativado', track: 'Repetir faixa', context: 'Repetir contexto' };
      toast.success(labels[nextMode]);
      return;
    }
    repeatMutation.mutate(nextMode);
  }, [isDemoMode, repeat, repeatMutation]);

  // Mock queue for demo mode
  const mockQueue: PlaybackQueue = {
    current: {
      id: '1',
      title: 'Tocando Agora',
      artist: 'Demo Artist',
      album: 'Demo Album',
      cover: null,
      duration: 210000,
    },
    next: [
      { id: '2', title: 'Próxima Música', artist: 'Outro Artista', album: 'Album 2', cover: null, duration: 180000 },
      { id: '3', title: 'Terceira Música', artist: 'Artista 3', album: 'Album 3', cover: null, duration: 200000 },
    ],
    history: [
      { id: '0', title: 'Música Anterior', artist: 'Artista Anterior', album: 'Album Ant', cover: null, duration: 190000 },
    ],
  };

  return {
    shuffle,
    repeat,
    queue: isDemoMode ? mockQueue : queueQuery.data ?? null,
    isLoadingQueue: queueQuery.isLoading,
    toggleShuffle,
    toggleRepeat,
    addToQueue: addToQueueMutation.mutate,
    removeFromQueue: removeFromQueueMutation.mutate,
    clearQueue: clearQueueMutation.mutate,
    reorderQueue,
    refetchQueue: queueQuery.refetch,
  };
}
