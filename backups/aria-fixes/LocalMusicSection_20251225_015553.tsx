import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, Upload, Trash2, Plus, RefreshCw, Users, Server, 
  Settings, FolderSync, CheckCircle, XCircle, Clock,
  HardDrive, List, Grid, Play, MoreVertical, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocalMusic, useTranslation } from '@/hooks';
import { toast } from 'sonner';
import { AudioWaveformPreview } from '@/components/upload/AudioWaveformPreview';
import { Badge, Button, Card, Input, Toggle } from "@/components/ui/themed"

export function LocalMusicSection() {
  const { t } = useTranslation();
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
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(f => 
      f.type === 'audio/mpeg' || f.name.toLowerCase().endsWith('.mp3')
    );
    
    if (validFiles.length !== droppedFiles.length) {
      toast.warning(t('localMusic.someFilesIgnored'));
    }
    
    if (validFiles.length === 1) {
      // Single file: show preview
      setPreviewFile(validFiles[0]);
      setShowPreview(true);
    } else if (validFiles.length > 1) {
      // Multiple files: upload directly
      uploadFiles(validFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const validFiles = Array.from(fileList).filter(f => 
        f.type === 'audio/mpeg' || f.name.toLowerCase().endsWith('.mp3')
      );
      
      if (validFiles.length !== fileList.length) {
        toast.warning(t('localMusic.someFilesIgnored'));
      }
      
      if (validFiles.length === 1) {
        // Single file: show preview
        setPreviewFile(validFiles[0]);
        setShowPreview(true);
      } else if (validFiles.length > 1) {
        // Multiple files: upload directly
        uploadFiles(validFiles);
      }
    }
  };

  const handlePreviewConfirm = (file: File) => {
    uploadFiles([file]);
    setShowPreview(false);
    setPreviewFile(null);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error(t('localMusic.playlistNameRequired'));
      return;
    }
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowPlaylistDialog(false);
  };

  const handleRegisterInstance = async () => {
    if (!newInstanceUrl.trim() || !newInstanceName.trim()) {
      toast.error(t('localMusic.urlAndNameRequired'));
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
      case 'syncing': return <RefreshCw aria-hidden="true" className="w-4 h-4 text-cyan-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-dark-neon-border">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Music className="w-5 h-5 icon-neon-blue" />
            {t('localMusic.title')} - {t('localMusic.subtitle')}
          </h3>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 gap-1 h-auto bg-kiosk-surface/50 p-1">
              <TabsTrigger value="library" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <HardDrive className="w-3 h-3 mr-1" />
                {t('localMusic.library')}
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Upload aria-hidden="true" className="w-3 h-3 mr-1" />
                {t('localMusic.upload')}
              </TabsTrigger>
              <TabsTrigger value="playlists" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <List className="w-3 h-3 mr-1" />
                {t('localMusic.playlists')}
              </TabsTrigger>
              <TabsTrigger value="sync" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Users className="w-3 h-3 mr-1" />
                {t('localMusic.sync')}
              </TabsTrigger>
              <TabsTrigger value="instances" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Server className="w-3 h-3 mr-1" />
                {t('localMusic.instances')}
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs py-2 data-[state=active]:bg-primary/20">
                <Settings aria-hidden="true" className="w-3 h-3 mr-1" />
                {t('localMusic.config')}
              </TabsTrigger>
            </TabsList>

            {/* LIBRARY TAB */}
            <TabsContent value="library" className="space-y-4 mt-4">
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-description-visible" />
                  <Input
                    placeholder={t('localMusic.searchMusic')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-kiosk-surface/50 border-cyan-500/20"
                  />
                </div>
                
                <div className="flex gap-1">
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="xs" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="xs" onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
                
                {selectedFiles.size > 0 && (
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedFiles.size} {t('localMusic.selected')}</Badge>
                    <Button variant="outline" size="sm" onClick={clearSelection}>{t('localMusic.clear')}</Button>
                    <Button variant="danger" size="sm" onClick={bulkDelete} disabled={isLoading}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t('localMusic.delete')}
                    </Button>
                  </div>
                )}
                
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {t('localMusic.selectAll')}
                </Button>
                
                <Button variant="outline" size="sm" onClick={refreshFiles} disabled={isLoading}>
                  <RefreshCw aria-hidden="true" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* File list */}
              <ScrollArea className="h-[350px]">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12 text-description-visible">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-60" />
                    <p>{t('localMusic.noMusic')}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('upload')}>
                      <Upload aria-hidden="true" className="w-4 h-4 mr-2" />
                      {t('localMusic.uploadFiles')}
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
                            <Music className="w-5 h-5 text-description-visible" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-kiosk-text/95 truncate">{file.title}</p>
                          <p className="text-sm text-kiosk-text/85 truncate">{file.artist} • {file.album}</p>
                        </div>
                        <div className="text-right text-sm text-kiosk-text/85">
                          <p>{formatDuration(file.duration)}</p>
                          <p>{formatSize(file.size)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="xs">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => deleteFile(file.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('localMusic.delete')}
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
                        <div className="mt-4">
                          {file.coverUrl ? (
                            <img src={file.coverUrl} alt={file.album} className="w-full aspect-square rounded object-cover mb-2" />
                          ) : (
                            <div className="w-full aspect-square rounded bg-kiosk-surface flex items-center justify-center mb-2">
                              <Music className="w-8 h-8 text-description-visible" />
                            </div>
                          )}
                          <p className="font-bold text-sm text-kiosk-text/95 truncate">{file.title}</p>
                          <p className="text-xs text-kiosk-text/85 truncate">{file.artist}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Stats */}
              <div className="flex gap-4 text-sm text-description-visible font-medium">
                <span>{files.length} {t('localMusic.files')}</span>
                <span>{formatSize(files.reduce((acc, f) => acc + f.size, 0))} {t('localMusic.total')}</span>
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
                className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300",
                  isDragging 
                    ? "border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-lg shadow-cyan-500/20" 
                    : "border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {isDragging ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity 
                      }}
                    >
                      <Upload aria-hidden="true" className="w-16 h-16 text-cyan-400" />
                    </motion.div>
                    <p className="text-xl font-bold text-cyan-400 mt-4">
                      {t('localMusic.dropFilesHere')}
                    </p>
                    <p className="text-secondary-visible mt-2">
                      {t('localMusic.releaseToUpload')}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <Upload aria-hidden="true" className="w-12 h-12 mx-auto mb-4 icon-neon-blue" />
                    <p className="text-lg font-bold text-kiosk-text/95 mb-2">
                      {t('localMusic.dragAndDrop')}
                    </p>
                    <p className="text-kiosk-text/85 mb-4">
                      {t('localMusic.clickToSelect')}
                    </p>
                    <Button variant="outline" disabled={isUploading}>
                      <Upload aria-hidden="true" className="w-4 h-4 mr-2" />
                      {t('localMusic.selectFilesButton')}
                    </Button>
                  </>
                )}
              </div>

              {isUploading && uploadProgress && (
                <Card className="border-cyan-500/20">
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-kiosk-text/90">{uploadProgress.file}</span>
                      <span className="text-sm text-description-visible">{uploadProgress.percentage}%</span>
                    </div>
                    <Progress value={uploadProgress.percentage} />
                  </div>
                </Card>
              )}

              <div className="p-4 rounded-lg bg-kiosk-surface/30 border border-cyan-500/10">
                <p className="text-label-yellow text-sm font-bold mb-2">{t('localMusic.acceptedFormats')}</p>
                <p className="text-description-visible text-sm">
                  {t('localMusic.onlyMp3')}
                </p>
                <p className="text-secondary-visible text-xs mt-2">
                  {t('localMusic.metadataExtraction')}
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
                      <Plus aria-hidden="true" className="w-4 h-4 mr-2" />
                      {t('localMusic.newPlaylist')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('localMusic.createPlaylist')}</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder={t('localMusic.playlistName')}
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    {selectedFiles.size > 0 && (
                      <p className="text-sm text-description-visible">
                        {selectedFiles.size} {t('localMusic.tracksSelected')}
                      </p>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPlaylistDialog(false)}>{t('common.cancel')}</Button>
                      <Button onClick={handleCreatePlaylist}>{t('common.create')}</Button>
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
                        <p className="text-sm text-secondary-visible">{playlist.trackIds.length} {t('localMusic.tracks')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="xs">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => deletePlaylist(playlist.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {playlists.length === 0 && (
                    <p className="text-center py-8 text-secondary-visible">Nenhuma playlist criada</p>
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
                <p className="text-description-visible text-xs mt-1">
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
                          <p className="text-xs text-secondary-visible font-mono">{user.homePath}/Music/</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-description-visible">{user.filesCount} arquivo(s)</p>
                        {user.lastSync && (
                          <p className="text-xs text-secondary-visible">
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
                        <RefreshCw aria-hidden="true" className={`w-3 h-3 ${user.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  ))}
                  {syncStatus.length === 0 && (
                    <p className="text-center py-8 text-secondary-visible">Nenhum usuário encontrado</p>
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
                      <Plus aria-hidden="true" className="w-4 h-4 mr-2" />
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
                          <p className="text-xs text-secondary-visible font-mono">{instance.url}</p>
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
                          size="xs"
                          onClick={() => removeInstance(instance.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {instances.length === 0 && (
                    <p className="text-center py-8 text-secondary-visible">Nenhuma instância registrada</p>
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
                    <p className="text-xs text-secondary-visible">Sincronizar automaticamente novos uploads</p>
                  </div>
                  <Switch 
                    checked={replicationSettings?.autoSync ?? false}
                    onCheckedChange={(v) => updateReplicationConfig({ autoSync: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div>
                    <p className="text-label-yellow font-semibold">Incluir Capas</p>
                    <p className="text-xs text-secondary-visible">Transferir artwork dos álbuns</p>
                  </div>
                  <Switch 
                    checked={replicationSettings?.includeCovers ?? true}
                    onCheckedChange={(v) => updateReplicationConfig({ includeCovers: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div>
                    <p className="text-label-yellow font-semibold">Compressão</p>
                    <p className="text-xs text-secondary-visible">Comprimir transferências de rede</p>
                  </div>
                  <Switch 
                    checked={replicationSettings?.compressTransfer ?? true}
                    onCheckedChange={(v) => updateReplicationConfig({ compressTransfer: v })}
                  />
                </div>

                <Button onClick={replicateConfigToAll} variant="outline" className="w-full">
                  <Settings aria-hidden="true" className="w-4 h-4 mr-2" />
                  Replicar Configurações para Todas as Instâncias
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Audio Preview Modal */}
      <AudioWaveformPreview
        file={previewFile}
        isOpen={showPreview}
        onClose={handlePreviewClose}
        onConfirm={handlePreviewConfirm}
      />
    </div>
  );
}
