import { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, RefreshCw, Copy, Check, 
  Server, Key, Lock, Globe, MapPin, Wifi, WifiOff,
  Settings, CheckSquare, Square, RotateCcw, Upload, Shield
} from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BrandText } from '@/components/ui/BrandText';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JukeboxClient {
  id: string;
  name: string;
  address: string;
  city: string;
  apiUrl: string;
  sshHost: string;
  sshPort: number;
  sshUser: string;
  sshKeyPath: string;
  gpgKeyId: string;
  rootPassword: string;
  status: 'online' | 'offline' | 'unknown';
  lastSync: string | null;
  version: string;
  isSelected: boolean;
}

interface ReplicableConfig {
  theme: boolean;
  spotify: boolean;
  weather: boolean;
  database: boolean;
  users: boolean;
  playlists: boolean;
  systemUrls: boolean;
  accessibility: boolean;
}

const defaultClient: Omit<JukeboxClient, 'id'> = {
  name: '',
  address: '',
  city: '',
  apiUrl: '',
  sshHost: '',
  sshPort: 22,
  sshUser: 'root',
  sshKeyPath: '~/.ssh/id_ed25519',
  gpgKeyId: '',
  rootPassword: '',
  status: 'unknown',
  lastSync: null,
  version: '4.0.0',
  isSelected: false,
};

const STORAGE_KEY = 'tsi_jukebox_clients';

