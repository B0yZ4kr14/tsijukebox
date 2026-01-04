import { useState, useRef } from 'react';
import { 
  Satellite, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  FolderOpen,
  RefreshCw,
  Check,
  X,
  Lock,
  History,
  HardDrive,
  FileIcon,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStorjClient, useTranslation } from '@/hooks';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Badge, Button, Card, Input, Toggle } from "@/components/ui/themed"

export function StorjSection() {
  const { t } = useTranslation();
  const {
    isConnected,
    isLoading,
    buckets,
    currentBucket,
    objects,
    stats,
    uploadProgress,
    testConnection,
    fetchBuckets,
    createBucket,
    deleteBucket,
    fetchObjects,
    uploadFile,
    downloadFile,
    deleteFile,
    fetchStats,
    createBackup,
  } = useStorjClient();

  const [accessGrant, setAccessGrant] = useState('');
  const [newBucketName, setNewBucketName] = useState('');
  const [enableVersioning, setEnableVersioning] = useState(false);
  const [showCreateBucket, setShowCreateBucket] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = async () => {
    const success = await testConnection(accessGrant);
    if (success) {
      await fetchBuckets();
      await fetchStats();
    }
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) return;
    const success = await createBucket(newBucketName, { versioning: enableVersioning });
    if (success) {
      setNewBucketName('');
      setEnableVersioning(false);
      setShowCreateBucket(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentBucket) return;
    
    const key = currentPath ? `${currentPath}/${file.name}` : file.name;
    await uploadFile(currentBucket, key, file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-kiosk-surface/50">
          <TabsTrigger value="connection">{t('storj.connection')}</TabsTrigger>
          <TabsTrigger value="buckets" disabled={!isConnected}>{t('storj.buckets')}</TabsTrigger>
          <TabsTrigger value="files" disabled={!isConnected || !currentBucket}>{t('storj.files')}</TabsTrigger>
          <TabsTrigger value="backup" disabled={!isConnected}>{t('storj.backup')}</TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection" className="space-y-4">
          <Card className="card-dark-neon-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Satellite className="w-5 h-5 icon-neon-blue" />
                {t('storj.connection')} Storj DCS
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {t('storj.subtitle')}
              </p>
            
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-label-yellow font-semibold">{t('storj.status')}</span>
                {isConnected ? (
                  <Badge className="bg-green-600 text-white font-bold">
                    <Check aria-hidden="true" className="w-3 h-3 mr-1" />
                    {t('storj.connected')}
                  </Badge>
                ) : (
                  <Badge variant="danger" className="font-bold">
                    <X aria-hidden="true" className="w-3 h-3 mr-1" />
                    {t('storj.disconnected')}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-label-yellow font-semibold flex items-center gap-2">
                  {t('storj.accessGrant')}
                  <InfoTooltip content={t('storj.accessGrantHint')} />
                </Label>
                <Input
                  type="password"
                  value={accessGrant}
                  onChange={(e) => setAccessGrant(e.target.value)}
                  placeholder="1xY2z3..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-kiosk-text/85">
                  {t('storj.accessGrantPlaceholder')}
                </p>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isLoading || !accessGrant}
                className="w-full button-control-extreme-3d"
              >
                {isLoading ? (
                  <RefreshCw aria-hidden="true" className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check aria-hidden="true" className="w-4 h-4 mr-2" />
                )}
                {t('storj.testConnection')}
              </Button>

              {isConnected && stats && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-500/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-kiosk-text">{stats.buckets_count}</p>
                    <p className="text-xs text-kiosk-text/85">{t('storj.buckets')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-kiosk-text">{stats.total_objects}</p>
                    <p className="text-xs text-kiosk-text/85">{t('storj.objects')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-kiosk-text">{formatBytes(stats.total_size)}</p>
                    <p className="text-xs text-kiosk-text/85">{t('storj.stored')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Help Card */}
          <Card className="card-dark-neon-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('storj.howToConfigure')}
              </h3>
            
            <div className="mt-4">
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>{t('storj.step1')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>{t('storj.step2')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>{t('storj.step3')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>{t('storj.step4')}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Buckets Tab */}
        <TabsContent value="buckets" className="space-y-4">
          <Card className="card-dark-neon-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {t('storj.buckets').toUpperCase()} ({buckets.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBuckets}
                  disabled={isLoading}
                  className="button-control-extreme-3d"
                >
                  <RefreshCw aria-hidden="true" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Dialog open={showCreateBucket} onOpenChange={setShowCreateBucket}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="button-control-extreme-3d">
                      <Plus aria-hidden="true" className="w-4 h-4 mr-1" />
                      {t('storj.newBucket')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-kiosk-bg border-cyan-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-gold-neon">{t('storj.createBucket')}</DialogTitle>
                      <DialogDescription className="text-kiosk-text/85">
                        {t('storj.bucketDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-label-yellow">{t('storj.bucketName')}</Label>
                        <Input
                          value={newBucketName}
                          onChange={(e) => setNewBucketName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                          placeholder="meu-bucket"
                        />
                        <p className="text-xs text-kiosk-text/85">
                          {t('storj.bucketNameHint')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-kiosk-text">{t('storj.enableVersioning')}</Label>
                        <Switch
                          checked={enableVersioning}
                          onCheckedChange={setEnableVersioning}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowCreateBucket(false)}>
                        {t('storj.cancel')}
                      </Button>
                      <Button onClick={handleCreateBucket} disabled={!newBucketName || isLoading}>
                        {t('storj.createBucketButton')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            
            <div className="mt-4">
              <ScrollArea className="h-[300px]">
                {buckets.length === 0 ? (
                  <div className="text-center py-8 text-kiosk-text/85">
                    <HardDrive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('storj.noBuckets')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {buckets.map((bucket) => (
                      <div
                        key={bucket.name}
                        className={`p-3 rounded-lg bg-kiosk-surface/50 border cursor-pointer transition-all hover:border-cyan-500/50 ${
                          currentBucket === bucket.name ? 'border-cyan-500' : 'border-cyan-500/20'
                        }`}
                        onClick={() => fetchObjects(bucket.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-5 h-5 icon-neon-blue" />
                            <div>
                              <p className="font-bold text-kiosk-text">{bucket.name}</p>
                              <p className="text-xs text-kiosk-text/85">
                                {t('storj.created')}: {new Date(bucket.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {bucket.versioning_enabled && (
                              <Badge variant="outline" className="text-xs">
                                <History className="w-3 h-3 mr-1" />
                                {t('storj.versioning')}
                              </Badge>
                            )}
                            {bucket.object_lock_enabled && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                {t('storj.lock')}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBucket(bucket.name);
                              }}
                              className="text-red-400 hover:text-red-300" aria-label="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card className="card-dark-neon-border">
            <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  <FolderOpen className="w-4 h-4 icon-neon-blue" />
                  {currentBucket}
                </h3>
                {currentPath && (
                  <div className="flex items-center gap-1 text-xs text-kiosk-text/85 mt-1">
                    <span className="cursor-pointer hover:text-cyan-400" onClick={() => setCurrentPath('')}>
                      root
                    </span>
                    {currentPath.split('/').map((part, i) => (
                      <span key={i} className="flex items-center">
                        <ChevronRight aria-hidden="true" className="w-3 h-3" />
                        <span className="cursor-pointer hover:text-cyan-400">{part}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="button-control-extreme-3d"
                >
                  <Upload aria-hidden="true" className="w-4 h-4 mr-1" />
                  {t('storj.upload')}
                </Button>
              </div>
            
            <div className="mt-4">
              {uploadProgress && (
                <div className="mb-4 p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-kiosk-text">{t('storj.sending')}</span>
                    <span className="text-cyan-400">{uploadProgress.percentage}%</span>
                  </div>
                  <Progress value={uploadProgress.percentage} className="h-2" />
                </div>
              )}

              <ScrollArea className="h-[350px]">
                {objects.length === 0 ? (
                  <div className="text-center py-8 text-kiosk-text/85">
                    <FileIcon aria-hidden="true" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('storj.noFiles')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-cyan-500/20">
                        <TableHead className="text-label-yellow">{t('storj.name')}</TableHead>
                        <TableHead className="text-label-yellow">{t('storj.size')}</TableHead>
                        <TableHead className="text-label-yellow">{t('storj.modified')}</TableHead>
                        <TableHead className="text-label-yellow text-right">{t('storj.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {objects.map((obj) => (
                        <TableRow key={obj.key} className="border-cyan-500/10">
                          <TableCell className="font-medium text-kiosk-text">
                            <div className="flex items-center gap-2">
                              <FileIcon aria-hidden="true" className="w-4 h-4 text-cyan-500" />
                              {obj.key.split('/').pop()}
                            </div>
                          </TableCell>
                          <TableCell className="text-kiosk-text/85">
                            {formatBytes(obj.size)}
                          </TableCell>
                          <TableCell className="text-kiosk-text/85">
                            {new Date(obj.last_modified).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => currentBucket && downloadFile(currentBucket, obj.key)} aria-label="Baixar">
                                <Download aria-hidden="true" className="w-4 h-4 text-cyan-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => currentBucket && deleteFile(currentBucket, obj.key)} aria-label="Excluir">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <Card className="card-dark-neon-border">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <RotateCcw className="w-4 h-4 icon-neon-blue" />
                BACKUP DO BANCO DE DADOS
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Faça backup do SQLite para o Storj
              </p>
            
            <div className="mt-4">
              <div className="space-y-2">
                <Label className="text-label-yellow">Bucket de Destino</Label>
                <select
                  className="w-full p-2 rounded-lg bg-kiosk-surface/70 border border-cyan-500/30 text-kiosk-text"
                  value={currentBucket || ''}
                  onChange={(e) => fetchObjects(e.target.value)}
                >
                  <option value="">Selecione um bucket</option>
                  {buckets.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => currentBucket && createBackup(currentBucket)}
                disabled={isLoading || !currentBucket}
                className="w-full button-control-extreme-3d"
              >
                <Upload aria-hidden="true" className="w-4 h-4 mr-2" />
                Criar Backup Agora
              </Button>

              <div className="p-4 rounded-lg bg-kiosk-surface/30 border border-cyan-500/20">
                <p className="text-sm text-kiosk-text/85">
                  O backup inclui: banco SQLite, configurações do sistema, e metadados.
                  Backups são armazenados com versionamento automático quando disponível.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
