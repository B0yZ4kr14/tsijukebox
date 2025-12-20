import type { 
  SystemStatus, 
  PlaybackAction, 
  VolumeControl, 
  Track, 
  LogEntry, 
  Feedback,
  PlaybackQueue,
} from './types';

/**
 * API Base URL Configuration
 * Priority: VITE_API_URL env var > Production default > Development fallback
 */
function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname === 'midiaserver.local') {
    return 'https://midiaserver.local/api';
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api';
  }
  
  return 'https://midiaserver.local/api';
}

export const API_BASE_URL = getApiBaseUrl();

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 5000;

// Circuit Breaker Configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  halfOpenRequests: 3,
};

// Retry Configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
  retryableStatuses: [408, 429, 500, 502, 503, 504] as number[],
};

export type ApiErrorType = 'network' | 'timeout' | 'server' | 'circuit_open' | 'rate_limit' | 'unknown';

export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  retryable: boolean;

  constructor(message: string, type: ApiErrorType, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.retryable = type === 'timeout' || type === 'network' || 
      (status !== undefined && RETRY_CONFIG.retryableStatuses.includes(status));
  }
}

// Circuit Breaker State
type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  halfOpenSuccesses: number;
}

// Request/Response Interceptor Types
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor<T> = (response: T) => T | Promise<T>;
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// Cache Entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private circuitBreaker: CircuitBreakerState;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<unknown>[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  constructor(baseUrl: string, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.circuitBreaker = {
      state: 'closed',
      failures: 0,
      lastFailureTime: 0,
      halfOpenSuccesses: 0,
    };
    
    // Default logging interceptor
    this.addRequestInterceptor((config) => {
      if (import.meta.env.DEV) {
        console.log(`[API] Request: ${config.method || 'GET'}`);
      }
      return config;
    });
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor<unknown>);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor as ResponseInterceptor<unknown>);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  // Circuit Breaker Logic
  private checkCircuitBreaker(): void {
    if (this.circuitBreaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      if (timeSinceLastFailure >= CIRCUIT_BREAKER_CONFIG.resetTimeoutMs) {
        this.circuitBreaker.state = 'half-open';
        this.circuitBreaker.halfOpenSuccesses = 0;
        console.log('[API] Circuit breaker: HALF-OPEN');
      } else {
        throw new ApiError(
          `Circuit breaker is open. Retry in ${Math.ceil((CIRCUIT_BREAKER_CONFIG.resetTimeoutMs - timeSinceLastFailure) / 1000)}s`,
          'circuit_open'
        );
      }
    }
  }

  private recordSuccess(): void {
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.halfOpenSuccesses++;
      if (this.circuitBreaker.halfOpenSuccesses >= CIRCUIT_BREAKER_CONFIG.halfOpenRequests) {
        this.circuitBreaker.state = 'closed';
        this.circuitBreaker.failures = 0;
        console.log('[API] Circuit breaker: CLOSED');
      }
    } else if (this.circuitBreaker.state === 'closed') {
      this.circuitBreaker.failures = 0;
    }
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.state = 'open';
      console.log('[API] Circuit breaker: OPEN (half-open failure)');
    } else if (this.circuitBreaker.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      this.circuitBreaker.state = 'open';
      console.log('[API] Circuit breaker: OPEN (threshold exceeded)');
    }
  }

  // Exponential Backoff Retry
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = RETRY_CONFIG.maxRetries
  ): Promise<T> {
    let lastError: ApiError | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this.checkCircuitBreaker();
        const result = await operation();
        this.recordSuccess();
        return result;
      } catch (error) {
        lastError = error instanceof ApiError ? error : new ApiError(String(error), 'unknown');
        
        if (!lastError.retryable || attempt === retries) {
          this.recordFailure();
          throw lastError;
        }
        
        const delay = Math.min(
          RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
          RETRY_CONFIG.maxDelayMs
        );
        
        console.log(`[API] Retry ${attempt + 1}/${retries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError ?? new ApiError('Max retries exceeded', 'unknown');
  }

  // Cache Methods
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    if (age > entry.staleTime * 2) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, staleTime: number = 30000): void {
    this.cache.set(key, { data, timestamp: Date.now(), staleTime });
  }

  private getAuthHeaders(): HeadersInit {
    const token = sessionStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string, 
    options?: RequestInit & { timeout?: number; useCache?: boolean; staleTime?: number }
  ): Promise<T> {
    const { useCache = false, staleTime = 30000, timeout: customTimeout, ...fetchOptions } = options ?? {};
    const cacheKey = `${endpoint}:${JSON.stringify(fetchOptions.body || '')}`;
    
    // Check cache for GET requests
    if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      const cached = this.getCached<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Apply request interceptors
    let config: RequestInit = {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...fetchOptions?.headers,
      },
    };
    
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    const controller = new AbortController();
    const timeoutMs = customTimeout ?? this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        
        if (response.status === 429) {
          throw new ApiError('Rate limit exceeded', 'rate_limit', response.status);
        }
        
        throw new ApiError(
          errorText || `HTTP ${response.status}: ${response.statusText}`,
          response.status >= 500 ? 'server' : 'unknown',
          response.status
        );
      }

      let result: T = await response.json();
      
      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        result = await interceptor(result) as T;
      }
      
      // Cache successful GET responses
      if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
        this.setCache(cacheKey, result, staleTime);
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      let apiError: ApiError;
      
      if (error instanceof ApiError) {
        apiError = error;
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = new ApiError(`Request timeout after ${timeoutMs}ms`, 'timeout');
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          apiError = new ApiError('Network error - server unreachable', 'network');
        } else {
          apiError = new ApiError(error.message, 'unknown');
        }
      } else {
        apiError = new ApiError('Unknown error occurred', 'unknown');
      }
      
      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        apiError = await interceptor(apiError);
      }
      
      throw apiError;
    }
  }

  // Public API with retry wrapper
  async healthCheck(): Promise<{ status: string; service: string; version: string; timestamp: string }> {
    return this.withRetry(() => this.request('/health', { useCache: true, staleTime: 10000 }));
  }

  async getMetrics(): Promise<string> {
    return this.withRetry(async () => {
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
    });
  }

  async getStatus(): Promise<SystemStatus> {
    return this.withRetry(() => this.request<SystemStatus>('/status', { useCache: true, staleTime: 5000 }));
  }

  async controlPlayback(action: PlaybackAction): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/play', { 
      method: 'POST', 
      body: JSON.stringify(action) 
    }));
  }

  async stop(): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/play', { 
      method: 'POST', 
      body: JSON.stringify({ action: 'stop' }) 
    }));
  }

  async seek(positionSeconds: number): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/seek', { 
      method: 'POST', 
      body: JSON.stringify({ position: positionSeconds }) 
    }));
  }

  async setVolume(control: VolumeControl): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/volume', { 
      method: 'POST', 
      body: JSON.stringify(control) 
    }));
  }

  async getLogs(limit: number = 100): Promise<LogEntry[]> {
    return this.withRetry(() => this.request<LogEntry[]>(`/admin/logs?limit=${limit}`));
  }

  async getLibrary(): Promise<Track[]> {
    return this.withRetry(() => this.request<Track[]>('/admin/library', { useCache: true, staleTime: 60000 }));
  }

  async deleteTrack(trackId: string): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request(`/admin/library/${trackId}`, { method: 'DELETE' }));
  }

  async playTrack(trackId: string): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request(`/admin/library/${trackId}/play`, { method: 'POST' }));
  }

  async uploadFiles(files: FileList): Promise<{ uploaded: number; failed: number }> {
    return this.withRetry(async () => {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('files', file));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

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
    });
  }

  async getFeedback(): Promise<Feedback[]> {
    return this.withRetry(() => this.request<Feedback[]>('/admin/feedback'));
  }

  async playSpotifyUri(uri: string): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/play/uri', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    }));
  }

  async setShuffle(enabled: boolean): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/player/shuffle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }));
  }

  async setRepeat(mode: 'off' | 'track' | 'context'): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/player/repeat', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }));
  }

  async getQueue(): Promise<PlaybackQueue> {
    return this.withRetry(() => this.request<PlaybackQueue>('/player/queue', { useCache: true, staleTime: 5000 }));
  }

  async addToQueue(uri: string): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/player/queue', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    }));
  }

  async removeFromQueue(id: string): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request(`/player/queue/${id}`, {
      method: 'DELETE',
    }));
  }

  async clearQueue(): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/player/queue', {
      method: 'DELETE',
    }));
  }

  async reorderQueue(trackId: string, fromIndex: number, toIndex: number): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/player/queue/reorder', {
      method: 'POST',
      body: JSON.stringify({ trackId, fromIndex, toIndex }),
    }));
  }

  async reloadServices(): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/system/reload', { method: 'POST' }));
  }

  async rebootSystem(): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/system/reboot', { method: 'POST' }));
  }

  async getBackupSchedule(): Promise<{ enabled: boolean; frequency: string; time: string; retention: number }> {
    return this.withRetry(() => this.request('/backup/schedule', { useCache: true, staleTime: 60000 }));
  }

  async setBackupSchedule(schedule: { enabled: boolean; frequency: string; time: string; retention: number }): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request('/backup/schedule', {
      method: 'POST',
      body: JSON.stringify(schedule),
    }));
  }

  async getUsers(): Promise<{ id: string; username: string; role: string; createdAt: string }[]> {
    return this.withRetry(() => this.request('/users'));
  }

  async createUser(user: { username: string; password: string; role: string }): Promise<{ success: boolean; id: string }> {
    return this.withRetry(() => this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }));
  }

  async updateUser(id: string, updates: { role?: string; password?: string }): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }));
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return this.withRetry(() => this.request(`/users/${id}`, { method: 'DELETE' }));
  }
  
  // Utility methods
  getCircuitBreakerState(): CircuitState {
    return this.circuitBreaker.state;
  }
  
  resetCircuitBreaker(): void {
    this.circuitBreaker = {
      state: 'closed',
      failures: 0,
      lastFailureTime: 0,
      halfOpenSuccesses: 0,
    };
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}

export const api = new ApiClient(API_BASE_URL);
