import { useState } from 'react';
import { 
  Palette, Download, RefreshCw, Settings, Check, X, Archive,
  Code, ShoppingBag, Puzzle, Play, Trash2, Plus, Search, 
  ExternalLink, Zap, Eye, FileCode, Terminal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSpicetifyIntegration } from '@/hooks/useSpicetifyIntegration';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export function SpicetifySection() {
  const { t } = useTranslation();
  const {
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
    isInstalled,
    currentTheme,
    applyTheme,
    toggleExtension,
    backup,
    restore,
    refresh,
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
  } = useSpicetifyIntegration();

  const [activeTab, setActiveTab] = useState('status');
  const [newSnippetName, setNewSnippetName] = useState('');
  const [newSnippetCode, setNewSnippetCode] = useState('');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceCategory, setMarketplaceCategory] = useState<'themes' | 'extensions'>('themes');

  const handleAddSnippet = async () => {
    if (!newSnippetName.trim() || !newSnippetCode.trim()) {
      toast.error('Nome e código são obrigatórios');
      return;
    }
    await addSnippet(newSnippetName.trim(), newSnippetCode.trim());
    setNewSnippetName('');
    setNewSnippetCode('');
  };

  const filteredMarketplace = marketplaceCategory === 'themes' 
    ? marketplaceThemes.filter(item => 
        item.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
        item.author.toLowerCase().includes(marketplaceSearch.toLowerCase())
      )
    : marketplaceExtensions.filter(item =>
        item.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
        item.author.toLowerCase().includes(marketplaceSearch.toLowerCase())
      );

  return (
    <div className="space-y-6">
      <Card className="card-dark-neon-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gold-neon font-bold">
            <Palette className="w-5 h-5 icon-neon-blue" />
            Spicetify - Personalização do Spotify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 gap-1 h-auto bg-kiosk-surface/50 p-1">
              <TabsTrigger value="status" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Settings className="w-3 h-3 mr-1" />
                Status
              </TabsTrigger>
              <TabsTrigger value="themes" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Palette className="w-3 h-3 mr-1" />
                Temas
              </TabsTrigger>
              <TabsTrigger value="extensions" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Puzzle className="w-3 h-3 mr-1" />
                Extensões
              </TabsTrigger>
              <TabsTrigger value="snippets" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Code className="w-3 h-3 mr-1" />
                Snippets
              </TabsTrigger>
              <TabsTrigger value="apps" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Play className="w-3 h-3 mr-1" />
                Apps
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Terminal className="w-3 h-3 mr-1" />
                Avançado
              </TabsTrigger>
            </TabsList>

            {/* STATUS TAB */}
            <TabsContent value="status" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <span className="text-label-yellow font-semibold">Status</span>
                  {isInstalled ? (
                    <Badge variant="default" className="bg-green-600 text-white font-bold">
                      <Check className="w-3 h-3 mr-1" />
                      Instalado v{status?.version}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="font-bold">
                      <X className="w-3 h-3 mr-1" />
                      Não detectado
                    </Badge>
                  )}
                </div>

                {isInstalled && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <span className="text-label-yellow font-semibold">Tema Atual</span>
                      <span className="text-kiosk-text/90 font-medium">{currentTheme || 'Padrão'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <span className="text-label-yellow font-semibold">Spotify Path</span>
                      <span className="text-kiosk-text/80 text-xs font-mono">{config?.spotify_path || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <span className="text-label-yellow font-semibold">Prefs Path</span>
                      <span className="text-kiosk-text/80 text-xs font-mono">{config?.prefs_path || 'N/A'}</span>
                    </div>

                    {/* Config Toggles */}
                    <div className="space-y-3 p-3 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10">
                      <p className="text-label-yellow text-sm font-bold">Configurações</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-kiosk-text/90 text-sm">Injetar CSS</span>
                        <Switch 
                          checked={config?.inject_css ?? true}
                          onCheckedChange={(v) => updateConfig('inject_css', v)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-kiosk-text/90 text-sm">Substituir Cores</span>
                        <Switch 
                          checked={config?.replace_colors ?? true}
                          onCheckedChange={(v) => updateConfig('replace_colors', v)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-kiosk-text/90 text-sm">Sobrescrever Assets</span>
                        <Switch 
                          checked={config?.overwrite_assets ?? false}
                          onCheckedChange={(v) => updateConfig('overwrite_assets', v)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap pt-2">
                      <Button variant="kiosk-outline" size="sm" onClick={refresh} disabled={isLoading} className="button-control-extreme-3d">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Atualizar
                      </Button>
                      <Button variant="kiosk-outline" size="sm" onClick={backup} disabled={isLoading} className="button-control-extreme-3d">
                        <Archive className="w-4 h-4 mr-1" />
                        Backup
                      </Button>
                      <Button variant="kiosk-outline" size="sm" onClick={restore} disabled={isLoading} className="button-control-extreme-3d">
                        <Download className="w-4 h-4 mr-1" />
                        Restaurar
                      </Button>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-kiosk-text/90 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    {error}. <a href="https://spicetify.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">Instalar Spicetify</a>
                  </p>
                )}
              </div>
            </TabsContent>

            {/* THEMES TAB */}
            <TabsContent value="themes" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-kiosk-text/80 text-center py-8">Instale o Spicetify para gerenciar temas</p>
              ) : themes.length === 0 ? (
                <p className="text-kiosk-text/80 text-center py-8">Nenhum tema instalado</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <Card 
                        key={theme.name} 
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          theme.isActive ? 'ring-2 ring-primary border-primary' : 'border-cyan-500/20'
                        }`}
                        onClick={() => applyTheme(theme.name)}
                      >
                        <CardContent className="p-4">
                          {theme.preview && (
                            <img src={theme.preview} alt={theme.name} className="w-full h-20 object-cover rounded mb-2" />
                          )}
                          <p className="font-bold text-kiosk-text/90">{theme.name}</p>
                          {theme.author && (
                            <p className="text-xs text-kiosk-text/70">por {theme.author}</p>
                          )}
                          {theme.isActive && (
                            <Badge className="mt-2 bg-primary/20 text-primary">
                              <Check className="w-3 h-3 mr-1" /> Ativo
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* EXTENSIONS TAB */}
            <TabsContent value="extensions" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-kiosk-text/80 text-center py-8">Instale o Spicetify para gerenciar extensões</p>
              ) : extensions.length === 0 ? (
                <p className="text-kiosk-text/80 text-center py-8">Nenhuma extensão instalada</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {extensions.map((ext) => (
                      <div key={ext.name} className="flex items-center justify-between p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Puzzle className="w-4 h-4 icon-neon-blue" />
                            <p className="font-bold text-kiosk-text/90">{ext.name}</p>
                          </div>
                          {ext.description && (
                            <p className="text-sm text-kiosk-text/70 mt-1">{ext.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => uninstallItem('extension', ext.name)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={ext.enabled}
                            onCheckedChange={(checked) => toggleExtension(ext.name, checked)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* SNIPPETS TAB */}
            <TabsContent value="snippets" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-kiosk-text/80 text-center py-8">Instale o Spicetify para gerenciar snippets</p>
              ) : (
                <>
                  {/* Add new snippet */}
                  <Card className="border-cyan-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-label-yellow flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Snippet CSS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Nome do snippet"
                        value={newSnippetName}
                        onChange={(e) => setNewSnippetName(e.target.value)}
                        className="bg-kiosk-surface/50 border-cyan-500/20"
                      />
                      <Textarea
                        placeholder="/* Código CSS */"
                        value={newSnippetCode}
                        onChange={(e) => setNewSnippetCode(e.target.value)}
                        rows={4}
                        className="bg-kiosk-surface/50 border-cyan-500/20 font-mono text-sm"
                      />
                      <Button onClick={handleAddSnippet} disabled={isLoading} className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Snippet
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing snippets */}
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      {snippets.map((snippet) => (
                        <div key={snippet.name} className="p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileCode className="w-4 h-4 icon-neon-blue" />
                              <p className="font-bold text-kiosk-text/90">{snippet.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeSnippet(snippet.name)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Switch
                                checked={snippet.enabled}
                                onCheckedChange={(checked) => toggleSnippet(snippet.name, checked)}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          <pre className="text-xs text-kiosk-text/70 bg-black/30 p-2 rounded overflow-x-auto">
                            {snippet.code.substring(0, 200)}{snippet.code.length > 200 ? '...' : ''}
                          </pre>
                        </div>
                      ))}
                      {snippets.length === 0 && (
                        <p className="text-kiosk-text/60 text-center py-4">Nenhum snippet cadastrado</p>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>

            {/* CUSTOM APPS TAB */}
            <TabsContent value="apps" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-kiosk-text/80 text-center py-8">Instale o Spicetify para gerenciar apps</p>
              ) : customApps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-kiosk-text/80 mb-4">Nenhum custom app instalado</p>
                  <Button variant="outline" onClick={() => setActiveTab('marketplace')}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Explorar Marketplace
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {customApps.map((app) => (
                      <div key={app.name} className="flex items-center justify-between p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                        <div className="flex items-center gap-3">
                          <Play className="w-5 h-5 icon-neon-blue" />
                          <div>
                            <p className="font-bold text-kiosk-text/90">{app.name}</p>
                            <p className="text-xs text-kiosk-text/60 font-mono">{app.path}</p>
                          </div>
                        </div>
                        <Switch
                          checked={app.enabled}
                          onCheckedChange={(checked) => toggleCustomApp(app.name, checked)}
                          disabled={isLoading}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* MARKETPLACE TAB */}
            <TabsContent value="marketplace" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-kiosk-text/80 text-center py-8">Instale o Spicetify para acessar o Marketplace</p>
              ) : (
                <>
                  {/* Search and filters */}
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/50" />
                      <Input
                        placeholder="Buscar no Marketplace..."
                        value={marketplaceSearch}
                        onChange={(e) => setMarketplaceSearch(e.target.value)}
                        className="pl-10 bg-kiosk-surface/50 border-cyan-500/20"
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant={marketplaceCategory === 'themes' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMarketplaceCategory('themes')}
                      >
                        <Palette className="w-4 h-4 mr-1" />
                        Temas
                      </Button>
                      <Button
                        variant={marketplaceCategory === 'extensions' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMarketplaceCategory('extensions')}
                      >
                        <Puzzle className="w-4 h-4 mr-1" />
                        Extensões
                      </Button>
                    </div>
                  </div>

                  {/* Marketplace items */}
                  <ScrollArea className="h-[350px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredMarketplace.map((item) => (
                        <Card key={item.name} className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                          <CardContent className="p-4">
                            {item.preview && (
                              <img src={item.preview} alt={item.name} className="w-full h-24 object-cover rounded mb-3" />
                            )}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-kiosk-text/90">{item.name}</p>
                                <p className="text-xs text-kiosk-text/60">por {item.author}</p>
                                {item.description && (
                                  <p className="text-sm text-kiosk-text/70 mt-1 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {item.tags?.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-500/10">
                              <div className="flex items-center gap-2 text-kiosk-text/60 text-xs">
                                <Zap className="w-3 h-3" />
                                {item.stars || 0} stars
                              </div>
                              {item.installed ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => uninstallItem(marketplaceCategory === 'themes' ? 'theme' : 'extension', item.name)}
                                  className="text-red-400 border-red-400/50 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remover
                                </Button>
                              ) : (
                                <Button 
                                  size="sm"
                                  onClick={() => installFromMarketplace(marketplaceCategory === 'themes' ? 'theme' : 'extension', item.name)}
                                  disabled={isLoading}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Instalar
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredMarketplace.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-kiosk-text/60">
                          Nenhum item encontrado
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex justify-center">
                    <Button variant="outline" asChild>
                      <a href="https://spicetify.app/docs/development/spicetify-marketplace" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Marketplace no navegador
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-kiosk-text/80 text-center py-8">Instale o Spicetify para usar comandos avançados</p>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-amber-400 text-sm font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Comandos Avançados
                    </p>
                    <p className="text-kiosk-text/70 text-xs mt-1">
                      Use com cuidado. Alguns comandos podem exigir reiniciar o Spotify.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={update} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <RefreshCw className="w-5 h-5 icon-neon-blue" />
                      <span className="font-bold">Update</span>
                      <span className="text-xs text-kiosk-text/60">Atualizar Spicetify</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={apply} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="font-bold">Apply</span>
                      <span className="text-xs text-kiosk-text/60">Aplicar alterações</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={backup} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Archive className="w-5 h-5 icon-neon-blue" />
                      <span className="font-bold">Backup</span>
                      <span className="text-xs text-kiosk-text/60">Salvar configuração</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={restore} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Download className="w-5 h-5 icon-neon-blue" />
                      <span className="font-bold">Restore</span>
                      <span className="text-xs text-kiosk-text/60">Restaurar backup</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={clear} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2 col-span-2 border-red-500/30 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <span className="font-bold text-red-400">Clear</span>
                      <span className="text-xs text-kiosk-text/60">Remover todas as modificações</span>
                    </Button>
                  </div>

                  {/* Documentation links */}
                  <Card className="border-cyan-500/20">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-label-yellow text-sm font-bold">Documentação</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href="https://spicetify.app/docs/getting-started" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Getting Started
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href="https://spicetify.app/docs/advanced-usage" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Advanced Usage
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href="https://spicetify.app/docs/development" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Development
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
