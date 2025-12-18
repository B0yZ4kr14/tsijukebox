import { useState, useRef } from 'react';
import { 
  Music, Upload, Trash2, Plus, RefreshCw, Users, Server, 
  Settings, FolderSync, CheckCircle, XCircle, Clock,
  HardDrive, List, Grid, Play, MoreVertical, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocalMusic } from '@/hooks/useLocalMusic';
import { toast } from 'sonner';

export function LocalMusicSection() {
  const {
    files,
    playlists,
    syncStatus,
    instances,
    replicationSettings,
    isLoading,
    isUploading,
    uploadProgress,
    selectedFiles,
    toggleSelect,
    selectAll,
    clearSelection,
    uploadFiles,
    deleteFile,
    bulkDelete,
    refreshFiles,
    syncToUser,
    syncToAllUsers,
    createPlaylist,
    deletePlaylist,
    registerInstance,
    removeInstance,
    replicateToInstance,
    replicateToAll,
    updateReplicationConfig,
    replicateConfigToAll,
  } = useLocalMusic();

  const [activeTab, setActiveTab] = useState('library');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newInstanceUrl, setNewInstanceUrl] = useState('');
  const [newInstanceName, setNewInstanceName] = useState('');
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [showInstanceDialog, setShowInstanceDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const validFiles = Array.from(fileList).filter(f => 
        f.type === 'audio/mpeg' || f.name.toLowerCase().endsWith('.mp3')
      );
      
      if (validFiles.length !== fileList.length) {
        toast.warning('Alguns arquivos foram ignorados (apenas MP3 aceito)');
      }
      
      if (validFiles.length > 0) {
        uploadFiles(validFiles);
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Nome da playlist é obrigatório');
      return;
    }
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowPlaylistDialog(false);
  };

  const handleRegisterInstance = async () => {
    if (!newInstanceUrl.trim() || !newInstanceName.trim()) {
      toast.error('URL e nome são obrigatórios');
      return;
    }
    await registerInstance(newInstanceUrl.trim(), newInstanceName.trim());
    setNewInstanceUrl('');
    setNewInstanceName('');
    setShowInstanceDialog(false);
  };

  const filteredFiles = files.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-dark-neon-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gold-neon font-bold">
            <Music className="w-5 h-5 icon-neon-blue" />
            Música Local - Gerenciamento Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 gap-1 h-auto bg-kiosk-surface/50 p-1">
              <TabsTrigger value="library" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <HardDrive className="w-3 h-3 mr-1" />
                Biblioteca
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Upload className="w-3 h-3 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="playlists" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <List className="w-3 h-3 mr-1" />
                Playlists
              </TabsTrigger>
              <TabsTrigger value="sync" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Users className="w-3 h-3 mr-1" />
                Sincronização
              </TabsTrigger>
              <TabsTrigger value="instances" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Server className="w-3 h-3 mr-1" />
                Instâncias
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Settings className="w-3 h-3 mr-1" />
                Config
              </TabsTrigger>
            </TabsList>

            {/* LIBRARY TAB */}
            <TabsContent value="library" className="space-y-4 mt-4">
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-text/50" />
                  <Input
                    placeholder="Buscar músicas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-kiosk-surface/50 border-cyan-500/20"
                  />
                </div>
                
                <div className="flex gap-1">
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
                
                {selectedFiles.size > 0 && (
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedFiles.size} selecionado(s)</Badge>
                    <Button variant="outline" size="sm" onClick={clearSelection}>Limpar</Button>
                    <Button variant="destructive" size="sm" onClick={bulkDelete} disabled={isLoading}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                )}
                
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar todos
                </Button>
                
                <Button variant="outline" size="sm" onClick={refreshFiles} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* File list */}
              <ScrollArea className="h-[350px]">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12 text-kiosk-text/60">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma música encontrada</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer upload
                    </Button>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedFiles.has(file.id) 
                            ? 'bg-primary/10 border-primary/50' 
                            : 'bg-kiosk-surface/50 border-cyan-500/20 hover:border-cyan-500/40'
                        }`}
                      >
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => toggleSelect(file.id)}
                        />
                        {file.coverUrl ? (
                          <img src={file.coverUrl} alt={file.album} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-kiosk-surface flex items-center justify-center">
                            <Music className="w-5 h-5 text-kiosk-text/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-kiosk-text/90 truncate">{file.title}</p>
                          <p className="text-sm text-kiosk-text/60 truncate">{file.artist} • {file.album}</p>
                        </div>
                        <div className="text-right text-sm text-kiosk-text/60">
                          <p>{formatDuration(file.duration)}</p>
                          <p>{formatSize(file.size)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => deleteFile(file.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredFiles.map((file) => (
                      <Card 
                        key={file.id}
                        className={`cursor-pointer transition-all ${
                          selectedFiles.has(file.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => toggleSelect(file.id)}
                      >
                        <CardContent className="p-3">
                          {file.coverUrl ? (
                            <img src={file.coverUrl} alt={file.album} className="w-full aspect-square rounded object-cover mb-2" />
                          ) : (
                            <div className="w-full aspect-square rounded bg-kiosk-surface flex items-center justify-center mb-2">
                              <Music className="w-8 h-8 text-kiosk-text/40" />
                            </div>
                          )}
                          <p className="font-bold text-sm text-kiosk-text/90 truncate">{file.title}</p>
                          <p className="text-xs text-kiosk-text/60 truncate">{file.artist}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Stats */}
              <div className="flex gap-4 text-sm text-kiosk-text/70">
                <span>{files.length} arquivo(s)</span>
                <span>{formatSize(files.reduce((acc, f) => acc + f.size, 0))} total</span>
              </div>
            </TabsContent>

            {/* UPLOAD TAB */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,audio/mpeg"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <div 
                className="border-2 border-dashed border-cyan-500/30 rounded-lg p-12 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 icon-neon-blue" />
                <p className="text-lg font-bold text-kiosk-text/90 mb-2">
                  Arraste arquivos MP3 aqui
                </p>
                <p className="text-kiosk-text/60 mb-4">
                  ou clique para selecionar
                </p>
                <Button variant="outline" disabled={isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivos
                </Button>
              </div>

              {isUploading && uploadProgress && (
                <Card className="border-cyan-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-kiosk-text/90">{uploadProgress.file}</span>
                      <span className="text-sm text-kiosk-text/70">{uploadProgress.percentage}%</span>
                    </div>
                    <Progress value={uploadProgress.percentage} />
                  </CardContent>
                </Card>
              )}

              <div className="p-4 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10">
                <p className="text-label-yellow text-sm font-bold mb-2">Formatos aceitos</p>
                <p className="text-kiosk-text/70 text-sm">
                  Apenas arquivos <strong>.mp3</strong> (MPEG Audio Layer III)
                </p>
                <p className="text-kiosk-text/60 text-xs mt-2">
                  Metadados ID3 serão extraídos automaticamente (título, artista, álbum, capa)
                </p>
              </div>
            </TabsContent>

            {/* PLAYLISTS TAB */}
            <TabsContent value="playlists" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-label-yellow font-semibold">{playlists.length} playlist(s)</p>
                <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Playlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Playlist</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Nome da playlist"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    {selectedFiles.size > 0 && (
                      <p className="text-sm text-kiosk-text/70">
                        {selectedFiles.size} música(s) selecionada(s) serão adicionadas
                      </p>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPlaylistDialog(false)}>Cancelar</Button>
                      <Button onClick={handleCreatePlaylist}>Criar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center justify-between p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <div>
                        <p className="font-bold text-kiosk-text/90">{playlist.name}</p>
                        <p className="text-sm text-kiosk-text/60">{playlist.trackIds.length} faixa(s)</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePlaylist(playlist.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {playlists.length === 0 && (
                    <p className="text-center py-8 text-kiosk-text/60">Nenhuma playlist criada</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* SYNC TAB */}
            <TabsContent value="sync" className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-amber-400 text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Sincronização para Usuários do Sistema
                </p>
                <p className="text-kiosk-text/70 text-xs mt-1">
                  Copia músicas para /home/$user/Music/ de todos os usuários cadastrados no sistema (requer root)
                </p>
              </div>

              <Button onClick={syncToAllUsers} disabled={isLoading} className="w-full">
                <FolderSync className="w-4 h-4 mr-2" />
                Sincronizar para Todos os Usuários
              </Button>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {syncStatus.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <div className="flex items-center gap-3">
                        {getSyncStatusIcon(user.syncStatus)}
                        <div>
                          <p className="font-bold text-kiosk-text/90">{user.username}</p>
                          <p className="text-xs text-kiosk-text/60 font-mono">{user.homePath}/Music/</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-kiosk-text/70">{user.filesCount} arquivo(s)</p>
                        {user.lastSync && (
                          <p className="text-xs text-kiosk-text/50">
                            Último sync: {new Date(user.lastSync).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => syncToUser(user.userId)}
                        disabled={isLoading || user.syncStatus === 'syncing'}
                      >
                        <RefreshCw className={`w-3 h-3 ${user.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  ))}
                  {syncStatus.length === 0 && (
                    <p className="text-center py-8 text-kiosk-text/60">Nenhum usuário encontrado</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* INSTANCES TAB */}
            <TabsContent value="instances" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-label-yellow font-semibold">{instances.length} instância(s) registrada(s)</p>
                <Dialog open={showInstanceDialog} onOpenChange={setShowInstanceDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Instância
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Instância TSiJUKEBOX</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Nome da instância"
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                    />
                    <Input
                      placeholder="URL (ex: https://192.168.1.100/api)"
                      value={newInstanceUrl}
                      onChange={(e) => setNewInstanceUrl(e.target.value)}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowInstanceDialog(false)}>Cancelar</Button>
                      <Button onClick={handleRegisterInstance}>Registrar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Button onClick={replicateToAll} disabled={isLoading} className="w-full">
                <FolderSync className="w-4 h-4 mr-2" />
                Replicar para Todas as Instâncias
              </Button>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {instances.map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-4 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          instance.status === 'online' ? 'bg-green-400' : 
                          instance.status === 'offline' ? 'bg-red-400' : 'bg-amber-400'
                        }`} />
                        <div>
                          <p className="font-bold text-kiosk-text/90">{instance.name}</p>
                          <p className="text-xs text-kiosk-text/60 font-mono">{instance.url}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => replicateToInstance(instance.id)}
                          disabled={isLoading || instance.status !== 'online'}
                        >
                          <FolderSync className="w-3 h-3 mr-1" />
                          Replicar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeInstance(instance.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {instances.length === 0 && (
                    <p className="text-center py-8 text-kiosk-text/60">Nenhuma instância registrada</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* CONFIG TAB */}
            <TabsContent value="config" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div>
                    <p className="text-label-yellow font-semibold">Auto Sync</p>
                    <p className="text-xs text-kiosk-text/60">Sincronizar automaticamente novos uploads</p>
                  </div>
                  <Switch 
                    checked={replicationSettings?.autoSync ?? false}
                    onCheckedChange={(v) => updateReplicationConfig({ autoSync: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div>
                    <p className="text-label-yellow font-semibold">Incluir Capas</p>
                    <p className="text-xs text-kiosk-text/60">Transferir artwork dos álbuns</p>
                  </div>
                  <Switch 
                    checked={replicationSettings?.includeCovers ?? true}
                    onCheckedChange={(v) => updateReplicationConfig({ includeCovers: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div>
                    <p className="text-label-yellow font-semibold">Compressão</p>
                    <p className="text-xs text-kiosk-text/60">Comprimir transferências de rede</p>
                  </div>
                  <Switch 
                    checked={replicationSettings?.compressTransfer ?? true}
                    onCheckedChange={(v) => updateReplicationConfig({ compressTransfer: v })}
                  />
                </div>

                <Button onClick={replicateConfigToAll} variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Replicar Configurações para Todas as Instâncias
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
