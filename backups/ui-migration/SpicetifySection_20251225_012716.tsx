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
import { useSpicetifyIntegration, useTranslation } from '@/hooks';
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
      toast.error(t('spicetify.nameAndCodeRequired'));
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
            {t('spicetify.title')} - {t('spicetify.subtitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 gap-1 h-auto bg-kiosk-surface/50 p-1">
              <TabsTrigger value="status" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Settings className="w-3 h-3 mr-1" />
                {t('spicetify.status')}
              </TabsTrigger>
              <TabsTrigger value="themes" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Palette className="w-3 h-3 mr-1" />
                {t('spicetify.themes')}
              </TabsTrigger>
              <TabsTrigger value="extensions" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Puzzle className="w-3 h-3 mr-1" />
                {t('spicetify.extensions')}
              </TabsTrigger>
              <TabsTrigger value="snippets" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Code className="w-3 h-3 mr-1" />
                {t('spicetify.snippets')}
              </TabsTrigger>
              <TabsTrigger value="apps" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Play className="w-3 h-3 mr-1" />
                {t('spicetify.customApps')}
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <ShoppingBag className="w-3 h-3 mr-1" />
                {t('spicetify.marketplace')}
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Terminal className="w-3 h-3 mr-1" />
                {t('spicetify.advanced')}
              </TabsTrigger>
            </TabsList>

            {/* STATUS TAB */}
            <TabsContent value="status" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <span className="text-label-yellow font-semibold">{t('spicetify.status')}</span>
                  {isInstalled ? (
                    <Badge variant="default" className="bg-green-600 text-white font-bold">
                      <Check className="w-3 h-3 mr-1" />
                      {t('spicetify.installed')} v{status?.version}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="font-bold">
                      <X className="w-3 h-3 mr-1" />
                      {t('spicetify.notDetected')}
                    </Badge>
                  )}
                </div>

                {isInstalled && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <span className="text-label-yellow font-semibold">{t('spicetify.currentTheme')}</span>
                      <span className="text-description-visible font-medium">{currentTheme || t('spicetify.default')}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <span className="text-label-yellow font-semibold">{t('spicetify.spotifyPath')}</span>
                      <span className="text-description-visible text-xs font-mono">{config?.spotify_path || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <span className="text-label-yellow font-semibold">{t('spicetify.prefsPath')}</span>
                      <span className="text-description-visible text-xs font-mono">{config?.prefs_path || 'N/A'}</span>
                    </div>

                    {/* Config Toggles */}
                    <div className="space-y-3 p-3 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10">
                      <p className="text-label-yellow text-sm font-bold">{t('spicetify.config')}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-description-visible text-sm">{t('spicetify.injectCss')}</span>
                        <Switch 
                          checked={config?.inject_css ?? true}
                          onCheckedChange={(v) => updateConfig('inject_css', v)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-description-visible text-sm">{t('spicetify.replaceColors')}</span>
                        <Switch 
                          checked={config?.replace_colors ?? true}
                          onCheckedChange={(v) => updateConfig('replace_colors', v)}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-description-visible text-sm">{t('spicetify.overwriteAssets')}</span>
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
                        {t('spicetify.refresh')}
                      </Button>
                      <Button variant="kiosk-outline" size="sm" onClick={backup} disabled={isLoading} className="button-control-extreme-3d">
                        <Archive className="w-4 h-4 mr-1" />
                        {t('spicetify.backup')}
                      </Button>
                      <Button variant="kiosk-outline" size="sm" onClick={restore} disabled={isLoading} className="button-control-extreme-3d">
                        <Download className="w-4 h-4 mr-1" />
                        {t('spicetify.restore')}
                      </Button>
                    </div>
                  </>
                )}

                {error && (
                    <p className="text-sm text-description-visible p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    {error}. <a href="https://spicetify.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">{t('spicetify.installSpicetify')}</a>
                  </p>
                )}
              </div>
            </TabsContent>

            {/* THEMES TAB */}
            <TabsContent value="themes" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-description-visible text-center py-8">{t('spicetify.installToManageThemes')}</p>
              ) : themes.length === 0 ? (
                <p className="text-description-visible text-center py-8">{t('spicetify.noThemes')}</p>
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
                          <p className="font-bold text-kiosk-text/95">{theme.name}</p>
                          {theme.author && (
                            <p className="text-xs text-kiosk-text/85">{t('spicetify.by')} {theme.author}</p>
                          )}
                          {theme.isActive && (
                            <Badge className="mt-2 bg-primary/20 text-primary">
                              <Check className="w-3 h-3 mr-1" /> {t('spicetify.active')}
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
                <p className="text-description-visible text-center py-8">{t('spicetify.installToManageExtensions')}</p>
              ) : extensions.length === 0 ? (
                <p className="text-description-visible text-center py-8">{t('spicetify.noExtensions')}</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {extensions.map((ext) => (
                      <div key={ext.name} className="flex items-center justify-between p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Puzzle className="w-4 h-4 icon-neon-blue" />
                            <p className="font-bold text-kiosk-text/95">{ext.name}</p>
                          </div>
                          {ext.description && (
                            <p className="text-sm text-kiosk-text/85 mt-1">{ext.description}</p>
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
                <p className="text-description-visible text-center py-8">{t('spicetify.installToManageSnippets')}</p>
              ) : (
                <>
                  {/* Add new snippet */}
                  <Card className="border-cyan-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-label-yellow flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t('spicetify.addSnippet')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder={t('spicetify.snippetName')}
                        value={newSnippetName}
                        onChange={(e) => setNewSnippetName(e.target.value)}
                        className="bg-kiosk-surface/50 border-cyan-500/20"
                      />
                      <Textarea
                        placeholder="/* CSS Code */"
                        value={newSnippetCode}
                        onChange={(e) => setNewSnippetCode(e.target.value)}
                        rows={4}
                        className="bg-kiosk-surface/50 border-cyan-500/20 font-mono text-sm"
                      />
                      <Button onClick={handleAddSnippet} disabled={isLoading} className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        {t('spicetify.addSnippetButton')}
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
                              <p className="font-bold text-kiosk-text/95">{snippet.name}</p>
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
                          <pre className="text-xs text-kiosk-text/85 bg-black/30 p-2 rounded overflow-x-auto">
                            {snippet.code.substring(0, 200)}{snippet.code.length > 200 ? '...' : ''}
                          </pre>
                        </div>
                      ))}
                      {snippets.length === 0 && (
                        <p className="text-kiosk-text/85 text-center py-4">{t('spicetify.noSnippets')}</p>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </TabsContent>

            {/* CUSTOM APPS TAB */}
            <TabsContent value="apps" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-description-visible text-center py-8">{t('spicetify.installToManageApps')}</p>
              ) : customApps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-description-visible mb-4">{t('spicetify.noApps')}</p>
                  <Button variant="outline" onClick={() => setActiveTab('marketplace')}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t('spicetify.exploreMarketplace')}
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
                            <p className="font-bold text-description-visible">{app.name}</p>
                            <p className="text-xs text-secondary-visible font-mono">{app.path}</p>
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
                <p className="text-description-visible text-center py-8">{t('spicetify.installToAccessMarketplace')}</p>
              ) : (
                <>
                  {/* Search and filters */}
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-visible" />
                      <Input
                        placeholder={t('spicetify.searchMarketplace')}
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
                        {t('spicetify.themes')}
                      </Button>
                      <Button
                        variant={marketplaceCategory === 'extensions' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMarketplaceCategory('extensions')}
                      >
                        <Puzzle className="w-4 h-4 mr-1" />
                        {t('spicetify.extensions')}
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
                                <p className="font-bold text-description-visible">{item.name}</p>
                                <p className="text-xs text-secondary-visible">{t('spicetify.by')} {item.author}</p>
                                {item.description && (
                                  <p className="text-sm text-description-visible mt-1 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {item.tags?.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-500/10">
                              <div className="flex items-center gap-2 text-secondary-visible text-xs">
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
                                  {t('spicetify.uninstall')}
                                </Button>
                              ) : (
                                <Button 
                                  size="sm"
                                  onClick={() => installFromMarketplace(marketplaceCategory === 'themes' ? 'theme' : 'extension', item.name)}
                                  disabled={isLoading}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  {t('spicetify.install')}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredMarketplace.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-description-visible">
                          {t('spicetify.noItemsFound')}
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex justify-center">
                    <Button variant="outline" asChild>
                      <a href="https://spicetify.app/docs/development/spicetify-marketplace" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('spicetify.visitMarketplace')}
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              {!isInstalled ? (
                <p className="text-description-visible text-center py-8">{t('spicetify.installToUseAdvanced')}</p>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <p className="text-amber-400 text-sm font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {t('spicetify.advancedCommands')}
                    </p>
                    <p className="text-description-visible text-xs mt-1">
                      {t('spicetify.advancedWarning')}
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
                      <span className="text-xs text-secondary-visible">{t('spicetify.update')}</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={apply} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="font-bold">Apply</span>
                      <span className="text-xs text-secondary-visible">{t('spicetify.apply')}</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={backup} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Archive className="w-5 h-5 icon-neon-blue" />
                      <span className="font-bold">Backup</span>
                      <span className="text-xs text-secondary-visible">{t('spicetify.saveConfig')}</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={restore} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <Download className="w-5 h-5 icon-neon-blue" />
                      <span className="font-bold">Restore</span>
                      <span className="text-xs text-secondary-visible">{t('spicetify.restoreBackup')}</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={clear} 
                      disabled={isLoading}
                      className="h-auto py-4 flex-col gap-2 col-span-2 border-red-500/30 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <span className="font-bold text-red-400">Clear</span>
                      <span className="text-xs text-secondary-visible">{t('spicetify.clear')}</span>
                    </Button>
                  </div>

                  {/* Documentation links */}
                  <Card className="border-cyan-500/20">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-label-yellow text-sm font-bold">{t('spicetify.documentation')}</p>
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
