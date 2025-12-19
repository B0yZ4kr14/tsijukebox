import { useState, useEffect, useCallback } from 'react';
import { spicetifyClient, SpicetifyStatus, SpicetifyTheme, SpicetifyExtension, SpicetifySnippet, SpicetifyCustomApp, SpicetifyConfig, SpicetifyMarketplaceItem } from '@/lib/api/spicetify';
import { useToast } from '@/hooks/common';

export function useSpicetifyIntegration() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SpicetifyStatus | null>(null);
  const [themes, setThemes] = useState<SpicetifyTheme[]>([]);
  const [extensions, setExtensions] = useState<SpicetifyExtension[]>([]);
  const [snippets, setSnippets] = useState<SpicetifySnippet[]>([]);
  const [customApps, setCustomApps] = useState<SpicetifyCustomApp[]>([]);
  const [config, setConfig] = useState<SpicetifyConfig | null>(null);
  const [marketplaceThemes, setMarketplaceThemes] = useState<SpicetifyMarketplaceItem[]>([]);
  const [marketplaceExtensions, setMarketplaceExtensions] = useState<SpicetifyMarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const data = await spicetifyClient.getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Spicetify não detectado');
      setStatus(null);
    }
  }, []);

  // Fetch themes
  const fetchThemes = useCallback(async () => {
    try {
      const data = await spicetifyClient.listThemes();
      setThemes(data);
    } catch {
      setThemes([]);
    }
  }, []);

  // Fetch extensions
  const fetchExtensions = useCallback(async () => {
    try {
      const data = await spicetifyClient.listExtensions();
      setExtensions(data);
    } catch {
      setExtensions([]);
    }
  }, []);

  // Fetch snippets
  const fetchSnippets = useCallback(async () => {
    try {
      const data = await spicetifyClient.listSnippets();
      setSnippets(data);
    } catch {
      setSnippets([]);
    }
  }, []);

  // Fetch custom apps
  const fetchCustomApps = useCallback(async () => {
    try {
      const data = await spicetifyClient.listCustomApps();
      setCustomApps(data);
    } catch {
      setCustomApps([]);
    }
  }, []);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      const data = await spicetifyClient.getConfig();
      setConfig(data);
    } catch {
      setConfig(null);
    }
  }, []);

  // Fetch marketplace themes
  const fetchMarketplaceThemes = useCallback(async () => {
    try {
      const data = await spicetifyClient.getMarketplaceThemes();
      setMarketplaceThemes(data);
    } catch {
      setMarketplaceThemes([]);
    }
  }, []);

  // Fetch marketplace extensions
  const fetchMarketplaceExtensions = useCallback(async () => {
    try {
      const data = await spicetifyClient.getMarketplaceExtensions();
      setMarketplaceExtensions(data);
    } catch {
      setMarketplaceExtensions([]);
    }
  }, []);

  // Apply theme
  const applyTheme = useCallback(async (themeName: string) => {
    setIsLoading(true);
    try {
      await spicetifyClient.applyTheme(themeName);
      toast({ title: 'Tema aplicado', description: `Tema "${themeName}" aplicado com sucesso` });
      await fetchStatus();
      await fetchThemes();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao aplicar tema', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchStatus, fetchThemes]);

  // Toggle extension
  const toggleExtension = useCallback(async (name: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await spicetifyClient.toggleExtension(name, enabled);
      toast({ 
        title: enabled ? 'Extensão ativada' : 'Extensão desativada',
        description: `"${name}" foi ${enabled ? 'ativada' : 'desativada'}`
      });
      await fetchExtensions();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao alterar extensão', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchExtensions]);

  // Update config
  const updateConfig = useCallback(async (key: string, value: string | boolean) => {
    setIsLoading(true);
    try {
      await spicetifyClient.setConfig(key, value);
      toast({ title: 'Configuração atualizada', description: `${key} = ${value}` });
      await fetchConfig();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar configuração', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchConfig]);

  // Add snippet
  const addSnippet = useCallback(async (name: string, code: string) => {
    setIsLoading(true);
    try {
      await spicetifyClient.addSnippet(name, code);
      toast({ title: 'Snippet adicionado', description: `"${name}" criado com sucesso` });
      await fetchSnippets();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar snippet', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSnippets]);

  // Remove snippet
  const removeSnippet = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      await spicetifyClient.removeSnippet(name);
      toast({ title: 'Snippet removido', description: `"${name}" foi removido` });
      await fetchSnippets();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover snippet', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSnippets]);

  // Toggle snippet
  const toggleSnippet = useCallback(async (name: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await spicetifyClient.toggleSnippet(name, enabled);
      toast({ 
        title: enabled ? 'Snippet ativado' : 'Snippet desativado',
        description: `"${name}" foi ${enabled ? 'ativado' : 'desativado'}`
      });
      await fetchSnippets();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao alterar snippet', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchSnippets]);

  // Toggle custom app
  const toggleCustomApp = useCallback(async (name: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await spicetifyClient.toggleCustomApp(name, enabled);
      toast({ 
        title: enabled ? 'App ativado' : 'App desativado',
        description: `"${name}" foi ${enabled ? 'ativado' : 'desativado'}`
      });
      await fetchCustomApps();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao alterar app', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchCustomApps]);

  // Install from marketplace
  const installFromMarketplace = useCallback(async (type: 'theme' | 'extension', name: string) => {
    setIsLoading(true);
    try {
      await spicetifyClient.installFromMarketplace(type, name);
      toast({ title: 'Instalado', description: `${type === 'theme' ? 'Tema' : 'Extensão'} "${name}" instalado(a)` });
      if (type === 'theme') {
        await fetchThemes();
        await fetchMarketplaceThemes();
      } else {
        await fetchExtensions();
        await fetchMarketplaceExtensions();
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao instalar do Marketplace', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchThemes, fetchExtensions, fetchMarketplaceThemes, fetchMarketplaceExtensions]);

  // Uninstall item
  const uninstallItem = useCallback(async (type: 'theme' | 'extension', name: string) => {
    setIsLoading(true);
    try {
      await spicetifyClient.uninstallItem(type, name);
      toast({ title: 'Removido', description: `${type === 'theme' ? 'Tema' : 'Extensão'} "${name}" removido(a)` });
      if (type === 'theme') {
        await fetchThemes();
        await fetchMarketplaceThemes();
      } else {
        await fetchExtensions();
        await fetchMarketplaceExtensions();
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchThemes, fetchExtensions, fetchMarketplaceThemes, fetchMarketplaceExtensions]);

  // Backup
  const backup = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await spicetifyClient.backup();
      toast({ title: 'Backup criado', description: `Salvo em: ${result.path}` });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar backup', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Restore
  const restore = useCallback(async () => {
    setIsLoading(true);
    try {
      await spicetifyClient.restore();
      toast({ title: 'Restaurado', description: 'Configuração restaurada com sucesso' });
      await fetchStatus();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao restaurar', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchStatus]);

  // Refresh/apply
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await spicetifyClient.refresh();
      toast({ title: 'Atualizado', description: 'Spicetify atualizado com sucesso' });
      await fetchStatus();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchStatus]);

  // Update spicetify
  const update = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await spicetifyClient.update();
      toast({ title: 'Spicetify atualizado', description: `Versão: ${result.version}` });
      await fetchStatus();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar Spicetify', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchStatus]);

  // Clear
  const clear = useCallback(async () => {
    setIsLoading(true);
    try {
      await spicetifyClient.clear();
      toast({ title: 'Limpo', description: 'Todas as modificações foram removidas' });
      await fetchStatus();
      await fetchThemes();
      await fetchExtensions();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao limpar Spicetify', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchStatus, fetchThemes, fetchExtensions]);

  // Apply changes
  const apply = useCallback(async () => {
    setIsLoading(true);
    try {
      await spicetifyClient.apply();
      toast({ title: 'Aplicado', description: 'Alterações aplicadas com sucesso' });
      await fetchStatus();
    } catch {
      toast({ title: 'Erro', description: 'Falha ao aplicar alterações', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchStatus]);

  // Search marketplace (placeholder)
  const searchMarketplace = useCallback(async (query: string) => {
    // This would filter marketplace items client-side or call an API
    // For now, filtering happens in the component
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
    fetchThemes();
    fetchExtensions();
    fetchSnippets();
    fetchCustomApps();
    fetchConfig();
    fetchMarketplaceThemes();
    fetchMarketplaceExtensions();
  }, [fetchStatus, fetchThemes, fetchExtensions, fetchSnippets, fetchCustomApps, fetchConfig, fetchMarketplaceThemes, fetchMarketplaceExtensions]);

  return {
    status,
    themes,
    extensions,
    snippets,
    customApps,
    config,
    marketplaceThemes,
    marketplaceExtensions,
    isLoading,
    error,
    isInstalled: status?.installed ?? false,
    currentTheme: status?.currentTheme ?? '',
    // Actions
    applyTheme,
    toggleExtension,
    backup,
    restore,
    refresh,
    refetch: fetchStatus,
    // New actions
    fetchConfig,
    updateConfig,
    addSnippet,
    removeSnippet,
    toggleSnippet,
    toggleCustomApp,
    installFromMarketplace,
    uninstallItem,
    update,
    clear,
    apply,
    searchMarketplace,
  };
}
