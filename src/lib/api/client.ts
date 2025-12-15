import type { 
  SystemStatus, 
  PlaybackAction, 
  VolumeControl, 
  Track, 
  LogEntry, 
  Feedback 
} from './types';

/**
 * API Base URL Configuration
 * Priority: VITE_API_URL env var > Production default > Development fallback
 */
function getApiBaseUrl(): string {
  // 1. Explicit env var takes priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Production detection (running on midiaserver.local)
  if (typeof window !== 'undefined' && window.location.hostname === 'midiaserver.local') {
    return 'https://midiaserver.local/api';
  }
  
  // 3. Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api';
  }
  
  // 4. Default production URL
  return 'https://midiaserver.local/api';
}

export const API_BASE_URL = getApiBaseUrl();

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 5000;

export type ApiErrorType = 'network' | 'timeout' | 'server' | 'unknown';

export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;

  constructor(message: string, type: ApiErrorType, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
  }
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private getAuthHeaders(): HeadersInit {
    const token = sessionStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string, 
    options?: RequestInit & { timeout?: number }
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const controller = new AbortController();
    const timeoutMs = options?.timeout ?? this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new ApiError(
          errorText || `HTTP ${response.status}: ${response.statusText}`,
          response.status >= 500 ? 'server' : 'unknown',
          response.status
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(`Request timeout after ${timeoutMs}ms`, 'timeout');
        }
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new ApiError('Network error - server unreachable', 'network');
        }
      }
      
      throw new ApiError('Unknown error occurred', 'unknown');
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; service: string; version: string; timestamp: string }> {
    return this.request('/health');
  }

  // Metrics endpoint (Prometheus format - returns text)
  async getMetrics(): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/metrics`, {
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new ApiError(`Metrics Error: ${response.status}`, 'server', response.status);
      }
      return response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch metrics', 'network');
    }
  }

  // Public endpoints
  async getStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/status');
  }

  // Player control endpoints
  async controlPlayback(action: PlaybackAction): Promise<{ success: boolean }> {
    return this.request('/play', { 
      method: 'POST', 
      body: JSON.stringify(action) 
    });
  }

  async stop(): Promise<{ success: boolean }> {
    return this.request('/play', { 
      method: 'POST', 
      body: JSON.stringify({ action: 'stop' }) 
    });
  }

  async seek(positionSeconds: number): Promise<{ success: boolean }> {
    return this.request('/seek', { 
      method: 'POST', 
      body: JSON.stringify({ position: positionSeconds }) 
    });
  }

  async setVolume(control: VolumeControl): Promise<{ success: boolean }> {
    return this.request('/volume', { 
      method: 'POST', 
      body: JSON.stringify(control) 
    });
  }

  // Admin endpoints
  async getLogs(limit: number = 100): Promise<LogEntry[]> {
    return this.request<LogEntry[]>(`/admin/logs?limit=${limit}`);
  }

  async getLibrary(): Promise<Track[]> {
    return this.request<Track[]>('/admin/library');
  }

  async deleteTrack(trackId: string): Promise<{ success: boolean }> {
    return this.request(`/admin/library/${trackId}`, { method: 'DELETE' });
  }

  async playTrack(trackId: string): Promise<{ success: boolean }> {
    return this.request(`/admin/library/${trackId}/play`, { method: 'POST' });
  }

  async uploadFiles(files: FileList): Promise<{ uploaded: number; failed: number }> {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for uploads

    try {
      const response = await fetch(`${this.baseUrl}/admin/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Upload failed: ${response.status}`, 'server', response.status);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Upload failed - network error', 'network');
    }
  }

  async getFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/admin/feedback');
  }
}

export const api = new ApiClient(API_BASE_URL);
