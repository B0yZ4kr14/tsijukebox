import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Track } from '@/lib/api/types';
import { toast } from 'sonner';

export function useLibrary() {
  const queryClient = useQueryClient();

  const query = useQuery<Track[]>({
    queryKey: ['library'],
    queryFn: () => api.getLibrary(),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (trackId: string) => api.deleteTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Faixa removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover faixa', { description: error.message });
    },
  });

  const playMutation = useMutation({
    mutationFn: (trackId: string) => api.playTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
      toast.success('Reproduzindo faixa');
    },
    onError: (error: Error) => {
      toast.error('Erro ao reproduzir faixa', { description: error.message });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) => api.uploadFiles(files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success(`${data.uploaded} arquivo(s) enviado(s)`);
    },
    onError: (error: Error) => {
      toast.error('Erro no upload', { description: error.message });
    },
  });

  return {
    tracks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    deleteTrack: deleteMutation.mutate,
    playTrack: playMutation.mutate,
    uploadFiles: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  };
}
