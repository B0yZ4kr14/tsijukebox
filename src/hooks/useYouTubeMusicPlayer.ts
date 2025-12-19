import { useCallback } from 'react';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { useToast } from '@/hooks/common';

export function useYouTubeMusicPlayer() {
  const { toast } = useToast();

  const play = useCallback(async (videoId?: string) => {
    try {
      await youtubeMusicClient.play(videoId);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao reproduzir', variant: 'destructive' });
    }
  }, [toast]);

  const pause = useCallback(async () => {
    try {
      await youtubeMusicClient.pause();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao pausar', variant: 'destructive' });
    }
  }, [toast]);

  const next = useCallback(async () => {
    try {
      await youtubeMusicClient.next();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao avançar', variant: 'destructive' });
    }
  }, [toast]);

  const previous = useCallback(async () => {
    try {
      await youtubeMusicClient.previous();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao voltar', variant: 'destructive' });
    }
  }, [toast]);

  const seek = useCallback(async (positionMs: number) => {
    try {
      await youtubeMusicClient.seek(positionMs);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao buscar posição', variant: 'destructive' });
    }
  }, [toast]);

  const setVolume = useCallback(async (percent: number) => {
    try {
      await youtubeMusicClient.setVolume(percent);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao ajustar volume', variant: 'destructive' });
    }
  }, [toast]);

  const addToQueue = useCallback(async (videoId: string) => {
    try {
      await youtubeMusicClient.addToQueue(videoId);
      toast({ title: 'Adicionado à fila' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar à fila', variant: 'destructive' });
    }
  }, [toast]);

  return {
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    addToQueue,
  };
}
