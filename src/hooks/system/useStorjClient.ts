import { useState, useEffect, useCallback } from 'react';
import { storjClient, StorjBucket, StorjObject, StorjStorageStats, StorjUploadProgress } from '@/lib/api/storj';
import { useToast } from '@/hooks/common';

export function useStorjClient() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<StorjBucket[]>([]);
  const [currentBucket, setCurrentBucket] = useState<string | null>(null);
  const [objects, setObjects] = useState<StorjObject[]>([]);
  const [stats, setStats] = useState<StorjStorageStats | null>(null);
  const [uploadProgress, setUploadProgress] = useState<StorjUploadProgress | null>(null);

  const testConnection = useCallback(async (accessGrant: string) => {
    setIsLoading(true);
    try {
      const result = await storjClient.testConnection(accessGrant);
      setIsConnected(result.success);
      setError(null);
      if (result.success) {
        toast({ title: 'Conectado', description: 'Conexão com Storj estabelecida' });
      }
      return result.success;
    } catch (err) {
      setError('Falha na conexão');
      setIsConnected(false);
      toast({ title: 'Erro', description: 'Falha ao conectar ao Storj', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchBuckets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storjClient.listBuckets();
      setBuckets(data);
      setError(null);
    } catch {
      setBuckets([]);
      setError('Falha ao listar buckets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBucket = useCallback(async (name: string, options?: { versioning?: boolean; objectLock?: boolean }) => {
    setIsLoading(true);
    try {
      await storjClient.createBucket(name, options);
      toast({ title: 'Bucket criado', description: `Bucket "${name}" criado com sucesso` });
      await fetchBuckets();
      return true;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar bucket', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchBuckets]);

  const deleteBucket = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      await storjClient.deleteBucket(name);
      toast({ title: 'Bucket removido', description: `Bucket "${name}" removido` });
      await fetchBuckets();
      return true;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover bucket', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchBuckets]);

  const fetchObjects = useCallback(async (bucket: string, prefix?: string) => {
    setIsLoading(true);
    setCurrentBucket(bucket);
    try {
      const data = await storjClient.listObjects(bucket, prefix);
      setObjects(data);
      setError(null);
    } catch {
      setObjects([]);
      setError('Falha ao listar objetos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (bucket: string, key: string, file: File) => {
    setIsLoading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
    try {
      const result = await storjClient.uploadObject(bucket, key, file, setUploadProgress);
      toast({ title: 'Upload concluído', description: `Arquivo "${key}" enviado` });
      await fetchObjects(bucket);
      return result;
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  }, [toast, fetchObjects]);

  const downloadFile = useCallback(async (bucket: string, key: string) => {
    setIsLoading(true);
    try {
      const blob = await storjClient.downloadObject(bucket, key);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop() || key;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Download concluído', description: `Arquivo "${key}" baixado` });
    } catch {
      toast({ title: 'Erro', description: 'Falha no download', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteFile = useCallback(async (bucket: string, key: string) => {
    setIsLoading(true);
    try {
      await storjClient.deleteObject(bucket, key);
      toast({ title: 'Arquivo removido', description: `"${key}" removido` });
      await fetchObjects(bucket);
      return true;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover arquivo', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchObjects]);

  const getPresignedUrl = useCallback(async (bucket: string, key: string, expiresIn?: number) => {
    try {
      return await storjClient.getPresignedUrl(bucket, key, expiresIn);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao gerar URL', variant: 'destructive' });
      return null;
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await storjClient.getStorageStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  const createBackup = useCallback(async (bucket: string) => {
    setIsLoading(true);
    try {
      const result = await storjClient.createBackup(bucket);
      toast({ title: 'Backup criado', description: `Backup salvo: ${result.key}` });
      return result;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar backup', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const restoreBackup = useCallback(async (bucket: string, key: string) => {
    setIsLoading(true);
    try {
      await storjClient.restoreBackup(bucket, key);
      toast({ title: 'Backup restaurado', description: 'Restauração concluída com sucesso' });
      return true;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao restaurar backup', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Check connection status on mount
    storjClient.getConfig()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    buckets,
    currentBucket,
    objects,
    stats,
    uploadProgress,
    testConnection,
    fetchBuckets,
    createBucket,
    deleteBucket,
    fetchObjects,
    uploadFile,
    downloadFile,
    deleteFile,
    getPresignedUrl,
    fetchStats,
    createBackup,
    restoreBackup,
  };
}
