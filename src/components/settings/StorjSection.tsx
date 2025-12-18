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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
import { useStorjClient } from '@/hooks/useStorjClient';
import { useTranslation } from '@/hooks/useTranslation';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

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
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="buckets" disabled={!isConnected}>Buckets</TabsTrigger>
          <TabsTrigger value="files" disabled={!isConnected || !currentBucket}>Arquivos</TabsTrigger>
          <TabsTrigger value="backup" disabled={!isConnected}>Backup</TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection" className="space-y-4">
          <Card className="card-dark-neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold-neon">
                <Satellite className="w-5 h-5 icon-neon-blue" />
                Conexão Storj DCS
              </CardTitle>
              <CardDescription className="text-kiosk-text/85">
                Armazenamento distribuído descentralizado S3-compatível
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label-yellow font-semibold">Status</span>
                {isConnected ? (
                  <Badge className="bg-green-600 text-white font-bold">
                    <Check className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="font-bold">
                    <X className="w-3 h-3 mr-1" />
                    Desconectado
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-label-yellow font-semibold flex items-center gap-2">
                  Access Grant
                  <InfoTooltip content="Token de acesso gerado no Storj DCS Console. Contém permissões para buckets e objetos." />
                </Label>
                <Input
                  type="password"
                  value={accessGrant}
                  onChange={(e) => setAccessGrant(e.target.value)}
                  placeholder="1xY2z3..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-kiosk-text/85">
                  Gere em: Storj Console → Access → Create S3 Credentials
                </p>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isLoading || !accessGrant}
                className="w-full button-control-extreme-3d"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Testar Conexão
              </Button>

              {isConnected && stats && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-500/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-kiosk-text">{stats.buckets_count}</p>
                    <p className="text-xs text-kiosk-text/85">Buckets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-kiosk-text">{stats.total_objects}</p>
                    <p className="text-xs text-kiosk-text/85">Objetos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-kiosk-text">{formatBytes(stats.total_size)}</p>
                    <p className="text-xs text-kiosk-text/85">Armazenado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="card-dark-neon-border">
            <CardHeader>
              <CardTitle className="text-label-yellow text-sm font-bold">
                COMO CONFIGURAR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-kiosk-text/85">
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Acesse <a href="https://storj.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">storj.io</a> e crie uma conta</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Navegue para Access → Create S3 Credentials</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Selecione as permissões: Read, Write, List, Delete</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>Copie o Access Grant gerado e cole acima</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buckets Tab */}
        <TabsContent value="buckets" className="space-y-4">
          <Card className="card-dark-neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-label-yellow text-sm font-bold">
                BUCKETS ({buckets.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBuckets}
                  disabled={isLoading}
                  className="button-control-extreme-3d"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Dialog open={showCreateBucket} onOpenChange={setShowCreateBucket}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="button-control-extreme-3d">
                      <Plus className="w-4 h-4 mr-1" />
                      Novo Bucket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-kiosk-bg border-cyan-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-gold-neon">Criar Novo Bucket</DialogTitle>
                      <DialogDescription className="text-kiosk-text/85">
                        Buckets são containers para seus arquivos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-label-yellow">Nome do Bucket</Label>
                        <Input
                          value={newBucketName}
                          onChange={(e) => setNewBucketName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                          placeholder="meu-bucket"
                        />
                        <p className="text-xs text-kiosk-text/85">
                          Apenas letras minúsculas, números e hífens
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-kiosk-text">Ativar Versionamento</Label>
                        <Switch
                          checked={enableVersioning}
                          onCheckedChange={setEnableVersioning}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowCreateBucket(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateBucket} disabled={!newBucketName || isLoading}>
                        Criar Bucket
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {buckets.length === 0 ? (
                  <div className="text-center py-8 text-kiosk-text/85">
                    <HardDrive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum bucket encontrado</p>
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
                                Criado: {new Date(bucket.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {bucket.versioning_enabled && (
                              <Badge variant="outline" className="text-xs">
                                <History className="w-3 h-3 mr-1" />
                                Versioning
                              </Badge>
                            )}
                            {bucket.object_lock_enabled && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                Lock
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBucket(bucket.name);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card className="card-dark-neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-label-yellow text-sm font-bold flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 icon-neon-blue" />
                  {currentBucket}
                </CardTitle>
                {currentPath && (
                  <div className="flex items-center gap-1 text-xs text-kiosk-text/85 mt-1">
                    <span className="cursor-pointer hover:text-cyan-400" onClick={() => setCurrentPath('')}>
                      root
                    </span>
                    {currentPath.split('/').map((part, i) => (
                      <span key={i} className="flex items-center">
                        <ChevronRight className="w-3 h-3" />
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
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {uploadProgress && (
                <div className="mb-4 p-3 rounded-lg bg-kiosk-surface/50 border border-cyan-500/20">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-kiosk-text">Enviando...</span>
                    <span className="text-cyan-400">{uploadProgress.percentage}%</span>
                  </div>
                  <Progress value={uploadProgress.percentage} className="h-2" />
                </div>
              )}

              <ScrollArea className="h-[350px]">
                {objects.length === 0 ? (
                  <div className="text-center py-8 text-kiosk-text/85">
                    <FileIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum arquivo encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-cyan-500/20">
                        <TableHead className="text-label-yellow">Nome</TableHead>
                        <TableHead className="text-label-yellow">Tamanho</TableHead>
                        <TableHead className="text-label-yellow">Modificado</TableHead>
                        <TableHead className="text-label-yellow text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {objects.map((obj) => (
                        <TableRow key={obj.key} className="border-cyan-500/10">
                          <TableCell className="font-medium text-kiosk-text">
                            <div className="flex items-center gap-2">
                              <FileIcon className="w-4 h-4 text-cyan-500" />
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
                                size="icon"
                                onClick={() => currentBucket && downloadFile(currentBucket, obj.key)}
                              >
                                <Download className="w-4 h-4 text-cyan-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => currentBucket && deleteFile(currentBucket, obj.key)}
                              >
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <Card className="card-dark-neon-border">
            <CardHeader>
              <CardTitle className="text-label-yellow text-sm font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 icon-neon-blue" />
                BACKUP DO BANCO DE DADOS
              </CardTitle>
              <CardDescription className="text-kiosk-text/85">
                Faça backup do SQLite para o Storj
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Upload className="w-4 h-4 mr-2" />
                Criar Backup Agora
              </Button>

              <div className="p-4 rounded-lg bg-kiosk-surface/30 border border-cyan-500/20">
                <p className="text-sm text-kiosk-text/85">
                  O backup inclui: banco SQLite, configurações do sistema, e metadados.
                  Backups são armazenados com versionamento automático quando disponível.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
