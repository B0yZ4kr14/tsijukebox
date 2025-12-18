import { API_BASE_URL, ApiError } from './client';

export interface StorjBucket {
  name: string;
  created_at: string;
  versioning_enabled: boolean;
  object_lock_enabled: boolean;
}

export interface StorjObject {
  key: string;
  size: number;
  last_modified: string;
  etag: string;
  storage_class: string;
  version_id?: string;
}

export interface StorjUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StorjVersionInfo {
  version_id: string;
  last_modified: string;
  size: number;
  is_latest: boolean;
}

export interface StorjRetentionConfig {
  mode: 'governance' | 'compliance';
  retain_until: string;
}

export interface StorjConfig {
  access_grant: string;
  endpoint?: string;
  region?: string;
}

export interface StorjStorageStats {
  total_objects: number;
  total_size: number;
  buckets_count: number;
}

class StorjClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, 'server', response.status);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 'timeout');
      }
      throw new ApiError('Network error', 'network');
    }
  }

  // Configuration
  async testConnection(accessGrant: string): Promise<{ success: boolean; message: string }> {
    return this.request('/storj/test', {
      method: 'POST',
      body: JSON.stringify({ access_grant: accessGrant }),
    });
  }

  async getConfig(): Promise<StorjConfig> {
    return this.request<StorjConfig>('/storj/config');
  }

  async setConfig(config: StorjConfig): Promise<{ success: boolean }> {
    return this.request('/storj/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Buckets
  async listBuckets(): Promise<StorjBucket[]> {
    return this.request<StorjBucket[]>('/storj/buckets');
  }

  async createBucket(
    name: string, 
    options?: { versioning?: boolean; objectLock?: boolean }
  ): Promise<{ success: boolean }> {
    return this.request('/storj/buckets', {
      method: 'POST',
      body: JSON.stringify({ name, ...options }),
    });
  }

  async deleteBucket(name: string): Promise<{ success: boolean }> {
    return this.request(`/storj/buckets/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  async getBucketInfo(name: string): Promise<StorjBucket> {
    return this.request<StorjBucket>(`/storj/buckets/${encodeURIComponent(name)}`);
  }

  async enableVersioning(bucketName: string): Promise<{ success: boolean }> {
    return this.request(`/storj/buckets/${encodeURIComponent(bucketName)}/versioning`, {
      method: 'PUT',
      body: JSON.stringify({ enabled: true }),
    });
  }

  // Objects
  async listObjects(bucket: string, prefix?: string): Promise<StorjObject[]> {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    const query = params.toString() ? `?${params}` : '';
    return this.request<StorjObject[]>(`/storj/buckets/${encodeURIComponent(bucket)}/objects${query}`);
  }

  async uploadObject(
    bucket: string, 
    key: string, 
    file: File,
    onProgress?: (progress: StorjUploadProgress) => void
  ): Promise<{ success: boolean; etag: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new ApiError(`HTTP ${xhr.status}`, 'server', xhr.status));
        }
      };

      xhr.onerror = () => reject(new ApiError('Network error', 'network'));
      xhr.ontimeout = () => reject(new ApiError('Request timeout', 'timeout'));

      xhr.open('POST', `${this.baseUrl}/storj/buckets/${encodeURIComponent(bucket)}/upload`);
      xhr.timeout = this.timeout;
      xhr.send(formData);
    });
  }

  async downloadObject(bucket: string, key: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}/download`
    );
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, 'server', response.status);
    }
    return response.blob();
  }

  async deleteObject(bucket: string, key: string): Promise<{ success: boolean }> {
    return this.request(`/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  async copyObject(
    sourceBucket: string, 
    sourceKey: string, 
    destBucket: string, 
    destKey: string
  ): Promise<{ success: boolean }> {
    return this.request('/storj/objects/copy', {
      method: 'POST',
      body: JSON.stringify({
        source_bucket: sourceBucket,
        source_key: sourceKey,
        dest_bucket: destBucket,
        dest_key: destKey,
      }),
    });
  }

  // Presigned URLs
  async getPresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    const result = await this.request<{ url: string }>(
      `/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}/presign?expires=${expiresIn}`
    );
    return result.url;
  }

  async getUploadPresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    const result = await this.request<{ url: string }>(
      `/storj/buckets/${encodeURIComponent(bucket)}/upload-presign`,
      {
        method: 'POST',
        body: JSON.stringify({ key, expires_in: expiresIn }),
      }
    );
    return result.url;
  }

  // Versioning
  async listObjectVersions(bucket: string, key: string): Promise<StorjVersionInfo[]> {
    return this.request<StorjVersionInfo[]>(
      `/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}/versions`
    );
  }

  async restoreVersion(bucket: string, key: string, versionId: string): Promise<{ success: boolean }> {
    return this.request(`/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}/restore`, {
      method: 'POST',
      body: JSON.stringify({ version_id: versionId }),
    });
  }

  // Object Lock
  async setRetention(
    bucket: string, 
    key: string, 
    mode: 'governance' | 'compliance', 
    retainUntil: Date
  ): Promise<{ success: boolean }> {
    return this.request(`/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}/retention`, {
      method: 'PUT',
      body: JSON.stringify({ 
        mode, 
        retain_until: retainUntil.toISOString() 
      }),
    });
  }

  async setLegalHold(bucket: string, key: string, enabled: boolean): Promise<{ success: boolean }> {
    return this.request(`/storj/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}/legal-hold`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  // Storage Stats
  async getStorageStats(): Promise<StorjStorageStats> {
    return this.request<StorjStorageStats>('/storj/stats');
  }

  // Backup Operations
  async createBackup(bucketName: string): Promise<{ success: boolean; key: string }> {
    return this.request('/storj/backup', {
      method: 'POST',
      body: JSON.stringify({ bucket: bucketName }),
    });
  }

  async restoreBackup(bucketName: string, key: string): Promise<{ success: boolean }> {
    return this.request('/storj/restore', {
      method: 'POST',
      body: JSON.stringify({ bucket: bucketName, key }),
    });
  }

  async scheduleBackup(config: {
    bucket: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retention: number;
  }): Promise<{ success: boolean }> {
    return this.request('/storj/backup/schedule', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}

export const storjClient = new StorjClient();