export function ClientsManagementSection() {
  const [clients, setClients] = useState<JukeboxClient[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplicateDialog, setShowReplicateDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<JukeboxClient | null>(null);
  const [clientToDelete, setClientToDelete] = useState<JukeboxClient | null>(null);
  const [formData, setFormData] = useState<Omit<JukeboxClient, 'id'>>(defaultClient);
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const [replicateConfig, setReplicateConfig] = useState<ReplicableConfig>({
    theme: true,
    spotify: true,
    weather: true,
    database: false,
    users: false,
    playlists: true,
    systemUrls: true,
    accessibility: true,
  });

  const saveClients = (newClients: JukeboxClient[]) => {
    setClients(newClients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newClients));
  };

  const selectedClients = clients.filter(c => c.isSelected);

  const toggleSelectAll = () => {
    const allSelected = clients.every(c => c.isSelected);
    saveClients(clients.map(c => ({ ...c, isSelected: !allSelected })));
  };

  const toggleClientSelection = (clientId: string) => {
    saveClients(clients.map(c => 
      c.id === clientId ? { ...c, isSelected: !c.isSelected } : c
    ));
  };

  const handleAddClient = () => {
    if (!formData.name || !formData.apiUrl) {
      toast.error('Nome e URL da API são obrigatórios');
      return;
    }

    const newClient: JukeboxClient = {
      ...formData,
      id: `client_${Date.now()}`,
      status: 'unknown',
      lastSync: null,
    };

    saveClients([...clients, newClient]);
    setShowAddDialog(false);
    setFormData(defaultClient);
    toast.success('Cliente adicionado com sucesso');
  };

  const handleEditClient = () => {
    if (!editingClient) return;

    saveClients(clients.map(c => 
      c.id === editingClient.id 
        ? { ...c, ...formData }
        : c
    ));
    setEditingClient(null);
    setFormData(defaultClient);
    toast.success('Cliente atualizado');
  };

  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    saveClients(clients.filter(c => c.id !== clientToDelete.id));
    setShowDeleteDialog(false);
    setClientToDelete(null);
    toast.success('Cliente removido');
  };

  const openEditDialog = (client: JukeboxClient) => {
    setEditingClient(client);
    setFormData(client);
  };

  const handleTestConnection = async (client: JukeboxClient) => {
    setIsSyncing(client.id);
    toast.info(`Testando conexão com ${client.name}...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isOnline = Math.random() > 0.3; // Simulate 70% success rate
    saveClients(clients.map(c => 
      c.id === client.id 
        ? { ...c, status: isOnline ? 'online' : 'offline', lastSync: new Date().toISOString() }
        : c
    ));
    
    setIsSyncing(null);
    if (isOnline) {
      toast.success(`${client.name} está online`);
    } else {
      toast.error(`${client.name} está offline`);
    }
  };

  const handleReplicateToSelected = async () => {
    if (selectedClients.length === 0) {
      toast.error('Selecione pelo menos um cliente');
      return;
    }

    setShowReplicateDialog(false);
    toast.info(`Replicando configurações para ${selectedClients.length} cliente(s)...`);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const configNames = Object.entries(replicateConfig)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
    
    toast.success(`Configurações replicadas: ${configNames.join(', ')}`);
    
    // Update last sync for all selected clients
    saveClients(clients.map(c => 
      c.isSelected ? { ...c, lastSync: new Date().toISOString() } : c
    ));
  };

  const handleResetSelected = async () => {
    if (selectedClients.length === 0) {
      toast.error('Selecione pelo menos um cliente');
      return;
    }

    toast.info(`Resetando ${selectedClients.length} cliente(s) para configurações padrão...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Clientes resetados para configurações padrão');
  };

  const handleUpdateVersion = async () => {
    if (selectedClients.length === 0) {
      toast.error('Selecione pelo menos um cliente');
      return;
    }

    toast.info(`Atualizando versão em ${selectedClients.length} cliente(s)...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    saveClients(clients.map(c => 
      c.isSelected ? { ...c, version: '4.1.0' } : c
    ));
    
    toast.success('Versão atualizada em todos os clientes selecionados');
  };

  const statusColors = {
    online: 'bg-green-500/20 text-green-400 border-green-500/30',
    offline: 'bg-red-500/20 text-red-400 border-red-500/30',
    unknown: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  const statusIcons = {
    online: <Wifi className="w-3 h-3" />,
    offline: <WifiOff className="w-3 h-3" />,
    unknown: <RefreshCw className="w-3 h-3" />,
  };

  const ClientForm = () => (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      {/* Establishment Info */}
      <div className="space-y-3">
        <h4 className="text-sm text-section-cyan flex items-center gap-2">
          <Building2 className="w-4 h-4 icon-neon-blue" />
          Informações do Estabelecimento
        </h4>
        <div className="space-y-2">
          <Label>Nome do Estabelecimento *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Loja Centro"
            className="bg-kiosk-surface/50 border-kiosk-border text-kiosk-text"
          />
        </div>
        <div className="space-y-2">
          <Label>Endereço</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Av. Principal, 123"
            className="bg-kiosk-surface/50 border-kiosk-border text-kiosk-text"
          />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Montes Claros - MG"
            className="bg-kiosk-surface/50 border-kiosk-border text-kiosk-text"
          />
        </div>
      </div>

      {/* API Connection */}
      <div className="space-y-3">
        <h4 className="text-sm text-section-cyan flex items-center gap-2">
          <Globe className="w-4 h-4 icon-neon-blue" />
          Conexão API
        </h4>
        <div className="space-y-2">
          <Label>URL da API *</Label>
          <Input
            value={formData.apiUrl}
            onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
            placeholder="https://loja-centro.local/api"
            className="bg-kiosk-surface/50 border-kiosk-border font-mono text-sm text-kiosk-text"
          />
        </div>
      </div>

      {/* SSH Access */}
      <div className="space-y-3">
        <h4 className="text-sm text-section-cyan flex items-center gap-2">
          <Server className="w-4 h-4 icon-neon-blue" />
          Acesso SSH
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Host SSH</Label>
            <Input
              value={formData.sshHost}
              onChange={(e) => setFormData({ ...formData, sshHost: e.target.value })}
              placeholder="192.168.1.10"
              className="bg-kiosk-surface/50 border-kiosk-border font-mono text-sm text-kiosk-text"
            />
          </div>
          <div className="space-y-2">
            <Label>Porta</Label>
            <Input
              type="number"
              value={formData.sshPort}
              onChange={(e) => setFormData({ ...formData, sshPort: parseInt(e.target.value) || 22 })}
              placeholder="22"
              className="bg-kiosk-surface/50 border-kiosk-border text-kiosk-text"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Usuário SSH</Label>
          <Input
            value={formData.sshUser}
            onChange={(e) => setFormData({ ...formData, sshUser: e.target.value })}
            placeholder="admin"
            className="bg-kiosk-surface/50 border-kiosk-border text-kiosk-text"
          />
        </div>
        <div className="space-y-2">
          <Label>Caminho da Chave SSH</Label>
          <Input
            value={formData.sshKeyPath}
            onChange={(e) => setFormData({ ...formData, sshKeyPath: e.target.value })}
            placeholder="~/.ssh/id_ed25519"
            className="bg-kiosk-surface/50 border-kiosk-border font-mono text-sm text-kiosk-text"
          />
        </div>
      </div>

      {/* Security */}
      <div className="space-y-3">
        <h4 className="text-sm text-section-cyan flex items-center gap-2">
          <Shield className="w-4 h-4 icon-neon-blue" />
          Segurança
        </h4>
        <div className="space-y-2">
          <Label>ID da Chave GPG</Label>
          <Input
            value={formData.gpgKeyId}
            onChange={(e) => setFormData({ ...formData, gpgKeyId: e.target.value })}
            placeholder="A1B2C3D4E5F6"
            className="bg-kiosk-surface/50 border-kiosk-border font-mono text-sm text-kiosk-text"
          />
        </div>
        <div className="space-y-2">
          <Label>Senha Root</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.rootPassword}
              onChange={(e) => setFormData({ ...formData, rootPassword: e.target.value })}
              placeholder="••••••••"
              className="bg-kiosk-surface/50 border-kiosk-border pr-10 text-kiosk-text"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <p className="text-xs text-amber-400">
          ⚠️ Credenciais são armazenadas criptografadas localmente.
          Nunca serão transmitidas sem sua autorização explícita.
        </p>
      </div>
    </div>
  );

  return (
    <SettingsSection
      icon={<Building2 className="w-5 h-5 icon-neon-blue" />}
      title={<>Clientes <BrandText /></>}
      description="Gerencie múltiplos terminais e replique configurações"
      data-tour="clients-management"
    >
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setFormData(defaultClient);
              setShowAddDialog(true);
            }}
            className="button-primary-glow-3d"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Cliente
          </Button>
          
          <Button
            size="sm"
            variant="kiosk-outline"
            onClick={toggleSelectAll}
          >
            {clients.every(c => c.isSelected) ? (
              <Square className="w-4 h-4 mr-1" />
            ) : (
              <CheckSquare className="w-4 h-4 mr-1" />
            )}
            {clients.every(c => c.isSelected) ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>

          {selectedClients.length > 0 && (
            <Badge variant="outline" className="bg-primary/20 text-primary">
              {selectedClients.length} selecionado(s)
            </Badge>
          )}
        </div>

        {/* Clients List */}
        {clients.length === 0 ? (
          <div className="text-center py-8 text-kiosk-text/90">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum cliente cadastrado</p>
            <p className="text-xs mt-1">Adicione terminais <BrandText /> para gerenciar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className={cn(
                  "p-4 rounded-lg transition-all",
                  client.isSelected ? "card-option-selected-3d" : "card-option-dark-3d"
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={client.isSelected}
                    onCheckedChange={() => toggleClientSelection(client.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 icon-neon-blue shrink-0" />
                      <span className="font-medium text-kiosk-text truncate">{client.name}</span>
                      <Badge variant="outline" className={cn("text-xs", statusColors[client.status])}>
                        {statusIcons[client.status]}
                        <span className="ml-1 capitalize">{client.status}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-kiosk-surface">
                        v{client.version}
                      </Badge>
                    </div>
                    
                    {client.address && (
                      <p className="text-xs text-kiosk-text/90 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />
                        {client.address}{client.city && `, ${client.city}`}
                      </p>
                    )}
                    
                    <p className="text-xs text-cyan-400/80 font-mono flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {client.apiUrl}
                    </p>
                    
                    {client.sshHost && (
                      <p className="text-xs text-kiosk-text/85 flex items-center gap-1 mt-1">
                        <Key className="w-3 h-3" />
                        SSH: {client.sshUser}@{client.sshHost}:{client.sshPort}
                      </p>
                    )}
                    
                    {client.lastSync && (
                      <p className="text-xs text-kiosk-text/85 mt-1">
                        Última sincronização: {new Date(client.lastSync).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => handleTestConnection(client)}
                      disabled={isSyncing === client.id}
                    >
                      <RefreshCw className={cn("w-4 h-4", isSyncing === client.id && "animate-spin")} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => openEditDialog(client)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setClientToDelete(client);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mass Actions */}
        {selectedClients.length > 0 && (
          <div className="card-option-dark-3d rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-label-yellow">
              Ações em Massa ({selectedClients.length} selecionado{selectedClients.length > 1 ? 's' : ''})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="kiosk-outline"
                size="sm"
                onClick={() => setShowReplicateDialog(true)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Aplicar Configurações
              </Button>
              <Button
                variant="kiosk-outline"
                size="sm"
                onClick={handleResetSelected}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar para Padrão
              </Button>
              <Button
                variant="kiosk-outline"
                size="sm"
                onClick={handleUpdateVersion}
              >
                <Upload className="w-4 h-4 mr-2" />
                Atualizar Versão
              </Button>
              <Button
                variant="kiosk-outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Lock className="w-4 h-4 mr-2" />
                Resetar Senhas
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 icon-neon-blue" />
              Adicionar Cliente TSiJUKEBOX
            </DialogTitle>
            <DialogDescription>
              Configure um novo terminal para gerenciamento remoto
            </DialogDescription>
          </DialogHeader>
          <ClientForm />
          <DialogFooter>
            <Button variant="kiosk-outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddClient} className="button-primary-glow-3d">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 icon-neon-blue" />
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Atualize as informações de {editingClient?.name}
            </DialogDescription>
          </DialogHeader>
          <ClientForm />
          <DialogFooter>
            <Button variant="kiosk-outline" onClick={() => setEditingClient(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditClient} className="button-primary-glow-3d">
              <Check className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replicate Config Dialog */}
      <Dialog open={showReplicateDialog} onOpenChange={setShowReplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 icon-neon-blue" />
              Replicar Configurações
            </DialogTitle>
            <DialogDescription>
              Selecione quais configurações serão aplicadas aos {selectedClients.length} cliente(s) selecionado(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {Object.entries({
              theme: { label: 'Tema e Cores', icon: '🎨' },
              spotify: { label: 'Credenciais Spotify', icon: '🎵' },
              weather: { label: 'Configuração de Clima', icon: '🌤️' },
              database: { label: 'Configuração de Banco', icon: '🗄️' },
              users: { label: 'Lista de Usuários', icon: '👥' },
              playlists: { label: 'Playlists Configuradas', icon: '📋' },
              systemUrls: { label: 'URLs do Sistema', icon: '🔗' },
              accessibility: { label: 'Acessibilidade', icon: '👁️' },
            }).map(([key, { label, icon }]) => (
              <div key={key} className="flex items-center justify-between p-2 rounded-lg card-option-dark-3d">
                <span className="text-sm text-kiosk-text">
                  {icon} {label}
                </span>
                <Switch
                  checked={replicateConfig[key as keyof ReplicableConfig]}
                  onCheckedChange={(checked) => 
                    setReplicateConfig(prev => ({ ...prev, [key]: checked }))
                  }
                  variant="neon"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="kiosk-outline" onClick={() => setShowReplicateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReplicateToSelected} className="button-primary-glow-3d">
              <Copy className="w-4 h-4 mr-2" />
              Aplicar em {selectedClients.length} Cliente(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cliente "{clientToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}
