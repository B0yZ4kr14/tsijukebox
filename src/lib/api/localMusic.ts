// Local Music API Client

export interface LocalMusicFile {
  id: string;
  filename: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  size: number;
  path: string;
  uploadedAt: string;
  uploadedBy: string;
  genre?: string;
  year?: number;
  coverUrl?: string;
}

export interface MusicUploadProgress {
  file: string;
  loaded: number;
  total: number;
  percentage: number;
}

export interface UserMusicSync {
  userId: string;
  username: string;
  homePath: string;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'error';
  lastSync: string | null;
  filesCount: number;
  errorMessage?: string;
}

export interface JukeboxInstance {
  id: string;
  name: string;
  url: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'unknown';
  version?: string;
  musicCount?: number;
}

export interface ReplicationResult {
  instanceId: string;
  instanceName: string;
  success: boolean;
  filesReplicated: number;
  errorMessage?: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfigReplicationSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  includeCovers: boolean;
  includeMetadata: boolean;
  compressTransfer: boolean;
}

class LocalMusicClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/local-music') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }

  // ==================== FILE MANAGEMENT ====================

  async listFiles(): Promise<LocalMusicFile[]> {
    return this.request<LocalMusicFile[]>('/files');
  }

  async getFile(fileId: string): Promise<LocalMusicFile> {
    return this.request<LocalMusicFile>(`/files/${fileId}`);
  }

  async uploadFile(
    file: File, 
    onProgress?: (progress: MusicUploadProgress) => void
  ): Promise<LocalMusicFile> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            file: file.name,
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseUrl}/upload`);
      xhr.send(formData);
    });
  }

  async uploadFiles(
    files: File[],
    onProgress?: (progress: MusicUploadProgress) => void,
    onFileComplete?: (file: LocalMusicFile) => void
  ): Promise<LocalMusicFile[]> {
    const results: LocalMusicFile[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, onProgress);
        results.push(result);
        onFileComplete?.(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
    
    return results;
  }

  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async deleteFiles(fileIds: string[]): Promise<{ success: boolean; deleted: number }> {
    return this.request<{ success: boolean; deleted: number }>('/files/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ fileIds }),
    });
  }

  async updateMetadata(fileId: string, metadata: Partial<LocalMusicFile>): Promise<LocalMusicFile> {
    return this.request<LocalMusicFile>(`/files/${fileId}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
    });
  }

  // ==================== USER SYNC ====================

  async getSystemUsers(): Promise<UserMusicSync[]> {
    return this.request<UserMusicSync[]>('/sync/users');
  }

  async syncToUser(userId: string): Promise<UserMusicSync> {
    return this.request<UserMusicSync>(`/sync/user/${userId}`, {
      method: 'POST',
    });
  }

  async syncToAllUsers(): Promise<UserMusicSync[]> {
    return this.request<UserMusicSync[]>('/sync/all-users', {
      method: 'POST',
    });
  }

  async getSyncStatus(): Promise<UserMusicSync[]> {
    return this.request<UserMusicSync[]>('/sync/status');
  }

  // ==================== PLAYLIST MANAGEMENT ====================

  async listPlaylists(): Promise<MusicPlaylist[]> {
    return this.request<MusicPlaylist[]>('/playlists');
  }

  async createPlaylist(name: string, description?: string, trackIds?: string[]): Promise<MusicPlaylist> {
    return this.request<MusicPlaylist>('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description, trackIds: trackIds || [] }),
    });
  }

  async updatePlaylist(playlistId: string, updates: Partial<MusicPlaylist>): Promise<MusicPlaylist> {
    return this.request<MusicPlaylist>(`/playlists/${playlistId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deletePlaylist(playlistId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/playlists/${playlistId}`, {
      method: 'DELETE',
    });
  }

  async addToPlaylist(playlistId: string, trackIds: string[]): Promise<MusicPlaylist> {
    return this.request<MusicPlaylist>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ trackIds }),
    });
  }

  async removeFromPlaylist(playlistId: string, trackIds: string[]): Promise<MusicPlaylist> {
    return this.request<MusicPlaylist>(`/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      body: JSON.stringify({ trackIds }),
    });
  }

  // ==================== INSTANCE REPLICATION ====================

  async getRegisteredInstances(): Promise<JukeboxInstance[]> {
    return this.request<JukeboxInstance[]>('/instances');
  }

  async registerInstance(url: string, name: string): Promise<JukeboxInstance> {
    return this.request<JukeboxInstance>('/instances', {
      method: 'POST',
      body: JSON.stringify({ url, name }),
    });
  }

  async updateInstance(instanceId: string, updates: Partial<JukeboxInstance>): Promise<JukeboxInstance> {
    return this.request<JukeboxInstance>(`/instances/${instanceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async removeInstance(instanceId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/instances/${instanceId}`, {
      method: 'DELETE',
    });
  }

  async pingInstance(instanceId: string): Promise<{ online: boolean; latency: number }> {
    return this.request<{ online: boolean; latency: number }>(`/instances/${instanceId}/ping`);
  }

  async replicateToInstance(instanceId: string, fileIds?: string[]): Promise<ReplicationResult> {
    return this.request<ReplicationResult>(`/instances/${instanceId}/replicate`, {
      method: 'POST',
      body: JSON.stringify({ fileIds }),
    });
  }

  async replicateToAll(fileIds?: string[]): Promise<ReplicationResult[]> {
    return this.request<ReplicationResult[]>('/instances/replicate-all', {
      method: 'POST',
      body: JSON.stringify({ fileIds }),
    });
  }

  // ==================== CONFIG REPLICATION ====================

  async getReplicationSettings(): Promise<ConfigReplicationSettings> {
    return this.request<ConfigReplicationSettings>('/config/replication');
  }

  async updateReplicationSettings(settings: Partial<ConfigReplicationSettings>): Promise<ConfigReplicationSettings> {
    return this.request<ConfigReplicationSettings>('/config/replication', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async replicateConfigToAll(): Promise<{ success: boolean; instances: string[] }> {
    return this.request<{ success: boolean; instances: string[] }>('/config/replicate', {
      method: 'POST',
    });
  }

  // ==================== STATISTICS ====================

  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalDuration: number;
    genreDistribution: Record<string, number>;
    artistCount: number;
    albumCount: number;
  }> {
    return this.request('/stats');
  }
}

export const localMusicClient = new LocalMusicClient();
