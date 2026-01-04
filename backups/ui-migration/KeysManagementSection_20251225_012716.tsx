import { useState, useEffect } from 'react';
import { Key, Shield, FileKey, FolderKey, Save, CheckCircle2, AlertTriangle, RefreshCw, Github, Loader2, KeyRound, Plus, Trash2 } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CreateDeployKeyModal } from './CreateDeployKeyModal';

interface KeysConfig {
  sshKeyPath: string;
  sshKeyPubPath: string;
  gpgKeyId: string;
  gpgKeyPath: string;
  useSSHAgent: boolean;
}

interface GitHubKey {
  id: number;
  key: string;
  title: string;
  created_at: string;
  read_only?: boolean;
  verified?: boolean;
}

interface GitHubGPGKey {
  id: number;
  key_id: string;
  name: string;
  emails: { email: string; verified: boolean }[];
  created_at: string;
  expires_at: string | null;
}

const defaultConfig: KeysConfig = {
  sshKeyPath: '~/.keys/ssh/id_ed25519',
  sshKeyPubPath: '~/.keys/ssh/id_ed25519.pub',
  gpgKeyId: '',
  gpgKeyPath: '~/.keys/gpg/',
  useSSHAgent: true,
};

const STORAGE_KEY = 'tsi_jukebox_keys_config';

