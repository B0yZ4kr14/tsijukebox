import type { 
  SystemStatus, 
  PlaybackAction, 
  VolumeControl, 
  Track, 
  LogEntry, 
  Feedback 
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = sessionStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }

    return response.json();
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
    
    const response = await fetch(`${this.baseUrl}/admin/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/admin/feedback');
  }
}

export const api = new ApiClient(API_BASE_URL);
