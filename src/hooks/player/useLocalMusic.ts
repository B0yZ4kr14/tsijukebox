import { useState, useEffect, useCallback } from 'react';
import { 
  localMusicClient, 
  LocalMusicFile, 
  MusicUploadProgress, 
  UserMusicSync, 
  JukeboxInstance, 
  ReplicationResult,
  MusicPlaylist,
  ConfigReplicationSettings
} from '@/lib/api/localMusic';
import { useToast } from '@/hooks/common';

export function useLocalMusic() {
  const { toast } = useToast();
  
  // State
  const [files, setFiles] = useState<LocalMusicFile[]>([]);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [syncStatus, setSyncStatus] = useState<UserMusicSync[]>([]);
  const [instances, setInstances] = useState<JukeboxInstance[]>([]);
  const [replicationSettings, setReplicationSettings] = useState<ConfigReplicationSettings | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<MusicUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // ==================== FETCH DATA ====================

  const fetchFiles = useCallback(async () => {
    try {
      const data = await localMusicClient.listFiles();
      setFiles(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar arquivos');
      setFiles([]);
    }
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      const data = await localMusicClient.listPlaylists();
      setPlaylists(data);
    } catch {
      setPlaylists([]);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const data = await localMusicClient.getSyncStatus();
      setSyncStatus(data);
    } catch {
      setSyncStatus([]);
    }
  }, []);

  const fetchInstances = useCallback(async () => {
    try {
      const data = await localMusicClient.getRegisteredInstances();
      setInstances(data);
    } catch {
      setInstances([]);
    }
  }, []);

  const fetchReplicationSettings = useCallback(async () => {
    try {
      const data = await localMusicClient.getReplicationSettings();
      setReplicationSettings(data);
    } catch {
      setReplicationSettings(null);
    }
  }, []);

  // ==================== FILE OPERATIONS ====================

  const uploadFiles = useCallback(async (fileList: File[]) => {
    setIsUploading(true);
    setUploadProgress(null);
    
    try {
      const results = await localMusicClient.uploadFiles(
        fileList,
        (progress) => setUploadProgress(progress),
        (file) => toast({ title: 'Arquivo enviado', description: file.filename })
      );
      
      toast({ title: 'Upload completo', description: `${results.length} arquivo(s) enviados` });
      await fetchFiles();
      return results;
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload', variant: 'destructive' });
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [toast, fetchFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    setIsLoading(true);
    try {
      await localMusicClient.deleteFile(fileId);
      toast({ title: 'Arquivo removido' });
      await fetchFiles();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover arquivo', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchFiles]);

  const bulkDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    
    setIsLoading(true);
    try {
      const result = await localMusicClient.deleteFiles(Array.from(selectedFiles));
      toast({ title: 'Arquivos removidos', description: `${result.deleted} arquivo(s) removidos` });
      setSelectedFiles(new Set());
      await fetchFiles();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover arquivos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, toast, fetchFiles]);

  // ==================== SYNC OPERATIONS ====================

  const syncToUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await localMusicClient.syncToUser(userId);
      toast({ 
        title: 'Sincronização iniciada', 
        description: `Sincronizando para ${result.username}` 
      });
      await fetchSyncStatus();
    } catch {
      toast({ title: 'Erro', description: 'Falha na sincronização', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSyncStatus]);

  const syncToAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await localMusicClient.syncToAllUsers();
      toast({ 
        title: 'Sincronização em massa iniciada', 
        description: `Sincronizando para ${results.length} usuário(s)` 
      });
      await fetchSyncStatus();
    } catch {
      toast({ title: 'Erro', description: 'Falha na sincronização', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSyncStatus]);

  // ==================== PLAYLIST OPERATIONS ====================

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    setIsLoading(true);
    try {
      const playlist = await localMusicClient.createPlaylist(
        name, 
        description, 
        Array.from(selectedFiles)
      );
      toast({ title: 'Playlist criada', description: playlist.name });
      setSelectedFiles(new Set());
      await fetchPlaylists();
      return playlist;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar playlist', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, toast, fetchPlaylists]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    setIsLoading(true);
    try {
      await localMusicClient.deletePlaylist(playlistId);
      toast({ title: 'Playlist removida' });
      await fetchPlaylists();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover playlist', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchPlaylists]);

  const addToPlaylist = useCallback(async (playlistId: string, trackIds: string[]) => {
    setIsLoading(true);
    try {
      await localMusicClient.addToPlaylist(playlistId, trackIds);
      toast({ title: 'Adicionado à playlist' });
      await fetchPlaylists();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar à playlist', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchPlaylists]);

  // ==================== INSTANCE OPERATIONS ====================

  const registerInstance = useCallback(async (url: string, name: string) => {
    setIsLoading(true);
    try {
      const instance = await localMusicClient.registerInstance(url, name);
      toast({ title: 'Instância registrada', description: instance.name });
      await fetchInstances();
      return instance;
    } catch {
      toast({ title: 'Erro', description: 'Falha ao registrar instância', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchInstances]);

  const removeInstance = useCallback(async (instanceId: string) => {
    setIsLoading(true);
    try {
      await localMusicClient.removeInstance(instanceId);
      toast({ title: 'Instância removida' });
      await fetchInstances();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover instância', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchInstances]);

  const replicateToInstance = useCallback(async (instanceId: string) => {
    setIsLoading(true);
    try {
      const result = await localMusicClient.replicateToInstance(
        instanceId, 
        selectedFiles.size > 0 ? Array.from(selectedFiles) : undefined
      );
      
      if (result.success) {
        toast({ 
          title: 'Replicação concluída', 
          description: `${result.filesReplicated} arquivo(s) replicados para ${result.instanceName}` 
        });
      } else {
        toast({ 
          title: 'Replicação falhou', 
          description: result.errorMessage, 
          variant: 'destructive' 
        });
      }
      
      await fetchInstances();
      return result;
    } catch {
      toast({ title: 'Erro', description: 'Falha na replicação', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, toast, fetchInstances]);

  const replicateToAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await localMusicClient.replicateToAll(
        selectedFiles.size > 0 ? Array.from(selectedFiles) : undefined
      );
      
      const successful = results.filter(r => r.success).length;
      toast({ 
        title: 'Replicação em massa', 
        description: `${successful}/${results.length} instância(s) replicadas com sucesso` 
      });
      
      await fetchInstances();
      return results;
    } catch {
      toast({ title: 'Erro', description: 'Falha na replicação', variant: 'destructive' });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles, toast, fetchInstances]);

  // ==================== CONFIG OPERATIONS ====================

  const updateReplicationConfig = useCallback(async (settings: Partial<ConfigReplicationSettings>) => {
    setIsLoading(true);
    try {
      const updated = await localMusicClient.updateReplicationSettings(settings);
      setReplicationSettings(updated);
      toast({ title: 'Configurações salvas' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar configurações', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const replicateConfigToAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await localMusicClient.replicateConfigToAll();
      toast({ 
        title: 'Configurações replicadas', 
        description: `Replicado para ${result.instances.length} instância(s)` 
      });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao replicar configurações', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ==================== SELECTION ====================

  const toggleSelect = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedFiles(new Set(files.map(f => f.id)));
  }, [files]);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // ==================== INITIAL FETCH ====================

  useEffect(() => {
    fetchFiles();
    fetchPlaylists();
    fetchSyncStatus();
    fetchInstances();
    fetchReplicationSettings();
  }, [fetchFiles, fetchPlaylists, fetchSyncStatus, fetchInstances, fetchReplicationSettings]);

  return {
    // Data
    files,
    playlists,
    syncStatus,
    instances,
    replicationSettings,
    
    // State
    isLoading,
    isUploading,
    uploadProgress,
    error,
    
    // Selection
    selectedFiles,
    toggleSelect,
    selectAll,
    clearSelection,
    
    // File operations
    uploadFiles,
    deleteFile,
    bulkDelete,
    refreshFiles: fetchFiles,
    
    // Sync operations
    syncToUser,
    syncToAllUsers,
    refreshSyncStatus: fetchSyncStatus,
    
    // Playlist operations
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    
    // Instance operations
    registerInstance,
    removeInstance,
    replicateToInstance,
    replicateToAll,
    
    // Config operations
    updateReplicationConfig,
    replicateConfigToAll,
  };
}