export function KeysManagementSection() {
  const [config, setConfig] = useState<KeysConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // GitHub keys state
  const [deployKeys, setDeployKeys] = useState<GitHubKey[]>([]);
  const [sshKeys, setSshKeys] = useState<GitHubKey[]>([]);
  const [gpgKeys, setGpgKeys] = useState<GitHubGPGKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<number | null>(null);

  const updateConfig = (key: keyof KeysConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success('Configuração de chaves salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchGitHubKeys = async () => {
    setIsLoadingKeys(true);
    setKeysError(null);
    
    try {
      // Fetch deploy keys
      const deployKeysResponse = await supabase.functions.invoke('github-repo', {
        body: { action: 'deploy-keys' }
      });
      
      if (deployKeysResponse.data?.success) {
        setDeployKeys(deployKeysResponse.data.data || []);
      }

      // Fetch user SSH keys
      const sshKeysResponse = await supabase.functions.invoke('github-repo', {
        body: { action: 'ssh-keys' }
      });
      
      if (sshKeysResponse.data?.success) {
        setSshKeys(sshKeysResponse.data.data || []);
      }

      // Fetch GPG keys
      const gpgKeysResponse = await supabase.functions.invoke('github-repo', {
        body: { action: 'gpg-keys' }
      });
      
      if (gpgKeysResponse.data?.success) {
        setGpgKeys(gpgKeysResponse.data.data || []);
      }

      toast.success('Chaves do GitHub carregadas');
    } catch (error) {
      console.error('Error fetching GitHub keys:', error);
      setKeysError('Erro ao carregar chaves do GitHub');
      toast.error('Erro ao carregar chaves do GitHub');
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleDeleteDeployKey = async (keyId: number) => {
    setDeletingKeyId(keyId);
    try {
      const response = await supabase.functions.invoke('github-repo', {
        body: { action: 'delete-deploy-key', keyId }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to delete');
      }

      setDeployKeys(prev => prev.filter(k => k.id !== keyId));
      toast.success('Deploy key removida!');
    } catch (error) {
      toast.error('Erro ao remover deploy key');
    } finally {
      setDeletingKeyId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateKey = (key: string) => {
    if (key.length <= 50) return key;
    return `${key.substring(0, 25)}...${key.substring(key.length - 20)}`;
  };

  const instructions = {
    title: "🔐 O que são Chaves SSH e GPG?",
    steps: [
      "Imagine que sua casa tem uma fechadura especial que só abre com uma chave única - as chaves SSH funcionam assim!",
      "Elas permitem que seu Jukebox 'entre' em outros computadores de forma segura, sem precisar digitar senha.",
      "A CHAVE PRIVADA (ex: id_ed25519) é como a chave da sua casa - NUNCA mostre para ninguém!",
      "A CHAVE PÚBLICA (.pub) é como o endereço da sua casa - pode ser compartilhada com quem você confia.",
      "O GPG serve para 'assinar' seus backups digitalmente, garantindo que ninguém alterou seus arquivos."
    ],
    tips: [
      "💡 Se não tem chaves, abra o terminal e digite: ssh-keygen -t ed25519",
      "💡 O tipo ed25519 é mais seguro e rápido que o antigo RSA",
      "💡 O SSH Agent guarda sua senha na memória temporariamente"
    ],
    warning: "⚠️ NUNCA compartilhe sua chave PRIVADA! Perder ela significa perder acesso aos servidores. Faça backup em local seguro!"
  };

  return (
    <SettingsSection
      icon={<Key className="w-5 h-5 icon-neon-blue" />}
      title="Chaves de Segurança"
      description="Configure suas chaves SSH e GPG"
      instructions={instructions}
      delay={0.25}
    >
      <div className="space-y-6" data-tour="keys-management">
        {/* GitHub Keys Section */}
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border hover:bg-kiosk-background/70 transition-colors">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-kiosk-primary" />
              <span className="font-medium text-label-yellow">Chaves do GitHub</span>
            </div>
            <div className="flex items-center gap-2">
              {(deployKeys.length > 0 || sshKeys.length > 0 || gpgKeys.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  {deployKeys.length + sshKeys.length + gpgKeys.length} chaves
                </Badge>
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={fetchGitHubKeys} 
                disabled={isLoadingKeys}
                variant="outline"
                className="flex-1"
              >
                {isLoadingKeys ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isLoadingKeys ? 'Carregando...' : 'Carregar Chaves'}
              </Button>
              <Button onClick={() => setShowCreateModal(true)} variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Deploy Key
              </Button>
            </div>

            {keysError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {keysError}
              </div>
            )}

            {/* Deploy Keys */}
            {deployKeys.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-label-yellow">
                  <KeyRound className="w-4 h-4" />
                  Deploy Keys ({deployKeys.length})
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {deployKeys.map(key => (
                      <div key={key.id} className="p-2 rounded bg-kiosk-background/30 border border-kiosk-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{key.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={key.read_only ? 'secondary' : 'default'} className="text-xs">
                              {key.read_only ? 'Read-only' : 'Read/Write'}
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                  {deletingKeyId === key.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Deploy Key?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. A chave "{key.title}" será removida do repositório.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteDeployKey(key.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {truncateKey(key.key)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criada em: {formatDate(key.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* SSH Keys */}
            {sshKeys.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-label-yellow">
                  <FileKey className="w-4 h-4" />
                  SSH Keys ({sshKeys.length})
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {sshKeys.map(key => (
                      <div key={key.id} className="p-2 rounded bg-kiosk-background/30 border border-kiosk-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{key.title}</span>
                          {key.verified && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verificada
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {truncateKey(key.key)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criada em: {formatDate(key.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* GPG Keys */}
            {gpgKeys.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-label-yellow">
                  <Shield className="w-4 h-4" />
                  GPG Keys ({gpgKeys.length})
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {gpgKeys.map(key => (
                      <div key={key.id} className="p-2 rounded bg-kiosk-background/30 border border-kiosk-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{key.name || key.key_id}</span>
                          {key.expires_at && (
                            <Badge variant="outline" className="text-xs">
                              Expira: {formatDate(key.expires_at)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          ID: {key.key_id}
                        </p>
                        {key.emails?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {key.emails.slice(0, 2).map(email => (
                              <Badge key={email.email} variant="secondary" className="text-xs">
                                {email.email}
                                {email.verified && <CheckCircle2 className="w-2.5 h-2.5 ml-1" />}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Criada em: {formatDate(key.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {!isLoadingKeys && deployKeys.length === 0 && sshKeys.length === 0 && gpgKeys.length === 0 && !keysError && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Clique em "Carregar Chaves" para visualizar as chaves configuradas no GitHub
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* SSH Keys Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-label-yellow">
            <FileKey className="w-4 h-4" />
            <span className="font-medium">Chaves SSH Locais</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ssh-key-path" className="text-label-yellow font-semibold">
                Caminho da Chave Privada
              </Label>
              <Input
                id="ssh-key-path"
                value={config.sshKeyPath}
                onChange={(e) => updateConfig('sshKeyPath', e.target.value)}
                placeholder="~/.keys/ssh/id_ed25519"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
              <p className="text-xs text-settings-hint">
                Esta é sua chave SECRETA - mantenha segura!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssh-pub-path" className="text-label-yellow font-semibold">
                Caminho da Chave Pública
              </Label>
              <Input
                id="ssh-pub-path"
                value={config.sshKeyPubPath}
                onChange={(e) => updateConfig('sshKeyPubPath', e.target.value)}
                placeholder="~/.keys/ssh/id_ed25519.pub"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
              <p className="text-xs text-settings-hint">
                Esta pode ser compartilhada com servidores
              </p>
            </div>

            <div className="card-option-dark-3d rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 icon-neon-blue" />
                  <div>
                    <Label className="text-label-yellow font-medium">Usar SSH Agent</Label>
                    <p className="text-xs text-settings-hint mt-0.5">
                      Guarda a senha na memória (recomendado)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.useSSHAgent}
                  onCheckedChange={(checked) => updateConfig('useSSHAgent', checked)}
                  variant="neon"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Folder Structure Example */}
        <div className="card-option-dark-3d rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-label-orange">
            <FolderKey className="w-4 h-4" />
            <span className="text-sm font-medium">Exemplo de Estrutura de Pastas</span>
          </div>
          <pre className="text-xs font-mono text-neon-white bg-kiosk-bg/50 p-3 rounded overflow-x-auto">
{`~/.keys/
  ├── ssh/
  │   ├── id_ed25519        (chave privada - SECRETA!)
  │   └── id_ed25519.pub    (chave pública)
  └── gpg/
      └── [arquivos GPG]`}
          </pre>
        </div>

        {/* GPG Keys Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-label-yellow">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Chave GPG Local</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="gpg-key-id" className="text-label-yellow font-semibold">
                ID da Chave GPG
              </Label>
              <Input
                id="gpg-key-id"
                value={config.gpgKeyId}
                onChange={(e) => updateConfig('gpgKeyId', e.target.value)}
                placeholder="3AA5C34371567BD2"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
              <p className="text-xs text-settings-hint">
                Identificador único da sua chave GPG
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpg-key-path" className="text-label-yellow font-semibold">
                Diretório das Chaves GPG
              </Label>
              <Input
                id="gpg-key-path"
                value={config.gpgKeyPath}
                onChange={(e) => updateConfig('gpgKeyPath', e.target.value)}
                placeholder="~/.keys/gpg/"
                className="input-3d bg-kiosk-bg font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="instructions-warning">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Importante sobre segurança:</p>
            <ul className="mt-1 space-y-1 text-xs opacity-90">
              <li>• NUNCA compartilhe sua chave PRIVADA (id_ed25519)</li>
              <li>• A chave pública (.pub) pode ser compartilhada</li>
              <li>• Use senhas fortes para proteger suas chaves</li>
              <li>• Faça backup das chaves em local seguro</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full button-primary-glow-3d ripple-effect"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>

      <CreateDeployKeyModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchGitHubKeys}
      />
    </SettingsSection>
  );
}
