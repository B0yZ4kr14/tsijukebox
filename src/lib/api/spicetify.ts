import { API_BASE_URL, ApiError } from './client';

export interface SpicetifyStatus {
  installed: boolean;
  version: string;
  currentTheme: string;
  colorScheme: string;
  configPath: string;
}

export interface SpicetifyTheme {
  name: string;
  author: string;
  preview: string | null;
  isActive: boolean;
  isFromMarketplace?: boolean;
}

export interface SpicetifyExtension {
  name: string;
  enabled: boolean;
  description: string;
  isFromMarketplace?: boolean;
}

export interface SpicetifySnippet {
  name: string;
  code: string;
  enabled: boolean;
  description?: string;
}

export interface SpicetifyCustomApp {
  name: string;
  path: string;
  enabled: boolean;
}

export interface SpicetifyConfig {
  spotify_path: string;
  prefs_path: string;
  current_theme: string;
  color_scheme: string;
  inject_css: boolean;
  replace_colors: boolean;
  overwrite_assets: boolean;
}

export interface SpicetifyMarketplaceItem {
  name: string;
  author: string;
  description: string;
  preview: string;
  readme: string;
  tags: string[];
  installed: boolean;
  stars: number;
  type: 'theme' | 'extension' | 'app';
}

class SpicetifyClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new ApiError(`HTTP ${response.status}`, 'server', response.status);
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') throw new ApiError('Request timeout', 'timeout');
      throw new ApiError('Network error', 'network');
    }
  }

  async getStatus(): Promise<SpicetifyStatus> { return this.request<SpicetifyStatus>('/spicetify/status'); }
  async listThemes(): Promise<SpicetifyTheme[]> { return this.request<SpicetifyTheme[]>('/spicetify/themes'); }
  async applyTheme(name: string): Promise<{ success: boolean }> {
    return this.request('/spicetify/themes/apply', { method: 'POST', body: JSON.stringify({ name }) });
  }
  async listExtensions(): Promise<SpicetifyExtension[]> { return this.request<SpicetifyExtension[]>('/spicetify/extensions'); }
  async toggleExtension(name: string, enabled: boolean): Promise<{ success: boolean }> {
    return this.request('/spicetify/extensions/toggle', { method: 'POST', body: JSON.stringify({ name, enabled }) });
  }
  async backup(): Promise<{ success: boolean; path: string }> { return this.request('/spicetify/backup', { method: 'POST' }); }
  async restore(): Promise<{ success: boolean }> { return this.request('/spicetify/restore', { method: 'POST' }); }
  async refresh(): Promise<{ success: boolean }> { return this.request('/spicetify/refresh', { method: 'POST' }); }

  // Marketplace
  async getMarketplaceThemes(): Promise<SpicetifyMarketplaceItem[]> { return this.request<SpicetifyMarketplaceItem[]>('/spicetify/marketplace/themes'); }
  async getMarketplaceExtensions(): Promise<SpicetifyMarketplaceItem[]> { return this.request<SpicetifyMarketplaceItem[]>('/spicetify/marketplace/extensions'); }
  async installFromMarketplace(type: 'theme' | 'extension', name: string): Promise<{ success: boolean }> {
    return this.request('/spicetify/marketplace/install', { method: 'POST', body: JSON.stringify({ type, name }) });
  }
  async uninstallItem(type: 'theme' | 'extension', name: string): Promise<{ success: boolean }> {
    return this.request('/spicetify/marketplace/uninstall', { method: 'POST', body: JSON.stringify({ type, name }) });
  }

  // Config
  async getConfig(): Promise<SpicetifyConfig> { return this.request<SpicetifyConfig>('/spicetify/config'); }
  async setConfig(key: string, value: string | boolean): Promise<{ success: boolean }> {
    return this.request('/spicetify/config', { method: 'POST', body: JSON.stringify({ key, value }) });
  }

  // Snippets
  async listSnippets(): Promise<SpicetifySnippet[]> { return this.request<SpicetifySnippet[]>('/spicetify/snippets'); }
  async addSnippet(name: string, code: string): Promise<{ success: boolean }> {
    return this.request('/spicetify/snippets', { method: 'POST', body: JSON.stringify({ name, code }) });
  }
  async removeSnippet(name: string): Promise<{ success: boolean }> {
    return this.request(`/spicetify/snippets/${encodeURIComponent(name)}`, { method: 'DELETE' });
  }
  async toggleSnippet(name: string, enabled: boolean): Promise<{ success: boolean }> {
    return this.request('/spicetify/snippets/toggle', { method: 'POST', body: JSON.stringify({ name, enabled }) });
  }

  // Custom Apps
  async listCustomApps(): Promise<SpicetifyCustomApp[]> { return this.request<SpicetifyCustomApp[]>('/spicetify/apps'); }
  async toggleCustomApp(name: string, enabled: boolean): Promise<{ success: boolean }> {
    return this.request('/spicetify/apps/toggle', { method: 'POST', body: JSON.stringify({ name, enabled }) });
  }

  // Advanced
  async update(): Promise<{ success: boolean; version: string }> { return this.request('/spicetify/update', { method: 'POST' }); }
  async clear(): Promise<{ success: boolean }> { return this.request('/spicetify/clear', { method: 'POST' }); }
  async apply(): Promise<{ success: boolean }> { return this.request('/spicetify/apply', { method: 'POST' }); }
}

export const spicetifyClient = new SpicetifyClient();
